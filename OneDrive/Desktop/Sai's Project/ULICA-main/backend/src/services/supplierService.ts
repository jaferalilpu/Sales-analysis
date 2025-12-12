// @ts-nocheck
import { PrismaClient, Prisma } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export interface CreateSupplierData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  notes?: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  paymentTerms?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateProductSupplierData {
  productId: string;
  supplierId: string;
  supplierSku?: string;
  costPrice?: number;
  minOrderQty?: number;
  leadTime?: number;
  isPrimary?: boolean;
}

/**
 * Create a new supplier
 */
export async function createSupplier(data: CreateSupplierData) {
  const supplier = await prisma.supplier.create({
    data: {
      ...data,
      country: data.country || 'India'
    }
  });

  return supplier;
}

/**
 * Get all suppliers with pagination and filters
 */
export async function getSuppliers(
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    isActive?: boolean;
  } = {}
) {
  const skip = (page - 1) * limit;
  const where: Prisma.SupplierWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { contactPerson: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [suppliers, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true
              }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.supplier.count({ where })
  ]);

  return {
    suppliers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get supplier by ID
 */
export async function getSupplier(supplierId: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              status: true
            }
          }
        }
      },
      stockTransfers: {
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      title: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!supplier) {
    throw new CustomError('Supplier not found', 404);
  }

  return supplier;
}

/**
 * Update supplier
 */
export async function updateSupplier(supplierId: string, data: UpdateSupplierData) {
  const supplier = await prisma.supplier.update({
    where: { id: supplierId },
    data,
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true
            }
          }
        }
      }
    }
  });

  return supplier;
}

/**
 * Delete supplier
 */
export async function deleteSupplier(supplierId: string) {
  // Check if supplier has products
  const productCount = await prisma.productSupplier.count({
    where: { supplierId }
  });

  if (productCount > 0) {
    throw new CustomError('Cannot delete supplier with associated products', 400);
  }

  await prisma.supplier.delete({
    where: { id: supplierId }
  });

  return { success: true };
}

/**
 * Add product to supplier
 */
export async function addProductToSupplier(data: CreateProductSupplierData) {
  // Check if product-supplier relationship already exists
  const existing = await prisma.productSupplier.findUnique({
    where: {
      productId_supplierId: {
        productId: data.productId,
        supplierId: data.supplierId
      }
    }
  });

  if (existing) {
    throw new CustomError('Product is already associated with this supplier', 400);
  }

  // If this is set as primary, unset other primary suppliers for this product
  if (data.isPrimary) {
    await prisma.productSupplier.updateMany({
      where: {
        productId: data.productId,
        isPrimary: true
      },
      data: { isPrimary: false }
    });
  }

  const productSupplier = await prisma.productSupplier.create({
    data,
    include: {
      product: {
        select: {
          id: true,
          title: true,
          sku: true
        }
      },
      supplier: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return productSupplier;
}

/**
 * Update product-supplier relationship
 */
export async function updateProductSupplier(
  productId: string,
  supplierId: string,
  data: Partial<CreateProductSupplierData>
) {
  // If setting as primary, unset other primary suppliers
  if (data.isPrimary) {
    await prisma.productSupplier.updateMany({
      where: {
        productId,
        isPrimary: true
      },
      data: { isPrimary: false }
    });
  }

  const productSupplier = await prisma.productSupplier.update({
    where: {
      productId_supplierId: {
        productId,
        supplierId
      }
    },
    data,
    include: {
      product: {
        select: {
          id: true,
          title: true,
          sku: true
        }
      },
      supplier: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return productSupplier;
}

/**
 * Remove product from supplier
 */
export async function removeProductFromSupplier(productId: string, supplierId: string) {
  await prisma.productSupplier.delete({
    where: {
      productId_supplierId: {
        productId,
        supplierId
      }
    }
  });

  return { success: true };
}

/**
 * Get supplier statistics
 */
export async function getSupplierStats() {
  const [
    totalSuppliers,
    activeSuppliers,
    suppliersWithProducts,
    recentSuppliers
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.supplier.count({
      where: {
        products: {
          some: {}
        }
      }
    }),
    prisma.supplier.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
  ]);

  return {
    totalSuppliers,
    activeSuppliers,
    suppliersWithProducts,
    recentSuppliers
  };
}

/**
 * Get suppliers for a specific product
 */
export async function getProductSuppliers(productId: string) {
  const suppliers = await prisma.productSupplier.findMany({
    where: { productId },
    include: {
      supplier: true
    },
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'asc' }
    ]
  });

  return suppliers;
}

/**
 * Get primary supplier for a product
 */
export async function getPrimarySupplier(productId: string) {
  const primarySupplier = await prisma.productSupplier.findFirst({
    where: {
      productId,
      isPrimary: true
    },
    include: {
      supplier: true
    }
  });

  return primarySupplier;
}

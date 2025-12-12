'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';
import { ImageUrlManager, ImageUrlItem } from '@/components/admin/ImageUrlManager';
import { SizeChartManager, SizeChartEntry } from '@/components/admin/SizeChartManager';
import { ProductDetailsManager, ProductDetails, ProductSpecifications } from '@/components/admin/ProductDetailsManager';

type VariantOption = {
  id: string;
  key: string;
  value: string;
};

type VariantFormState = {
  id: string;
  title: string;
  price: string;
  stockQty: string;
  sku: string;
  size: string;
  color: string;
  material: string;
  options: VariantOption[];
};

const createEmptyVariant = (): VariantFormState => ({
  id: crypto.randomUUID(),
  title: 'Default',
  price: '',
  stockQty: '0',
  sku: '',
  size: '',
  color: '',
  material: '',
  options: [],
});

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COMMON_COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow', 
  'Pink', 'Purple', 'Orange', 'Brown', 'Beige', 'Khaki', 'Maroon', 'Teal'
];

export default function NewProductPage() {
  const router = useRouter();
  const { showLoading, hideLoading } = useGlobalLoading();

  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    isActive: true,
    isFeatured: false,
  });
  const [variants, setVariants] = useState<VariantFormState[]>([createEmptyVariant()]);
  const [images, setImages] = useState<ImageUrlItem[]>([]);
  const [sizeChart, setSizeChart] = useState<SizeChartEntry[]>([]);
  const [details, setDetails] = useState<ProductDetails>({
    material: '',
    fit: '',
    weight: '',
    origin: '',
    color: '',
  });
  const [specifications, setSpecifications] = useState<ProductSpecifications>({
    weight: '',
    dimensions: '',
    sizes: [],
  });
  const [washCare, setWashCare] = useState<string[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryImageId = useMemo(
    () => images.find((image) => image.isPrimary)?.id ?? null,
    [images]
  );

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateVariant = (
    variantId: string,
    updater: (variant: VariantFormState) => VariantFormState
  ) => {
    setVariants((prev) =>
      prev.map((variant) => (variant.id === variantId ? updater(variant) : variant))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, createEmptyVariant()]);
  };

  const removeVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
  };

  const addVariantOption = (variantId: string) => {
    updateVariant(variantId, (variant) => ({
      ...variant,
      options: [...variant.options, { id: crypto.randomUUID(), key: '', value: '' }],
    }));
  };

  const updateVariantOption = (
    variantId: string,
    optionId: string,
    patch: Partial<VariantOption>
  ) => {
    updateVariant(variantId, (variant) => ({
      ...variant,
      options: variant.options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              ...patch,
            }
          : option
      ),
    }));
  };

  const removeVariantOption = (variantId: string, optionId: string) => {
    updateVariant(variantId, (variant) => ({
      ...variant,
      options: variant.options.filter((option) => option.id !== optionId),
    }));
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return 'Product title is required.';
    }

    if (!form.categoryId.trim()) {
      return 'Category is required.';
    }

    if (images.length === 0) {
      return 'Please upload at least one product image.';
    }

    if (variants.length === 0) {
      return 'Please add at least one variant.';
    }

    const basePrice = Number.parseFloat(form.price || '0');
    if (Number.isNaN(basePrice) || basePrice <= 0) {
      return 'Please enter a valid base price.';
    }

    for (const variant of variants) {
      if (!variant.size.trim()) {
        return `Variant ${variants.indexOf(variant) + 1} requires a size.`;
      }
      if (!variant.color.trim()) {
        return `Variant ${variants.indexOf(variant) + 1} requires a color.`;
      }
      const variantPrice = Number.parseFloat(variant.price || form.price || '0');
      const variantStock = Number.parseInt(variant.stockQty || '0', 10);
      if (Number.isNaN(variantPrice) || variantPrice <= 0) {
        return `Variant "${variant.title || variant.size + ' / ' + variant.color || 'Unnamed'}" requires a valid price.`;
      }
      if (Number.isNaN(variantStock) || variantStock < 0) {
        return `Variant "${variant.title || variant.size + ' / ' + variant.color || 'Unnamed'}" requires a non-negative stock quantity.`;
      }
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrors(validationError);
      showToast.error(validationError);
      return;
    }

    setErrors(null);
    setIsSubmitting(true);
    showLoading('Creating product...');

    try {
      const numericPrice = Number.parseFloat(form.price || '0');
      const numericCompareAtPrice = form.compareAtPrice
        ? Number.parseFloat(form.compareAtPrice)
        : undefined;

      const normalizedImages = images.map((image, index) => ({
        url: image.url,
        alt: image.alt || `Product image ${index + 1}`,
        isPrimary: image.isPrimary || (primaryImageId === null && index === 0),
      }));

      const normalizedVariants = variants.map((variant) => {
        const parsedPrice = Number.parseFloat(variant.price || form.price || '0');
        const parsedStock = Number.parseInt(variant.stockQty || '0', 10);

        // Build options object from dedicated fields and custom attributes
        const optionObject: Record<string, string> = {};
        
        // Add dedicated fields
        if (variant.size.trim()) {
          optionObject['Size'] = variant.size.trim();
        }
        if (variant.color.trim()) {
          optionObject['Color'] = variant.color.trim();
        }
        if (variant.material.trim()) {
          optionObject['Material'] = variant.material.trim();
        }
        
        // Add custom attributes
        variant.options
          .filter((option) => option.key.trim() && option.value.trim())
          .forEach((option) => {
            const key = option.key.trim();
            const value = option.value.trim();
            // Don't override dedicated fields
            if (key !== 'Size' && key !== 'Color' && key !== 'Material') {
              optionObject[key] = value;
            }
          });

        // Generate variant title from size and color if not manually set
        const variantTitle = variant.title.trim() || 
          [variant.size, variant.color].filter(Boolean).join(' / ') || 
          'Default';

        const attributeString = Object.entries(optionObject)
          .map(([key, value]) => `${key}:${value}`)
          .join(' | ');

        return {
          title: variantTitle,
          price: Number.isNaN(parsedPrice) ? numericPrice : parsedPrice,
          stockQty: Number.isNaN(parsedStock) ? 0 : parsedStock,
          sku: variant.sku.trim() || undefined,
          options: Object.keys(optionObject).length > 0 ? optionObject : undefined,
          attributes: attributeString || undefined,
        };
      });

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          shortDescription: form.shortDescription.trim() || undefined,
          category: form.categoryId.trim(),
          sku: form.sku.trim() || undefined,
          featured: form.isFeatured,
          price: numericPrice,
          compareAtPrice: numericCompareAtPrice,
          variants: normalizedVariants,
          images: normalizedImages,
          sizeChart: sizeChart.length > 0 ? sizeChart : undefined,
          details: Object.values(details).some(v => v.trim()) ? details : undefined,
          specifications: Object.values(specifications).some(v => Array.isArray(v) ? v.length > 0 : v.trim()) ? specifications : undefined,
          washCare: washCare.filter(i => i.trim()).length > 0 ? washCare.filter(i => i.trim()) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create product.');
      }

      showToast.success('Product created successfully.');
      router.push('/admin/products');
    } catch (error) {
      
      showToast.error((error as Error).message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-gray-600 hover:text-black">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Product</h1>
          <p className="text-sm text-gray-500">
            Create a new product and configure variants, pricing, and assets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          <p className="mt-1 text-sm text-gray-500">
            Provide the core details for the product. Variants can override pricing and stock individually.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Product Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., Midnight Label Hoodie"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(event) => updateForm('shortDescription', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="A concise summary that appears on product listing cards."
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Tell your customers about materials, fit, care instructions, and story."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Base Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => updateForm('price', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Compare At Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(event) => updateForm('compareAtPrice', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Product SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(event) => updateForm('sku', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Leave blank to auto-generate"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
              <input
                type="text"
                required
                value={form.categoryId}
                onChange={(event) => updateForm('categoryId', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Category ID or slug"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateForm('isActive', event.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span>{form.isActive ? 'Active' : 'Save as draft'}</span>
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => updateForm('isFeatured', event.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span>Mark as featured</span>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ImageUrlManager
            images={images}
            onChange={setImages}
            helperText="Add image URLs (one per line or use the form). Images load lazily to improve page performance. The first image will be set as primary."
            maxImages={10}
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SizeChartManager
            sizeChart={sizeChart}
            onChange={setSizeChart}
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ProductDetailsManager
            details={details}
            specifications={specifications}
            washCare={washCare}
            onDetailsChange={setDetails}
            onSpecificationsChange={setSpecifications}
            onWashCareChange={setWashCare}
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Variants</h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure size, color, or other options. Each variant can override price, stock, and SKU.
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4" />
              Add Variant
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {variants.map((variant, variantIndex) => {
              const variantPrice = variant.price || form.price;
              const variantStock = variant.stockQty || '0';

              return (
                <div
                  key={variant.id}
                  className="rounded-lg border border-gray-200 bg-gray-50/60 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Variant {variantIndex + 1}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Customize the pricing, stock, and attributes for this variant.
                      </p>
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Size */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Size *
                      </label>
                      <select
                        value={COMMON_SIZES.includes(variant.size) ? variant.size : variant.size ? 'custom' : ''}
                        onChange={(event) => {
                          if (event.target.value === 'custom') {
                            updateVariant(variant.id, (prevVariant) => ({
                              ...prevVariant,
                              size: '',
                            }));
                          } else {
                            updateVariant(variant.id, (prevVariant) => ({
                              ...prevVariant,
                              size: event.target.value,
                            }));
                          }
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                      >
                        <option value="">Select Size</option>
                        {COMMON_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                        <option value="custom">Custom Size</option>
                      </select>
                      {variant.size && !COMMON_SIZES.includes(variant.size) && (
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(event) =>
                            updateVariant(variant.id, (prevVariant) => ({
                              ...prevVariant,
                              size: event.target.value,
                            }))
                          }
                          placeholder="Enter custom size"
                          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                          autoFocus
                        />
                      )}
                    </div>

                    {/* Color */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Color *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={COMMON_COLORS.includes(variant.color) ? variant.color : variant.color ? 'custom' : ''}
                          onChange={(event) => {
                            if (event.target.value === 'custom') {
                              updateVariant(variant.id, (prevVariant) => ({
                                ...prevVariant,
                                color: '',
                              }));
                            } else {
                              updateVariant(variant.id, (prevVariant) => ({
                                ...prevVariant,
                                color: event.target.value,
                              }));
                            }
                          }}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        >
                          <option value="">Select Color</option>
                          {COMMON_COLORS.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                          <option value="custom">Custom Color</option>
                        </select>
                        {variant.color && COMMON_COLORS.includes(variant.color) && (
                          <div
                            className="w-10 h-10 rounded border border-gray-300"
                            style={{
                              backgroundColor: variant.color.toLowerCase(),
                            }}
                            title={variant.color}
                          />
                        )}
                      </div>
                      {variant.color && !COMMON_COLORS.includes(variant.color) && (
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(event) =>
                            updateVariant(variant.id, (prevVariant) => ({
                              ...prevVariant,
                              color: event.target.value,
                            }))
                          }
                          placeholder="Enter custom color"
                          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                          autoFocus
                        />
                      )}
                    </div>

                    {/* Material */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Material
                      </label>
                      <input
                        type="text"
                        value={variant.material}
                        onChange={(event) =>
                          updateVariant(variant.id, (prevVariant) => ({
                            ...prevVariant,
                            material: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="e.g., Cotton, Polyester"
                      />
                    </div>

                    {/* Variant Title (Auto-generated or manual) */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Variant Title
                      </label>
                      <input
                        type="text"
                        value={variant.title}
                        onChange={(event) =>
                          updateVariant(variant.id, (prevVariant) => ({
                            ...prevVariant,
                            title: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Auto: Size / Color"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Auto-generated from Size/Color if left blank
                      </p>
                    </div>

                    {/* Variant SKU */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Variant SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(variant.id, (prevVariant) => ({
                            ...prevVariant,
                            sku: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Optional: auto-generated"
                      />
                    </div>

                    {/* Variant Price */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Variant Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variantPrice}
                        onChange={(event) =>
                          updateVariant(variant.id, (prevVariant) => ({
                            ...prevVariant,
                            price: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to inherit base price ({form.price || '0'})
                      </p>
                    </div>

                    {/* Stock Quantity */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variantStock}
                        onChange={(event) =>
                          updateVariant(variant.id, (prevVariant) => ({
                            ...prevVariant,
                            stockQty: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Additional Attributes</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Add custom attributes beyond Size, Color, and Material
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addVariantOption(variant.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add Custom Attribute
                      </button>
                    </div>

                    {variant.options.length === 0 ? (
                      <p className="mt-3 text-xs text-gray-500">
                        No custom attributes added. Size, Color, and Material are handled above.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {variant.options.map((option) => (
                          <div key={option.id} className="grid grid-cols-12 items-center gap-2">
                            <input
                              type="text"
                              value={option.key}
                              onChange={(event) =>
                                updateVariantOption(variant.id, option.id, { key: event.target.value })
                              }
                              className="col-span-5 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                              placeholder="Attribute (e.g., Pattern, Fit)"
                            />
                            <span className="col-span-1 text-center text-sm text-gray-500">:</span>
                            <input
                              type="text"
                              value={option.value}
                              onChange={(event) =>
                                updateVariantOption(variant.id, option.id, { value: event.target.value })
                              }
                              className="col-span-5 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                              placeholder="Value (e.g., Striped, Slim)"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantOption(variant.id, option.id)}
                              className="col-span-1 inline-flex justify-end text-red-500 hover:text-red-700"
                              title="Remove attribute"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {errors && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, useWishlist } from '@/app/providers';
import { showToast } from '@/lib/toast';
import { MobileImageCarousel } from '@/components/mobile/MobileImageCarousel';
import { ProductImage, ProductVariant } from '@/types/product';
import { getErrorMessage } from '@/types/common';

interface Product {
  id: string;
  name: string;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  images: string[];
  category: string;
  description: string;
  details: {
    material: string;
    fit: string;
    weight: string;
    origin: string;
    color: string;
  };
  washCare: string[];
  specifications: {
    weight: string;
    dimensions: string;
    sizes: string[];
  };
  variants: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    stockQty?: number;
    options: {
      color: string;
      size: string;
    };
  }[];
  inStock: boolean;
  tags: string[];
  sizeChart?: Array<{
    size: string;
    chest: string;
    length: string;
    sleeve: string;
    shoulder: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [apiProductData, setApiProductData] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    name: '',
    email: '',
    title: '',
    comment: ''
  });
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch product from API
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        
        if (!response.ok || !data.success || !data.data?.product) {
          setError('Product not found');
          return;
        }
        
        const apiProduct = data.data.product;
        
        // Transform API product to match Product interface
        const images = Array.isArray(apiProduct.images) 
          ? apiProduct.images.map((img: ProductImage | string) => typeof img === 'string' ? img : (img as ProductImage).url || '')
          : [];
        
        const variants = Array.isArray(apiProduct.variants) 
          ? apiProduct.variants.map((v: ProductVariant) => ({
              id: v.id,
              title: v.title || `${v.options?.Size || ''} / ${v.options?.Color || ''}`.trim(),
              price: v.price || apiProduct.price || 0,
              compareAtPrice: v.compareAtPrice || v.comparePrice || apiProduct.compareAtPrice,
              stockQty: v.stockQty || 0,
              sku: (v as any).variantSku || (v as any).sku || null,
              options: {
                color: v.options?.Color || v.options?.color || '',
                size: v.options?.Size || v.options?.size || ''
              }
            }))
          : [];
        
        // Get size chart from API or use defaults
        const apiSizeChart = apiProduct.sizeChart && Array.isArray(apiProduct.sizeChart) ? apiProduct.sizeChart : null;
        const defaultSizeChart = [
          { size: 'XS', chest: '36', length: '26', sleeve: '23', shoulder: '16' },
          { size: 'S', chest: '38', length: '27', sleeve: '24', shoulder: '16.5' },
          { size: 'M', chest: '40', length: '28', sleeve: '25', shoulder: '17' },
          { size: 'L', chest: '42', length: '29', sleeve: '26', shoulder: '17.5' },
          { size: 'XL', chest: '44', length: '30', sleeve: '27', shoulder: '18' },
          { size: 'XXL', chest: '46', length: '31', sleeve: '28', shoulder: '18.5' },
          { size: 'XXXL', chest: '48', length: '32', sleeve: '29', shoulder: '19' },
        ];
        const productSizeChart = apiSizeChart || defaultSizeChart;

        // Get details, specifications, and wash care from API or use defaults
        const apiDetails = apiProduct.details && typeof apiProduct.details === 'object' ? apiProduct.details : null;
        const defaultDetails = {
          material: '100% Premium Quality',
          fit: 'Regular Fit',
          weight: 'Standard',
          origin: 'Made in India',
          color: variants[0]?.options?.color || 'Various'
        };
        const productDetails = apiDetails || defaultDetails;

        const apiSpecifications = apiProduct.specifications && typeof apiProduct.specifications === 'object' ? apiProduct.specifications : null;
        const defaultSpecifications = {
          weight: 'Standard',
          dimensions: 'Standard',
          sizes: variants.map((v: ProductVariant) => (v.options as Record<string, unknown>)?.size as string).filter(Boolean) || ['S', 'M', 'L', 'XL']
        };
        const productSpecifications = apiSpecifications || defaultSpecifications;

        const apiWashCare = apiProduct.washCare && Array.isArray(apiProduct.washCare) ? apiProduct.washCare : null;
        const defaultWashCare = [
          'Machine wash cold',
          'Do not bleach',
          'Tumble dry low',
          'Iron on low heat'
        ];
        const productWashCare = apiWashCare || defaultWashCare;

        const transformedProduct: Product = {
          id: apiProduct.id,
          name: apiProduct.title || apiProduct.name || 'Product',
          originalPrice: apiProduct.compareAtPrice || apiProduct.comparePrice || apiProduct.price || 0,
          currentPrice: apiProduct.price || 0,
          discount: (apiProduct.compareAtPrice || apiProduct.comparePrice || apiProduct.price || 0) - (apiProduct.price || 0),
          images: images.length > 0 ? images : ['/placeholder-product.jpg'],
          category: apiProduct.category?.name || apiProduct.category || 'Uncategorized',
          description: apiProduct.description || apiProduct.shortDescription || 'No description available.',
          details: productDetails,
          washCare: productWashCare,
          specifications: productSpecifications,
          sizeChart: productSizeChart,
          variants: variants.length > 0 ? variants : [{
            id: apiProduct.id,
            title: 'Default',
            price: apiProduct.price || 0,
            compareAtPrice: apiProduct.compareAtPrice || apiProduct.comparePrice,
            options: { color: '', size: 'M' }
          }],
          inStock: apiProduct.isActive !== false && variants.some((v: ProductVariant) => (v.stockQty || 0) > 0),
          tags: apiProduct.tags ? (typeof apiProduct.tags === 'string' ? apiProduct.tags.split(',') : apiProduct.tags) : [],
          createdAt: apiProduct.createdAt || new Date().toISOString(),
          updatedAt: apiProduct.updatedAt || new Date().toISOString()
        };
        
        setProduct(transformedProduct);
        setApiProductData(apiProduct);
        
        // Transform and set related products
        if (apiProduct.relatedProducts && Array.isArray(apiProduct.relatedProducts)) {
          const transformedRelated = apiProduct.relatedProducts.map((rp: any) => {
            const relatedImages = Array.isArray(rp.images) 
              ? rp.images.map((img: ProductImage | string) => typeof img === 'string' ? img : (img as ProductImage).url || '')
              : [];
            
            return {
              id: rp.id,
              name: rp.title || rp.name || 'Product',
              originalPrice: rp.compareAtPrice || rp.comparePrice || rp.price || 0,
              currentPrice: rp.minPrice || rp.price || 0,
              discount: (rp.compareAtPrice || rp.comparePrice || rp.price || 0) - (rp.minPrice || rp.price || 0),
              images: relatedImages.length > 0 ? relatedImages : ['/placeholder-product.jpg'],
              category: rp.category?.name || rp.category || 'Uncategorized',
              description: rp.description || rp.shortDescription || '',
              details: {
                material: '100% Premium Quality',
                fit: 'Regular Fit',
                weight: 'Standard',
                origin: 'Made in India',
                color: ''
              },
              washCare: [],
              specifications: {
                weight: 'Standard',
                dimensions: 'Standard',
                sizes: []
              },
              variants: [],
              inStock: rp.isActive !== false,
              tags: [],
              createdAt: rp.createdAt || new Date().toISOString(),
              updatedAt: rp.updatedAt || new Date().toISOString()
            } as Product;
          });
          setRelatedProducts(transformedRelated);
        }
        
        // Add structured data for SEO
        if (typeof window !== 'undefined') {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
          const productUrl = `${siteUrl}/product/${params.id}`;
          const primaryImage = transformedProduct.images[0] || '/placeholder-product.jpg';
          const fullImageUrl = primaryImage.startsWith('http') ? primaryImage : `${siteUrl}${primaryImage}`;
          
          // Product structured data (JSON-LD)
          const productStructuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: transformedProduct.name,
            description: transformedProduct.description,
            image: transformedProduct.images.map((img: string) => 
              img.startsWith('http') ? img : `${siteUrl}${img}`
            ),
            brand: {
              '@type': 'Brand',
              name: 'ULICA',
            },
            category: transformedProduct.category,
            sku: transformedProduct.id,
            mpn: transformedProduct.id,
            condition: 'https://schema.org/NewCondition',
            offers: {
              '@type': 'Offer',
              price: transformedProduct.currentPrice,
              priceCurrency: 'INR',
              availability: transformedProduct.inStock 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
              url: productUrl,
              seller: {
                '@type': 'Organization',
                name: 'ULICA',
              },
            },
            ...(apiProduct.averageRating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: apiProduct.averageRating,
                reviewCount: apiProduct.reviewCount || 0,
              },
            }),
          };
          
          // Breadcrumb structured data
          const breadcrumbData = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${siteUrl}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: `${siteUrl}/products`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: transformedProduct.category,
                item: `${siteUrl}/products?category=${encodeURIComponent(transformedProduct.category)}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: transformedProduct.name,
                item: productUrl,
              },
            ],
          };
          
          // Remove existing structured data scripts
          const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-seo]');
          existingScripts.forEach(script => script.remove());
          
          // Add product structured data
          const productScript = document.createElement('script');
          productScript.type = 'application/ld+json';
          productScript.setAttribute('data-seo', 'product');
          productScript.text = JSON.stringify(productStructuredData);
          document.head.appendChild(productScript);
          
          // Add breadcrumb structured data
          const breadcrumbScript = document.createElement('script');
          breadcrumbScript.type = 'application/ld+json';
          breadcrumbScript.setAttribute('data-seo', 'breadcrumb');
          breadcrumbScript.text = JSON.stringify(breadcrumbData);
          document.head.appendChild(breadcrumbScript);
        }
        // Set default variant to the first one (usually M size)
        const defaultVariant = transformedProduct.variants.find(v => v.options.size === 'M') || transformedProduct.variants[0];
        setSelectedVariant(defaultVariant?.id || '');
      } catch (err) {
        setError('Failed to load product');
        
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const shareProduct = async (platform: string) => {
    if (!product) return;
    
    const productUrl = window.location.href;
    const productTitle = product.name;
    const shareText = `Check out this ${productTitle} from ULICA: ${productUrl}`;
    
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: productTitle,
          text: shareText,
          url: productUrl,
        });
      } else {
        // Platform-specific sharing
        const encodedUrl = encodeURIComponent(productUrl);
        const encodedTitle = encodeURIComponent(productTitle);
        const encodedText = encodeURIComponent(shareText);
        
        let shareUrl = '';
        
        switch (platform) {
          case 'Instagram':
            // Instagram doesn't support direct URL sharing, so copy to clipboard
            await navigator.clipboard.writeText(shareText);
            setCopiedUrl(platform);
            setTimeout(() => setCopiedUrl(''), 2000);
            return;
            
          case 'Facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
            
          case 'Twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            break;
            
          case 'YouTube':
            // YouTube doesn't support direct sharing, so copy to clipboard
            await navigator.clipboard.writeText(shareText);
            setCopiedUrl(platform);
            setTimeout(() => setCopiedUrl(''), 2000);
            return;
            
          case 'Pinterest':
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
            break;
            
          case 'LinkedIn':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
            
          default:
            // Fallback to clipboard
            await navigator.clipboard.writeText(shareText);
            setCopiedUrl(platform);
            setTimeout(() => setCopiedUrl(''), 2000);
            return;
        }
        
        // Open sharing URL in new window
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } catch (err) {
      
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedUrl(platform);
        setTimeout(() => setCopiedUrl(''), 2000);
      } catch (clipboardErr) {
        
      }
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    const variant = product.variants.find(v => v.id === selectedVariant);
    if (!variant) return;
    
    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      image: product.images[0] || '/placeholder.jpg',
      variant: {
        name: variant.title,
        options: variant.options
      },
      quantity
    });
  };

  const handleAddToWishlist = () => {
    if (!product || !selectedVariant) return;
    
    const variant = product.variants.find(v => v.id === selectedVariant);
    if (!variant) return;
    
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: variant.price,
      image: product.images[0] || '/placeholder-product.jpg',
      variant: {
        name: variant.title,
        options: variant.options
      }
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewForm.rating || !reviewForm.name || !reviewForm.email || !reviewForm.title || !reviewForm.comment) {
      showToast.error('Please fill in all required review fields.');
      return;
    }
    
    // Save review to localStorage (in a real app, this would go to a backend)
    const reviews = JSON.parse(localStorage.getItem(`ulica_reviews_${product?.id}`) || '[]');
    const newReview = {
      id: Date.now().toString(),
      productId: product?.id,
      rating: reviewForm.rating,
      name: reviewForm.name,
      email: reviewForm.email,
      title: reviewForm.title,
      comment: reviewForm.comment,
      date: new Date().toISOString(),
      verified: false
    };
    
    reviews.push(newReview);
    localStorage.setItem(`ulica_reviews_${product?.id}`, JSON.stringify(reviews));
    
    showToast.success('Thank you for your review! It will be published after moderation.');
    
    // Reset form and close modal
    setReviewForm({
      rating: 0,
      name: '',
      email: '',
      title: '',
      comment: ''
    });
    setShowReviewForm(false);
  };

  const handleReviewChange = (field: string, value: string | number) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-black text-lg" >Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4" >
            {error || 'Product not found'}
          </div>
          <Link 
            href="/"
            className="text-black hover:text-gray-600 underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs for SEO */}
      {product && (
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-4 md:py-6 text-sm mb-4 md:mb-6">
          <ol className="flex items-center space-x-2 text-gray-600" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" itemProp="item" className="hover:text-black">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/products" itemProp="item" className="hover:text-black">
                <span itemProp="name">Products</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-black font-medium">{product.name}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>
      )}
      
      {/* Header */}

      {/* Main Product Section */}
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Product Images - Left Side */}
          <div className="w-full">
            {/* Mobile: Horizontal Scrolling Carousel */}
            <div className="lg:hidden w-full">
              <MobileImageCarousel 
                images={product.images}
                alt={product.name}
                className="w-full"
              />
            </div>

            {/* Desktop: Thumbnails + Main Image */}
            <div className="hidden lg:flex gap-6 pl-6">
              {/* Thumbnail Navigation - Left Side (Outside black background) */}
              <div className="flex flex-col gap-3">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-24 h-24 transition-opacity overflow-hidden ${
                      selectedImage === index 
                        ? 'opacity-100' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image - With Black Background */}
              <div className="relative aspect-[4/5] bg-black overflow-hidden flex-1 p-6">
                <Image
                  src={product.images[selectedImage] || product.images[0] || '/placeholder-product.jpg'}
                  alt={`${product.name} - Main Image`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/* Product Details - Right Side with White Background */}
          <div className="bg-white px-4 py-6 md:py-8 lg:px-8 lg:py-12 space-y-4 md:space-y-5 lg:space-y-6" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
            <div>
              <h1 className="text-2xl md:text-3xl font-normal text-black mb-3" >
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4" >
              <div className="text-sm md:text-base text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-lg md:text-xl font-bold text-[#800000]">
                ₹{product.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {product.discount > 0 && (
                <div className="inline-block bg-[#800000] text-white px-2.5 py-0.5 rounded text-[10px] md:text-xs font-medium">
                  Save ₹{product.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-3" >
              <label className="block text-sm md:text-base font-medium text-black uppercase">
                CLOTHING-SIZE
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`py-2 px-4 text-sm font-medium border-2 transition-colors touch-target min-w-[50px] ${
                      selectedVariant === variant.id
                        ? 'bg-gray-100 text-black border-gray-500'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {variant.options.size}
                  </button>
                ))}
            </div>

              {/* Size Details and Stock Status - Show when size is selected */}
              {selectedVariant && (() => {
                const selectedVariantData = product.variants.find(v => v.id === selectedVariant);
                const selectedSize = selectedVariantData?.options.size;
                const sizeChartEntry = product.sizeChart?.find((sc: any) => 
                  sc.size === selectedSize || sc.size?.toUpperCase() === selectedSize?.toUpperCase()
                );
                const isInStock = (selectedVariantData?.stockQty || 0) > 0;
                
                return (
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-3">
                    {sizeChartEntry && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600 mb-1">Chest (in)</div>
                          <div className="text-black font-medium">{sizeChartEntry.chest != null && String(sizeChartEntry.chest) !== '' ? sizeChartEntry.chest : 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 mb-1">Length (in)</div>
                          <div className="text-black font-medium">{sizeChartEntry.length != null && String(sizeChartEntry.length) !== '' ? sizeChartEntry.length : 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 mb-1">Sleeve (in)</div>
                          <div className="text-black font-medium">{sizeChartEntry.sleeve != null && String(sizeChartEntry.sleeve) !== '' ? sizeChartEntry.sleeve : 'N/A'}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                        {isInStock ? 'In stock' : 'Out of stock'}
              </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quantity, Add to Cart, and Add to Wishlist - All in one row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 bg-white text-black hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 bg-black text-white border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 bg-white text-black hover:bg-gray-50"
                >
                  +
                </button>
              </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                className="bg-black text-white py-2 px-12 font-semibold text-sm uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target min-h-[48px]" 
                >
                ADD TO CART
                </button>
                <button 
                  onClick={handleAddToWishlist}
                  disabled={!selectedVariant}
                className="flex items-center justify-center w-12 h-12 text-black hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 sm:border-0 sm:w-auto sm:h-auto sm:gap-2"
              >
                {selectedVariant && isInWishlist(product.id, selectedVariant) ? (
                  // Filled heart when in wishlist
                  <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Outline heart when not in wishlist
                  <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                <span className="hidden sm:inline-block text-sm font-medium uppercase">ADD TO WISHLIST</span>
                </button>
            </div>

            {/* SKU and Category */}
            <div className="space-y-1.5 text-sm text-black">
              {selectedVariant && (
                <div>
                  SKU: {(() => {
                    const variant = product.variants.find(v => v.id === selectedVariant);
                    return (variant as any)?.sku || apiProductData?.sku || variant?.id || product.id;
                  })()}
                </div>
              )}
              <div>
                Category: {product.category.toLowerCase()}
              </div>
            </div>

            {/* Share */}
            <div className="text-sm text-black font-medium uppercase mb-3" >
              SHARE
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-3">
              {/* Instagram */}
              <div className="relative group">
                <button
                  onClick={() => shareProduct('Instagram')}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                  {copiedUrl === 'Instagram' ? 'Copied!' : 'Share on Instagram'}
                </div>
              </div>

              {/* Facebook */}
              <div className="relative group">
                <button
                  onClick={() => shareProduct('Facebook')}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                  {copiedUrl === 'Facebook' ? 'Copied!' : 'Share on Facebook'}
                </div>
              </div>

              {/* Twitter */}
              <div className="relative group">
                <button
                  onClick={() => shareProduct('Twitter')}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                  {copiedUrl === 'Twitter' ? 'Copied!' : 'Share on Twitter'}
                </div>
              </div>

              {/* YouTube */}
              <div className="relative group">
                <button
                  onClick={() => shareProduct('YouTube')}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                  {copiedUrl === 'YouTube' ? 'Copied!' : 'Share on YouTube'}
                </div>
              </div>

              {/* Pinterest */}
              <div className="relative group">
                <button
                  onClick={() => shareProduct('Pinterest')}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                  {copiedUrl === 'Pinterest' ? 'Copied!' : 'Share on Pinterest'}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="relative group">
                <button
                  onClick={() => shareProduct('LinkedIn')}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                  {copiedUrl === 'LinkedIn' ? 'Copied!' : 'Share on LinkedIn'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description, Size Chart, Details, etc. - Old UI Layout */}
        <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Description */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-black" >
            Description
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed" >
              {product.description}
            </p>
          </div>
        </div>

        {/* Story Behind the Design */}
        {(() => {
          const defaultStory =
            'Born from the contrast of urban wild and minimal geometry, this piece explores the tension between chaos and calm. Bold silhouettes meet clean structure to create a statement you can wear anywhere.';
          const storyCopy = (product as any).story || defaultStory;
          return (
            <div className="mt-12 space-y-4">
              <h3 className="text-xl font-semibold text-black">Story Behind the Design</h3>
              <div className="rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-5">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {storyCopy}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Size Chart */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">
              SIZE CHART
            </h2>
            <p className="text-sm text-gray-600">All measurements in inches</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-6 py-4 font-semibold text-sm text-left">Size</th>
                  <th className="border border-gray-300 px-6 py-4 font-semibold text-sm text-center">Chest</th>
                  <th className="border border-gray-300 px-6 py-4 font-semibold text-sm text-center">Length</th>
                  <th className="border border-gray-300 px-6 py-4 font-semibold text-sm text-center">Sleeve</th>
                  <th className="border border-gray-300 px-6 py-4 font-semibold text-sm text-center">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {(product.sizeChart || []).filter(row => product.specifications.sizes.includes(row.size) || !product.specifications.sizes.length).map((row) => (
                  <tr key={row.size} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-6 py-4 font-medium text-sm">{row.size}</td>
                    <td className="border border-gray-300 px-6 py-4 text-sm text-center">{row.chest}"</td>
                    <td className="border border-gray-300 px-6 py-4 text-sm text-center">{row.length}"</td>
                    <td className="border border-gray-300 px-6 py-4 text-sm text-center">{row.sleeve}"</td>
                    <td className="border border-gray-300 px-6 py-4 text-sm text-center">{row.shoulder}"</td>
                  </tr>
                ))}
                {product.specifications.sizes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-6 py-4 text-sm text-center text-gray-500">
                      Size chart information not available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>How to Measure:</strong> Measure your chest at the fullest point, length from shoulder to hem, sleeve from shoulder to cuff, and shoulder from shoulder seam to shoulder seam.
            </p>
          </div>
        </div>

        {/* Details and Specifications Side by Side */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black" >
              DETAILS
            </h2>
            <div className="space-y-2">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key} className="flex items-start space-x-2">
                  <span className="text-black">✔</span>
                  <span className="text-gray-700" >{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black" >
              Specifications
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300" >
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-6 py-4 font-medium text-xs">Weight</td>
                    <td className="border border-gray-300 px-6 py-4 text-xs text-right">{product.specifications.weight}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-6 py-4 font-medium text-xs">Dimensions</td>
                    <td className="border border-gray-300 px-6 py-4 text-xs text-right">{product.specifications.dimensions}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-6 py-4 font-medium text-xs">clothing-size</td>
                    <td className="border border-gray-300 px-6 py-4 text-xs text-right">{product.specifications.sizes.join(', ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Wash Care */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-black" >
            WASH CARE
          </h2>
          <ul className="space-y-2">
            {product.washCare.map((care: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-black text-sm">★</span>
                <span className="text-gray-700" >{care}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-black" >
            Reviews (0)
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4" >There are no reviews yet.</p>
            <button 
              onClick={() => setShowReviewForm(true)}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors" 
            >
              Add a review
            </button>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold text-black" >
            Related Products
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((relatedProduct: Product) => (
              <Link 
                key={relatedProduct.id}
                  href={`/product/${(relatedProduct as any).slug || relatedProduct.id}`}
                className="group relative bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 ease-in-out transform block"
              >
                {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100 aspect-[4/5]">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm bg-white/80 px-3 py-1 rounded">
                          No Image
                      </span>
                    </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 text-center">
                    <h3 className="font-medium text-sm text-black mb-3 leading-tight group-hover:text-gray-700 transition-colors duration-300 line-clamp-2" >
                    {relatedProduct.name}
                  </h3>
                  
                  {/* Pricing */}
                    <div className="mb-3 flex items-center justify-center gap-2 flex-wrap" >
                      {relatedProduct.originalPrice > relatedProduct.currentPrice && (
                    <div className="text-xs text-gray-500 font-medium line-through">
                          ₹{relatedProduct.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                      )}
                    <div className="text-sm text-black font-bold">
                        ₹{relatedProduct.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                      {relatedProduct.discount > 0 && (
                        <div className="inline-block bg-[#800000] text-white px-2 py-1 text-xs font-medium rounded">
                          Save ₹{relatedProduct.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                      )}
                  </div>
                </div>
              </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No related products found.
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-0 sm:p-4">
          <div
            className="bg-white rounded-none sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl w-full h-full sm:h-auto sm:w-full max-w-2xl sm:max-h-[90vh] overflow-y-auto border-0 sm:border border-gray-100 animate-in slide-in-from-bottom-4 duration-300 scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-black to-gray-800 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-0.5 sm:mb-1" >
                    Write a Review
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base hidden sm:block" >
                    Share your experience with this product
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 sm:p-3 hover:bg-gray-100 rounded-lg sm:rounded-xl group flex-shrink-0 touch-target"
                aria-label="Close review form"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-6">
              {/* Rating */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <label className="block text-lg font-semibold text-gray-800 mb-4" >
                  How would you rate this product? *
                </label>
                <div className="flex space-x-3 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleReviewChange('rating', star)}
                      className={`text-4xl transition-all duration-300 transform hover:scale-110 ${
                        star <= reviewForm.rating 
                          ? 'text-yellow-400 drop-shadow-lg' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {reviewForm.rating > 0 && (
                  <div className="text-center mt-4">
                    <p className="text-lg font-medium text-gray-800" >
                      {reviewForm.rating === 1 && '😞 Poor'}
                      {reviewForm.rating === 2 && '😐 Fair'}
                      {reviewForm.rating === 3 && '😊 Good'}
                      {reviewForm.rating === 4 && '😍 Very Good'}
                      {reviewForm.rating === 5 && '🤩 Excellent'}
                    </p>
                  </div>
                )}
              </div>

              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3" >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => handleReviewChange('name', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 bg-white hover:border-gray-300"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3" >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => handleReviewChange('email', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 bg-white hover:border-gray-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3" >
                  Review Title *
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => handleReviewChange('title', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 bg-white hover:border-gray-300"
                  placeholder="Summarize your review in a few words"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3" >
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => handleReviewChange('comment', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 resize-none bg-white hover:border-gray-300 text-base"
                  placeholder="Tell us about your experience with this product..."
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2" >
                  Minimum 10 characters
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold border-2 border-gray-200 hover:border-gray-300 touch-target text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-black hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105 flex items-center justify-center space-x-2 touch-target text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

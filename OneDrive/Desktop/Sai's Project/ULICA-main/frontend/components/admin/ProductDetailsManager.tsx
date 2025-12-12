'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';

export interface ProductDetails {
  material: string;
  fit: string;
  weight: string;
  origin: string;
  color: string;
}

export interface ProductSpecifications {
  weight: string;
  dimensions: string;
  sizes: string[];
}

interface ProductDetailsManagerProps {
  details: ProductDetails;
  specifications: ProductSpecifications;
  washCare: string[];
  onDetailsChange: (details: ProductDetails) => void;
  onSpecificationsChange: (specifications: ProductSpecifications) => void;
  onWashCareChange: (washCare: string[]) => void;
}

export function ProductDetailsManager({
  details,
  specifications,
  washCare,
  onDetailsChange,
  onSpecificationsChange,
  onWashCareChange,
}: ProductDetailsManagerProps) {
  const [localDetails, setLocalDetails] = useState<ProductDetails>(details);
  const [localSpecifications, setLocalSpecifications] = useState<ProductSpecifications>(specifications);
  const [localWashCare, setLocalWashCare] = useState<string[]>(washCare);

  const updateDetails = (field: keyof ProductDetails, value: string) => {
    const updated = { ...localDetails, [field]: value };
    setLocalDetails(updated);
    onDetailsChange(updated);
  };

  const updateSpecifications = (field: keyof ProductSpecifications, value: string | string[]) => {
    const updated = { ...localSpecifications, [field]: value };
    setLocalSpecifications(updated);
    onSpecificationsChange(updated);
  };

  const addWashCare = () => {
    const updated = [...localWashCare, ''];
    setLocalWashCare(updated);
    onWashCareChange(updated);
  };

  const removeWashCare = (index: number) => {
    const updated = localWashCare.filter((_, i) => i !== index);
    setLocalWashCare(updated);
    onWashCareChange(updated);
  };

  const updateWashCare = (index: number, value: string) => {
    const updated = [...localWashCare];
    updated[index] = value;
    setLocalWashCare(updated);
    onWashCareChange(updated);
  };

  const updateSizes = (value: string) => {
    const sizes = value.split(',').map(s => s.trim()).filter(Boolean);
    updateSpecifications('sizes', sizes);
  };

  return (
    <div className="space-y-6">
      {/* Details Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Product Details
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Add specific details about the product materials, fit, and origin.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Material *
            </label>
            <input
              type="text"
              value={localDetails.material}
              onChange={(e) => updateDetails('material', e.target.value)}
              placeholder="e.g., 100% Pure Cotton"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fit *
            </label>
            <input
              type="text"
              value={localDetails.fit}
              onChange={(e) => updateDetails('fit', e.target.value)}
              placeholder="e.g., Regular Fit, Oversized Fit"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Weight
            </label>
            <input
              type="text"
              value={localDetails.weight}
              onChange={(e) => updateDetails('weight', e.target.value)}
              placeholder="e.g., 240 GSM"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Origin
            </label>
            <input
              type="text"
              value={localDetails.origin}
              onChange={(e) => updateDetails('origin', e.target.value)}
              placeholder="e.g., Made in India"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              value={localDetails.color}
              onChange={(e) => updateDetails('color', e.target.value)}
              placeholder="e.g., Black, White, Navy"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Specifications
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Add product specifications like weight, dimensions, and available sizes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Weight
            </label>
            <input
              type="text"
              value={localSpecifications.weight}
              onChange={(e) => updateSpecifications('weight', e.target.value)}
              placeholder="e.g., 0.550 kg"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Dimensions
            </label>
            <input
              type="text"
              value={localSpecifications.dimensions}
              onChange={(e) => updateSpecifications('dimensions', e.target.value)}
              placeholder="e.g., 28 × 22 × 7 cm"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Available Sizes (comma-separated)
            </label>
            <input
              type="text"
              value={localSpecifications.sizes.join(', ')}
              onChange={(e) => updateSizes(e.target.value)}
              placeholder="e.g., XS, S, M, L, XL, XXL"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter sizes separated by commas. These will be used for the size chart.
            </p>
          </div>
        </div>
      </div>

      {/* Wash Care Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Wash Care Instructions
            </label>
            <p className="text-xs text-gray-500">
              Add care instructions for washing and maintaining the product.
            </p>
          </div>
          <button
            type="button"
            onClick={addWashCare}
            className="px-3 py-1.5 text-xs font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" />
            Add Instruction
          </button>
        </div>
        {localWashCare.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">No wash care instructions yet.</p>
            <p className="text-xs text-gray-400">Click "Add Instruction" to add care instructions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {localWashCare.map((instruction, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => updateWashCare(index, e.target.value)}
                  placeholder="e.g., Machine wash cold"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => removeWashCare(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Remove instruction"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


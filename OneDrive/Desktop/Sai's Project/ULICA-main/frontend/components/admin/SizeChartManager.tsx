'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';

export interface SizeChartEntry {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
  shoulder: string;
}

interface SizeChartManagerProps {
  sizeChart: SizeChartEntry[];
  onChange: (sizeChart: SizeChartEntry[]) => void;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function SizeChartManager({ sizeChart, onChange }: SizeChartManagerProps) {
  const [localSizeChart, setLocalSizeChart] = useState<SizeChartEntry[]>(
    sizeChart.length > 0 ? sizeChart : []
  );

  const updateSizeChart = (updated: SizeChartEntry[]) => {
    setLocalSizeChart(updated);
    onChange(updated);
  };

  const addSize = () => {
    const newSize: SizeChartEntry = {
      size: '',
      chest: '',
      length: '',
      sleeve: '',
      shoulder: '',
    };
    updateSizeChart([...localSizeChart, newSize]);
  };

  const removeSize = (index: number) => {
    updateSizeChart(localSizeChart.filter((_, i) => i !== index));
  };

  const updateSizeEntry = (index: number, field: keyof SizeChartEntry, value: string) => {
    const updated = [...localSizeChart];
    updated[index] = { ...updated[index], [field]: value };
    updateSizeChart(updated);
  };

  const addDefaultSizes = () => {
    const defaultEntries: SizeChartEntry[] = DEFAULT_SIZES.map((size) => {
      const existing = localSizeChart.find((entry) => entry.size === size);
      if (existing) return existing;
      
      // Default measurements based on size
      const defaults: Record<string, { chest: string; length: string; sleeve: string; shoulder: string }> = {
        XS: { chest: '36', length: '26', sleeve: '23', shoulder: '16' },
        S: { chest: '38', length: '27', sleeve: '24', shoulder: '16.5' },
        M: { chest: '40', length: '28', sleeve: '25', shoulder: '17' },
        L: { chest: '42', length: '29', sleeve: '26', shoulder: '17.5' },
        XL: { chest: '44', length: '30', sleeve: '27', shoulder: '18' },
        XXL: { chest: '46', length: '31', sleeve: '28', shoulder: '18.5' },
        XXXL: { chest: '48', length: '32', sleeve: '29', shoulder: '19' },
      };
      
      return {
        size,
        ...defaults[size] || { chest: '', length: '', sleeve: '', shoulder: '' },
      };
    });
    
    updateSizeChart(defaultEntries);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Size Chart
          </label>
          <p className="text-xs text-gray-500">
            Add measurements for each size. All measurements are in inches.
          </p>
        </div>
        <div className="flex gap-2">
          {localSizeChart.length === 0 && (
            <button
              type="button"
              onClick={addDefaultSizes}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Add Default Sizes
            </button>
          )}
          <button
            type="button"
            onClick={addSize}
            className="px-3 py-1.5 text-xs font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" />
            Add Size
          </button>
        </div>
      </div>

      {localSizeChart.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">No size chart entries yet.</p>
          <p className="text-xs text-gray-400">Click "Add Default Sizes" to add standard sizes or "Add Size" for custom sizes.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-900">Size</th>
                <th className="border-r border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-900">Chest</th>
                <th className="border-r border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-900">Length</th>
                <th className="border-r border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-900">Sleeve</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Shoulder</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 w-12">Action</th>
              </tr>
            </thead>
            <tbody>
              {localSizeChart.map((entry, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="border-r border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={entry.size}
                      onChange={(e) => updateSizeEntry(index, 'size', e.target.value)}
                      placeholder="e.g., S, M, L"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </td>
                  <td className="border-r border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={entry.chest}
                      onChange={(e) => updateSizeEntry(index, 'chest', e.target.value)}
                      placeholder="36"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-center"
                    />
                  </td>
                  <td className="border-r border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={entry.length}
                      onChange={(e) => updateSizeEntry(index, 'length', e.target.value)}
                      placeholder="28"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-center"
                    />
                  </td>
                  <td className="border-r border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={entry.sleeve}
                      onChange={(e) => updateSizeEntry(index, 'sleeve', e.target.value)}
                      placeholder="25"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-center"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={entry.shoulder}
                      onChange={(e) => updateSizeEntry(index, 'shoulder', e.target.value)}
                      placeholder="17"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-center"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove size"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


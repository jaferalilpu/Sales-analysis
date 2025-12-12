'use client';

import React from 'react';

interface MobileTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: unknown, row: T) => React.ReactNode;
  }>;
  className?: string;
}

/**
 * Mobile-optimized table component
 * - Horizontal scroll on mobile
 * - Card view option
 * - Touch-friendly
 */
export function MobileTable({ data, columns, className = '' }: MobileTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* Desktop Table */}
      <table className="hidden md:table w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {columns.map((column) => (
              <div key={column.key} className="mb-3 last:mb-0">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  {column.label}
                </div>
                <div className="text-sm text-gray-900">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? '')}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


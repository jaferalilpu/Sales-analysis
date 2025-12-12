'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import bwipjs from 'bwip-js';
import { showToast } from '@/lib/toast';

interface OrderItem {
  product: { title: string; sku?: string };
  variant?: { title?: string; sku?: string };
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  courier?: string;
  expectedDelivery?: string;
}

interface ProductInfoSheetProps {
  order: Order;
}

export function ProductInfoSheet({ order }: ProductInfoSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>('');

  const generateBarcode = useCallback(async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Generate barcode using bwip-js
      await bwipjs.toCanvas(canvas, {
        bcid: 'code128', // Barcode type
        text: order.orderNumber || order.id,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      });

      setBarcodeDataUrl(canvas.toDataURL());
    } catch (error) {
      
    }
  }, [order.id, order.orderNumber]);

  useEffect(() => {
    generateBarcode();
  }, [generateBarcode]);

  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      // 4x6 inches label size (288 x 432 points, 1 point = 1/72 inch)
      const page = pdfDoc.addPage([288, 432]); // 4" x 6" shipping label size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 420; // Start from top of 6" label

      // Title
      page.drawText('PRODUCT INFO SHEET', {
        x: 15,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 20;

      // Order Details
      page.drawText(`Order: ${order.orderNumber || order.id}`, {
        x: 15,
        y,
        size: 10,
        font: boldFont,
      });
      y -= 15;

      page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
        x: 15,
        y,
        size: 8,
        font,
      });
      y -= 20;

      // Barcode
      if (barcodeDataUrl) {
        try {
          const barcodeImage = await pdfDoc.embedPng(barcodeDataUrl);
          page.drawImage(barcodeImage, {
            x: 15,
            y: y - 40,
            width: 258, // Full width minus margins
            height: 40,
          });
          y -= 55;
        } catch (error) {
          
        }
      }

      // Customer Details
      page.drawText('DELIVERY', {
        x: 15,
        y,
        size: 10,
        font: boldFont,
      });
      y -= 15;

      page.drawText(`${order.customer.name}`, {
        x: 15,
        y,
        size: 9,
        font: boldFont,
      });
      y -= 12;

      if (order.shippingAddress) {
        const addressLines = order.shippingAddress.address.split(',').slice(0, 2);
        addressLines.forEach((line: string) => {
          page.drawText(line.trim(), {
            x: 15,
            y,
            size: 8,
            font,
          });
          y -= 10;
        });

        page.drawText(
          `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`,
          {
            x: 15,
            y,
            size: 8,
            font,
          }
        );
        y -= 10;

        page.drawText(`Phone: ${order.shippingAddress.phone || order.customer.phone || '-'}`, {
          x: 15,
          y,
          size: 8,
          font,
        });
        y -= 12;
      }

      if (order.courier) {
        page.drawText(`Courier: ${order.courier}`, {
          x: 15,
          y,
          size: 8,
          font,
        });
        y -= 10;
      }

      // Products
      page.drawText('ITEMS', {
        x: 15,
        y,
        size: 9,
        font: boldFont,
      });
      y -= 12;

      order.items.forEach((item, index) => {
        if (y < 50) {
          const newPage = pdfDoc.addPage([288, 432]);
          y = 420;
        }

        const productTitle = item.product.title.length > 30 
          ? item.product.title.substring(0, 30) + '...'
          : item.product.title;
        
        page.drawText(`${index + 1}. ${productTitle}`, {
          x: 15,
          y,
          size: 8,
          font: boldFont,
        });
        y -= 10;

        const sku = item.variant?.sku || item.product.sku || '-';
        page.drawText(`SKU: ${sku}`, {
          x: 20,
          y,
          size: 7,
          font,
        });
        y -= 9;

        if (item.size || item.color) {
          page.drawText(
            `${item.size || '-'} | ${item.color || '-'}`,
            {
              x: 20,
              y,
              size: 7,
              font,
            }
          );
          y -= 9;
        }

        page.drawText(`Qty: ${item.quantity} | ₹${item.price.toFixed(0)}`, {
          x: 20,
          y,
          size: 7,
          font,
        });
        y -= 12;
      });

      // Footer
      if (y > 40) {
        page.drawLine({
          start: { x: 15, y },
          end: { x: 273, y },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });
        y -= 8;

        page.drawText('Packed by: ___________', {
          x: 15,
          y,
          size: 7,
          font,
        });
        y -= 8;

        page.drawText('Verified by: ___________', {
          x: 15,
          y,
          size: 7,
          font,
        });
      }

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${order.orderNumber || order.id}-info-sheet.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      
      showToast.error('Failed to generate info sheet PDF.');
    }
  };

  useEffect(() => {
    // Add print styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          page-break-after: auto;
          page-break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
      }
      @page {
        size: 4in 6in;
        margin: 0.2in;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>

      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 no-print">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Product Info Sheet</h1>
            <div className="flex gap-2">
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Print Label
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Print Instructions:</strong> Click "Print Label" to open the print dialog. 
              Use 4" x 6" shipping label paper (or 4x6 inch size). The barcode, order details, and delivery information will be included.
            </p>
          </div>
        </div>

      <div className="print-content border-2 border-gray-300 p-3 space-y-3 bg-white" style={{ width: '4in', minHeight: '6in', maxWidth: '100%', fontSize: '0.75rem' }}>
        {/* Header */}
        <div className="border-b border-gray-300 pb-2">
          <h2 className="text-base font-bold mb-1">PRODUCT INFO SHEET</h2>
          <p className="text-xs text-gray-600">
            Order: <span className="font-semibold">{order.orderNumber || order.id}</span>
          </p>
          <p className="text-xs text-gray-600">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Barcode */}
        <div className="flex justify-center py-2 border-b border-gray-300">
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {barcodeDataUrl && (
            <Image 
              src={barcodeDataUrl} 
              alt="Barcode" 
              width={200}
              height={48}
              className="w-full"
              style={{ maxWidth: '100%', objectFit: 'contain' }}
              loading="lazy"
            />
          )}
        </div>

        {/* Delivery Information */}
        <div className="border-b border-gray-300 pb-2">
          <h3 className="text-xs font-bold mb-1">DELIVERY</h3>
          <div className="space-y-1 text-xs">
            <p className="font-semibold">{order.customer.name}</p>
            {order.shippingAddress && (
              <>
                <p>{order.shippingAddress.address.split(',')[0]}</p>
                {order.shippingAddress.address.split(',').length > 1 && (
                  <p>{order.shippingAddress.address.split(',').slice(1).join(', ')}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone || order.customer.phone || '-'}</p>
              </>
            )}
            {order.courier && (
              <p className="font-semibold">Courier: {order.courier}</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="border-b border-gray-300 pb-2">
          <h3 className="text-xs font-bold mb-1">ITEMS</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="border border-gray-200 p-1.5 rounded text-xs">
                <p className="font-semibold mb-1">
                  {index + 1}. {item.product.title.length > 25 ? item.product.title.substring(0, 25) + '...' : item.product.title}
                </p>
                <div className="space-y-0.5 text-gray-600">
                  <p>
                    <strong>SKU:</strong> {item.variant?.sku || item.product.sku || '-'}
                  </p>
                  {(item.size || item.color) && (
                    <p>
                      {item.size || '-'} | {item.color || '-'}
                    </p>
                  )}
                  <p>
                    Qty: {item.quantity} | ₹{item.price.toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 space-y-1">
          <div className="border-t border-gray-300 pt-2 text-xs">
            <p className="mb-1">
              <strong>Packed by:</strong> _______________
            </p>
            <p>
              <strong>Verified by:</strong> _______________
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}


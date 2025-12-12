import { XMarkIcon, ArrowDownTrayIcon, PrinterIcon } from '@/components/ui/icons';

interface LabelViewerProps {
  labelUrl: string;
  onClose: () => void;
}

export function LabelViewer({ labelUrl, onClose }: LabelViewerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = labelUrl;
    link.download = 'shipping-label.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(labelUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Shipping Label</h2>
            <p className="text-sm text-gray-500">
              Download or print the generated Shiprocket label.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <PrinterIcon className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="h-[70vh] bg-gray-100">
          <iframe
            title="Shipping Label"
            src={labelUrl}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}


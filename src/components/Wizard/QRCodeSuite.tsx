import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Restaurant } from '../../types/index.ts';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Palette, 
  QrCode, 
  Smartphone, 
  Sparkles,
  Layers,
  Utensils
} from 'lucide-react';

interface QRCodeSuiteProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export const QRCodeSuite: React.FC<QRCodeSuiteProps> = ({ restaurant, onBack }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrColor, setQrColor] = useState<string>('#18181B');
  const [qrBgColor, setQrBgColor] = useState<string>('#FFFFFF');
  const [qrFrameText, setQrFrameText] = useState<string>('SCAN FOR DIGITAL MENU');
  const [tableNumber, setTableNumber] = useState<string>('Table 1');
  const [copiedLink, setCopiedLink] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const publicUrl = `${window.location.origin}/menu/${restaurant.slug}`;

  // Generate QR Code data URL
  useEffect(() => {
    QRCode.toDataURL(publicUrl, {
      width: 600,
      margin: 1.5,
      color: {
        dark: qrColor,
        light: qrBgColor
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [publicUrl, qrColor, qrBgColor]);

  // Download high-res PNG
  const handleDownloadPng = () => {
    const link = document.createElement('a');
    link.download = `${restaurant.slug}-menu-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // Download vector SVG
  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(publicUrl, {
        type: 'svg',
        color: { dark: qrColor, light: qrBgColor },
        margin: 1
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${restaurant.slug}-menu-qr.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('SVG export failed:', e);
    }
  };

  // Print Table Tent
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="qr-code-suite" className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Top Banner */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-xs font-semibold mb-1 border border-orange-200">
            <QrCode className="w-3.5 h-3.5 text-orange-600" />
            <span>QR Studio & Print Generator</span>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Instant QR Codes for Dining Tables
          </h2>
          <p className="text-xs text-gray-500">
            Custom branded QR codes for tables, tent cards, posters, and take-out packaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg"
          >
            Back to Editor
          </button>
          <button
            id="print-table-tent-btn"
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-200 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Table Tent</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Customizer Controls */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Public Link Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase text-gray-600 tracking-wider">
              Live Public Menu URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* QR Design & Color Customizer */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-gray-700 tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-600" />
              <span>QR Styling & Table Branding</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  QR Pattern Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-700">{qrColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  QR Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-700">{qrBgColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Frame Banner Slogan
              </label>
              <input
                type="text"
                value={qrFrameText}
                onChange={(e) => setQrFrameText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-bold focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Table Label (for Table Tents)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. Table #12, VIP Lounge, Terrace 3"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Quick Match Theme Button */}
            <button
              type="button"
              onClick={() => {
                setQrColor(restaurant.theme.primaryColor);
                setQrBgColor('#FFFFFF');
              }}
              className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-orange-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Match Restaurant Theme Colors</span>
            </button>
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="py-3 bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG (300 DPI)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-3 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Download Vector SVG</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Printable Table Tent Display */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          <div className="w-full max-w-sm">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 text-center">
              Printable Standup Table Tent Preview
            </h3>

            {/* Standup Print Card Container */}
            <div
              ref={printRef}
              id="printable-table-tent-card"
              className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-md text-center flex flex-col items-center justify-between aspect-[3/4] relative overflow-hidden"
            >
              {/* Top Motif */}
              <div>
                <div
                  className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-2 shadow-md"
                  style={{ backgroundColor: restaurant.theme.primaryColor }}
                >
                  <Utensils className="w-6 h-6" />
                </div>
                <h3
                  className="text-lg font-bold text-[#1A1A1A] tracking-tight"
                  style={{ fontFamily: restaurant.theme.fontHeading }}
                >
                  {restaurant.name}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  {restaurant.tagline || 'Digital Restaurant Menu'}
                </p>
                <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-700">
                  {tableNumber}
                </div>
              </div>

              {/* Central QR Code in Frame */}
              <div className="my-2 p-3 rounded-2xl bg-white border border-gray-200 shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Digital Menu QR"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-44 h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Bottom Instructions */}
              <div>
                <div
                  className="px-4 py-1.5 rounded-full text-white text-[11px] font-extrabold uppercase tracking-wider mb-1.5 inline-block shadow-xs"
                  style={{ backgroundColor: restaurant.theme.primaryColor }}
                >
                  {qrFrameText}
                </div>
                <p className="text-[10px] text-gray-400">
                  Point your phone camera to view our digital menu & order
                </p>
                {restaurant.wifiSSID && (
                  <p className="text-[9px] text-gray-400 mt-1">
                    Free Guest Wi-Fi: <strong>{restaurant.wifiSSID}</strong> ({restaurant.wifiPass})
                  </p>
                )}
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-4">
              Tip: Print this card on cardstock for each table in your dining room.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};


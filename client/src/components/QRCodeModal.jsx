import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Smartphone } from 'lucide-react';

export default function QRCodeModal({
  isOpen,
  onClose,
  presentation,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?view=audience&room=${presentation?.code || 'IMSPRESENTATION'}`
    : `https://imspresentation.onrender.com/?view=audience&room=${presentation?.code || 'IMSPRESENTATION'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full border border-purple-100 shadow-2xl p-6 text-center space-y-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Smartphone size={14} />
            <span>Scan to Join Presentation</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {presentation?.title || "Live Presentation"}
          </h3>
        </div>

        {/* QR Code Canvas */}
        <div className="p-4 bg-white rounded-2xl border-2 border-purple-200 shadow-inner flex items-center justify-center mx-auto w-fit">
          <QRCodeSVG
            value={joinUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
            level="Q"
            includeMargin={true}
          />
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Room Code:</span>
          <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-mono font-extrabold text-sm tracking-widest shadow-xs">
            #{presentation?.code || "IMSPRESENTATION"}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Point your smartphone camera at the QR code to open the live interactive voting & Q&A screen.
        </p>

        {/* Direct Link Copy */}
        <div className="pt-1 flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={joinUrl}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-mono select-all truncate outline-hidden"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center space-x-1 shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

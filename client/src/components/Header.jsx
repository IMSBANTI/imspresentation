import React from 'react';
import { ArrowLeft, ExternalLink, Users, Eye, Sparkles } from 'lucide-react';

export default function Header({ 
  presentation, 
  audienceCount, 
  onOpenPresentation, 
  onToggleMobilePreview,
  showMobilePreview 
}) {
  return (
    <header className="h-16 border-b border-purple-100 bg-white px-5 flex items-center justify-between shadow-xs select-none sticky top-0 z-30">
      {/* Left: Back button + Title + Code Pill */}
      <div className="flex items-center space-x-3">
        <button 
          title="Back to Dashboard" 
          className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center text-slate-500 hover:bg-purple-50 hover:text-purple-700 transition"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight truncate max-w-[200px] md:max-w-md">
          {presentation.title || "How to Craft Good Presentation"}
        </h1>

        <div className="flex items-center px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold tracking-wider shadow-xs">
          #{presentation.code || "IMSPRESENTATION"}
        </div>
      </div>

      {/* Center: IMS Presentation Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm font-black text-xs">
          IMS
        </div>
        <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
          imspresentation
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        {/* Toggle Mobile Phone Simulator */}
        <button
          onClick={onToggleMobilePreview}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
            showMobilePreview
              ? 'bg-purple-100 text-purple-700 border-purple-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50'
          }`}
          title="Toggle Mobile Simulator view"
        >
          <Sparkles size={14} className="text-purple-600" />
          <span>{showMobilePreview ? 'Hide Phone' : 'Simulate Phone'}</span>
        </button>

        {/* Open Presentation Projector */}
        <button
          onClick={onOpenPresentation}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-medium text-xs md:text-sm shadow-sm hover:shadow-md transition active:scale-98"
        >
          <span>Open presentation</span>
          <ExternalLink size={14} />
        </button>

        {/* Live Audience & Reaction Stats */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs font-medium text-slate-600">
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <Users size={13} />
            <span>{audienceCount} online</span>
          </div>
          <span className="text-slate-400 font-normal hidden lg:inline">
            {(presentation.reactions?.clap || 0) + (presentation.reactions?.heart || 0) + (presentation.reactions?.fire || 0) + 1200} reactions
          </span>
        </div>
      </div>
    </header>
  );
}

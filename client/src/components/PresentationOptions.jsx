import React, { useState } from 'react';
import { Sliders, Lock, HelpCircle, Palette, Check, Sparkles, Layers, Sun, Moon } from 'lucide-react';
import { LIGHT_THEMES, DARK_THEMES, resolveSlideBackground } from '../utils/themeUtils';

export default function PresentationOptions({
  options,
  onToggleOption,
  currentSlide,
  onChangeBackground
}) {
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark'
  const [customBg, setCustomBg] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const currentBg = currentSlide?.background || 'cosmic';
  const resolved = resolveSlideBackground(currentBg);
  const activeList = themeMode === 'light' ? LIGHT_THEMES : DARK_THEMES;

  const handleSelectPreset = (presetId, applyToAll = false) => {
    if (onChangeBackground) {
      onChangeBackground(presetId, applyToAll);
      setSuccessMsg(applyToAll ? 'Applied to all slides!' : 'Background updated!');
      setTimeout(() => setSuccessMsg(''), 2200);
    }
  };

  const handleApplyCustom = (applyToAll = false) => {
    if (!customBg.trim()) return;
    if (onChangeBackground) {
      onChangeBackground(customBg.trim(), applyToAll);
      setSuccessMsg(applyToAll ? 'Custom background applied to all!' : 'Custom background applied!');
      setTimeout(() => setSuccessMsg(''), 2200);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs space-y-4">
      {/* 1. Slide & Presentation Background Theme */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Palette size={13} className="text-purple-600" />
            <span>Slide Background Theme</span>
          </div>
          {successMsg && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-fadeIn">
              {successMsg}
            </span>
          )}
        </div>

        {/* Light vs Dark Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl mb-2.5">
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              themeMode === 'light'
                ? 'bg-white text-purple-700 shadow-xs ring-1 ring-purple-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sun size={13} className={themeMode === 'light' ? 'text-amber-500' : 'text-slate-400'} />
            <span>Light Colors</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-bold">8</span>
          </button>

          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              themeMode === 'dark'
                ? 'bg-white text-purple-700 shadow-xs ring-1 ring-purple-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Moon size={13} className={themeMode === 'dark' ? 'text-indigo-500' : 'text-slate-400'} />
            <span>Dark Colors</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">8</span>
          </button>
        </div>

        {/* Theme Color Palette Grid */}
        <div className="grid grid-cols-4 gap-2 mb-2.5">
          {activeList.map((preset) => {
            const isSelected = 
              currentBg === preset.id || 
              currentBg === preset.className || 
              (currentBg.includes(preset.id));

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id, false)}
                className={`group relative h-10 rounded-xl overflow-hidden border transition transform active:scale-95 flex items-center justify-center ${
                  isSelected 
                    ? 'border-purple-600 ring-2 ring-purple-600/40 shadow-sm' 
                    : 'border-slate-200 hover:border-purple-400 hover:shadow-xs'
                }`}
                style={{ background: preset.preview }}
                title={preset.name}
              >
                {isSelected && (
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shadow-xs ${
                    preset.isLight ? 'bg-purple-600 text-white' : 'bg-white text-purple-700'
                  }`}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 backdrop-blur-xs text-[8px] text-white font-medium truncate px-1 py-0.2 text-center opacity-0 group-hover:opacity-100 transition">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Background Action Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => handleSelectPreset(currentBg, true)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold transition flex items-center justify-center space-x-1"
            title="Apply current slide theme to all slides in this deck"
          >
            <Layers size={12} />
            <span>Apply to All Slides</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium transition"
          >
            Custom...
          </button>
        </div>

        {/* Custom CSS Color / Hex / Gradient input */}
        {showCustomInput && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Custom Hex or CSS Gradient
            </span>
            <div className="flex space-x-1.5">
              <input
                type="text"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                placeholder="e.g. #f8fafc or linear-gradient(...)"
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 outline-hidden font-mono"
              />
              <button
                type="button"
                onClick={() => handleApplyCustom(false)}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg transition"
              >
                Apply
              </button>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Supports hex colors (#ffffff) or CSS gradients</span>
              <button
                type="button"
                onClick={() => handleApplyCustom(true)}
                className="text-purple-600 hover:underline font-bold"
              >
                Apply to All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interaction options */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <Sliders size={13} className="text-purple-600" />
          <span>Interaction options</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/60">
          <span className="text-xs font-semibold text-slate-700">
            Show results on presentation
          </span>
          <button
            type="button"
            onClick={() => onToggleOption('showResultsOnPresentation', !options.showResultsOnPresentation)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              options.showResultsOnPresentation ? 'bg-purple-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                options.showResultsOnPresentation ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Presentation options */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <HelpCircle size={13} className="text-purple-600" />
          <span>Presentation options</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/60">
            <span className="text-xs font-semibold text-slate-700">
              Show instructions to join
            </span>
            <button
              type="button"
              onClick={() => onToggleOption('showInstructionsToJoin', !options.showInstructionsToJoin)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                options.showInstructionsToJoin ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  options.showInstructionsToJoin ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-600 flex items-center space-x-1">
              <Lock size={12} className="text-slate-400" />
              <span>Lock incoming responses</span>
            </span>
            <button
              type="button"
              onClick={() => onToggleOption('lockResponses', !options.lockResponses)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                options.lockResponses ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  options.lockResponses ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

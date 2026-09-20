import React from 'react';
import { Sliders, Lock, HelpCircle } from 'lucide-react';

export default function PresentationOptions({
  options,
  onToggleOption,
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs space-y-4">
      {/* Interaction options */}
      <div>
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

      {/* Presentation options */}
      <div>
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

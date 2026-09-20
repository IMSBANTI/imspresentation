import React from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  BarChart2, 
  Mic, 
  FileText, 
  PlaySquare, 
  ShieldCheck, 
  LineChart 
} from 'lucide-react';

export default function RightFeaturesMenu({ 
  activeFeature, 
  onSelectFeature,
  isListening,
  onToggleTranscription
}) {
  const menuItems = [
    { id: 'qa', label: 'Q&A', icon: MessageSquare, color: 'text-purple-600' },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, color: 'text-purple-600' },
    { id: 'polls', label: 'Polls', icon: BarChart2, color: 'text-purple-600' },
    { 
      id: 'transcription', 
      label: 'Real-time Transcription', 
      icon: Mic, 
      color: isListening ? 'text-red-500 animate-pulse' : 'text-purple-600',
      badge: isListening ? 'LIVE' : null 
    },
    { id: 'forms', label: 'Forms', icon: FileText, color: 'text-purple-600' },
    { id: 'webcontent', label: 'Web Content', icon: PlaySquare, color: 'text-purple-600' },
    { id: 'moderation', label: 'Moderation Tools', icon: ShieldCheck, color: 'text-purple-600' },
    { id: 'reports', label: 'Reports', icon: LineChart, color: 'text-purple-600' },
  ];

  return (
    <div className="w-56 shrink-0 flex flex-col space-y-2 select-none">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeFeature === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'transcription') {
                onToggleTranscription();
              }
              onSelectFeature(item.id);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition text-left border ${
              isActive
                ? 'bg-gradient-to-r from-purple-50 to-indigo-50/50 border-purple-200 text-purple-900 shadow-xs'
                : 'bg-white hover:bg-slate-50/80 border-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon size={17} className={item.color} />
              <span className="text-xs font-semibold tracking-tight">
                {item.label}
              </span>
            </div>

            {item.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold text-[9px] uppercase tracking-wider">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

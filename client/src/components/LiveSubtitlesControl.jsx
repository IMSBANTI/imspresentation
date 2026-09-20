import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw } from 'lucide-react';

export default function LiveSubtitlesControl({
  isListening,
  onToggleListening,
  currentTranscript,
  onSendTranscript,
}) {
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimText(interim);
        onSendTranscript(interim, false);
      }

      if (finalTranscript) {
        setInterimText('');
        onSendTranscript(finalTranscript, true);
      }
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition warning:', err.error);
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isListening]);

  // Demo simulate speech for testing without microphone permission
  const simulatePhrases = [
    "Welcome to today's interactive session! We're excited to see your responses live.",
    "Notice how audience engagement jumps by 70% when live polls are incorporated.",
    "Feel free to submit your questions anonymously in the Q&A tab right from your phone.",
    "Let's move on to the next slide to check the knowledge quiz!",
    "Real-time subtitles make your presentation accessible to every single participant.",
  ];

  const handleSimulateSpeech = () => {
    const randomPhrase = simulatePhrases[Math.floor(Math.random() * simulatePhrases.length)];
    onSendTranscript(randomPhrase, true);
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-700'}`}>
            {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">
              Live Subtitles & Voice
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {isListening ? 'Streaming spoken words' : 'Microphone inactive'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleListening}
          className={`shrink-0 px-2.5 py-1.5 rounded-full text-xs font-semibold transition shadow-xs ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isListening ? 'Stop' : 'Start Mic'}
        </button>
      </div>

      {/* Audio waves animation when active */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1.5 py-1 bg-red-50 rounded-lg">
          <div className="w-1 bg-red-500 rounded-full wave-bar-1"></div>
          <div className="w-1 bg-red-500 rounded-full wave-bar-2"></div>
          <div className="w-1 bg-red-500 rounded-full wave-bar-3"></div>
          <div className="w-1 bg-red-500 rounded-full wave-bar-4"></div>
          <span className="text-[11px] font-semibold text-red-700 ml-2">
            Listening for voice in real time...
          </span>
        </div>
      )}

      {/* Current subtitle display */}
      <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-mono min-h-[48px] flex items-center justify-between">
        <span className="text-purple-200 line-clamp-2">
          {interimText || currentTranscript?.text || "(No speech detected yet. Speak into mic or use simulator)"}
        </span>
        <button
          onClick={handleSimulateSpeech}
          className="ml-2 shrink-0 px-2 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-sans font-medium flex items-center space-x-1"
          title="Simulate speech sample"
        >
          <Sparkles size={11} />
          <span>Simulate</span>
        </button>
      </div>
    </div>
  );
}

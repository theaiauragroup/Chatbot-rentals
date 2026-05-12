'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, Image as ImageIcon, StopCircle, ChevronDown, Sparkles, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'voice' | 'image';
  audioUrl?: string;
  duration?: number;
  imageUrl?: string;
  timestamp: Date;
  id: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  webhookUrl?: string;
  brandName?: string;
  welcomeMessage?: string;
}

export default function ChatWidget({ 
  isOpen, 
  onToggle,
  webhookUrl = 'https://n8n.srv1147675.hstgr.cloud/webhook/chatbot(2.0)',
  brandName = 'AIAURA Fleet',
  welcomeMessage = 'Welcome! How can I assist you with luxury vehicles today?'
}: ChatWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: welcomeMessage, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const restored: Message[] = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
      } catch {
        // Fallback to welcome message already in state
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) {
      const toSave = messages.map(m => ({ ...m, audioUrl: undefined }));
      localStorage.setItem('chatMessages', JSON.stringify(toSave));
    }
  }, [messages]);

  const sendMessage = async (content: string, audio?: string, audioType?: string, duration?: number, image?: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: audioType === 'voice' ? `[Voice Message - ${duration}s]` : content,
      type: audioType === 'voice' ? 'voice' : image ? 'image' : 'text',
      audioUrl: audio,
      duration,
      imageUrl: image,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const payload: Record<string, unknown> = {
        message: content,
        userId,
        history,
        timestamp: new Date().toISOString()
      };

      if (audio) {
        payload.audio = audio;
        payload.audioType = audioType;
        payload.duration = duration;
      }

      if (image) {
        payload.image = image;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const reply = data.reply || data.message || data.output || data.text || 'I apologize, but I encountered an error. Please try again.';
      
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_bot`,
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inputValue.trim() || selectedImage) { sendMessage(inputValue.trim() || 'Sent an image', undefined, undefined, undefined, selectedImage || undefined); } } };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setSelectedImage(reader.result as string);
    } else if (file) {
      alert('Image must be less than 5MB');
    }
  };

  const removeImage = () => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendMessage(`[Voice Message - ${recordingSeconds}s]`, base64Audio, 'voice', recordingSeconds);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingSeconds >= 1) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  function formatDuration(secs: number) { const m = Math.floor(secs / 60); const s = secs % 60; return `${m}:${s.toString().padStart(2, '0')}`; }

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.button
          key="trigger"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={onToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-5 right-5 w-16 h-16 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center z-50 border border-white/20 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
        </motion.button>
      ) : (
        <motion.div
          key="widget"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 md:inset-auto md:bottom-5 md:right-5 md:w-[380px] md:h-[620px] md:max-h-[85vh] bg-white md:rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col z-50 overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="relative bg-white/80 backdrop-blur-md border-b border-gray-100/50 px-6 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-5 md:pt-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold text-xs">
                  {brandName.substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-none tracking-tight">
                  {brandName}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1.5 flex items-center gap-1.5">
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onToggle} className="hidden md:flex text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-colors">
                <ChevronDown className="w-5 h-5" />
              </button>
              <button onClick={onToggle} className="text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30 overscroll-contain scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div 
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`
                      px-4 py-3.5 rounded-2xl shadow-sm text-gray-800
                      ${message.role === 'user' 
                        ? 'bg-accent text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 rounded-tl-none'
                      }
                    `}>
                      {message.type === 'voice' && message.audioUrl ? (
                        <VoicePlayer audioUrl={message.audioUrl} duration={message.duration || 0} role={message.role} />
                      ) : message.type === 'image' && message.imageUrl ? (
                        <div className="rounded-xl overflow-hidden shadow-sm">
                          <img src={message.imageUrl} alt="Shared" className="max-w-full h-auto cursor-pointer hover:brightness-95 transition-all" onClick={() => window.open(message.imageUrl, '_blank')} />
                          {message.content !== 'Sent an image' && <p className={`text-[13px] mt-2 ${message.role === 'user' ? 'text-white' : ''}`}>{message.content}</p>}
                        </div>
                      ) : (
                        <div className={`text-[13px] leading-relaxed ${message.role === 'user' ? 'text-white' : ''}`}>
                          {message.role === 'assistant' ? (
                            <div className="markdown-content">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-50">
                      <span className="text-[10px] font-medium tracking-tight">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.role === 'user' && (
                        <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex space-x-1.5 shadow-sm">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] md:pb-6 bg-white border-t border-gray-100 shrink-0">
            {selectedImage && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-24 w-24 object-cover rounded-2xl shadow-lg border-2 border-white" />
                <button onClick={removeImage} className="absolute -top-2.5 -right-2.5 bg-gray-900 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            <div className={`
              flex items-center gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-200/50 transition-all duration-300
              ${isRecording ? 'ring-4 ring-accent/10 border-accent/20 bg-white' : 'focus-within:bg-white'}
            `}>
              <button 
                onClick={isRecording ? stopRecording : startRecording} 
                className={`flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-300 ${isRecording ? 'bg-gradient-to-br from-accent to-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'text-gray-400 hover:text-accent hover:bg-white hover:shadow-sm'}`}
                title={isRecording ? "Stop Recording" : "Voice Message"}
              >
                {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {isRecording ? (
                  <div className="flex-1 flex items-center gap-1.5 px-1">
                    {[...Array(12)].map((_, i) => (
                      <motion.div key={i} animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }} className="w-1 bg-gradient-to-b from-accent to-blue-300 rounded-full" />
                    ))}
                    <span className="text-[12px] font-bold text-accent ml-2 tabular-nums">{formatDuration(recordingSeconds)}</span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyPress={handleKeyPress} 
                    placeholder="Write a message..." 
                    className="flex-1 bg-transparent text-[14px] font-medium focus:outline-none py-2 px-1 text-gray-800 placeholder:text-gray-400" 
                  />
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-accent hover:bg-white rounded-lg transition-all" title="Attach Image"><ImageIcon className="size-5" /></button>
                <button 
                  onClick={() => { if (inputValue.trim() || selectedImage) { sendMessage(inputValue.trim() || 'Sent an image', undefined, undefined, undefined, selectedImage || undefined); } }} 
                  disabled={isLoading || (!isRecording && !inputValue.trim() && !selectedImage)} 
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${(isLoading || (!isRecording && !inputValue.trim() && !selectedImage)) ? 'text-gray-200' : 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover active:scale-95'}`}
                  title="Send Message"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VoicePlayer({ audioUrl, duration, role }: { audioUrl: string; duration: number; role: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); } 
      else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`flex items-center gap-3 min-w-[220px] py-1 ${role === 'user' ? 'text-white' : 'text-gray-800'}`}>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
      <button onClick={togglePlay} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${role === 'user' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-accent/10 hover:bg-accent/20 text-accent'}`}>
        {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
      </button>
      <div className="flex-1 flex items-end gap-0.5 h-6 px-1">
        {[40, 70, 50, 85, 60, 90, 45, 75, 55, 80, 50, 65, 40, 70, 55].map((h, i) => (
          <div key={i} className={`flex-1 rounded-full ${role === 'user' ? 'bg-white/40' : 'bg-accent/20'}`} style={{ height: `${h}%` }}></div>
        ))}
      </div>
      <span className="text-[10px] font-bold tabular-nums opacity-60">{Math.floor(duration)}s</span>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, Image as ImageIcon, StopCircle } from 'lucide-react';

// ─── Message content parser ───────────────────────────────────────────────────
type Segment =
  | { type: 'text';  value: string }
  | { type: 'bold';  value: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'link';  href: string; label: string }
  | { type: 'br' };

function isImageUrl(url: string): boolean {
  if (/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)(\?.*)?$/i.test(url)) return true;
  if (/images\.unsplash\.com\/(photo|profile)-/i.test(url)) return true;
  if (/images\.pexels\.com\/photos\//i.test(url)) return true;
  if (/lh[0-9]+\.googleusercontent\.com\//i.test(url)) return true;
  if (/drive\.google\.com\/uc\?/i.test(url)) return true;
  if (/cdn\.pixabay\.com\/photo\//i.test(url)) return true;
  if (/img\.freepik\.com\//i.test(url)) return true;
  if (/res\.cloudinary\.com\//i.test(url)) return true;
  if (/i\.imgur\.com\//i.test(url)) return true;
  return false;
}

function parseMessage(raw: string): Segment[] {
  if (!raw) return [];
  const segments: Segment[] = [];
  const TOKEN = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s,)>"]+)|\*\*(.+?)\*\*|\n/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
    }
    const [full, mdImgAlt, mdImgUrl, mdLinkLabel, mdLinkUrl, bareUrl, boldText] = match;
    if (mdImgUrl) {
      segments.push({ type: 'image', src: mdImgUrl, alt: mdImgAlt || 'Car image' });
    } else if (mdLinkUrl) {
      if (isImageUrl(mdLinkUrl)) {
        segments.push({ type: 'image', src: mdLinkUrl, alt: mdLinkLabel || 'Car image' });
      } else {
        segments.push({ type: 'link', href: mdLinkUrl, label: mdLinkLabel });
      }
    } else if (bareUrl) {
      if (isImageUrl(bareUrl)) {
        segments.push({ type: 'image', src: bareUrl, alt: 'Car image' });
      } else {
        segments.push({ type: 'link', href: bareUrl, label: bareUrl });
      }
    } else if (boldText) {
      segments.push({ type: 'bold', value: boldText });
    } else if (full === '\n') {
      segments.push({ type: 'br' });
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < raw.length) {
    segments.push({ type: 'text', value: raw.slice(lastIndex) });
  }
  return segments;
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const segments = parseMessage(content);
  return (
    <span className="text-xs leading-relaxed">
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'text': return <span key={i}>{seg.value}</span>;
          case 'bold': return <strong key={i}>{seg.value}</strong>;
          case 'br': return <br key={i} />;
          case 'image': return (
            <img
              key={i}
              src={seg.src}
              alt={seg.alt}
              className="rounded-xl mt-2 mb-1 block cursor-pointer hover:opacity-90 transition-opacity"
              style={{ width: '100%', maxWidth: '260px' }}
              loading="lazy"
              onClick={() => window.open(seg.src, '_blank')}
            />
          );
          case 'link': return (
            <a
              key={i}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${isUser ? 'text-accent' : 'text-accent'}`}
            >
              {seg.label}
            </a>
          );
          default: return null;
        }
      })}
    </span>
  );
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  image?: string;
  audio?: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    let sid = localStorage.getItem('chatSessionId');
    let startedAt = localStorage.getItem('chatStartedAt');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      startedAt = new Date().toISOString();
      localStorage.setItem('chatSessionId', sid);
      localStorage.setItem('chatStartedAt', startedAt);
    }
    setSessionId(sid);

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
        setWelcome();
      }
    } else {
      setWelcome();
    }
  }, []);

  function setWelcome() {
    setMessages([{
      id: 'welcome',
      role: 'bot',
      content: 'Hello! Welcome to DriveEasy Car Rentals. I\'m Rayan — happy to help you find the perfect vehicle. What are you looking for today?',
      timestamp: new Date(),
    }]);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) {
      const toSave = messages.map(m => ({ ...m, audio: undefined }));
      localStorage.setItem('chatMessages', JSON.stringify(toSave));
    }
  }, [messages]);

  const sendToN8n = async (textContent: string, audioBase64?: string, imageBase64?: string): Promise<string> => {
    const payload = {
      sessionId,
      startedAt: localStorage.getItem('chatStartedAt') || new Date().toISOString(),
      message: textContent,
      history: [],
      hasAudio: !!audioBase64,
      audioData: audioBase64 || '',
      hasImage: !!imageBase64,
      imageData: imageBase64 || '',
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),
      }
    };
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data.reply || data.message || data.output || data.text || 'I apologize, I had trouble responding.';
  };

  const sendMessage = async () => {
    if (isRecording) { stopRecording(); return; }
    if ((!inputValue.trim() && !selectedImage) || isLoading || !sessionId) return;
    const textContent = inputValue.trim();
    const imgBase64 = imagePreview || undefined;
    const userMessage: Message = { id: `msg_${Date.now()}`, role: 'user', content: textContent || (imgBase64 ? '[Image]' : ''), timestamp: new Date(), image: imgBase64 };
    setMessages(prev => [...prev, userMessage]);
    setInputValue(''); setSelectedImage(null); setImagePreview(null); setIsLoading(true);
    try {
      const botText = await sendToN8n(textContent, undefined, imgBase64);
      const botMessage: Message = { id: `msg_${Date.now()}_bot`, role: 'bot', content: botText, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { id: `msg_${Date.now()}_error`, role: 'bot', content: 'I\'m having a bit of trouble. Please try again.', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setRecordingSeconds(0); setIsRecording(false);
        const chunks = [...audioChunksRef.current]; audioChunksRef.current = [];
        if (chunks.length === 0) return;
        const audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const voiceMsgId = `msg_${Date.now()}`;
        setMessages(prev => [...prev, { id: voiceMsgId, role: 'user', content: 'Voice message', timestamp: new Date(), audio: audioUrl }]);
        setIsLoading(true);
        try {
          const audioBase64 = await new Promise<string>((res, rej) => {
            const r = new FileReader(); r.onloadend = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(audioBlob);
          });
          const botText = await sendToN8n('[Voice message]', audioBase64);
          setMessages(prev => [...prev, { id: `${voiceMsgId}_bot`, role: 'bot', content: botText, timestamp: new Date() }]);
        } catch {
          setMessages(prev => [...prev, { id: `${voiceMsgId}_err`, role: 'bot', content: 'Processing error. Try typing.', timestamp: new Date() }]);
        } finally { setIsLoading(false); }
      };
      mediaRecorder.start(250); setIsRecording(true); setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch { alert('Mic access denied.'); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); };

  function formatDuration(secs: number) { const m = Math.floor(secs / 60); const s = secs % 60; return `${m}:${s.toString().padStart(2, '0')}`; }

  if (!mounted) return null;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-5 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center z-50 border border-white/20"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-5 md:right-5 md:w-[360px] md:h-[600px] md:max-h-[80vh] bg-white md:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 md:pt-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-bold text-sm text-gray-800 leading-none">{process.env.NEXT_PUBLIC_BUSINESS_NAME || 'DriveEasy Car Rentals'}</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Online Assistant</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggle} className="hidden md:flex text-gray-400 p-1.5 hover:text-gray-600 active:scale-90 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
          <button onClick={onToggle} className="text-gray-400 p-2 hover:text-gray-600 active:scale-90 transition-transform"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 bg-white overscroll-contain scroll-smooth">
        {messages.map((message) => (
          <div key={message.id} className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-gray-100 text-gray-800 rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                {message.audio ? (
                  <div className="flex flex-col gap-2 min-w-[210px] py-1">
                    <div className="flex items-center gap-2 px-1"><Mic className="size-3 text-accent" /><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Voice Note</span></div>
                    <audio controls src={message.audio} className="h-9 w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {message.image && <div className="rounded-lg mb-1 overflow-hidden shadow-sm"><img src={message.image} alt="Uploaded" className="max-w-full h-auto cursor-pointer" onClick={() => window.open(message.image, '_blank')} /></div>}
                    <div className="text-[13px] leading-relaxed"><MessageContent content={message.content} isUser={message.role === 'user'} /></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {message.role === 'user' && <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start"><div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex space-x-1.5 shadow-sm"><div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce" /></div></div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:pb-4 bg-white border-t border-gray-100 shrink-0">
        {imagePreview && (
          <div className="mb-3 relative inline-block group">
            <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl shadow-md border-2 border-white" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        <div className={`flex items-center gap-2 bg-gray-50/80 p-2 rounded-2xl border border-gray-200/50 transition-all ${isRecording ? 'ring-2 ring-red-100' : ''}`}>
          <button 
            onClick={isRecording ? stopRecording : startRecording} 
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'text-gray-400 hover:text-accent hover:bg-white hover:shadow-sm'}`}
            title={isRecording ? "Stop Recording" : "Voice Message"}
          >
            {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder={isRecording ? `Recording... ${formatDuration(recordingSeconds)}` : "Type a message..."} 
            className="flex-1 bg-transparent text-[14px] font-medium focus:outline-none py-2 px-1 text-gray-800 placeholder:text-gray-400" 
          />
          
          <div className="flex items-center gap-0.5">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-accent hover:bg-white rounded-xl transition-all"
              title="Attach Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={sendMessage} 
              disabled={isLoading || (!isRecording && !inputValue.trim() && !selectedImage)} 
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${(!inputValue.trim() && !selectedImage) ? 'text-gray-200' : 'text-accent hover:bg-white shadow-sm'}`}
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

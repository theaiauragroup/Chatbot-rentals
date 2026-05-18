'use client';

import { useState, useEffect, useRef, memo, useCallback, useMemo, useLayoutEffect } from 'react';
import { MessageCircle, X, Send, Mic, StopCircle, ChevronDown, Play, Pause, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'voice' | 'image';
  audioUrl?: string;
  duration?: number;
  imageUrl?: string;
  imageUrls?: string[];
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

// --- OPTIMIZED SUB-COMPONENTS ---

const ChatImage = memo(({ src, alt, messageId }: { src: string; alt: string; messageId: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const optimizedUrl = useMemo(() => {
    if (src.includes('unsplash.com')) {
      try {
        const urlObj = new URL(src);
        urlObj.searchParams.set('w', '800');
        urlObj.searchParams.set('q', '85');
        urlObj.searchParams.set('fm', 'webp');
        urlObj.searchParams.set('fit', 'max');
        return urlObj.toString();
      } catch { return src; }
    }
    return src;
  }, [src]);

  return (
    <div className="relative min-h-[200px] w-full flex items-center justify-center overflow-hidden bg-black/[0.03] rounded-xl transition-all duration-300">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-black/10 border-t-black/40 rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="p-6 text-center">
          <p className="text-[11px] text-black/40 font-medium mb-2">Image unavailable</p>
          <p className="text-[9px] text-black/25 font-mono break-all px-4">{src.substring(0, 50)}...</p>
        </div>
      ) : (
        <img
          src={optimizedUrl}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          onClick={() => window.open(src, '_blank')}
          className={`max-w-full h-auto block cursor-pointer transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}
          style={{ maxHeight: '420px', objectFit: 'contain' }}
          loading="lazy"
        />
      )}
    </div>
  );
});
ChatImage.displayName = 'ChatImage';

const MessageItem = memo(({ message, isGrouped }: { message: Message; isGrouped: boolean }) => {
  const isUser = message.role === 'user';
  
  const markdownComponents = useMemo(() => ({
    p: ({ children }: any) => <div className="mb-2 last:mb-0">{children}</div>,
    img: ({ src, alt }: any) => (
      <div className="cw-image-wrapper my-3 -mx-1">
        <ChatImage src={src || ''} alt={alt || ''} messageId={message.id} />
      </div>
    ),
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition-colors">
        {children}
      </a>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="cw-ol" {...props}>{children}</ol>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="cw-ul" {...props}>{children}</ul>
    ),
    li: ({ children, ordered, ...props }: any) => (
      <li className={ordered ? 'cw-li cw-vehicle-li' : 'cw-li'} {...props}>{children}</li>
    )
  }), [message.id]);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-[20px]"
          style={
            isUser
              ? {
                background: '#2563EB',
                color: '#fff',
                borderBottomRightRadius: 6,
                boxShadow: '0 2px 4px rgba(37,99,235,0.15)'
              }
              : {
                background: '#fff',
                color: '#000',
                borderBottomLeftRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'
              }
          }
        >
          {message.type === 'voice' && message.audioUrl ? (
            <VoicePlayer
              audioUrl={message.audioUrl}
              duration={message.duration || 0}
              role={message.role}
            />
          ) : (message.type === 'image' && isUser) ? (
            <div className="space-y-3 -mx-1 -my-0.5">
              <div className="flex flex-col gap-2">
                {message.imageUrls && message.imageUrls.length > 0 ? (
                  message.imageUrls.map((url, i) => (
                    <ChatImage key={i} src={url} alt={`Image ${i + 1}`} messageId={message.id} />
                  ))
                ) : (message.imageUrl || message.audioUrl) ? (
                  <ChatImage src={message.imageUrl || message.audioUrl || ''} alt="Uploaded image" messageId={message.id} />
                ) : null}
              </div>
              {message.content && message.content !== '[Image Message]' && (
                <div className={`text-[14px] leading-[1.5] px-1 ${isUser ? 'text-white' : 'text-black'}`}>
                  {message.content}
                </div>
              )}
            </div>
          ) : (
            <div className={`text-[14px] leading-[1.5] ${isUser ? 'text-white' : 'text-black'}`}>
              {message.role === 'assistant' ? (
                <div className="cw-md">
                  <ReactMarkdown components={markdownComponents}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          )}
        </div>

        {!isGrouped && (
          <div className="flex items-center gap-1.5 mt-1.5 px-1.5">
            <span className="cw-mono text-[10px] text-black/30 tabular-nums">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isUser && (
              <svg className="w-[12px] h-[12px]" fill="none" stroke="#2563EB" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';

const MessageList = memo(({ messages, isLoading }: { messages: Message[], isLoading: boolean }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Immediate scroll on message count change or loading state change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Fallback scroll after a small delay for images/dynamic content
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    
    return () => clearTimeout(timer);
  }, [messages.length, isLoading]);

  return (
    <div
      className="cw-scroll flex-1 overflow-y-auto overscroll-contain px-4 md:px-5 py-6"
      style={{
        background: '#FAFAFA',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="flex flex-col">
        {messages.map((message, idx) => {
          const prev = messages[idx - 1];
          const isGrouped = prev && prev.role === message.role &&
            (message.timestamp.getTime() - prev.timestamp.getTime()) < 120000;
          
          return (
            <MessageItem 
              key={message.id} 
              message={message} 
              isGrouped={isGrouped} 
            />
          );
        })}

        {isLoading && (
          <div className="flex justify-start mt-4">
            <div
              className="rounded-[20px] px-4 py-3 bg-white flex items-center gap-1.5"
              style={{
                borderBottomLeftRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black/25" style={{ animation: 'cw-dot 1.4s ease-in-out infinite', animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-black/25" style={{ animation: 'cw-dot 1.4s ease-in-out infinite', animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-black/25" style={{ animation: 'cw-dot 1.4s ease-in-out infinite', animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>
    </div>
  );
});
MessageList.displayName = 'MessageList';

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
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      // 1. Check sessionStorage for an existing session in this browser tab/window
      const activeSessionId = sessionStorage.getItem('chat_session_id');
      if (activeSessionId) return activeSessionId;

      // 2. Generate a unique session ID for this new browser session
      // We use a random alphanumeric suffix to ensure uniqueness across all users
      // while keeping the 'AB-' prefix format.
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newId = `AB-${randomSuffix}`;
      
      sessionStorage.setItem('chat_session_id', newId);
      return newId;
    }
    return 'AB-000';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingDurationRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    // Restore messages from sessionStorage (persists across refreshes, but not across new sessions/tab closes)
    const savedMessages = sessionStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const restored: Message[] = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
      } catch {
        // Fallback to welcome message if parsing fails
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      // Persist messages within the current browser session
      const toSave = messages.map(m => ({ ...m, audioUrl: undefined }));
      sessionStorage.setItem('chatMessages', JSON.stringify(toSave));
    }
  }, [messages]);

  // FIXED: Robust URL sanitization for Unsplash and other image URLs
  const sanitizeImageUrls = (text: string): string => {
    // Pattern: ![alt](url) where url might be broken across lines or have spaces
    return text.replace(
      /!\[([^\]]*)\]\s*\(\s*([^)]+?)\s*\)/g,
      (match: string, alt: string, url: string) => {
        // Remove ALL whitespace characters (spaces, newlines, tabs, etc)
        const cleanUrl = url.replace(/\s+/g, '');

        // Validate it looks like a URL
        if (!cleanUrl || (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://'))) {
          return match; // Keep original if not valid
        }

        return `![${alt}](${cleanUrl})`;
      }
    );
  };

  // FIXED: Extract image URLs with better error handling - catches both ![alt](url) and [Image](url)
  const extractImageUrls = (text: string): string[] => {
    const urls: string[] = [];
    // Catch both ![alt](url) and [alt](url) if alt contains "Image" or URL is an image/unsplash
    const regex = /(?:!)?\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const alt = match[1].toLowerCase();
      const url = match[2].trim().replace(/\s+/g, '');
      
      const isImageAlt = alt.includes('image') || alt.includes('photo') || alt.includes('vehicle') || alt.includes('car');
      const isImageUrl = url.includes('unsplash.com') || url.match(/\.(jpg|jpeg|png|webp|gif|svg)/i);

      if (url && (url.startsWith('http://') || url.startsWith('https://')) && (isImageAlt || isImageUrl)) {
        urls.push(url);
      }
    }

    return urls;
  };

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
      const payload: Record<string, unknown> = {
        message: content,
        userId,
        sessionId: userId,
        timestamp: new Date().toISOString()
      };

      if (audio) {
        payload.audio = audio;
        payload.audioType = audioType;
        payload.duration = duration;
      }

      if (image) {
        payload.image = image;
        payload.imageType = 'image';
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || data.message || data.output || data.text || (typeof data === 'string' ? data : null) || 'I apologize, but I encountered an error. Please try again.';

      // 1. Comprehensive URL and Markdown Pre-processor
      // Catches raw URLs, markdown links, and images, and converts them to proper image tags.
      // Now handles multiple trailing parentheses aggressively.
      const preProcessedReply = reply.replace(/(?:!?\[([^\]]*)\]\s*\()?(\bhttps?:\/\/[^\s\)]+)(?:\s*\)+)?/gi, (match: string, alt: string, url: string) => {
        const cleanUrl = url.trim().replace(/\s+/g, '');
        const isImage = cleanUrl.includes('unsplash.com') || cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)/i);
        const altText = alt || 'Vehicle';
        const isImageAlt = (alt || '').toLowerCase().includes('image') || (alt || '').toLowerCase().includes('photo');
        
        if (isImage || isImageAlt) {
          return `![${altText}](${cleanUrl})`;
        }
        return match;
      });

      // 2. Super-Sanitizer: Repairs any remaining broken markdown and NUCLEARLY removes stray artifacts
      const sanitizedReply = preProcessedReply
        .replace(/(?:!)?\[([^\]]*)\][\s\n]*\(([^)]+)\)(?:\s*\))*/g, (match: string, alt: string, url: string) => {
          const cleanUrl = url.replace(/[\s\n\r\t]/g, '').trim();
          if (!cleanUrl) return match;
          const looksLikeImage = alt.toLowerCase().includes('image') || alt.toLowerCase().includes('photo') || cleanUrl.includes('unsplash.com') || cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)/i);
          return looksLikeImage ? `![${alt || 'Vehicle'}](${cleanUrl})` : match;
        })
        // Remove unnecessary wrapping parentheses: ( ![Image](url) ) -> ![Image](url)
        .replace(/\(\s*(!\[[^\]]*\]\([^)]+\))\s*\)/g, '$1')
        // Nuclear cleanup of stray brackets on their own lines or before text
        .split('\n')
        .map((line: string) => {
          const trimmed = line.trim();
          // Remove stray closing brackets/parens
          if (trimmed === ')' || trimmed === ']]' || trimmed === ']' || trimmed === '))') return '';
          // Remove the literal word "Image" or "Image:" used as a label by the webhook
          if (/^image\s*:?\s*$/i.test(trimmed)) return '';
          // Remove orphaned bracket artifacts like "![" or "![ " that are not full image tags
          if (/^!\[\s*$/.test(trimmed)) return '';
          return line;
        })
        .join('\n')
        .replace(/\n\s*\)\s*(?=\*\*|\w)/g, '\n')
        // Guarantee a blank line before every ordered list item (1. / 2. / etc)
        // so react-markdown always recognises them as <ol> items.
        .replace(/([^\n])(\n[ \t]*\d+\.[ \t]+)/g, '$1\n\n$2')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // ── Frontend numbering injection ──────────────────────────────────────
      let numbered = sanitizedReply;
      
      // 1. Strip out any existing manual numbers like "1)", "1.", "1)\n\n" that appear right before a Model line
      // This prevents double-numbering if the webhook already provides numbers.
      numbered = numbered.replace(
        /(^|\n)[ \t]*\d+[\.\)]\s*(?=[ \t]*(?:\*\*)*Model(?:\*\*)*\s*[:-])/gi, 
        '$1'
      );

      // 2. Inject **1)**, **2)** exclusively before Model lines
      let n = 1;
      numbered = numbered.replace(
        /(^|\n\n?)([ \t]*(?:\*\*)*Model(?:\*\*)*\s*[:-])/gi,
        (_m: string, sep: string, label: string) => `${sep}**${n++})** ${label}`
      );

      const extractedUrls = extractImageUrls(numbered);

      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_bot`,
        role: 'assistant',
        content: numbered,
        type: 'text',
        imageUrls: extractedUrls,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('❌ Send message error:', error);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() || selectedImage) {
        sendMessage(inputValue.trim() || '[Image Message]', undefined, undefined, undefined, selectedImage || undefined);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        e.target.value = '';
      };
    } else if (file) {
      alert('Image must be less than 5MB');
      e.target.value = '';
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const finalDuration = recordingDurationRef.current;

          sendMessage(`[Voice Message - ${finalDuration}s]`, base64Audio, 'voice', finalDuration);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingDurationRef.current = 0;
      recordingTimerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingSeconds(recordingDurationRef.current);
      }, 1000);
    } catch (err) {
      console.error('Recording start error:', err);
      alert('Microphone access denied or error starting recorder.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!mounted) return null;

  const hasInput = inputValue.trim().length > 0 || selectedImage;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .cw-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
        }
        .cw-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

        .cw-scroll::-webkit-scrollbar { width: 0px; }
        .cw-scroll { scrollbar-width: none; }

        .cw-input { font-size: 16px; }
        @media (min-width: 768px) { .cw-input { font-size: 14px; } }

        .cw-md p { margin: 0 0 0.4em 0; }
        .cw-md p:last-child { margin-bottom: 0; }
        .cw-md a { color: #2563EB; text-decoration: underline; text-underline-offset: 2px; }
        .cw-md strong { font-weight: 600; }
        
        /* ORDERED LIST */
        .cw-ol {
          list-style: none !important;
          padding: 0 !important;
          margin: 0.75em 0 !important;
          display: block !important;
          counter-reset: vehicle-counter;
        }

        /* Each vehicle entry */
        .cw-vehicle-li {
          counter-increment: vehicle-counter;
          list-style: none !important;
          display: block !important;
          margin-bottom: 14px;
        }
        .cw-vehicle-li:last-child { margin-bottom: 0; }

        /* Simple plain bold number: 1, 2, 3 */
        .cw-vehicle-li::before {
          content: counter(vehicle-counter) ".";
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: #111;
          margin-bottom: 6px;
        }

        /* Nested bullet list (price / feature / image lines) */
        .cw-vehicle-li .cw-ul {
          list-style: none !important;
          padding: 0 0 0 4px !important;
          margin: 0 !important;
        }
        .cw-vehicle-li .cw-ul > .cw-li {
          display: flex !important;
          align-items: flex-start !important;
          gap: 6px;
          list-style: none !important;
          background: none !important;
          border: none !important;
          padding: 2px 0 !important;
          font-size: 13px;
          color: #374151;
        }
        /* Simple dash before text lines */
        .cw-vehicle-li .cw-ul > .cw-li:not(:has(.cw-image-wrapper))::before {
          content: '–';
          color: #555;
          font-size: 13px;
          line-height: 1.5;
          flex-shrink: 0;
        }
        /* Image li: no bullet, full width */
        .cw-vehicle-li .cw-ul > .cw-li:has(.cw-image-wrapper) {
          display: block !important;
          padding: 6px 0 0 0 !important;
        }
        .cw-vehicle-li .cw-ul > .cw-li:has(.cw-image-wrapper)::before {
          display: none !important;
        }

        .cw-md code {
          background: rgba(0,0,0,0.06);
          padding: 0.1em 0.3em;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.88em;
        }
        .cw-md pre {
          background: #000;
          color: #fff;
          padding: 0.7em;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.82em;
          margin: 0.4em 0;
        }

        /* NUCLEAR FIX: Prevent image flickering at CSS level */
        .cw-persistent-image {
          will-change: auto !important;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .cw-md pre code { background: transparent; padding: 0; color: inherit; }

        @keyframes cw-ping {
          0% { transform: scale(1); opacity: 0.45; }
          80%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes cw-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes cw-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="cw-root fixed z-50"
            style={{
              bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
              right: 'max(1.25rem, env(safe-area-inset-right))'
            }}
          >
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: '#2563EB', animation: 'cw-ping 2.5s cubic-bezier(0,0,0.2,1) infinite' }}
            />

            <motion.button
              onClick={onToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="relative w-14 h-14 rounded-full flex items-center justify-center bg-black text-white overflow-hidden"
              style={{
                boxShadow: '0 10px 30px -8px rgba(37,99,235,0.5), 0 4px 12px rgba(0,0,0,0.3)'
              }}
              aria-label="Open chat"
            >
              <MessageCircle className="w-[22px] h-[22px]" strokeWidth={1.75} />
              <span
                className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                style={{ background: '#2563EB', boxShadow: '0 0 6px #2563EB' }}
              />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="cw-root fixed inset-0 md:inset-auto md:bottom-5 md:right-5 md:w-[380px] md:h-[620px] md:max-h-[85vh] flex flex-col z-50 overflow-hidden bg-white md:rounded-2xl"
            style={{
              boxShadow: '0 25px 70px -15px rgba(0,0,0,0.3), 0 8px 25px -8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
            }}
          >
            <div
              className="relative shrink-0 bg-white border-b border-black/[0.06]"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: '#2563EB' }} />

              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-[11px] tracking-wider bg-black"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    >
                      {brandName.substring(0, 2).toUpperCase()}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: '#2563EB' }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[14px] text-black leading-tight tracking-tight truncate">
                      {brandName}
                    </h3>
                    <p className="text-[11px] text-black/45 leading-tight mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full" style={{ background: '#10D070' }} />
                      <span>Active now</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={onToggle}
                    className="hidden md:flex w-8 h-8 items-center justify-center rounded-full text-black/40 hover:text-black hover:bg-black/[0.04] transition-colors"
                    aria-label="Minimize"
                  >
                    <ChevronDown className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={onToggle}
                    className="w-9 h-9 md:w-8 md:h-8 flex items-center justify-center rounded-full text-black/40 hover:text-black hover:bg-black/[0.04] transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-[18px] h-[18px] md:w-4 md:h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>

            <MessageList messages={messages} isLoading={isLoading} />

            <div
              className="shrink-0 bg-white border-t border-black/[0.06] px-4 md:px-5"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.875rem)', paddingTop: '0.875rem' }}
            >
              <AnimatePresence>
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 10 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-xl"
                        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-black text-white hover:scale-110 active:scale-95 transition-transform"
                        aria-label="Remove image"
                      >
                        <X className="w-2.5 h-2.5" strokeWidth={3} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="flex items-center gap-1 transition-all duration-200"
                style={{
                  background: '#F4F4F5',
                  borderRadius: 24,
                  padding: 4,
                  border: isRecording ? '1px solid #2563EB' : '1px solid transparent',
                  boxShadow: isRecording ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none'
                }}
              >
                {!isRecording && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-black/45 hover:text-black hover:bg-white active:scale-95 transition-all"
                      aria-label="Attach image"
                    >
                      <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                  </>
                )}

                <div className="flex-1 min-w-0 flex items-center">
                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-2 px-2 h-9">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#EF4444', animation: 'cw-blink 1s ease-in-out infinite' }} />
                      <div className="flex-1 flex items-center justify-center gap-[2px] h-full">
                        {[...Array(22)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              height: [`${15 + Math.random() * 20}%`, `${50 + Math.random() * 45}%`, `${15 + Math.random() * 20}%`]
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6 + Math.random() * 0.3,
                              delay: i * 0.03,
                              ease: 'easeInOut'
                            }}
                            className="w-[2px] rounded-full"
                            style={{ background: '#2563EB' }}
                          />
                        ))}
                      </div>
                      <span className="cw-mono text-[11px] font-medium tabular-nums shrink-0" style={{ color: '#2563EB' }}>
                        {formatDuration(recordingSeconds)}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Message"
                      className="cw-input w-full bg-transparent text-black placeholder:text-black/35 focus:outline-none py-2 px-2"
                      autoComplete="off"
                      autoCorrect="off"
                    />
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  {!hasInput && (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90"
                      style={
                        isRecording
                          ? { background: '#2563EB', color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.4)' }
                          : { background: 'transparent', color: 'rgba(0,0,0,0.55)' }
                      }
                      aria-label={isRecording ? 'Stop recording' : 'Voice message'}
                    >
                      {isRecording
                        ? <StopCircle className="w-[18px] h-[18px]" strokeWidth={2} fill="currentColor" />
                        : <Mic className="w-[18px] h-[18px]" strokeWidth={2} />}
                    </button>
                  )}

                  <AnimatePresence>
                    {hasInput && !isRecording && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0, rotate: -90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 90 }}
                        transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                        onClick={() => {
                          if (inputValue.trim() || selectedImage) {
                            sendMessage(inputValue.trim() || '[Image Message]', undefined, undefined, undefined, selectedImage || undefined);
                          }
                        }}
                        disabled={isLoading}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-white transition-all active:scale-90 disabled:opacity-50"
                        style={{
                          background: '#2563EB',
                          boxShadow: '0 2px 8px rgba(37,99,235,0.35)'
                        }}
                        aria-label="Send message"
                      >
                        <Send className="w-[16px] h-[16px]" strokeWidth={2.25} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-center mt-2.5">
                <span className="cw-mono text-[9px] uppercase font-medium tracking-[0.18em] text-black/25">
                  Powered by {brandName}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const VoicePlayer = memo(function VoicePlayer({
  audioUrl,
  duration,
  role
}: {
  audioUrl: string;
  duration: number;
  role: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener('timeupdate', onTime);
    return () => audio.removeEventListener('timeupdate', onTime);
  }, []);

  const isUser = role === 'user';
  // Memoize bars to prevent re-creation on every render
  const bars = useMemo(() => [30, 55, 40, 70, 50, 80, 45, 65, 75, 55, 85, 50, 70, 60, 45, 75, 55, 65, 40, 50], []);

  return (
    <div className="flex items-center gap-2.5 min-w-[180px] py-0.5">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
      />

      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 transition-transform active:scale-90"
        style={
          isUser
            ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
            : { background: '#2563EB', color: '#fff' }
        }
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying
          ? <Pause size={12} strokeWidth={2.5} fill="currentColor" />
          : <Play size={12} strokeWidth={2.5} fill="currentColor" style={{ marginLeft: 1 }} />}
      </button>

      <div className="flex-1 flex items-center gap-[2px] h-5">
        {bars.map((h, i) => {
          const barProgress = (i / bars.length) * 100;
          const active = barProgress <= progress;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-150"
              style={{
                height: `${h}%`,
                background: isUser
                  ? (active ? '#fff' : 'rgba(255,255,255,0.4)')
                  : (active ? '#2563EB' : 'rgba(0,0,0,0.18)')
              }}
            />
          );
        })}
      </div>

      <span
        className="cw-mono text-[10px] font-medium tabular-nums shrink-0"
        style={{ color: isUser ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.5)' }}
      >
        {Math.floor(duration)}s
      </span>
    </div>
  );
});
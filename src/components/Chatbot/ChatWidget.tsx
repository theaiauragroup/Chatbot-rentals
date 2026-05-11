'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, Image as ImageIcon, StopCircle } from 'lucide-react';

// ─── Message content parser ───────────────────────────────────────────────────
// Parses a raw text string from n8n into typed segments.
// Each segment is rendered as a proper React element — no dangerouslySetInnerHTML,
// no string-based HTML injection, no escaping bugs.

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

  // Combined regex — order matters:
  // 1. Markdown image  ![alt](url)
  // 2. Markdown link   [label](url)
  // 3. Bare URL        https://...
  // 4. **bold**
  // 5. Newline
  const TOKEN = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s,)>"]+)|\*\*(.+?)\*\*|\n/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN.exec(raw)) !== null) {
    // Push any plain text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
    }

    const [full, mdImgAlt, mdImgUrl, mdLinkLabel, mdLinkUrl, bareUrl, boldText] = match;

    if (mdImgUrl) {
      // ![alt](url)
      segments.push({ type: 'image', src: mdImgUrl, alt: mdImgAlt || 'Car image' });
    } else if (mdLinkUrl) {
      // [label](url)
      if (isImageUrl(mdLinkUrl)) {
        segments.push({ type: 'image', src: mdLinkUrl, alt: mdLinkLabel || 'Car image' });
      } else {
        segments.push({ type: 'link', href: mdLinkUrl, label: mdLinkLabel });
      }
    } else if (bareUrl) {
      // https://...
      if (isImageUrl(bareUrl)) {
        segments.push({ type: 'image', src: bareUrl, alt: 'Car image' });
      } else {
        segments.push({ type: 'link', href: bareUrl, label: bareUrl });
      }
    } else if (boldText) {
      // **bold**
      segments.push({ type: 'bold', value: boldText });
    } else if (full === '\n') {
      segments.push({ type: 'br' });
    }

    lastIndex = match.index + full.length;
  }

  // Remaining plain text after last match
  if (lastIndex < raw.length) {
    segments.push({ type: 'text', value: raw.slice(lastIndex) });
  }

  return segments;
}

// Renders parsed segments as React elements — clean, no HTML string injection
function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const segments = parseMessage(content);

  return (
    <span className="text-xs leading-relaxed">
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'text':
            return <span key={i}>{seg.value}</span>;

          case 'bold':
            return <strong key={i}>{seg.value}</strong>;

          case 'br':
            return <br key={i} />;

          case 'image':
            return (
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

          case 'link':
            return (
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

          default:
            return null;
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

// History entry sent to n8n so the AI has full conversation context
interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
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
  // Keeps a clean history array (no audio blobs) to send to n8n
  const historyRef = useRef<HistoryEntry[]>([]);

  // Generate or retrieve session ID — NEVER changes for the life of the session
  useEffect(() => {
    let sid = localStorage.getItem('chatSessionId');
    let startedAt = localStorage.getItem('chatStartedAt');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      startedAt = new Date().toISOString();
      localStorage.setItem('chatSessionId', sid);
      localStorage.setItem('chatStartedAt', startedAt);
    }
    setSessionId(sid);

    // Restore chat messages from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const restored: Message[] = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
        // Rebuild history ref from saved messages (text only, skip audio/image)
        historyRef.current = restored
          .filter(m => m.id !== 'welcome' && !m.audio)
          .map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          }));
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist messages to localStorage (skip audio blobs — too large)
  useEffect(() => {
    if (messages.length > 1) {
      const toSave = messages.map(m => ({ ...m, audio: undefined }));
      localStorage.setItem('chatMessages', JSON.stringify(toSave));
    }
  }, [messages]);

  // ─── Shared send-to-n8n helper ────────────────────────────────────────────
  const sendToN8n = async (
    textContent: string,
    audioBase64?: string,
    imageBase64?: string,
  ): Promise<string> => {
    const payload = {
      sessionId,
      startedAt: typeof window !== 'undefined' ? localStorage.getItem('chatStartedAt') || new Date().toISOString() : new Date().toISOString(),
      message: textContent,
      history: historyRef.current,          // ← full conversation history
      hasAudio: !!audioBase64,
      audioData: audioBase64 || '',
      hasImage: !!imageBase64,
      imageData: imageBase64 || '',
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
        screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
        timestamp: new Date().toISOString(),
      }
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'Invalid response from server' };
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    // n8n responds with { reply: "...", sessionId: "...", success: true }
    return (
      data.reply ||
      data.message ||
      data.output ||
      data.response ||
      data.text ||
      (typeof data === 'string' ? data : '') ||
      'I apologize, I had trouble responding. Please try again.'
    );
  };

  const sendMessage = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if ((!inputValue.trim() && !selectedImage) || isLoading || !sessionId) return;

    const textContent = inputValue.trim();
    const imgBase64   = imagePreview || undefined;

    // Build user message for display
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: textContent || (imgBase64 ? '[Image]' : ''),
      timestamp: new Date(),
      image: imgBase64,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    // Add to history BEFORE sending so n8n sees it
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: textContent || '[Image]' },
    ];

    try {
      const botText = await sendToN8n(textContent, undefined, imgBase64);

      const botMessage: Message = {
        id: `msg_${Date.now()}_bot`,
        role: 'bot',
        content: botText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

      // Add bot reply to history
      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant', content: botText },
      ];
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_error`,
        role: 'bot',
        content: 'I\'m having a bit of trouble right now. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── MediaRecorder — records raw audio and sends to webhook ─────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick the best supported mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect chunks as they arrive
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all mic tracks immediately
        stream.getTracks().forEach(t => t.stop());

        // Clear the recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingSeconds(0);
        setIsRecording(false);

        // Capture chunks NOW before anything clears them
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        if (chunks.length === 0) {
          console.warn('No audio chunks captured');
          return;
        }

        const finalMimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: finalMimeType });

        // Show the voice bubble in the chat UI
        const audioUrl = URL.createObjectURL(audioBlob);
        const voiceMsgId = `msg_${Date.now()}`;
        const voiceMsg: Message = {
          id: voiceMsgId,
          role: 'user',
          content: 'Voice message',
          timestamp: new Date(),
          audio: audioUrl,
        };
        setMessages(prev => [...prev, voiceMsg]);
        setIsLoading(true);

        // Add to conversation history
        historyRef.current = [
          ...historyRef.current,
          { role: 'user', content: '[Voice message]' },
        ];

        try {
          // Convert blob → base64 data URI for n8n
          const audioBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('FileReader did not return a string'));
              }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(audioBlob);
          });

          // Send to n8n
          const botText = await sendToN8n('[Voice message]', audioBase64);

          const botMsg: Message = {
            id: `${voiceMsgId}_bot`,
            role: 'bot',
            content: botText,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMsg]);

          historyRef.current = [
            ...historyRef.current,
            { role: 'assistant', content: botText },
          ];
        } catch (err) {
          console.error('Voice send error:', err);
          setMessages(prev => [...prev, {
            id: `${voiceMsgId}_err`,
            role: 'bot',
            content: 'I had trouble processing your voice message. Please try typing your question instead.',
            timestamp: new Date(),
          }]);
        } finally {
          setIsLoading(false);
        }
      };

      // Request data every 250ms so we get chunks even for short recordings
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start the recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingSeconds(0);
  };

  // Format seconds as m:ss
  function formatDuration(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 w-14 h-14 bg-accent text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all hover:scale-110 flex items-center justify-center z-50 border border-white/20"
        aria-label="Open chat"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-[5%] top-[15%] bottom-[15%] md:inset-auto md:bottom-4 md:right-4 w-[90%] md:w-80 h-[70%] md:h-[500px] bg-white md:rounded-xl rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-800 tracking-tight leading-none">
            {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'DriveEasy Car Rentals'}
          </h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Online Assistant
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
            aria-label="Minimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } message-enter`}
          >
            {/* Bubble Container */}
            <div
              className={`flex flex-col max-w-[75%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-4.5 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gray-100 text-gray-800 rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                {message.audio ? (
                  /* ── Minimal Voice message bubble ── */
                  <div className="flex flex-col gap-2 min-w-[210px] py-1">
                    <div className="flex items-center gap-2 px-1">
                      <div className="size-5 rounded-full bg-accent/10 flex items-center justify-center">
                        <Mic className="size-3 text-accent" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Voice Note</span>
                    </div>
                    <audio
                      controls
                      src={message.audio}
                      className="h-9 w-full rounded-lg"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* User-uploaded image */}
                    {message.image && (
                      <div className="overflow-hidden rounded-lg mb-1">
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-w-full h-auto cursor-pointer"
                          onClick={() => window.open(message.image, '_blank')}
                        />
                      </div>
                    )}

                    {/* Render message content */}
                    <div className="text-[13px] leading-relaxed">
                      <MessageContent
                        content={message.content}
                        isUser={message.role === 'user'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamp & Status */}
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-gray-400 font-medium">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {message.role === 'user' && (
                  <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block group">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-16 w-16 object-cover rounded-xl shadow-md border-2 border-white"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg border-2 border-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3 bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200/50">
          {/* Voice Recording */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105'
                : 'text-gray-400 hover:text-accent hover:bg-white'
            }`}
          >
            {isRecording ? (
              <StopCircle className="w-5 h-5 animate-pulse" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? `Recording... ${formatDuration(recordingSeconds)}` : "Type something..."}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-gray-400 py-2 px-1 disabled:opacity-50"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pr-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isRecording}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-accent hover:bg-white rounded-lg transition-colors"
            >
              <ImageIcon className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={sendMessage}
              disabled={isLoading || (!isRecording && !inputValue.trim() && !selectedImage)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-accent transition-colors disabled:opacity-30"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

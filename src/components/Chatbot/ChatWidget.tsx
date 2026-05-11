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

        // Capture chunks NOW before anything clears them
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];

        if (chunks.length === 0) {
          console.warn('No audio chunks captured');
          return;
        }

        const finalMimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: finalMimeType });

        // Show the voice bubble in the chat UI with a playable audio player
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

        // Add to conversation history as text so n8n context stays clean
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

          // Send to n8n — Whisper will transcribe it, AI will reply in text
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
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
        className="fixed bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 bg-accent text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-[5%] top-[15%] bottom-[15%] md:inset-auto md:bottom-4 md:right-4 w-[90%] md:w-80 h-[70%] md:h-[500px] bg-white md:rounded-xl rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="bg-accent text-white p-4 md:p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 md:space-x-2">
          <div className="w-10 h-10 md:w-8 md:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-lg md:text-base">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-sm">
              {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'DriveEasy Car Rentals'}
            </h3>
            <p className="text-[10px] md:text-xs text-white text-opacity-80">Rayan · Online now</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-1">
          <button
            onClick={onToggle}
            className="hover:bg-white/10 p-2 md:p-1.5 rounded-lg transition"
            aria-label="Minimize chat"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="hover:bg-white/10 p-2 md:p-1.5 rounded-lg transition"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-1.5 message-enter ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {message.role === 'user' ? (
                <span className="text-xs">👤</span>
              ) : (
                <span className="text-xs">🤖</span>
              )}
            </div>
            <div
              className={`${
                message.audio ? '' : 'max-w-[75%] rounded-xl px-3 py-1.5'
              } ${
                message.audio ? '' : message.role === 'user'
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
            >
              {message.audio ? (
                /* ── Voice message bubble ── */
                <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
                  message.role === 'user' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                }`}>
                  {/* Label row */}
                  <div className={`flex items-center gap-1.5 mb-1.5 text-xs font-medium ${
                    message.role === 'user' ? 'text-accent' : 'text-gray-500'
                  }`}>
                    <Mic className="w-3 h-3" />
                    <span>Voice message</span>
                  </div>

                  {/* Native audio player — styled to fit the bubble */}
                  <audio
                    controls
                    preload="metadata"
                    style={{ height: '32px', width: '200px', maxWidth: '100%' }}
                  >
                    <source src={message.audio} type="audio/webm;codecs=opus" />
                    <source src={message.audio} type="audio/webm" />
                    <source src={message.audio} type="audio/ogg" />
                    <source src={message.audio} type="audio/wav" />
                    Your browser does not support audio playback.
                  </audio>

                  {/* Timestamp */}
                  <p className={`text-xs mt-1.5 ${
                    message.role === 'user' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <>
                  {/* User-uploaded image (from the image picker) */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="rounded-lg mb-1.5 max-w-full h-auto"
                    />
                  )}

                  {/* Render message content — images, links, bold, line breaks */}
                  <MessageContent
                    content={message.content}
                    isUser={message.role === 'user'}
                  />

                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-white rounded-xl px-3 py-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-2.5 bg-white border-t border-gray-200">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-16 w-16 md:h-14 md:w-14 object-cover rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 md:w-4 md:h-4 flex items-center justify-center hover:bg-red-600 shadow-sm"
            >
              <X className="w-4 h-4 md:w-3 md:h-3" />
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2 md:space-x-1.5">
          {/* Voice Recording - LEFT */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`flex items-center gap-1 p-2 md:p-1.5 rounded-lg transition disabled:opacity-50 ${
              isRecording
                ? 'text-red-500 bg-red-50'
                : 'text-gray-500 hover:text-accent hover:bg-gray-100'
            }`}
            aria-label={isRecording ? 'Stop recording and send' : 'Start voice recording'}
          >
            {isRecording ? (
              <>
                <StopCircle className="w-5 h-5 md:w-4 md:h-4 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-red-500 min-w-[28px]">
                  {formatDuration(recordingSeconds)}
                </span>
              </>
            ) : (
              <Mic className="w-5 h-5 md:w-4 md:h-4" />
            )}
          </button>

          {/* Text Input - MIDDLE */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording..." : "Type message..."}
            disabled={isLoading || isRecording}
            className="flex-1 px-4 py-2 md:px-3 md:py-1.5 text-base md:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent disabled:bg-gray-100"
          />

          {/* Image Upload - RIGHT */}
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
            className="p-2 md:p-1.5 text-gray-500 hover:text-accent transition disabled:opacity-50"
            aria-label="Upload image"
          >
            <ImageIcon className="w-5 h-5 md:w-4 md:h-4" />
          </button>

          {/* Send Button - FAR RIGHT */}
          <button
            onClick={sendMessage}
            disabled={isLoading || isRecording || (!inputValue.trim() && !selectedImage)}
            className="w-10 h-10 md:w-8 md:h-8 bg-accent text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

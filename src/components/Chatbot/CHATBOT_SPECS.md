# AI Concierge Chatbot Widget Documentation

This document outlines the architecture, payload specifications, and core features of the AIAURA Fleet Chatbot Widget.

## 🚀 Core Features

### 1. Persistent Session Management
- **Session ID**: Every user is assigned a unique ID starting with `session-`.
- **Persistence**: The ID is stored in `localStorage` to ensure the conversation remains linked to the same user even after a page refresh.
- **24-Hour Expiry**: If a user has not interacted with the chatbot for more than 24 hours, the history and Session ID are automatically purged, and a fresh session is started.

### 2. Multi-Media Support
- **Voice Messaging**: Support for high-quality audio recording. Uses `audio/webm` on Chrome/Android and `audio/mp4` on Safari/iPhone for universal compatibility.
- **Image Uploads**: Allows users to attach images (max 5MB).
- **Premium Rendering**: Custom `ChatImage` component with skeleton loading and smooth 700ms fade-in transitions to prevent "blurry" or glitched rendering.

### 3. Interleaved Multi-Image Display
- **Markdown Support**: Renders images exactly where they appear in the text (e.g., Title -> Image -> Title -> Image).
- **Multiple Images**: Automatically detects and renders all images sent in a single webhook response.

---

## 📡 Webhook Integration (2.0)

The chatbot acts as a "Pass-Through" interface, sending the latest user message and receiving the AI's response. **Memory is managed on the n8n backend** using the provided `sessionId`.

### Payload Specification (Frontend to Webhook)
When a user sends a message, the following JSON is sent to the configured `webhookUrl`:

```json
{
  "message": "[Text or Voice/Image Placeholder]",
  "userId": "session-1778...",
  "sessionId": "session-1778...",
  "audio": "data:audio/webm;base64,...", // Optional: Only for voice
  "audioType": "voice",                  // Optional: Only for voice
  "duration": 5,                         // Optional: Only for voice
  "image": "data:image/jpeg;base64,...", // Optional: Only for images
  "timestamp": "2026-05-14T..."
}
```

### Payload Rules
1. **Audio**: Can be sent as raw base64 or with the `data:audio/...;base64,` prefix.
2. **Images**: MUST always include the `data:image/jpeg;base64,` prefix.
3. **No History**: The frontend does NOT send conversation history. The backend (n8n) maintains memory using the `sessionId`.

---

## 🛠 Tech Stack
- **Framework**: Next.js (Client Components)
- **Styling**: Vanilla CSS (inside `ChatWidget.tsx`) + Tailwind CSS utilities
- **Animations**: Framer Motion (Spring-based transitions)
- **Markdown**: `react-markdown` with custom image component overrides
- **Icons**: Lucide React

---

## 📁 Component Structure
- `ChatWidget.tsx`: The main logic and UI component.
- `ChatWidgetWrapper.tsx`: Handles the open/closed state toggle.
- `ChatImage`: Internal component for resilient image loading.
- `VoicePlayer`: Internal component for audio message playback.

---

## 🔒 Privacy & Cleanup
The chatbot prioritizes user privacy. All local data is strictly client-side and expires automatically after 24 hours of inactivity.

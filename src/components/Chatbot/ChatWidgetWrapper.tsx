'use client';

import { useState } from 'react';
import ChatWidget from './ChatWidget';

export default function ChatWidgetWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatWidget 
      isOpen={isOpen} 
      onToggle={() => setIsOpen(!isOpen)} 
    />
  );
}

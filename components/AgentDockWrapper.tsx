'use client';

import { useState, useEffect } from 'react';
import { AgentChatUI } from './AgentChatUI';
import { MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AgentDockWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show dock on the dedicated agent page
  if (pathname === '/agent') return null;

  return (
    <div className="fixed bottom-4 right-26 z-50 flex flex-col items-end ">
      {isOpen ? (
        <div className="animate-in slide-in-from-bottom-5 fade-in duration-200 ">
          <AgentChatUI isDocked={true} onClose={() => setIsOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-black text-white rounded-full p-4 shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 group flex items-center justify-center"
          title="Open Agent (⌘K)"
        >
          <MessageSquareText className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

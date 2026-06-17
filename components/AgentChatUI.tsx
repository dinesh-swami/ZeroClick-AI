'use client';
import { useState, useRef, useEffect } from 'react';
import { useChat as useChatOriginal } from '@ai-sdk/react';
import '@/styles/agent.css';

const useChat = useChatOriginal as any;
import {
  Bot,
  Maximize2,
  X,
  User,
  Paperclip,
  ArrowUp,
  Mic,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Mail,
  Calendar,
  Search,
  PenLine,
} from 'lucide-react';
import { Waveform } from '@/components/Waveform';
import { useVoiceInput } from '@/hooks/useVoiceInput';

const SUGGESTIONS = [
  { icon: Mail, label: 'Summarize my inbox' },
  { icon: Calendar, label: 'Schedule my day' },
  { icon: Search, label: 'Find urgent emails' },
  { icon: PenLine, label: 'Draft a reply' },
];
export function AgentChatUI({
  onClose,
  isDocked = false,
}: {
  onClose?: () => void;
  isDocked?: boolean;
}) {
  const {
    state: voiceState,
    toggleListening,
    stopListening,
    transcript,
    setTranscript,
  } = useVoiceInput();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [baseInput, setBaseInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    initialMessages: [],
  });
  const isLoading = status === 'submitted' || status === 'streaming' || status === 'generating';
  useEffect(() => {
    if (voiceState === 'listening') {
      setBaseInput(input);
    }
  }, [voiceState]);
  useEffect(() => {
    if (voiceState === 'listening' && transcript) {
      setInput((baseInput + ' ' + transcript).trim());
    }
  }, [transcript, voiceState, baseInput]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input || !input.trim()) return;
    sendMessage({ text: input });
    setInput('');
    setBaseInput('');
    setTranscript('');
    stopListening();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  return (
    <div className="agent-root">
      {/* Ambient layers */}
      <div className="agent-glow" />
      <div className="agent-smoke" />
      <div className="agent-embers" />
      {/* Header */}
      <header className="agent-header">
        <div className="agent-header-left">
          <div className="agent-avatar">
            <Bot size={22} strokeWidth={2.2} />
          </div>
          <div className="agent-title">
            <span className="agent-name">Corsair Agent</span>
            <span className="agent-status">
              <span className="agent-status-dot" />
              Online
            </span>
          </div>
        </div>
        <div className="agent-header-actions">
          {!isDocked && (
            <button className="agent-icon-btn" type="button">
              <Maximize2 size={14} />
              Expand
            </button>
          )}
          {isDocked && onClose && (
            <button className="agent-icon-btn" type="button" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>
      </header>
      {/* Messages */}
      <div className="agent-messages">
        {messages.length === 0 && (
          <div className="agent-empty">
            <div className="agent-empty-icon">
              <Sparkles size={36} strokeWidth={2.2} />
            </div>
            <h2 className="agent-empty-title">ZeroClick AI Command Center</h2>
            <p className="agent-empty-sub">
              Your intelligent assistant for inbox, calendar, and beyond.
            </p>
            <div className="agent-suggestions">
              {SUGGESTIONS.map((s) => (
                <div key={s.label} className="agent-suggestion">
                  <span className="agent-suggestion-dot" />
                  <s.icon size={14} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}
        {messages.map((m: any) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`agent-msg-row ${isUser ? 'user' : 'agent'}`}>
              <div className="agent-msg-avatar">
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="agent-msg-body">
                <span className="agent-msg-label">{isUser ? 'You' : 'Agent'}</span>
                <div className="agent-bubble">
                  {m.content ? (
                    <span>{m.content}</span>
                  ) : m.parts ? (
                    m.parts.map((part: any, i: number) => {
                      if (part.type === 'text' && part.text) {
                        return <span key={i}>{part.text}</span>;
                      }
                      return null;
                    })
                  ) : (
                    <span>No content</span>
                  )}
                </div>
                {(() => {
                  const tools =
                    m.toolInvocations ||
                    (m.parts
                      ? m.parts.filter(
                          (p: any) =>
                            p.type === 'tool-invocation' ||
                            p.type === 'tool' ||
                            p.type === 'dynamic-tool'
                        )
                      : []);
                  return tools.length > 0 ? <ActionLog toolInvocations={tools} /> : null;
                })()}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="agent-msg-row agent agent-thinking-row">
            <div className="agent-msg-avatar">
              <Bot size={16} />
            </div>
            <div className="agent-msg-body">
              <span className="agent-msg-label">Agent</span>
              <div className="agent-thinking-bubble">
                <span className="agent-thinking-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <form className="agent-input-wrap" onSubmit={handleSubmit}>
        {voiceState === 'listening' && (
          <div className="agent-listening">
            <div className="agent-listening-pill">
              <Waveform active={false} />
              Listening
            </div>
          </div>
        )}
        <div className="agent-input-shell">
          <textarea
            ref={inputRef}
            className="agent-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Corsair anything..."
            rows={1}
          />
          <div className="agent-input-actions">
            <button type="button" className="agent-input-btn" aria-label="Attach">
              <Paperclip size={16} />
            </button>
            <button
              type="button"
              className={`agent-input-btn mic ${voiceState === 'listening' ? 'listening' : ''}`}
              onClick={toggleListening}
              aria-label="Voice"
            >
              <Mic size={16} />
            </button>
            <button
              type="submit"
              className="agent-send-btn"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
            >
              <ArrowUp size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
function ActionLog({ toolInvocations }: { toolInvocations: any[] }) {
  const [logOpen, setLogOpen] = useState(false);
  return (
    <div className="agent-actionlog">
      <button type="button" onClick={() => setLogOpen(!logOpen)} className="agent-actionlog-header">
        <span className="agent-actionlog-left">
          {logOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Action Log
          <span className="agent-actionlog-count">· {toolInvocations.length} calls</span>
        </span>
      </button>
      {logOpen && (
        <div className="agent-actionlog-body">
          {toolInvocations.map((tool, idx) => {
            const state =
              tool.state === 'output-available' || tool.state === 'result'
                ? 'result'
                : tool.state || 'running';
            const inputStr = JSON.stringify(tool.args || tool.input, null, 2);
            const outputStr =
              state === 'result'
                ? JSON.stringify(tool.result || tool.output, null, 2)
                : 'running...';
            return (
              <ToolCallItem
                key={idx}
                name={tool.toolName || tool.name || 'tool'}
                state={state}
                input={inputStr}
                output={outputStr}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
function ToolCallItem({
  name,
  state,
  input,
  output,
}: {
  name: string;
  state: string;
  input: string;
  output: string;
}) {
  return (
    <div className="agent-tool">
      <div className="agent-tool-head">
        <span className="agent-tool-badge">{state}</span>
        <span className="agent-tool-name">{name}</span>
      </div>
      <div>
        <div className="agent-tool-block">
          <span className="agent-tool-label">Input:</span> {input}
        </div>
        <div className="agent-tool-block">
          <span className="agent-tool-label">Output:</span> {output}
        </div>
      </div>
    </div>
  );
}

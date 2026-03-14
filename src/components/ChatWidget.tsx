import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Zap, BarChart3, Calendar, LayoutGrid, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithAI } from '../lib/ai-providers';

const QUICK_ACTIONS = [
  { id: 'chart', label: 'Chart', icon: BarChart3, prompt: 'Create a line chart showing monthly revenue data' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, prompt: 'Build a vertical timeline for project roadmap' },
  { id: 'cards', label: 'Cards', icon: LayoutGrid, prompt: 'Design stat cards with KPIs and trends' },
  { id: 'analyze', label: 'Analyze', icon: Zap, prompt: 'Analyze this data and suggest the best visualization' },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! 👋 I'm your AI assistant. I can help you generate charts, timelines, cards, and more. Just describe what you want to see!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist chat history
  useEffect(() => {
    const saved = localStorage.getItem('visual-ai-chat-history');
    if (saved && isOpen) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('visual-ai-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!content) setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await chatWithAI(userMessage.content);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Chat cleared! How can I help you?",
      timestamp: new Date()
    }]);
    localStorage.removeItem('visual-ai-chat-history');
    setShowQuickActions(true);
  };

  return (
    <>
      {/* Floating Button - positioned to not overlap with mobile menu button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 z-40 lg:z-50 w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow"
        style={{ 
          bottom: 'calc(env(safe-area-inset-bottom, 20px) + 88px)', 
          right: 'calc(env(safe-area-inset-right, 16px) + 16px)',
          left: 'auto',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6 sm:w-6 sm:h-6 text-white" />
      </motion.button>

      {/* Chat Dialog - full width on mobile with safe area */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed left-2 right-2 sm:inset-auto sm:top-16 sm:right-4 sm:w-96 sm:h-[500px] w-auto h-auto max-w-[calc(100vw-1rem)] max-h-[calc(100vh-10rem)] sm:max-h-[500px] bg-bg-secondary rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-50"
            style={{ 
              top: 'calc(env(safe-area-inset-top, 12px) + 60px)',
              bottom: 'auto',
              left: 'calc(env(safe-area-inset-left, 8px) + 8px)',
              right: 'calc(env(safe-area-inset-right, 8px) + 8px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-accent-primary/10 to-transparent">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm sm:text-base">AI Assistant</h3>
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
                  title="Clear Chat"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-bg-tertiary' 
                      : 'bg-gradient-to-br from-accent-primary to-accent-secondary'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-bg-tertiary rounded-2xl rounded-br-sm' 
                      : 'bg-white/5 rounded-2xl rounded-bl-sm'
                  } p-2.5 sm:p-3`}>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-bl-sm p-2.5 sm:p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <AnimatePresence>
              {showQuickActions && messages.length <= 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 sm:px-4 pb-2"
                >
                  <p className="text-xs text-text-muted mb-2">Quick actions:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleSend(action.prompt)}
                          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-bg-tertiary hover:bg-accent-primary/20 text-xs text-text-secondary hover:text-accent-primary transition-colors"
                        >
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">{action.label}</span>
                          <span className="sm:hidden">{action.label.charAt(0)}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="input-field flex-1 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

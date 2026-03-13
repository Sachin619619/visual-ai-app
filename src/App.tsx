import { useState, useCallback, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { VisualRenderer } from './components/VisualRenderer';
import { ChatWidget } from './components/ChatWidget';
import { ToastProvider, useToast } from './components/Toast';
import { ModelProvider, PromptHistory } from './types';
import { generateUI } from './lib/ai-providers';
import { Menu, X } from 'lucide-react';

function AppContent() {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteAuth, setSiteAuth] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  const { showToast } = useToast();
  
  const SITE_PASSWORD = 'visual2026';

  useEffect(() => {
    const auth = localStorage.getItem('site_auth_visual');
    setSiteAuth(auth === 'true');
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + L to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        handleClear();
      }
      // Cmd/Ctrl + Enter to generate (when prompt has value)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim() && !isLoading) {
        e.preventDefault();
        handleGenerate(prompt, 'openai');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, isLoading]);

  const handleSiteLogin = (password: string) => {
    if (password === SITE_PASSWORD) {
      localStorage.setItem('site_auth_visual', 'true');
      setSiteAuth(true);
      showToast('success', 'Welcome back! 🎉');
    } else {
      showToast('error', 'Incorrect password');
    }
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('visual-ai-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('visual-ai-history', JSON.stringify(history));
    }
  }, [history]);
  if (siteAuth === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        <h1 style={{ color: '#8b5cf6', fontSize: '1.5rem' }}>🔒 Visual AI</h1>
        <form onSubmit={(e) => { e.preventDefault(); handleSiteLogin((e.target as HTMLFormElement).password.value); }} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
          <input 
            type="password" 
            name="password"
            placeholder="Enter site password"
            style={{ 
              padding: '12px 20px', 
              borderRadius: '8px', 
              border: '1px solid #333',
              background: '#161619',
              color: '#fff',
              fontSize: '16px',
              outline: 'none',
              flex: 1,
              minHeight: '44px'
            }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none',
              background: '#8b5cf6',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
              whiteSpace: 'nowrap'
            }}
          >
            Access
          </button>
        </form>
      </div>
    );
  }

  const handleGenerate = useCallback(async (prompt: string, model: ModelProvider) => {
    setIsLoading(true);
    
    // Add to history
    const historyItem: PromptHistory = {
      id: Date.now().toString(),
      prompt,
      model,
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev]);
    
    try {
      const generatedHtml = await generateUI(prompt, model);
      setHtml(generatedHtml);
      showToast('success', 'UI generated successfully! ✨');
    } catch (error) {
      console.error('Error generating UI:', error);
      showToast('error', 'Failed to generate UI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const handleClear = useCallback(() => {
    setHtml('');
  }, []);

  return (
    <div className="h-screen w-screen lg:h-screen lg:w-screen flex overflow-hidden bg-bg-primary">
      {/* Mobile Toggle Button - only show on mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 sm:p-3 bg-bg-secondary rounded-lg border border-white/10 shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Left Panel - Input */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 w-72 sm:w-80
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-80
      `}>
        <InputPanel
          onGenerate={handleGenerate}
          isLoading={isLoading}
          history={history}
          onClose={() => setSidebarOpen(false)}
          prompt={prompt}
          onPromptChange={setPrompt}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Center - Visual Renderer */}
      <div className="flex-1">
        <VisualRenderer
          html={html}
          isLoading={isLoading}
          onClear={handleClear}
        />
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;

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
        minHeight: '100dvh',
        background: '#0a0a0b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        paddingTop: '80px',
        width: '100vw',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        {/* Mobile menu button - always visible on login screen */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 50,
            padding: '12px',
            background: '#1a1a24',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            minHeight: '48px',
            minWidth: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <Menu style={{ width: 24, height: 24, color: 'white' }} />
        </button>
        
        <h1 style={{ color: '#8b5cf6', fontSize: '1.75rem', fontWeight: '600' }}>🔒 Visual AI</h1>
        <form onSubmit={(e) => { e.preventDefault(); handleSiteLogin((e.target as HTMLFormElement).password.value); }} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <input 
            type="password" 
            name="password"
            placeholder="Enter site password"
            style={{ 
              padding: '14px 20px', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#161619',
              color: '#fff',
              fontSize: '16px',
              outline: 'none',
              flex: 1,
              minHeight: '48px',
              transition: 'all 0.2s ease'
            }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '14px 28px', 
              borderRadius: '12px', 
              border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              minHeight: '48px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
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
      {/* Mobile Menu Toggle Button - always visible on mobile/tablet, top-left fixed */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden p-3 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl min-h-[48px] min-w-[48px] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Left Panel - Input */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-80
        bg-bg-secondary
        w-80 max-w-[85vw]
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

      {/* Overlay for mobile - click to close sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Center - Visual Renderer */}
      <div className="flex-1 w-full lg:w-auto">
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

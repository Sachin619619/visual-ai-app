import { useState, useCallback, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { VisualRenderer } from './components/VisualRenderer';
import { ChatWidget } from './components/ChatWidget';
import { ModelProvider, PromptHistory } from './types';
import { generateUI } from './lib/ai-providers';
import { Menu, X } from 'lucide-react';

function App() {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [siteAuth, setSiteAuth] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  
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
    } else {
      alert('Incorrect password');
    }
  };

  // Show password gate if not authenticated
  if (siteAuth === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1 style={{ color: '#8b5cf6', fontSize: '2rem' }}>🔒 Visual AI</h1>
        <form onSubmit={(e) => { e.preventDefault(); handleSiteLogin((e.target as HTMLFormElement).password.value); }}>
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
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '12px 24px', 
              marginLeft: '10px',
              borderRadius: '8px', 
              border: 'none',
              background: '#8b5cf6',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
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
    } catch (error) {
      console.error('Error generating UI:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setHtml('');
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-bg-secondary rounded-lg border border-white/10 shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Left Panel - Input */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:transform-none
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

export default App;

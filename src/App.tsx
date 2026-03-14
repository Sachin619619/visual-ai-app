import { useState, useCallback, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { VisualRenderer } from './components/VisualRenderer';
import { ChatWidget } from './components/ChatWidget';
import { ToastProvider, useToast } from './components/Toast';
import { ModelProvider, PromptHistory, StyleFrame } from './types';
import { generateUI } from './lib/ai-providers';
import { Menu, X, Sparkles } from 'lucide-react';

function AppContent() {
  const [html, setHtml] = useState('');
  const [htmlHistory, setHtmlHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteAuth, setSiteAuth] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  const [lastModel, setLastModel] = useState<ModelProvider>('openai');
  const [styleFrame, setStyleFrame] = useState<StyleFrame>('card');
  const { showToast } = useToast();
  
  const SITE_PASSWORD = 'visual2026';

  useEffect(() => {
    const auth = localStorage.getItem('site_auth_visual');
    setSiteAuth(auth === 'true');
  }, []);

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

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHtml(htmlHistory[newIndex]);
      showToast('success', 'Undo successful ↩️');
    } else if (historyIndex === 0 && htmlHistory.length > 0) {
      setHistoryIndex(-1);
      setHtml('');
      showToast('success', 'Canvas cleared');
    }
  }, [historyIndex, htmlHistory, showToast]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < htmlHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHtml(htmlHistory[newIndex]);
      showToast('success', 'Redo successful ↪️');
    }
  }, [historyIndex, htmlHistory, showToast]);

  const handleClear = useCallback(() => {
    setHtml('');
    setHtmlHistory([]);
    setHistoryIndex(-1);
  }, []);

  // All useCallbacks must be defined BEFORE any conditional returns
  const handleGenerate = useCallback(async (prompt: string, model: ModelProvider) => {
    setIsLoading(true);
    setLastModel(model);
    
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
      // Add to undo history
      setHtmlHistory(prev => {
        // If we're not at the end of history, truncate future history
        const newHistory = historyIndex >= 0 ? htmlHistory.slice(0, historyIndex + 1) : [...prev];
        return [...newHistory, generatedHtml];
      });
      setHistoryIndex(prev => prev >= 0 ? prev + 1 : 0);
      setHtml(generatedHtml);
      showToast('success', 'UI generated successfully! ✨');
    } catch (error: any) {
      console.error('Error generating UI:', error);
      let errorMessage = 'Failed to generate UI. Please try again.';
      
      // Provide more specific error messages
      if (error?.message?.includes('API key')) {
        errorMessage = 'API key missing or invalid. Please check settings.';
      } else if (error?.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error?.message?.includes('quota')) {
        errorMessage = 'API quota exceeded. Check your plan limits.';
      }
      
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, historyIndex, htmlHistory]);

  const handleQuickGenerate = useCallback((prompt: string) => {
    setPrompt(prompt);
    handleGenerate(prompt, 'openai');
  }, [handleGenerate]);

  const handleToggleFavorite = useCallback((id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('visual-ai-history');
    showToast('success', 'History cleared');
  }, [showToast]);

  const handleRefinePrompt = useCallback((_: string, refinement: string) => {
    // Use the refinement as a new prompt
    setPrompt(refinement);
    handleGenerate(refinement, 'openai');
  }, [handleGenerate]);

  // Keyboard shortcut: Cmd/Ctrl + L to clear, Z to undo/redo
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
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if ((e.metaKey || e.ctrlKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, isLoading, historyIndex, htmlHistory, handleUndo, handleRedo, handleClear, handleGenerate]);

  if (siteAuth === null) {
    return (
      <div className="min-h-[100dvh] bg-bg-primary flex items-center justify-center flex-col gap-5 p-5 pt-20 w-full relative overflow-x-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 60px)' }}>
        {/* Mobile menu button - always visible on login screen */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-50 p-3 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl min-h-[48px] min-w-[48px] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ top: 'env(safe-area-inset-top, 12px)', left: 'env(safe-area-inset-left, 12px)' }}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold gradient-text font-heading">Visual AI</h1>
        <form onSubmit={(e) => { e.preventDefault(); handleSiteLogin((e.target as HTMLFormElement).password.value); }} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <input 
            type="password" 
            name="password"
            placeholder="Enter site password"
            className="input-field flex-1"
          />
          <button 
            type="submit"
            className="btn-primary whitespace-nowrap"
          >
            Access
          </button>
        </form>
      </div>
    );
  }


  return (
    <div className="h-screen w-screen lg:h-screen lg:w-screen flex overflow-hidden bg-bg-primary relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingRight: 'env(safe-area-inset-right)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)' }}>
      {/* Ambient background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl" />
      </div>
      
      {/* Mobile Menu Toggle Button - always visible on mobile/tablet, top-left fixed */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden p-3 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl min-h-[48px] min-w-[48px] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ top: 'env(safe-area-inset-top, 12px)', left: 'env(safe-area-inset-left, 12px)' }}
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
        w-[280px] sm:w-80 max-w-[85vw] xs:max-w-[320px]
        pt-16 lg:pt-0
        overflow-y-auto overflow-x-hidden
      `} style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        overscrollBehavior: 'contain'
      }}>
        <InputPanel
          onGenerate={handleGenerate}
          isLoading={isLoading}
          history={history}
          onClose={() => setSidebarOpen(false)}
          prompt={prompt}
          onPromptChange={setPrompt}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
          styleFrame={styleFrame}
          onStyleFrameChange={setStyleFrame}
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
          onUndo={handleUndo}
          onRedo={handleRedo}
          model={lastModel}
          styleFrame={styleFrame}
          onStyleFrameChange={setStyleFrame}
          onQuickGenerate={handleQuickGenerate}
          onRefinePrompt={handleRefinePrompt}
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

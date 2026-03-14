import { useState, useCallback, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { VisualRenderer } from './components/VisualRenderer';
import { ChatWidget } from './components/ChatWidget';
import { ToastProvider, useToast } from './components/Toast';
import { ModelProvider, PromptHistory, StyleFrame } from './types';
import { generateUI } from './lib/ai-providers';
import { AI_PROVIDERS } from './lib/ai-providers';
import { Menu, X, Sparkles, Keyboard, Star, FolderOpen } from 'lucide-react';

// Favorite design type
interface FavoriteDesign {
  id: string;
  name: string;
  html: string;
  prompt: string;
  model: ModelProvider;
  createdAt: number;
}

// Helper to encode/decode HTML for sharing
const encodeHTML = (html: string) => {
  try {
    return btoa(encodeURIComponent(html));
  } catch {
    return '';
  }
};

const decodeHTML = (encoded: string) => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return null;
  }
};

function AppContent() {
  const [html, setHtml] = useState('');
  const [htmlHistory, setHtmlHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStats, setGenerationStats] = useState<{ time: number; model: string } | null>(null);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteAuth, setSiteAuth] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  const [lastModel, setLastModel] = useState<ModelProvider>('openai');
  const [styleFrame, setStyleFrame] = useState<StyleFrame>('card');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [favorites, setFavorites] = useState<FavoriteDesign[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const { showToast } = useToast();
  
  const SITE_PASSWORD = 'visual2026';

  // Session persistence - save/restore current design
  useEffect(() => {
    const savedSession = localStorage.getItem('visual-ai-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.html) {
          setHtml(session.html);
        }
        if (session.lastModel) {
          setLastModel(session.lastModel);
        }
        if (session.styleFrame) {
          setStyleFrame(session.styleFrame);
        }
        if (session.theme) {
          setTheme(session.theme);
        }
      } catch (e) {
        console.error('Failed to restore session', e);
      }
    }
    
    // Also check for theme preference directly
    const savedTheme = localStorage.getItem('visual-ai-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  // Auto-save session to localStorage
  useEffect(() => {
    if (html) {
      localStorage.setItem('visual-ai-session', JSON.stringify({
        html,
        lastModel,
        styleFrame,
        theme,
        savedAt: Date.now()
      }));
    }
    localStorage.setItem('visual-ai-theme', theme);
    // Apply theme to document
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [html, lastModel, styleFrame, theme]);

  useEffect(() => {
    const auth = localStorage.getItem('site_auth_visual');
    setSiteAuth(auth === 'true');
    
    // Check for shared design in URL
    const params = new URLSearchParams(window.location.search);
    const sharedDesign = params.get('design');
    if (sharedDesign) {
      const decodedHtml = decodeHTML(sharedDesign);
      if (decodedHtml) {
        setHtml(decodedHtml);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        showToast('success', 'Shared design loaded! 🔗');
      }
    }
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
  // Load history and draft prompt from localStorage on mount
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
    
    // Load draft prompt if any
    const savedDraft = localStorage.getItem('visual-ai-draft');
    if (savedDraft) {
      setPrompt(savedDraft);
    }
    
    // Load favorites
    const savedFavorites = localStorage.getItem('visual-ai-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('visual-ai-history', JSON.stringify(history));
    }
  }, [history]);

  // Auto-save draft prompt to localStorage whenever it changes
  useEffect(() => {
    if (prompt) {
      localStorage.setItem('visual-ai-draft', prompt);
    } else {
      localStorage.removeItem('visual-ai-draft');
    }
  }, [prompt]);

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
  const handleGenerate = useCallback(async (prompt: string, model: ModelProvider, contextHtml?: string) => {
    const startTime = Date.now();
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
      const generatedHtml = await generateUI(prompt, model, contextHtml);
      // Add to undo history
      setHtmlHistory(prev => {
        // If we're not at the end of history, truncate future history
        const newHistory = historyIndex >= 0 ? htmlHistory.slice(0, historyIndex + 1) : [...prev];
        return [...newHistory, generatedHtml];
      });
      setHistoryIndex(prev => prev >= 0 ? prev + 1 : 0);
      setHtml(generatedHtml);
      
      // Track generation stats
      const generationTime = Date.now() - startTime;
      setGenerationStats({ time: generationTime, model: AI_PROVIDERS[model]?.name || model });
      
      // Clear draft prompt after successful generation
      localStorage.removeItem('visual-ai-draft');
      showToast('success', `UI generated in ${(generationTime / 1000).toFixed(1)}s! ✨`);
    } catch (error: any) {
      console.error('Error generating UI:', error);
      const msg: string = error?.message || '';
      let errorMessage = 'Failed to generate UI. Please try again.';
      
      if (msg.includes('API key') || msg.includes('api key') || msg.includes('Please set')) {
        errorMessage = msg;
      } else if (msg.includes('rate limit') || msg.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment.';
      } else if (msg.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (msg.includes('quota')) {
        errorMessage = 'API quota exceeded. Check your plan limits.';
      } else if (msg.includes('Insufficient credits') || msg.includes('insufficient credits')) {
        errorMessage = 'Insufficient API credits. Try a different model or provider.';
      } else if (msg.includes('OpenAI error') || msg.includes('Anthropic error') || msg.includes('Gemini error') || msg.includes('OpenRouter error')) {
        errorMessage = msg;
      } else if (msg) {
        errorMessage = msg;
      }
      
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, historyIndex, htmlHistory]);

  const handleQuickGenerate = useCallback((prompt: string) => {
    setPrompt(prompt);
    handleGenerate(prompt, 'openai', html);
  }, [handleGenerate, html]);

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
    // Use the refinement as a new prompt with current HTML as context
    setPrompt(refinement);
    handleGenerate(refinement, 'openai', html);
  }, [handleGenerate, html]);

  // Share design via URL
  const handleShare = useCallback(() => {
    if (!html) {
      showToast('error', 'Nothing to share');
      return;
    }
    
    const encoded = encodeHTML(html);
    const shareUrl = `${window.location.origin}${window.location.pathname}?design=${encoded}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('success', 'Share link copied to clipboard! 🔗');
    }).catch(() => {
      showToast('error', 'Failed to copy link');
    });
  }, [html, showToast]);

  // Export design as HTML file
  const handleExport = useCallback(() => {
    if (!html) {
      showToast('error', 'Nothing to export');
      return;
    }
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-ai-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'HTML file downloaded! 📦');
  }, [html, showToast]);

  // Apply edited code from code editor
  const handleApplyCode = useCallback((code: string) => {
    if (!code.trim()) {
      showToast('error', 'Code cannot be empty');
      return;
    }
    
    // Add to undo history
    setHtmlHistory(prev => {
      const newHistory = historyIndex >= 0 ? htmlHistory.slice(0, historyIndex + 1) : [...prev];
      return [...newHistory, code];
    });
    setHistoryIndex(prev => prev >= 0 ? prev + 1 : 0);
    setHtml(code);
    showToast('success', 'Code applied! ✨');
  }, [htmlHistory, historyIndex, showToast]);

  // Toggle theme
  const handleToggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    showToast('success', `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode ☀️`);
  }, [theme, showToast]);

  // Save to favorites
  const handleSaveFavorite = useCallback((name?: string) => {
    if (!html) {
      showToast('error', 'Nothing to save');
      return;
    }
    
    const favorite: FavoriteDesign = {
      id: Date.now().toString(),
      name: name || `Design ${favorites.length + 1}`,
      html,
      prompt: history[0]?.prompt || '',
      model: lastModel,
      createdAt: Date.now()
    };
    
    const newFavorites = [favorite, ...favorites];
    setFavorites(newFavorites);
    localStorage.setItem('visual-ai-favorites', JSON.stringify(newFavorites));
    showToast('success', `Saved to favorites! ⭐`);
  }, [html, history, lastModel, favorites.length, showToast]);

  // Load from favorites
  const handleLoadFavorite = useCallback((favorite: FavoriteDesign) => {
    setHtml(favorite.html);
    setShowFavorites(false);
    showToast('success', `Loaded "${favorite.name}" from favorites! 📂`);
  }, [showToast]);

  // Delete from favorites
  const handleDeleteFavorite = useCallback((id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem('visual-ai-favorites', JSON.stringify(newFavorites));
    showToast('success', 'Removed from favorites');
  }, [favorites, showToast]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('visual-ai-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
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
      // Cmd/Ctrl + S for share
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleShare();
      }
      // Cmd/Ctrl + E for export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      // Cmd/Ctrl + B for toggle theme
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        handleToggleTheme();
      }
      // Cmd/Ctrl + D for save to favorites
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleSaveFavorite();
      }
      // ? for shortcuts help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, isLoading, historyIndex, htmlHistory, handleUndo, handleRedo, handleClear, handleGenerate, handleShare, handleExport, handleToggleTheme, handleSaveFavorite]);

  if (siteAuth === null) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center flex-col gap-5 p-5 pt-20 relative overflow-x-hidden">
        {/* Mobile menu button - always visible on login screen */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-50 p-3 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl min-h-[48px] min-w-[48px] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ top: 'calc(env(safe-area-inset-top, 12px) + 8px)', left: 'calc(env(safe-area-inset-left, 12px) + 8px)' }}
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
    <div className="h-[100dvh] w-full flex overflow-hidden bg-bg-primary relative" style={{ 
        paddingTop: 'env(safe-area-inset-top, 0px)', 
        paddingRight: 'env(safe-area-inset-right, 0px)', 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)', 
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        height: '100dvh'
      }}>
      {/* Ambient background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl" />
      </div>
      
      {/* Mobile Menu Toggle Button - always visible on mobile/tablet, top-left fixed */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-2 left-2 z-50 lg:hidden p-2.5 sm:p-3 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl min-h-[48px] min-w-[48px] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ 
          top: 'calc(env(safe-area-inset-top, 8px) + 8px)', 
          left: 'calc(env(safe-area-inset-left, 8px) + 8px)',
          zIndex: 60
        }}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        )}
      </button>

      {/* Left Panel - Input */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-72 lg:flex-shrink-0
        bg-bg-secondary border-r border-white/5
        w-[85vw] max-w-[300px] sm:max-w-[320px]
        pt-14 lg:pt-0
        overflow-y-auto overflow-x-hidden
      `} style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        overscrollBehavior: 'contain',
        maxWidth: 'min(85vw, 300px)'
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
      <div className="flex-1 min-w-0">
        <VisualRenderer
          html={html}
          isLoading={isLoading}
          onClear={handleClear}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onApplyCode={handleApplyCode}
          model={lastModel}
          styleFrame={styleFrame}
          onStyleFrameChange={setStyleFrame}
          onQuickGenerate={handleQuickGenerate}
          onRefinePrompt={handleRefinePrompt}
          onShare={handleShare}
          onExport={handleExport}
          onSaveFavorite={handleSaveFavorite}
          onShowFavorites={() => setShowFavorites(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          generationStats={generationStats}
        />
      </div>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-bg-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold gradient-text flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </h2>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { keys: '⌘ + Enter', action: 'Generate UI' },
                { keys: '⌘ + Z', action: 'Undo' },
                { keys: '⌘ + Shift + Z', action: 'Redo' },
                { keys: '⌘ + S', action: 'Share design' },
                { keys: '⌘ + E', action: 'Export HTML' },
                { keys: '⌘ + D', action: 'Save to favorites' },
                { keys: '⌘ + B', action: 'Toggle theme' },
                { keys: '⌘ + L', action: 'Clear canvas' },
                { keys: '?', action: 'Show shortcuts' },
                { keys: 'Esc', action: 'Close modals/sidebar' },
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-text-secondary">{shortcut.action}</span>
                  <kbd className="px-3 py-1.5 bg-bg-tertiary rounded-lg text-sm font-mono text-accent-primary">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFavorites(false)}
        >
          <div 
            className="bg-bg-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold gradient-text flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Saved Favorites
              </h2>
              <button 
                onClick={() => setShowFavorites(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No favorites saved yet</p>
                <p className="text-sm mt-1">Press ⌘+D to save your current design</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div key={fav.id} className="p-4 bg-bg-tertiary rounded-xl border border-white/5 hover:border-accent-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {fav.name}
                      </h3>
                      <button 
                        onClick={() => handleDeleteFavorite(fav.id)}
                        className="text-text-muted hover:text-red-400 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-text-muted mb-3 line-clamp-2">{fav.prompt || 'No prompt'}</p>
                    <button 
                      onClick={() => handleLoadFavorite(fav)}
                      className="w-full py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg transition-colors text-sm font-medium"
                    >
                      Load Design
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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

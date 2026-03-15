import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
const InputPanel = lazy(() => import('./components/InputPanel').then(m => ({ default: m.InputPanel })));
const VisualRenderer = lazy(() => import('./components/VisualRenderer').then(m => ({ default: m.VisualRenderer })));
const ChatWidget = lazy(() => import('./components/ChatWidget').then(m => ({ default: m.ChatWidget })));
import { ToastProvider, useToast } from './components/Toast';
import { ModelProvider, PromptHistory, StyleFrame } from './types';
import { generateUI, generateTitle, isApiKeyConfigured } from './lib/ai-providers';
import { AI_PROVIDERS } from './lib/ai-providers';

// Demo visual shown when no API key is configured — lets users instantly see what the app does
const DEMO_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;font-family:'Inter',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bg{position:fixed;inset:0;background:radial-gradient(circle at 20% 50%,rgba(139,92,246,.15),transparent 40%),radial-gradient(circle at 80% 30%,rgba(6,182,212,.12),transparent 40%)}
.card{position:relative;z-index:1;text-align:center;padding:3rem 2rem;max-width:600px}
.badge{display:inline-block;padding:.3rem 1rem;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.4);border-radius:999px;color:#a78bfa;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:1.5rem;animation:fadeUp .6s ease both}
h1{font-size:clamp(2.5rem,6vw,4rem);font-weight:800;background:linear-gradient(135deg,#fff 0%,#8b5cf6 50%,#06b6d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1;margin-bottom:1rem;animation:fadeUp .6s .1s ease both;opacity:0}
.sub{color:#64748b;font-size:1rem;margin-bottom:2.5rem;animation:fadeUp .6s .2s ease both;opacity:0}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;animation:fadeUp .6s .3s ease both;opacity:0}
.item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:1rem;padding:1.25rem .75rem;transition:transform .2s,border-color .2s}
.item:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.4)}
.item .icon{font-size:1.75rem;margin-bottom:.5rem}
.item .label{color:#94a3b8;font-size:.8rem}
.cta{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 2rem;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:999px;color:#fff;font-weight:600;font-size:.9rem;animation:fadeUp .6s .4s ease both;opacity:0;cursor:pointer}
.dot{width:8px;height:8px;background:#06b6d4;border-radius:50%;animation:pulse 1.5s infinite}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
</style></head><body>
<div class="bg"></div>
<div class="card">
  <div class="badge">✦ Demo Preview</div>
  <h1>Transform Any Idea into a Visual</h1>
  <p class="sub">Type anything — a topic, a question, even just "hi" — and watch it become a stunning visual.</p>
  <div class="grid">
    <div class="item"><div class="icon">📊</div><div class="label">Charts & Dashboards</div></div>
    <div class="item"><div class="icon">🗺️</div><div class="label">Diagrams & Maps</div></div>
    <div class="item"><div class="icon">✨</div><div class="label">Infographics</div></div>
    <div class="item"><div class="icon">🎨</div><div class="label">Creative Visuals</div></div>
    <div class="item"><div class="icon">📈</div><div class="label">Data Stories</div></div>
    <div class="item"><div class="icon">⚡</div><div class="label">Animations</div></div>
  </div>
  <div class="cta"><div class="dot"></div> Add your free API key to start →</div>
</div>
</body></html>`;
import { Menu, X, Sparkles, Keyboard, Star, FolderOpen, GalleryHorizontal, Search, LayoutGrid, List } from 'lucide-react';

// Favorite design type
interface FavoriteDesign {
  id: string;
  name: string;
  html: string;
  prompt: string;
  model: ModelProvider;
  createdAt: number;
}

// Visual history entry with thumbnail
interface VisualHistoryEntry {
  id: string;
  html: string;
  prompt: string;
  model: ModelProvider;
  thumbnail: string; // base64 image data
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
  const [lastModel, setLastModel] = useState<ModelProvider>(() => {
    try {
      const saved = localStorage.getItem('visual-ai-model') as ModelProvider | null;
      const valid: ModelProvider[] = ['openai', 'claude', 'gemini', 'openrouter', 'kimi', 'minimax', 'local'];
      if (saved && valid.includes(saved)) return saved;
    } catch {}
    return 'openrouter';
  });
  const [styleFrame, setStyleFrame] = useState<StyleFrame>('card');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('visual-ai-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });
  const [favorites, setFavorites] = useState<FavoriteDesign[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [visualHistory, setVisualHistory] = useState<VisualHistoryEntry[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [_currentTitle, setCurrentTitle] = useState('');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'list'>('grid');
  const [generationProgress, setGenerationProgress] = useState(0);
  const generationProgressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const generationAbortController = useRef<AbortController | null>(null);
  const { showToast } = useToast();
  const cleanupRan = useRef(false);
  const promptSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SITE_PASSWORD = 'visual2026';

  // LocalStorage cleanup - remove old/stale keys on app init (runs once)
  useEffect(() => {
    if (cleanupRan.current) return;
    cleanupRan.current = true;
    try {
      // Remove deprecated or renamed keys
      const staleKeys = [
        'visual-ai-dark-mode',          // replaced by visual-ai-theme
        'visual-ai-code-editor',         // stale editor state
        'visual-ai-temp',               // temp keys
      ];
      staleKeys.forEach(key => localStorage.removeItem(key));

      // Cap visual history to 50 entries (prevent unbounded growth)
      const rawHistory = localStorage.getItem('visual-ai-visual-history');
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed) && parsed.length > 50) {
          localStorage.setItem('visual-ai-visual-history', JSON.stringify(parsed.slice(0, 50)));
        }
      }
      // Cap prompt history to 100 entries
      const rawPromptHistory = localStorage.getItem('visual-ai-history');
      if (rawPromptHistory) {
        const parsed = JSON.parse(rawPromptHistory);
        if (Array.isArray(parsed) && parsed.length > 100) {
          localStorage.setItem('visual-ai-history', JSON.stringify(parsed.slice(0, 100)));
        }
      }
    } catch {
      // Silent - localStorage not available or corrupt
    }
  }, []);

  // Session persistence - save/restore current design
  useEffect(() => {
    const savedSession = localStorage.getItem('visual-ai-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.html) {
          setHtml(session.html);
        } else if (!isApiKeyConfigured()) {
          setHtml(DEMO_HTML);
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
    } else if (!isApiKeyConfigured()) {
      // No session + no API key → show demo so users see the app's value immediately
      setHtml(DEMO_HTML);
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
        if (Array.isArray(parsed)) {
          setHistory(parsed.map((h: any) => ({ ...h, timestamp: h.timestamp ? new Date(h.timestamp) : new Date() })));
        }
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
    
    // Load visual history
    const savedVisualHistory = localStorage.getItem('visual-ai-visual-history');
    if (savedVisualHistory) {
      try {
        setVisualHistory(JSON.parse(savedVisualHistory));
      } catch (e) {
        console.error('Failed to parse visual history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem('visual-ai-history', JSON.stringify(history));
      } catch (e) {
        console.error('localStorage quota exceeded for history', e);
      }
    }
  }, [history]);

  // Save visual history to localStorage whenever it changes
  useEffect(() => {
    if (visualHistory.length > 0) {
      try {
        localStorage.setItem('visual-ai-visual-history', JSON.stringify(visualHistory));
      } catch (e) {
        console.error('localStorage quota exceeded for visual history', e);
      }
    }
  }, [visualHistory]);

  // Auto-save draft prompt to localStorage with debounce (500ms)
  useEffect(() => {
    if (promptSaveTimer.current) clearTimeout(promptSaveTimer.current);
    promptSaveTimer.current = setTimeout(() => {
      if (prompt) {
        localStorage.setItem('visual-ai-draft', prompt);
      } else {
        localStorage.removeItem('visual-ai-draft');
      }
    }, 500);
    return () => {
      if (promptSaveTimer.current) clearTimeout(promptSaveTimer.current);
    };
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
  const handleCancelGeneration = useCallback(() => {
    if (generationAbortController.current) {
      generationAbortController.current.abort();
      generationAbortController.current = null;
    }
    if (generationProgressTimer.current) clearInterval(generationProgressTimer.current);
    setGenerationProgress(0);
    setIsLoading(false);
    showToast('info', 'Generation cancelled');
  }, [showToast]);

  const handleGenerate = useCallback(async (prompt: string, model: ModelProvider, contextHtml?: string, images?: { url: string; name: string }[]) => {
    const startTime = Date.now();
    // Cancel any in-progress generation
    if (generationAbortController.current) {
      generationAbortController.current.abort();
    }
    generationAbortController.current = new AbortController();
    const { signal } = generationAbortController.current;
    setIsLoading(true);
    setLastModel(model);
    // Start simulated progress bar (fast to 70%, then slows — resets on done)
    setGenerationProgress(0);
    if (generationProgressTimer.current) clearInterval(generationProgressTimer.current);
    let _progress = 0;
    generationProgressTimer.current = setInterval(() => {
      _progress += _progress < 70 ? 2 : _progress < 90 ? 0.4 : 0.05;
      if (_progress > 95) _progress = 95;
      setGenerationProgress(_progress);
    }, 300);
    
    // Add images context to prompt if provided
    let fullPrompt = prompt;
    if (images && images.length > 0) {
      fullPrompt = `${prompt}\n\nPlease reference the following attached image(s) for design inspiration: ${images.map(img => img.name).join(', ')}.`;
    }
    
    // Add to history
    const historyItem: PromptHistory = {
      id: Date.now().toString(),
      prompt: fullPrompt,
      model,
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev]);
    
    // Streaming: throttle iframe updates to every 1.2s to avoid flickering
    let lastStreamUpdate = 0;
    const onChunk = (partial: string) => {
      const now = Date.now();
      if (now - lastStreamUpdate < 1200) return;
      lastStreamUpdate = now;
      // Strip leading markdown fence, show once we have meaningful HTML
      const cleaned = partial.replace(/^```html\s*/i, '').replace(/^```\s*/i, '');
      if (cleaned.length > 300 && cleaned.includes('<')) setHtml(cleaned);
    };

    try {
      const generatedHtml = await generateUI(fullPrompt, model, contextHtml, signal, onChunk);
      // Add to undo history
      setHtmlHistory(prev => {
        // If we're not at the end of history, truncate future history
        const newHistory = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : [...prev];
        return [...newHistory, generatedHtml];
      });
      setHistoryIndex(prev => prev >= 0 ? prev + 1 : 0);
      setHtml(generatedHtml);
      
      // Add to visual history gallery (with slight delay to ensure render)
      setTimeout(() => {
        addToVisualHistory(generatedHtml, prompt, model);
      }, 100);

      // Auto-generate title in background
      generateTitle(fullPrompt).then(title => {
        setCurrentTitle(title);
      }).catch(() => {});

      // Track generation stats
      const generationTime = Date.now() - startTime;
      setGenerationStats({ time: generationTime, model: AI_PROVIDERS[model]?.name || model });

      // Complete progress bar
      if (generationProgressTimer.current) clearInterval(generationProgressTimer.current);
      setGenerationProgress(100);
      setTimeout(() => setGenerationProgress(0), 600);

      // Clear draft prompt after successful generation
      localStorage.removeItem('visual-ai-draft');
      showToast('success', `UI generated in ${(generationTime / 1000).toFixed(1)}s! ✨`);
    } catch (error: any) {
      // Silently ignore abort errors — user cancelled intentionally
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        if (generationProgressTimer.current) clearInterval(generationProgressTimer.current);
        setGenerationProgress(0);
        setIsLoading(false);
        return;
      }
      console.error('Error generating UI:', error);
      const msg: string = error?.message || '';
      let errorMessage = 'Failed to generate UI. Please try again.';
      let retryAction: { label: string; onClick: () => void } | undefined;

      if (msg.includes('API key') || msg.includes('api key') || msg.includes('Please set')) {
        errorMessage = msg;
      } else if (msg.includes('Network error') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        errorMessage = 'Network error. Check your internet connection.';
        retryAction = {
          label: 'Retry',
          onClick: () => handleGenerate(fullPrompt, model, contextHtml, images)
        };
      } else if (msg.includes('rate limit') || msg.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment.';
        retryAction = {
          label: 'Retry in 5s',
          onClick: () => setTimeout(() => handleGenerate(fullPrompt, model, contextHtml, images), 5000)
        };
      } else if (msg.includes('timeout') || msg.includes('Timeout')) {
        errorMessage = 'Request timed out. The model may be busy.';
        retryAction = { label: 'Retry', onClick: () => handleGenerate(fullPrompt, model, contextHtml, images) };
      } else if (msg.includes('quota')) {
        errorMessage = 'API quota exceeded. Check your plan limits.';
      } else if (msg.includes('Insufficient credits') || msg.includes('insufficient credits')) {
        errorMessage = 'Insufficient API credits. Try a different model or provider.';
      } else if (msg.includes('OpenAI error') || msg.includes('Anthropic error') || msg.includes('Gemini error') || msg.includes('OpenRouter error')) {
        errorMessage = msg;
        retryAction = { label: 'Retry', onClick: () => handleGenerate(fullPrompt, model, contextHtml, images) };
      } else if (msg) {
        errorMessage = msg;
        retryAction = { label: 'Retry', onClick: () => handleGenerate(fullPrompt, model, contextHtml, images) };
      }

      showToast('error', errorMessage, retryAction);
    } finally {
      setIsLoading(false);
      if (generationProgressTimer.current) clearInterval(generationProgressTimer.current);
    }
  }, [showToast, historyIndex, htmlHistory]);

  const handleQuickGenerate = useCallback((prompt: string) => {
    setPrompt(prompt);
    handleGenerate(prompt, lastModel, html);
  }, [handleGenerate, html, lastModel]);

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
    handleGenerate(refinement, lastModel, html);
  }, [handleGenerate, html, lastModel]);

  // Regenerate — re-run the last prompt from history
  const handleRegenerate = useCallback(() => {
    const lastPromptText = history[0]?.prompt;
    if (!lastPromptText || isLoading) return;
    handleGenerate(lastPromptText, lastModel);
    showToast('success', 'Regenerating with last prompt... 🔄');
  }, [history, isLoading, lastModel, handleGenerate, showToast]);

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

  // Export design as PNG image
  const handleExportPNG = useCallback(async () => {
    if (!html) {
      showToast('error', 'Nothing to export');
      return;
    }
    
    try {
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.background = theme === 'light' ? '#ffffff' : '#0f0f0f';
      container.style.padding = '32px';
      document.body.appendChild(container);
      
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, {
        backgroundColor: theme === 'light' ? '#ffffff' : '#0f0f0f',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `visual-ai-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      document.body.removeChild(container);
      showToast('success', 'PNG image downloaded! 🖼️');
    } catch (err) {
      showToast('error', 'Failed to export PNG');
    }
  }, [html, theme, showToast]);

  // Export design as PDF
  const handleExportPDF = useCallback(async () => {
    if (!html) {
      showToast('error', 'Nothing to export');
      return;
    }
    
    try {
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.background = theme === 'light' ? '#ffffff' : '#0f0f0f';
      container.style.padding = '32px';
      document.body.appendChild(container);

      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, {
        backgroundColor: theme === 'light' ? '#ffffff' : '#0f0f0f',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`visual-ai-${Date.now()}.pdf`);
      
      document.body.removeChild(container);
      showToast('success', 'PDF downloaded! 📄');
    } catch (err) {
      showToast('error', 'Failed to export PDF');
    }
  }, [html, theme, showToast]);

  // Export design to CodePen
  const handleExportCodePen = useCallback(() => {
    if (!html) {
      showToast('error', 'Nothing to export');
      return;
    }

    // Extract ALL CSS and JS from the HTML
    let css = '';
    let js = '';

    // Collect all style tags
    const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    css = styleMatches.map(m => m[1]).join('\n\n');

    // Collect all non-CDN inline script tags (skip external src scripts)
    const scriptMatches = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
    js = scriptMatches.map(m => m[1]).join('\n\n');

    // Clean HTML - remove style and script tags (CodePen will handle them separately)
    let cleanHtml = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<html[^>]*>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>|<!DOCTYPE[^>]*>/gi, '')
      .trim();

    // Build CodePen data - include all necessary CDNs
    const codepenData = {
      title: 'Visual AI Design',
      html: cleanHtml,
      css: css,
      js: js,
      editors: '110',
      layout: 'right',
      head: [
        '<script src="https://cdn.tailwindcss.com"></script>',
        '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>',
        '<script src="https://d3js.org/d3.v7.min.js"></script>',
        '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">',
      ].join('\n')
    };

    // Open CodePen in a new window with pre-filled data
    const codepenDataStr = JSON.stringify(codepenData);
    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = codepenDataStr;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    showToast('success', 'Opening CodePen... 🚀');
  }, [html, showToast]);

  // Export design to JSFiddle
  const handleExportJSFiddle = useCallback(() => {
    if (!html) {
      showToast('error', 'Nothing to export');
      return;
    }

    // Extract CSS and JS
    const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    const css = styleMatches.map(m => m[1]).join('\n\n');
    const scriptMatches = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
    const js = scriptMatches.map(m => m[1]).join('\n\n');
    const cleanHtml = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<html[^>]*>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>|<!DOCTYPE[^>]*>/gi, '')
      .trim();

    const resources = [
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
      'https://d3js.org/d3.v7.min.js',
    ].join(',');

    const form = document.createElement('form');
    form.action = 'https://jsfiddle.net/api/post/library/pure/';
    form.method = 'POST';
    form.target = '_blank';

    const fields: Record<string, string> = {
      html: cleanHtml,
      css: css,
      js: js,
      resources,
      title: 'Visual AI Design',
      wrap: 'b',
      panel_css: '0',
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    showToast('success', 'Opening JSFiddle... 🎻');
  }, [html, showToast]);

  // Capture thumbnail of current design
  const captureThumbnail = useCallback(async (htmlCode: string): Promise<string> => {
    return new Promise((resolve) => {
      // Create a temporary container to render the HTML
      const container = document.createElement('div');
      container.innerHTML = htmlCode;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '400px';
      container.style.background = '#0f0f0f';
      container.style.padding = '16px';
      document.body.appendChild(container);
      
      import('html2canvas').then(({ default: html2canvas }) => html2canvas(container, {
        backgroundColor: '#0f0f0f',
        scale: 0.5,
        logging: false,
        useCORS: true,
      })).then((canvas) => {
        const thumbnail = canvas.toDataURL('image/png');
        document.body.removeChild(container);
        resolve(thumbnail);
      }).catch(() => {
        document.body.removeChild(container);
        resolve('');
      });
    });
  }, []);

  // Add to visual history
  const addToVisualHistory = useCallback(async (htmlCode: string, promptText: string, modelUsed: ModelProvider) => {
    const thumbnail = await captureThumbnail(htmlCode);
    if (thumbnail) {
      const entry: VisualHistoryEntry = {
        id: Date.now().toString(),
        html: htmlCode,
        prompt: promptText,
        model: modelUsed,
        thumbnail,
        createdAt: Date.now()
      };
      setVisualHistory(prev => [entry, ...prev].slice(0, 50)); // Keep last 50
    }
  }, [captureThumbnail]);

  // Load from visual history
  const handleLoadFromGallery = useCallback((entry: VisualHistoryEntry) => {
    setHtml(entry.html);
    setShowGallery(false);
    showToast('success', 'Design loaded from gallery! 🖼️');
  }, [showToast]);

  // Clear visual history
  const handleClearVisualHistory = useCallback(() => {
    setVisualHistory([]);
    localStorage.removeItem('visual-ai-visual-history');
    showToast('success', 'Gallery cleared');
  }, [showToast]);

  // Delete single gallery entry
  const handleDeleteFromGallery = useCallback((id: string) => {
    setVisualHistory(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('visual-ai-visual-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

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

  // Mobile: close sidebar when clicking outside or selecting template
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on resize to desktop
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Swipe gesture to close sidebar on mobile
  useEffect(() => {
    if (!sidebarOpen) return;
    let startX = 0;
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);
      // Swipe left more than 60px, and not a vertical scroll
      if (dx < -60 && dy < 60) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else if (showFavorites) {
          setShowFavorites(false);
        } else if (showGallery) {
          setShowGallery(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        handleClear();
      }
      // Cmd/Ctrl + Enter to generate (when prompt has value)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim() && !isLoading) {
        e.preventDefault();
        handleGenerate(prompt, lastModel);
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
      // Cmd/Ctrl + Shift + R for regenerate (re-run last prompt)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        handleRegenerate();
      }
      // ? for shortcuts help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, isLoading, lastModel, historyIndex, htmlHistory, handleUndo, handleRedo, handleClear, handleGenerate, handleShare, handleExport, handleToggleTheme, handleSaveFavorite, handleRegenerate, showShortcuts, showFavorites, showGallery, sidebarOpen]);

  if (siteAuth === null || siteAuth === false) {
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
      {/* Skip to main content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      {/* Generation progress bar */}
      {generationProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none" aria-hidden="true">
          <div
            className="h-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary transition-all duration-300 ease-out"
            style={{ width: `${generationProgress}%`, opacity: generationProgress === 100 ? 0 : 1 }}
          />
        </div>
      )}
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
        maxWidth: 'min(85vw, 300px)',
        width: 'min(85vw, 300px)'
      }}>
        <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" /></div>}>
        <InputPanel
          onGenerate={handleGenerate}
          isLoading={isLoading}
          history={[...history].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))}
          onClose={() => setSidebarOpen(false)}
          prompt={prompt}
          onPromptChange={setPrompt}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
          styleFrame={styleFrame}
          onStyleFrameChange={setStyleFrame}
          onRefine={(refinement) => handleRefinePrompt('', refinement)}
          contextHtml={html}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onShare={handleShare}
          onExport={handleExport}
          onExportPNG={handleExportPNG}
          onExportPDF={handleExportPDF}
          onExportCodePen={handleExportCodePen}
          onSaveFavorite={handleSaveFavorite}
          generationStats={generationStats}
          currentHtmlLength={html.length}
        />
        </Suspense>
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
      <div id="main-content" className="flex-1 min-w-0">
        <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" /></div>}>
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
          onRegenerate={handleRegenerate}
          onCancelGeneration={handleCancelGeneration}
          lastPrompt={history[0]?.prompt}
          onShare={handleShare}
          onExport={handleExport}
          onExportPNG={handleExportPNG}
          onExportPDF={handleExportPDF}
          onExportCodePen={handleExportCodePen}
          onExportJSFiddle={handleExportJSFiddle}
          onSaveFavorite={handleSaveFavorite}
          onShowFavorites={() => setShowFavorites(true)}
          onShowGallery={() => setShowGallery(true)}
          visualHistoryCount={visualHistory.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          generationStats={generationStats}
        />
        </Suspense>
      </div>

      {/* Chat Widget */}
      <Suspense fallback={null}>
      <ChatWidget />
      </Suspense>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <div
            className="bg-bg-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="shortcuts-title" className="text-xl font-semibold gradient-text flex items-center gap-2">
                <Keyboard className="w-5 h-5" aria-hidden="true" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close keyboard shortcuts"
              >
                <X className="w-5 h-5" aria-hidden="true" />
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="favorites-title"
        >
          <div
            className="bg-bg-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 id="favorites-title" className="text-xl font-semibold gradient-text flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                Saved Favorites
                {favorites.length > 0 && <span className="text-sm font-normal text-text-muted">({favorites.length})</span>}
              </h2>
              <button
                onClick={() => setShowFavorites(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close favorites"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {/* Search bar */}
            {favorites.length > 0 && (
              <div className="relative mb-4 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-tertiary border border-white/10 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
                />
              </div>
            )}
            <div className="overflow-y-auto flex-1">
            {favorites.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No favorites saved yet</p>
                <p className="text-sm mt-1">Press ⌘+D to save your current design</p>
              </div>
            ) : (() => {
              const filtered = historySearch
                ? favorites.filter(f =>
                    f.name.toLowerCase().includes(historySearch.toLowerCase()) ||
                    f.prompt.toLowerCase().includes(historySearch.toLowerCase())
                  )
                : favorites;
              if (filtered.length === 0) return (
                <div className="text-center py-6 text-text-muted">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No favorites match "{historySearch}"</p>
                </div>
              );
              return (
                <div className="space-y-3">
                  {filtered.map((fav) => (
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadFavorite(fav)}
                          className="flex-1 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg transition-colors text-sm font-medium"
                        >
                          Load Design
                        </button>
                        {fav.prompt && (
                          <button
                            onClick={() => { setPrompt(fav.prompt); setShowFavorites(false); setSidebarOpen(true); showToast('success', 'Prompt loaded — edit and regenerate'); }}
                            className="px-3 py-2 bg-bg-secondary hover:bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm"
                            title="Load prompt for editing"
                          >
                            Use Prompt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            </div>
          </div>
        </div>
      )}

      {/* Visual History Gallery Modal */}
      {showGallery && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGallery(false)}
        >
          <div
            className="bg-bg-secondary border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold gradient-text flex items-center gap-2">
                <GalleryHorizontal className="w-5 h-5 text-accent-primary" />
                Design Gallery
                {visualHistory.length > 0 && (
                  <span className="text-sm font-normal text-text-muted">({visualHistory.length})</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {/* Grid/List toggle */}
                {visualHistory.length > 0 && (
                  <div className="flex items-center bg-bg-tertiary rounded-lg p-0.5 border border-white/5">
                    <button
                      onClick={() => setGalleryViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${galleryViewMode === 'grid' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
                      title="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGalleryViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${galleryViewMode === 'list' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {visualHistory.length > 0 && (
                  <button
                    onClick={handleClearVisualHistory}
                    className="text-sm text-text-muted hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowGallery(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Search bar */}
            {visualHistory.length > 0 && (
              <div className="relative mb-4 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={gallerySearch}
                  onChange={e => setGallerySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-tertiary border border-white/10 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
                />
              </div>
            )}
            <div className="overflow-y-auto flex-1 -mr-2 pr-2">
            {visualHistory.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <GalleryHorizontal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No designs in gallery yet</p>
                <p className="text-sm mt-1">Your generated designs will appear here</p>
              </div>
            ) : (() => {
              const filtered = gallerySearch
                ? visualHistory.filter(e =>
                    e.prompt.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                    (AI_PROVIDERS[e.model]?.name || e.model).toLowerCase().includes(gallerySearch.toLowerCase())
                  )
                : visualHistory;
              if (filtered.length === 0) return (
                <div className="text-center py-8 text-text-muted">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No designs match "{gallerySearch}"</p>
                </div>
              );
              return galleryViewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="list">
                  {filtered.map((entry) => (
                    <div
                      key={entry.id}
                      role="listitem"
                      tabIndex={0}
                      className="group relative bg-bg-tertiary rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-secondary"
                      onClick={() => handleLoadFromGallery(entry)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleLoadFromGallery(entry)}
                      aria-label={`Load design: ${entry.prompt || 'Generated design'}`}
                    >
                      <div className="aspect-video bg-bg-primary overflow-hidden">
                        {entry.thumbnail ? (
                          <img
                            src={entry.thumbnail}
                            alt={entry.prompt || 'Generated design'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <GalleryHorizontal className="w-8 h-8 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-text-muted line-clamp-2 mb-2">
                          {entry.prompt || 'No prompt'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-accent-primary">
                            {AI_PROVIDERS[entry.model]?.name || entry.model}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <span className="text-white font-medium text-sm">Load Design</span>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteFromGallery(entry.id); }}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove from gallery"
                        aria-label="Remove from gallery"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2" role="list">
                  {filtered.map((entry) => (
                    <div
                      key={entry.id}
                      role="listitem"
                      tabIndex={0}
                      className="group flex items-center gap-3 bg-bg-tertiary rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all overflow-hidden cursor-pointer p-3 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 focus:ring-offset-bg-secondary"
                      onClick={() => handleLoadFromGallery(entry)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleLoadFromGallery(entry)}
                      aria-label={`Load design: ${entry.prompt || 'Generated design'}`}
                    >
                      {entry.thumbnail && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-bg-primary">
                          <img
                            src={entry.thumbnail}
                            alt={entry.prompt || 'Generated design'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary line-clamp-1 mb-0.5">
                          {entry.prompt || 'No prompt'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-accent-primary">{AI_PROVIDERS[entry.model]?.name || entry.model}</span>
                          <span className="text-xs text-text-muted">{new Date(entry.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-text-muted group-hover:text-accent-primary transition-colors">Load →</span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteFromGallery(entry.id); }}
                          className="p-1 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove"
                          aria-label="Remove from gallery"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            </div>
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

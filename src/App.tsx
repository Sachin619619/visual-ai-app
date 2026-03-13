import { useState, useCallback } from 'react';
import { InputPanel } from './components/InputPanel';
import { VisualRenderer } from './components/VisualRenderer';
import { ChatWidget } from './components/ChatWidget';
import { ModelProvider, PromptHistory } from './types';
import { generateUI } from './lib/ai-providers';

function App() {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);

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
      {/* Left Panel - Input */}
      <InputPanel
        onGenerate={handleGenerate}
        isLoading={isLoading}
        history={history}
      />

      {/* Center - Visual Renderer */}
      <VisualRenderer
        html={html}
        isLoading={isLoading}
        onClear={handleClear}
      />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;

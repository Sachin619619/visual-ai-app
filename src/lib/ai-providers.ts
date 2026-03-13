import { ModelProvider } from '../types';

// AI Provider configurations
export const AI_PROVIDERS: Record<ModelProvider, { name: string; icon: string }> = {
  openai: { name: 'OpenAI GPT-4', icon: '🤖' },
  claude: { name: 'Claude 3', icon: '🧠' },
  gemini: { name: 'Gemini Pro', icon: '✨' },
  openrouter: { name: 'OpenRouter (Free)', icon: '🔗' },
  local: { name: 'Local Model', icon: '💻' },
};

// Global API key storage
let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => apiKey;

// Generate UI based on prompt
export const generateUI = async (
  prompt: string,
  model: ModelProvider
): Promise<string> => {
  // If API key is set, use real AI
  if (apiKey) {
    try {
      const result = await generateWithAI(prompt, model, apiKey);
      return result;
    } catch (error) {
      console.error('AI generation failed, falling back to demo:', error);
    }
  }
  
  // Fallback to demo mode
  await new Promise(resolve => setTimeout(resolve, 1500));
  const lowerPrompt = prompt.toLowerCase();
  
  // Chart responses
  if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) {
    if (lowerPrompt.includes('line')) {
      return generateLineChart();
    } else if (lowerPrompt.includes('bar')) {
      return generateBarChart();
    } else if (lowerPrompt.includes('pie') || lowerPrompt.includes('donut')) {
      return generatePieChart();
    }
    return generateLineChart();
  }
  
  // Timeline responses
  if (lowerPrompt.includes('timeline') || lowerPrompt.includes('journey') || lowerPrompt.includes('roadmap')) {
    return generateTimeline();
  }
  
  // Card responses
  if (lowerPrompt.includes('card') || lowerPrompt.includes('stats') || lowerPrompt.includes('dashboard')) {
    return generateCards();
  }
  
  // Table responses
  if (lowerPrompt.includes('table') || lowerPrompt.includes('data')) {
    return generateTable();
  }
  
  // Default: generate a sample UI based on prompt
  return generateDefaultUI(prompt);
};

const generateLineChart = () => `
<div class="card shadow">
  <h2 style="margin-bottom: 16px;">📈 Sales Trend</h2>
  <div class="chart-container">
    <canvas id="lineChart"></canvas>
  </div>
</div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#f8fafc' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  });
</script>
`;

const generateBarChart = () => `
<div class="card shadow">
  <h2 style="margin-bottom: 16px;">📊 Monthly Performance</h2>
  <div class="chart-container">
    <canvas id="barChart"></canvas>
  </div>
</div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: ['Product A', 'Product B', 'Product C', 'Product D'],
        datasets: [{
          label: 'Sales',
          data: [450, 320, 580, 420],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#f8fafc' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  });
</script>
`;

const generatePieChart = () => `
<div class="card shadow">
  <h2 style="margin-bottom: 16px;">🥧 Market Share</h2>
  <div class="chart-container">
    <canvas id="pieChart"></canvas>
  </div>
</div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    new Chart(document.getElementById('pieChart'), {
      type: 'doughnut',
      data: {
        labels: ['Enterprise', 'SMB', 'Consumer', 'Other'],
        datasets: [{
          data: [45, 30, 18, 7],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            position: 'right',
            labels: { color: '#f8fafc', padding: 20 } 
          } 
        }
      }
    });
  });
</script>
`;

const generateTimeline = () => `
<div class="card shadow">
  <h2 style="margin-bottom: 24px;">🗓️ Project Roadmap</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-date">Q1 2026</div>
      <div class="timeline-title">Phase 1: Foundation</div>
      <div class="timeline-desc">Setup infrastructure, core team, and initial architecture</div>
    </div>
    <div class="timeline-item">
      <div class="timeline-date">Q2 2026</div>
      <div class="timeline-title">Phase 2: Development</div>
      <div class="timeline-desc">Build MVP features and integrate AI capabilities</div>
    </div>
    <div class="timeline-item">
      <div class="timeline-date">Q3 2026</div>
      <div class="timeline-title">Phase 3: Testing</div>
      <div class="timeline-desc">Beta testing, feedback collection, and iterations</div>
    </div>
    <div class="timeline-item">
      <div class="timeline-date">Q4 2026</div>
      <div class="timeline-title">Phase 4: Launch</div>
      <div class="timeline-desc">Public release, marketing, and user onboarding</div>
    </div>
  </div>
</div>
`;

const generateCards = () => `
<div class="grid grid-4" style="margin-bottom: 24px;">
  <div class="stat-card">
    <div class="stat-value">12.5K</div>
    <div class="stat-label">Total Users</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">+24%</div>
    <div class="stat-label">Growth Rate</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">$89K</div>
    <div class="stat-label">Revenue</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">4.8★</div>
    <div class="stat-label">Rating</div>
  </div>
</div>
<div class="card shadow">
  <h3 style="margin-bottom: 16px;">Recent Activity</h3>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px;">
      <span style="font-size: 24px;">👤</span>
      <div>
        <div style="font-weight: 500;">New user registered</div>
        <div style="font-size: 12px; color: #64748b;">2 minutes ago</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px;">
      <span style="font-size: 24px;">💰</span>
      <div>
        <div style="font-weight: 500;">Payment received</div>
        <div style="font-size: 12px; color: #64748b;">15 minutes ago</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px;">
      <span style="font-size: 24px;">📊</span>
      <div>
        <div style="font-weight: 500;">Weekly report generated</div>
        <div style="font-size: 12px; color: #64748b;">1 hour ago</div>
      </div>
    </div>
  </div>
</div>
`;

const generateTable = () => `
<div class="card shadow">
  <h2 style="margin-bottom: 16px;">📋 Recent Transactions</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Customer</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>#TXN001</td>
        <td>John Smith</td>
        <td>$1,250</td>
        <td><span style="color: #10b981;">Completed</span></td>
        <td>Mar 13, 2026</td>
      </tr>
      <tr>
        <td>#TXN002</td>
        <td>Sarah Johnson</td>
        <td>$890</td>
        <td><span style="color: #f59e0b;">Pending</span></td>
        <td>Mar 12, 2026</td>
      </tr>
      <tr>
        <td>#TXN003</td>
        <td>Mike Wilson</td>
        <td>$2,100</td>
        <td><span style="color: #10b981;">Completed</span></td>
        <td>Mar 11, 2026</td>
      </tr>
      <tr>
        <td>#TXN004</td>
        <td>Emily Brown</td>
        <td>$560</td>
        <td><span style="color: #ef4444;">Failed</span></td>
        <td>Mar 10, 2026</td>
      </tr>
    </tbody>
  </table>
</div>
`;

const generateDefaultUI = (prompt: string) => `
<div class="card shadow">
  <h2 style="margin-bottom: 8px;">🎨 Generated UI</h2>
  <p style="color: #94a3b8; margin-bottom: 24px;">Based on your prompt: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"</p>
  
  <div class="grid grid-3">
    <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 12px;">🎯</div>
      <h3 style="margin-bottom: 8px;">Feature One</h3>
      <p style="color: #64748b; font-size: 14px;">Description of the first feature</p>
    </div>
    <div style="background: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 12px;">⚡</div>
      <h3 style="margin-bottom: 8px;">Feature Two</h3>
      <p style="color: #64748b; font-size: 14px;">Description of the second feature</p>
    </div>
    <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 12px;">🚀</div>
      <h3 style="margin-bottom: 8px;">Feature Three</h3>
      <p style="color: #64748b; font-size: 14px;">Description of the third feature</p>
    </div>
  </div>
  
  <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px;">
    <h3 style="margin-bottom: 12px;">💡 Try these prompts:</h3>
    <ul style="color: #94a3b8; list-style: none; display: flex; flex-direction: column; gap: 8px;">
      <li>• "Show me a line chart of sales data"</li>
      <li>• "Create a timeline for my project"</li>
      <li>• "Display stats cards with metrics"</li>
      <li>• "Show a data table"</li>
    </ul>
  </div>
</div>
`;

// Chat with AI (simulated)
export const chatWithAI = async (message: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! 👋 I'm your AI assistant. I can help you generate charts, timelines, cards, and more. Just describe what you want to see!";
  }
  
  if (lower.includes('chart')) {
    return "I can create charts for you! Try prompts like 'show me a line chart' or 'create a bar graph for my sales data'.";
  }
  
  if (lower.includes('timeline') || lower.includes('roadmap')) {
    return "I can generate timelines and roadmaps. Try 'create a project timeline' or 'show a journey map'.";
  }
  
  return "I'm here to help! You can ask me to create charts, timelines, data cards, tables, and more. Just describe what you'd like to see!";
};

// Real AI generation
async function generateWithAI(prompt: string, model: ModelProvider, apiKey: string): Promise<string> {
  const systemPrompt = `You are a UI generator. Generate HTML/CSS code based on the user's request.
Rules:
- Return ONLY the HTML code, no explanations
- Use inline styles with dark theme (background #0a0a0b, text #ffffff)
- Use Tailwind-like utility classes if needed
- Include Chart.js for charts (from CDN)
- Make it look professional
- Respond with valid HTML that can be rendered in a div`;

  let response;
  
  if (model === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateDefaultUI(prompt);
  } 
  
  if (model === 'gemini') {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateDefaultUI(prompt);
  }
  
  if (model === 'claude') {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await response.json();
    return data.content?.[0]?.text || generateDefaultUI(prompt);
  }
  
  if (model === 'openrouter') {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://visual-ai.vercel.app',
        'X-Title': 'Visual AI App'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateDefaultUI(prompt);
  }
  
  return generateDefaultUI(prompt);
}

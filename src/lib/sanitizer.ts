import DOMPurify from 'dompurify';

// Configuration for DOMPurify
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'nav',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
    'canvas', 'svg', 'path', 'rect', 'circle', 'line', 'text',
    'style', 'script' // Allow but will be handled carefully
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'className', 'id', 'style',
    'type', 'name', 'value', 'placeholder', 'required',
    'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
    'data-label', 'data-value', 'data-color'
  ],
  ALLOW_DATA_ATTR: true,
};

export const sanitizeHtml = (html: string): string => {
  // First, remove any potentially dangerous script tags except for safe ones
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Use DOMPurify for final sanitization
  return DOMPurify.sanitize(cleaned, sanitizeConfig);
};

export const createSandboxContent = (html: string): string => {
  const sanitized = sanitizeHtml(html);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%);
      color: #f8fafc;
      min-height: 100vh;
      padding: 24px;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
    }
    .card {
      background: rgba(18, 18, 26, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      backdrop-filter: blur(12px);
    }
    .btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: scale(1.02);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }
    .input {
      background: #1a1a24;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 12px 16px;
      color: #f8fafc;
      width: 100%;
    }
    .input:focus {
      outline: none;
      border-color: #8b5cf6;
    }
    .grid {
      display: grid;
      gap: 16px;
    }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 8px; }
    .gap-4 { gap: 16px; }
    .text-center { text-align: center; }
    .text-sm { font-size: 12px; }
    .text-lg { font-size: 18px; }
    .text-xl { font-size: 22px; }
    .font-bold { font-weight: 700; }
    .text-muted { color: #94a3b8; }
    .text-accent { color: #8b5cf6; }
    .text-cyan { color: #06b6d4; }
    .text-green { color: #10b981; }
    .text-red { color: #ef4444; }
    .p-4 { padding: 16px; }
    .mb-4 { margin-bottom: 16px; }
    .rounded { border-radius: 8px; }
    .shadow { box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4); }
    
    /* Timeline styles */
    .timeline {
      position: relative;
      padding-left: 30px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    }
    .timeline-item {
      position: relative;
      padding-bottom: 24px;
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -26px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #8b5cf6;
      border: 2px solid #0a0a0f;
    }
    .timeline-date {
      font-size: 12px;
      color: #06b6d4;
      margin-bottom: 4px;
    }
    .timeline-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    .timeline-desc {
      color: #94a3b8;
      font-size: 14px;
    }
    
    /* Stats card */
    .stat-card {
      background: rgba(18, 18, 26, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    
    /* Chart container */
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
    
    /* Table styles */
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th,
    .data-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .data-table th {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
      font-weight: 600;
    }
    .data-table tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    
    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4 {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  ${sanitized}
  <script>
    // Auto-initialize any chart canvases
    document.addEventListener('DOMContentLoaded', function() {
      // Find all chart containers and initialize
      const chartContainers = document.querySelectorAll('[data-chart-type]');
      chartContainers.forEach(function(container) {
        const type = container.getAttribute('data-chart-type');
        const labels = JSON.parse(container.getAttribute('data-labels') || '[]');
        const data = JSON.parse(container.getAttribute('data-chart-data') || '[]');
        const label = container.getAttribute('data-chart-label') || 'Data';
        
        if (type && labels.length && data.length) {
          new Chart(container.querySelector('canvas'), {
            type: type,
            data: {
              labels: labels,
              datasets: [{
                label: label,
                data: data,
                backgroundColor: type === 'line' ? 'rgba(139, 92, 246, 0.1)' : [
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: '#8b5cf6',
                borderWidth: 2,
                fill: type === 'line'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: '#f8fafc' }
                }
              },
              scales: {
                x: {
                  ticks: { color: '#94a3b8' },
                  grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                  ticks: { color: '#94a3b8' },
                  grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
              }
            }
          });
        }
      });
    });
  </script>
</body>
</html>
  `;
};

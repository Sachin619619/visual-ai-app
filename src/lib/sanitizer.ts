import DOMPurify from 'dompurify';
import { PreviewTheme } from '../types';

// Configuration for DOMPurify - less aggressive to preserve more HTML
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'blockquote',
    'ul', 'ol', 'li',
    'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'nav', 'aside',
    'a', 'img', 'figure', 'figcaption', 'picture', 'source',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'tfoot', 'caption',
    'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'fieldset', 'legend',
    'canvas', 'svg', 'path', 'rect', 'circle', 'line', 'text', 'g', 'defs', 'use', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask',
    'style', 'link', 'meta', 'title',
    'iframe', // Allow iframes for embeds
    'audio', 'video', 'source',
    'code', 'pre', 'kbd', 'samp',
    'b', 'i', 'u', 'strong', 'em', 'del', 'ins', 'sub', 'sup',
    'ul', 'ol', 'li',
    'slot'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'className', 'id', 'style', 'target', 'rel',
    'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked', 'selected',
    'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'data-label', 'data-value', 'data-color', 'data-chart-type', 'data-chart-data', 'data-labels', 'data-chart-label',
    'aria-label', 'aria-hidden', 'role', 'tabindex',
    'loading', 'decoding', 'crossorigin',
    'preserveAspectRatio', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'x2', 'y1', 'y2',
    'transform', 'opacity', 'filter'
  ],
  ALLOW_DATA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: true,
  ADD_TAGS: ['iframe'],
};

export const sanitizeHtml = (html: string): string => {
  // First, unescape any HTML entities that might have been double-escaped
  // (e.g., &lt; -> <, &gt; -> >, &amp; -> &)
  let cleaned = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Also handle escaped backslashes (e.g., \&lt; -> <)
  cleaned = cleaned.replace(/\\</g, '<').replace(/\\>/g, '>');
  
  // Remove any potentially dangerous script tags except for safe ones
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Use DOMPurify for final sanitization
  return DOMPurify.sanitize(cleaned, sanitizeConfig);
};

const getThemeStyles = (theme: PreviewTheme) => {
  if (theme === 'light') {
    return `
    body {
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      min-height: 100vh;
      padding: 24px;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      color: #0f172a;
    }
    .card {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
      background: #f1f5f9;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      padding: 12px 16px;
      color: #1e293b;
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
    .text-muted { color: #64748b; }
    .text-accent { color: #7c3aed; }
    .text-cyan { color: #0891b2; }
    .text-green { color: #059669; }
    .text-red { color: #dc2626; }
    .p-4 { padding: 16px; }
    .mb-4 { margin-bottom: 16px; }
    .rounded { border-radius: 8px; }
    .shadow { box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1); }
    
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
      background: linear-gradient(135deg, #8b5cf6 0%, #0891b2 100%);
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
      border: 2px solid #f8fafc;
    }
    .timeline-date {
      font-size: 12px;
      color: #0891b2;
      margin-bottom: 4px;
    }
    .timeline-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    .timeline-desc {
      color: #64748b;
      font-size: 14px;
    }
    
    /* Stats card */
    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
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
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .data-table th {
      background: rgba(139, 92, 246, 0.1);
      color: #7c3aed;
      font-weight: 600;
    }
    .data-table tr:hover {
      background: rgba(0, 0, 0, 0.02);
    }
    
    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4 {
        grid-template-columns: 1fr;
      }
    }
`;
  }
  // Dark theme (default)
  return `
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
`;
};

export const createSandboxContent = (html: string, theme: PreviewTheme = 'dark'): string => {
  console.log('🧹 Sanitizer input (first 300 chars):', html.substring(0, 300));
  const sanitized = sanitizeHtml(html);
  console.log('🧹 Sanitizer output (first 300 chars):', sanitized.substring(0, 300));
  const themeStyles = getThemeStyles(theme);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    ${themeStyles}
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
          const textColor = '${theme}' === 'light' ? '#1e293b' : '#f8fafc';
          const gridColor = '${theme}' === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
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
                  labels: { color: textColor }
                }
              },
              scales: {
                x: {
                  ticks: { color: textColor },
                  grid: { color: gridColor }
                },
                y: {
                  ticks: { color: textColor },
                  grid: { color: gridColor }
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

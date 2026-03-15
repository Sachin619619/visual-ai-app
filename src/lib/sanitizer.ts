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

/**
 * Sanitizes HTML by unescaping double-encoded entities, removing unsafe script
 * tags and inline event handlers, then running DOMPurify.
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for display in an iframe
 */
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

    /* === ENHANCED VISUAL UTILITIES (light) === */
    .gradient-text {
      background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .glass-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .glow-violet { box-shadow: 0 0 20px rgba(124,58,237,0.25); }
    .glow-cyan { box-shadow: 0 0 20px rgba(8,145,178,0.25); }
    .glow-green { box-shadow: 0 0 20px rgba(5,150,105,0.25); }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-24px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
    .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out both; }
    .animate-scaleIn { animation: scaleIn 0.5s ease-out both; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; } .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; } .delay-600 { animation-delay: 0.6s; }
    .auto-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .auto-grid-sm { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
      background: rgba(124,58,237,0.1); color: #7c3aed; border: 1px solid rgba(124,58,237,0.2);
    }
    .tag-success { background: rgba(5,150,105,0.1); color: #059669; border-color: rgba(5,150,105,0.2); }
    .tag-warning { background: rgba(217,119,6,0.1); color: #d97706; border-color: rgba(217,119,6,0.2); }
    .tag-danger { background: rgba(220,38,38,0.1); color: #dc2626; border-color: rgba(220,38,38,0.2); }
    .stat-card-accent {
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 12px; padding: 20px; position: relative; overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .stat-card-accent::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, #7c3aed, #0891b2);
    }
    .step-list { list-style: none; padding: 0; counter-reset: step-counter; }
    .step-item {
      counter-increment: step-counter; position: relative;
      padding: 16px 16px 16px 60px; margin-bottom: 12px;
      background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.07); border-radius: 12px;
    }
    .step-item::before {
      content: counter(step-counter); position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      width: 30px; height: 30px; background: linear-gradient(135deg, #7c3aed, #0891b2);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: white; line-height: 30px; text-align: center;
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

    /* === ENHANCED VISUAL UTILITIES (dark) === */

    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gradient-text-hot {
      background: linear-gradient(135deg, #f43f5e 0%, #f97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gradient-text-green {
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Glassmorphism cards */
    .glass-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
    }
    .glass-card-accent {
      background: rgba(139, 92, 246, 0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 16px;
      padding: 20px;
    }

    /* Neon / glow effects */
    .glow-violet {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.15);
    }
    .glow-cyan {
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.15);
    }
    .glow-green {
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.15);
    }
    .glow-rose {
      box-shadow: 0 0 20px rgba(244, 63, 94, 0.4), 0 0 40px rgba(244, 63, 94, 0.15);
    }
    .text-glow-violet { text-shadow: 0 0 12px rgba(139, 92, 246, 0.8); }
    .text-glow-cyan { text-shadow: 0 0 12px rgba(6, 182, 212, 0.8); }

    /* Gradient borders */
    .border-gradient {
      border: 1px solid transparent;
      background: linear-gradient(#12121a, #12121a) padding-box,
                  linear-gradient(135deg, #8b5cf6, #06b6d4) border-box;
      border-radius: 12px;
    }
    .border-gradient-hot {
      border: 1px solid transparent;
      background: linear-gradient(#12121a, #12121a) padding-box,
                  linear-gradient(135deg, #f43f5e, #f97316) border-box;
      border-radius: 12px;
    }

    /* Animated gradient backgrounds */
    .bg-animated-gradient {
      background: linear-gradient(270deg, #8b5cf6, #06b6d4, #10b981, #8b5cf6);
      background-size: 400% 400%;
      animation: gradientShift 8s ease infinite;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Entry animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-24px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(24px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); }
      50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes barGrow {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    @keyframes progressFill {
      from { width: 0%; }
      to { width: var(--target-width, 100%); }
    }
    @keyframes ringFill {
      from { stroke-dashoffset: var(--ring-circumference, 283); }
      to { stroke-dashoffset: var(--ring-offset, 0); }
    }

    .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
    .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out both; }
    .animate-fadeInRight { animation: fadeInRight 0.6s ease-out both; }
    .animate-scaleIn { animation: scaleIn 0.5s ease-out both; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
    .animate-spin-slow { animation: spin-slow 4s linear infinite; }

    /* Stagger delay utilities */
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
    .delay-600 { animation-delay: 0.6s; }
    .delay-700 { animation-delay: 0.7s; }
    .delay-800 { animation-delay: 0.8s; }

    /* Infographic layout helpers */
    .info-section {
      background: rgba(18, 18, 26, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .info-section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2));
      border: 1px solid rgba(139,92,246,0.3);
      flex-shrink: 0;
    }

    /* Progress ring */
    .progress-ring-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .progress-ring-circle {
      transition: stroke-dashoffset 1s ease-out;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }

    /* Better responsive grid */
    .auto-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .auto-grid-sm {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    /* Stat card variant with top accent bar */
    .stat-card-accent {
      background: rgba(18, 18, 26, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .stat-card-accent::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #8b5cf6, #06b6d4);
    }

    /* Comparison card */
    .compare-col {
      flex: 1;
      background: rgba(18, 18, 26, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      overflow: hidden;
    }
    .compare-header {
      padding: 20px;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
    }
    .compare-body {
      padding: 16px 20px;
    }
    .compare-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 14px;
    }

    /* Tag / badge */
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }
    .tag-success { background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.25); }
    .tag-warning { background: rgba(245,158,11,0.15); color: #f59e0b; border-color: rgba(245,158,11,0.25); }
    .tag-danger  { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.25); }
    .tag-info    { background: rgba(6,182,212,0.15); color: #06b6d4; border-color: rgba(6,182,212,0.25); }

    /* Step process */
    .step-list { list-style: none; padding: 0; counter-reset: step-counter; }
    .step-item {
      counter-increment: step-counter;
      position: relative;
      padding: 16px 16px 16px 60px;
      margin-bottom: 12px;
      background: rgba(18,18,26,0.7);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
    }
    .step-item::before {
      content: counter(step-counter);
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      line-height: 30px;
      text-align: center;
    }
`;
};

// Standard CDN scripts to always inject
const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';
const D3_CDN = 'https://d3js.org/d3.v7.min.js';
const LOTTIE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
const FONTS_CDN = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

const DATA_CHART_INIT_SCRIPT = (theme: PreviewTheme) => `
<script>
(function() {
  // 1. Auto-init data-chart-type elements
  function initCharts() {
    var containers = document.querySelectorAll('[data-chart-type]');
    containers.forEach(function(container) {
      var type = container.getAttribute('data-chart-type');
      var labels = JSON.parse(container.getAttribute('data-labels') || '[]');
      var values = JSON.parse(container.getAttribute('data-chart-data') || '[]');
      var label = container.getAttribute('data-chart-label') || 'Data';
      var canvas = container.querySelector('canvas');
      if (type && labels.length && values.length && canvas && window.Chart) {
        var tc = '${theme}' === 'light' ? '#1e293b' : '#f8fafc';
        var gc = '${theme}' === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
        new Chart(canvas, {
          type: type,
          data: {
            labels: labels,
            datasets: [{ label: label, data: values,
              backgroundColor: type === 'line' ? 'rgba(139,92,246,0.15)' :
                ['rgba(139,92,246,0.85)','rgba(6,182,212,0.85)','rgba(16,185,129,0.85)','rgba(245,158,11,0.85)','rgba(239,68,68,0.85)'],
              borderColor: '#8b5cf6', borderWidth: 2, fill: type === 'line', tension: 0.4 }]
          },
          options: { responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: tc } } },
            scales: { x: { ticks: { color: tc }, grid: { color: gc } }, y: { ticks: { color: tc }, grid: { color: gc } } }
          }
        });
      }
    });
  }

  // 2. Counter animation for data-count elements
  function animateCounters() {
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function(el) {
      var target = parseFloat(el.getAttribute('data-count') || '0');
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0');
      var duration = parseInt(el.getAttribute('data-duration') || '1500');
      var start = Date.now();
      var frame = function() {
        var progress = Math.min((Date.now() - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  // 3. Animate progress bars with data-target attribute
  function animateProgressBars() {
    var bars = document.querySelectorAll('[data-target]');
    bars.forEach(function(bar) {
      var target = bar.getAttribute('data-target') || '0%';
      setTimeout(function() {
        bar.style.width = target;
      }, 100);
    });
  }

  function init() {
    initCharts();
    animateCounters();
    animateProgressBars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;

/**
 * Wraps raw HTML (full document or partial body content) into a self-contained
 * sandbox document suitable for rendering inside an iframe.
 * Injects theme CSS, Chart.js CDN, Google Fonts, and the data-chart auto-init
 * script. Full HTML documents are passed through largely unchanged.
 * @param html - Raw HTML string (full doc or partial body content)
 * @param theme - Preview theme ('dark' | 'light'), defaults to 'dark'
 * @returns A complete HTML document string ready for srcdoc injection
 */
export const createSandboxContent = (html: string, theme: PreviewTheme = 'dark'): string => {
  const trimmed = html.trim();
  const themeStyles = getThemeStyles(theme);

  const headInjectables = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${FONTS_CDN}" rel="stylesheet">
  <script src="${CHART_JS_CDN}"><\/script>
  <script src="${D3_CDN}"><\/script>
  <script src="${LOTTIE_CDN}"><\/script>`;

  // ── CASE 1: Full HTML document ────────────────────────────────────────────
  // Use the AI's HTML directly — preserves ALL JavaScript, styles, libraries.
  // The iframe's sandbox="allow-scripts" (no allow-same-origin) already prevents
  // any script from accessing the parent page, localStorage, cookies, etc.
  const lc = trimmed.toLowerCase();
  if (lc.startsWith('<!doctype') || lc.startsWith('<html')) {
    let doc = trimmed;

    // Inject Chart.js CDN if absent
    if (!doc.includes(CHART_JS_CDN)) {
      if (/<head[^>]*>/i.test(doc)) {
        doc = doc.replace(/<head([^>]*)>/i, `<head$1>\n  <script src="${CHART_JS_CDN}"><\/script>`);
      } else {
        // No <head> — insert one after <html ...>
        doc = doc.replace(/<html([^>]*)>/i, `<html$1>\n<head>\n  <meta charset="UTF-8">\n  <script src="${CHART_JS_CDN}"><\/script>\n</head>`);
      }
    }

    // Inject D3.js CDN if absent
    if (!doc.includes('d3js.org') && !doc.includes('d3.v')) {
      doc = doc.replace(/<head([^>]*)>/i, `<head$1>\n  <script src="${D3_CDN}"><\/script>`);
    }

    // Inject Lottie CDN if absent
    if (!doc.includes('lottie')) {
      doc = doc.replace(/<head([^>]*)>/i, `<head$1>\n  <script src="${LOTTIE_CDN}"><\/script>`);
    }

    // Inject Google Fonts if absent
    if (!doc.includes('fonts.googleapis.com')) {
      doc = doc.replace(/<head([^>]*)>/i, `<head$1>\n  <link href="${FONTS_CDN}" rel="stylesheet">`);
    }

    // Append data-chart auto-init before </body>
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${DATA_CHART_INIT_SCRIPT(theme)}\n</body>`);
    } else {
      doc += DATA_CHART_INIT_SCRIPT(theme);
    }

    return doc;
  }

  // ── CASE 2: Partial HTML (body content only) ──────────────────────────────
  // Strip only obvious injection vectors (event handlers, javascript: URLs).
  // Script tags are preserved so inline JS still runs.
  const safeBody = trimmed
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')  // strip onclick="..." etc.
    .replace(/href\s*=\s*["']\s*javascript\s*:[^"']*["']/gi, 'href="#"');

  return `<!DOCTYPE html>
<html lang="en">
<head>${headInjectables}
  <style>${themeStyles}</style>
</head>
<body>
  ${safeBody}
  ${DATA_CHART_INIT_SCRIPT(theme)}
</body>
</html>`;
};

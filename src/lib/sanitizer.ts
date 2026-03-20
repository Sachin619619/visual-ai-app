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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      background: #f8fafc;
      background-image: radial-gradient(circle, rgba(124,58,237,0.10) 1px, transparent 1px);
      background-size: 28px 28px;
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
    html { scroll-behavior: smooth; }
    body {
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      background: #0a0a0f;
      background-image: radial-gradient(circle, rgba(139,92,246,0.12) 1px, transparent 1px);
      background-size: 28px 28px;
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

    /* Section divider with gradient */
    .section-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 28px 0;
    }
    .section-divider::before,
    .section-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
    }
    .section-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      white-space: nowrap;
    }

    /* Gradient underline for section headers */
    .section-title {
      display: inline-block;
      padding-bottom: 8px;
      border-bottom: 2px solid transparent;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4) bottom / 100% 2px no-repeat,
                  linear-gradient(135deg, #8b5cf6, #06b6d4);
      -webkit-background-clip: text, padding-box;
      background-clip: text, padding-box;
      -webkit-text-fill-color: transparent;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
    }

    /* Callout / highlight box */
    .callout {
      background: rgba(139,92,246,0.08);
      border-left: 3px solid #8b5cf6;
      border-radius: 0 12px 12px 0;
      padding: 14px 18px;
      margin: 16px 0;
    }
    .callout-success { border-color: #10b981; background: rgba(16,185,129,0.08); }
    .callout-warning { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
    .callout-danger  { border-color: #ef4444; background: rgba(239,68,68,0.08); }

    /* Badge / pill */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(139,92,246,0.15);
      color: #c4b5fd;
      border: 1px solid rgba(139,92,246,0.25);
    }
    .badge-success { background: rgba(16,185,129,0.15); color: #6ee7b7; border-color: rgba(16,185,129,0.25); }
    .badge-warning { background: rgba(245,158,11,0.15); color: #fcd34d; border-color: rgba(245,158,11,0.25); }
    .badge-danger  { background: rgba(239,68,68,0.15); color: #fca5a5; border-color: rgba(239,68,68,0.25); }
    .badge-new { background: linear-gradient(135deg,rgba(139,92,246,0.3),rgba(6,182,212,0.3)); color: #f8fafc; border-color: rgba(139,92,246,0.4); }

    /* NEW: Extended gradient patterns */
    .gradient-sunset { background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6); }
    .gradient-ocean { background: linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6); }
    .gradient-forest { background: linear-gradient(135deg, #10b981, #14b8a6, #06b6d4); }
    .gradient-aurora { background: linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981); }
    .gradient-fire { background: linear-gradient(135deg, #ef4444, #f97316, #eab308); }
    .gradient-candy { background: linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4); }
    .gradient-midnight { background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95); }
    .gradient-pastel { background: linear-gradient(135deg, #fbcfe8, #c4b5fd, #bae6fd); }

    /* NEW: Extended glow effects */
    .glow-orange { box-shadow: 0 0 20px rgba(249, 115, 22, 0.25); }
    .glow-pink { box-shadow: 0 0 20px rgba(236, 72, 153, 0.25); }
    .glow-yellow { box-shadow: 0 0 20px rgba(234, 179, 8, 0.25); }
    .glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.25); }
    .glow-white { box-shadow: 0 0 20px rgba(255, 255, 255, 0.15); }
    .glow-xl { box-shadow: 0 0 40px rgba(139, 92, 246, 0.35); }
    .glow-double { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2), 0 0 40px rgba(6, 182, 212, 0.2); }

    /* NEW: Extended text glow */
    .text-glow-orange { text-shadow: 0 0 12px rgba(249, 115, 22, 0.8); }
    .text-glow-pink { text-shadow: 0 0 12px rgba(236, 72, 153, 0.8); }
    .text-glow-yellow { text-shadow: 0 0 12px rgba(234, 179, 8, 0.8); }
    .text-glow-white { text-shadow: 0 0 8px rgba(255, 255, 255, 0.5); }

    /* NEW: Glassmorphism variants */
    .glass-light { backdrop-filter: blur(20px); background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); }
    .glass-dark { backdrop-filter: blur(20px); background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glass-accent { backdrop-filter: blur(20px); background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.25); }
    .glass-cyan { backdrop-filter: blur(20px); background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.25); }

    /* NEW: Animated gradient backgrounds */
    .gradient-animate { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
    @keyframes gradient-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

    /* NEW: Pulsing dot indicator */
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6; animation: pulse-dot 2s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

    /* NEW: Animated border */
    .border-animate { position: relative; }
    .border-animate::after { content: ''; position: absolute; inset: -2px; border-radius: inherit; background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #8b5cf6); background-size: 300% 100%; animation: border-flow 3s linear infinite; z-index: -1; }
    @keyframes border-flow { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }

    /* NEW: Shine effect on hover */
    .shine-hover { position: relative; overflow: hidden; }
    .shine-hover::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: left 0.5s; }
    .shine-hover:hover::before { left: 100%; }

    /* NEW: Icon container styles */
    .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(139, 92, 246, 0.15); }
    .icon-box-sm { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(139, 92, 246, 0.1); }
    .icon-box-lg { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: rgba(139, 92, 246, 0.2); }

    /* NEW: Number counter animation */
    .counter-animate { animation: counter-pop 0.3s ease-out; }
    @keyframes counter-pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    /* NEW: Noise/grain texture overlay for depth */
    .noise-overlay { position: relative; }
    .noise-overlay::after { content: ''; position: absolute; inset: 0; border-radius: inherit; opacity: 0.04; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size: 128px 128px; }

    /* NEW: Morphing animated blob */
    .blob { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation: morph 8s ease-in-out infinite; }
    .blob-sm { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation: morph 6s ease-in-out infinite; }
    @keyframes morph { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 50% { border-radius: 50% 60% 30% 60% / 30% 50% 60% 40%; } 75% { border-radius: 40% 50% 60% 30% / 70% 30% 50% 60%; } }

    /* NEW: Neon flicker animation */
    .neon-flicker { animation: neon-flicker 3s ease-in-out infinite; }
    @keyframes neon-flicker { 0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; filter: brightness(1.2); } 20%,24%,55% { opacity: 0.7; filter: brightness(0.9); } }

    /* NEW: Typewriter cursor */
    .typewriter { overflow: hidden; border-right: 2px solid #8b5cf6; white-space: nowrap; animation: typewriter-cursor 1s step-end infinite; }
    @keyframes typewriter-cursor { 0%,100% { border-color: #8b5cf6; } 50% { border-color: transparent; } }

    /* NEW: Radial spotlight glow background */
    .spotlight { background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%); }
    .spotlight-cyan { background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 70%); }
    .spotlight-green { background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 70%); }

    /* NEW: Float animation for cards/elements */
    .float { animation: float 4s ease-in-out infinite; }
    .float-slow { animation: float 6s ease-in-out infinite; }
    .float-fast { animation: float 2.5s ease-in-out infinite; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

    /* NEW: Gradient border via outline trick */
    .gradient-border { border: 1px solid transparent; background-clip: padding-box; position: relative; }
    .gradient-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; background: linear-gradient(135deg, #8b5cf6, #06b6d4); z-index: -1; }

    /* NEW: Frosted badge (improved pill) */
    .frosted-badge { backdrop-filter: blur(12px); background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.35); border-radius: 999px; padding: 2px 10px; font-size: 0.75rem; color: #c4b5fd; display: inline-flex; align-items: center; gap: 4px; }

    /* NEW: Skeleton shimmer */
    .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: skeleton-wave 1.5s ease-in-out infinite; border-radius: 6px; }
    @keyframes skeleton-wave { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* NEW: 3D Flip card — add class="flip-card" wrapper, flip-card-inner, flip-card-front, flip-card-back */
    .flip-card { perspective: 1000px; cursor: pointer; }
    .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1); transform-style: preserve-3d; }
    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
    .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: inherit; }
    .flip-card-back { transform: rotateY(180deg); }

    /* NEW: Aurora animated background */
    .aurora-bg { position: relative; overflow: hidden; }
    .aurora-bg::before { content: ''; position: absolute; inset: -50%; width: 200%; height: 200%; background: conic-gradient(from 180deg at 50% 70%, #8b5cf680 0deg, #06b6d480 60deg, #10b98180 120deg, #8b5cf680 180deg, #6366f180 240deg, #06b6d480 300deg, #8b5cf680 360deg); animation: aurora-spin 12s linear infinite; filter: blur(60px); opacity: 0.35; pointer-events: none; z-index: 0; }
    .aurora-bg > * { position: relative; z-index: 1; }
    @keyframes aurora-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* NEW: Glitch text effect for tech/gaming */
    .glitch { position: relative; }
    .glitch::before, .glitch::after { content: attr(data-text); position: absolute; inset: 0; }
    .glitch::before { color: #06b6d4; animation: glitch-1 3s infinite linear; clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
    .glitch::after { color: #ec4899; animation: glitch-2 3s infinite linear; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
    @keyframes glitch-1 { 0%,90%,100% { transform: translate(0); opacity: 0; } 92% { transform: translate(-3px, 1px); opacity: 0.8; } 96% { transform: translate(3px, -1px); opacity: 0.8; } }
    @keyframes glitch-2 { 0%,85%,100% { transform: translate(0); opacity: 0; } 87% { transform: translate(3px, 2px); opacity: 0.7; } 93% { transform: translate(-3px, -2px); opacity: 0.7; } }

    /* NEW: Horizontal scrolling ticker tape */
    .ticker-wrap { overflow: hidden; width: 100%; }
    .ticker { display: flex; width: max-content; animation: ticker-scroll 20s linear infinite; }
    .ticker-item { padding: 0 2rem; white-space: nowrap; }
    .ticker-wrap:hover .ticker { animation-play-state: paused; }
    @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

    /* NEW: Ping pulse ring (for live/active indicators) */
    .ping-ring { position: relative; display: inline-flex; }
    .ping-ring::before { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid currentColor; animation: ping-pulse 1.5s ease-out infinite; opacity: 0.6; }
    @keyframes ping-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }

    /* NEW: Shimmer text (chrome/metallic look) */
    .shimmer-text { background: linear-gradient(90deg, #c4b5fd 0%, #ffffff 40%, #c4b5fd 60%, #06b6d4 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer-sweep 3s linear infinite; }
    @keyframes shimmer-sweep { from { background-position: 200% center; } to { background-position: -200% center; } }

    /* NEW: Staggered fade-in for grids & lists — add class="stagger-children" to any grid/flex container */
    .stagger-children > * { opacity: 0; animation: stagger-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
    .stagger-children > *:nth-child(1)  { animation-delay: 0.04s; }
    .stagger-children > *:nth-child(2)  { animation-delay: 0.10s; }
    .stagger-children > *:nth-child(3)  { animation-delay: 0.16s; }
    .stagger-children > *:nth-child(4)  { animation-delay: 0.22s; }
    .stagger-children > *:nth-child(5)  { animation-delay: 0.28s; }
    .stagger-children > *:nth-child(6)  { animation-delay: 0.34s; }
    .stagger-children > *:nth-child(7)  { animation-delay: 0.40s; }
    .stagger-children > *:nth-child(8)  { animation-delay: 0.46s; }
    .stagger-children > *:nth-child(9)  { animation-delay: 0.52s; }
    .stagger-children > *:nth-child(10) { animation-delay: 0.58s; }
    .stagger-children > *:nth-child(11) { animation-delay: 0.64s; }
    .stagger-children > *:nth-child(12) { animation-delay: 0.70s; }
    @keyframes stagger-in { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

    /* NEW: Animated gradient progress bar — usage: <div class="progress-bar"><div class="progress-fill" style="--progress:75%"></div></div> */
    .progress-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
    .progress-bar-sm { height: 4px; }
    .progress-bar-lg { height: 12px; }
    .progress-fill { height: 100%; width: var(--progress, 70%); border-radius: 999px; background: linear-gradient(90deg, #8b5cf6, #06b6d4); animation: progress-grow 1.2s cubic-bezier(0.22,1,0.36,1) forwards; transform-origin: left; position: relative; overflow: hidden; }
    .progress-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%); animation: progress-shine 2s ease-in-out infinite 1.2s; }
    @keyframes progress-grow { from { width: 0 !important; } to { width: var(--progress, 70%); } }
    @keyframes progress-shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
    /* Color variants */
    .progress-fill-green { background: linear-gradient(90deg, #10b981, #34d399); }
    .progress-fill-orange { background: linear-gradient(90deg, #f97316, #fbbf24); }
    .progress-fill-pink { background: linear-gradient(90deg, #ec4899, #f43f5e); }
    .progress-fill-red { background: linear-gradient(90deg, #ef4444, #f97316); }

    /* NEW: Neon borders — glowing colored outlines for tech/gaming/cyberpunk themes */
    .neon-border-cyan   { border: 1px solid rgba(6,182,212,0.7);   box-shadow: 0 0 8px rgba(6,182,212,0.5),  0 0 24px rgba(6,182,212,0.15),  inset 0 0 8px rgba(6,182,212,0.04); }
    .neon-border-violet { border: 1px solid rgba(139,92,246,0.7);  box-shadow: 0 0 8px rgba(139,92,246,0.5), 0 0 24px rgba(139,92,246,0.15), inset 0 0 8px rgba(139,92,246,0.04); }
    .neon-border-green  { border: 1px solid rgba(16,185,129,0.7);  box-shadow: 0 0 8px rgba(16,185,129,0.5), 0 0 24px rgba(16,185,129,0.15), inset 0 0 8px rgba(16,185,129,0.04); }
    .neon-border-pink   { border: 1px solid rgba(236,72,153,0.7);  box-shadow: 0 0 8px rgba(236,72,153,0.5), 0 0 24px rgba(236,72,153,0.15), inset 0 0 8px rgba(236,72,153,0.04); }
    .neon-border-amber  { border: 1px solid rgba(245,158,11,0.7);  box-shadow: 0 0 8px rgba(245,158,11,0.5), 0 0 24px rgba(245,158,11,0.15), inset 0 0 8px rgba(245,158,11,0.04); }

    /* NEW: Holographic / iridescent rainbow gradient */
    .holo { background: linear-gradient(135deg, #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #6366f1, #ec4899); background-size: 300% 300%; animation: holo-shift 6s ease infinite; }
    .holo-text { background: linear-gradient(135deg, #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #6366f1, #ec4899); background-size: 300% 300%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: holo-shift 6s ease infinite; }
    @keyframes holo-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

    /* NEW: Number pop-in — bouncy entrance for stat numbers */
    .number-pop { animation: number-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    @keyframes number-pop { from { opacity: 0; transform: scale(0.4) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    /* Staggered number pops for a row of stats */
    .number-pop-1 { animation: number-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
    .number-pop-2 { animation: number-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
    .number-pop-3 { animation: number-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
    .number-pop-4 { animation: number-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
`;
};

// Standard CDN scripts to always inject (pinned versions for stability)
// Use local copy served from /public to avoid mobile Safari blocking external CDN in sandboxed iframes
const CHART_JS_CDN = '/chart.umd.min.js';
const D3_CDN = 'https://d3js.org/d3.v7.min.js';
const LOTTIE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
const FONTS_CDN = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';

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
      var compact = el.getAttribute('data-compact') === 'true';
      var start = Date.now();
      var frame = function() {
        var progress = Math.min((Date.now() - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        var formatted;
        if (compact) {
          if (Math.abs(target) >= 1e9) {
            formatted = (value / 1e9).toFixed(1) + 'B';
          } else if (Math.abs(target) >= 1e6) {
            formatted = (value / 1e6).toFixed(1) + 'M';
          } else if (Math.abs(target) >= 1e3) {
            formatted = (value / 1e3).toFixed(1) + 'K';
          } else {
            formatted = value.toFixed(decimals);
          }
        } else {
          formatted = value.toFixed(decimals);
        }
        el.textContent = prefix + formatted + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  // 3. Animate progress bars with data-target attribute
  function animateProgressBars() {
    var bars = document.querySelectorAll('[data-target]');
    bars.forEach(function(bar, i) {
      var target = bar.getAttribute('data-target') || '0%';
      var delay = 150 + i * 60;
      // Handle SVG stroke-dashoffset rings
      if (bar.tagName === 'circle' || bar.tagName === 'CIRCLE') {
        var circumference = parseFloat(bar.getAttribute('stroke-dasharray') || '283');
        var pct = parseFloat(target.replace('%', '')) / 100;
        var offset = circumference * (1 - pct);
        setTimeout(function() {
          bar.style.strokeDashoffset = String(offset);
          bar.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.25,.46,.45,.94)';
        }, delay);
      } else if (bar.getAttribute('data-axis') === 'height') {
        // Vertical bar
        bar.style.height = '0';
        setTimeout(function() {
          bar.style.height = target;
        }, delay);
      } else {
        // Horizontal progress bar (default)
        bar.style.width = '0';
        setTimeout(function() {
          bar.style.width = target;
        }, delay);
      }
    });
  }

  // 4. Intersection Observer for scroll-triggered animations
  function initScrollAnimations() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-aos], .animate-on-scroll').forEach(function(el) {
      var htmlEl = el;
      // Only apply if not already animated
      if (getComputedStyle(htmlEl).opacity !== '0') return;
      htmlEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(htmlEl);
    });
  }

  // 5. Staggered entry animation for grid/card children
  function initStaggerAnimations() {
    var grids = document.querySelectorAll('.auto-grid, .auto-grid-sm, .grid-2, .grid-3, .grid-4, [data-stagger]');
    grids.forEach(function(grid) {
      var children = Array.from(grid.children);
      children.forEach(function(child, i) {
        var el = child;
        if (!el.style.opacity || el.style.opacity === '') {
          el.style.opacity = '0';
          el.style.transform = 'translateY(16px)';
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          setTimeout(function() {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 120 + i * 80);
        }
      });
    });
  }

  // 6. Tooltip system for [data-tooltip] elements
  function initTooltips() {
    var tip = document.createElement('div');
    tip.id = 'va-tooltip';
    tip.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;padding:6px 10px;background:rgba(15,15,25,0.95);color:#f8fafc;font-size:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);white-space:nowrap;opacity:0;transition:opacity 0.15s ease;backdrop-filter:blur(8px);';
    document.body.appendChild(tip);
    document.querySelectorAll('[data-tooltip]').forEach(function(el) {
      el.addEventListener('mouseenter', function(e) {
        tip.textContent = el.getAttribute('data-tooltip') || '';
        tip.style.opacity = '1';
      });
      el.addEventListener('mousemove', function(e) {
        var ev = e;
        tip.style.left = (ev.clientX + 12) + 'px';
        tip.style.top = (ev.clientY - 28) + 'px';
      });
      el.addEventListener('mouseleave', function() {
        tip.style.opacity = '0';
      });
    });
  }

  function init() {
    initCharts();
    animateCounters();
    animateProgressBars();
    initScrollAnimations();
    initStaggerAnimations();
    initTooltips();
  }

  // Re-register message handler and signal parent FIRST — before init().
  // This ensures communication always works even if init() throws an error.
  window.addEventListener('message', function(evt) {
    if (!evt.data) return;
    if (evt.data.type === 'SET_CONTENT') {
      document.open();
      document.write(evt.data.html);
      document.close();
    } else if (evt.data.type === 'PING_READY') {
      // Parent asking if we're ready — echo RENDERER_READY back
      try { window.parent.postMessage({ type: 'RENDERER_READY' }, '*'); } catch(e) {}
    }
  });
  try { window.parent.postMessage({ type: 'RENDERER_READY' }, '*'); } catch(e) {}

  // Run visual init after signaling ready; errors here don't affect the communication layer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { try { init(); } catch(e) {} });
  } else {
    try { init(); } catch(e) {}
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

    // Normalize ALL Chart.js CDN URLs to our pinned stable version (prevents double-load conflicts)
    doc = doc.replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js[^"'\s]*/gi, CHART_JS_CDN);
    doc = doc.replace(/https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/[Cc]hart\.js[^"'\s]*/gi, CHART_JS_CDN);
    doc = doc.replace(/https?:\/\/unpkg\.com\/chart\.js[^"'\s]*/gi, CHART_JS_CDN);

    // Inject Chart.js CDN if still absent after normalization
    if (!doc.includes(CHART_JS_CDN)) {
      if (/<head[^>]*>/i.test(doc)) {
        doc = doc.replace(/<head([^>]*)>/i, `<head$1>\n  <script src="${CHART_JS_CDN}"><\/script>`);
      } else {
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

    // Inject light-mode override stylesheet when theme is 'light'
    // This softens dark backgrounds without breaking the AI's design intent
    if (theme === 'light') {
      const lightOverride = `<style id="visual-ai-light-override">
  body { background:#f4f4f8 !important; background-image:radial-gradient(circle,rgba(124,58,237,0.08) 1px,transparent 1px) !important; background-size:28px 28px !important; color:#1e293b !important; }
  [style*="background:#0a0a0f"],[style*="background: #0a0a0f"],[style*="background:#12121a"],[style*="background: #12121a"],[style*="background:#1a1a2e"],[style*="background: #1a1a2e"] { background:#ffffff !important; }
  [style*="background:rgba(18,18,26"],[style*="background: rgba(18,18,26"],[style*="background:rgba(10,10,15"],[style*="background: rgba(10,10,15"] { background:rgba(255,255,255,0.95) !important; }
  [style*="color:#f8fafc"],[style*="color: #f8fafc"],[style*="color:#94a3b8"],[style*="color: #94a3b8"] { color:#334155 !important; }
  [style*="border:1px solid rgba(255,255,255"],[style*="border: 1px solid rgba(255,255,255"] { border-color:rgba(0,0,0,0.1) !important; }
</style>`;
      if (/<head[^>]*>/i.test(doc)) {
        doc = doc.replace(/<\/head>/i, `${lightOverride}\n</head>`);
      }
    }

    // Escape </script> inside <script> blocks to prevent premature script tag closing
    // (AI-generated JS often has </script> inside string literals which breaks mobile browsers)
    doc = doc.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_match, attrs, content) => {
      const safeContent = content.replace(/<\/script>/gi, '<\\/script>');
      return `<script${attrs}>${safeContent}</script>`;
    });

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
    .replace(/href\s*=\s*["']\s*javascript\s*:[^"']*["']/gi, 'href="#"')
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_match, attrs, content) => {
      const safeContent = content.replace(/<\/script>/gi, '<\\/script>');
      return `<script${attrs}>${safeContent}</script>`;
    });

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

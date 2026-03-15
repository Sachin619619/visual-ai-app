import html2canvas from 'html2canvas';
import { createSandboxContent } from './sanitizer';

/**
 * Renders the given HTML in a temporary off-screen iframe (with allow-same-origin
 * so html2canvas can access the DOM), waits for scripts/charts to settle, then
 * captures and returns a JPEG data-URL.  Returns null on failure.
 */
export async function captureRenderedScreenshot(html: string): Promise<string | null> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    // allow-same-origin lets html2canvas access contentDocument
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.style.cssText =
      'position:fixed;top:0;left:-9999px;width:1280px;height:900px;' +
      'visibility:hidden;pointer-events:none;z-index:-999;border:0;';
    document.body.appendChild(iframe);

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch {}
    };

    // Hard timeout — don't block the UI for more than 12s
    const hardTimeout = setTimeout(() => { cleanup(); resolve(null); }, 12000);

    iframe.onload = async () => {
      try {
        // Let Chart.js, D3, animations render
        await new Promise(r => setTimeout(r, 2500));

        const doc = iframe.contentDocument;
        if (!doc) { cleanup(); resolve(null); return; }

        const canvas = await html2canvas(doc.documentElement, {
          width: 1280,
          height: 900,
          useCORS: true,
          allowTaint: true,
          scale: 0.6,   // smaller = faster API transfer
          logging: false,
          backgroundColor: '#0a0a0f',
        });

        clearTimeout(hardTimeout);
        cleanup();
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      } catch {
        clearTimeout(hardTimeout);
        cleanup();
        resolve(null);
      }
    };

    // Use sanitized sandbox content so CDN scripts load
    iframe.srcdoc = createSandboxContent(html, 'dark');
  });
}

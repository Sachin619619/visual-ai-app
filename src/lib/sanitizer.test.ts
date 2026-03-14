import { describe, it, expect } from 'vitest';
import { sanitizeHtml, createSandboxContent } from './sanitizer';

describe('sanitizeHtml', () => {
  it('should return the input as-is for plain text (mocked DOMPurify)', () => {
    const result = sanitizeHtml('<p>Hello world</p>');
    expect(result).toContain('Hello world');
  });

  it('should unescape HTML entities', () => {
    const input = '&lt;div&gt;test&lt;/div&gt;';
    const result = sanitizeHtml(input);
    expect(result).toContain('<div>test</div>');
  });

  it('should unescape &amp; entities', () => {
    const input = 'Tom &amp; Jerry';
    const result = sanitizeHtml(input);
    expect(result).toContain('Tom & Jerry');
  });

  it('should unescape &quot; entities', () => {
    const input = 'say &quot;hello&quot;';
    const result = sanitizeHtml(input);
    expect(result).toContain('say "hello"');
  });

  it('should unescape &#39; entities', () => {
    const input = "it&#39;s fine";
    const result = sanitizeHtml(input);
    expect(result).toContain("it's fine");
  });

  it('should replace &nbsp; with space', () => {
    const input = 'hello&nbsp;world';
    const result = sanitizeHtml(input);
    expect(result).toContain('hello world');
  });

  it('should handle escaped backslash-lt', () => {
    const input = '\\<div\\>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<div>');
  });

  it('should remove script tags', () => {
    const input = '<div>content</div><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert("xss")');
  });

  it('should remove event handlers', () => {
    const input = '<button onclick="alert(1)">click</button>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });

  it('should handle empty string', () => {
    const result = sanitizeHtml('');
    expect(result).toBe('');
  });

  it('should handle complex HTML with styles', () => {
    const input = '<div class="card" style="color: red;">content</div>';
    const result = sanitizeHtml(input);
    expect(result).toContain('content');
  });
});

describe('createSandboxContent', () => {
  it('should return a full HTML document for partial HTML', () => {
    const result = createSandboxContent('<div>Hello</div>');
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html');
    expect(result).toContain('Hello');
  });

  it('should inject Chart.js CDN', () => {
    const result = createSandboxContent('<div>chart</div>');
    expect(result).toContain('chart.js');
  });

  it('should inject Google Fonts', () => {
    const result = createSandboxContent('<div>text</div>');
    expect(result).toContain('fonts.googleapis.com');
  });

  it('should include theme styles for dark theme', () => {
    const result = createSandboxContent('<div>dark</div>', 'dark');
    expect(result).toContain('background');
    expect(result).toContain('#0a0a0f');
  });

  it('should include theme styles for light theme', () => {
    const result = createSandboxContent('<div>light</div>', 'light');
    expect(result).toContain('#f8fafc');
  });

  it('should default to dark theme', () => {
    const result = createSandboxContent('<div>default</div>');
    expect(result).toContain('#0a0a0f');
  });

  it('should pass through full HTML documents unchanged (with additions)', () => {
    const fullDoc = '<!DOCTYPE html><html><head></head><body><div>full doc</div></body></html>';
    const result = createSandboxContent(fullDoc);
    expect(result).toContain('full doc');
    expect(result).toContain('chart.js');
  });

  it('should inject Chart.js into full HTML with existing head', () => {
    const fullDoc = '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>';
    const result = createSandboxContent(fullDoc);
    expect(result).toContain('chart.js');
  });

  it('should append data-chart init script', () => {
    const result = createSandboxContent('<div data-chart-type="bar">chart</div>');
    expect(result).toContain('initCharts');
  });

  it('should strip inline event handlers from partial HTML', () => {
    const result = createSandboxContent('<button onclick="alert(1)">btn</button>');
    expect(result).not.toContain('onclick');
  });

  it('should replace javascript: hrefs from partial HTML', () => {
    const result = createSandboxContent('<a href="javascript:void(0)">link</a>');
    expect(result).not.toContain('javascript:void');
  });

  it('should handle HTML starting with <html tag', () => {
    const fullDoc = '<html lang="en"><head></head><body>content</body></html>';
    const result = createSandboxContent(fullDoc);
    expect(result).toContain('content');
  });
});

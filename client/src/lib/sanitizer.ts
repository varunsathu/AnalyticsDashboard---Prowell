// Content sanitization utility to prevent XSS attacks
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous elements and attributes while preserving safe formatting
 */
export function sanitizeHtml(content: string): string {
  if (!content) return '';
  
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize plain text content
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeText(content: string): string {
  if (!content) return '';
  
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize URL to prevent javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
    return '#';
  } catch {
    return '#';
  }
}

/**
 * Escape HTML entities in plain text
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
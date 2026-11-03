/**
 * assetUrl helper: Resolves static public asset paths against Vite's `import.meta.env.BASE_URL`.
 * Supports GitHub Pages nested paths (/repository-name/) and local root/relative paths.
 *
 * Keeps external URLs (https://, http://), data URIs (data:), and local blob URLs (blob:) untouched.
 */
export function assetUrl(path) {
  if (!path) return '';
  const s = String(path).trim();

  // Do not modify external, blob, or data URLs
  if (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('blob:') ||
    s.startsWith('data:')
  ) {
    return s;
  }

  const cleanPath = s.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  return `${cleanBase}${cleanPath}`;
}


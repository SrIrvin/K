import fs from 'fs';
import path from 'path';

const distIndexPath = path.resolve('dist/index.html');

if (fs.existsSync(distIndexPath)) {
  let html = fs.readFileSync(distIndexPath, 'utf-8');

  // Replace type="module" and crossorigin with defer for classic script loading
  html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>');
  
  // Also clean up any other module preload links if Vite generated them
  html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');

  fs.writeFileSync(distIndexPath, html, 'utf-8');
  console.log('Post-build: Successfully converted script tags to classic scripts (non-module) for offline/local play.');
} else {
  console.error('Post-build: dist/index.html not found.');
}

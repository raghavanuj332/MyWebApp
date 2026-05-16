import { execSync } from 'child_process';
import express from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');

// Build the app if the dist folder doesn't exist yet
if (!existsSync(distPath)) {
  console.log('dist/ not found — building Vite app...');
  execSync('npm run build', { stdio: 'inherit' });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve pre-built static assets
app.use(express.static(distPath));

// SPA fallback — send index.html for any unmatched route
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

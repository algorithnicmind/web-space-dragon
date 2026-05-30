# Deployment Guide

Space Dragon is a fully static project with zero build steps. It can be deployed to any static hosting service by simply serving the project root directory.

---

## GitHub Pages

### Steps
1. Push all code to your GitHub repository's `main` branch.
2. Go to your repository on GitHub.
3. Navigate to **Settings** → **Pages**.
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**.
6. Wait 1–2 minutes for the build to complete.

### URL
```
https://YOUR_USERNAME.github.io/web-space-dragon/
```

### Notes
- GitHub Pages serves files over HTTPS, which is required for Service Workers (PWA).
- ES6 modules work correctly on GitHub Pages since files are served with proper MIME types.

---

## Netlify

### Option A: Git Integration (Recommended)
1. Sign in to [netlify.com](https://www.netlify.com).
2. Click **"Add new site"** → **"Import an existing project"**.
3. Connect your GitHub account and select the `web-space-dragon` repository.
4. Configure build settings:
   - **Build command**: *(leave empty)*
   - **Publish directory**: `.`
5. Click **"Deploy site"**.

### Option B: Drag & Drop
1. Sign in to [netlify.com](https://www.netlify.com).
2. Go to the **Sites** dashboard.
3. Drag the entire project folder onto the deploy drop zone.
4. Site will be live instantly.

### Custom Domain
1. Go to **Site settings** → **Domain management**.
2. Click **"Add custom domain"**.
3. Follow DNS configuration instructions.

---

## Vercel

### Steps
1. Sign in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Import from GitHub and select `web-space-dragon`.
4. Configure:
   - **Framework Preset**: `Other`
   - **Build Command**: *(leave empty)*
   - **Output Directory**: `.`
5. Click **"Deploy"**.

### URL
```
https://web-space-dragon.vercel.app
```

---

## Local Development Server

For local development, you need an HTTP server because ES6 modules don't work with `file://` protocol.

### Python
```bash
cd web-space-dragon
python -m http.server 8000
# Visit http://localhost:8000
```

### Node.js
```bash
npx serve .
# Visit http://localhost:3000
```

### PHP
```bash
php -S localhost:8000
# Visit http://localhost:8000
```

### VS Code
Install the **Live Server** extension, right-click `index.html`, and select **"Open with Live Server"**.

---

## PWA / Offline Support

The project includes a `manifest.json` and `sw.js` (service worker) for Progressive Web App support:

- **Installable**: Users can "Add to Home Screen" on mobile.
- **Offline**: Once loaded, the game works without an internet connection.
- The service worker caches all project files on first load.

PWA features work automatically on HTTPS-enabled hosting (GitHub Pages, Netlify, Vercel).

---

## Environment Checklist

Before deploying, verify:

- [ ] All files are committed and pushed to the repository
- [ ] `index.html` is in the repository root
- [ ] No broken imports (check browser console for 404s)
- [ ] Game loads and plays correctly at the deployed URL
- [ ] Sound works after first user interaction
- [ ] Mobile touch controls function on phones/tablets
- [ ] Settings and high score persist across page reloads

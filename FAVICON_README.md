# Fameuxarte Favicon Setup

## Overview
Professional favicon package for the Fameuxarte art marketplace website, featuring the "FA" monogram in premium gold (#D4AF37) on a dark navy background (#1a1a2e).

## Generated Files

### Standard Favicons
- `favicon.ico` - Multi-resolution ICO file (16x16, 32x32, 48x48)
- `favicon-16x16.png` - Browser tab favicon
- `favicon-32x32.png` - Browser tab favicon (high DPI)
- `favicon-48x48.png` - Browser tab favicon (higher DPI)
- `favicon-64x64.png` - Windows taskbar
- `favicon-128x128.png` - Chrome Web Store
- `favicon-256x256.png` - High resolution displays

### Mobile & App Icons
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `android-chrome-192x192.png` - Android home screen icon
- `android-chrome-512x512.png` - Android splash screen

### PWA Support
- `manifest.json` - Web app manifest for Progressive Web App support

## Browser Support
✅ Chrome, Firefox, Safari, Edge, Opera  
✅ iOS Safari (iPhone/iPad)  
✅ Android Chrome  
✅ Windows desktop  
✅ MacOS desktop  

## Implementation
All favicon references have been added to `index.html`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

## File Sizes
All favicons are highly optimized:
- Small sizes (16x-64x): < 1KB each
- Medium sizes (128x-256x): 1-3KB each
- Large sizes (512x): ~6KB
- Total package: ~25KB (vs 2.3MB original logo)

## Regenerating Favicons
If you need to regenerate or modify the favicons:
```bash
python generate_favicon.py
```

The script will create all required favicon files in the `public` directory.

## Design Details
- **Colors**: Gold (#D4AF37) on dark navy (#1a1a2e)
- **Text**: "FA" monogram
- **Style**: Clean, modern, professional
- **Optimized for**: Small sizes, high contrast, clarity

## Testing
After deployment, test your favicons at:
- https://realfavicongenerator.net/favicon_checker
- Check browser tabs, bookmarks, home screen icons

---
Generated: 2026-02-15  
Script: `generate_favicon.py`

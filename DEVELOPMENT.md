# 🔧 Development Workflow for Gold Gem Component

This document explains how to modify and maintain the Gold Gem Component with the automatic build system.

## 📁 Project Structure

```
new-gem-2025/
├── assets/                    # Source files (EDIT THESE)
│   ├── css/                  # Individual CSS files
│   ├── js/                   # Individual JavaScript files
│   └── data/                 # JSON translation files
├── dist/                     # Generated files (DON'T EDIT DIRECTLY)
│   ├── gold-gem-component.css
│   ├── gold-gem-component.min.css
│   ├── gold-gem-component.js
│   └── gold-gem-component.min.js
├── page.html                 # HTML template source
├── build.js                  # Build automation script
├── watch.js                  # Development watcher
├── package.json              # NPM configuration
└── Makefile                  # Quick command shortcuts
```

## 🚀 Quick Start Commands

### Development
```bash
# Build component once
make build

# Watch for changes and auto-rebuild
make watch

# Build and open demo
make dev
```

### Release
```bash
# Build and commit changes
make release

# Create new version tag
make tag VERSION=1.1.0
```

## ✏️ How to Make Changes

### 1. **CSS Changes**
Edit files in `assets/css/`:
```bash
# Edit any CSS file
nano assets/css/banner-slideshow.css
nano assets/css/gold-price.css
nano assets/css/main.css

# Auto-rebuild (if watching)
# OR manually rebuild
make build
```

### 2. **JavaScript Changes**
Edit files in `assets/js/`:
```bash
# Edit any JS file
nano assets/js/banner-slideshow.js
nano assets/js/gold-price-manager.js

# Auto-rebuild (if watching)
# OR manually rebuild
make build
```

### 3. **Translation Changes**
Edit files in `assets/data/`:
```bash
# Edit translation files
nano assets/data/translations.json
nano assets/data/banner-translations.json
nano assets/data/gold-translations.json

# Auto-rebuild (if watching)
# OR manually rebuild
make build
```

### 4. **HTML Template Changes**
Edit `page.html`:
```bash
# Edit the main HTML file
nano page.html

# Auto-rebuild (if watching)  
# OR manually rebuild
make build
```

## 🔄 Development Workflow

### Method 1: Watch Mode (Recommended)
```bash
# Start watching for changes
make watch

# In another terminal, edit files
nano assets/css/main.css

# Build happens automatically!
# Check dist/ folder for updated files
```

### Method 2: Manual Build
```bash
# Edit your files
nano assets/js/calculator.js

# Build manually
make build

# Check results
ls -la dist/
```

## 📋 Available Commands

### Make Commands
```bash
make help          # Show all commands
make build         # Build component
make watch         # Watch for changes
make dev           # Build and open demo
make clean         # Clean dist directory
make release       # Build, commit, and push
make tag VERSION=X # Create version tag
make test          # Test component files
make size          # Show file sizes
```

### NPM Scripts
```bash
npm run build                    # Same as make build
npm run watch                    # Same as make watch
npm run dev                      # Build and open demo
npm run release                  # Build and release
npm run tag                      # Create version tag
```

### Direct Node.js
```bash
# Basic build
node build.js

# Build with specific version
node build.js --version 1.2.0

# Watch mode
node watch.js
```

## 🎯 Common Tasks

### Adding New CSS
1. Create/edit file in `assets/css/`
2. Add to `config.sourceFiles.css` in `build.js` (if new file)
3. Run `make build`

### Adding New JavaScript
1. Create/edit file in `assets/js/`
2. Add to `config.sourceFiles.js` in `build.js` (if new file)  
3. Run `make build`

### Updating Translations
1. Edit `assets/data/*.json` files
2. Run `make build`
3. JSON data is automatically embedded in JS bundle

### Modifying HTML Structure
1. Edit `page.html`
2. Run `make build`
3. HTML templates are automatically extracted and embedded

## 🔧 Build Configuration

Edit `build.js` to customize:

```javascript
const config = {
    version: '1.0.0',
    distDir: './dist',
    sourceFiles: {
        css: [
            './assets/css/banner-slideshow.css',
            './assets/css/gold-price.css',
            // Add new CSS files here
        ],
        js: [
            './assets/js/banner-slideshow.js',
            './assets/js/gold-price-manager.js',
            // Add new JS files here
        ],
        json: [
            './assets/data/translations.json',
            // Add new JSON files here
        ]
    }
};
```

## 📦 Release Process

### 1. Make Your Changes
```bash
# Edit source files
nano assets/css/main.css
nano assets/js/calculator.js
```

### 2. Test Locally
```bash
# Build and test
make dev

# Or watch while developing
make watch
```

### 3. Commit Changes
```bash
# Build and commit
make release
```

### 4. Create Release Tag
```bash
# Create new version
make tag VERSION=1.1.0

# Push tags to GitHub
git push origin --tags
```

### 5. Update CDN URLs
After pushing tags, update URLs in documentation:
```
https://cdn.jsdelivr.net/gh/yourusername/gold-gem-component@v1.1.0/dist/gold-gem-component.min.css
https://cdn.jsdelivr.net/gh/yourusername/gold-gem-component@v1.1.0/dist/gold-gem-component.min.js
```

## 🚨 Important Notes

### ❌ Don't Edit These Files Directly:
- `dist/gold-gem-component.css`
- `dist/gold-gem-component.min.css`
- `dist/gold-gem-component.js`
- `dist/gold-gem-component.min.js`

### ✅ Edit These Source Files:
- `assets/css/*.css`
- `assets/js/*.js`
- `assets/data/*.json`
- `page.html`

### 🔄 Auto-rebuild Triggers:
- Any `.css` file in `assets/css/`
- Any `.js` file in `assets/js/`
- Any `.json` file in `assets/data/`
- Changes to `page.html`

## 🐛 Troubleshooting

### Build Fails
```bash
# Check syntax errors
node -c build.js

# Clean and rebuild
make clean
make build
```

### Watch Not Working
```bash
# Stop watch process
Ctrl+C

# Restart watch
make watch
```

### Files Not Updating
```bash
# Force clean build
make clean
make build

# Check file permissions
ls -la dist/
```

## 💡 Tips

1. **Use Watch Mode**: Always use `make watch` during development
2. **Test Before Release**: Run `make dev` to test in browser
3. **Check File Sizes**: Run `make size` to monitor bundle size
4. **Version Bump**: Use semantic versioning (1.0.0 → 1.0.1 → 1.1.0)
5. **CDN Cache**: jsDelivr may take 5-10 minutes to update new versions

## 🎉 Example Workflow

```bash
# 1. Start development
make watch

# 2. Edit files (in another terminal)
nano assets/css/main.css

# 3. See auto-rebuild happen
# Files in dist/ are automatically updated

# 4. Test changes
make dev

# 5. Commit when ready
make release

# 6. Create release tag
make tag VERSION=1.2.0

# 7. Push to GitHub
git push origin --tags
```

Now you can easily maintain and update your component! 🚀
# GitHub Components Usage Guide

## Overview
This guide explains how to use components and assets from GitHub tags/releases via jsDelivr CDN.

## File Structure
```
page-components.html          # Main HTML file using GitHub assets
assets/js/components/
├── GitHubAssetHelper.js     # Helper for GitHub asset paths
├── SpecialOfferSection.js   # Updated with GitHub support
├── SecondaryBannerSlideshow.js  # Updated with GitHub support
├── GoldPriceSection.js      # Gold price component
├── MapContactSection.js     # Map and contact component
└── DiscountCodeCard.js      # Discount code component
```

## How to Use

### 1. Create GitHub Release/Tag
```bash
# Create a new tag (example: v1.0.0)
git tag v1.0.0
git push origin v1.0.0
```

### 2. Update Version in HTML
In `page-components.html`, change the version:
```html
<!-- From -->
<script src="https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0/...">

<!-- To -->
<script src="https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.1/...">
```

### 3. Assets Structure
All assets are loaded from GitHub via jsDelivr:
- **CSS**: `https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0/assets/css/`
- **JS**: `https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0/assets/js/`
- **Images**: `https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0/public/`

### 4. Image Path Handling
The `GitHubAssetHelper` automatically handles image paths:
- **Local mode**: `public/image.jpg`
- **GitHub mode**: `https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0/public/image.jpg`

### 5. Components with GitHub Support
- `SpecialOfferSection.js` - Uses `GitHubAssets.getImagePath('offer-02.png')`
- `SecondaryBannerSlideshow.js` - Uses `GitHubAssets.getImagePath()` for banner images

## Benefits
1. **CDN Performance** - Fast loading via jsDelivr
2. **Version Control** - Use specific tags for stability
3. **Caching** - Better browser caching with CDN
4. **Reliability** - GitHub + jsDelivr uptime
5. **Easy Updates** - Just create new tags

## Testing
1. **Local Development**: Use `page.html` (local assets)
2. **GitHub Testing**: Use `page-components.html` (GitHub assets)
3. **Production**: Deploy `page-components.html` with your preferred tag

## Example Usage
```html
<!-- Load GitHub assets -->
<script>
    window.GITHUB_ASSETS_BASE = 'https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0';
</script>

<!-- Components will automatically use GitHub paths -->
<script src="https://cdn.jsdelivr.net/gh/teerayutht/new-gem-2025@v1.0.0/assets/js/components/SpecialOfferSection.js"></script>
```

## Notes
- Always test with a specific tag version
- Use `@latest` only for development
- Update all CDN URLs together for consistency
- The `GitHubAssetHelper` provides fallback to local paths if GitHub base URL is not set
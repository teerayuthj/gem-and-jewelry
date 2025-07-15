# Gold Gem Component 🥇

A comprehensive, responsive gold trading and price display component with multi-language support (Thai/English). Perfect for gold trading websites, financial platforms, and investment portals.

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/teerayuthj/gem-and-jewelry)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange.svg)](https://www.jsdelivr.com/package/gh/teerayuthj/gem-and-jewelry)

## ✨ Features

- 🌐 **Multi-language Support** - Thai and English with easy switching
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 🥇 **Real-time Gold Prices** - Display live gold and silver prices
- 🧮 **Price Calculator** - Interactive gold/silver calculator
- 🎯 **Special Offers** - Countdown timer and discount code system
- 🎠 **Banner Slideshow** - Engaging promotional banners
- 📍 **Contact Information** - Integrated map and contact details
- ⚡ **Zero Dependencies** - Pure JavaScript, no jQuery required
- 🎨 **Customizable** - Easy to customize colors and content
- 📦 **CDN Ready** - Ready to use via jsDelivr CDN

## 🚀 Quick Start

### Method 1: CDN (Recommended)

Add these lines to your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Required: Tailwind CSS + DaisyUI -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css" rel="stylesheet">
    
    <!-- Required: Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Gold Gem Component CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/teerayuthj/gem-and-jewelry@v1.1.0/dist/gold-gem-component.min.css">
</head>
<body>
    <!-- Component Container -->
    <div id="gold-gem-container"></div>
    
    <!-- Gold Gem Component JavaScript -->
    <script src="https://cdn.jsdelivr.net/gh/teerayuthj/gem-and-jewelry@v1.1.0/dist/gold-gem-component.min.js"></script>
    
    <!-- Initialize Component -->
    <script>
        new GoldGemComponent('#gold-gem-container');
    </script>
</body>
</html>
```

### Method 2: Auto-initialization

For even simpler usage, just use the container ID `gold-gem-container` and the component will auto-initialize:

```html
<div id="gold-gem-container"></div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/teerayuthj/gem-and-jewelry@v1.1.0/dist/gold-gem-component.min.css">
<script src="https://cdn.jsdelivr.net/gh/teerayuthj/gem-and-jewelry@v1.1.0/dist/gold-gem-component.min.js"></script>
```

## ⚙️ Configuration Options

```javascript
new GoldGemComponent('#gold-gem-container', {
    // CDN base URL (change to your own if hosting elsewhere)
    cdnBase: 'https://cdn.jsdelivr.net/gh/teerayuthj/gem-and-jewelry@v1.1.0',
    
    // Enable/disable specific sections
    enableBanner: true,          // Banner slideshow
    enableGoldPrice: true,       // Gold price display
    enableCalculator: true,      // Price calculator
    enableSpecialOffer: true,    // Special offers & countdown
    enableContact: true,         // Contact section with map
    
    // Auto-load CSS styles
    autoLoadStyles: true         // Automatically load component CSS
});
```

## 🎨 Customization

### Custom CDN Base

If you're hosting the assets yourself or using a different CDN:

```javascript
new GoldGemComponent('#container', {
    cdnBase: 'https://your-cdn.com/path-to-assets'
});
```

### Disable Specific Sections

Create a minimal version by disabling unwanted sections:

```javascript
new GoldGemComponent('#container', {
    enableBanner: false,         // Hide banner
    enableCalculator: false,     // Hide calculator
    enableContact: false         // Hide contact section
});
```

### Custom Styling

Override component styles with your own CSS:

```css
/* Custom colors */
.banner-slideshow {
    background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}

/* Custom button colors */
.banner-button {
    background: linear-gradient(135deg, #your-primary, #your-secondary);
}

/* Custom countdown colors */
.countdown-item {
    background: linear-gradient(135deg, #your-accent 0%, #your-accent-2 100%);
}
```

## 🌐 Language Support

The component automatically detects the user's language preference and supports:

- **Thai (th)** - Default language
- **English (en)** - Alternative language

Language switching is handled automatically and preferences are saved to localStorage.

### Manual Language Control

```javascript
const component = new GoldGemComponent('#container');

// Switch language programmatically
component.switchLanguage(); // Toggles between th/en

// Get current language
console.log(component.currentLanguage); // 'th' or 'en'
```

## 📱 Mobile Optimization

The component is fully optimized for mobile devices with:

- **Responsive Design** - Adapts to all screen sizes
- **Touch-friendly** - Optimized touch targets
- **Performance** - Lightweight and fast loading
- **Mobile Typography** - Readable text on small screens
- **Gesture Support** - Swipe navigation for banners

## 🔧 API Reference

### GoldGemComponent Class

#### Constructor

```javascript
new GoldGemComponent(container, options)
```

**Parameters:**
- `container` (string|Element) - CSS selector or DOM element
- `options` (Object) - Configuration options

#### Methods

| Method | Description |
|--------|-------------|
| `init()` | Initialize the component |
| `render()` | Render all HTML sections |
| `switchLanguage()` | Toggle between Thai/English |
| `updateLanguageContent()` | Update all text content |
| `destroy()` | Clean up component and events |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentLanguage` | String | Current language ('th' or 'en') |
| `translations` | Object | All translation data |
| `container` | Element | Container DOM element |
| `options` | Object | Component configuration |

## 🎯 Use Cases

### E-commerce Gold Trading
Perfect for online gold trading platforms with real-time pricing and calculator functionality.

### Investment Portals
Ideal for investment websites showcasing gold and silver investment opportunities.

### Financial Websites
Great for financial news sites or blogs covering precious metals markets.

### Landing Pages
Excellent for promotional landing pages with special offers and countdown timers.

## 🏗️ Browser Support

- ✅ **Chrome** 60+
- ✅ **Firefox** 55+
- ✅ **Safari** 12+
- ✅ **Edge** 79+
- ✅ **Mobile Safari** iOS 12+
- ✅ **Chrome Mobile** Android 7+

## 📦 What's Included

```
dist/
├── gold-gem-component.css          # Full CSS (910 lines)
├── gold-gem-component.min.css      # Minified CSS
├── gold-gem-component.js           # Full JavaScript (811 lines)
├── gold-gem-component.min.js       # Minified JavaScript
└── README.md                       # This documentation
```

## 🔗 Dependencies

The component requires these external libraries:

1. **Tailwind CSS** - For styling framework
2. **DaisyUI** - For UI components
3. **Font Awesome** - For icons

All dependencies are loaded via CDN in the examples above.

## 🚀 Performance

- **CSS Size**: ~28KB minified
- **JavaScript Size**: ~15KB minified
- **Total Bundle**: ~43KB (without dependencies)
- **Load Time**: < 100ms on average connection
- **Mobile Optimized**: Fast rendering on mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: teerayutht@gmail.com
- 💬 **Issues**: [GitHub Issues](https://github.com/teerayuthj/gem-and-jewelry/issues)
- 📖 **Documentation**: [Full Documentation](https://github.com/teerayuthj/gem-and-jewelry/wiki)

## 🎉 Examples

### Basic Implementation
```html
<div id="my-gold-component"></div>
<script>
    new GoldGemComponent('#my-gold-component');
</script>
```

### Advanced Implementation
```html
<div id="advanced-component"></div>
<script>
    const goldComponent = new GoldGemComponent('#advanced-component', {
        enableBanner: true,
        enableGoldPrice: true,
        enableCalculator: false,
        enableSpecialOffer: true,
        enableContact: false,
        cdnBase: 'https://your-custom-cdn.com'
    });
    
    // Programmatically switch to English
    goldComponent.switchLanguage();
</script>
```

---

Made with ❤️ for the gold trading community. If you find this component useful, please give it a ⭐ on GitHub!
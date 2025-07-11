# Countdown Timer App

A modern, responsive countdown timer application with multi-language support (Thai/English) and beautiful UI powered by Tailwind CSS and daisyUI.

## 🌟 Features

- **Real-time Countdown Timer** with urgency-based color coding
- **Multi-language Support** (Thai/English) with instant switching
- **Responsive Design** optimized for mobile and desktop
- **Copy-to-Clipboard** functionality with visual feedback
- **Modular Architecture** with separated CSS and JavaScript files
- **Smooth Animations** and visual effects
- **SEO Friendly** with proper meta tags and accessibility

## 📁 Project Structure

```
countdown-app/
├── index.html                 # Main HTML file
├── assets/
│   ├── css/
│   │   ├── main.css          # Main styles and responsive design
│   │   └── countdown.css     # Countdown-specific animations
│   ├── js/
│   │   ├── countdown.js      # Countdown timer logic
│   │   ├── copy-function.js  # Copy-to-clipboard functionality
│   │   └── i18n.js          # Internationalization manager
│   └── data/
│       └── translations.json # Translation data for TH/EN
└── README.md                 # Project documentation
```

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open** `index.html` in a web browser
3. **No build process required** - runs directly in the browser

## 🎨 Features Breakdown

### Countdown Timer
- Dynamic countdown with days, hours, minutes, and seconds
- Color-coded urgency states:
  - **Red (Critical)**: Less than 1 hour remaining
  - **Orange (Urgent)**: Less than 3 hours remaining  
  - **Yellow (Warning)**: Less than 1 day remaining
  - **Normal**: More than 1 day remaining
- Automatic promotion state detection (before, during, after)

### Multi-language Support
- **Language Toggle**: Top-right button to switch between Thai/English
- **Persistent Storage**: Language preference saved in localStorage
- **Dynamic Updates**: All text updates instantly when language changes
- **Extensible**: Easy to add more languages via `translations.json`

### Copy Functionality
- **Modern Clipboard API** with fallback for older browsers
- **Mobile Support**: Special handling for iOS Safari
- **Visual Feedback**: Button changes to show copy success
- **Error Handling**: Graceful fallback with alert dialog

### Responsive Design
- **Mobile-first** approach with progressive enhancement
- **Flexible Layout**: Adapts to all screen sizes
- **Touch-friendly**: Optimized button sizes for mobile interaction

## 🛠️ Customization

### Changing Promotion Dates
Edit the configuration in `assets/js/countdown.js`:

```javascript
const promotionConfig = {
    startDate: "30/06/2025",    // DD/MM/YYYY format
    endDate: "28/07/2025",      // DD/MM/YYYY format
    discountCode: "AUS100TH"    // Discount code
};
```

### Adding New Languages
1. Add translation object to `assets/data/translations.json`
2. Update language switcher options in `assets/js/i18n.js`
3. Add new language option to the switcher UI

### Styling Customization
- **Main styles**: Edit `assets/css/main.css`
- **Countdown effects**: Modify `assets/css/countdown.css`
- **Colors**: Update Tailwind/daisyUI theme variables

## 📱 Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Legacy support**: IE11+ (with limited features)

## 🔧 Technical Details

### Dependencies
- **Tailwind CSS**: Utility-first CSS framework
- **daisyUI**: Component library for Tailwind
- **Google Fonts**: Prompt font family (Thai/English support)

### Performance
- **Lightweight**: ~50KB total size including assets
- **Fast Loading**: CDN-hosted dependencies
- **Efficient**: Minimal JavaScript with event-driven updates

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different browsers/devices
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check the browser console for error messages
- Ensure all asset files are properly linked
- Verify internet connection for CDN resources
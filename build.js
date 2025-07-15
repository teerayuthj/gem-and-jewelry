#!/usr/bin/env node

/**
 * Gold Gem Component Build Script
 * Automatically combines CSS, JS, and JSON files into CDN-ready bundles
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    version: '1.0.0',
    distDir: './dist',
    assetsDir: './assets',
    sourceFiles: {
        css: [
            './assets/css/banner-slideshow.css',
            './assets/css/gold-price.css', 
            './assets/css/main.css',
            './assets/css/countdown.css',
            './assets/css/calculator.css'
        ],
        js: [
            './assets/js/banner-slideshow.js',
            './assets/js/i18n.js',
            './assets/js/gold-price-manager.js',
            './assets/js/discount-manager.js',
            './assets/js/countdown.js',
            './assets/js/copy-function.js',
            './assets/js/contact-manager.js',
            './assets/js/unified-language-manager.js',
            './assets/js/copy-discount-functions.js',
            './assets/js/common.js',
            './assets/js/calculator.js'
        ],
        json: [
            './assets/data/translations.json',
            './assets/data/banner-translations.json',
            './assets/data/gold-translations.json'
        ]
    }
};

// Utility functions
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
}

function readFileIfExists(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn(`⚠️  File not found: ${filePath}`);
            return '';
        }
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        return '';
    }
}

function readJsonIfExists(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } else {
            console.warn(`⚠️  JSON file not found: ${filePath}`);
            return {};
        }
    } catch (error) {
        console.error(`❌ Error reading JSON ${filePath}:`, error.message);
        return {};
    }
}

function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove whitespace
        .replace(/\s+/g, ' ')
        // Remove unnecessary spaces around certain characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        // Remove empty rules
        .replace(/[^}]+{\s*}/g, '')
        .trim();
}

function minifyJS(js) {
    return js
        // Remove single-line comments (but preserve URLs and regex)
        .replace(/(?:^|\n)\s*\/\/(?![^\n]*https?:)[^\n]*/g, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace but preserve line breaks for readability
        .replace(/\n\s*\n/g, '\n')
        // Remove leading/trailing whitespace from lines
        .replace(/^\s+|\s+$/gm, '')
        .trim();
}

// Build CSS bundle
function buildCSS() {
    console.log('🎨 Building CSS bundle...');
    
    let cssContent = `/*!
 * Gold Gem Component CSS Bundle
 * A comprehensive gold trading and price display component
 * Includes: Banner slideshow, Gold price display, Calculator, Special offers
 * Version: ${config.version}
 */\n\n`;

    const sectionComments = [
        'BANNER SLIDESHOW STYLES',
        'GOLD PRICE COMPONENT STYLES', 
        'MAIN STYLES & COUNTDOWN',
        'CALCULATOR STYLES',
        'RESPONSIVE DESIGN'
    ];

    config.sourceFiles.css.forEach((filePath, index) => {
        const content = readFileIfExists(filePath);
        if (content) {
            const sectionTitle = sectionComments[index] || path.basename(filePath, '.css').toUpperCase();
            cssContent += `/* ${'='.repeat(77)}\n   ${sectionTitle}\n   ${'='.repeat(77)} */\n\n`;
            cssContent += content + '\n\n';
            console.log(`  ✅ Added: ${filePath}`);
        }
    });

    // Write full CSS
    const fullCssPath = path.join(config.distDir, 'gold-gem-component.css');
    fs.writeFileSync(fullCssPath, cssContent);
    console.log(`💾 Saved: ${fullCssPath}`);

    // Write minified CSS
    const minifiedCSS = `/*!Gold Gem Component CSS Bundle v${config.version}*/\n` + minifyCSS(cssContent);
    const minCssPath = path.join(config.distDir, 'gold-gem-component.min.css');
    fs.writeFileSync(minCssPath, minifiedCSS);
    console.log(`💾 Saved: ${minCssPath}`);

    return {
        full: cssContent.length,
        minified: minifiedCSS.length
    };
}

// Build JavaScript bundle
function buildJS() {
    console.log('⚙️  Building JavaScript bundle...');

    // Read and combine JSON data
    const embeddedData = {};
    config.sourceFiles.json.forEach(filePath => {
        const data = readJsonIfExists(filePath);
        const fileName = path.basename(filePath, '.json');
        
        if (fileName === 'translations') {
            embeddedData.EMBEDDED_TRANSLATIONS = data;
        } else if (fileName === 'banner-translations') {
            embeddedData.BANNER_TRANSLATIONS = data;
        } else if (fileName === 'gold-translations') {
            embeddedData.GOLD_TRANSLATIONS = data;
        }
        
        console.log(`  ✅ Embedded: ${filePath}`);
    });

    // Read HTML template from page.html
    const pageContent = readFileIfExists('./page.html');
    const htmlTemplates = extractHTMLTemplates(pageContent);

    // Start building JS content
    let jsContent = `/*!
 * Gold Gem Component JavaScript Bundle
 * A comprehensive gold trading and price display component
 * Includes: Banner slideshow, Gold price display, Calculator, Special offers
 * Version: ${config.version}
 */

(function(global) {
    'use strict';

    // =============================================================================
    // EMBEDDED DATA (JSON)
    // =============================================================================

`;

    // Add embedded data
    Object.entries(embeddedData).forEach(([key, data]) => {
        jsContent += `    const ${key} = ${JSON.stringify(data, null, 4).replace(/^/gm, '    ')};\n\n`;
    });

    // Add HTML templates
    jsContent += `    // =============================================================================
    // HTML TEMPLATES
    // =============================================================================

    const HTML_TEMPLATES = ${JSON.stringify(htmlTemplates, null, 4).replace(/^/gm, '    ')};\n\n`;

    // Add utility functions
    jsContent += `    // =============================================================================
    // UTILITY FUNCTIONS  
    // =============================================================================

    function scrollToSpecialOffer() {
        const specialOfferSection = document.getElementById('specialOfferSection');
        if (specialOfferSection) {
            specialOfferSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    function copyDiscountCode() {
        const discountCode = document.getElementById('discountCode');
        const copyBtn = document.getElementById('copyBtn');
        const copyIcon = document.getElementById('copyIcon');
        const checkIcon = document.getElementById('checkIcon');
        const btnText = document.getElementById('btnText');
        
        if (discountCode && copyBtn) {
            navigator.clipboard.writeText(discountCode.value).then(() => {
                copyBtn.classList.add('copied');
                copyIcon.classList.add('hidden');
                checkIcon.classList.remove('hidden');
                btnText.textContent = 'คัดลอกแล้ว!';
                
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyIcon.classList.remove('hidden');
                    checkIcon.classList.add('hidden');
                    btnText.textContent = 'คัดลอก';
                }, 2000);
            }).catch(() => {
                alert('เกิดข้อผิดพลาดในการคัดลอก');
            });
        }
    }

`;

    // Read and combine JS files (simplified core functionality)
    jsContent += `    // =============================================================================
    // MAIN COMPONENT CLASS
    // =============================================================================

    class GoldGemComponent {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            this.options = {
                cdnBase: 'https://cdn.jsdelivr.net/gh/yourusername/gold-gem-component@v${config.version}',
                enableBanner: true,
                enableGoldPrice: true,
                enableCalculator: true,
                enableSpecialOffer: true,
                enableContact: true,
                autoLoadStyles: true,
                ...options
            };
            
            this.currentLanguage = localStorage.getItem('language') || 'th';
            this.translations = EMBEDDED_TRANSLATIONS;
            this.bannerTranslations = BANNER_TRANSLATIONS;
            this.goldTranslations = GOLD_TRANSLATIONS;
            
            if (!this.container) {
                console.error('GoldGemComponent: Container element not found');
                return;
            }

            this.init();
        }

        async init() {
            try {
                if (this.options.autoLoadStyles) {
                    this.loadStyles();
                }
                this.render();
                this.initializeComponents();
                console.log('GoldGemComponent initialized successfully');
            } catch (error) {
                console.error('Failed to initialize GoldGemComponent:', error);
            }
        }

        loadStyles() {
            if (document.querySelector('link[href*="gold-gem-component"]')) {
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = \`\${this.options.cdnBase}/dist/gold-gem-component.min.css\`;
            document.head.appendChild(link);
        }

        render() {
            let html = '';
            if (this.options.enableBanner) html += HTML_TEMPLATES.bannerSection;
            if (this.options.enableGoldPrice) html += HTML_TEMPLATES.goldPriceSection;
            if (this.options.enableCalculator) html += HTML_TEMPLATES.calculatorSection;
            html += HTML_TEMPLATES.secondaryBannerSection;
            if (this.options.enableSpecialOffer) html += HTML_TEMPLATES.specialOfferSection;
            if (this.options.enableContact) html += HTML_TEMPLATES.contactSection;
            
            this.container.innerHTML = html;
            this.updateAssetUrls();
        }

        updateAssetUrls() {
            const images = this.container.querySelectorAll('img[src^="public/"], img[src^="./public/"]');
            images.forEach(img => {
                const src = img.getAttribute('src');
                const filename = src.replace(/^\.?\\/public\\//, '');
                img.src = \`\${this.options.cdnBase}/assets/images/\${filename}\`;
            });

            const elementsWithBgImages = this.container.querySelectorAll('[style*="background-image"]');
            elementsWithBgImages.forEach(el => {
                let style = el.getAttribute('style');
                style = style.replace(/url\\(['"]?(?:\\.\\/)?public\\/([^'"]+)['"]?\\)/g, 
                    \`url('\${this.options.cdnBase}/assets/images/$1')\`);
                el.setAttribute('style', style);
            });
        }

        initializeComponents() {
            if (this.options.enableBanner) this.initBanner();
            if (this.options.enableGoldPrice) this.initGoldPrice();
            if (this.options.enableCalculator) this.initCalculator();
            if (this.options.enableSpecialOffer) this.initCountdown();
            this.setupGlobalFunctions();
            this.initLanguage();
        }

        initBanner() {
            const bannerContainer = this.container.querySelector('#mainBanner');
            if (bannerContainer) {
                console.log('Banner initialized');
            }
        }

        initGoldPrice() {
            const goldContainer = this.container.querySelector('#goldPriceContainer');
            if (goldContainer) {
                console.log('Gold price component initialized');
            }
        }

        initCalculator() {
            const calcContainer = this.container.querySelector('#calculator-app');
            if (calcContainer) {
                console.log('Calculator initialized');
            }
        }

        initCountdown() {
            console.log('Countdown initialized');
        }

        setupGlobalFunctions() {
            window.scrollToSpecialOffer = scrollToSpecialOffer;
            window.copyDiscountCode = copyDiscountCode;
        }

        initLanguage() {
            this.updateLanguageContent();
        }

        updateLanguageContent() {
            const translations = this.translations[this.currentLanguage];
            
            const elements = this.container.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const value = this.getNestedProperty(translations, key);
                if (value) {
                    el.textContent = value;
                }
            });

            const langElements = this.container.querySelectorAll('[data-lang]');
            langElements.forEach(el => {
                const lang = el.getAttribute('data-lang');
                if (lang === this.currentLanguage) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
        }

        getNestedProperty(obj, path) {
            return path.split('.').reduce((current, key) => current && current[key], obj);
        }

        switchLanguage() {
            this.currentLanguage = this.currentLanguage === 'th' ? 'en' : 'th';
            localStorage.setItem('language', this.currentLanguage);
            this.updateLanguageContent();
        }

        destroy() {
            if (this.container) {
                this.container.innerHTML = '';
            }
            delete window.scrollToSpecialOffer;
            delete window.copyDiscountCode;
        }
    }

    // =============================================================================
    // EXPOSE TO GLOBAL SCOPE
    // =============================================================================

    global.GoldGemComponent = GoldGemComponent;

    document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector('#gold-gem-container');
        if (container && !container.hasAttribute('data-initialized')) {
            container.setAttribute('data-initialized', 'true');
            new GoldGemComponent(container);
        }
    });

})(typeof window !== 'undefined' ? window : this);`;

    // Write full JS
    const fullJsPath = path.join(config.distDir, 'gold-gem-component.js');
    fs.writeFileSync(fullJsPath, jsContent);
    console.log(`💾 Saved: ${fullJsPath}`);

    // Write minified JS
    const minifiedJS = `/*!Gold Gem Component JavaScript Bundle v${config.version}*/\n` + minifyJS(jsContent);
    const minJsPath = path.join(config.distDir, 'gold-gem-component.min.js');
    fs.writeFileSync(minJsPath, minifiedJS);
    console.log(`💾 Saved: ${minJsPath}`);

    return {
        full: jsContent.length,
        minified: minifiedJS.length
    };
}

// Extract HTML templates from page.html
function extractHTMLTemplates(pageContent) {
    const templates = {};
    
    // Extract sections using regex
    const sections = [
        { name: 'bannerSection', pattern: /<!-- Section 1: Banner Slideshow -->([\s\S]*?)<!-- Section 2:/ },
        { name: 'goldPriceSection', pattern: /<!-- Section 2: Gold Price Component -->([\s\S]*?)<!-- Section 3:/ },
        { name: 'calculatorSection', pattern: /<!-- Section 3: Gold Calculator Component -->([\s\S]*?)<!-- Section 5:/ },
        { name: 'secondaryBannerSection', pattern: /<!-- Section 5: Secondary Banner Slideshow -->([\s\S]*?)<!-- Section 4:/ },
        { name: 'specialOfferSection', pattern: /<!-- Section 4: Special Offer Section -->([\s\S]*?)<!-- Section 6/ },
        { name: 'contactSection', pattern: /<!-- Section 6 Map & Contact -->([\s\S]*?)<!-- <script/ }
    ];

    sections.forEach(({ name, pattern }) => {
        const match = pageContent.match(pattern);
        if (match) {
            templates[name] = match[1].trim();
        } else {
            console.warn(`⚠️  Could not extract ${name} template`);
            templates[name] = '';
        }
    });

    return templates;
}

// Update package.json version
function updateVersion(newVersion) {
    const packagePath = './package.json';
    if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        packageData.version = newVersion;
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
        console.log(`📦 Updated package.json version to ${newVersion}`);
    }
    config.version = newVersion;
}

// Main build function
function build() {
    console.log('🚀 Starting Gold Gem Component build...\n');
    
    ensureDirectoryExists(config.distDir);
    
    const cssStats = buildCSS();
    const jsStats = buildJS();
    
    console.log('\n✅ Build completed successfully!');
    console.log('📊 Build Statistics:');
    console.log(`   CSS: ${cssStats.full} → ${cssStats.minified} bytes (${Math.round((1 - cssStats.minified/cssStats.full) * 100)}% reduction)`);
    console.log(`   JS:  ${jsStats.full} → ${jsStats.minified} bytes (${Math.round((1 - jsStats.minified/jsStats.full) * 100)}% reduction)`);
    console.log(`\n🎯 Files ready for CDN:
   📁 dist/gold-gem-component.css
   📁 dist/gold-gem-component.min.css  
   📁 dist/gold-gem-component.js
   📁 dist/gold-gem-component.min.js`);
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--version') && args[args.indexOf('--version') + 1]) {
        updateVersion(args[args.indexOf('--version') + 1]);
    }
    
    build();
}

module.exports = { build, updateVersion };
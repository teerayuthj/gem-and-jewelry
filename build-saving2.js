/**
 * Build Script for Gold Saving Calculator 2
 *
 * Bundles JS and CSS files into single files for production
 *
 * Usage:
 *   node build-saving2.js          - Build with minification
 *   node build-saving2.js --dev    - Build without minification (for debugging)
 *
 * Output:
 *   dist/gold-saving2/gold-saving2.bundle.js
 *   dist/gold-saving2/gold-saving2.bundle.css
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    outputDir: 'dist/gold-saving2',

    // JS files in correct load order
    jsFiles: [
        'assets/js/shared/shared-price-manager.js',
        'assets/js/shared/gold-products.js',
        'assets/js/calculator/gold-saving2/calculator-config.js',
        'assets/js/calculator/gold-saving2/calculator-core.js',
        'assets/js/calculator/gold-saving2/calculator-ui.js',
        'assets/js/calculator/gold-saving2/calculator-features.js',
        'assets/js/calculator/gold-saving2/gold-saving-visuals.js',
        'assets/js/calculator/gold-saving2/gold-saving-calculator2.js',
        'assets/js/calculator/gold-saving2/modern-luxury-effects.js',
        'assets/js/calculator/gold-saving2/gold-saving2-init.js'  // Page initialization (must be last)
    ],

    // CSS files (resolved from @imports)
    cssFiles: [
        'assets/css/liquid-glass-cards.css',
        'assets/css/gold-saving2.css',
        'assets/css/gold-saving2-enhancements.css',
        'assets/css/gold-saving2-visuals.css',
        'assets/css/gold-saving2-modern-luxury.css',
        'assets/css/variant-modal-enhanced.css',
        'assets/css/image-viewer-enhanced.css',
        'assets/css/gold-saving2-page.css'  // Page-specific styles
    ]
};

// Check for --dev flag
const isDev = process.argv.includes('--dev');

// Ensure output directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Read and concatenate files
function concatenateFiles(files, separator = '\n\n') {
    let content = '';
    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            content += `/* === ${file} === */\n`;
            content += fileContent;
            content += separator;
        } else {
            console.warn(`Warning: File not found: ${file}`);
        }
    }
    return content;
}

// Build JS bundle
async function buildJS() {
    console.log('Building JS bundle...');

    // Concatenate all JS files
    const combinedJS = concatenateFiles(config.jsFiles);

    // Write temporary combined file
    const tempFile = path.join(__dirname, config.outputDir, '_temp.js');
    ensureDir(path.dirname(tempFile));
    fs.writeFileSync(tempFile, combinedJS);

    // Use esbuild to minify
    const outputFile = path.join(__dirname, config.outputDir, 'gold-saving2.bundle.js');

    await esbuild.build({
        entryPoints: [tempFile],
        outfile: outputFile,
        bundle: false,
        minify: !isDev,
        sourcemap: isDev,
        target: ['es2015'],
        charset: 'utf8'
    });

    // Remove temp file
    fs.unlinkSync(tempFile);

    // Get file size
    const stats = fs.statSync(outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`  ✓ JS bundle created: ${outputFile}`);
    console.log(`    Size: ${sizeKB} KB ${isDev ? '(unminified)' : '(minified)'}`);

    return outputFile;
}

// Build CSS bundle
async function buildCSS() {
    console.log('Building CSS bundle...');

    // Concatenate all CSS files (skip @import statements)
    let combinedCSS = '';

    for (const file of config.cssFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            let fileContent = fs.readFileSync(filePath, 'utf8');

            // Remove @import statements to avoid duplicates
            fileContent = fileContent.replace(/@import\s+url\(['"]?[^'"]+['"]?\);?\s*/g, '');

            combinedCSS += `/* === ${file} === */\n`;
            combinedCSS += fileContent;
            combinedCSS += '\n\n';
        } else {
            console.warn(`Warning: File not found: ${file}`);
        }
    }

    // Write temporary combined file
    const tempFile = path.join(__dirname, config.outputDir, '_temp.css');
    ensureDir(path.dirname(tempFile));
    fs.writeFileSync(tempFile, combinedCSS);

    // Use esbuild to minify CSS
    const outputFile = path.join(__dirname, config.outputDir, 'gold-saving2.bundle.css');

    await esbuild.build({
        entryPoints: [tempFile],
        outfile: outputFile,
        bundle: false,
        minify: !isDev,
        sourcemap: isDev,
        loader: { '.css': 'css' }
    });

    // Remove temp file
    fs.unlinkSync(tempFile);

    // Get file size
    const stats = fs.statSync(outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`  ✓ CSS bundle created: ${outputFile}`);
    console.log(`    Size: ${sizeKB} KB ${isDev ? '(unminified)' : '(minified)'}`);

    return outputFile;
}

// Main build function
async function build() {
    console.log('');
    console.log('='.repeat(50));
    console.log('  Gold Saving Calculator 2 - Build Script');
    console.log('  Mode:', isDev ? 'Development' : 'Production');
    console.log('='.repeat(50));
    console.log('');

    const startTime = Date.now();

    try {
        ensureDir(path.join(__dirname, config.outputDir));

        await buildJS();
        console.log('');
        await buildCSS();

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('');
        console.log('='.repeat(50));
        console.log(`  Build completed in ${elapsed}s`);
        console.log('');
        console.log('  Output files:');
        console.log(`    - ${config.outputDir}/gold-saving2.bundle.js`);
        console.log(`    - ${config.outputDir}/gold-saving2.bundle.css`);
        console.log('');
        console.log('  Use in HTML:');
        console.log('    <link rel="stylesheet" href="./dist/gold-saving2/gold-saving2.bundle.css">');
        console.log('    <script src="./dist/gold-saving2/gold-saving2.bundle.js"></script>');
        console.log('='.repeat(50));
        console.log('');

    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();

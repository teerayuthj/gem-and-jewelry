#!/usr/bin/env node

/**
 * Watch script for Gold Gem Component development
 * Automatically rebuilds when source files change
 */

const fs = require('fs');
const path = require('path');
const { build } = require('./build.js');

const watchPaths = [
    './assets/css/',
    './assets/js/',
    './assets/data/',
    './page.html'
];

console.log('👀 Watching for changes...');
console.log('Files being watched:');
watchPaths.forEach(p => console.log(`   📁 ${p}`));
console.log('\nPress Ctrl+C to stop watching\n');

// Initial build
build();

// Watch for changes
const watchers = [];

watchPaths.forEach(watchPath => {
    if (fs.existsSync(watchPath)) {
        const watcher = fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
            if (filename && (filename.endsWith('.css') || filename.endsWith('.js') || filename.endsWith('.json') || filename.endsWith('.html'))) {
                console.log(`\n🔄 ${eventType}: ${path.join(watchPath, filename)}`);
                console.log('🔨 Rebuilding...');
                
                try {
                    build();
                    console.log('✅ Build completed!\n');
                } catch (error) {
                    console.error('❌ Build failed:', error.message);
                }
            }
        });
        
        watchers.push(watcher);
    }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping watchers...');
    watchers.forEach(watcher => watcher.close());
    process.exit(0);
});
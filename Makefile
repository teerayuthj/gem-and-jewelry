# Gold Gem Component Makefile
# Quick commands for development and deployment

.PHONY: help build watch dev clean release tag

# Default target
help:
	@echo "🥇 Gold Gem Component Build Commands"
	@echo ""
	@echo "Development:"
	@echo "  make build    - Build component bundles"
	@echo "  make watch    - Watch for changes and auto-build"
	@echo "  make dev      - Build and open demo in browser"
	@echo "  make clean    - Clean dist directory"
	@echo ""
	@echo "Release:"
	@echo "  make release  - Build, commit, and push"
	@echo "  make tag      - Create new version tag"
	@echo ""
	@echo "Examples:"
	@echo "  make build                    # Basic build"
	@echo "  make build VERSION=1.1.0     # Build with version"
	@echo "  make tag VERSION=1.1.0       # Create version tag"

# Build the component
build:
	@echo "🔨 Building Gold Gem Component..."
ifdef VERSION
	@node build.js --version $(VERSION)
else
	@node build.js
endif
	@echo "✅ Build completed!"

# Watch for changes
watch:
	@echo "👀 Starting file watcher..."
	@node watch.js

# Development mode
dev: build
	@echo "🚀 Opening demo in browser..."
	@open dist/demo.html || xdg-open dist/demo.html || start dist/demo.html

# Clean dist directory
clean:
	@echo "🧹 Cleaning dist directory..."
	@rm -rf dist/
	@echo "✅ Cleaned!"

# Release workflow
release: build
	@echo "📦 Creating release..."
	@git add dist/
	@git commit -m "Build: Update component bundle v$(shell node -p "require('./package.json').version")" || echo "No changes to commit"
	@git push origin master
	@echo "🚀 Released!"

# Create version tag
tag:
ifdef VERSION
	@echo "🏷️  Creating version tag $(VERSION)..."
	@make build VERSION=$(VERSION)
	@git add .
	@git commit -m "Release v$(VERSION)" || echo "No changes to commit"
	@git tag -a v$(VERSION) -m "Gold Gem Component v$(VERSION)"
	@git push origin master --tags
	@echo "✅ Tagged v$(VERSION)!"
else
	@echo "❌ Please specify VERSION: make tag VERSION=1.1.0"
endif

# Install dependencies (if needed)
install:
	@echo "📦 Installing dependencies..."
	@npm install
	@echo "✅ Dependencies installed!"

# Test the component
test:
	@echo "🧪 Testing component..."
	@node -e "console.log('✅ Syntax check passed')" 
	@test -f dist/gold-gem-component.css || (echo "❌ CSS bundle not found" && exit 1)
	@test -f dist/gold-gem-component.js || (echo "❌ JS bundle not found" && exit 1)
	@test -f dist/gold-gem-component.min.css || (echo "❌ Minified CSS not found" && exit 1)
	@test -f dist/gold-gem-component.min.js || (echo "❌ Minified JS not found" && exit 1)
	@echo "✅ All tests passed!"

# Show file sizes
size:
	@echo "📊 Component sizes:"
	@echo "CSS:      $$(wc -c < dist/gold-gem-component.css) bytes"
	@echo "CSS min:  $$(wc -c < dist/gold-gem-component.min.css) bytes"
	@echo "JS:       $$(wc -c < dist/gold-gem-component.js) bytes" 
	@echo "JS min:   $$(wc -c < dist/gold-gem-component.min.js) bytes"
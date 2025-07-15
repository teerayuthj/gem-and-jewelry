// GitHub Asset Helper for Components
class GitHubAssetHelper {
    constructor() {
        this.baseUrl = window.GITHUB_ASSETS_BASE || '';
        this.isGitHubMode = !!window.GITHUB_ASSETS_BASE;
    }

    // Get asset path (local or GitHub)
    getAssetPath(localPath) {
        if (this.isGitHubMode) {
            return `${this.baseUrl}/${localPath}`;
        }
        return localPath;
    }

    // Get image path
    getImagePath(imageName) {
        return this.getAssetPath(`public/${imageName}`);
    }

    // Get CSS path
    getCSSPath(cssName) {
        return this.getAssetPath(`assets/css/${cssName}`);
    }

    // Get JS path
    getJSPath(jsName) {
        return this.getAssetPath(`assets/js/${jsName}`);
    }

    // Update image sources in HTML
    updateImageSources(htmlString) {
        if (!this.isGitHubMode) return htmlString;
        
        return htmlString.replace(/src="public\//g, `src="${this.baseUrl}/public/`);
    }

    // Update background image URLs
    updateBackgroundImages(htmlString) {
        if (!this.isGitHubMode) return htmlString;
        
        return htmlString.replace(/url\('public\//g, `url('${this.baseUrl}/public/`);
    }

    // Process HTML for GitHub assets
    processHTML(htmlString) {
        let processed = htmlString;
        processed = this.updateImageSources(processed);
        processed = this.updateBackgroundImages(processed);
        return processed;
    }
}

// Global instance
window.GitHubAssets = new GitHubAssetHelper();
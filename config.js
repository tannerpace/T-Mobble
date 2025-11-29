// Environment configuration for running on vscode.dev or vscode.com
const ENV_CONFIG = {
  // Detect if running on vscode.dev
  isVSCodeDev: () => {
    return window.location.hostname.includes('vscode.dev');
  },

  // Detect if running on vscode.com
  isVSCodeCom: () => {
    return window.location.hostname.includes('vscode.com');
  },

  // Get the base path based on environment
  getBasePath: () => {
    const isVSCode = ENV_CONFIG.isVSCodeDev() || ENV_CONFIG.isVSCodeCom();
    const isLocalhost = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '';

    // Local development - use root path
    if (isLocalhost && !isVSCode) {
      return '';
    }

    if (isVSCode) {
      // For vscode.dev/vscode.com, use the repository structure
      // Typically: /github/{owner}/{repo}/
      const pathParts = window.location.pathname.split('/').filter(p => p);

      // If path contains github, use the first 3 parts (github/owner/repo)
      if (pathParts.includes('github')) {
        const githubIndex = pathParts.indexOf('github');
        return '/' + pathParts.slice(0, githubIndex + 3).join('/');
      }

      // Otherwise, use the repository name
      return '/T-Mobble';
    }

    // Default path for GitHub Pages
    return '/T-Mobble';
  },

  // Get full asset path
  getAssetPath: (assetPath) => {
    const basePath = ENV_CONFIG.getBasePath();
    // Remove leading slash from assetPath if present
    const cleanAssetPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    return `${basePath}/${cleanAssetPath}`;
  }
};

// Make available globally
window.ENV_CONFIG = ENV_CONFIG;

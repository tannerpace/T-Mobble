# VS Code Web Setup Guide

## Running on vscode.dev or vscode.com

This project is now configured to work seamlessly on VS Code for the Web (vscode.dev) and GitHub Codespaces (vscode.com).

### Quick Start

#### Option 1: vscode.dev
1. Navigate to [vscode.dev](https://vscode.dev)
2. Open your GitHub repository:
   - Press `Cmd+O` (Mac) or `Ctrl+O` (Windows/Linux)
   - Select "Open Remote Repository"
   - Choose your repository: `tannerpace/t-mobile`

3. Open `index.html` in the editor
4. Use the "Live Preview" extension (usually pre-installed in vscode.dev):
   - Right-click on `index.html`
   - Select "Show Preview" or press `Cmd+Shift+V` (Mac) / `Ctrl+Shift+V` (Windows/Linux)

#### Option 2: Direct URL
Open your repository directly:
```
https://vscode.dev/github/tannerpace/t-mobile
```

Or with a specific file:
```
https://vscode.dev/github/tannerpace/t-mobile/index.html
```

### How It Works

The project includes environment detection that automatically adapts to different hosting environments:

#### Dynamic Path Resolution
- **config.js**: Detects whether running on vscode.dev, vscode.com, or standard hosting
- Automatically adjusts asset paths based on the environment
- Works with GitHub Pages paths (`/t-mobile/`) and vscode.dev paths

#### Environment-Specific Features

1. **Service Worker**: 
   - Disabled on vscode.dev/vscode.com (not supported in these environments)
   - Enabled for GitHub Pages and local development

2. **Asset Paths**:
   - Dynamically calculated based on URL structure
   - Supports both `/t-mobile/` prefix and root paths

3. **Manifest**:
   - Uses relative paths for better compatibility
   - Updated dynamically via JavaScript

### Files Modified for VS Code Web Support

- `config.js` - New file providing environment detection
- `index.html` - Updated to load config and use dynamic paths
- `service-worker.js` - Updated with dynamic path support
- `manifest-template.json` - Template with relative paths

### Testing in Different Environments

#### Local Development
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve
```
Visit: `http://localhost:8000/index.html`

#### GitHub Pages
Push to your repository and enable GitHub Pages in settings.
Visit: `https://tannerpace.github.io/t-mobile/`

#### vscode.dev
Visit: `https://vscode.dev/github/tannerpace/t-mobile`

### Features Supported

✅ Game functionality works on all platforms
✅ Auto-detects environment and adjusts paths
✅ Service Worker works on GitHub Pages
✅ Preview works in vscode.dev with Live Preview extension
✅ Compatible with vscode.com (Codespaces/GitHub.dev)

### Troubleshooting

**Issue: Blank page in vscode.dev preview**
- Make sure you're using the Live Preview extension
- Check browser console for any errors (F12)
- Verify all files are committed and pushed to GitHub

**Issue: Assets not loading**
- The `config.js` file must be loaded before other scripts
- Check that paths in browser console match your environment

**Issue: Service Worker errors in vscode.dev**
- This is expected - Service Workers are disabled in VS Code Web environments
- Check console for "Running in VS Code environment - Service Worker disabled" message

### Development Workflow

1. **Edit on vscode.dev**: Make changes directly in your browser
2. **Commit changes**: Use the Source Control panel in vscode.dev
3. **Preview immediately**: Changes reflect instantly in Live Preview
4. **Deploy to GitHub Pages**: Automatic deployment on push

### Additional Resources

- [VS Code for the Web](https://code.visualstudio.com/docs/editor/vscode-web)
- [GitHub.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor)
- [Live Preview Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server)

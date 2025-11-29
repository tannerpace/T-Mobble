# Contributing to T-Mobble

## Development Workflow

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/tannerpace/T-Mobble.git
cd T-Mobble
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Playwright browsers**
```bash
npx playwright install
```

### Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Run all tests
npm test

# Run tests in UI mode (interactive, great for debugging)
npm run test:ui

# Run tests in headed mode (see the browser)
npm run test:headed

# Run only responsive layout tests
npm run test:responsive

# Run only game functionality tests
npm run test:game

# Run tests for specific browser
npm run test:chromium

# Run tests for mobile devices only
npm run test:mobile

# View test report
npm run test:report

# Run tests in CI mode (for GitHub Actions)
npm run test:ci

# Validate before committing (runs all tests)
npm run validate
```

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Edit files in `src/`, `public/`, or `assets/`
   - Follow the coding conventions in `.github/copilot-instructions.md`

3. **Test your changes**
```bash
npm test
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: describe your changes"
git push origin feature/your-feature-name
```

5. **Create a Pull Request**
   - Go to GitHub and create a PR from your branch
   - Tests will run automatically
   - Wait for review and approval

## CI/CD Pipeline

### Automated Testing

When you create a pull request or push to main:

1. **Test Job** runs automatically:
   - Installs dependencies
   - Runs Playwright tests across 8 device configurations
   - Tests on Chrome, Firefox, and Safari
   - Uploads test reports as artifacts

2. **Deploy Job** runs only on `main` branch:
   - Waits for tests to pass
   - Deploys to GitHub Pages automatically
   - Updates live site at https://tannerpace.github.io/T-Mobble/

### Test Results

- ✅ Tests must pass before deployment
- 📊 Test reports are available in GitHub Actions artifacts
- 🚫 Failed tests block deployment to prevent breaking the live site

### Pull Request Workflow

1. **Create PR** → Tests run automatically
2. **Review test results** in the PR checks
3. **Fix any failures** if needed
4. **Get approval** from maintainers
5. **Merge to main** → Automatic deployment

## Coding Standards

### JavaScript
- Use ES6+ features (const/let, arrow functions, classes)
- Follow the game architecture in `ARCHITECTURE.md`
- Use meaningful variable names
- Add comments for complex logic

### CSS
- Use consistent spacing and indentation
- Follow mobile-first responsive design
- Test on multiple screen sizes

### Testing
- Write tests for new features
- Ensure all tests pass before submitting PR
- Test on both desktop and mobile viewports

## File Structure

```
T-Mobble/
├── public/              # Static web assets
│   ├── index.html      # Main HTML file
│   ├── style.css       # Styles
│   └── manifest.json   # PWA manifest
├── src/                # Source code
│   ├── main.js         # Entry point
│   ├── entities/       # Game entities (Dino, Obstacle, etc.)
│   ├── game/           # Game logic
│   └── utils/          # Utilities
├── assets/             # Images, audio, icons
├── tests/              # Playwright tests
│   ├── game.spec.js    # Game functionality tests
│   └── responsive.spec.js  # Responsive layout tests
└── .github/
    └── workflows/
        └── deploy.yml  # CI/CD pipeline

```

## Need Help?

- 📖 Check `ARCHITECTURE.md` for code organization
- 🧪 Check `TEST_RESULTS.md` for current test status
- 💡 Check `.github/copilot-instructions.md` for guidelines
- 🐛 Open an issue for bugs or questions

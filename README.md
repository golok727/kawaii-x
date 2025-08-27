# X Markdown Renderer

Fast Chrome extension for rendering Markdown in X.com tweets with syntax highlighting.

## File Structure

```
xdown/
├── manifest.json          # Chrome extension manifest
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration  
├── bunfig.toml          # Bun configuration
├── styles.css           # Extension styles
├── content.js           # Built content script (generated)
├── src/
│   ├── content.ts       # Main content script
│   └── renderer.ts      # Markdown renderer
└── README.md           # This file
```

## Build Steps

1. **Install Bun** (if not already installed):
   ```powershell
   irm bun.sh/install.ps1 | iex
   ```

2. **Clone/navigate to project directory**:
   ```powershell
   cd c:\Users\Radha\dev\xdown
   ```

3. **Install dependencies**:
   ```powershell
   bun install
   ```

4. **Build the extension**:
   ```powershell
   bun run build
   ```

   This generates `content.js` in the root directory.

5. **For development with auto-rebuild**:
   ```powershell
   bun run dev
   ```

## Install and Test

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable "Developer mode" (toggle in top right)

3. Click "Load unpacked"

4. Select the `xdown` folder containing `manifest.json`

5. The extension will appear in your extensions list

### Test on X.com

1. Navigate to https://x.com

2. Look for tweets with text content

3. You should see a "MD" button next to like/retweet buttons

4. Click "MD" to render Markdown (button changes to "TXT")

5. Click "TXT" to toggle back to original text

### Test Cases

Create tweets with:

- **Inline code**: `console.log('hello')`
- **Code blocks**:
  ```javascript
  function test() {
    return 'markdown works';
  }
  ```
- **Headers**: # Title, ## Subtitle
- **Lists**: - Item 1, - Item 2
- **Links**: [Google](https://google.com)
- **Bold/italic**: **bold** *italic*

### Performance Features

- Lazy initialization of syntax highlighter
- WeakSet tracking to avoid reprocessing tweets
- MutationObserver for efficient DOM monitoring
- Minimal CSS with modern selectors
- Bundled and minified output

### Supported Languages

JavaScript, TypeScript, Python, HTML, CSS, JSON, Bash, SQL, Markdown, YAML, XML

The extension automatically detects language from code fence markers.

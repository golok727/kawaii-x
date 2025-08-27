You are an expert Chrome extension developer. I want to build a Chrome extension in TypeScript (using Bun as my dev environment) that adds a button to each post on X.com (Twitter). When clicked, the button should replace the original tweet text with a Markdown-rendered version (supporting inline code, fenced code blocks, lists, headings). The implementation must be step by step and production-ready.

Constraints and requirements:

Use Manifest V3 for the extension.

Organize files clearly (manifest.json, src/content.ts, src/renderer.ts, src/styles.css).

Use a Markdown parser use remark with rehype and use shiki for highlighting  use 

The extension should:

Detect tweet text containers (div[lang] inside article).

Inject a “Render MD” button for each tweet if not already present.

On click, parse the raw tweet text → render it as HTML with Markdown + syntax highlighting.

Replace the tweet text node’s innerHTML with the rendered content.

Support toggling back to the original text if the button is clicked again.

Style rendered content with a minimal styles.css (pre/code styling, inline code, headings).

Include a bunfig.toml and instructions for building with Bun (transpiling TypeScript → JS).

Provide the complete file contents for each file in the extension.

At the end, include step-by-step build and install instructions: how to compile with Bun, how to load unpacked extension in Chrome, and how to test it on x.com.

Please output a structured guide with:

File structure tree

Full content of each file

Build steps with Bun

Install and test steps

Do not skip any code. Do not add explanations, marketing text, or emojis. Just provide a clear technical build guide with working code.
// Fast content script for X.com Markdown rendering
import { MarkdownRenderer } from "./renderer.js";

interface TweetData {
	textElement: HTMLElement;
	originalHTML: string;
	isRendered: boolean;
	button?: HTMLButtonElement;
}

class XMarkdownExtension {
	private renderer: MarkdownRenderer;
	private tweets = new Map<HTMLElement, TweetData>();
	private processedTweets = new WeakSet<HTMLElement>();
	private observer: MutationObserver;
	private processingTimeout: number | null = null;

	constructor() {
		this.renderer = new MarkdownRenderer();
		this.observer = new MutationObserver(this.handleMutations.bind(this));
	}

	async init(): Promise<void> {
		await this.renderer.init();
		this.processTweets();
		this.startObserving();
	}

	private startObserving(): void {
		// Optimized observer settings for performance
		this.observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false,
		});
	}

	private handleMutations(mutations: MutationRecord[]): void {
		let shouldProcess = false;

		// Quick check for relevant mutations
		for (const mutation of mutations) {
			if (mutation.addedNodes.length > 0) {
				for (const node of mutation.addedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						const element = node as HTMLElement;
						// Check if this could contain tweets
						if (
							element.tagName === "ARTICLE" ||
							element.querySelector?.("article") ||
							element.getAttribute?.("data-testid")?.includes("tweet")
						) {
							shouldProcess = true;
							break;
						}
					}
				}
			}
			if (shouldProcess) break;
		}

		if (shouldProcess) {
			// Debounced processing to avoid excessive calls
			if (this.processingTimeout) {
				clearTimeout(this.processingTimeout);
			}
			this.processingTimeout = window.setTimeout(() => {
				this.processTweets();
				this.processingTimeout = null;
			}, 100);
		}
	}

	private processTweets(): void {
		// Find all tweet containers on the page
		const tweets = document.querySelectorAll('article[data-testid="tweet"]');
		console.log(`Found ${tweets.length} tweets to process`);
		tweets.forEach((tweet) => this.processTweet(tweet as HTMLElement));
	}

	private processTweet(tweet: HTMLElement): void {
		if (this.processedTweets.has(tweet)) return;

		// Look for the tweet text container with the correct selector
		const tweetTextContainer = tweet.querySelector(
			'div[data-testid="tweetText"]'
		);
		if (!tweetTextContainer) {
			console.log("No tweetText container found in:", tweet);
			return;
		}

		console.log("Processing tweet with text container:", tweetTextContainer);
		this.processedTweets.add(tweet);
		this.addMarkdownButton(tweet, tweetTextContainer as HTMLElement);
	}

	private addMarkdownButton(
		tweet: HTMLElement,
		textContainer: HTMLElement
	): void {
		// Find the action bar (like, retweet, etc.)
		const actionBar = tweet.querySelector('div[role="group"]');
		if (!actionBar) return;

		// Check if button already exists
		if (actionBar.querySelector(".xmd-button")) return;

		const button = document.createElement("button");
		button.className = "xmd-button";
		button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11H7v-1h2v1zm0-2H7V6h2v3zm-3-3H4v3h2V6zm8 5h-2V6h2v5z"/>
      </svg>
      MD
    `;
		button.setAttribute("aria-label", "Toggle Markdown rendering");
		button.setAttribute("data-testid", "xmd-toggle");

		let isMarkdownMode = false;
		let originalContent = "";

		button.addEventListener("click", async (e) => {
			e.preventDefault();
			e.stopPropagation();

			if (!isMarkdownMode) {
				// Store original content
				originalContent = textContainer.innerHTML;

				// Get plain text for markdown processing
				const plainText = textContainer.textContent || "";

				// Show loading state
				button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="xmd-spinner">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M14 8a6 6 0 0 1-6 6" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          ...
        `;

				try {
					const renderedHtml = await this.renderer.render(plainText);
					textContainer.innerHTML = renderedHtml;
					textContainer.classList.add("xmd-rendered");
					isMarkdownMode = true;

					button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h12v8H2V4zm1 1v6h10V5H3zm2 2h6v1H5V7zm0 2h4v1H5V9z"/>
            </svg>
            TXT
          `;
				} catch (error) {
					console.error("Markdown rendering failed:", error);
					button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11H7v-1h2v1zm0-2H7V6h2v3zm-3-3H4v3h2V6zm8 5h-2V6h2v5z"/>
            </svg>
            MD
          `;
				}
			} else {
				// Restore original content
				textContainer.innerHTML = originalContent;
				textContainer.classList.remove("xmd-rendered");
				isMarkdownMode = false;

				button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11H7v-1h2v1zm0-2H7V6h2v3zm-3-3H4v3h2V6zm8 5h-2V6h2v5z"/>
          </svg>
          MD
        `;
			}
		});

		// Insert button into action bar
		const firstAction = actionBar.firstElementChild;
		if (firstAction) {
			actionBar.insertBefore(button, firstAction);
		} else {
			actionBar.appendChild(button);
		}
	}
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", async () => {
		const extension = new XMarkdownExtension();
		await extension.init();
	});
} else {
	const extension = new XMarkdownExtension();
	extension.init();
}

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

export class MarkdownRenderer {
	private processor: any;

	constructor() {
		this.processor = remark()
			.use(remarkGfm)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeHighlight, {
				ignoreMissing: true,
				subset: [
					"javascript",
					"typescript",
					"tsx",
					"jsx",
					"python",
					"html",
					"css",
					"json",
					"bash",
					"sql",
					"markdown",
					"yaml",
					"xml",
				],
			})
			.use(rehypeStringify, { allowDangerousHtml: true });
	}

	async init(): Promise<void> {
		// No initialization needed for rehype-highlight
	}

	async render(markdown: string): Promise<string> {
		try {
			const result = await this.processor.process(markdown);
			return String(result);
		} catch (error) {
			console.error("Markdown rendering error:", error);
			// Fallback: return escaped HTML
			return this.escapeHtml(markdown).replace(/\n/g, "<br>");
		}
	}

	private escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}
}

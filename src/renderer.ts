import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import rust from "highlight.js/lib/languages/rust";
import cpp from "highlight.js/lib/languages/cpp";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";

export class MarkdownRenderer {
	private processor: any;

	constructor() {
		hljs.registerLanguage("javascript", javascript);
		hljs.registerLanguage("js", javascript);
		hljs.registerLanguage("typescript", typescript);
		hljs.registerLanguage("ts", typescript);
		hljs.registerLanguage("jsx", javascript); // JSX uses JS syntax
		hljs.registerLanguage("tsx", typescript); // TSX uses TS syntax
		hljs.registerLanguage("rust", rust);
		hljs.registerLanguage("cpp", cpp);
		hljs.registerLanguage("c++", cpp);
		hljs.registerLanguage("html", xml);
		hljs.registerLanguage("xml", xml);
		hljs.registerLanguage("css", css);

		this.processor = remark()
			.use(remarkGfm)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeHighlight, {
				ignoreMissing: true,
				hljs: hljs,
				languages: {
					javascript,
					js: javascript,
					typescript,
					ts: typescript,
					jsx: javascript,
					tsx: typescript,
					rust,
					cpp,
					"c++": cpp,
					html: xml,
					xml,
					css,
				},
			})
			.use(rehypeSanitize, {
				...defaultSchema,
				attributes: {
					...defaultSchema.attributes,
					"*": [
						...(defaultSchema.attributes?.["*"] || []),
						["className"],
						["class"],
					],
				},
			}) // Add sanitization with custom schema
			.use(rehypeStringify);
	}

	async init(): Promise<void> {}

	async render(markdown: string): Promise<string> {
		try {
			console.log("Rendering markdown:", markdown);
			const result = await this.processor.process(markdown);
			const html = String(result);
			console.log("Rendered HTML:", html);
			return html;
		} catch (error) {
			console.error("Markdown rendering error:", error);
			return this.escapeHtml(markdown).replace(/\n/g, "<br>");
		}
	}

	private escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}
}

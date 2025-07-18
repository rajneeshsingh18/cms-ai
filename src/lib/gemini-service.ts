import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked'; // Import the new library


class GeminiService {
  private genAI: GoogleGenAI;
  private model: string;

  constructor() {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    this.genAI = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
    });
    
    this.model = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generates content from a prompt
   * @param prompt The input prompt
   * @returns Generated text and HTML content
   */
  async generateArticle(prompt: string): Promise<{
    text: string;
    html: string;
    promptFeedback?: any;
  }> {
    const response = await this.genAI.models.generateContent({
      model: this.model,
      contents: prompt
    });

    const text = response.text ?? '';
    const html = this.convertMarkdownToHtml(text);

    return {
      text,
      html,
      promptFeedback: response.promptFeedback
    };
  }

  /**
   * Streams generated content chunk by chunk
   * @param prompt The input prompt
   * @returns Async generator of content chunks
   */
  async *generateContentStream(prompt: string): AsyncGenerator<{
    text: string;
    isComplete: boolean;
  }> {
    const stream = await this.genAI.models.generateContentStream({
      model: this.model,
      contents: prompt
    });

    for await (const chunk of stream) {
      yield {
        text: chunk.text ?? '',
        isComplete: false // or remove this property if not needed
      };
    }
  }

  /**
   * Counts tokens for a given prompt
   * @param prompt The input prompt
   * @returns Number of tokens
   */
  async countTokens(prompt: string): Promise<number> {
    const response = await this.genAI.models.countTokens({
      model: this.model,
      contents: prompt
    });
    return response.totalTokens ?? 0;
  }

  /**
   * Converts markdown to HTML
   * @param markdown The markdown content
   * @returns HTML content
   */
  private convertMarkdownToHtml(markdown: string): string {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul>$1</ul>');
    
    // Paragraphs
    html = html.split(/\n\s*\n/).map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph && !paragraph.startsWith('<') && !/^<(h[1-6]|ul|pre|code)/.test(paragraph)) {
        return `<p>${paragraph}</p>`;
      }
      return paragraph;
    }).join('\n');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }
}

// Singleton instance
export const geminiService = new GeminiService();
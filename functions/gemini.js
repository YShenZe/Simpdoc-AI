const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiClient {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.context = [];
  }

  async analyze(query, knowledge) {
    const context = knowledge.slice(0, 5).map(f => `### 文件 ${f.path}\n${f.text}`).join('\n\n');
    
    const prompt = `
      基于以下知识库内容回答问题：
      ${context}
      
      问题：${query}
      请用中文回答，保持专业且易懂，如果无法确定答案请明确说明
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

module.exports = GeminiClient;
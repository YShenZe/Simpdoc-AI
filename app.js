require('dotenv').config();
const express = require('express');
const { loadMarkdownFiles } = require('./file-loader');
const GeminiClient = require('./gemini');

const app = express();
app.use(express.json());

let gemini;
let knowledgeCache;

async function initialize() {
  // 初始化知识库
  knowledgeCache = await loadMarkdownFiles(process.env.KNOWLEDGE_DIR);
  
  // 初始化 Gemini
  gemini = new GeminiClient(process.env.GEMINI_API_KEY);
  console.log(`✅ 已加载 ${knowledgeCache.length} 个知识文件`);
}

app.post('/ask', async (req, res) => {
  try {
    const answer = await gemini.analyze(req.body.question, knowledgeCache);
    res.json({ question: req.body.question, answer });
  } catch (error) {
    res.status(500).json({ error: 'AI 处理失败' });
  }
});

initialize().then(() => {
  app.listen(3000, () => console.log('🚀 服务运行在 http://localhost:3000'));
});
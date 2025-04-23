const { config } = require('dotenv');
const { loadMarkdownFiles } = require('../utils/file-loader');
const GeminiClient = require('../utils/gemini');

// 加载环境变量
config();

// 全局缓存（利用Lambda的容器重用机制）
let cachedData = null;

async function initialize() {
  if (!cachedData) {
    const knowledgeCache = await loadMarkdownFiles(process.env.KNOWLEDGE_DIR);
    const gemini = new GeminiClient(process.env.GEMINI_API_KEY);
    cachedData = { knowledgeCache, gemini };
    console.log(`✅ 初始化完成，加载 ${knowledgeCache.length} 个知识文件`);
  }
  return cachedData;
}

exports.handler = async (event, context) => {
  try {
    const { gemini, knowledgeCache } = await initialize();
    
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { question } = JSON.parse(event.body);
    const answer = await gemini.analyze(question, knowledgeCache);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    };
  } catch (error) {
    console.error('处理请求失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI 处理失败' })
    };
  }
};
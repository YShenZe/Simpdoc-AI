const fs = require('fs/promises');
const path = require('path');
const { marked } = require('marked');

async function loadMarkdownFiles(dirPath) {
  const files = await fs.readdir(dirPath, { withFileTypes: true });
  const result = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      result.push(...await loadMarkdownFiles(fullPath));
    } else if (path.extname(file.name) === '.md') {
      const content = await fs.readFile(fullPath, 'utf-8');
      result.push({
        path: fullPath,
        raw: content,
        text: content.replace(/[#*\-`]/g, '') // 转换 Markdown 为 纯文本
      });
    }
  }

  return result;
}

module.exports = { loadMarkdownFiles };
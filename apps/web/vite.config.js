import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localArticlesDir = path.resolve(__dirname, '../../content/articles');

const loadLocalBlogPosts = () => {
  if (!fs.existsSync(localArticlesDir)) {
    return [];
  }

  return fs.readdirSync(localArticlesDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => {
      const filePath = path.join(localArticlesDir, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const article = JSON.parse(fileContents);
      const stats = fs.statSync(filePath);
      const fallbackSlug = fileName.replace(/\.json$/i, '');
      const fallbackTimestamp = stats.mtime.toISOString();

      return {
        ...article,
        id: article.id || `local-${article.slug || fallbackSlug}`,
        slug: article.slug || fallbackSlug,
        published: article.published !== false,
        views: Number.isFinite(article.views) ? article.views : 0,
        created_at: article.created_at || article.published_at || fallbackTimestamp,
        updated_at: article.updated_at || fallbackTimestamp,
        source: 'local',
      };
    })
    .sort((left, right) => (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    ));
};

export default defineConfig({
  plugins: [react()],
  define: {
    __LOCAL_BLOG_POSTS__: JSON.stringify(loadLocalBlogPosts()),
  },
});

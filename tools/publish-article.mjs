import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import PocketBase from 'pocketbase';

const [, , articlePathArg] = process.argv;

if (!articlePathArg) {
  console.error('Usage: node tools/publish-article.mjs <article-json-path>');
  process.exit(1);
}

const pocketbaseUrl = process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL;
const adminEmail = process.env.POCKETBASE_EMAIL;
const adminPassword = process.env.POCKETBASE_PASSWORD;

if (!pocketbaseUrl || !adminEmail || !adminPassword) {
  console.error('Missing PocketBase credentials. Set POCKETBASE_URL, POCKETBASE_EMAIL, and POCKETBASE_PASSWORD.');
  process.exit(1);
}

const articlePath = path.resolve(process.cwd(), articlePathArg);
const article = JSON.parse(await fs.readFile(articlePath, 'utf8'));

const pb = new PocketBase(pocketbaseUrl);

await pb.collection('admin_users').authWithPassword(adminEmail, adminPassword);

const payload = {
  title: article.title,
  slug: article.slug,
  excerpt: article.excerpt,
  content: article.content,
  author: article.author || 'Permatable Team',
  category: article.category,
  published: article.published ?? true,
  views: article.views ?? 0,
};

const existing = await pb.collection('blog_posts').getList(1, 1, {
  filter: `slug = "${article.slug}"`,
  $autoCancel: false,
});

if (existing.items.length > 0) {
  const record = await pb.collection('blog_posts').update(existing.items[0].id, payload, {
    $autoCancel: false,
  });
  console.log(`Updated post: ${record.slug}`);
} else {
  const record = await pb.collection('blog_posts').create(payload, {
    $autoCancel: false,
  });
  console.log(`Created post: ${record.slug}`);
}

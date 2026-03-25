import pb from './pocketbaseClient';
import {
  ALL_BLOG_CATEGORIES,
  buildAllowedCategoriesFilter,
  buildCategoryFilter,
  normalizeBlogCategory,
} from './blogCategories';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200';

const rawLocalBlogPosts = Array.isArray(__LOCAL_BLOG_POSTS__) ? __LOCAL_BLOG_POSTS__ : [];

const normalizePost = (post, source = post?.source || 'remote') => ({
  ...post,
  id: post.id || `${source}-${post.slug}`,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt || '',
  content: post.content || '',
  author: post.author || 'Permatable Team',
  category: normalizeBlogCategory(post.category) || post.category,
  published: post.published !== false,
  views: Number.isFinite(post.views) ? post.views : 0,
  created_at: post.created_at || post.updated_at || new Date().toISOString(),
  updated_at: post.updated_at || post.created_at || new Date().toISOString(),
  source,
});

const localPosts = rawLocalBlogPosts
  .map((post) => normalizePost(post, 'local'))
  .filter((post) => post.published && normalizeBlogCategory(post.category));

const sortPosts = (posts) => [...posts].sort((left, right) => {
  const timestampDiff = new Date(right.created_at).getTime() - new Date(left.created_at).getTime();

  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  return left.title.localeCompare(right.title);
});

const filterLocalPosts = ({ searchTerm = '', selectedCategory = ALL_BLOG_CATEGORIES } = {}) => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return localPosts.filter((post) => {
    if (selectedCategory !== ALL_BLOG_CATEGORIES) {
      const normalizedCategory = normalizeBlogCategory(post.category);

      if (normalizedCategory !== selectedCategory) {
        return false;
      }
    }

    if (!normalizedSearchTerm) {
      return true;
    }

    const haystack = `${post.title} ${post.excerpt}`.toLowerCase();
    return haystack.includes(normalizedSearchTerm);
  });
};

const normalizeRemoteItems = (items) => items.map((item) => normalizePost(item, 'remote'));

export const getPostImageUrl = (post) => {
  if (post?.featured_image_url) {
    return post.featured_image_url;
  }

  if (post?.featured_image && post?.source !== 'local') {
    return pb.files.getUrl(post, post.featured_image);
  }

  return FALLBACK_IMAGE_URL;
};

export const getFeaturedPosts = async (limit = 6) => {
  try {
    const posts = await pb.collection('blog_posts').getList(1, limit, {
      filter: `published = true && ${buildAllowedCategoriesFilter()}`,
      sort: '-created_at',
      $autoCancel: false,
    });

    if (posts.items.length > 0) {
      return normalizeRemoteItems(posts.items);
    }
  } catch (error) {
    console.warn('Falling back to local featured posts:', error);
  }

  return sortPosts(localPosts).slice(0, limit);
};

export const getPaginatedPosts = async ({
  currentPage = 1,
  postsPerPage = 10,
  searchTerm = '',
  selectedCategory = ALL_BLOG_CATEGORIES,
} = {}) => {
  try {
    const filters = ['published = true', buildAllowedCategoriesFilter()];

    if (selectedCategory !== ALL_BLOG_CATEGORIES) {
      filters.push(buildCategoryFilter(selectedCategory));
    }

    if (searchTerm) {
      const escapedSearchTerm = searchTerm.replace(/"/g, '\\"');
      filters.push(`(title ~ "${escapedSearchTerm}" || excerpt ~ "${escapedSearchTerm}")`);
    }

    const filter = filters.filter(Boolean).join(' && ');

    const result = await pb.collection('blog_posts').getList(currentPage, postsPerPage, {
      filter,
      sort: '-created_at',
      $autoCancel: false,
    });

    if (result.items.length > 0) {
      return {
        items: normalizeRemoteItems(result.items),
        totalPages: result.totalPages,
      };
    }
  } catch (error) {
    console.warn('Falling back to local blog listing:', error);
  }

  const filteredPosts = sortPosts(filterLocalPosts({ searchTerm, selectedCategory }));
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const startIndex = (currentPage - 1) * postsPerPage;

  return {
    items: filteredPosts.slice(startIndex, startIndex + postsPerPage),
    totalPages,
  };
};

export const getPostBySlug = async (slug) => {
  try {
    const result = await pb.collection('blog_posts').getFirstListItem(`slug="${slug}"`, {
      $autoCancel: false,
    });

    return normalizePost(result, 'remote');
  } catch (error) {
    console.warn(`Falling back to local article for slug "${slug}":`, error);
  }

  return localPosts.find((post) => post.slug === slug) || null;
};

export const incrementPostView = async (post) => {
  if (!post || post.source === 'local') {
    return post;
  }

  try {
    const nextViews = (post.views || 0) + 1;

    await pb.collection('blog_posts').update(post.id, {
      views: nextViews,
    }, { $autoCancel: false });

    return {
      ...post,
      views: nextViews,
    };
  } catch (error) {
    console.warn('Failed to increment post views:', error);
    return post;
  }
};

export const getRelatedPosts = async ({
  currentPostId,
  currentPostSlug,
  category,
  limit = 3,
} = {}) => {
  const normalizedCategory = normalizeBlogCategory(category);

  if (!normalizedCategory) {
    return [];
  }

  if (currentPostId && !String(currentPostId).startsWith('local-')) {
    try {
      const categoryFilter = buildCategoryFilter(normalizedCategory);

      if (categoryFilter) {
        const posts = await pb.collection('blog_posts').getList(1, limit, {
          filter: `id != "${currentPostId}" && ${categoryFilter} && published = true`,
          sort: '-created_at',
          $autoCancel: false,
        });

        if (posts.items.length > 0) {
          return normalizeRemoteItems(posts.items);
        }
      }
    } catch (error) {
      console.warn('Falling back to local related posts:', error);
    }
  }

  return sortPosts(
    localPosts.filter((post) => (
      normalizeBlogCategory(post.category) === normalizedCategory
      && post.slug !== currentPostSlug
      && post.id !== currentPostId
    )),
  ).slice(0, limit);
};

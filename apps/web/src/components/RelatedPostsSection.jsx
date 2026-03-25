import React, { useState, useEffect } from 'react';
import pb from '../lib/pocketbaseClient';
import BlogCard from './BlogCard';
import { buildCategoryFilter, normalizeBlogCategory } from '../lib/blogCategories';

const RelatedPostsSection = ({ currentPostId, category }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const categoryFilter = buildCategoryFilter(category);

        if (!categoryFilter) {
          setRelatedPosts([]);
          return;
        }

        const posts = await pb.collection('blog_posts').getList(1, 4, {
          filter: `id != "${currentPostId}" && ${categoryFilter} && published = true`,
          sort: '-created_at',
          $autoCancel: false
        });
        setRelatedPosts(posts.items);
      } catch (error) {
        console.error('Failed to fetch related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (normalizeBlogCategory(category)) {
      fetchRelatedPosts();
    } else {
      setLoading(false);
    }
  }, [currentPostId, category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 bg-muted rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-balance">Related articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPostsSection;

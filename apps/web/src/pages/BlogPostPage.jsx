import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Eye, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RelatedPostsSection from '../components/RelatedPostsSection';
import pb from '../lib/pocketbaseClient';
import { format } from 'date-fns';
import { normalizeBlogCategory } from '../lib/blogCategories';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await pb.collection('blog_posts').getFirstListItem(`slug="${slug}"`, {
          $autoCancel: false
        });
        setPost(result);

        // Increment view count
        await pb.collection('blog_posts').update(result.id, {
          views: (result.views || 0) + 1
        }, { $autoCancel: false });
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '';

  const handleShare = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Article not found</h1>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const imageUrl = post.featured_image 
    ? pb.files.getUrl(post, post.featured_image)
    : 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200';
  const categoryLabel = normalizeBlogCategory(post.category) || post.category;

  return (
    <>
      <Helmet>
        <title>{`${post.title} - Permatable`}</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <article className="flex-1 py-12 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Link>

            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 bg-secondary/20 text-secondary-foreground">
                {categoryLabel}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-balance" style={{letterSpacing: '-0.02em'}}>
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views || 0} views</span>
                </div>
                {post.author && (
                  <span>By {post.author}</span>
                )}
              </div>
            </div>

            {post.featured_image && (
              <div className="mb-12 rounded-2xl overflow-hidden">
                <img 
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {post.excerpt && (
              <div className="text-xl text-muted-foreground mb-8 leading-relaxed italic border-l-4 border-primary pl-6">
                {post.excerpt}
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              <div 
                className="leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, '<br />') || '' }}
              />
            </div>

            {/* Share Buttons */}
            <div className="border-t border-b border-border py-6 mb-12">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Share this article:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                    className="transition-all duration-200 active:scale-[0.98]"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                    className="transition-all duration-200 active:scale-[0.98]"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                    className="transition-all duration-200 active:scale-[0.98]"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <RelatedPostsSection currentPostId={post.id} category={categoryLabel} />

        <Footer />
      </div>
    </>
  );
};

export default BlogPostPage;

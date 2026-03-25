import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Eye, ArrowLeft, Clock3, Facebook, Twitter, Linkedin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RelatedPostsSection from '../components/RelatedPostsSection';
import { format } from 'date-fns';
import { normalizeBlogCategory } from '../lib/blogCategories';
import { getPostBySlug, getPostImageUrl, incrementPostView } from '../lib/blogContent';

const countWords = (html) => {
  if (!html) {
    return 0;
  }

  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text ? text.split(' ').length : 0;
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await getPostBySlug(slug);

        if (!result) {
          setPost(null);
          return;
        }

        const updatedPost = await incrementPostView(result);
        setPost(updatedPost);
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

  const imageUrl = getPostImageUrl(post);
  const categoryLabel = normalizeBlogCategory(post.category) || post.category;
  const readTime = Math.max(1, Math.ceil(countWords(post.content) / 200));

  return (
    <>
      <Helmet>
        <title>{`${post.title} - Permatable`}</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <article className="flex-1 bg-[radial-gradient(circle_at_top,hsla(var(--accent),0.32),transparent_45%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 pt-10">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Blog
            </Link>

            <div className="mb-10 rounded-[2rem] border border-border/70 bg-card/85 shadow-[0_30px_80px_rgba(20,40,20,0.08)] backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <Badge variant="secondary" className="mb-5 bg-primary/10 text-primary hover:bg-primary/10">
                  {categoryLabel}
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.02] text-balance" style={{ letterSpacing: '-0.03em' }}>
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2">
                    <Clock3 className="w-4 h-4" />
                    <span>{readTime} min read</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views || 0} views</span>
                  </div>
                  {post.author && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2">
                      <span>By {post.author}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
                  <img 
                    src={imageUrl}
                    alt={post.title}
                    className="w-full h-[260px] sm:h-[360px] lg:h-[420px] object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-card px-6 py-8 shadow-[0_25px_70px_rgba(20,40,20,0.06)] sm:px-10 sm:py-10">
              <div className="article-body mb-12">
                <div 
                  className="leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, '<br />') || '' }}
                />
              </div>

              <div className="border-t border-b border-border py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          </div>
        </article>

        <RelatedPostsSection currentPostId={post.id} currentPostSlug={post.slug} category={categoryLabel} />

        <Footer />
      </div>
    </>
  );
};

export default BlogPostPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RichTextEditor from '../components/RichTextEditor.jsx';
import pb from '../lib/pocketbaseClient';
import { toast } from 'sonner';
import { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY, normalizeBlogCategory } from '../lib/blogCategories';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: DEFAULT_BLOG_CATEGORY,
    published: false
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await pb.collection('blog_posts').getOne(id, { $autoCancel: false });
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content || '',
          author: post.author || '',
          category: normalizeBlogCategory(post.category) || DEFAULT_BLOG_CATEGORY,
          published: post.published
        });
        if (post.featured_image) {
          setCurrentImage(pb.files.getUrl(post, post.featured_image));
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleContentChange = (htmlContent) => {
    setFormData({
      ...formData,
      content: htmlContent
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e, publish = null) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', formData.slug);
      data.append('excerpt', formData.excerpt);
      data.append('content', formData.content);
      data.append('author', formData.author);
      data.append('category', formData.category);
      data.append('published', publish !== null ? publish : formData.published);

      if (featuredImage) {
        data.append('featured_image', featuredImage);
      }

      await pb.collection('blog_posts').update(id, data, { $autoCancel: false });
      
      toast.success('Post updated successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await pb.collection('blog_posts').delete(id, { $autoCancel: false });
      toast.success('Post deleted successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Edit: ${formData.title} - Admin - Permatable`}</title>
        <meta name="description" content="Edit blog post" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>

            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Edit Post</h1>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 w-4 h-4" />
                Delete Post
              </Button>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      rows={3}
                      value={formData.excerpt}
                      onChange={handleChange}
                      className="mt-1 bg-background border-border text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="mb-2 block">Content</Label>
                    <RichTextEditor 
                      value={formData.content} 
                      onChange={handleContentChange} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="featured_image">Featured Image</Label>
                      {currentImage && (
                        <div className="mt-2 mb-2">
                          <img src={currentImage} alt="Current featured" className="w-48 h-32 object-cover rounded-lg" />
                        </div>
                      )}
                      <Input
                        id="featured_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOG_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-6 border-t border-border gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => handleSubmit(e, false)}
                      disabled={saving}
                      className="transition-all duration-200 active:scale-[0.98]"
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={saving}
                      className="transition-all duration-200 active:scale-[0.98]"
                    >
                      {saving ? 'Saving...' : 'Update & Publish'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EditPostPage;

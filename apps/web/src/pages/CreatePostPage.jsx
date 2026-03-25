import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RichTextEditor from '../components/RichTextEditor.jsx';
import pb from '../lib/pocketbaseClient';
import { toast } from 'sonner';
import { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } from '../lib/blogCategories';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Permatable Team',
    category: DEFAULT_BLOG_CATEGORY,
    published: false
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'title' && { slug: generateSlug(value) })
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

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', formData.slug);
      data.append('excerpt', formData.excerpt);
      data.append('content', formData.content);
      data.append('author', formData.author);
      data.append('category', formData.category);
      data.append('published', publish);
      data.append('views', 0);

      if (featuredImage) {
        data.append('featured_image', featuredImage);
      }

      await pb.collection('blog_posts').create(data, { $autoCancel: false });
      
      toast.success(publish ? 'Post published successfully' : 'Draft saved successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Post - Admin - Permatable</title>
        <meta name="description" content="Create a new blog post" />
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

            <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

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
                      disabled={loading}
                      className="transition-all duration-200 active:scale-[0.98]"
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={loading}
                      className="transition-all duration-200 active:scale-[0.98]"
                    >
                      {loading ? 'Publishing...' : 'Publish'}
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

export default CreatePostPage;

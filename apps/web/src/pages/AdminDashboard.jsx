import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import pb from '../lib/pocketbaseClient';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { normalizeBlogCategory } from '../lib/blogCategories';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const result = await pb.collection('blog_posts').getList(1, 50, {
        sort: '-created_at',
        $autoCancel: false
      });
      setPosts(result.items);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await pb.collection('blog_posts').delete(id, { $autoCancel: false });
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Permatable</title>
        <meta name="description" content="Manage blog posts" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Blog Posts</h1>
              <Link to="/admin/create">
                <Button className="transition-all duration-200 active:scale-[0.98]">
                  <Plus className="mr-2 w-4 h-4" />
                  Create New Post
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No posts yet</p>
                <Link to="/admin/create">
                  <Button>Create your first post</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{normalizeBlogCategory(post.category) || post.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.published ? 'default' : 'outline'}>
                            {post.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(post.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{post.views || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/blog/${post.slug}`} target="_blank">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link to={`/admin/edit/${post.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard;

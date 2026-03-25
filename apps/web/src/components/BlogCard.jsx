import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { normalizeBlogCategory } from '../lib/blogCategories';
import { getPostImageUrl } from '../lib/blogContent';

const BlogCard = ({ post }) => {
  const imageUrl = getPostImageUrl(post);
  const categoryLabel = normalizeBlogCategory(post.category) || post.category;

  return (
    <Link to={`/blog/${post.slug}`}>
      <Card className="h-full flex flex-col overflow-hidden rounded-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card border-border">
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
              {categoryLabel}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold mb-2 leading-snug text-balance">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.views || 0}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogCard;

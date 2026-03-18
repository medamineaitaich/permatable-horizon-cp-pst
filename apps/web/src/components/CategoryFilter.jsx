import React from 'react';
import { Button } from './ui/button';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = ['All', 'Permaculture', 'Composting', 'Tips'];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category)}
          className="transition-all duration-200"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;

export const BLOG_CATEGORIES = ['Compost', 'Permaculture', 'Soil Health'];
export const DEFAULT_BLOG_CATEGORY = 'Permaculture';
export const ALL_BLOG_CATEGORIES = 'All';

const CATEGORY_ALIASES = {
  compost: 'Compost',
  composting: 'Compost',
  permaculture: 'Permaculture',
  'soil health': 'Soil Health',
};

const CATEGORY_QUERY_VALUES = {
  Compost: ['Compost', 'Composting'],
  Permaculture: ['Permaculture'],
  'Soil Health': ['Soil Health'],
};

export const normalizeBlogCategory = (category) => {
  if (!category) {
    return null;
  }

  return CATEGORY_ALIASES[String(category).trim().toLowerCase()] ?? null;
};

export const getBlogCategoryOptions = (includeAll = false) => (
  includeAll ? [ALL_BLOG_CATEGORIES, ...BLOG_CATEGORIES] : BLOG_CATEGORIES
);

export const buildCategoryFilter = (category, fieldName = 'category') => {
  const normalizedCategory = normalizeBlogCategory(category);

  if (!normalizedCategory) {
    return null;
  }

  const values = CATEGORY_QUERY_VALUES[normalizedCategory] ?? [normalizedCategory];

  if (values.length === 1) {
    return `${fieldName} = "${values[0]}"`;
  }

  return `(${values.map((value) => `${fieldName} = "${value}"`).join(' || ')})`;
};

export const buildAllowedCategoriesFilter = (fieldName = 'category') => (
  `(${BLOG_CATEGORIES.map((category) => buildCategoryFilter(category, fieldName)).join(' || ')})`
);

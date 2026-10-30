import type { CollectionConfig } from 'payload';

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
  },
  versions: {
    drafts: true,
  },
  access: {
    // Only published articles are visible to public visitors
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        _status: {
          equals: 'published',
        },
      };
    },
    create: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL Slug',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'Short Abstract / Summary',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Educational Topic Category',
      options: [
        { label: 'Beginner Gardening Essentials', value: 'beginner' },
        { label: 'Vertical Farming & Microclimates', value: 'vertical-farming' },
        { label: 'Botanical Lifecycle & Growth Stages', value: 'growth-stages' },
        { label: 'Sustainable Gardening & The 3Rs', value: 'sustainability-3rs' },
        { label: 'Troubleshooting & Pathology', value: 'troubleshooting' },
      ],
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
      label: 'Hero Cover Image',
    },
    {
      name: 'coverImageUrl',
      type: 'text',
      label: 'Cover Image URL Fallback',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Educational Article Body',
    },
    {
      name: 'seo',
      type: 'group',
      label: 'Search Engine Optimization (SEO)',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publication Date',
    },
  ],
};

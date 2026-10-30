import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'iconName', 'order'],
  },
  access: {
    read: () => true, // Publicly accessible catalog categories
    create: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Category Name',
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
      name: 'description',
      type: 'textarea',
      label: 'Category Description',
    },
    {
      name: 'iconName',
      type: 'text',
      defaultValue: 'Sprout',
      label: 'Lucide Icon Identifier',
      admin: {
        description: 'E.g., Apple, Salad, Home, Flower2, Sparkles, Sprout',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
    },
  ],
};

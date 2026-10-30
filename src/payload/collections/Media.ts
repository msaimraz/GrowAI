import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  access: {
    read: () => true, // Publicly readable editorial media
    create: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alternative Text for Accessibility',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Editorial Caption / Attribution',
    },
  ],
};

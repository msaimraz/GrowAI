import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    // Public visitors cannot create admin accounts
    create: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    // Only logged in admins can view all users; users can view their own profile
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { id: { equals: user.id } };
    },
    // Only admins can update any user; users can update their own profile
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { id: { equals: user.id } };
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    // Admin panel access restricted to administrators and content editors
    admin: ({ req: { user } }) => Boolean(user?.role === 'admin' || user?.role === 'editor'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Content Editor', value: 'editor' },
      ],
      access: {
        // Only admins can assign or change roles
        update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
      },
    },
  ],
};

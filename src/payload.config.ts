import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

import { Users } from './payload/collections/Users';
import { Plants } from './payload/collections/Plants';
import { Categories } from './payload/collections/Categories';
import { Articles } from './payload/collections/Articles';
import { Media } from './payload/collections/Media';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUri =
  process.env.PAYLOAD_DATABASE_URI ||
  process.env.DATABASE_URI ||
  'postgresql://postgres:placeholder@127.0.0.1:5432/growai_payload';

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Plants, Categories, Articles, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'growai-payload-dev-secret-do-not-use-in-production-min-32-chars',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
    push: true,
  }),
  sharp,
});

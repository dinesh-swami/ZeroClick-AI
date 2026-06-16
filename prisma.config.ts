import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    // @ts-expect-error - earlyAccess is a valid configuration option in prisma client/config but missing from type definitions

    earlyAccess: true,
    url: process.env.DATABASE_URL,
  },
});

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { sql } from '@vercel/postgres';
import * as yup from 'yup';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

import { authConfig } from './auth.config';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * from USERS where email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          const parsedCredentials = yup
          .object({ email: yup.string().email().required(), password: yup.string().min(6).required() })
          .cast(credentials);
          
          const { email, password } = parsedCredentials;
          const user = await getUser(email);
          
          if (!user) return null;
          
          console.log("user", user)

          const passwordsMatch = await bcrypt.compare(password, user.password);

          console.log("passwordsMatch", passwordsMatch)
 
          if (passwordsMatch) return user;

          console.log('end')
        } catch {
        }
        return null
      },
    }),
  ],
});
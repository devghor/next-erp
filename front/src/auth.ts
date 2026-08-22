import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { apiClient } from '@/lib/api-client';
import type { Company } from '@/types';

type LoginResponse = {
  data: { name: string; email: string; companies: Company[] };
  meta: { access_token: string; permissions: string[] };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/sign-in'
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      // Delegates to the real backend's Sanctum login endpoint.
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        try {
          const { data, meta } = await apiClient<LoginResponse>('/auth/login', {
            method: 'POST',
            data: { email, password }
          });

          return {
            id: data.email,
            email: data.email,
            name: data.name,
            accessToken: meta.access_token,
            companies: data.companies,
            permissions: meta.permissions
          };
        } catch (error) {
          console.error('Backend login request failed:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.companies = user.companies;
        token.permissions = user.permissions;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      session.user.companies = (token.companies as Company[] | undefined) ?? [];
      session.accessToken = token.accessToken as string;
      session.permissions = (token.permissions as string[] | undefined) ?? [];
      return session;
    }
  }
});

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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
      // Placeholder credential store — swap for a real user table/adapter lookup.
      authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (
          typeof email === 'string' &&
          typeof password === 'string' &&
          email === process.env.AUTH_DEMO_EMAIL &&
          password === process.env.AUTH_DEMO_PASSWORD
        ) {
          return { id: '1', email, name: email.split('@')[0] };
        }
        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
});

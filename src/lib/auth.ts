import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { CustomPrismaAdapter } from "./custom-prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn Callback:', { 
        user: user ? { id: user.id, email: user.email, name: user.name } : null,
        account: account ? { provider: account.provider, type: account.type } : null,
        profile: profile ? { email: profile.email, name: profile.name } : null
      })
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect Callback:', { url, baseUrl })
      // Always send user to home after login
      return baseUrl
    },
    session: async ({ session, token }) => {
      console.log('🎯 Session Callback:', { session, token })
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    jwt: async ({ user, token, account }) => {
      console.log('🔐 JWT Callback:', { 
        user, 
        token, 
        account: account ? { ...account, accessToken: '[REDACTED]', refreshToken: '[REDACTED]' } : account 
      })
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60, // 15 minutes
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60, // 15 minutes
      },
    },
  },
  logger: {
    error(code, metadata) {
      const timestamp = new Date().toISOString()
      console.error(`[${timestamp}] ❌ NextAuth Error:`, code, metadata)
      // Log more details for OAuth errors
      if (code.includes('OAUTH') || code.includes('SIGNIN') || code.includes('CALLBACK')) {
        console.error(`[${timestamp}] 🚨 OAuth Error Details:`, JSON.stringify(metadata, null, 2))
      }
      // Log to file or external service in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Add external logging service
      }
    },
    warn(code) {
      const timestamp = new Date().toISOString()
      console.warn(`[${timestamp}] ⚠️  NextAuth Warning:`, code)
    },
    debug(code, metadata) {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] 🐛 NextAuth Debug:`, code, metadata)
      // Log callback-related debug info
      if (code.includes('CALLBACK') || code.includes('OAUTH') || code.includes('SIGNIN')) {
        console.log(`[${timestamp}] 🔍 OAuth Debug Details:`, JSON.stringify(metadata, null, 2))
      }
    },
  },
}

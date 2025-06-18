import { PrismaClient } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { AdapterUser } from "next-auth/adapters"

export function CustomPrismaAdapter(p: PrismaClient) {
  const baseAdapter = PrismaAdapter(p)
  
  return {
    ...baseAdapter,
    async createUser(user: Omit<AdapterUser, "id">) {
      console.log('📝 CustomPrismaAdapter.createUser called with:', user)
      try {
        // Simply pass the user data without any ID manipulation
        // Prisma will generate the ID automatically due to @default(uuid())
        const newUser = await p.user.create({
          data: {
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified,
          },
        })
        console.log('✅ User created successfully:', newUser)
        return newUser
      } catch (error) {
        console.error('❌ Error creating user:', error)
        throw error
      }
    },
    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      console.log('🔍 CustomPrismaAdapter.getUserByAccount called with:', { providerAccountId, provider })
      try {
        const account = await p.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: { user: true }, // Now using lowercase relation name
        })
        const user = account?.user ?? null
        console.log('🔍 getUserByAccount result:', user ? 'User found' : 'User not found')
        return user
      } catch (error) {
        console.error('❌ Error getting user by account:', error)
        throw error
      }
    },
    async getSessionAndUser(sessionToken: string) {
      console.log('🎫 CustomPrismaAdapter.getSessionAndUser called with token:', sessionToken?.substring(0, 10) + '...')
      try {
        const userAndSession = await p.session.findUnique({
          where: { sessionToken },
          include: { user: true }, // Now using lowercase relation name
        })
        if (!userAndSession) {
          console.log('🎫 No session found')
          return null
        }
        const { user, ...session } = userAndSession
        console.log('✅ Session and user found successfully')
        return { user, session }
      } catch (error) {
        console.error('❌ Error getting session and user:', error)
        throw error
      }
    },
  }
}

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
        // Generate a UUID for the user since the schema doesn't have @default(uuid())
        const userId = crypto.randomUUID()
        const currentTime = new Date()
        const newUser = await p.user.create({
          data: {
            id: userId,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        })
        console.log('✅ User created successfully:', newUser)
        return newUser
      } catch (error) {
        console.error('❌ Error creating user:', error)
        throw error
      }
    },
    async linkAccount(account: {
      userId: string;
      type: string;
      provider: string;
      providerAccountId: string;
      refresh_token?: string | null;
      access_token?: string | null;
      expires_at?: number | null;
      token_type?: string | null;
      scope?: string | null;
      id_token?: string | null;
      session_state?: string | null;
    }) {
      console.log('🔗 CustomPrismaAdapter.linkAccount called with:', account)
      try {
        // Generate a UUID for the account since the schema doesn't have @default(uuid())
        const accountId = crypto.randomUUID()
        const newAccount = await p.account.create({
          data: {
            id: accountId,
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        })
        console.log('✅ Account linked successfully:', newAccount)
        return newAccount
      } catch (error) {
        console.error('❌ Error linking account:', error)
        throw error
      }
    },
  }
}

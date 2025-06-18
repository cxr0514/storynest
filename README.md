# 🌙 StoryNest - AI-Powered Children's Bedtime Stories

StoryNest is a Next.js-based platform that generates personalized bedtime stories for children using AI. Create consistent characters, track reading progress, and enjoy beautiful illustrations tailored to each child's preferences.

## ✨ Features

- **AI Story Generation**: Powered by OpenAI GPT-4o for creative, engaging stories
- **Character Consistency**: Create and maintain character personalities across stories
- **Child Profiles**: Multiple children per family with personalized preferences
- **Reading Analytics**: Track progress, engagement, and reading habits
- **Beautiful UI**: Modern, colorful design optimized for families
- **Authentication**: Secure Google OAuth integration
- **Subscription System**: Flexible pricing tiers for different family needs
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/storynest.git
cd storynest
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/storynest"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Subscription (optional)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

4. **Set up the database**
```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── stories/           # Story creation and reading
│   ├── characters/        # Character management
│   ├── analytics/         # Reading analytics
│   └── pricing/           # Subscription plans
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
└── types/                # TypeScript definitions

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenAI GPT-4o API
- **Payments**: Stripe (optional)
- **UI Components**: Custom component library
- **Icons**: Lucide React

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Authentication and profile information
- **ChildProfiles**: Individual children with preferences
- **Characters**: Consistent character definitions
- **Stories**: Generated stories with metadata
- **StoryPages**: Individual story pages with content
- **Illustrations**: AI-generated artwork
- **ReadingProgress**: Progress tracking and analytics

## 🔐 Authentication

StoryNest uses NextAuth.js with Google OAuth for secure authentication. Users can:

- Sign in with their Google account
- Manage multiple child profiles
- Access personalized content
- Track reading progress across devices

## 🎨 Character System

Create consistent characters with:

- **Physical Appearance**: Detailed visual descriptions
- **Personality Traits**: Character behaviors and quirks
- **Relationships**: Connections to child profiles
- **Usage Tracking**: Monitor character popularity

## 📈 Analytics & Progress

Built-in analytics provide insights into:

- Reading frequency and duration
- Story preferences and ratings
- Character usage statistics
- Engagement metrics
- Personalized recommendations

## 🔄 API Endpoints

- `GET/POST /api/child-profiles` - Child profile management
- `GET/POST /api/characters` - Character CRUD operations
- `POST /api/stories/generate` - AI story generation
- `GET/POST /api/reading-progress` - Progress tracking
- `GET /api/analytics` - Reading analytics data

## 🧪 Testing

Run the comprehensive test suite:

```bash
# API endpoint tests
npm run test:api

# Database integrity tests
npm run test:db

# Full integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

Ensure all production environment variables are configured:

- Database connection string
- OpenAI API key with sufficient credits
- Google OAuth production credentials
- Secure NextAuth secret

### Recommended Hosting

- **Vercel**: Optimized for Next.js applications
- **Railway**: Easy PostgreSQL setup
- **Supabase**: Managed PostgreSQL with real-time features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4o API
- Next.js team for the excellent framework
- Vercel for hosting and deployment tools
- The open-source community for amazing libraries

---

Built with ❤️ for families who love bedtime stories.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# AI SaaS - Intelligent Chat Platform

A modern, full-stack AI-powered SaaS application built with Next.js, featuring real-time chat, secure authentication, and a premium user experience.

## 🚀 Features

### Core Functionality
- **AI-Powered Chat**: Intelligent conversations with context-aware AI responses
- **Real-time Messaging**: Instant message delivery with typing indicators
- **Session Management**: Organized chat sessions with sidebar navigation
- **Message History**: Persistent conversation storage and retrieval

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Glass Card UI**: Modern glassmorphism design with backdrop blur effects
- **Smooth Animations**: Optimized transitions without performance impact

### Authentication & Security
- **NextAuth Integration**: Secure authentication with Google OAuth
- **Session Protection**: JWT-based session management
- **Route Guards**: Protected routes with automatic redirects
- **Data Encryption**: Secure data handling and storage

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **API Routes**: RESTful API endpoints for chat functionality
- **Component Architecture**: Modular, reusable React components

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI API for chat responses
- **Deployment**: Vercel-ready configuration

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── chat/              # Chat page
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── features/          # Feature pages
│   ├── pricing/
│   └── about/
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   └── ...
├── features/             # Feature-specific modules
│   └── chat/             # Chat feature
├── lib/                  # Utility libraries
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/qurban7860/ai-saas.git
   cd ai-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` with:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   BASE_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   OPENAI_API_KEY="..."
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [https://ai-saas-i8u8-dusky.vercel.app](https://ai-saas-i8u8-dusky.vercel.app) to view the application.

## 📱 Pages & Features

- **Landing Page** (`/`): Marketing page with features, pricing, and about sections
- **Features** (`/features`): Detailed feature showcase
- **Pricing** (`/pricing`): Subscription plans and pricing
- **About** (`/about`): Company information and mission
- **Chat** (`/chat`): Main AI chat interface (authenticated users only)
- **Authentication**: Login/Register pages with Google OAuth

## 🎨 Design System

### Color Palette
- **Primary**: Electric blue (#38BDF8)
- **Background**: Dark gradient with glass effects
- **Text**: High contrast for accessibility
- **Accent**: Subtle highlights and borders

### Components
- **Glass Cards**: Backdrop blur with subtle borders
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Interactive Elements**: Hover states and smooth transitions

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- **ESLint**: Configured for React/Next.js best practices
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (via ESLint)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://prisma.io/) - Next-gen ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication library

---

Built with ❤️ using modern web technologies.

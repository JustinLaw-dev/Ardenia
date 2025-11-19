# 🧠 Ardenia V1 - ADHD-Optimized Task Management MVP

![Enterprise-Grade](https://img.shields.io/badge/Quality-Enterprise-blue)
![ADHD-Optimized](https://img.shields.io/badge/ADHD-Optimized-purple)
![Neuroscience-Backed](https://img.shields.io/badge/Science-Backed-green)

> **Premium task management system specifically engineered for ADHD minds.** Combining neuroscience-backed reward systems, dopamine-triggering gamification, and Apple-quality design to make productivity sustainable and rewarding.

---

## ✨ What Makes Ardenia Different

Ardenia isn't just another task manager. It's a **neuroscience-backed productivity system** designed from the ground up for how ADHD brains actually work:

- 🎯 **Dopamine-Optimized Rewards**: Variable reward scheduling that triggers dopamine pathways
- 🔥 **Forgiveness-First Streaks**: 1-day grace period for missed days
- ⚡ **Immediate Visual Feedback**: Micro-animations calibrated for ADHD engagement
- 🧘 **Focus Session Tracking**: Pomodoro timers with distraction metrics
- 📊 **Progress Visualization**: Levels, points, and achievements
- 💎 **Premium Apple Design**: Beautiful, minimalist interface

---

## 🏗️ Tech Stack

### Backend
- **NestJS 11** (TypeScript) - Enterprise-grade Node.js framework
- **PostgreSQL** - Relational database with Prisma ORM
- **JWT Authentication** - Secure auth with refresh token rotation
- **RESTful API** - Comprehensive validation with class-validator

### Frontend
- **Next.js 16** (App Router) - React framework
- **React 19** - Latest React with React Compiler
- **TailwindCSS 4** - Utility-first CSS
- **Lucide React** - Premium icon library
- **TypeScript** - Type-safe development

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- PostgreSQL 14+

### Installation

1. **Backend Setup**
   ```bash
   cd ardenia-backend
   yarn install

   # Setup database
   cp .env.example .env
   # Edit .env with your DATABASE_URL

   # Run migrations and seed
   yarn prisma:generate
   yarn prisma:migrate
   yarn prisma:seed

   # Start server
   yarn start:dev
   ```

2. **Frontend Setup**
   ```bash
   cd ardenia-frontend
   yarn install

   # Start dev server
   yarn dev
   ```

3. **Access**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

---

## 🎮 Core Features

### 1. ADHD-Optimized Task Management
- Energy-based task matching (1-5 scale)
- Difficulty levels for proper challenge calibration
- Time-blindness compensation with duration tracking
- Intelligent reward point calculation
- Subtask support for overwhelming tasks

### 2. Neuroscience-Backed Rewards
- Progressive leveling system (100 pts/level)
- 20+ multi-tier achievements
- Streak tracking with forgiveness
- Real-time point visualization
- Dopamine-triggering feedback

### 3. Focus Sessions
- Pomodoro timer (25min default)
- Distraction self-reporting
- Quality ratings (1-5 scale)
- Session history and analytics
- Adaptive point rewards

### 4. Analytics Dashboard
- Level progress with XP bar
- Current streak with best streak
- Today's metrics (tasks, points, focus time)
- Weekly reports and insights
- AI-powered recommendations

---

## 📁 Project Structure

```
ardenia/
├── ardenia-backend/
│   ├── src/
│   │   ├── auth/            # JWT authentication
│   │   ├── tasks/           # Task management
│   │   ├── rewards/         # Gamification
│   │   ├── focus/           # Focus sessions
│   │   ├── analytics/       # Progress tracking
│   │   └── database/        # Prisma service
│   └── prisma/
│       ├── schema.prisma    # 10 models
│       └── seed.ts          # Achievement data
│
└── ardenia-frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # Landing
    │   │   ├── login/           # Auth
    │   │   ├── register/        # Signup
    │   │   └── dashboard/       # Main app
    │   ├── components/ui/       # Premium components
    │   ├── contexts/            # Auth context
    │   ├── lib/                 # API client
    │   └── types/               # TypeScript defs
    └── .env.local
```

---

## 🗄️ Database Schema

### Key Models

**User** - Auth, ADHD preferences, gamification stats
**Task** - Title, category, energy, difficulty, rewards
**FocusSession** - Duration, quality, distractions
**Achievement** - 20+ predefined achievements
**DailyProgress** - Per-day aggregated metrics
**UserAchievement** - Unlocked achievements
**RewardHistory** - Point transaction log
**StreakHistory** - Past streak records
**RefreshToken** - JWT refresh tokens

---

## 🎨 Design Principles

### Apple-Inspired Quality
- Clear visual hierarchy
- 200ms smooth transitions
- Semantic color system
- Geist Sans typography
- Rounded corners & soft shadows

### ADHD-Specific Design
- Reduced cognitive load
- Immediate visual feedback
- Always-visible progress
- Forgiveness mechanisms
- Dopamine-triggering animations

---

## 🔐 API Endpoints

### Authentication
```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

### Tasks
```
GET    /tasks
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
POST   /tasks/:id/complete
GET    /tasks/statistics
```

### Rewards
```
GET /rewards/stats
GET /rewards/achievements
GET /rewards/leaderboard
```

### Focus
```
POST /focus/start
POST /focus/:id/end
GET  /focus/statistics
```

### Analytics
```
GET /analytics/dashboard
GET /analytics/progress
GET /analytics/insights
```

---

## 🧪 Testing

```bash
# Backend
cd ardenia-backend
yarn test
yarn test:e2e

# Frontend
cd ardenia-frontend
yarn test
```

---

## 🚢 Deployment

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"
FRONTEND_URL="https://yourdomain.com"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

---

## 🎯 Why This Works for ADHD

1. **Variable Rewards** - ADHD brains crave novelty; bonus points provide unpredictability
2. **Immediate Feedback** - Executive dysfunction needs instant gratification
3. **Forgiveness Features** - Reduces discouragement from inevitable lapses
4. **Visual Progress** - Makes abstract accomplishments concrete
5. **Energy Matching** - Optimizes task selection for current state
6. **Time Training** - Builds time perception through feedback

---

## 📈 Future Roadmap

**Phase 2**
- Mobile apps (React Native)
- Social accountability features
- Advanced ML analytics
- Calendar integration
- Voice commands

**Phase 3**
- Team/family plans
- Therapist portal
- Research data sharing
- Custom achievements
- Third-party integrations

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file

---

**Built with ❤️ and neuroscience**

*Productivity, built with kindness.*



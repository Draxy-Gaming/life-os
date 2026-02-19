# 🌍 Life-Os

> **A Comprehensive Life Operating System** – Master your Academic Goals, Spiritual Journey, Physical Health, and Daily Habits

<div align="center">

<!-- Badges - Technologies & Tools -->
![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

<!-- AI & Development Tools -->
![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-000000?style=for-the-badge&logo=github&logoColor=white)
![Claude Sonnet](https://img.shields.io/badge/Claude_Sonnet-FF9500?style=for-the-badge&logo=anthropic&logoColor=white)
![Google AI Studio](https://img.shields.io/badge/Google_AI_Studio-EA4335?style=for-the-badge&logo=google&logoColor=white)

<!-- Development & Collaboration -->
![Kilo Code](https://img.shields.io/badge/Kilo_Code-4A90E2?style=for-the-badge)
![GitHub Codespaces](https://img.shields.io/badge/GitHub_Codespaces-24292E?style=for-the-badge&logo=github&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔐 Authentication](#-authentication)
- [💾 Database](#-database)
- [🤖 AI Development](#-ai-development)
- [📦 Deployment](#-deployment)
- [👨‍💻 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 📚 **Academic Excellence**
- **Pomodoro Timer** – Boost productivity with scientifically-proven study intervals
- **Task Management** – Organize assignments with priority levels (Deen, Dunya, School)
- **Progress Tracking** – Visual analytics of academic performance

### 🙏 **Spiritual Journey**
- **Prayer Times** – Real-time Islamic prayer times based on geolocation
- **Sun Tracker** – Beautiful visualization of daily prayer windows
- **Prayer History** – Track your spiritual consistency

### 💪 **Physical Health**
- **Exercise Tracking** – Log workouts and monitor fitness goals
- **Health Metrics** – Monitor sleep targets and daily activities
- **Analytics Dashboard** – Visual insights into your fitness progress

### 🎯 **Habit Building**
- **Streak Counter** – Build momentum with daily habit tracking
- **Habit Freezing** – Preserve your streak during off days
- **Quick Logging** – One-click habit completion

### ⚙️ **User Settings**
- **Geolocation Setup** – Configure location for accurate prayer times
- **Theme Customization** – Light, Dark, or System-based themes
- **Personal Goals** – Define and track your main objectives
- **Prayer Calculation Methods** – Choose your preferred Islamic calendar method

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | Full-stack React framework with SSR |
| **React 19** | UI component library with Server Components |
| **TypeScript 5** | Type-safe development |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Radix UI** | Unstyled, accessible component primitives |
| **Framer Motion** | Smooth animations and transitions |
| **Recharts** | Data visualization & charts |

### **Backend & Database**
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Open-source Firebase alternative with PostgreSQL |
| **PostgreSQL** | Robust relational database |
| **UUID** | Unique identifier generation |

### **Libraries**
- **Zustand** – Lightweight state management
- **Adhan.js** – Islamic prayer times calculation
- **date-fns** – Modern date utility library
- **Lucide React** – Beautiful icon library
- **clsx** – Conditional class names

### **Development Tools**
- **ESLint** – Code linting
- **TypeScript** – Static type checking
- **Next.js CLI** – Development and build tools

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- GitHub account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/Draxy-Gaming/Life-Os.git
cd Life-Os

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and start managing your life!

### Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
Life-Os/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (app)/          # Protected app routes
│   │   │   ├── academics/  # Study & task management
│   │   │   ├── exercise/   # Fitness tracking
│   │   │   ├── habits/     # Daily habit tracking
│   │   │   ├── prayer/     # Prayer times & tracking
│   │   │   └── settings/   # User configuration
│   │   ├── auth/           # Authentication flows
│   │   └── onboarding/     # First-time user setup
│   ├── components/         # Reusable React components
│   │   ├── layout/         # Navigation & shells
│   │   ├── ui/            # Base UI components
│   │   └── [features]/    # Feature-specific components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & configurations
│   │   ├── supabase.ts    # Database client
│   │   ├── store.ts       # Zustand state
│   │   └── types.ts       # TypeScript type definitions
│   └── styles/            # Global styles
├── supabase-schema.sql    # Database schema
└── package.json           # Dependencies
```

---

## 🔐 Authentication

**Life-Os** uses Supabase Authentication with GitHub OAuth:
- Secure passwordless login
- GitHub account integration
- Automatic user profile creation
- Session management with Supabase SSR

---

## 💾 Database

The app uses **PostgreSQL** via Supabase with the following tables:
- `user_settings` – User profiles and preferences
- `tasks` – Academic and personal tasks
- `habits` – Daily habit tracking
- `daily_prayers` – Prayer completion history
- `exercises` – Fitness activity logs

**Schema Location:** [supabase-schema.sql](supabase-schema.sql)

---

## 🤖 AI Development

This project was built leveraging cutting-edge AI development tools:

### **GitHub Copilot**
Accelerated development with intelligent code completion and suggestions

### **Claude by Anthropic**
Used Claude Sonnet for architectural decisions, code reviews, and feature planning

### **Google AI Studio**
Integrated for additional AI capabilities and experimentation

### **Kilo Code**
Organization and recipe-based framework for scalable feature development

### **GitHub Codespaces**
Cloud-based development environment for seamless collaboration

These tools ensure high-quality code, rapid iteration, and maintainability.

---

## 📦 Deployment

### **Option 1: Vercel (Recommended)**
```bash
vercel deploy
```

### **Option 2: Docker**
```bash
docker build -t life-os .
docker run -p 3000:3000 life-os
```

### **Option 3: Self-Hosted**
```bash
npm run build
npm start
```

---

## 👨‍💻 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your features locally before submitting
- Ensure ESLint passes: `npm run lint`
- Type checking: `npm run typecheck`

---

## 📄 License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) file for details.

---

## 🌟 Show Your Support

If you find Life-Os helpful, please consider:
- ⭐ Starring this repository
- 🐛 Reporting issues
- 💡 Suggesting improvements
- 📢 Sharing with others

---

<div align="center">

**Built with ❤️ by the Life-Os Team**

[GitHub](https://github.com/Draxy-Gaming/Life-Os) • [Issues](https://github.com/Draxy-Gaming/Life-Os/issues) • [Discussions](https://github.com/Draxy-Gaming/Life-Os/discussions)

</div>
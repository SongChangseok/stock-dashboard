# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Development Principles

### Code Efficiency
- **Minimize token usage**: Be concise, avoid unnecessary explanations or verbose comments
- **Direct implementation**: Focus on code delivery, not documentation
- **Compact responses**: Answer with minimal text, maximum code value

### Design Requirements
- **Trendy & Modern**: Follow 2024/2025 design trends (glassmorphism, subtle animations, micro-interactions)
- **Compact Layout**: Maximize information density while maintaining readability
- **Mobile-First**: Ensure responsive design with touch-friendly interfaces
- **Performance-Focused**: Prioritize fast load times and smooth interactions

## Common Commands

### Development
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build production bundle
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

### Linting & Formatting
```bash
npm run format     # Format code with Prettier
npm run format:check # Check formatting without changes
npm run lint       # Run ESLint for code quality
```

This project uses ESLint with TypeScript support and Prettier for consistent code formatting.

## Architecture Overview

Modern React application built with **Vite** + **TypeScript**, featuring multi-portfolio management, real-time stock tracking, advanced analytics, and news integration.

### Application Structure
```
src/
├── components/          # UI components by feature
│   ├── charts/         # Advanced visualizations (Recharts)
│   ├── goals/          # Financial goal tracking
│   ├── history/        # Portfolio performance tracking
│   ├── news/           # News integration
│   ├── portfolio/      # Core portfolio features
│   └── common/         # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API integrations
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

### State Management
- **Context API**: Multi-provider architecture
- **Custom Hooks**: Feature-specific state logic
- **LocalStorage**: Data persistence
- **Real-time Updates**: WebSocket-like functionality

### Styling System
- **Tailwind CSS** for utility-first styling
- **Custom Spotify color palette** defined in `tailwind.config.js`:
  - `spotify-green`: #1DB954 (primary brand color)
  - `spotify-green-hover`: #1ED760
  - `spotify-black`: #000000 (background)
  - `spotify-dark-gray`: #121212, `spotify-gray`: #1E1E1E (surfaces)
- **Inter font** loaded from Google Fonts
- **Dark theme** by default with custom scrollbar styling

### Core Features

#### 📊 Advanced Analytics
- **6 Chart Types**: Pie, Heatmap, Treemap, Performance, Sector, P&L
- **Portfolio History**: Time-series tracking with 15+ metrics
- **Performance Analysis**: Sharpe ratio, volatility, drawdown analysis

#### 🎯 Goal Management
- **7 Goal Types**: Retirement, house, education, emergency, vacation, investment, other
- **Progress Tracking**: Real-time calculation and visualization
- **Smart Analytics**: Completion estimates and monthly requirements

#### 📰 News Integration
- **Real-time News**: NewsAPI.org integration with sentiment analysis
- **Portfolio-Specific**: Auto-filtered news for held stocks
- **Smart Filtering**: Category, date, source, and relevance filtering

#### 💹 Real-time Data
- **Alpha Vantage API**: Live stock price updates
- **Auto-refresh**: Configurable intervals with error handling
- **Caching**: Optimized API usage with 30s cache duration

## Design System Compliance

**Modern Spotify-inspired design** with 2024/2025 trends:
- **Glassmorphism**: Subtle backdrop blur effects and transparency
- **Micro-interactions**: Smooth hover states and loading animations
- **Compact Dense Layout**: Maximum information in minimal space
- **Dark-first theme** with `#1DB954` accent color
- **Typography**: Inter font with optimized hierarchy

## API Configuration

### Required Environment Variables
```bash
# Alpha Vantage (Stock Prices)
REACT_APP_ALPHA_VANTAGE_API_KEY=your_key_here

# News API (Market News)
VITE_NEWS_API_KEY=your_key_here
VITE_NEWS_API_BASE_URL=https://newsapi.org/v2
```

### API Sources
- **Stock Data**: Alpha Vantage (free tier: 5 requests/minute)
- **News Data**: NewsAPI.org (free tier: 500 requests/day)

## Current Status: Phase 2 Complete ✅

All major features implemented:
- ✅ Real-time stock prices
- ✅ Advanced charts (6 types)
- ✅ Goal tracking system
- ✅ Portfolio history
- ✅ News integration
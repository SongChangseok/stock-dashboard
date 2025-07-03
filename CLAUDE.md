# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
npm start          # Start development server on localhost:3000
npm run build      # Build production bundle
npm test           # Run tests (Create React App test suite)
npm run eject      # Eject from Create React App (irreversible)
```

### Linting & Formatting
This project uses Create React App's built-in ESLint configuration. No additional linting commands are configured.

## Architecture Overview

This is a single-page React application built with Create React App that implements a Spotify-inspired stock portfolio dashboard.

### Component Structure
- **App.js**: Root component that renders the main StockDashboard
- **StockDashboard.js**: Single monolithic component containing all portfolio management logic
  - Manages stock data state with `useState`
  - Handles CRUD operations for stocks
  - Renders portfolio summary cards, pie chart, and data table
  - Contains modal form for adding/editing stocks

### State Management
- Uses React hooks (`useState`) for local state management
- No external state management library (Redux, Zustand, etc.)
- Stock data is stored in memory and resets on page refresh
- Stock object structure: `{ id, ticker, buyPrice, currentPrice, quantity }`

### Styling System
- **Tailwind CSS** for utility-first styling
- **Custom Spotify color palette** defined in `tailwind.config.js`:
  - `spotify-green`: #1DB954 (primary brand color)
  - `spotify-green-hover`: #1ED760
  - `spotify-black`: #000000 (background)
  - `spotify-dark-gray`: #121212, `spotify-gray`: #1E1E1E (surfaces)
- **Inter font** loaded from Google Fonts
- **Dark theme** by default with custom scrollbar styling

### Data Visualization
- **Recharts** library for pie chart visualization
- Portfolio distribution calculated as percentage of total value
- Color-coded profit/loss indicators (green for gains, red for losses)

### Key Business Logic
- **Portfolio calculations** performed in real-time:
  - Total portfolio value: sum of (currentPrice × quantity)
  - Individual P&L: (currentPrice - buyPrice) × quantity
  - P&L percentage: ((currentPrice - buyPrice) / buyPrice) × 100
- **Sample data** included with AAPL, GOOGL, and TSLA positions

### Modal Management
- Single modal component for both add/edit operations
- Form validation requires all fields to be filled
- Uses controlled components with form state management

## Design System Compliance

This project follows Spotify's Encore design system principles:
- Dark-first theme with high contrast
- Green accent color (#1DB954) for primary actions
- Card-based layouts with rounded corners
- Hover states and smooth transitions
- Consistent spacing and typography scale

## Future Enhancement Areas

Based on the PRD document, planned features include:
- Real-time stock price API integration
- Data persistence (localStorage or backend)
- Advanced portfolio analytics
- Mobile app development
- Multi-portfolio support
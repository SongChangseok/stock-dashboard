# Stock Dashboard Mobile

React Native mobile application for the Stock Dashboard project.

## 📱 Features

- **Multi-Portfolio Management**: Switch between and manage multiple portfolios
- **Real-time Stock Tracking**: View current prices and performance
- **Modern UI**: Dark-themed interface with smooth animations
- **Cross-Platform**: Runs on both iOS and Android
- **Shared Codebase**: Leverages shared business logic from the web app

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (iOS only):
```bash
cd ios && pod install && cd ..
```

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Start Metro Bundler
```bash
npm start
```

## 🏗️ Architecture

### Folder Structure
```
src/
├── components/        # Reusable UI components
│   ├── common/       # Common components (Card, LoadingSpinner, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   ├── portfolio/    # Portfolio-specific components
│   └── charts/       # Chart components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── constants/        # Theme and constants
├── utils/           # Utility functions
└── hooks/           # Custom hooks
```

### Shared Code
The app leverages shared code from the web application:
- **Contexts**: Portfolio, Goals, Settings management
- **Types**: TypeScript interfaces and types
- **Utils**: Formatters, calculations, and helper functions
- **Services**: API integration services

## 🎨 Design System

### Theme
- **Primary Color**: Spotify Green (#1DB954)
- **Background**: Dark theme (#000000, #121212)
- **Typography**: Inter font family
- **Components**: React Native Paper

### Layout
- **Bottom Tab Navigation**: Dashboard, Portfolio, News, Settings
- **Stack Navigation**: For detailed screens
- **Responsive Design**: Adapts to different screen sizes
- **Touch-Friendly**: Optimized for mobile interactions

## 📦 Key Dependencies

- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **React Native Vector Icons**: Icon library
- **React Native Chart Kit**: Chart visualization
- **React Native Reanimated**: Smooth animations
- **React Native Gesture Handler**: Touch gestures

## 🔧 Configuration

### Metro Configuration
- **Path Mapping**: Resolves shared code from parent directory
- **Watch Folders**: Monitors shared code changes
- **Platform-specific Extensions**: Supports .native.js/.native.ts files

### TypeScript
- **Path Mapping**: `@/*` for local code, `@shared/*` for shared code
- **Strict Mode**: Enabled for better type safety
- **Shared Types**: Includes types from web application

## 🚧 Current Status

### Completed Features ✅
- [x] Project setup and configuration
- [x] Navigation structure (tabs + stack)
- [x] Dashboard screen with portfolio overview
- [x] Portfolio management screen
- [x] Basic UI components and theme
- [x] Shared code integration

### In Progress 🔄
- [ ] Stock detail screen
- [ ] Add/Edit stock functionality
- [ ] Charts and visualizations
- [ ] News integration
- [ ] Settings screen

### Planned Features 📋
- [ ] Push notifications
- [ ] Offline support
- [ ] Performance optimizations
- [ ] Touch gestures and animations
- [ ] Real-time price updates

## 🎯 Development Guidelines

### Code Style
- **TypeScript**: Strict typing enabled
- **ESLint**: Code linting configured
- **Prettier**: Code formatting (shared with web app)
- **Component Structure**: Functional components with hooks

### Performance
- **Lazy Loading**: Screens loaded on demand
- **Memoization**: React.memo for expensive components
- **Image Optimization**: Proper image handling
- **Bundle Size**: Minimize unnecessary dependencies

### Testing
- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **E2E Testing**: Planned with Detox

## 🔗 Integration

### Web App Compatibility
- **Shared Contexts**: Uses same portfolio management logic
- **Data Format**: Compatible data structures
- **API Services**: Shared API integration layer
- **Type Safety**: Shared TypeScript interfaces

### Platform Features
- **Push Notifications**: For price alerts and updates
- **Biometric Authentication**: Planned for security
- **Background Sync**: Planned for offline support
- **Deep Linking**: Navigation from external sources

## 📝 Scripts

- `npm start`: Start Metro bundler
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS device/simulator
- `npm run build:android`: Build Android APK
- `npm run build:ios`: Build iOS archive
- `npm run lint`: Run ESLint
- `npm run test`: Run tests
- `npm run type-check`: TypeScript type checking

## 🤝 Contributing

1. Follow the established code style and patterns
2. Test on both iOS and Android platforms
3. Ensure TypeScript compliance
4. Update documentation for new features

## 📄 License

This project is part of the Stock Dashboard application suite.
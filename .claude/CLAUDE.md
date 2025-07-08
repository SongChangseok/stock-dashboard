# Global Claude Code Configuration

This file provides global guidance to Claude Code across all projects.

## 🎯 Core Development Principles

### Code Efficiency & Communication
- **Minimize token usage**: Be concise, avoid unnecessary explanations
- **Direct implementation**: Focus on code delivery, not verbose documentation
- **Compact responses**: Answer with minimal text, maximum code value
- **Never explain code unless explicitly asked**

### Code Quality Standards
- **Security first**: Never expose secrets, API keys, or sensitive data
- **Follow existing patterns**: Always examine codebase conventions before coding
- **Defensive programming**: Add null checks, error handling, and validation
- **Performance conscious**: Optimize for speed and memory efficiency

## 🛠️ Common Development Workflows

### Before Starting Any Task
1. **Understand the codebase**: Read existing files to understand patterns
2. **Check dependencies**: Verify required libraries are already installed
3. **Follow conventions**: Match existing code style, naming, and structure
4. **Plan with TodoWrite**: Use for complex multi-step tasks

### Error Handling Best Practices
```typescript
// Always use optional chaining for nested properties
const hasData = state?.items?.length > 0;

// Validate data types from external sources
if (Array.isArray(data)) {
  // Process array
} else {
  console.warn('Expected array, got:', typeof data);
}

// Handle async operations properly
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw new Error('Failed to fetch data');
}
```

### React/TypeScript Patterns
```typescript
// Use proper dependency arrays in useCallback/useEffect
const memoizedFunction = useCallback(() => {
  // function body
}, [dependency1, dependency2]);

// Always handle loading and error states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

// Use React.memo for performance optimization
const Component = React.memo(({ prop1, prop2 }) => {
  // component logic
});
```

## 🚀 Performance Guidelines

### Bundle Optimization
- Use lazy loading for heavy components: `const Component = lazy(() => import('./Component'))`
- Implement code splitting for different routes
- Minimize re-renders with React.memo and useMemo

### Memory Management
- Clean up subscriptions and event listeners in useEffect cleanup
- Use useCallback for functions passed as props
- Avoid creating objects/arrays in render methods

## 🎨 UI/UX Standards

### Modern Design Trends (2024/2025)
- **Glassmorphism**: Subtle backdrop blur and transparency effects
- **Micro-interactions**: Smooth hover states and transitions
- **Dense layouts**: Maximize information density while maintaining readability
- **Dark-first**: Design for dark themes as primary

### Responsive Design
- Mobile-first approach with breakpoint scaling
- Touch-friendly interface elements (minimum 44px touch targets)
- Adaptive typography and spacing

## 🔧 Tool Usage Guidelines

### When to Use Specific Tools
- **Task**: Multi-round searches, complex investigations, keyword discovery
- **Glob**: Quick file pattern matching when you know the pattern
- **Grep**: Content search when you know what to look for
- **Read**: Reading specific files or code examination
- **TodoWrite**: Planning complex tasks, tracking multi-step implementations

### Git Workflow
- Always check git status before committing
- Write clear, concise commit messages focusing on "why" not "what"
- Include co-authoring footer: `Co-Authored-By: Claude <noreply@anthropic.com>`
- Never commit sensitive data or API keys

## 📚 Documentation Standards

### When to Create Documentation
- **NEVER** proactively create README or .md files unless explicitly requested
- Update existing documentation when making significant changes
- Keep inline comments minimal and focused on "why" not "what"

### Code Comments
- Avoid obvious comments that restate the code
- Focus on business logic, edge cases, and non-obvious decisions
- Use TypeScript types instead of comments when possible

## 🚨 Security Best Practices

### API Keys and Secrets
- Never hardcode sensitive data
- Use environment variables for all secrets
- Validate environment variables at startup
- Log warnings for missing required config, not the values themselves

### Input Validation
```typescript
// Always validate external data
const validateInput = (input: unknown): InputType | null => {
  if (!input || typeof input !== 'object') return null;
  // validation logic
  return input as InputType;
};
```

## 🏗️ Project Structure Standards

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   └── feature/        # Feature-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── services/           # API and external service integration
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
└── config/             # Configuration and constants
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with "use" prefix (`useUserData.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🔄 Common Commands by Framework

### React/Vite Projects
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Next.js Projects
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Node.js/Express Projects
```bash
npm run dev          # Start with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run build        # Build TypeScript
```

## 🎯 Task Completion Checklist

### Before Marking Tasks Complete
- [ ] Code follows existing patterns and conventions
- [ ] No TypeScript errors or linting warnings
- [ ] Error handling and edge cases covered
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if significant changes)

### Final Validation
- Run linting: `npm run lint`
- Check TypeScript: `npm run typecheck` (if available)
- Test functionality manually
- Verify no console errors in browser/terminal

---

## 💡 Remember

- **Read before writing**: Always examine existing code first
- **Follow, don't lead**: Match existing patterns rather than imposing new ones
- **Secure by default**: Never compromise on security practices
- **Performance matters**: Consider impact on bundle size and runtime performance
- **User experience first**: Prioritize smooth, intuitive interactions

This configuration ensures consistent, high-quality development across all projects while maintaining security and performance standards.
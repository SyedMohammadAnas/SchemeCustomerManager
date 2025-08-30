# Theme System Documentation

## Overview

The Rafi Scheme Dashboard implements a simple and effective dark and light mode system with smooth transitions and professional UI components. The theme system is built using React Context, Tailwind CSS, and Radix UI primitives.

## Features

### ✅ Core Features
- **Simple Light/Dark Toggle**: Clean switch between two themes
- **localStorage Persistence**: Remembers user's theme choice across sessions
- **Smooth Transitions**: 300ms color transitions for seamless theme switching
- **Mobile Optimized**: Responsive design that works perfectly on all devices
- **Accessibility Support**: Proper ARIA labels and keyboard navigation
- **SSR Safe**: Works correctly with Next.js server-side rendering

### 🎨 Theme Options
- **Light Mode**: Bright theme with white backgrounds and dark text
- **Dark Mode**: Dark theme with dark backgrounds and light text
- **Quick Toggle**: Simple button to switch between themes
- **Dropdown Selection**: Professional dropdown menu for theme selection

## Architecture

### Theme Provider (`src/lib/theme.tsx`)
The core theme management system built with React Context:

```typescript
interface ThemeContextType {
  theme: Theme;           // Current theme setting (light/dark)
  setTheme: (theme: Theme) => void;  // Function to change theme
  toggleTheme: () => void;           // Function to toggle between themes
}
```

**Key Features:**
- Simple light/dark theme management
- localStorage persistence with custom storage key
- Direct theme switching without system detection
- Meta theme-color updates for mobile browsers

### Theme Toggle Components (`src/components/ui/theme-toggle.tsx`)

#### ThemeToggle (Dropdown)
- Professional dropdown menu with two options (light/dark)
- Visual indicators for current selection
- Smooth icon animations
- Full accessibility support

#### SimpleThemeToggle (Button)
- Simple toggle between light and dark modes
- Animated sun/moon icons
- Perfect for compact layouts

### Theme Indicator (`src/components/ui/theme-indicator.tsx`)
- Visual badge showing current theme status
- Color-coded indicators for each theme
- Shows resolved theme for system mode

## Implementation Details

### CSS Variables
The theme system uses CSS custom properties for consistent theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  /* ... dark theme variables */
}
```

### Tailwind Configuration
```javascript
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Smooth transitions for theme switching
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
    },
  },
}
```

### Global CSS Enhancements
```css
/* Smooth transitions for theme switching */
html {
  transition: color-scheme 0.3s ease-in-out;
}

body {
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

/* Theme transition utilities */
.theme-transition {
  @apply transition-colors duration-300 ease-in-out;
}
```

## Usage

### Basic Theme Toggle
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

function MyComponent() {
  return (
    <div>
      <ThemeToggle />
    </div>
  );
}
```

### Using Theme Context
```tsx
import { useTheme } from "@/lib/theme";

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Theme Indicator
```tsx
import { ThemeIndicator } from "@/components/ui/theme-indicator";

function MyComponent() {
  return (
    <div>
      <ThemeIndicator />
    </div>
  );
}
```

## Integration Points

### Layout Integration
The theme provider is integrated at the root layout level:

```tsx
// src/app/layout.tsx
import { ThemeProvider } from "@/lib/theme";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="rafi-scheme-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Dashboard Integration
The theme toggle is integrated into the dashboard header:

```tsx
// src/components/dashboard/dashboard.tsx
import { ThemeToggle, ThemeIndicator } from "@/components/ui/theme-toggle";

// In the header section:
<div className="flex items-center gap-2">
  <ThemeIndicator />
  <ThemeToggle />
</div>
```

## Demo Page

A comprehensive demo page is available at `/theme-demo` that showcases:
- All theme toggle options
- UI components in different themes
- Form elements and interactive components
- Theme system features and capabilities

## Best Practices

### 1. Component Design
- Always use CSS variables for colors
- Include proper transition classes
- Test in both light and dark modes
- Ensure proper contrast ratios

### 2. Performance
- Use CSS transitions instead of JavaScript animations
- Minimize re-renders with proper state management
- Lazy load theme-specific assets when needed

### 3. Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper contrast ratios
- Test with screen readers

### 4. Mobile Considerations
- Touch-friendly button sizes (44px minimum)
- Proper tap targets
- Responsive design patterns
- Mobile-optimized animations

## Troubleshooting

### Common Issues

1. **Theme not persisting**
   - Check localStorage permissions
   - Verify storage key consistency
   - Ensure proper initialization

2. **Flickering on page load**
   - Use `suppressHydrationWarning` on html element
   - Implement proper SSR handling
   - Check for hydration mismatches

3. **System preference not detected**
   - Verify `prefers-color-scheme` media query support
   - Check browser compatibility
   - Ensure proper event listener setup

4. **Transitions not smooth**
   - Verify CSS transition properties
   - Check for conflicting animations
   - Ensure proper duration values

## Future Enhancements

### Planned Features
- [ ] High contrast mode support
- [ ] Custom color scheme options
- [ ] Theme-aware image optimization
- [ ] Reduced motion preferences
- [ ] Theme-specific icon sets

### Performance Optimizations
- [ ] CSS-in-JS optimization
- [ ] Critical CSS extraction
- [ ] Theme-specific bundle splitting
- [ ] Preload theme assets

## Dependencies

- **@radix-ui/react-dropdown-menu**: Dropdown menu primitives
- **lucide-react**: Icon library
- **tailwindcss**: CSS framework with dark mode support
- **React Context**: State management
- **Next.js**: Framework with SSR support

## Browser Support

- **Chrome**: 88+
- **Firefox**: 87+
- **Safari**: 14+
- **Edge**: 88+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 88+

## License

This theme system is part of the Rafi Scheme Dashboard project and follows the same licensing terms.

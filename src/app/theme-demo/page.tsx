"use client";

import { ThemeToggle, SimpleThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeIndicator } from "@/components/ui/theme-indicator";
import { ThemeSwitch, ThemeSwitchWithLabels } from "@/components/ui/theme-switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/lib/theme";
import { Sun, Moon, Palette, Eye, EyeOff } from "lucide-react";

/**
 * Theme Demo Page
 * Showcases all theme functionality and components
 * Demonstrates dark/light mode switching with various UI elements
 */
export default function ThemeDemoPage() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Theme System Demo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the comprehensive dark and light mode system with smooth transitions,
          system preference detection, and professional UI components.
        </p>

        {/* Current theme display */}
        <div className="flex items-center justify-center gap-4">
          <ThemeIndicator />
          <Badge variant="secondary" className="text-sm">
            Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Badge>
        </div>
      </div>

      {/* Theme Controls Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Toggle Options</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Dropdown Toggle:</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Simple Toggle:</span>
                <SimpleThemeToggle />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Switch Toggle:</span>
                <ThemeSwitch />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Switch with Labels:</span>
                <ThemeSwitchWithLabels />
              </div>
            </div>
          </div>

          {/* Manual Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Theme Selection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light Mode
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark Mode
              </Button>
            </div>

            {/* Quick Toggle Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                <span>Quick Toggle to {theme === 'light' ? 'Dark' : 'Light'}</span>
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI Components Demo */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button>Submit</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Away</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Offline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Content Example</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This is a sample content card that demonstrates how text and content
              adapt to different themes. The colors automatically adjust for optimal
              readability in both light and dark modes.
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Show details</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm">Hide details</span>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="outline" className="w-full">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Information */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Theme System Features</CardTitle>
        </CardHeader>
        <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold">✅ Implemented Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Simple light/dark toggle</li>
              <li>• localStorage persistence</li>
              <li>• Smooth color transitions</li>
              <li>• Mobile-optimized UI</li>
              <li>• Accessibility support</li>
              <li>• SSR-safe implementation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">🎨 Theme Options</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Light mode (bright theme)</li>
              <li>• Dark mode (dark theme)</li>
              <li>• Quick toggle button</li>
              <li>• Dropdown selection</li>
              <li>• Visual indicators</li>
              <li>• Smooth animations</li>
            </ul>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

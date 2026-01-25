'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Key,
  Bell,
  Palette,
  Database,
  Zap,
  Moon,
  Sun,
  Check,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    weekly: true,
  });

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600">Manage your GEO Insights preferences and configuration</p>
        </div>

        {/* Appearance Settings */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize your interface appearance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-slate-700" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-semibold text-slate-900">Dark Mode</p>
                  <p className="text-sm text-slate-600">Switch between light and dark themes</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  relative w-14 h-8 rounded-full transition-colors
                  ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-slate-300'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform
                    ${darkMode ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Theme Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-purple-600 rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full" />
                  <span className="text-sm font-medium">Light Theme</span>
                  {!darkMode && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-slate-200 rounded" />
                  <div className="h-2 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
              <div className="p-4 border-2 border-slate-600 rounded-lg bg-slate-900 opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-slate-400 rounded-full" />
                  <span className="text-sm font-medium text-white">Dark Theme</span>
                  <Badge variant="outline" className="ml-auto text-xs">Coming Soon</Badge>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-slate-700 rounded" />
                  <div className="h-2 bg-slate-600 rounded w-3/4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Desktop Notifications</p>
                <p className="text-sm text-slate-600">Show browser notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.desktop}
                onChange={(e) => setNotifications({ ...notifications, desktop: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Weekly Summary</p>
                <p className="text-sm text-slate-600">Get weekly performance reports</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weekly}
                onChange={(e) => setNotifications({ ...notifications, weekly: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Manage your API keys and integrations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OpenAI */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">OpenAI API</p>
                    <p className="text-xs text-slate-600">ChatGPT integration</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">Connected</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="password"
                  value="sk-proj-••••••••••••••••"
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </div>

            {/* Google AI */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Google AI API</p>
                    <p className="text-xs text-slate-600">Gemini integration</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">Connected</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="password"
                  value="AIza••••••••••••••••"
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Security Note</p>
                <p className="text-blue-700">API keys are stored securely in environment variables and never exposed in the frontend.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Performance */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Data & Performance</CardTitle>
                <CardDescription>Manage your data and system performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <p className="text-sm text-slate-600 mb-1">Total Brands</p>
                <p className="text-2xl font-bold text-slate-900">30</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <p className="text-sm text-slate-600 mb-1">Evaluations</p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Run Full Evaluation
              </Button>
              <Button variant="outline" className="w-full">
                Export All Data (CSV)
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline">Reset to Defaults</Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30">
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

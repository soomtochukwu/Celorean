"use client"

import { useState } from "react"
import { Shield, Moon, Sun, Wallet, Globe, Lock, Save, RefreshCw, Trash2, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ConnectWalletButton from "@/components/ConnectWalletButton"
import NetworkSwitcher from "@/components/network-switcher"

export default function Settings() {
  const [theme, setTheme] = useState("dark")
  const [gasPreference, setGasPreference] = useState("standard")
  const [autoBackup, setAutoBackup] = useState(true)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleSaveSettings = () => {
    // Simulate saving settings
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and platform settings</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check className="h-4 w-4" />
          <span>Settings saved successfully</span>
        </div>
      )}

      <Tabs defaultValue="general" className="mb-8">
        <TabsList className="glass border border-primary/10 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="wallet">Wallet & Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how Celorean looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        id="theme"
                        checked={theme === "dark"}
                        onCheckedChange={(checked: any) => setTheme(checked ? "dark" : "light")}
                      />
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Choose between light and dark mode</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    {["#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} as accent color`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Slider defaultValue={[100]} max={150} min={75} step={5} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Smaller</span>
                    <span>Default</span>
                    <span>Larger</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your preferred language and regional settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="glass border-primary/20">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="glass border-primary/20">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger className="glass border-primary/20">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="glass border-primary/20">
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                      <SelectItem value="mst">MST (Mountain Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Display</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="glass border-primary/20">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="glass border-primary/20">
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                      <SelectItem value="eth">ETH (Ξ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-play" className="block mb-1">
                      Auto-play Videos
                    </Label>
                    <p className="text-xs text-muted-foreground">Automatically play videos when viewing courses</p>
                  </div>
                  <Switch id="auto-play" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-subtitles" className="block mb-1">
                      Show Subtitles
                    </Label>
                    <p className="text-xs text-muted-foreground">Display subtitles in course videos when available</p>
                  </div>
                  <Switch id="show-subtitles" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="learning-reminders" className="block mb-1">
                      Learning Reminders
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive reminders to continue your courses</p>
                  </div>
                  <Switch id="learning-reminders" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>Make Celorean more accessible for your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reduced-motion" className="block mb-1">
                      Reduced Motion
                    </Label>
                    <p className="text-xs text-muted-foreground">Minimize animations throughout the interface</p>
                  </div>
                  <Switch id="reduced-motion" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast" className="block mb-1">
                      High Contrast
                    </Label>
                    <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch id="high-contrast" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screen-reader" className="block mb-1">
                      Screen Reader Optimization
                    </Label>
                    <p className="text-xs text-muted-foreground">Optimize the interface for screen readers</p>
                  </div>
                  <Switch id="screen-reader" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Connected Wallets</CardTitle>
                <CardDescription>Manage your connected blockchain wallets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="glass border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">MetaMask</p>
                        <p className="text-xs text-muted-foreground">Primary Wallet</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b</p>
                </div>

                <ConnectWalletButton />
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Transaction Settings</CardTitle>
                <CardDescription>Configure how your transactions are processed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gas-preference">Gas Price Preference</Label>
                  <Select value={gasPreference} onValueChange={setGasPreference}>
                    <SelectTrigger className="glass border-primary/20">
                      <SelectValue placeholder="Select gas preference" />
                    </SelectTrigger>
                    <SelectContent className="glass border-primary/20">
                      <SelectItem value="slow">Slow (Lowest Fee)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {gasPreference === "custom" && (
                    <div className="mt-2">
                      <Label htmlFor="custom-gas" className="text-xs">
                        Custom Gas Price (Gwei)
                      </Label>
                      <Input id="custom-gas" type="number" defaultValue="30" className="glass border-primary/20" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transaction-notifications" className="block mb-1">
                      Transaction Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive notifications for transaction status</p>
                  </div>
                  <Switch id="transaction-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-approve" className="block mb-1">
                      Auto-approve Small Transactions
                    </Label>
                    <p className="text-xs text-muted-foreground">Automatically approve transactions under 0.01 ETH</p>
                  </div>
                  <Switch id="auto-approve" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Enhance the security of your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="block mb-1">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout" className="block mb-1">
                      Session Timeout
                    </Label>
                    <p className="text-xs text-muted-foreground">Automatically log out after period of inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="glass border-primary/20 w-32">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="glass border-primary/20">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-notifications" className="block mb-1">
                      Login Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch id="login-notifications" defaultChecked />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Backup & Recovery</CardTitle>
                <CardDescription>Protect your account data and credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup" className="block mb-1">
                      Automatic Backup
                    </Label>
                    <p className="text-xs text-muted-foreground">Regularly backup your account data</p>
                  </div>
                  <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>

                {autoBackup && (
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency" className="text-xs">
                      Backup Frequency
                    </Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="glass border-primary/20">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="glass border-primary/20">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Recovery Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  {[
                    { id: "email-course-updates", label: "Course updates and announcements" },
                    { id: "email-new-credentials", label: "New credential issuances" },
                    { id: "email-learning-recommendations", label: "Learning recommendations" },
                    { id: "email-platform-updates", label: "Platform updates and news" },
                    { id: "email-community-activity", label: "Community activity and mentions" },
                    { id: "email-token-rewards", label: "Token rewards and transactions" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <Label htmlFor={item.id} className="cursor-pointer">
                        {item.label}
                      </Label>
                      <Switch id={item.id} defaultChecked={item.id !== "email-platform-updates"} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  {[
                    { id: "app-course-updates", label: "Course updates and announcements" },
                    { id: "app-new-credentials", label: "New credential issuances" },
                    { id: "app-learning-recommendations", label: "Learning recommendations" },
                    { id: "app-platform-updates", label: "Platform updates and news" },
                    { id: "app-community-activity", label: "Community activity and mentions" },
                    { id: "app-token-rewards", label: "Token rewards and transactions" },
                    { id: "app-achievement-unlocks", label: "Achievement unlocks" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <Label htmlFor={item.id} className="cursor-pointer">
                        {item.label}
                      </Label>
                      <Switch id={item.id} defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Schedule</h3>
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="22">
                      <SelectTrigger className="glass border-primary/20 w-24">
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent className="glass border-primary/20">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select defaultValue="7">
                      <SelectTrigger className="glass border-primary/20 w-24">
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent className="glass border-primary/20">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    During quiet hours, you'll only receive critical notifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="glass border-primary/10">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Visibility</h3>
                <div className="space-y-2">
                  {[
                    { id: "show-profile", label: "Show my profile to other users" },
                    { id: "show-credentials", label: "Display my credentials publicly" },
                    { id: "show-learning-activity", label: "Share my learning activity" },
                    { id: "show-wallet", label: "Display my wallet address" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={item.id} className="block mb-1 cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {item.id === "show-profile" && "Allow other users to find and view your profile"}
                          {item.id === "show-credentials" && "Make your earned credentials visible to others"}
                          {item.id === "show-learning-activity" && "Share your course progress and achievements"}
                          {item.id === "show-wallet" && "Allow others to see your connected wallet address"}
                        </p>
                      </div>
                      <Switch id={item.id} defaultChecked={item.id !== "show-wallet"} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Usage</h3>
                <div className="space-y-2">
                  {[
                    { id: "learning-analytics", label: "Allow learning analytics" },
                    { id: "personalized-content", label: "Personalized content recommendations" },
                    { id: "usage-data", label: "Share anonymous usage data" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={item.id} className="block mb-1 cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {item.id === "learning-analytics" && "Help us improve your learning experience"}
                          {item.id === "personalized-content" && "Get content tailored to your interests"}
                          {item.id === "usage-data" && "Help improve Celorean with anonymous usage data"}
                        </p>
                      </div>
                      <Switch id={item.id} defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  View Privacy Policy
                </Button>
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Request Data Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle>Developer Settings</CardTitle>
                <CardDescription>Advanced options for developers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="developer-mode" className="block mb-1">
                      Developer Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">Enable advanced features and debugging tools</p>
                  </div>
                  <Switch id="developer-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="api-access" className="block mb-1">
                      API Access
                    </Label>
                    <p className="text-xs text-muted-foreground">Enable access to Celorean API</p>
                  </div>
                  <Switch id="api-access" />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Manage API Keys
                  </Button>
                </div>
              </CardContent>
            </Card>

            <NetworkSwitcher />

            <Card className="glass border-primary/10 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Clear All Data</h3>
                    <p className="text-xs text-muted-foreground">
                      Remove all your personal data and preferences from Celorean
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-primary/20">
                      <DialogHeader>
                        <DialogTitle>Clear All Data</DialogTitle>
                        <DialogDescription>
                          This will remove all your personal data and preferences. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2 py-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                        <p className="text-sm">
                          Your learning progress, credentials, and personal settings will be permanently deleted.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive">Confirm</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Delete Account</h3>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your Celorean account and all associated data
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-primary/20">
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          This will permanently delete your account and all associated data. This action cannot be
                          undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2 py-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                        <p className="text-sm">
                          All your data, including learning progress, credentials, and wallet connections will be
                          permanently deleted.
                        </p>
                      </div>
                      <div className="space-y-2 py-2">
                        <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
                        <Input id="confirm-delete" className="glass border-primary/20" />
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive">Permanently Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

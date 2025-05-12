"use client"

import type React from "react"

import { useState } from "react"
import { User, Mail, Globe, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    website: "https://alexjohnson.dev",
    bio: "Blockchain enthusiast and lifelong learner. Passionate about Web3 technologies and decentralized education.",
  })

  const [formData, setFormData] = useState({ ...userData })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setUserData({ ...formData })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({ ...userData })
    setIsEditing(false)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>
        <ConnectWalletButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="glass border-primary/10 sticky top-20">
            <CardHeader className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>{userData.name}</CardTitle>
              <CardDescription>Verified User</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">{userData.website}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)} disabled={isEditing}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass border border-primary/10 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="glass border-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="glass border-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="glass border-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="w-full rounded-md glass border border-primary/20 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <p>{userData.name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p>{userData.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Website</Label>
                        <p>{userData.website}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Bio</Label>
                        <p>{userData.bio}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="credentials">
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle>Blockchain Credentials</CardTitle>
                  <CardDescription>View your on-chain credentials and certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Blockchain Fundamentals",
                        issuer: "Celorean Academy",
                        date: "June 15, 2023",
                        hash: "0x8f7d8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
                      },
                      {
                        title: "Smart Contract Development",
                        issuer: "Web3 Institute",
                        date: "August 22, 2023",
                        hash: "0x7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d",
                      },
                      {
                        title: "Zero-Knowledge Proofs",
                        issuer: "Celorean Academy",
                        date: "November 10, 2023",
                        hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
                      },
                    ].map((credential, index) => (
                      <div key={index} className="glass border border-primary/10 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{credential.title}</h3>
                            <p className="text-sm text-muted-foreground">Issued by {credential.issuer}</p>
                            <p className="text-xs text-muted-foreground mt-1">Issued on {credential.date}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Verify
                          </Button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-primary/10">
                          <p className="text-xs font-mono text-muted-foreground truncate">
                            Transaction: {credential.hash}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                      <div className="space-y-2">
                        {[
                          "Course updates and announcements",
                          "New credential issuances",
                          "Learning recommendations",
                          "Platform updates",
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
                      <div className="space-y-2">
                        {[
                          "Show my profile to other users",
                          "Display my credentials publicly",
                          "Allow learning analytics",
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={index !== 1} />
                              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { FileText, Image, Plus } from "lucide-react";

export function CMS() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">CMS</h1>
          <p className="text-muted-foreground mt-1">Manage content and marketing materials</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Content
        </Button>
      </div>

      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Blog Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input id="blog-title" placeholder="Enter blog post title..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-content">Content</Label>
                <Textarea
                  id="blog-content"
                  placeholder="Write your blog post content..."
                  rows={12}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="publish" />
                  <Label htmlFor="publish">Publish immediately</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Publish</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Understanding Fractional Real Estate Investment", "Top 5 Markets for 2024", "How to Diversify Your Portfolio"].map((title, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">Published 2 days ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Banners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Hero Banner", "Promotional Banner", "Investment Guide"].map((banner, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-accent/50 h-32 flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <p className="font-medium mb-2">{banner}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                        <Button variant="outline" size="sm" className="flex-1">Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Static Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["About Us", "Terms of Service", "Privacy Policy", "FAQ"].map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div>
                      <p className="font-medium">{page}</p>
                      <p className="text-sm text-muted-foreground">Last updated 5 days ago</p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

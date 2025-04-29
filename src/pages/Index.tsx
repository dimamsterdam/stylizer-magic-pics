
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Tv, Workflow } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard if needed
    // navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to ProductAI</h1>
      <p className="text-lg mb-8">Choose what you want to create today:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5" />
              Product Spotlight
            </CardTitle>
            <CardDescription>Create beautiful hero images for your product pages</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Generate AI-driven hero images featuring your products with customizable themes and settings.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="primary">
              <Link to="/expose">Create Spotlight</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5" />
              Product Photo Shoot
            </CardTitle>
            <CardDescription>Generate professional product photos for your store</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create multiple product views with variants and easily select the best ones for your Shopify store.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="primary">
              <Link to="/product-photo-shoot">Start Photo Shoot</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tv className="mr-2 h-5 w-5" />
              Video Creator
            </CardTitle>
            <CardDescription>Create promotional videos for your products</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Generate product videos with customizable themes, transitions, and music.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="primary">
              <Link to="/videographer">Create Video</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Workflow className="mr-2 h-5 w-5" />
              Image Editor
            </CardTitle>
            <CardDescription>Edit and enhance product images</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use AI-powered tools to edit backgrounds, adjust lighting, and enhance product photos.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="primary">
              <Link to="/stylizer">Edit Images</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

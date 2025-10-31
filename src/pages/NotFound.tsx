import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Home, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Illustration */}
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-cyan bg-clip-text text-transparent opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-gradient-cyan/10 animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Page Not Found</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! The page you're looking for seems to have wandered off into the void. 
              Let's get you back on track.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="glow" 
              size="lg"
              onClick={() => navigate('/')}
              className="min-w-[160px]"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Button>
            <Button 
              variant="glass" 
              size="lg"
              onClick={() => navigate('/explore')}
              className="min-w-[160px]"
            >
              <SearchIcon className="h-5 w-5" />
              Explore Resources
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Popular pages:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Maps', 'Mods', 'Plugins', 'Shaders', 'Skins'].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/category/${category.toLowerCase()}`)}
                  className="border-primary/20 hover:border-primary/40"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

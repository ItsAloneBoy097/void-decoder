import { ReactNode, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Upload, TrendingUp, Bookmark, User, Settings, Package, Map, Wrench, Box, Palette, Sparkles, LogOut, Bell, Flame, Cpu, Layers, Shirt, Users, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/auth/AuthModal";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Feed", href: "/feed", icon: Sparkles },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Trending", href: "/trending", icon: Flame },
];

const categories = [
  { name: "Maps", href: "/category/maps", icon: Map },
  { name: "Mods", href: "/category/mods", icon: Cpu },
  { name: "Plugins", href: "/category/plugins", icon: Wrench },
  { name: "Resource Packs", href: "/category/resource-packs", icon: Layers },
  { name: "Shaders", href: "/category/shaders", icon: Palette },
  { name: "Skins", href: "/category/skins", icon: Shirt },
  { name: "Servers", href: "/category/servers", icon: Users },
  { name: "Datapacks", href: "/category/datapacks", icon: Scroll },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    } else {
      setProfile(null);
    }
  }, [user]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar hidden lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-cyan" />
              <span className="text-lg font-bold bg-gradient-cyan bg-clip-text text-transparent">
                MC Gallery
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
            {/* Main Nav */}
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Account Section */}
            {user && profile ? (
              <div>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </h3>
                <div className="space-y-1">
                  <NavLink
                    to="/library"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Bookmark className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                        My Library
                      </>
                    )}
                  </NavLink>
                  <NavLink
                    to="/upload"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Upload className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                        Upload
                      </>
                    )}
                  </NavLink>
                  <NavLink
                    to={`/profile/${user.id}`}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <User className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                        Profile
                      </>
                    )}
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Settings className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                        Settings
                      </>
                    )}
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Bell className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary")} />
                        Notifications
                      </>
                    )}
                  </NavLink>
                </div>
              </div>
            ) : (
              <div className="px-3">
                <Button 
                  variant="glow" 
                  className="w-full group animate-pulse hover:animate-none"
                  onClick={() => setAuthModalOpen(true)}
                >
                  <span className="group-hover:scale-110 inline-block transition-transform">Sign In</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-primary/10 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold bg-gradient-cyan bg-clip-text text-transparent">
              Minecraft Gallery
            </h2>
            <div className="flex items-center gap-2">
              {user && profile ? (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 hover:bg-primary/10 rounded-lg p-2 transition-all duration-200">
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                          <AvatarFallback className="bg-gradient-cyan text-xs">
                            {profile.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-primary/20">
                      <DropdownMenuLabel>{profile.username}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/notifications')}>
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button variant="glow" size="sm" onClick={() => setAuthModalOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

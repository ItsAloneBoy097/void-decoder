import { NavLink } from "react-router-dom";
import { Home, Compass, Sparkles, Upload, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Feed", href: "/feed", icon: Sparkles },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Upload", href: "/upload", icon: Zap },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 min-h-[44px] min-w-[44px] group",
                isActive
                  ? "text-sidebar-primary scale-105"
                  : "text-sidebar-foreground/70 hover:text-sidebar-primary hover:scale-105"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary animate-bounce-subtle")} />
                <span className={cn("text-[10px]", isActive && "font-semibold")}>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

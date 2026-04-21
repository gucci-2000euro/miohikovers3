import { Link, useLocation } from "wouter";
import { Home, Map as MapIcon, Trophy, Users, User as ProfileIcon } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/routes", icon: MapIcon, label: "Routes" },
    { href: "/challenges", icon: Trophy, label: "Challenges" },
    { href: "/social", icon: Users, label: "Social" },
    { href: "/profile", icon: ProfileIcon, label: "Profile" },
  ];

  // Hide nav on specific routes
  if (location === "/auth" || location.startsWith("/run/")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="glass-panel mx-auto max-w-md rounded-2xl flex justify-between items-center px-6 py-3 pointer-events-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1">
              <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-white/60 hover:text-white'}`}>
                <Icon size={24} className={isActive ? 'fill-primary/20' : ''} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

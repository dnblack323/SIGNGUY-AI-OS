import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Users, FileText, ShoppingBag, Wrench, Receipt, Folder, Mail, Settings, LogOut, Building2, ChevronsLeft, ShieldAlert, Calculator, DollarSign } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home", icon: Home, perm: "dashboard:read", testId: "nav-home" },
  { to: "/customers", label: "Customers", icon: Users, perm: "customer:read", testId: "nav-customers" },
  { to: "/quotes", label: "Quotes", icon: FileText, perm: "quote:read", testId: "nav-quotes" },
  { to: "/orders", label: "Orders", icon: ShoppingBag, perm: "order:read", testId: "nav-orders" },
  { to: "/work-orders", label: "Work Orders", icon: Wrench, perm: "work_order:read", testId: "nav-work-orders" },
  { to: "/invoices", label: "Invoices", icon: Receipt, perm: "invoice:read", testId: "nav-invoices" },
  { to: "/documents", label: "Documents", icon: Folder, perm: "document:read", testId: "nav-documents" },
  { to: "/email-history", label: "Email History", icon: Mail, perm: "email:read", testId: "nav-email-history" },
  { to: "/pricing-foundation", label: "Pricing Foundation", icon: DollarSign, perm: "pricing:read", testId: "nav-pricing-foundation" },
  { to: "/pricing-calculator", label: "Pricing Calculator", icon: Calculator, perm: "pricing:calculate", testId: "nav-pricing-calculator" },
  { to: "/settings", label: "Settings", icon: Settings, perm: null, testId: "nav-settings" },
];

function SidebarInner({ onNavigate }) {
  const { tenant, permissions, user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col" data-testid="app-shell-sidebar">
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-sm truncate" data-testid="sidebar-tenant-name">{tenant?.name || "SignGuy AI"}</div>
            <div className="text-[11px] text-muted-foreground truncate">{tenant?.slug}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV.filter((it) => !it.perm || permissions.includes(it.perm)).map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            onClick={onNavigate}
            data-testid={it.testId}
            className={({ isActive }) => cn(
              "h-10 px-3 rounded-lg flex items-center gap-3 text-sm relative transition-colors",
              isActive
                ? "text-foreground bg-muted/80 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[hsl(var(--ring))]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <it.icon className="size-4" />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t px-2 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full h-11 px-2 rounded-lg hover:bg-muted/60 flex items-center gap-2 text-left" data-testid="sidebar-user-menu">
              <Avatar className="size-7"><AvatarFallback>{(user?.full_name || user?.email || "U").slice(0,1).toUpperCase()}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate">{user?.full_name || user?.email}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-[240px]">
            <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} data-testid="sidebar-logout">
              <LogOut className="size-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const { devBypass } = useAuth();
  const active = NAV.find((it) => it.to !== "/" && loc.pathname.startsWith(it.to)) || (loc.pathname === "/" && NAV[0]);
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {devBypass && (
        <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-1.5 flex items-center justify-center gap-2" data-testid="dev-bypass-banner">
          <ShieldAlert className="size-3.5" />
          <span><span className="font-semibold">Auth bypass ON</span> · you're browsing as Dev Shop owner. Set <span className="mono">AUTH_DEV_BYPASS=false</span> before deploying.</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col border-r bg-[hsl(var(--sidebar))] h-dvh sticky top-0">
          <SidebarInner />
        </aside>

        <div className="min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="app-shell-topbar">
            <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden" data-testid="sidebar-open-mobile">
                      <ChevronsLeft className="size-4 rotate-180" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[280px]">
                    <SidebarInner onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
                <div className="font-display font-semibold truncate" data-testid="topbar-page-title">
                  {active?.label || "SignGuy AI"}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 md:px-6 py-6 max-w-[1400px]" data-testid="app-shell-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

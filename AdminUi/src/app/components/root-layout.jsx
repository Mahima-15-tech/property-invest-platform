import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  FileText,
  Bell,
  Settings,
  ClipboardList,
  Menu,
  X,
  Search,
  Plus,
  User,
  LogOut,
  ChevronLeft,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Investors", href: "/investors", icon: Users },
  { name: "Brokers", href: "/brokers", icon: Briefcase },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "CMS", href: "/cms", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
];

export function RootLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-20" : "w-64"} hidden md:flex flex-col bg-card border-r transition-all`}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-semibold text-primary">RealEstateHub</h1>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition relative ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                )}

                <Icon className={`h-5 w-5 ${sidebarCollapsed ? "mx-auto" : ""}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="w-64 h-full bg-card border-r"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b">
              <h1 className="text-xl font-semibold text-primary">RealEstateHub</h1>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6">

          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search properties..."
                className="pl-10 bg-accent/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">

              {/* <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Property</span>
              </Button> */}

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 text-xs">3</Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
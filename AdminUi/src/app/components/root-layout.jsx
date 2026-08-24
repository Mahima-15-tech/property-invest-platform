import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
<<<<<<< HEAD

=======
>>>>>>> backup-local
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
<<<<<<< HEAD
  Plus,
  User,
  LogOut,
  ChevronLeft,
=======
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Command,
>>>>>>> backup-local
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
<<<<<<< HEAD
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "CMS", href: "/cms", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
=======
  { name: "Exit Requests", href: "/exit-requests", icon: LogOut },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "CMS", href: "/cms", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell, badge: "3" },
  { name: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
  { name: "Users Management", href: "/users", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
>>>>>>> backup-local
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
<<<<<<< HEAD
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-20" : "w-64"} hidden md:flex flex-col bg-card border-r transition-all`}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-semibold text-primary">RealEstateHub</h1>
=======
    <div className="flex h-screen overflow-hidden bg-slate-950/2 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } hidden md:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out relative z-30 shadow-xl`}
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wider text-white uppercase leading-none">
                  PropInvest
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Admin Console
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
>>>>>>> backup-local
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
<<<<<<< HEAD
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
=======
            className="text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl h-8 w-8 transition"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
>>>>>>> backup-local
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
<<<<<<< HEAD
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
=======
                title={sidebarCollapsed ? item.name : undefined}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  } ${sidebarCollapsed ? "mx-auto" : ""}`}
                />

                {!sidebarCollapsed && (
                  <span className="truncate tracking-wide">{item.name}</span>
                )}

                {/* BADGE (IF ANY) */}
                {item.badge && !sidebarCollapsed && (
                  <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-500/30">
                    {item.badge}
                  </span>
                )}

                {/* ACTIVE GLOW PILL */}
                {active && !sidebarCollapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-l-full shadow-sm" />
                )}
>>>>>>> backup-local
              </Link>
            );
          })}
        </nav>
<<<<<<< HEAD
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
=======

        {/* BOTTOM USER PROFILE CARD */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-800/80 m-2 rounded-2xl bg-slate-950/40 border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                A
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">
                  Admin User
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  admin@propinvest.com
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="relative w-72 max-w-[80vw] h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white tracking-wide">
                  PropInvest
                </span>
              </div>
>>>>>>> backup-local

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
<<<<<<< HEAD
=======
                className="text-slate-400 hover:text-white rounded-xl"
>>>>>>> backup-local
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

<<<<<<< HEAD
            <nav className="p-4 space-y-1">
=======
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
>>>>>>> backup-local
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
<<<<<<< HEAD
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
=======
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
>>>>>>> backup-local
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

<<<<<<< HEAD
      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6">

          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
=======
      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 shadow-xs">
          
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600 hover:bg-slate-100 rounded-xl"
>>>>>>> backup-local
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

<<<<<<< HEAD
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
=======
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search properties, users, transactions..."
                className="pl-10 pr-12 h-9 text-xs rounded-xl bg-slate-100/70 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <div className="hidden sm:flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs">
                <Command className="w-2.5 h-2.5" /> K
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2.5 sm:gap-4">

            {/* NOTIFICATIONS */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            </Button>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

            {/* USER PROFILE DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-1 sm:px-2 sm:py-1.5 h-auto gap-2.5 hover:bg-slate-100 rounded-xl transition"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      AD
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-none">
                      Super Admin
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 leading-none">
                      Administrator
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl p-1.5 border-slate-200 shadow-xl"
              >
                <DropdownMenuLabel className="px-2.5 py-2 text-xs font-semibold text-slate-500">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl text-xs text-slate-700 focus:bg-slate-100 cursor-pointer py-2">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl text-xs text-slate-700 focus:bg-slate-100 cursor-pointer py-2">
                  System Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl text-xs text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-2 font-semibold">
                  Sign Out
>>>>>>> backup-local
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

<<<<<<< HEAD
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
=======
        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
>>>>>>> backup-local
        </main>
      </div>
    </div>
  );
}
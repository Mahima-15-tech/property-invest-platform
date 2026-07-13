import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/root-layout";
import { Dashboard } from "./pages/dashboard";
import { Properties } from "./pages/properties";
import { PropertyCreate } from "./pages/property-create";
import { Investors } from "./pages/investors";
import { Brokers } from "./pages/brokers";
import { Transactions } from "./pages/transactions";
import { Reports } from "./pages/reports";
import { CMS } from "./pages/cms";
import { Notifications } from "./pages/notifications";
import { Settings } from "./pages/settings";
import { AuditLogs } from "./pages/audit-logs";
import { NotFound } from "./pages/not-found";
import { PropertyView } from "./pages/property-view";
import { PropertyEdit } from "./pages/property-edit";
import { Login } from "./pages/login";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />, // ✅ standalone page (no sidebar)
  },

  {
    
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      
      { path: "properties", element: <Properties /> },
      { path: "properties/create", element: <PropertyCreate /> },
      { path: "properties/view/:id", element: <PropertyView /> },
      { path: "properties/edit/:id", element: <PropertyEdit /> },
      { path: "investors", element: <Investors /> },
      { path: "brokers", element: <Brokers /> },
      { path: "transactions", element: <Transactions /> },
      { path: "reports", element: <Reports /> },
      { path: "cms", element: <CMS /> },
      { path: "notifications", element: <Notifications /> },
      { path: "settings", element: <Settings /> },
      { path: "audit-logs", element: <AuditLogs /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
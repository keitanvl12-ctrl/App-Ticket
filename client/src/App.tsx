import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { queryClient } from "./lib/queryClient";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AllTickets from "@/pages/AllTickets";
import KanbanBoard from "@/pages/KanbanBoard";
import Analytics from "@/pages/Analytics";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import SLA from "@/pages/SLA";
import CreateTicket from "@/pages/CreateTicket";
import UserManagement from "@/pages/UserManagement";
import Categories from "@/pages/Categories";
import TicketForms from "@/pages/TicketForms";
import CustomFields from "@/pages/CustomFields";
import CustomFieldsManager from "@/pages/CustomFieldsManager";
import DepartmentManager from "@/pages/DepartmentManager";
import WorkflowApprovals from "@/pages/WorkflowApprovals";
import Approvals from "@/pages/Approvals";
import ReportsNew from "@/pages/ReportsNew";
import Departments from "@/pages/Departments";
import NotFound from "@/pages/NotFound";
import UserProfiles from "@/pages/UserProfiles";
import SLAConfiguration from "@/pages/SLAConfiguration";
import ConfigurationPage from "@/pages/ConfigurationPage";
import PermissionSettings from "@/pages/PermissionSettings";
import HierarchyManagement from "@/pages/HierarchyManagement";
import HierarchyDemo from "@/components/HierarchyDemo";
import { PermissionGuard, AdminOnly, SupervisorOnly } from "@/components/PermissionGuard";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tickets" component={KanbanBoard} />

        <Route path="/analytics">
          <SupervisorOnly>
            <Analytics />
          </SupervisorOnly>
        </Route>
        <Route path="/sla" component={SLA} />
        <Route path="/users">
          <SupervisorOnly>
            <UserManagement />
          </SupervisorOnly>
        </Route>
        <Route path="/departments">
          <AdminOnly>
            <DepartmentManager />
          </AdminOnly>
        </Route>
        <Route path="/permissions">
          <AdminOnly>
            <PermissionSettings />
          </AdminOnly>
        </Route>
        <Route path="/hierarchy">
          <AdminOnly>
            <HierarchyManagement />
          </AdminOnly>
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/hierarchy-demo" component={() => <HierarchyDemo />} />
        <Route path="/categories">
          <SupervisorOnly>
            <Categories />
          </SupervisorOnly>
        </Route>
        <Route path="/forms">
          <SupervisorOnly>
            <TicketForms />
          </SupervisorOnly>
        </Route>
        <Route path="/fields">
          <SupervisorOnly>
            <CustomFieldsManager />
          </SupervisorOnly>
        </Route>
        <Route path="/approvals" component={Approvals} />
        <Route path="/workflow-approvals" component={WorkflowApprovals} />
        <Route path="/reports">
          <SupervisorOnly>
            <ReportsNew />
          </SupervisorOnly>
        </Route>
        <Route path="/user-profiles" component={UserProfiles} />
        <Route path="/sla-config" component={SLAConfiguration} />
        <Route path="/config" component={ConfigurationPage} />
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

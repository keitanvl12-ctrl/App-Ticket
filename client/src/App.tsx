import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { queryClient } from "./lib/queryClient";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import WorkflowApprovals from "@/pages/WorkflowApprovals";
import Approvals from "@/pages/Approvals";
import ReportsNew from "@/pages/ReportsNew";
import Departments from "@/pages/Departments";
import NotFound from "@/pages/NotFound";
import UserProfiles from "@/pages/UserProfiles";
import SLAConfiguration from "@/pages/SLAConfiguration";
import ConfigurationPage from "@/pages/ConfigurationPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tickets" component={KanbanBoard} />

        <Route path="/analytics" component={Analytics} />
        <Route path="/sla" component={SLA} />
        <Route path="/users" component={UserManagement} />
        <Route path="/departments" component={Departments} />
        <Route path="/categories" component={Categories} />
        <Route path="/forms" component={TicketForms} />
        <Route path="/fields" component={CustomFields} />
        <Route path="/approvals" component={Approvals} />
        <Route path="/workflow-approvals" component={WorkflowApprovals} />
        <Route path="/reports" component={ReportsNew} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

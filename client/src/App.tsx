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
import Login from "@/pages/Login";
import SLA from "@/pages/SLA";
import CreateTicket from "@/pages/CreateTicket";
import UserManagement from "@/pages/UserManagement";
import Categories from "@/pages/Categories";
import TicketForms from "@/pages/TicketForms";
import CustomFields from "@/pages/CustomFields";
import WorkflowApprovals from "@/pages/WorkflowApprovals";
import Reports from "@/pages/Reports";
import Departments from "@/pages/Departments";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tickets" component={KanbanBoard} />
        <Route path="/create" component={CreateTicket} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/sla" component={SLA} />
        <Route path="/users" component={UserManagement} />
        <Route path="/departments" component={Departments} />
        <Route path="/categories" component={Categories} />
        <Route path="/forms" component={TicketForms} />
        <Route path="/fields" component={CustomFields} />
        <Route path="/approvals" component={WorkflowApprovals} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
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

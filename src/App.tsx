import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Report from "./pages/Report";
import Stories from "./pages/Stories";
import Surveys from "./pages/Surveys";
import Policy from "./pages/Policy";
import MyTickets from "./pages/MyTickets";
import Data from "./pages/Data";
import Training from "./pages/Training";
import TrainingModule from "./pages/TrainingModule";
import AboutMyCity from "./pages/AboutMyCity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report" element={<Report />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/data" element={<Data />} />
          <Route path="/resolver/data" element={<Data />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:moduleId" element={<TrainingModule />} />
          <Route path="/about-my-city" element={<AboutMyCity />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

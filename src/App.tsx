import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Route-level code splitting: each page is its own chunk so first paint of
// any route doesn't drag in Leaflet/Recharts/etc. from every other page.
const Index = lazy(() => import("./pages/Index"));
const Report = lazy(() => import("./pages/Report"));
const Stories = lazy(() => import("./pages/Stories"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const Data = lazy(() => import("./pages/Data"));
const Training = lazy(() => import("./pages/Training"));
const TrainingModule = lazy(() => import("./pages/TrainingModule"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">
    Loading…
  </div>
);

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report" element={<Report />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/data" element={<Data />} />
          <Route path="/resolver/data" element={<Data />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:moduleId" element={<TrainingModule />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;

import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import LayoutApp from "../components/layout/Layout";
import Loading from "../components/common/Loading";

// Dashboard Components
const Home = lazy(() => import("../components/Home/Home"));
const Analytics = lazy(() => import("../components/Dashboard/Analytics"));
const Monitoring = lazy(() => import("../components/Dashboard/Monitoring"));

// Chart Components
const BarCharts = lazy(() => import("../components/Charts/BarCharts"));
const LineCharts = lazy(() => import("../components/Charts/LineCharts"));
const PieCharts = lazy(() => import("../components/Charts/PieCharts"));
const AreaCharts = lazy(() => import("../components/Charts/AreaCharts"));

// Map Components
const LocationMap = lazy(() => import("../components/Maps/LocationMap"));
const HeatMap = lazy(() => import("../components/Maps/HeatMap"));
const DistributionMap = lazy(() => import("../components/Maps/DistributionMap"));

// Settings
const Settings = lazy(() => import("../components/Settings/Settings"));

function MainAppRoutes() {
  return (
    <LayoutApp>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Dashboard Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/monitoring" element={<Monitoring />} />

          {/* Chart Routes */}
          <Route path="/bar-charts" element={<BarCharts />} />
          <Route path="/line-charts" element={<LineCharts />} />
          <Route path="/pie-charts" element={<PieCharts />} />
          <Route path="/area-charts" element={<AreaCharts />} />

          {/* Map Routes */}
          <Route path="/location-map" element={<LocationMap />} />
          <Route path="/heatmap" element={<HeatMap />} />
          <Route path="/distribution-map" element={<DistributionMap />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Catch-all route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </LayoutApp>
  );
}

export default MainAppRoutes;
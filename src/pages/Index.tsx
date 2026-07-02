import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, ArrowRight, Ticket, MapPin, Clock, Shield, Users, Settings2, GraduationCap, BarChart3 } from 'lucide-react';
import nairobiSkyline from '@/assets/nairobi-skyline.jpg';
import { AppLayout } from '@/components/layout/AppLayout';
import { NairobiMap } from '@/components/map/NairobiMap';
import { UserPreferencesModal, loadUserPreferences, UserPreferences } from '@/components/preferences/UserPreferencesModal';
import { ComplaintCategories } from '@/components/home/ComplaintCategories';
import { Button } from '@/components/ui/button';
import { KPI, kpiNumber, getComplaintTotal } from '@/lib/analyticsApi';
import { CITY_NAME } from '@/lib/config';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDescription, setLocationDescription] = useState('');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(loadUserPreferences);

  // Live headline stats from the Bomet PGR MV analytics API.
  const [homeStats, setHomeStats] = useState<{ total: number | null; open: number | null; resolved: number | null; rate: number | null }>({
    total: null, open: null, resolved: null, rate: null,
  });
  useEffect(() => {
    let alive = true;
    Promise.all([
      getComplaintTotal(),
      kpiNumber(KPI.openLive, 'last_30d'),
      kpiNumber(KPI.resolved, 'last_30d'),
      kpiNumber(KPI.resolutionRate, 'last_30d'),
    ]).then(([total, open, resolved, rate]) => {
      if (alive) setHomeStats({ total, open, resolved, rate });
    });
    return () => { alive = false; };
  }, []);
  const fmt = (v: number | null) => (v == null ? '—' : v.toLocaleString());
  const pct = (v: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);
  const handleLocationSelect = useCallback((location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  }, []);

  const handleLocationDescriptionChange = useCallback((description: string) => {
    setLocationDescription(description);
  }, []);

  return (
    <AppLayout>
      {/* Hero Section - Nairobi Style */}
      <section className="mb-10" aria-labelledby="hero-title">
        <div 
          className="ncc-hero p-8 md:p-12 relative bg-cover bg-center"
          style={{ backgroundImage: `url(${nairobiSkyline})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/60" />
          <div className="max-w-2xl relative z-10">
            <p className="text-secondary font-semibold mb-2 uppercase tracking-wide text-sm">
              Welcome to
            </p>
            <h1 id="hero-title" className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {CITY_NAME}
              <span className="block text-secondary">Citizen Portal</span>
            </h1>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Report issues, track progress, and discover what's happening in your ward.
              Your voice matters in building a better {CITY_NAME}.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/report"
                className="ncc-btn-secondary"
              >
                <PenSquare className="w-5 h-5" />
                Report an Issue
              </Link>
              <Link
                to="/data"
                className="ncc-btn-outline border-white text-white hover:bg-white hover:text-primary"
              >
                <Ticket className="w-5 h-5" />
                Track My Reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Banner */}
      <section className="mb-6">
        <div className="ncc-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {userPreferences.subscribedWards.length > 0 || userPreferences.preferredTopics.length > 0
                  ? `Following ${userPreferences.subscribedWards.length} area(s), ${userPreferences.preferredTopics.length} topic(s)`
                  : 'Customize your feed'}
              </p>
              <p className="text-sm text-muted-foreground">
                Select your wards and topics of interest
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Saved on this device
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreferencesOpen(true)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Preferences
          </Button>
        </div>
      </section>

      {/* Quick Stats - Consistent with Dashboard */}
      <section className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            return [
              { icon: MapPin, label: 'Total Complaints', value: fmt(homeStats.total), color: 'text-primary' },
              { icon: Ticket, label: 'Open Complaints', value: fmt(homeStats.open), color: 'text-secondary' },
              { icon: Shield, label: 'Resolved (30d)', value: fmt(homeStats.resolved), color: 'text-success' },
              { icon: Users, label: 'Resolution Rate', value: pct(homeStats.rate), color: 'text-accent' },
            ].map((stat, i) => (
              <div key={i} className="ncc-card p-5 flex flex-col items-center justify-center text-center h-[140px]">
                <stat.icon className={`w-7 h-7 mb-3 ${stat.color}`} />
                <div className="flex items-baseline gap-1 justify-center">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-tight whitespace-nowrap">{stat.label}</p>
              </div>
            ));
          })()}
        </div>
        <div className="mt-4 text-center">
          <Link to="/data" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
            <BarChart3 className="w-4 h-4" />
            View detailed analytics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <div className="ncc-section-header">
          <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to="/report"
            className="ncc-action-tile-primary min-h-[140px]"
          >
            <PenSquare className="w-10 h-10 mb-3" />
            <span className="font-bold text-lg">Report Issue</span>
            <span className="text-sm opacity-80 mt-1">File a service complaint</span>
          </Link>
          <Link
            to="/my-tickets"
            className="ncc-action-tile-secondary min-h-[140px] text-foreground"
          >
            <Ticket className="w-10 h-10 mb-3 text-foreground" />
            <span className="font-bold text-lg text-foreground">My Tickets</span>
            <span className="text-sm opacity-80 mt-1 text-foreground">Track your reports</span>
          </Link>
          <Link
            to="/training"
            className="ncc-action-tile-accent min-h-[140px] col-span-2 md:col-span-1"
          >
            <GraduationCap className="w-10 h-10 mb-3" />
            <span className="font-bold text-lg">Training & Help</span>
            <span className="text-sm opacity-80 mt-1">Learn how to use the portal</span>
          </Link>
        </div>
      </section>

      {/* What you can report — live complaint categories from MDMS ServiceDefs */}
      <ComplaintCategories />

      {/* Map Section */}
      <section className="mb-10" aria-labelledby="map-section-title">
        <div className="ncc-section-header">
          <h2 id="map-section-title" className="text-2xl font-bold text-foreground">
            Select Your Location
          </h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Mark a spot on the map to pinpoint where you want to report an issue in your area.
        </p>
        
        <NairobiMap
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onLocationDescriptionChange={handleLocationDescriptionChange}
        />
      </section>

      {/* CTA Section */}
      <section 
        className="ncc-hero p-8 md:p-10"
        aria-labelledby="cta-title"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <PenSquare className="w-7 h-7 text-secondary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h2 id="cta-title" className="text-2xl md:text-3xl font-bold mb-2">
                See Something? Say Something.
              </h2>
              <p className="text-white/90 max-w-lg">
                Potholes, garbage, broken streetlights, water leaks — report any issue and
                help {CITY_NAME} respond faster to your community's needs.
              </p>
            </div>
          </div>

          <Link
            to="/report"
            className="ncc-btn-secondary whitespace-nowrap"
          >
            <span>Report Now</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        {selectedLocation && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/80 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              Location marked at <strong className="text-secondary">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</strong>.
              Choose the ward on the report form to file your complaint.
            </p>
          </div>
        )}
      </section>

      {/* Preferences Modal */}
      <UserPreferencesModal
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        onSave={setUserPreferences}
      />
    </AppLayout>
  );
};

export default Index;

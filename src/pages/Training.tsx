import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Clock, Users, BookOpen, Volume2, ArrowRight } from 'lucide-react';
import {
  mockTrainingModules,
  AUDIENCES,
  TOPICS,
  getAllProgress,
  type TrainingModule,
  type ModuleStatus,
} from '@/lib/trainingData';

const statusColors: Record<ModuleStatus, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-secondary/20 text-secondary-foreground border border-secondary',
  completed: 'bg-success/20 text-success border border-success',
};

const statusLabels: Record<ModuleStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

const audienceColors: Record<string, string> = {
  Citizen: 'bg-primary/10 text-primary',
  'County Staff': 'bg-accent/20 text-accent-foreground',
  'Ward Leaders': 'bg-secondary/20 text-secondary-foreground',
};

export default function Training() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const progress = getAllProgress();

  const filteredModules = useMemo(() => {
    return mockTrainingModules.filter((module) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          module.title.toLowerCase().includes(query) ||
          module.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Audience filter
      if (selectedAudience !== 'all' && !module.audience.includes(selectedAudience as any)) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'all' && module.topic !== selectedTopic) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedAudience, selectedTopic]);

  const getModuleStatus = (moduleId: string): ModuleStatus => {
    return progress[moduleId]?.status || 'not_started';
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display">
                Training & Help Centre
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Short modules to help citizens and county staff use Nairobi's digital services with confidence.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Volume2 className="w-4 h-4" />
              Read Aloud
            </Button>
          </div>
        </header>

        {/* Search & Filters */}
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search modules..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search training modules"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Audience filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center mr-1">Audience:</span>
              {AUDIENCES.map((audience) => (
                <button
                  key={audience.value}
                  onClick={() => setSelectedAudience(audience.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedAudience === audience.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  aria-pressed={selectedAudience === audience.value}
                >
                  {audience.label}
                </button>
              ))}
            </div>

            {/* Topic filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center mr-1">Topic:</span>
              {TOPICS.map((topic) => (
                <button
                  key={topic.value}
                  onClick={() => setSelectedTopic(topic.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedTopic === topic.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  aria-pressed={selectedTopic === topic.value}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Module Cards */}
        <section aria-label="Training modules">
          {filteredModules.length === 0 ? (
            <div className="ncc-card p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No modules found matching your criteria.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAudience('all');
                  setSelectedTopic('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  status={getModuleStatus(module.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

interface ModuleCardProps {
  module: TrainingModule;
  status: ModuleStatus;
}

function ModuleCard({ module, status }: ModuleCardProps) {
  return (
    <article className="ncc-card p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{module.title}</h2>
            <Badge variant="outline" className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>

          <p className="text-muted-foreground line-clamp-2">{module.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {module.audience.map((aud) => (
              <Badge key={aud} variant="secondary" className={audienceColors[aud]}>
                <Users className="w-3 h-3 mr-1" />
                {aud}
              </Badge>
            ))}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {module.durationMinutes} mins
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Link to={`/training/${module.id}`}>
            <Button className="gap-2 w-full md:w-auto">
              Open Module
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

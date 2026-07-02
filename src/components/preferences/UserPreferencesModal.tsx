import React, { useState, useEffect } from 'react';
import { MapPin, Bell, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ward } from '@/types/story';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export interface UserPreferences {
  subscribedWards: string[];
  preferredTopics: string[];
}

interface UserPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (preferences: UserPreferences) => void;
}

const STORAGE_KEY = 'nairobi_citizen_preferences';

interface Topic {
  code: string;   // menuPath from live ServiceDefs
  label: string;
  description: string;
}

// Derive a sub-county label from a Bomet ward code (BOMET_<SUBCOUNTY>_<WARD>).
function subCountyOf(code: string): string {
  const parts = (code || '').split('_');
  const raw = parts.length >= 3 ? parts[1] : parts.length === 2 ? parts[1] : 'OTHER';
  return raw
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const loadUserPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const p = JSON.parse(stored);
      return {
        subscribedWards: p.subscribedWards ?? [],
        preferredTopics: p.preferredTopics ?? [],
      };
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return { subscribedWards: [], preferredTopics: [] };
};

export const saveUserPreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
};

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Live Bomet wards + topic groups (from boundary-service + MDMS ServiceDefs).
  const [wards, setWards] = useState<Ward[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const saved = loadUserPreferences();
    setSelectedWards(saved.subscribedWards);
    setSelectedTopics(saved.preferredTopics);

    let alive = true;
    setLoading(true);
    Promise.all([apiClient.getWards(), apiClient.getServiceDefs()])
      .then(([wardList, defs]) => {
        if (!alive) return;
        setWards(wardList);
        // Topics = distinct ServiceDef menuPath groups (the real Bomet complaint categories).
        const byPath = new Map<string, number>();
        for (const d of defs) {
          const path = (d.menuPath || 'Other').trim();
          byPath.set(path, (byPath.get(path) || 0) + 1);
        }
        setTopics(
          Array.from(byPath.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([path, count]) => ({
              code: path,
              label: path,
              description: `${count} complaint type${count === 1 ? '' : 's'}`,
            })),
        );
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleSelectAllWards = () =>
    setSelectedWards(selectedWards.length === wards.length ? [] : wards.map((w) => w.code));
  const handleSelectAllTopics = () =>
    setSelectedTopics(selectedTopics.length === topics.length ? [] : topics.map((t) => t.code));

  const handleSave = () => {
    const preferences: UserPreferences = { subscribedWards: selectedWards, preferredTopics: selectedTopics };
    saveUserPreferences(preferences);
    onSave?.(preferences);
    toast.success('Preferences saved successfully', {
      description: `Following ${selectedWards.length} ward(s) and ${selectedTopics.length} topic(s)`,
    });
    onOpenChange(false);
  };

  // Group live wards by derived sub-county.
  const wardsBySubcounty = wards.reduce((acc, ward) => {
    const sc = subCountyOf(ward.code);
    (acc[sc] = acc[sc] || []).push(ward);
    return acc;
  }, {} as Record<string, Ward[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 bg-background">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Bell className="w-5 h-5 text-primary" />
            My Preferences
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select the areas and topics you want to follow
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Preferences are saved on this device.
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-8">
            {loading && (
              <div className="space-y-3" aria-busy="true">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!loading && (
              <>
                {/* Ward Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">My Areas</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {selectedWards.length} selected
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllWards}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {selectedWards.length === wards.length && wards.length > 0 ? 'Clear all' : 'Select all'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(wardsBySubcounty).map(([subcounty, list]) => (
                      <div key={subcounty}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          {subcounty}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {list.map((ward) => (
                            <label
                              key={ward.code}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedWards.includes(ward.code)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox
                                checked={selectedWards.includes(ward.code)}
                                onCheckedChange={() => toggle(selectedWards, setSelectedWards, ward.code)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="text-sm font-medium text-foreground">{ward.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-secondary" />
                      <h3 className="font-semibold text-foreground">Topics of Interest</h3>
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                        {selectedTopics.length} selected
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllTopics}
                      className="text-xs text-muted-foreground hover:text-secondary"
                    >
                      {selectedTopics.length === topics.length && topics.length > 0 ? 'Clear all' : 'Select all'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {topics.map((topic) => (
                      <label
                        key={topic.code}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedTopics.includes(topic.code)
                            ? 'border-secondary bg-secondary/5'
                            : 'border-border hover:border-secondary/50 hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={selectedTopics.includes(topic.code)}
                          onCheckedChange={() => toggle(selectedTopics, setSelectedTopics, topic.code)}
                          className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{topic.label}</p>
                          <p className="text-xs text-muted-foreground">{topic.description}</p>
                        </div>
                        {selectedTopics.includes(topic.code) && <Check className="w-5 h-5 text-secondary" />}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border bg-muted/30">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSave}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

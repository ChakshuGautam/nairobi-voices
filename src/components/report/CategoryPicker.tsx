import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { ServiceDef } from '@/lib/digitMappers';
import { cn } from '@/lib/utils';

interface CategoryPickerProps {
  /** Currently selected live PGR serviceCode (or null). */
  selected: string | null;
  /** Fired with the chosen ServiceDef so the caller can capture serviceCode + name. */
  onSelect: (def: ServiceDef) => void;
  className?: string;
}

/**
 * Category picker sourced from live Bomet MDMS ServiceDefs
 * (apiClient.getServiceDefs), grouped by `menuPath`. Replaces the hardcoded
 * Nairobi IssueCategory list. The selected value is a real PGR serviceCode.
 */
export function CategoryPicker({ selected, onSelect, className }: CategoryPickerProps) {
  const [defs, setDefs] = useState<ServiceDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.getServiceDefs();
        if (!cancelled) setDefs(data.filter((d) => d.active !== false));
      } catch (err) {
        console.error('Failed to load complaint categories:', err);
        if (!cancelled) setError('Could not load complaint categories. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group ServiceDefs by their menuPath for a scannable, sectioned picker.
  const groups = useMemo(() => {
    const map = new Map<string, ServiceDef[]>();
    for (const d of defs) {
      const key = d.menuPath?.trim() || 'Other';
      const arr = map.get(key) ?? [];
      arr.push(d);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [defs]);

  return (
    <div className={className}>
      <fieldset>
        <legend className="text-xl font-bold text-foreground mb-4">
          What type of issue is this?
        </legend>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border-2 border-border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        ) : defs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No complaint categories are configured yet. Please try again later.
          </p>
        ) : (
          <div className="space-y-6">
            {groups.map(([menuPath, items]) => (
              <div key={menuPath} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">{menuPath}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((def) => (
                    <label
                      key={def.serviceCode}
                      className={cn(
                        'flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all',
                        'hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary',
                        selected === def.serviceCode
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      )}
                    >
                      <input
                        type="radio"
                        name="serviceCode"
                        value={def.serviceCode}
                        checked={selected === def.serviceCode}
                        onChange={() => onSelect(def)}
                        className="sr-only"
                      />
                      <span className="font-semibold text-foreground text-sm">{def.name}</span>
                      {typeof def.slaHours === 'number' && def.slaHours > 0 && (
                        <span className="text-xs text-muted-foreground mt-1">
                          Target response: {def.slaHours}h
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
}

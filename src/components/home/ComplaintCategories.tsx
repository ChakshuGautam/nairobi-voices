import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { ServiceDef } from '@/lib/digitMappers';

interface CategoryGroup {
  menuPath: string;
  count: number;
  examples: string[];
}

/**
 * Homepage "What you can report" section — sourced from the LIVE Bomet PGR
 * ServiceDefs (MDMS RAINMAKER-PGR.ServiceDefs), grouped by menuPath. Each group
 * links into the report wizard. No hardcoded categories.
 */
export function ComplaintCategories() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    apiClient
      .getServiceDefs()
      .then((defs: ServiceDef[]) => {
        if (!alive) return;
        const byPath = new Map<string, ServiceDef[]>();
        for (const d of defs) {
          const path = (d.menuPath || 'Other').trim();
          if (!byPath.has(path)) byPath.set(path, []);
          byPath.get(path)!.push(d);
        }
        const g: CategoryGroup[] = Array.from(byPath.entries())
          .map(([menuPath, items]) => ({
            menuPath,
            count: items.length,
            examples: items.slice(0, 3).map((i) => i.name).filter(Boolean),
          }))
          .sort((a, b) => b.count - a.count);
        setGroups(g);
        setTotal(defs.length);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && groups.length === 0) return null;

  return (
    <section className="mb-10" aria-labelledby="categories-title">
      <div className="ncc-section-header flex items-center justify-between">
        <h2 id="categories-title" className="text-2xl font-bold text-foreground">
          What you can report
        </h2>
        {total > 0 && (
          <span className="text-sm text-muted-foreground">{total} complaint types</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ncc-card p-5 h-[120px] animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link
              key={group.menuPath}
              to="/report"
              className="ncc-card p-5 flex flex-col gap-2 hover:border-primary/50 hover:shadow-md transition-all group"
              aria-label={`Report a ${group.menuPath} issue`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Tag className="w-5 h-5" />
                  </span>
                  <h3 className="font-semibold text-foreground leading-tight">{group.menuPath}</h3>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {group.examples.join(' · ')}
              </p>
              <span className="text-xs text-primary font-medium mt-auto">
                {group.count} type{group.count === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

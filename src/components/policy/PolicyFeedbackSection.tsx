import React, { useState } from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import { PolicyCard } from './PolicyCard';
import { PolicyDetailModal } from './PolicyDetailModal';
import { MOCK_POLICIES } from '@/lib/policyData';
import { Policy } from '@/types/policy';

export const PolicyFeedbackSection: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const activePolicies = MOCK_POLICIES.filter(p => p.status !== 'closed');
  const closedPolicies = MOCK_POLICIES.filter(p => p.status === 'closed');

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Provide Policy Feedback
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Share your views on draft laws, regulations, and county plans before they're finalized.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 p-4 bg-primary/5 rounded-xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="text-foreground font-medium">
            {MOCK_POLICIES.reduce((sum, p) => sum + p.engagement.commentCount, 0)} citizen inputs
          </span>
        </div>
        <span className="text-muted-foreground">across {MOCK_POLICIES.length} policies</span>
      </div>

      {/* Active Policies */}
      {activePolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Open for feedback ({activePolicies.length})
          </h3>
          <div className="grid gap-4">
            {activePolicies.map(policy => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onClick={() => setSelectedPolicy(policy)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Closed Policies */}
      {closedPolicies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Recently closed ({closedPolicies.length})
          </h3>
          <div className="grid gap-4 opacity-75">
            {closedPolicies.map(policy => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onClick={() => setSelectedPolicy(policy)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <PolicyDetailModal
          policy={selectedPolicy}
          isOpen={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </section>
  );
};

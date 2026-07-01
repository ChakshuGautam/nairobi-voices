import { AppLayout } from '@/components/layout/AppLayout';
import { PolicyFeedbackSection } from '@/components/policy/PolicyFeedbackSection';

const Policy = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PolicyFeedbackSection />
      </div>
    </AppLayout>
  );
};

export default Policy;

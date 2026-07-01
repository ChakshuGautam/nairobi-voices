import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StoryFeed } from '@/components/story/StoryFeed';

const Stories = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <StoryFeed />
      </div>
    </AppLayout>
  );
};

export default Stories;

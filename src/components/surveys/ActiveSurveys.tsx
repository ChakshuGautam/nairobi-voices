import React, { useState, useCallback } from 'react';
import { SurveyCard } from './SurveyCard';
import { SurveyModal } from './SurveyModal';
import { FloodHotspotSurveyModal, FloodHotspotData } from './FloodHotspotSurveyModal';
import { GarbageHotspotSurveyModal, GarbageHotspotData } from './GarbageHotspotSurveyModal';
import { mockSurveys, markSurveyCompleted, saveUserChoice } from '@/lib/surveyData';
import type { Survey } from '@/types/survey';

const FLOOD_SURVEY_ID = 'survey_005';
const GARBAGE_SURVEY_ID = 'survey_003';

export const ActiveSurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [floodModalOpen, setFloodModalOpen] = useState(false);
  const [garbageModalOpen, setGarbageModalOpen] = useState(false);

  const handleParticipate = useCallback((survey: Survey) => {
    if (survey.id === FLOOD_SURVEY_ID) {
      setFloodModalOpen(true);
    } else if (survey.id === GARBAGE_SURVEY_ID) {
      setGarbageModalOpen(true);
    } else {
      setSelectedSurvey(survey);
      setModalOpen(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedSurvey(null);
  }, []);

  const handleCloseFloodModal = useCallback(() => {
    setFloodModalOpen(false);
  }, []);

  const handleCloseGarbageModal = useCallback(() => {
    setGarbageModalOpen(false);
  }, []);

  const handleSubmitSurvey = useCallback((surveyId: string, answers: Record<string, string>) => {
    Object.entries(answers).forEach(([questionId, choice]) => {
      saveUserChoice(surveyId, questionId, choice);
    });
    
    markSurveyCompleted(surveyId);

    setSurveys(prev =>
      prev.map(s =>
        s.id === surveyId ? { ...s, responses: s.responses + 1 } : s
      )
    );

    console.log('Survey submitted:', { surveyId, answers });
  }, []);

  const handleSubmitFloodHotspot = useCallback((data: FloodHotspotData) => {
    markSurveyCompleted(FLOOD_SURVEY_ID);

    setSurveys(prev =>
      prev.map(s =>
        s.id === FLOOD_SURVEY_ID ? { ...s, responses: s.responses + 1 } : s
      )
    );

    console.log('Flood hotspot submitted:', data);
  }, []);

  const handleSubmitGarbageHotspot = useCallback((data: GarbageHotspotData) => {
    markSurveyCompleted(GARBAGE_SURVEY_ID);

    setSurveys(prev =>
      prev.map(s =>
        s.id === GARBAGE_SURVEY_ID ? { ...s, responses: s.responses + 1 } : s
      )
    );

    console.log('Garbage hotspot submitted:', data);
  }, []);

  return (
    <section className="mb-10" aria-labelledby="surveys-section-title">
      <h2 
        id="surveys-section-title" 
        className="text-2xl font-bold text-foreground mb-6"
      >
        Active Surveys
      </h2>

      <div className="space-y-4">
        {surveys.map(survey => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            onParticipate={handleParticipate}
          />
        ))}
      </div>

      {/* Standard survey modal */}
      <SurveyModal
        survey={selectedSurvey}
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSurvey}
      />

      {/* Special flood hotspot modal */}
      <FloodHotspotSurveyModal
        open={floodModalOpen}
        onClose={handleCloseFloodModal}
        onSubmit={handleSubmitFloodHotspot}
      />

      {/* Special garbage hotspot modal */}
      <GarbageHotspotSurveyModal
        open={garbageModalOpen}
        onClose={handleCloseGarbageModal}
        onSubmit={handleSubmitGarbageHotspot}
      />
    </section>
  );
};

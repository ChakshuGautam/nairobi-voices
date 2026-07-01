export interface SurveyOption {
  label: string;
  votes: number;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  options: SurveyOption[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  responses: number;
  daysLeft: number;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  surveyId: string;
  answers: Record<string, string>;
  submittedAt: string;
}

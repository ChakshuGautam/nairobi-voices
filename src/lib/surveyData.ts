import type { Survey } from '@/types/survey';

export const mockSurveys: Survey[] = [
  {
    id: "survey_001",
    title: "Street Lighting Improvement Survey",
    description: "Help us prioritize street lighting improvements in your area",
    responses: 342,
    daysLeft: 5,
    questions: [
      {
        id: "q1",
        text: "Which areas should be prioritized for new streetlights?",
        options: [
          { label: "Residential streets and estates", votes: 156 },
          { label: "Main roads and intersections", votes: 98 },
          { label: "Parks and recreational areas", votes: 67 },
          { label: "Commercial and market areas", votes: 21 }
        ]
      }
    ]
  },
  {
    id: "survey_002",
    title: "Public Transport Route Feedback",
    description: "Share your thoughts on Nairobi's ongoing bus and matatu route changes.",
    responses: 156,
    daysLeft: 12,
    questions: [
      {
        id: "q1",
        text: "Which of these changes would most improve your daily commute in Nairobi?",
        options: [
          { label: "Reopening direct matatu access to CBD zones (Railways, Kencom, GPO)", votes: 45 },
          { label: "Better safety and lighting at termini such as Green Park or Fig Tree", votes: 38 },
          { label: "Introduction of dedicated BRT and express lanes on Thika and Jogoo roads", votes: 52 },
          { label: "Reliable, frequent feeder routes from estates like Umoja, Kasarani, and Lang'ata", votes: 21 }
        ]
      }
    ]
  },
  {
    id: "survey_003",
    title: "Garbage Collection Satisfaction",
    description: "Rate your garbage collection service quality",
    responses: 289,
    daysLeft: 7,
    questions: [
      {
        id: "q1",
        text: "How often is garbage collected on your street?",
        options: [
          { label: "Daily", votes: 34 },
          { label: "Twice a week", votes: 87 },
          { label: "Once a week", votes: 112 },
          { label: "Rarely / Never", votes: 56 }
        ]
      }
    ]
  },
  {
    id: "survey_004",
    title: "Water Supply Reliability Poll",
    description: "How frequently do you receive piped water at home?",
    responses: 198,
    daysLeft: 6,
    questions: [
      {
        id: "q1",
        text: "How regular is your water supply?",
        options: [
          { label: "Daily supply", votes: 42 },
          { label: "Every 2-3 days", votes: 67 },
          { label: "Once a week", votes: 54 },
          { label: "Rarely available", votes: 35 }
        ]
      }
    ]
  },
  {
    id: "survey_005",
    title: "Flood Hotspot Mapping",
    description: "Help identify flood-prone areas in your ward",
    responses: 124,
    daysLeft: 10,
    questions: [
      {
        id: "q1",
        text: "Which areas in your ward flood most frequently?",
        options: [
          { label: "Low-lying roads and junctions", votes: 48 },
          { label: "Market areas and bus stages", votes: 31 },
          { label: "Residential zones near rivers", votes: 29 },
          { label: "Public open spaces / parks", votes: 16 }
        ]
      }
    ]
  },
  {
    id: "survey_006",
    title: "Market Facilities Upgrade",
    description: "Share input on planned market infrastructure improvements across Nairobi.",
    responses: 87,
    daysLeft: 8,
    questions: [
      {
        id: "q1",
        text: "Which improvement would most benefit traders and customers in your market?",
        options: [
          { label: "Reconstruction of fire-resistant stalls and roofing (Gikomba, Toi, Muthurwa)", votes: 32 },
          { label: "Improved drainage and flood control inside market lanes", votes: 24 },
          { label: "Installation of clean, functional toilets and handwashing stations", votes: 18 },
          { label: "Upgraded lighting and nighttime security patrols", votes: 8 },
          { label: "Designated waste collection points and timely garbage pickup", votes: 5 }
        ]
      }
    ]
  }
];

// Session storage keys
const COMPLETED_SURVEYS_KEY = 'ncc_completed_surveys';
const USER_CHOICES_KEY = 'ncc_user_choices';

export function getCompletedSurveys(): string[] {
  try {
    const stored = sessionStorage.getItem(COMPLETED_SURVEYS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getUserChoices(): Record<string, Record<string, string>> {
  try {
    const stored = sessionStorage.getItem(USER_CHOICES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveUserChoice(surveyId: string, questionId: string, choice: string): void {
  try {
    const choices = getUserChoices();
    if (!choices[surveyId]) choices[surveyId] = {};
    choices[surveyId][questionId] = choice;
    sessionStorage.setItem(USER_CHOICES_KEY, JSON.stringify(choices));
  } catch {
    // Silent fail
  }
}

export function markSurveyCompleted(surveyId: string): void {
  try {
    const completed = getCompletedSurveys();
    if (!completed.includes(surveyId)) {
      completed.push(surveyId);
      sessionStorage.setItem(COMPLETED_SURVEYS_KEY, JSON.stringify(completed));
    }
  } catch {
    // Silent fail
  }
}

export function isSurveyCompleted(surveyId: string): boolean {
  return getCompletedSurveys().includes(surveyId);
}

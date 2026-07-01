export interface TrainingFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  isNew?: boolean;
  isUpdated?: boolean;
}

export interface TrainingVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  url: string;
  audience: string[];
}

export interface TrainingDownload {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  audience: ('Citizen' | 'County Staff' | 'Ward Leaders')[];
  topic: 'Complaints' | 'Projects' | 'Dashboards' | 'Policy Feedback' | 'Accessibility';
  durationMinutes: number;
  faqs: TrainingFAQ[];
  videos: TrainingVideo[];
  downloads: TrainingDownload[];
  quiz: QuizQuestion[];
  passingScore: number; // percentage required to pass (e.g., 70)
}

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

// Storage keys
const PROGRESS_KEY = 'ncc_training_progress';

export interface QuizAttempt {
  answers: Record<string, number>; // questionId -> selectedIndex
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface ModuleProgress {
  status: ModuleStatus;
  faqsViewed: string[];
  videosWatched: string[];
  downloadsClicked: string[];
  quizAttempts: QuizAttempt[];
}

const DEFAULT_PROGRESS: ModuleProgress = {
  status: 'not_started',
  faqsViewed: [],
  videosWatched: [],
  downloadsClicked: [],
  quizAttempts: [],
};

export function getModuleProgress(moduleId: string): ModuleProgress {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return { ...DEFAULT_PROGRESS };
  
  const progress = JSON.parse(stored);
  return progress[moduleId] ? { ...DEFAULT_PROGRESS, ...progress[moduleId] } : { ...DEFAULT_PROGRESS };
}

export function updateModuleProgress(moduleId: string, update: Partial<ModuleProgress>): ModuleProgress {
  const stored = localStorage.getItem(PROGRESS_KEY);
  const progress = stored ? JSON.parse(stored) : {};
  
  const current = progress[moduleId] ? { ...DEFAULT_PROGRESS, ...progress[moduleId] } : { ...DEFAULT_PROGRESS };
  const updated = { ...current, ...update };
  
  // Auto-set to in_progress if any interaction
  if (updated.status === 'not_started' && 
      (updated.faqsViewed.length > 0 || updated.videosWatched.length > 0 || updated.downloadsClicked.length > 0 || updated.quizAttempts.length > 0)) {
    updated.status = 'in_progress';
  }
  
  progress[moduleId] = updated;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  
  return updated;
}

export function submitQuizAttempt(moduleId: string, answers: Record<string, number>, module: TrainingModule): { progress: ModuleProgress; score: number; passed: boolean } {
  const current = getModuleProgress(moduleId);
  
  // Calculate score
  let correct = 0;
  module.quiz.forEach((q) => {
    if (answers[q.id] === q.correctIndex) {
      correct++;
    }
  });
  
  const score = Math.round((correct / module.quiz.length) * 100);
  const passed = score >= module.passingScore;
  
  const attempt: QuizAttempt = {
    answers,
    score,
    passed,
    attemptedAt: new Date().toISOString(),
  };
  
  const updated = updateModuleProgress(moduleId, {
    quizAttempts: [...current.quizAttempts, attempt],
  });
  
  return { progress: updated, score, passed };
}

export function hasPassedQuiz(moduleId: string): boolean {
  const progress = getModuleProgress(moduleId);
  return progress.quizAttempts.some((a) => a.passed);
}

export function getLastQuizAttempt(moduleId: string): QuizAttempt | null {
  const progress = getModuleProgress(moduleId);
  return progress.quizAttempts.length > 0 ? progress.quizAttempts[progress.quizAttempts.length - 1] : null;
}

export function markFaqViewed(moduleId: string, faqId: string): ModuleProgress {
  const current = getModuleProgress(moduleId);
  if (!current.faqsViewed.includes(faqId)) {
    return updateModuleProgress(moduleId, {
      faqsViewed: [...current.faqsViewed, faqId]
    });
  }
  return current;
}

export function markVideoWatched(moduleId: string, videoId: string): ModuleProgress {
  const current = getModuleProgress(moduleId);
  if (!current.videosWatched.includes(videoId)) {
    return updateModuleProgress(moduleId, {
      videosWatched: [...current.videosWatched, videoId]
    });
  }
  return current;
}

export function markDownloadClicked(moduleId: string, downloadId: string): ModuleProgress {
  const current = getModuleProgress(moduleId);
  if (!current.downloadsClicked.includes(downloadId)) {
    return updateModuleProgress(moduleId, {
      downloadsClicked: [...current.downloadsClicked, downloadId]
    });
  }
  return current;
}

export function markModuleCompleted(moduleId: string): ModuleProgress {
  return updateModuleProgress(moduleId, { status: 'completed' });
}

export function getAllProgress(): Record<string, ModuleProgress> {
  const stored = localStorage.getItem(PROGRESS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export const AUDIENCES = [
  { value: 'all', label: 'All' },
  { value: 'Citizen', label: 'Citizen' },
  { value: 'County Staff', label: 'County Staff' },
  { value: 'Ward Leaders', label: 'Ward Leaders' },
];

export const TOPICS = [
  { value: 'all', label: 'All Topics' },
  { value: 'Complaints', label: 'Complaints' },
  { value: 'Projects', label: 'Projects' },
  { value: 'Dashboards', label: 'Dashboards' },
  { value: 'Policy Feedback', label: 'Policy Feedback' },
  { value: 'Accessibility', label: 'Accessibility' },
];

export const mockTrainingModules: TrainingModule[] = [
  {
    id: 'module_citizen_complaints',
    title: 'How to Report an Issue Online',
    description: 'Learn how to submit complaints about roads, water, waste, and other services through the portal.',
    audience: ['Citizen'],
    topic: 'Complaints',
    durationMinutes: 10,
    faqs: [
      {
        id: 'faq_1_1',
        category: 'Getting Started',
        question: 'How do I create my first complaint?',
        answer: 'Select your location on the map or use the dropdown menus, choose a category such as waste or water, describe the issue in detail, and submit. You can attach photos for better context. Your complaint will be assigned a unique ticket ID for tracking.',
        isNew: true,
      },
      {
        id: 'faq_1_2',
        category: 'Getting Started',
        question: 'Do I need to create an account to report issues?',
        answer: 'No, you can submit complaints without creating an account. However, providing your contact information helps us send you updates about your ticket status and resolution progress.',
      },
      {
        id: 'faq_1_3',
        category: 'Tracking Your Ticket',
        question: 'How do I check the status of my complaint?',
        answer: 'Go to "My Tickets" from the main menu. You can search by your ticket ID (format: NRB-YYYY-XXXXXX) or browse recent submissions. Each ticket shows its current status: New, Assigned, In Progress, or Resolved.',
        isUpdated: true,
      },
      {
        id: 'faq_1_4',
        category: 'Tracking Your Ticket',
        question: 'What do the different status colors mean?',
        answer: 'Blue = New (just submitted), Purple = Assigned (assigned to a department), Orange = In Progress (being worked on), Green = Resolved (completed), Red = Escalated (needs attention).',
      },
      {
        id: 'faq_1_5',
        category: 'Escalations & Reopening',
        question: 'What if my issue is not resolved satisfactorily?',
        answer: 'You can reopen a resolved ticket if you are not satisfied with the resolution. Navigate to your ticket, click "Reopen," and explain why the issue persists. The ticket will be reassigned for further action.',
      },
      {
        id: 'faq_1_6',
        category: 'Escalations & Reopening',
        question: 'How long does it take to resolve a complaint?',
        answer: 'Resolution times vary by category. Most complaints have an expected service time of 3-7 working days. You can see the countdown on your ticket. If the expected service time expires, you can escalate the complaint.',
        isNew: true,
      },
    ],
    videos: [
      {
        id: 'vid_1_1',
        title: 'Step-by-step: Filing a Complaint',
        duration: '3:42',
        url: '#',
        audience: ['Citizen'],
      },
      {
        id: 'vid_1_2',
        title: 'Using Voice to Report Issues',
        duration: '2:15',
        url: '#',
        audience: ['Citizen'],
      },
      {
        id: 'vid_1_3',
        title: 'Tracking Your Ticket Status',
        duration: '4:08',
        url: '#',
        audience: ['Citizen'],
      },
    ],
    downloads: [
      {
        id: 'dl_1_1',
        name: 'Citizen Quick Start Guide',
        type: 'PDF',
        size: '1.2 MB',
        url: '#',
      },
      {
        id: 'dl_1_2',
        name: 'Complaint Categories Reference',
        type: 'PDF',
        size: '450 KB',
        url: '#',
      },
    ],
    quiz: [
      {
        id: 'q1_1',
        question: 'What is the first step to report an issue?',
        options: ['Call the county office', 'Select your location on the map', 'Create an account', 'Pay a fee'],
        correctIndex: 1,
        explanation: 'You start by selecting your location on the map or using dropdown menus.',
      },
      {
        id: 'q1_2',
        question: 'What format does the ticket ID follow?',
        options: ['NRB-YYYY-XXXXXX', 'TICKET-12345', 'COMPLAINT/2024/001', 'ID-NAIROBI-01'],
        correctIndex: 0,
        explanation: 'Ticket IDs follow the format NRB-YYYY-XXXXXX.',
      },
      {
        id: 'q1_3',
        question: 'What color indicates a complaint is "In Progress"?',
        options: ['Blue', 'Green', 'Orange', 'Red'],
        correctIndex: 2,
        explanation: 'Orange indicates the complaint is being worked on.',
      },
    ],
    passingScore: 70,
  },
  {
    id: 'module_staff_complaints',
    title: 'Handling Complaints as a County Officer',
    description: 'Complete guide for county staff on receiving, processing, and resolving citizen complaints.',
    audience: ['County Staff'],
    topic: 'Complaints',
    durationMinutes: 25,
    faqs: [
      {
        id: 'faq_2_1',
        category: 'Receiving Complaints',
        question: 'How are complaints assigned to me?',
        answer: 'Complaints are automatically routed based on category and ward. Your supervisor may also manually assign tickets to you. New assignments appear in your dashboard with a notification.',
      },
      {
        id: 'faq_2_2',
        category: 'Receiving Complaints',
        question: 'What information do I see for each complaint?',
        answer: 'You can view: citizen contact info (if provided), exact location on map, photos/attachments, description, category, priority level, expected service time, and any previous remarks or updates.',
        isNew: true,
      },
      {
        id: 'faq_2_3',
        category: 'Processing Workflow',
        question: 'How do I update the status of a complaint?',
        answer: 'Open the ticket detail view, click "Update Status," and select the new status. Add a remark explaining the update. Citizens receive notifications when status changes.',
      },
      {
        id: 'faq_2_4',
        category: 'Processing Workflow',
        question: 'Can I request more information from the citizen?',
        answer: 'Yes. Use the "Request Info" action to send a clarification request. The citizen will be notified and can respond through the portal or by phone.',
        isUpdated: true,
      },
      {
        id: 'faq_2_5',
        category: 'Resolution & Closure',
        question: 'What happens when I mark a complaint as resolved?',
        answer: 'The citizen receives a notification and can rate their satisfaction. If they are not satisfied, they can reopen the ticket. Resolved tickets contribute to your department KPIs.',
      },
      {
        id: 'faq_2_6',
        category: 'Resolution & Closure',
        question: 'How do I handle escalated complaints?',
        answer: 'Escalated complaints require priority attention. Review the escalation reason, coordinate with your supervisor if needed, and aim to resolve within 24 hours. Document all actions taken.',
      },
    ],
    videos: [
      {
        id: 'vid_2_1',
        title: 'Officer Dashboard Overview',
        duration: '5:30',
        url: '#',
        audience: ['County Staff'],
      },
      {
        id: 'vid_2_2',
        title: 'Processing a Complaint End-to-End',
        duration: '8:15',
        url: '#',
        audience: ['County Staff'],
      },
      {
        id: 'vid_2_3',
        title: 'Handling Escalations Effectively',
        duration: '4:45',
        url: '#',
        audience: ['County Staff'],
      },
    ],
    downloads: [
      {
        id: 'dl_2_1',
        name: 'Desk Agent Handbook',
        type: 'PDF',
        size: '2.8 MB',
        url: '#',
      },
      {
        id: 'dl_2_2',
        name: 'Expected Service Time Guidelines by Category',
        type: 'PDF',
        size: '680 KB',
        url: '#',
      },
      {
        id: 'dl_2_3',
        name: 'Escalation Procedures',
        type: 'PDF',
        size: '520 KB',
        url: '#',
      },
    ],
    quiz: [
      {
        id: 'q2_1',
        question: 'How are complaints assigned to county officers?',
        options: ['Random selection', 'Based on category and ward automatically', 'Citizens choose the officer', 'First-come-first-served'],
        correctIndex: 1,
        explanation: 'Complaints are automatically routed based on category and ward.',
      },
      {
        id: 'q2_2',
        question: 'What happens when you mark a complaint as resolved?',
        options: ['It is deleted', 'The citizen receives a notification', 'Nothing happens', 'The supervisor is notified'],
        correctIndex: 1,
        explanation: 'Citizens receive notifications and can rate their satisfaction.',
      },
      {
        id: 'q2_3',
        question: 'How quickly should escalated complaints be addressed?',
        options: ['Within 1 week', 'Within 24 hours', 'Within 1 month', 'No deadline'],
        correctIndex: 1,
        explanation: 'Escalated complaints require priority attention within 24 hours.',
      },
    ],
    passingScore: 70,
  },
  {
    id: 'module_dashboards',
    title: 'Understanding the Public Dashboard',
    description: 'Learn how to read and interpret the service analytics dashboard showing complaint trends and department performance.',
    audience: ['Citizen', 'County Staff'],
    topic: 'Dashboards',
    durationMinutes: 15,
    faqs: [
      {
        id: 'faq_3_1',
        category: 'Overview',
        question: 'What does the dashboard show?',
        answer: 'The dashboard displays key performance indicators: total complaints, resolution rates, on-time resolution, complaints by category/department/channel, average resolution time, and trend charts over time.',
      },
      {
        id: 'faq_3_2',
        category: 'Overview',
        question: 'How often is the data updated?',
        answer: 'Dashboard data is updated in real-time as complaints are submitted and resolved. Historical trends are calculated daily.',
        isNew: true,
      },
      {
        id: 'faq_3_3',
        category: 'Using Filters',
        question: 'How do I filter data by location?',
        answer: 'Use the Sub-county and Ward dropdown menus at the top of the dashboard. Select specific areas to see localized performance metrics.',
      },
      {
        id: 'faq_3_4',
        category: 'Using Filters',
        question: 'What time ranges are available?',
        answer: 'You can view data for the last 7 days, 30 days, 90 days, or the current financial year. Select your preferred range from the Time Range dropdown.',
      },
      {
        id: 'faq_3_5',
        category: 'Understanding Charts',
        question: 'What does the On-Time Resolution percentage mean?',
        answer: 'On-Time Resolution shows the percentage of complaints resolved within their expected service time. A higher percentage indicates better service delivery. The county target is 85%.',
      },
    ],
    videos: [
      {
        id: 'vid_3_1',
        title: 'Navigating the Analytics Dashboard',
        duration: '4:20',
        url: '#',
        audience: ['Citizen', 'County Staff'],
      },
      {
        id: 'vid_3_2',
        title: 'Interpreting Trend Charts',
        duration: '3:55',
        url: '#',
        audience: ['Citizen', 'County Staff'],
      },
    ],
    downloads: [
      {
        id: 'dl_3_1',
        name: 'KPI Definitions Guide',
        type: 'PDF',
        size: '380 KB',
        url: '#',
      },
      {
        id: 'dl_3_2',
        name: 'Dashboard Quick Reference Card',
        type: 'PDF',
        size: '250 KB',
        url: '#',
      },
    ],
    quiz: [
      {
        id: 'q3_1',
        question: 'What does On-Time Resolution percentage measure?',
        options: ['Customer satisfaction', 'Complaints resolved within expected service time', 'Number of staff', 'Budget spent'],
        correctIndex: 1,
        explanation: 'On-Time Resolution shows the percentage of complaints resolved within their expected service time.',
      },
      {
        id: 'q3_2',
        question: 'How often is dashboard data updated?',
        options: ['Weekly', 'Monthly', 'Real-time', 'Annually'],
        correctIndex: 2,
        explanation: 'Dashboard data is updated in real-time as complaints are submitted and resolved.',
      },
      {
        id: 'q3_3',
        question: 'What is the county on-time resolution target?',
        options: ['50%', '70%', '85%', '100%'],
        correctIndex: 2,
        explanation: 'The county target is 85% on-time resolution.',
      },
    ],
    passingScore: 70,
  },
  {
    id: 'module_policy_feedback',
    title: 'Using Policy Feedback Tools',
    description: 'Participate in public policy consultations by reviewing proposed policies and submitting your feedback.',
    audience: ['Citizen', 'Ward Leaders'],
    topic: 'Policy Feedback',
    durationMinutes: 12,
    faqs: [
      {
        id: 'faq_4_1',
        category: 'Finding Policies',
        question: 'Where can I find policies open for feedback?',
        answer: 'Go to "Policy Feedback" from the main menu. You will see all policies currently under public consultation, with deadlines for submission.',
      },
      {
        id: 'faq_4_2',
        category: 'Finding Policies',
        question: 'What types of policies are available for comment?',
        answer: 'County budgets, development plans, by-laws, service delivery standards, and other governance documents may be posted for public input during their consultation periods.',
        isUpdated: true,
      },
      {
        id: 'faq_4_3',
        category: 'Submitting Feedback',
        question: 'How do I submit feedback on a policy?',
        answer: 'Open the policy detail page, read the summary and key clauses, then use the feedback form at the bottom. You can vote support/oppose and add written comments.',
      },
      {
        id: 'faq_4_4',
        category: 'Submitting Feedback',
        question: 'Can I comment on specific sections of a policy?',
        answer: 'Yes. When submitting feedback, you can select which clause or section your comment relates to. This helps policy makers understand feedback context.',
        isNew: true,
      },
      {
        id: 'faq_4_5',
        category: 'After Submission',
        question: 'What happens to my feedback?',
        answer: 'All feedback is compiled and reviewed by the relevant county department. Summary reports of public input may be published. Your individual comments are kept confidential unless you opt for public display.',
      },
    ],
    videos: [
      {
        id: 'vid_4_1',
        title: 'Reviewing Policy Documents',
        duration: '3:30',
        url: '#',
        audience: ['Citizen', 'Ward Leaders'],
      },
      {
        id: 'vid_4_2',
        title: 'Submitting Effective Policy Feedback',
        duration: '4:15',
        url: '#',
        audience: ['Citizen', 'Ward Leaders'],
      },
    ],
    downloads: [
      {
        id: 'dl_4_1',
        name: 'Guide to Public Participation',
        type: 'PDF',
        size: '890 KB',
        url: '#',
      },
    ],
    quiz: [
      {
        id: 'q4_1',
        question: 'Where can you find policies open for feedback?',
        options: ['My Tickets', 'Policy Feedback menu', 'Report Issue', 'Data dashboard'],
        correctIndex: 1,
        explanation: 'Go to "Policy Feedback" from the main menu to see policies under consultation.',
      },
      {
        id: 'q4_2',
        question: 'Can you comment on specific sections of a policy?',
        options: ['No, only general comments', 'Yes, by selecting the clause', 'Only staff can do this', 'Only in Kiswahili'],
        correctIndex: 1,
        explanation: 'You can select which clause or section your comment relates to.',
      },
    ],
    passingScore: 70,
  },
  {
    id: 'module_accessibility',
    title: 'Accessibility & Voice Features',
    description: 'Learn about accessibility features including voice input, screen reader support, and high-contrast modes.',
    audience: ['Citizen', 'County Staff', 'Ward Leaders'],
    topic: 'Accessibility',
    durationMinutes: 8,
    faqs: [
      {
        id: 'faq_5_1',
        category: 'Voice Features',
        question: 'How do I use voice to report issues?',
        answer: 'When creating a complaint, click the microphone icon to record your description. Speak clearly and describe the issue. Your recording is attached to the complaint for staff review.',
        isNew: true,
      },
      {
        id: 'faq_5_2',
        category: 'Voice Features',
        question: 'Is voice input available in Kiswahili?',
        answer: 'Kiswahili language support is coming soon. Currently, voice input works best with English. We are working on expanding language support.',
      },
      {
        id: 'faq_5_3',
        category: 'Screen Reader Support',
        question: 'Is the portal compatible with screen readers?',
        answer: 'Yes. The portal is designed with WCAG accessibility standards. All buttons, forms, and navigation elements have proper labels for screen readers like NVDA, JAWS, and VoiceOver.',
      },
      {
        id: 'faq_5_4',
        category: 'Visual Accessibility',
        question: 'How can I increase text size?',
        answer: 'Use your browser zoom function (Ctrl/Cmd + Plus) to increase text size. The portal is designed to remain usable at up to 200% zoom.',
      },
      {
        id: 'faq_5_5',
        category: 'Visual Accessibility',
        question: 'Is there a high-contrast mode?',
        answer: 'The portal automatically respects your device high-contrast settings. You can also use browser extensions for additional contrast adjustments.',
      },
    ],
    videos: [
      {
        id: 'vid_5_1',
        title: 'Using Voice Input Features',
        duration: '2:45',
        url: '#',
        audience: ['Citizen'],
      },
      {
        id: 'vid_5_2',
        title: 'Keyboard Navigation Guide',
        duration: '3:10',
        url: '#',
        audience: ['Citizen', 'County Staff'],
      },
    ],
    downloads: [
      {
        id: 'dl_5_1',
        name: 'Accessibility Features Overview',
        type: 'PDF',
        size: '320 KB',
        url: '#',
      },
    ],
    quiz: [
      {
        id: 'q5_1',
        question: 'How do you use voice to report issues?',
        options: ['Call a number', 'Click the microphone icon', 'Type your message', 'Send an email'],
        correctIndex: 1,
        explanation: 'Click the microphone icon when creating a complaint to record your description.',
      },
      {
        id: 'q5_2',
        question: 'Is the portal compatible with screen readers?',
        options: ['No', 'Only on mobile', 'Yes, it follows WCAG standards', 'Only in some browsers'],
        correctIndex: 2,
        explanation: 'The portal is designed with WCAG accessibility standards for screen reader support.',
      },
    ],
    passingScore: 70,
  },
  {
    id: 'module_ward_leaders',
    title: 'Ward Leader Project Monitoring',
    description: 'Guide for ward leaders on tracking infrastructure projects and community feedback in their areas.',
    audience: ['Ward Leaders'],
    topic: 'Projects',
    durationMinutes: 18,
    faqs: [
      {
        id: 'faq_6_1',
        category: 'Project Tracking',
        question: 'How do I see projects in my ward?',
        answer: 'Use the map on the home page and select your ward. All active infrastructure projects are displayed with status indicators. Click any project marker for details.',
      },
      {
        id: 'faq_6_2',
        category: 'Project Tracking',
        question: 'What project statuses are shown?',
        answer: 'Projects show: Planned (gray), Funded (blue), Procurement (purple), Works Ongoing (orange), Completed (green), and Delayed (red). Each status includes expected completion dates.',
        isNew: true,
      },
      {
        id: 'faq_6_3',
        category: 'Community Engagement',
        question: 'How do I follow projects on behalf of constituents?',
        answer: 'Click "Follow Project" on any project detail page. You will receive updates when status changes. Share project links with community members so they can follow too.',
      },
      {
        id: 'faq_6_4',
        category: 'Community Engagement',
        question: 'Can I submit feedback on projects?',
        answer: 'Yes. Each project has a Community Feedback section where you can post comments, report issues, or share constituent concerns. Your feedback is visible to project managers.',
      },
      {
        id: 'faq_6_5',
        category: 'Reporting',
        question: 'How do I generate reports for my ward?',
        answer: 'Go to the Data section and filter by your ward. You can view complaint trends, resolution rates, and active projects. Export options are available for download.',
        isUpdated: true,
      },
    ],
    videos: [
      {
        id: 'vid_6_1',
        title: 'Ward Project Dashboard Tour',
        duration: '5:20',
        url: '#',
        audience: ['Ward Leaders'],
      },
      {
        id: 'vid_6_2',
        title: 'Engaging Constituents on Projects',
        duration: '4:00',
        url: '#',
        audience: ['Ward Leaders'],
      },
    ],
    downloads: [
      {
        id: 'dl_6_1',
        name: 'Ward Leader Checklist',
        type: 'PDF',
        size: '420 KB',
        url: '#',
      },
      {
        id: 'dl_6_2',
        name: 'Project Status Definitions',
        type: 'PDF',
        size: '280 KB',
        url: '#',
      },
    ],
    quiz: [
      {
        id: 'q6_1',
        question: 'What color indicates a project is "Works Ongoing"?',
        options: ['Gray', 'Blue', 'Orange', 'Green'],
        correctIndex: 2,
        explanation: 'Orange indicates works are ongoing at the project site.',
      },
      {
        id: 'q6_2',
        question: 'How do you follow a project?',
        options: ['Email the county', 'Click "Follow Project" on the detail page', 'Call the contractor', 'Visit the site'],
        correctIndex: 1,
        explanation: 'Click "Follow Project" on any project detail page to receive updates.',
      },
      {
        id: 'q6_3',
        question: 'Where can you generate reports for your ward?',
        options: ['My Tickets', 'Report Issue', 'Data section', 'Policy Feedback'],
        correctIndex: 2,
        explanation: 'Go to the Data section and filter by your ward to view trends and reports.',
      },
    ],
    passingScore: 70,
  },
];

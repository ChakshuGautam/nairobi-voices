import { Policy } from '@/types/policy';

export const MOCK_POLICIES: Policy[] = [
  {
    id: 'POL-2025-ENV-001',
    title: 'Plastic Waste Management Policy',
    summary: 'Proposes a phased ban on single-use plastics in public areas, markets, and bus stations by 2026.',
    fullDescription: `This draft Plastic Waste Management Policy proposes a comprehensive strategy to reduce plastic pollution across Nairobi County. The policy introduces a phased ban on single-use plastics in public markets, bus termini, and county-managed facilities starting January 2026.

Key provisions include:
• Mandatory use of biodegradable packaging in all county markets
• Establishment of plastic collection and recycling centers in each sub-county
• Incentives for businesses transitioning to sustainable packaging
• Penalties for non-compliance after the transition period

The policy aims to reduce plastic waste by 60% within three years of implementation and create over 5,000 green jobs in the recycling sector.`,
    department: 'Environment & Natural Resources',
    status: 'open',
    deadline: '2025-12-28',
    documentUrl: '/docs/plastic-policy-draft-2025.pdf',
    documentName: 'Plastic Waste Management Policy Draft 2025',
    documentSize: '2.4 MB',
    publishedDate: '2025-11-15',
    clauses: [
      {
        id: 'clause-1',
        section: 'Section 1',
        title: 'Definitions and Scope',
        content: 'This policy applies to all single-use plastic items including bags, straws, cutlery, and packaging materials used within Nairobi County. "Single-use plastic" refers to any plastic product designed to be used only once before disposal or recycling.'
      },
      {
        id: 'clause-2',
        section: 'Section 2',
        title: 'Phased Implementation Timeline',
        content: 'Phase 1 (January 2026): Ban on plastic bags in all county markets and public facilities. Phase 2 (July 2026): Extension to bus termini and hawker zones. Phase 3 (January 2027): Full ban across all commercial establishments within the county.'
      },
      {
        id: 'clause-3',
        section: 'Section 3',
        title: 'Biodegradable Packaging Requirements',
        content: 'All vendors operating in county markets shall transition to certified biodegradable or compostable packaging. The County shall maintain an approved list of certified suppliers and packaging materials that meet environmental standards.'
      },
      {
        id: 'clause-4',
        section: 'Section 4',
        title: 'Recycling Infrastructure',
        content: 'The County shall establish at least one plastic collection and recycling center in each of the 17 sub-counties within 18 months of policy adoption. These centers shall operate in partnership with licensed private recyclers and community organizations.'
      },
      {
        id: 'clause-5',
        section: 'Section 5',
        title: 'Business Transition Incentives',
        content: 'Small and medium enterprises transitioning to sustainable packaging shall be eligible for: (a) Tax rebates of up to 15% on eco-friendly packaging purchases, (b) Access to low-interest loans through the County Enterprise Fund, (c) Free training on sustainable business practices.'
      },
      {
        id: 'clause-6',
        section: 'Section 6',
        title: 'Penalties and Enforcement',
        content: 'After the transition period, violations shall attract: First offense - Written warning and 7-day compliance notice. Second offense - Fine of KES 10,000 for individuals, KES 50,000 for businesses. Third offense - Fine of KES 50,000 for individuals, KES 200,000 for businesses, potential license suspension.'
      },
      {
        id: 'clause-7',
        section: 'Section 7',
        title: 'Green Jobs Initiative',
        content: 'The County commits to creating 5,000 green jobs through: recycling center employment, eco-packaging manufacturing, waste collection services, and environmental monitoring. Priority shall be given to youth and women groups in these opportunities.'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Resident of Lang\'ata',
        authorType: 'resident',
        comment: 'This is a good step, but the timeline is too short for small traders to adapt. Many kiosk owners rely on affordable plastic bags. Consider a longer transition period or subsidies for alternatives.',
        timestamp: '2025-12-09T14:10:00Z',
        reactions: { helpful: 12, insightful: 5, concern: 2 }
      },
      {
        id: 'c2',
        author: 'Kilimani Youth Network',
        authorType: 'community',
        comment: 'Consider including recycling hubs in all sub-counties. Youth groups can partner with the county to run these facilities and create employment opportunities.',
        timestamp: '2025-12-10T09:45:00Z',
        reactions: { helpful: 24, insightful: 18, concern: 0 }
      },
      {
        id: 'c3',
        author: 'Business Owner - Westlands',
        authorType: 'business',
        comment: 'My restaurant already uses paper packaging. Happy to share our supplier contacts with other businesses. The county should create a database of approved eco-friendly suppliers.',
        timestamp: '2025-12-08T11:30:00Z',
        reactions: { helpful: 31, insightful: 8, concern: 0 }
      },
      {
        id: 'c4',
        author: 'Mama Mboga - Gikomba Market',
        authorType: 'trader',
        comment: 'We need affordable alternatives before banning plastics. Paper bags tear easily and cost more. Please provide subsidies for small traders like us.',
        timestamp: '2025-12-07T08:20:00Z',
        reactions: { helpful: 45, insightful: 12, concern: 8 }
      },
      {
        id: 'c5',
        author: 'Environmental Activist - Lavington',
        authorType: 'community',
        comment: 'Long overdue! I fully support this policy. We need to protect our rivers and environment from plastic pollution. Nairobi River is choking with plastic waste.',
        timestamp: '2025-12-06T15:30:00Z',
        reactions: { helpful: 38, insightful: 22, concern: 0 }
      },
      {
        id: 'c6',
        author: 'Student - University of Nairobi',
        authorType: 'youth',
        comment: 'Can the county partner with universities for research on biodegradable alternatives? Students can contribute innovative solutions.',
        timestamp: '2025-12-05T11:00:00Z',
        reactions: { helpful: 19, insightful: 28, concern: 0 }
      },
      {
        id: 'c7',
        author: 'Supermarket Manager - Karen',
        authorType: 'business',
        comment: 'We switched to reusable bags last year. Sales of cloth bags are growing. Customers adapt when given good alternatives.',
        timestamp: '2025-12-04T14:45:00Z',
        reactions: { helpful: 33, insightful: 15, concern: 0 }
      }
    ],
    engagement: {
      supportCount: 156,
      opposeCount: 23,
      commentCount: 7
    }
  },
  {
    id: 'POL-2025-TRN-002',
    title: 'Matatu Stage Improvement Guidelines',
    summary: 'New standards for matatu termini including safety requirements, passenger amenities, and traffic flow management.',
    fullDescription: `The Matatu Stage Improvement Guidelines establish minimum standards for all public service vehicle termini within Nairobi County. This policy responds to citizen feedback about overcrowding, safety concerns, and poor facilities at major bus stages.

Key provisions include:
• Mandatory shelter structures with seating at all designated stages
• Proper lighting and CCTV coverage for security
• Clear lane markings and traffic flow patterns
• Public toilet facilities within 100 meters of major stages
• Designated hawking zones to reduce congestion

Implementation will begin with major termini (Railways, Kencom, Ngong Road) and expand to all stages within 18 months.`,
    department: 'Transport & Infrastructure',
    status: 'open',
    deadline: '2026-01-15',
    documentUrl: '/docs/matatu-stage-guidelines-2025.pdf',
    documentName: 'Matatu Stage Improvement Guidelines',
    documentSize: '1.8 MB',
    publishedDate: '2025-12-01',
    clauses: [
      {
        id: 'trn-clause-1',
        section: 'Section 1',
        title: 'Shelter and Seating Requirements',
        content: 'All designated matatu stages shall have covered shelter structures capable of accommodating at least 50 passengers. Seating shall be provided for a minimum of 20 passengers, with priority seats clearly marked for elderly, pregnant women, and persons with disabilities.'
      },
      {
        id: 'trn-clause-2',
        section: 'Section 2',
        title: 'Security and Lighting Standards',
        content: 'Each stage shall have adequate lighting (minimum 50 lux) operational from 6PM to 6AM. CCTV cameras shall be installed at all major termini covering boarding areas, with footage retained for 30 days. Security personnel presence required at major stages during peak hours.'
      },
      {
        id: 'trn-clause-3',
        section: 'Section 3',
        title: 'Traffic Flow and Lane Markings',
        content: 'Clear lane markings shall designate: (a) Vehicle entry points, (b) Passenger boarding zones, (c) Vehicle exit routes, (d) Pedestrian walkways. No parking or loading shall occur outside designated zones.'
      },
      {
        id: 'trn-clause-4',
        section: 'Section 4',
        title: 'Sanitation Facilities',
        content: 'Public toilet facilities shall be available within 100 meters of all major stages. Facilities shall be gender-segregated, accessible to persons with disabilities, and maintained to hygiene standards set by the County Health Department.'
      },
      {
        id: 'trn-clause-5',
        section: 'Section 5',
        title: 'Hawking Zones',
        content: 'Designated hawking zones shall be established at approved distances from boarding areas to prevent congestion. Registered hawkers shall receive permits and allocated spaces. Vending activities outside designated zones shall attract penalties.'
      },
      {
        id: 'trn-clause-6',
        section: 'Section 6',
        title: 'Implementation Timeline',
        content: 'Phase 1 (0-6 months): Major termini - Railways, Kencom, Ngong Road, Eastleigh. Phase 2 (6-12 months): Secondary stages - Buruburu, Kayole, Rongai, Kitengela. Phase 3 (12-18 months): All remaining designated stages.'
      }
    ],
    comments: [
      {
        id: 'c8',
        author: 'Daily Commuter - Umoja',
        authorType: 'resident',
        comment: 'Finally! The Eastlands stages are chaotic. Please prioritize Buruburu and Dandora stages. We need proper shelters especially during rainy season.',
        timestamp: '2025-12-07T07:15:00Z',
        reactions: { helpful: 45, insightful: 3, concern: 0 }
      },
      {
        id: 'c9',
        author: 'Matatu Sacco Representative',
        authorType: 'business',
        comment: 'We support this initiative. Request that saccos be consulted on lane markings and loading zones to ensure smooth operations.',
        timestamp: '2025-12-06T16:00:00Z',
        reactions: { helpful: 18, insightful: 12, concern: 5 }
      },
      {
        id: 'c10',
        author: 'Hawker - CBD',
        authorType: 'trader',
        comment: 'Please consider us hawkers in the designated zones. We also need to earn a living. Include us in the planning.',
        timestamp: '2025-12-05T09:30:00Z',
        reactions: { helpful: 52, insightful: 8, concern: 3 }
      },
      {
        id: 'c11',
        author: 'Woman Commuter - Kayole',
        authorType: 'resident',
        comment: 'Security is my main concern. CCTV and proper lighting will help. Too many incidents happen at dark stages late evening.',
        timestamp: '2025-12-04T18:20:00Z',
        reactions: { helpful: 67, insightful: 15, concern: 0 }
      },
      {
        id: 'c12',
        author: 'PWD Advocate',
        authorType: 'community',
        comment: 'Please include accessibility features for persons with disabilities. Ramps, tactile paving, and priority seating areas are essential.',
        timestamp: '2025-12-03T10:00:00Z',
        reactions: { helpful: 41, insightful: 35, concern: 0 }
      },
      {
        id: 'c13',
        author: 'Boda Boda Rider - Ngara',
        authorType: 'business',
        comment: 'What about motorcycle parking areas near stages? We provide last-mile transport and need designated waiting zones too.',
        timestamp: '2025-12-02T14:30:00Z',
        reactions: { helpful: 28, insightful: 18, concern: 2 }
      }
    ],
    engagement: {
      supportCount: 234,
      opposeCount: 12,
      commentCount: 6
    }
  },
  {
    id: 'POL-2025-HSG-003',
    title: 'Affordable Housing Allocation Framework',
    summary: 'Criteria and process for allocating county-built affordable housing units to qualifying residents.',
    fullDescription: `This framework establishes transparent criteria for the allocation of affordable housing units constructed under the Nairobi County Housing Program. The policy aims to ensure fair access to housing for low and middle-income residents.

Allocation criteria include:
• Residency requirement (minimum 5 years in Nairobi)
• Income threshold (household income below KES 100,000/month)
• First-time homebuyer preference
• Special consideration for persons with disabilities
• Points system based on family size and housing need

The framework also establishes an appeals process and anti-corruption measures to ensure transparency.`,
    department: 'Housing & Urban Development',
    status: 'closing_soon',
    deadline: '2025-12-18',
    documentUrl: '/docs/housing-allocation-framework.pdf',
    documentName: 'Affordable Housing Allocation Framework',
    documentSize: '3.1 MB',
    publishedDate: '2025-11-01',
    clauses: [
      {
        id: 'hsg-clause-1',
        section: 'Section 1',
        title: 'Eligibility - Residency Requirement',
        content: 'Applicants must demonstrate continuous residency in Nairobi County for a minimum of five (5) years. Proof includes: utility bills, tenancy agreements, employer letters, chief/ward administrator certificates, or affidavits from two witnesses known to county administration.'
      },
      {
        id: 'hsg-clause-2',
        section: 'Section 2',
        title: 'Eligibility - Income Threshold',
        content: 'Household gross income shall not exceed KES 100,000 per month. Verification through: payslips, bank statements, tax returns, or sworn income declaration for informal sector workers. Joint applications shall combine both incomes.'
      },
      {
        id: 'hsg-clause-3',
        section: 'Section 3',
        title: 'Priority Categories',
        content: 'Priority allocation (additional points): (a) First-time homebuyers - 20 points, (b) Persons with disabilities - 15 points, (c) Single parents with dependents - 10 points, (d) Elderly citizens (65+) - 10 points, (e) Essential workers (health, education, security) - 5 points.'
      },
      {
        id: 'hsg-clause-4',
        section: 'Section 4',
        title: 'Points-Based Allocation System',
        content: 'Applicants scored on: years of residency (max 25 points), household size (max 20 points), current housing conditions (max 20 points), priority category bonuses (max 30 points), employment stability (max 5 points). Minimum qualifying score: 50 points.'
      },
      {
        id: 'hsg-clause-5',
        section: 'Section 5',
        title: 'Appeals Process',
        content: 'Unsuccessful applicants may appeal within 30 days of notification. Appeals reviewed by independent Housing Appeals Tribunal comprising: one county official, one civil society representative, and one community representative. Decisions final and binding.'
      },
      {
        id: 'hsg-clause-6',
        section: 'Section 6',
        title: 'Anti-Corruption Measures',
        content: 'All applications processed through transparent digital system with audit trail. Allocation lists published publicly before unit handover. Whistleblower hotline established. Officials found guilty of corruption face dismissal and prosecution. Beneficiaries who obtained units fraudulently forfeit units and face prosecution.'
      }
    ],
    comments: [
      {
        id: 'c14',
        author: 'Resident of Mathare',
        authorType: 'resident',
        comment: 'The 5-year residency requirement is fair. But how will you verify this? Many of us don\'t have formal documentation of our stay in informal settlements.',
        timestamp: '2025-12-05T10:20:00Z',
        reactions: { helpful: 67, insightful: 23, concern: 15 }
      },
      {
        id: 'c15',
        author: 'Single Mother - Kibera',
        authorType: 'resident',
        comment: 'Please prioritize single mothers and widows. We struggle the most with housing. Our children deserve better living conditions.',
        timestamp: '2025-12-04T08:45:00Z',
        reactions: { helpful: 89, insightful: 12, concern: 0 }
      },
      {
        id: 'c16',
        author: 'Youth Leader - Korogocho',
        authorType: 'youth',
        comment: 'What about young people who were born here but parents don\'t have documents? We are Nairobians too and deserve consideration.',
        timestamp: '2025-12-03T16:00:00Z',
        reactions: { helpful: 54, insightful: 31, concern: 0 }
      },
      {
        id: 'c17',
        author: 'Civil Society Representative',
        authorType: 'community',
        comment: 'The anti-corruption measures are good but need independent oversight. Consider involving civil society in the allocation process.',
        timestamp: '2025-12-02T11:30:00Z',
        reactions: { helpful: 43, insightful: 38, concern: 5 }
      },
      {
        id: 'c18',
        author: 'Tenant - Eastleigh',
        authorType: 'resident',
        comment: 'Income threshold is reasonable. But please verify carefully to prevent rich people from pretending to qualify.',
        timestamp: '2025-12-01T09:15:00Z',
        reactions: { helpful: 61, insightful: 8, concern: 12 }
      },
      {
        id: 'c19',
        author: 'Teacher - Dandora',
        authorType: 'resident',
        comment: 'Will civil servants like teachers qualify? Our salaries are known but housing is still unaffordable for us.',
        timestamp: '2025-11-30T14:00:00Z',
        reactions: { helpful: 35, insightful: 22, concern: 0 }
      },
      {
        id: 'c20',
        author: 'Elder - Pumwani',
        authorType: 'resident',
        comment: 'Good policy but what about elderly citizens who have lived here all their lives? We need ground floor units due to mobility issues.',
        timestamp: '2025-11-29T10:30:00Z',
        reactions: { helpful: 72, insightful: 18, concern: 0 }
      },
      {
        id: 'c21',
        author: 'Healthcare Worker - Kenyatta Hospital',
        authorType: 'resident',
        comment: 'Essential workers should get some priority. We serve the city but can\'t afford to live near our workplaces.',
        timestamp: '2025-11-28T07:00:00Z',
        reactions: { helpful: 48, insightful: 25, concern: 0 }
      }
    ],
    engagement: {
      supportCount: 412,
      opposeCount: 45,
      commentCount: 8
    }
  },
  {
    id: 'POL-2025-HLT-004',
    title: 'Community Health Worker Stipend Review',
    summary: 'Proposed increase in monthly stipends for community health volunteers serving in county facilities.',
    fullDescription: `This policy review proposes adjustments to the monthly stipend for Community Health Workers (CHWs) serving in Nairobi County. CHWs play a critical role in primary healthcare delivery, especially in informal settlements and underserved areas.

Proposed changes:
• Increase base stipend from KES 2,500 to KES 5,000 per month
• Performance bonuses for immunization and referral targets
• Medical insurance coverage for all registered CHWs
• Training and certification pathways
• Equipment and supplies budget per CHW

The review responds to feedback from CHWs about inadequate compensation relative to their workload and responsibilities.`,
    department: 'Health Services',
    status: 'closed',
    deadline: '2025-11-30',
    documentUrl: '/docs/chw-stipend-review.pdf',
    documentName: 'CHW Stipend Review 2025',
    documentSize: '1.2 MB',
    publishedDate: '2025-10-15',
    clauses: [
      {
        id: 'hlt-clause-1',
        section: 'Section 1',
        title: 'Base Stipend Increase',
        content: 'The monthly base stipend for registered Community Health Workers shall be increased from KES 2,500 to KES 5,000, effective from the first month following policy adoption. Payment shall be made through mobile money or bank transfer by the 5th of each month.'
      },
      {
        id: 'hlt-clause-2',
        section: 'Section 2',
        title: 'Performance Bonuses',
        content: 'CHWs meeting quarterly targets shall receive bonuses: (a) Immunization coverage above 90% - KES 2,000 bonus, (b) Successful referrals leading to treatment - KES 500 per case, (c) Community health education sessions - KES 300 per session (max 10/month).'
      },
      {
        id: 'hlt-clause-3',
        section: 'Section 3',
        title: 'Medical Insurance Coverage',
        content: 'All registered CHWs shall be enrolled in NHIF or equivalent medical insurance scheme. Premium payments covered by the County. Coverage extends to CHW only; dependents may be added at CHW cost. Enrollment within 60 days of registration.'
      },
      {
        id: 'hlt-clause-4',
        section: 'Section 4',
        title: 'Training and Certification',
        content: 'The County shall provide: (a) Initial 2-week certification training for new CHWs, (b) Quarterly refresher trainings, (c) Specialized modules (maternal health, TB, HIV, nutrition), (d) Certificate recognized for healthcare employment pathways.'
      },
      {
        id: 'hlt-clause-5',
        section: 'Section 5',
        title: 'Equipment and Supplies',
        content: 'Each CHW shall receive: branded uniform and ID badge, basic medical kit (thermometer, blood pressure monitor, first aid supplies), reporting forms and registers, mobile phone with data bundle for reporting, and bicycle or transport allowance for rural areas.'
      }
    ],
    comments: [
      {
        id: 'c22',
        author: 'Community Health Worker - Mukuru',
        authorType: 'resident',
        comment: 'Thank you for listening to us. The current stipend is too low for the work we do. We visit dozens of homes daily.',
        timestamp: '2025-11-25T08:00:00Z',
        reactions: { helpful: 95, insightful: 8, concern: 0 }
      },
      {
        id: 'c23',
        author: 'CHW Supervisor - Kawangware',
        authorType: 'community',
        comment: 'Insurance coverage is crucial. Many CHWs get sick from exposure during home visits but can\'t afford treatment.',
        timestamp: '2025-11-24T11:30:00Z',
        reactions: { helpful: 78, insightful: 32, concern: 0 }
      },
      {
        id: 'c24',
        author: 'Village Elder - Huruma',
        authorType: 'community',
        comment: 'CHWs are the backbone of community health. They deserve proper pay. I support this policy fully.',
        timestamp: '2025-11-23T09:00:00Z',
        reactions: { helpful: 56, insightful: 12, concern: 0 }
      },
      {
        id: 'c25',
        author: 'Mother - Kangemi',
        authorType: 'resident',
        comment: 'Our CHW saved my baby\'s life by referring us to hospital early. They deserve better pay for their dedication.',
        timestamp: '2025-11-22T14:15:00Z',
        reactions: { helpful: 112, insightful: 5, concern: 0 }
      },
      {
        id: 'c26',
        author: 'Public Health Officer',
        authorType: 'community',
        comment: 'Training pathways will professionalize CHW work. Consider certificates that can lead to formal healthcare careers.',
        timestamp: '2025-11-21T10:00:00Z',
        reactions: { helpful: 44, insightful: 48, concern: 0 }
      }
    ],
    engagement: {
      supportCount: 567,
      opposeCount: 8,
      commentCount: 5
    }
  }
];

export function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getSupportPercentage(engagement: { supportCount: number; opposeCount: number }): number {
  const total = engagement.supportCount + engagement.opposeCount;
  if (total === 0) return 0;
  return Math.round((engagement.supportCount / total) * 100);
}

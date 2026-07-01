# Nairobi City County Citizen Engagement Platform
## Product Case Study

---

## 1. Context & Problem

### Institutional Context
Nairobi City County government receives citizen complaints through fragmented channels—walk-in offices, social media, call centers, and paper forms. No unified system tracks issue resolution, measures departmental performance, or provides citizens visibility into their submissions.

### Operational Gaps
- **No standard workflow**: Complaints are logged inconsistently across departments. Resolution times are unmeasured. Escalation paths are informal.
- **No citizen feedback loop**: Citizens submit issues but receive no status updates. They cannot verify whether action was taken.
- **No aggregate visibility**: County leadership lacks real-time data on complaint volumes, resolution rates, or geographic distribution of issues.

### Access Barriers
- **Literacy constraints**: Traditional text-based forms exclude citizens who cannot read or write fluently.
- **Device constraints**: Many residents use low-cost Android phones with limited data plans.
- **Disability exclusion**: Standard web interfaces lack screen reader compatibility or voice interaction.

### Transparency Deficit
Citizens cannot see how public funds are spent on infrastructure projects or track project timelines against commitments.

---

## 2. Personas

The prototype addresses six distinct user types:

| Persona | Role | Primary Need |
|---------|------|--------------|
| **Citizen** | Nairobi resident reporting issues | Submit complaints accessibly; track resolution status; see government activity in their ward |
| **First-Mile Employee** | Field officer or frontline staff | Receive assigned tickets; update status; add remarks; close resolved issues |
| **Government Manager** | Department head or supervisor | Monitor team performance; identify bottlenecks; generate reports for leadership |
| **Policy Actor** | County executive or elected official | Understand service delivery trends; make data-informed resource allocation decisions |
| **Civil Society** | NGO, community organization, media | Access aggregate service data for accountability monitoring |
| **Funder** | Development partner or donor | Evaluate platform adoption; measure civic engagement outcomes |

---

## 3. What Was Built

### Core Modules

**Issue Reporting System**
- Multi-modal input: voice recording (Web Speech API), text, photo upload
- Map-based location selection with automatic ward detection
- Category taxonomy: Roads, Water, Waste, Streetlights, Noise, Drainage
- Intent classification: Complaint vs. Appreciation
- Optional service quality rating (1-5 stars)

**Ticket Management Interface**
- Unified dashboard for citizens and government staff
- Status workflow: New → Assigned → In Progress → Resolved → Closed
- SLA countdown timers per ticket
- Threaded remarks between citizens and officials
- Complete audit trail with actor, action, timestamp

**Civic Activity Feed ("What's Happening Around You")**
- Ward-filtered feed of government projects, notices, events
- Project detail view with timeline, budget, and status
- Community comment system with anonymous option
- "Read Aloud" accessibility feature

**Service Analytics Dashboard**
- 11 KPI visualizations across complaint lifecycle
- Filters: location (sub-county/ward), time range, category, source
- Metrics include: Total Complaints, Closed Complaints, SLA Achievement %, Completion Rate, Average Solution Time, Unique Citizens

**Active Surveys**
- Location-aware surveys (flood hotspots, garbage hotspots)
- Anonymous response option
- Aggregate results display

---

## 4. How It Works (User Journeys)

### Journey 1: Citizen Reports an Issue

1. Citizen opens platform on mobile device
2. Selects location by tapping map or using GPS
3. System auto-detects ward from coordinates
4. Citizen chooses category (e.g., "Garbage Collection")
5. Citizen records voice description or types text
6. Citizen optionally uploads photo
7. Citizen optionally rates current service quality
8. System generates ticket ID and confirms submission
9. Ticket appears in "My Tickets" with status "New"

### Journey 2: First-Mile Employee Resolves Issue

1. Employee logs into dashboard
2. Views tickets assigned to their department
3. Filters by status, ward, or category
4. Opens ticket to view description, photo, location
5. Updates status to "In Progress"
6. Adds remark describing action taken
7. Marks ticket "Resolved" when complete
8. Citizen receives notification of resolution

### Journey 3: Government Manager Reviews Performance

1. Manager opens Service Analytics dashboard
2. Applies filters: last 30 days, their sub-county
3. Reviews SLA Achievement % across departments
4. Identifies category with highest complaint volume
5. Drills into Status by Boundary table
6. Exports data for executive briefing

### Journey 4: Citizen Tracks Government Project

1. Citizen opens "Happenings" feed
2. Filters by their ward
3. Views infrastructure project card
4. Opens project detail drawer
5. Reviews timeline: which stages complete, which pending
6. Reads community comments
7. Adds own feedback with "How are you affected?" tag
8. Follows project to receive future updates

---

## 5. Data & Design Principles

### Hyperlocal Focus
All content is tagged to Kenya's three-tier administrative hierarchy: Sub-county → Ward → Zone. This enables:
- Citizens to see only relevant local activity
- Managers to compare performance across administrative units
- Policy actors to identify geographic disparities

### Access to Own Data
Citizens can view their complete submission history, including:
- All tickets they've filed
- Status progression timeline
- Official responses and remarks

This shifts the relationship from "submit and hope" to "submit and track."

### Triangulation
The platform collects the same service delivery signal from multiple sources:
- Citizen complaints (bottom-up)
- Staff status updates (operational)
- Survey responses (structured sampling)
- Project tracking (top-down commitments)

Cross-referencing these signals reveals discrepancies between reported progress and citizen experience.

### Time-to-Insight
Dashboard visualizations are pre-computed, not query-on-demand. Managers see current performance metrics immediately, without requesting reports from IT.

### Accessibility by Default
- Voice input removes literacy barrier
- Large touch targets support users with motor impairments
- "Read Aloud" button serves visually impaired users
- Minimal data consumption for low-bandwidth environments

---

## 6. Outcomes Enabled (by Persona)

### Citizen
- **Before**: Submits complaint with no confirmation, no tracking, no response
- **After**: Receives ticket ID, views status updates, reads official remarks, knows when issue is resolved

### First-Mile Employee
- **Before**: Receives verbal or paper-based complaints, no structured workflow, no audit trail
- **After**: Works from prioritized queue, updates status in real-time, remarks are logged with timestamps

### Government Manager
- **Before**: Requests monthly reports compiled manually, data is weeks old, no drill-down capability
- **After**: Views live dashboards, filters by any dimension, identifies bottlenecks same-day

### Policy Actor
- **Before**: Relies on anecdotal reports of service quality, no geographic comparison
- **After**: Accesses aggregate trends, compares wards, sees which categories are under-resourced

### Civil Society
- **Before**: Files Right to Information requests for basic service data
- **After**: Views public dashboard with aggregate complaint statistics (no personal data exposed)

### Funder
- **Before**: Evaluates program impact through periodic surveys
- **After**: Monitors adoption metrics (unique citizens, submission volume, resolution rates) continuously

---

## 7. Limitations & Open Questions

### What the Prototype Does Not Solve

| Gap | Description |
|-----|-------------|
| **Authentication** | No user registration or login. Citizens cannot securely access their tickets across devices. |
| **Notifications** | No push notifications or SMS alerts. Citizens must manually check status. |
| **Offline Mode** | Requires internet connectivity. Does not function in low-coverage areas. |
| **Backend Integration** | Uses mock data. Not connected to live DIGIT PGR or county databases. |
| **Language** | English only. No Swahili interface. |
| **Photo Verification** | No mechanism to verify submitted photos are genuine or geotagged correctly. |
| **Escalation Automation** | Escalation is manual. No automatic SLA breach alerts. |

### Open Assumptions

1. **Citizens will adopt voice input**: Assumes users are comfortable speaking complaints aloud, potentially in public.
2. **Government staff will update tickets**: Assumes workflow compliance without enforcement mechanisms.
3. **Ward boundaries are accurate**: Relies on GIS data for auto-detection; boundary disputes may cause errors.
4. **Categories are sufficient**: Current taxonomy may not cover all complaint types citizens want to report.

---

## 8. Signals & Metrics

If deployed in production, this prototype would generate the following measurable signals:

### Adoption Metrics
| Metric | Definition |
|--------|------------|
| Unique Citizens | Count of distinct users filing at least one complaint in time period |
| New vs. Returning Users | First-time submitters vs. repeat users |
| Submission Volume | Total complaints received per day/week/month |
| Channel Distribution | % of submissions via mobile app, web portal, walk-in, call center |
| Voice vs. Text | % of descriptions submitted via voice recording |

### Performance Metrics
| Metric | Definition |
|--------|------------|
| SLA Achievement % | Complaints resolved within target time / Total Complaints × 100 |
| Average Solution Time | Mean days from submission to resolution |
| Completion Rate | Closed Complaints / Total Complaints × 100 |
| Reopened Rate | Complaints reopened by citizen / Total Closed × 100 |

### Engagement Metrics
| Metric | Definition |
|--------|------------|
| Project Followers | Citizens tracking specific infrastructure projects |
| Comment Volume | Community feedback submissions per project |
| Survey Response Rate | Completed surveys / Survey invitations × 100 |

### Geographic Metrics
| Metric | Definition |
|--------|------------|
| Complaints by Ward | Distribution of submissions across administrative units |
| Resolution by Ward | SLA achievement compared across wards |
| Underserved Wards | Wards with high complaint volume and low resolution rate |

### Operational Metrics
| Metric | Definition |
|--------|------------|
| Staff Response Time | Time from assignment to first status update |
| Escalation Rate | % of tickets requiring escalation to resolve |
| Department Load | Complaints per department per time period |

---

## Document Information

**Version**: 2.0  
**Date**: January 2026  
**Status**: Functional Prototype (Mock Data)  
**Platform**: Web application (React, TypeScript, Tailwind CSS)  
**Target Deployment**: Nairobi City County, Kenya  

---

*This document describes the current state of a working prototype. Features described are implemented in code but use simulated data. Production deployment would require backend integration, user authentication, and policy approvals.*

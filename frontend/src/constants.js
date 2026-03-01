// Category display colours — matches PRD §9
export const CATEGORY_COLORS = {
    Hackathon: '#a78bfa',
    Seminar: '#60a5fa',
    Workshop: '#22d3ee',
    Placement: '#4ade80',
    Exam: '#f87171',
    Cultural: '#f472b6',
    Sports: '#fb923c',
    Deadline: '#fbbf24',
    General: '#94a3b8',
    Raw: '#64748b',
};

// All categories in display order
export const CATEGORIES = [
    'Raw', 'Hackathon', 'Seminar', 'Workshop', 'Placement',
    'Exam', 'Cultural', 'Sports', 'Deadline', 'General',
];

// Branch options
export const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'Other'];

// Category urgency for same-date tiebreak (lower = higher priority)
export const CATEGORY_URGENCY = {
    Exam: 0,
    Deadline: 1,
    Placement: 2,
};

// Backend base URL — uses Vite proxy in dev, env var in production
export const API_BASE = import.meta.env.VITE_API_URL || '';

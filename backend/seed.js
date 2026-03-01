const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const EVENTS_FILE = path.join(__dirname, 'src/data/events.json');

const mockEvents = [
    {
        id: uuidv4(),
        event_name: "CodeRush Hackathon 2026",
        category: "Hackathon",
        branch: "CSE",
        date_iso: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later (Urgent)
        venue: "Main Audi, Block C",
        description: "The biggest coding showdown of the semester. 24 hours of building, caffeine, and prizes worth 50k INR. Teams of 2-4 allowed. Bring your own laptops.",
        registration_link: "https://forms.gle/coderush2026",
        group: "Technical Events — CSE",
        sender: "Rahul (Coord)",
        timestamp: new Date().toISOString(),
        original_text: "Hey guys! Register for CodeRush Hackathon happening this week! Forms close in 24h."
    },
    {
        id: uuidv4(),
        event_name: "Google Cloud Skill Boost Workshop",
        category: "Workshop",
        branch: "All",
        date_iso: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow (Urgent)
        venue: "Lab 4, IT Block",
        description: "Hands-on session on Vertex AI and Gemini API. Learn how to build generative AI apps. Limited seats (40 only). First come first served.",
        registration_link: "https://gdsc.campus/events/gcp-workshop",
        group: "GDSC Official",
        sender: "Ishita GDSC Lead",
        timestamp: new Date().toISOString(),
        original_text: "GDSC Workshop on AI. Tomorrow at Lab 4. Register now!"
    },
    {
        id: uuidv4(),
        event_name: "TCS Ninja / Digital Hiring Drive",
        category: "Placement",
        branch: "CSE+ECE+EE",
        date_iso: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days later
        venue: "Placement Cell",
        description: "On-campus drive for 2026 graduates. Eligibility: 6.5 CGPA +, no active backlogs. PPT starts at 9 AM sharp. Formal attire mandatory.",
        registration_link: "https://tcs.com/careers/india",
        group: "Placement Cell 2026",
        sender: "Dr. Sharma (TPO)",
        timestamp: new Date().toISOString(),
        original_text: "TCS is coming on the 6th. Check the portal for details."
    },
    {
        id: uuidv4(),
        event_name: "End Sem Practical Exam Schedule",
        category: "Exam",
        branch: "ECE",
        date_iso: new Date(Date.now() + 86400000 * 0.5).toISOString(), // Today later
        venue: "Microprocessor Lab",
        description: "Practical examinations for EC602 (MPMC) will commence from today. Batch lists are posted on the notice board. Carry your record books.",
        registration_link: null,
        group: "ECE 3rd Year Official",
        sender: "Prof. Gupta",
        timestamp: new Date().toISOString(),
        original_text: "ECE Practicals starting today! Labs are open."
    },
    {
        id: uuidv4(),
        event_name: "Cultural Night 'Sanskriti'",
        category: "Cultural",
        branch: "All",
        date_iso: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days later
        venue: "Open Air Theatre (OAT)",
        description: "Celebrate the spirit of diversity with mesmerizing dance performances, music, and traditional fashion show. Food stalls open from 5 PM.",
        registration_link: null,
        group: "Cultural Committee",
        sender: "Priya (Sec)",
        timestamp: new Date().toISOString(),
        original_text: "Don't miss Sanskriti 2026! Next week at OAT."
    }
];

async function seed() {
    console.log('🌱 Seeding mock data for CampusSync...');
    await fs.writeFile(EVENTS_FILE, JSON.stringify(mockEvents, null, 2));
    console.log('✅ events.json seeded with 5 events.');
}

seed();

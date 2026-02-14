const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory database
let events = [
    {
        id: 1,
        title: 'Python Workshop',
        description: 'Learn Python programming from scratch with hands-on exercises',
        category: 'coding',
        date: '2024-06-15',
        time: '09:00:00',
        venue: 'Tech Innovation Center',
        speaker: 'Dr. Sarah Chen',
        max_participants: 50,
        current_participants: 5,
        registration_fee: 49.99
    },
    {
        id: 2,
        title: 'Gaming Tournament',
        description: 'E-sports competition with prizes for winners',
        category: 'gaming',
        date: '2024-06-22',
        time: '18:00:00',
        venue: 'Gaming Arena',
        speaker: 'Pro Gamer Mike',
        max_participants: 100,
        current_participants: 25,
        registration_fee: 25.00
    },
    {
        id: 3,
        title: 'Cyber Security Summit',
        description: 'Learn about latest security threats and protection',
        category: 'cyber_security',
        date: '2024-07-10',
        time: '10:00:00',
        venue: 'Convention Center',
        speaker: 'Security Expert Alex',
        max_participants: 200,
        current_participants: 45,
        registration_fee: 199.99
    },
    {
        id: 4,
        title: 'Tech Communication',
        description: 'Improve your presentation and communication skills',
        category: 'communication',
        date: '2024-07-25',
        time: '13:30:00',
        venue: 'Business Center',
        speaker: 'Lisa Thompson',
        max_participants: 40,
        current_participants: 12,
        registration_fee: 79.99
    }
];

let registrations = [
    {
        id: 1,
        event_id: 1,
        full_name: 'John Smith',
        email: 'john@example.com',
        phone: '555-0101',
        registration_date: new Date().toISOString()
    },
    {
        id: 2,
        event_id: 1,
        full_name: 'Emma Johnson',
        email: 'emma@example.com',
        phone: '555-0102',
        registration_date: new Date().toISOString()
    }
];

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
    res.json(events);
});

// Get single event
app.get('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.id));
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
});

// Create new event
app.post('/api/events', (req, res) => {
    const newEvent = {
        id: events.length + 1,
        ...req.body,
        current_participants: 0
    };
    events.push(newEvent);
    res.json({ success: true, data: newEvent });
});

// Get all registrations
app.get('/api/registrations', (req, res) => {
    // Join with events to get event titles
    const registrationsWithEvents = registrations.map(reg => ({
        ...reg,
        event_title: events.find(e => e.id === reg.event_id)?.title
    }));
    res.json(registrationsWithEvents);
});

// Create new registration
app.post('/api/registrations', (req, res) => {
    const { event_id, full_name, email, phone } = req.body;
    
    // Check if event exists
    const event = events.find(e => e.id === parseInt(event_id));
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is full
    if (event.current_participants >= event.max_participants) {
        return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if email already registered
    const existingReg = registrations.find(r => 
        r.event_id === parseInt(event_id) && r.email === email
    );
    if (existingReg) {
        return res.status(400).json({ error: 'Email already registered for this event' });
    }
    
    // Create registration
    const newRegistration = {
        id: registrations.length + 1,
        event_id: parseInt(event_id),
        full_name,
        email,
        phone,
        registration_date: new Date().toISOString()
    };
    registrations.push(newRegistration);
    
    // Update event participant count
    event.current_participants = (event.current_participants || 0) + 1;
    
    res.json({ success: true, data: newRegistration });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        time: new Date().toISOString(),
        events: events.length,
        registrations: registrations.length
    });
});

// Serve frontend pages
app.get(['/', '/index.html', '/events.html', '/create-event.html', '/registrations.html',
     '/dashboard.html', '/login.html', '/register.html'], (req, res) => {
    const page = req.path === '/' ? 'index.htm' : req.path.substring(1);
    res.sendFile(path.join(__dirname, '../frontend', page));
});

// Catch all - serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/events`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log('=================================');
});
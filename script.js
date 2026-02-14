// API URL
const API_URL = 'http://localhost:3000/api';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // Setup navigation
    setupNavigation();
    
    // Load data based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'events.html':
            loadEvents();
            setupEventListeners();
            break;
        case 'create-event.html':
            setupCreateEventForm();
            break;
        case 'registrations.html':
            loadEventOptions();
            loadRegistrations();
            setupRegistrationForm();
            break;
        case 'dashboard.html':
            loadDashboardData();
            break;
        case 'login.html':
            setupLoginForm();
            break;
        case 'register.html':
            setupRegisterForm();
            break;
        default:
            // Home page - load featured events
            loadFeaturedEvents();
    }
});

// Setup navigation
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
            navMenu?.classList.remove('active');
        }
    });
}

// Load all events
async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        showError('Failed to load events');
    }
}

// Display events in grid
function displayEvents(events) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<p class="no-events">No events found</p>';
        return;
    }
    
    container.innerHTML = events.map(event => `
        <div class="event-card" onclick="viewEvent(${event.id})">
            <div class="event-header ${event.category}">
                <h3>${event.title}</h3>
                <p>${event.category}</p>
            </div>
            <div class="event-content">
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <span><i class="fas fa-calendar"></i> ${event.date}</span>
                    <span><i class="fas fa-users"></i> ${event.current_participants || 0}/${event.max_participants}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load featured events for home page
async function loadFeaturedEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        displayFeaturedEvents(events.slice(0, 3));
    } catch (error) {
        console.error('Error loading featured events:', error);
    }
}

function displayFeaturedEvents(events) {
    // This could be used to show featured events on home page
    console.log('Featured events:', events);
}

// View single event
function viewEvent(id) {
    window.location.href = `event-detail.html?id=${id}`;
}

// Setup create event form
function setupCreateEventForm() {
    const form = document.getElementById('createEventForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const eventData = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            category: document.getElementById('eventCategory').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            venue: document.getElementById('eventVenue').value,
            speaker: document.getElementById('eventSpeaker').value,
            max_participants: parseInt(document.getElementById('maxParticipants').value),
            registration_fee: parseFloat(document.getElementById('eventFee').value) || 0
        };
        
        try {
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Event created successfully!');
                window.location.href = 'events.html';
            } else {
                alert('Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event');
        }
    });
}

// Load event options for registration dropdown
async function loadEventOptions() {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        
        const select = document.getElementById('registerEvent');
        if (select) {
            select.innerHTML = '<option value="">Select an event</option>' +
                events.map(event => `<option value="${event.id}">${event.title} (${event.date})</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading event options:', error);
    }
}

// Setup registration form
function setupRegistrationForm() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const regData = {
            event_id: document.getElementById('registerEvent').value,
            full_name: document.getElementById('participantName').value,
            email: document.getElementById('participantEmail').value,
            phone: document.getElementById('participantPhone').value
        };
        
        if (!regData.event_id) {
            alert('Please select an event');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Registration successful!');
                form.reset();
                loadRegistrations(); // Refresh the list
            } else {
                alert(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('Error registering');
        }
    });
}

// Load registrations
async function loadRegistrations() {
    try {
        const response = await fetch(`${API_URL}/registrations`);
        const registrations = await response.json();
        displayRegistrations(registrations);
    } catch (error) {
        console.error('Error loading registrations:', error);
    }
}

// Display registrations in table
function displayRegistrations(registrations) {
    const tbody = document.getElementById('registrationsTable');
    if (!tbody) return;
    
    if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center">No registrations found</td></tr>';
        return;
    }
    
    tbody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${reg.id}</td>
            <td>${reg.full_name}</td>
            <td>${reg.event_title || 'N/A'}</td>
            <td>${reg.email}</td>
            <td>${new Date(reg.registration_date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load events
        const eventsResponse = await fetch(`${API_URL}/events`);
        const events = await eventsResponse.json();
        
        // Load registrations
        const regResponse = await fetch(`${API_URL}/registrations`);
        const registrations = await regResponse.json();
        
        // Update stats
        document.getElementById('totalEvents').textContent = events.length;
        document.getElementById('totalParticipants').textContent = registrations.length;
        document.getElementById('upcomingEvents').textContent = events.filter(e => new Date(e.date) > new Date()).length;
        
        // Calculate total revenue
        const totalRevenue = events.reduce((sum, event) => 
            sum + (event.registration_fee || 0) * (event.current_participants || 0), 0
        );
        document.getElementById('totalRevenue').textContent = `$${totalRevenue}`;
        
        // Show recent activity
        displayRecentActivity([
            ...events.slice(0, 3).map(e => ({ text: `Event created: ${e.title}`, time: e.date })),
            ...registrations.slice(0, 3).map(r => ({ text: `${r.full_name} registered`, time: r.registration_date }))
        ].slice(0, 5));
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Display recent activity
function displayRecentActivity(activities) {
    const list = document.getElementById('activityList');
    if (!list) return;
    
    list.innerHTML = activities.map(act => `
        <div class="activity-item">
            <span>${act.text}</span>
            <span class="activity-time">${new Date(act.time).toLocaleDateString()}</span>
        </div>
    `).join('');
}

// Setup login form
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const credentials = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };
        
        // For demo purposes, just show success
        alert('Login successful! (Demo mode)');
        window.location.href = 'dashboard.html';
    });
}

// Setup register form
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value
        };
        
        // For demo purposes, just show success
        alert('Registration successful! (Demo mode)');
        window.location.href = 'login.html';
    });
}

// Setup event listeners for filters
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterEvents);
    }
}

// Filter events based on search and category
async function filterEvents() {
    try {
        const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const category = document.getElementById('categoryFilter')?.value || '';
        
        const response = await fetch(`${API_URL}/events`);
        let events = await response.json();
        
        // Apply filters
        events = events.filter(event => {
            const matchesSearch = search === '' || 
                event.title.toLowerCase().includes(search) ||
                event.description.toLowerCase().includes(search);
            
            const matchesCategory = category === '' || event.category === category;
            
            return matchesSearch && matchesCategory;
        });
        
        displayEvents(events);
    } catch (error) {
        console.error('Error filtering events:', error);
    }
}

// Show error message
function showError(message) {
    console.error(message);
    // You could add a toast notification here
}
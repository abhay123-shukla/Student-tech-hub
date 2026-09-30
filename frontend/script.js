/**
 * ==============================================================================
 * STUDENT TECH HUB - FRONTEND LOGIC (Vanilla JavaScript)
 * ==============================================================================
 * Beginner-friendly script demonstrating:
 * 1. How to make HTTP GET requests to fetch data from a REST API
 * 2. How to make HTTP POST requests to send form data as JSON
 * 3. Dynamic DOM manipulation to render cards & status updates
 * ==============================================================================
 */

// 1. Backend Server Configuration
// Default FastAPI development URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// 2. DOM Element Selectors
const backendStatusEl = document.getElementById('backendStatus');
const statusDotEl = document.getElementById('statusDot');
const statusTextEl = document.getElementById('statusText');
const loadEventsBtn = document.getElementById('loadEventsBtn');
const eventsListEl = document.getElementById('eventsList');
const registrationForm = document.getElementById('registrationForm');
const studentNameInput = document.getElementById('studentName');
const studentEmailInput = document.getElementById('studentEmail');
const eventSelect = document.getElementById('eventSelect');
const submitBtn = document.getElementById('submitBtn');
const formFeedbackEl = document.getElementById('formFeedback');
const nameHint = document.getElementById('nameHint');
const emailHint = document.getElementById('emailHint');

// Cache of loaded events so other parts of the app can reference them
let loadedEventsCache = [];


// ------------------------------------------------------------------------------
// Helper: Update Backend Connection Indicator
// ------------------------------------------------------------------------------
function setBackendStatus(isOnline, customMessage) {
  if (isOnline) {
    statusDotEl.className = 'status-indicator online';
    statusTextEl.textContent = customMessage || 'Backend: Connected (Port 8000)';
    backendStatusEl.title = 'FastAPI server is running and responding!';
  } else {
    statusDotEl.className = 'status-indicator offline';
    statusTextEl.textContent = customMessage || 'Backend: Offline (Port 8000)';
    backendStatusEl.title = 'Cannot reach FastAPI backend at ' + API_BASE_URL;
  }
}

// ------------------------------------------------------------------------------
// Helper: Show Feedback Message Banner (Success / Error)
// ------------------------------------------------------------------------------
function showFeedback(type, message) {
  formFeedbackEl.className = `feedback-banner ${type}`;
  formFeedbackEl.textContent = message;
  formFeedbackEl.classList.remove('hidden');

  // Scroll feedback smoothly into view if on mobile
  formFeedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearFeedback() {
  formFeedbackEl.className = 'feedback-banner hidden';
  formFeedbackEl.textContent = '';
  nameHint.textContent = '';
  emailHint.textContent = '';
}


// ------------------------------------------------------------------------------
// Feature 1: Check Backend Health
// ------------------------------------------------------------------------------
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
    if (response.ok) {
      setBackendStatus(true);
      return true;
    } else {
      setBackendStatus(false);
      return false;
    }
  } catch (error) {
    // Network error: backend is likely not running yet
    setBackendStatus(false);
    return false;
  }
}


// ------------------------------------------------------------------------------
// Feature 2: Fetch and Display Events (GET /api/events)
// ------------------------------------------------------------------------------
async function loadEvents() {
  // Show loading indicator
  loadEventsBtn.disabled = true;
  loadEventsBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;margin:0;"></span> Loading...';
  
  eventsListEl.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Fetching events from FastAPI backend (<code>/api/events</code>)...</p>
    </div>
  `;

  try {
    // 1. Fetch data from backend endpoint
    const response = await fetch(`${API_BASE_URL}/api/events`);

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // 2. Parse JSON response
    const data = await response.json();
    const events = Array.isArray(data) ? data : (data.events || []);

    // Save to local cache
    loadedEventsCache = events;
    setBackendStatus(true);

    // 3. Render event cards to the UI
    renderEvents(events);

    // 4. Update the event dropdown in registration form
    populateEventDropdown(events);

  } catch (error) {
    console.error('Error loading events:', error);
    setBackendStatus(false);

    // Display friendly error message with instructions for beginners
    eventsListEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">⚠️</p>
        <h4>Unable to Connect to Backend</h4>
        <p>Could not fetch events from <code>${API_BASE_URL}/api/events</code>.</p>
        <p style="margin-top: 0.5rem; font-size: 0.85rem;">
          Make sure your Python backend is running:<br>
          <strong><code>py -m uvicorn backend.main:app --reload</code></strong>
        </p>
      </div>
    `;
  } finally {
    // Restore button state
    loadEventsBtn.disabled = false;
    loadEventsBtn.innerHTML = '<span class="btn-icon">⚡</span> Load Events';
  }
}

// Render event items into HTML cards
function renderEvents(events) {
  if (!events || events.length === 0) {
    eventsListEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">📂</p>
        <h4>No Events Scheduled</h4>
        <p>Check back later for new workshops and hackathons!</p>
      </div>
    `;
    return;
  }

  // Generate cards HTML
  const cardsHtml = events.map(event => {
    return `
      <article class="event-card">
        <div class="event-card-header">
          <span class="event-badge">${escapeHtml(event.category || 'Tech Event')}</span>
        </div>
        
        <div>
          <h4 class="event-card-title">${escapeHtml(event.title)}</h4>
          <div class="event-meta" style="margin-top: 0.5rem;">
            <div class="meta-item">
              <span>📅</span>
              <strong>${escapeHtml(event.date)}</strong> &bull; ${escapeHtml(event.time || '')}
            </div>
            <div class="meta-item">
              <span>📍</span>
              <span>${escapeHtml(event.location || 'Campus / Online')}</span>
            </div>
          </div>
        </div>

        <p class="event-desc">${escapeHtml(event.description)}</p>

        <div class="event-card-action">
          <button 
            type="button" 
            class="btn btn-secondary btn-block select-event-btn" 
            onclick="selectEventForRegistration(${event.id})"
          >
            RSVP for this Event
          </button>
        </div>
      </article>
    `;
  }).join('');

  eventsListEl.innerHTML = cardsHtml;
}

// Populate the select dropdown inside registration form
function populateEventDropdown(events) {
  const currentVal = eventSelect.value;
  eventSelect.innerHTML = '<option value="">General Hub Registration</option>';

  events.forEach(event => {
    const opt = document.createElement('option');
    opt.value = event.id;
    opt.textContent = `${event.title} (${event.date})`;
    eventSelect.appendChild(opt);
  });

  if (currentVal) {
    eventSelect.value = currentVal;
  }
}

// Helper: When user clicks "RSVP for this Event" card button
window.selectEventForRegistration = function(eventId) {
  eventSelect.value = eventId;
  studentNameInput.focus();
  studentNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
};


// ------------------------------------------------------------------------------
// Feature 3: Register Student (POST /api/register)
// ------------------------------------------------------------------------------
async function handleRegistration(e) {
  // Prevent browser default page refresh on form submit
  e.preventDefault();
  clearFeedback();

  const name = studentNameInput.value.trim();
  const email = studentEmailInput.value.trim();
  const eventId = eventSelect.value ? parseInt(eventSelect.value, 10) : null;

  // Client-side validation
  let hasError = false;
  if (!name) {
    nameHint.textContent = 'Please enter your full name.';
    hasError = true;
  }
  if (!email || !email.includes('@') || !email.includes('.')) {
    emailHint.textContent = 'Please enter a valid email address.';
    hasError = true;
  }

  if (hasError) return;

  // Prepare payload object to send as JSON
  const payload = {
    name: name,
    email: email,
    event_id: eventId
  };

  // UI loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;margin:0;"></span> Registering...';

  try {
    // Send POST request with JSON payload to /api/register
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      // Backend returned 4xx or 5xx error
      const errorMsg = result.detail || result.message || 'Registration failed. Please check your input.';
      showFeedback('error', `❌ ${errorMsg}`);
    } else {
      // Success!
      showFeedback('success', `🎉 ${result.message || 'Registration successful!'}`);
      registrationForm.reset();
      setBackendStatus(true);
    }

  } catch (error) {
    console.error('Registration error:', error);
    setBackendStatus(false);
    showFeedback('error', '❌ Could not connect to the backend server. Make sure FastAPI is running on http://127.0.0.1:8000.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Register Now</span>';
  }
}


// ------------------------------------------------------------------------------
// Helper: Prevent XSS by escaping HTML entities
// ------------------------------------------------------------------------------
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ------------------------------------------------------------------------------
// Initialization: Attach Event Listeners & Check Backend on Start
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Bind click listener for "Load Events"
  loadEventsBtn.addEventListener('click', loadEvents);

  // Bind submit listener for the registration form
  registrationForm.addEventListener('submit', handleRegistration);

  // Clear validation hints on input typing
  studentNameInput.addEventListener('input', () => { nameHint.textContent = ''; });
  studentEmailInput.addEventListener('input', () => { emailHint.textContent = ''; });

  // Initial backend check and auto-load events
  checkBackendHealth().then(isOnline => {
    if (isOnline) {
      // If backend is running, automatically load events for a great user experience
      loadEvents();
    }
  });
});

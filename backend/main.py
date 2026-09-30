from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# ==============================================================================
# STUDENT TECH HUB - BACKEND API (FastAPI)
# ==============================================================================
# This is a beginner-friendly REST API built with Python and FastAPI.
# It serves upcoming tech events and receives student registrations.
# ==============================================================================

# 1. Initialize the FastAPI app
app = FastAPI(
    title="Student Tech Hub API",
    description="Backend API for Student Tech Hub events and registrations.",
    version="1.0.0"
)

# 2. Enable CORS (Cross-Origin Resource Sharing)
# Why is this needed?
# When your frontend runs on one port (e.g. 5500 with Live Server, or 3000)
# and your backend runs on port 8000, the browser blocks requests by default
# for security reasons. CORS middleware tells the browser: "Allow this frontend to talk to me!"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Allow all origins for easy local development
    allow_credentials=True,
    allow_methods=["*"],       # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],       # Allow all request headers
)

# 3. Define the Data Model for Student Registration
# Pydantic validates incoming JSON data automatically.
class RegistrationRequest(BaseModel):
    name: str
    email: str
    event_id: Optional[int] = None  # Optional: allows selecting a specific event

# 4. Sample In-Memory Event Data
# In a full-scale app, this would come from a database.
# Here, we keep it simple with a Python list of dictionaries.
SAMPLE_EVENTS = [
    {
        "id": 1,
        "title": "Web Development Bootcamp",
        "category": "Workshop",
        "date": "October 15, 2026",
        "time": "10:00 AM - 1:00 PM",
        "location": "Room 402 & Online",
        "description": "Master HTML5, CSS3, and modern JavaScript fundamentals by building hands-on interactive projects."
    },
    {
        "id": 2,
        "title": "Intro to Python & FastAPIs",
        "category": "Seminar",
        "date": "October 22, 2026",
        "time": "2:00 PM - 4:00 PM",
        "location": "Tech Auditorium B",
        "description": "Discover how Python powers modern web backends, microservices, and high-performance REST APIs."
    },
    {
        "id": 3,
        "title": "Annual Student Hackathon 2026",
        "category": "Hackathon",
        "date": "November 05, 2026",
        "time": "9:00 AM - 9:00 PM",
        "location": "Student Innovation Lab",
        "description": "Collaborate in teams to build impactful web and mobile solutions for real-world campus problems."
    },
    {
        "id": 4,
        "title": "AI & Machine Learning Primer",
        "category": "Masterclass",
        "date": "November 18, 2026",
        "time": "3:00 PM - 5:30 PM",
        "location": "Virtual (Google Meet)",
        "description": "Explore practical AI concepts, neural network basics, and how to integrate smart models into web applications."
    }
]

# Simple in-memory list to store registrations submitted during this session
registrations_db = []


# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------

@app.get("/")
def home():
    """
    Health check / welcome endpoint.
    Visiting http://127.0.0.1:8000 in your browser will display this message.
    """
    return {
        "message": "Welcome to Student Tech Hub API!",
        "status": "online",
        "endpoints": {
            "get_events": "GET /api/events",
            "register_student": "POST /api/register",
            "docs": "/docs"
        }
    }


@app.get("/api/events")
def get_events():
    """
    GET /api/events
    Returns the list of upcoming technical events as JSON.
    """
    return SAMPLE_EVENTS


@app.post("/api/register")
def register_student(registration: RegistrationRequest):
    """
    POST /api/register
    Accepts student registration details (name and email) in JSON format.
    Validates input and stores the record in memory.
    """
    # Basic validation
    clean_name = registration.name.strip()
    clean_email = registration.email.strip()

    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty.")

    if not clean_email or "@" not in clean_email or "." not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    # Find event title if event_id was provided
    event_title = "General Student Tech Hub"
    if registration.event_id is not None:
        matching_event = next((e for e in SAMPLE_EVENTS if e["id"] == registration.event_id), None)
        if matching_event:
            event_title = matching_event["title"]

    # Store registration
    new_record = {
        "id": len(registrations_db) + 1,
        "name": clean_name,
        "email": clean_email,
        "event_id": registration.event_id,
        "event_title": event_title
    }
    registrations_db.append(new_record)

    # Return friendly confirmation response
    return {
        "status": "success",
        "message": f"Welcome aboard, {clean_name}! You have successfully registered for {event_title}.",
        "data": new_record
    }

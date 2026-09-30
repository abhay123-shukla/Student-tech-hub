# 🚀 Student Tech Hub

A beginner-friendly, lightweight full-stack web application designed for students to explore campus technical workshops, hackathons, and seminars, and register for them online.

Built with **plain HTML, CSS, and JavaScript** on the frontend, and a high-performance **Python FastAPI** server on the backend.

---

## 📁 Project Structure

```text
student-tech-hub/
│
├── frontend/
│   ├── index.html       # Clean, modern semantic HTML structure
│   ├── style.css        # Responsive styling with modern cards & layout
│   └── script.js        # Vanilla JavaScript handling fetch API & form submission
│
├── backend/
│   ├── main.py          # FastAPI application with GET and POST endpoints
│   └── requirements.txt # Python dependencies (FastAPI & Uvicorn)
│
└── README.md            # Comprehensive project documentation & setup guide
```

---

## 🎯 What the Project Does

1. **Displays Upcoming Events**: Shows a responsive list of tech events (workshops, hackathons, seminars) with dates, times, locations, and descriptions.
2. **On-Demand Loading**: Features a **"Load Events"** button that fetches the latest event data from the FastAPI backend via HTTP GET.
3. **Student Registration**: Includes a clean registration form where students enter their name and email, optionally select an event, and submit an RSVP.
4. **Live Connection Indicator**: Shows whether the FastAPI backend is running and reachable (`Connected` vs. `Offline`).
5. **Clear Feedback**: Displays friendly success or error messages when registering or fetching data.

---

## 🛠️ Tech Stack & Philosophy

- **Frontend**: Plain HTML5, CSS3, and JavaScript (ES6+).
  - *No React, No Next.js, No TypeScript, No Webpack, No complex build tools.*
- **Backend**: Python 3 with FastAPI and Uvicorn.
  - *No database, No authentication, No Docker, No unnecessary bloat.*
- **Communication**: Standard Web Fetch API communicating over JSON with CORS enabled.

---

## ⚙️ 1. How to Install the Backend

### Prerequisites
Make sure you have **Python 3.8+** installed on your computer.

### Step 1: Open a terminal in the project root directory
Open Command Prompt, PowerShell, or your terminal in the `student-tech-hub` folder:

```bash
cd "Student tech hub"
```

### Step 2: (Optional but recommended) Create a virtual environment
```bash
# On Windows:
py -m venv venv
venv\Scripts\activate

# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install dependencies
Install the required packages (`fastapi` and `uvicorn`):

```bash
# Standard command:
pip install -r backend/requirements.txt

# Or on Windows using the Python launcher:
py -m pip install -r backend/requirements.txt
```

---

## ▶️ 2. How to Run the Backend

To start the FastAPI development server with automatic reload:

```bash
# From the project root folder:
py -m uvicorn backend.main:app --reload --port 8000

# Or navigate into the backend folder:
cd backend
uvicorn main:app --reload --port 8000
```

Once running, you will see output like:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

### Test the Backend in your Browser
- **Root endpoint**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Events JSON**: [http://127.0.0.1:8000/api/events](http://127.0.0.1:8000/api/events)
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (You can test endpoints directly from here!)

---

## 🌐 3. How to Run the Frontend Locally

You have multiple easy ways to run the frontend:

### Method A: Directly in the Browser (Simplest)
1. Open your file explorer and navigate to the `frontend/` directory.
2. Double-click `index.html` (or right-click -> **Open with** -> Google Chrome / Firefox / Edge).

### Method B: Using Python's Built-in HTTP Server
Run this simple command from the project root:

```bash
# On Windows:
py -m http.server 5500 -d frontend

# On macOS / Linux:
python3 -m http.server 5500 -d frontend
```

Now open your browser and navigate to:
👉 [http://127.0.0.1:5500](http://127.0.0.1:5500)

### Method C: Using VS Code "Live Server" Extension
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `frontend/index.html` and select **"Open with Live Server"**.

---

## 🔄 4. How the Frontend Communicates with the Backend

Here is a simple explanation of how data travels between the browser and the Python server:

```text
  +--------------------------+                         +--------------------------+
  |    FRONTEND (Browser)    |                         |     BACKEND (FastAPI)    |
  |  http://127.0.0.1:5500   |                         |   http://127.0.0.1:8000  |
  +--------------------------+                         +--------------------------+
               |                                                     |
               | ----- 1. GET /api/events -------------------------> |
               |                                                     | (Reads SAMPLE_EVENTS)
               | <---- 2. Returns JSON list of events -------------- |
               |                                                     |
  (User clicks "Register" & submits form)                            |
               |                                                     |
               | ----- 3. POST /api/register (JSON Payload) -------> |
               |          { name: "Alex", email: "..." }             | (Pydantic validates)
               |                                                     | (Stores in memory)
               | <---- 4. Returns JSON confirmation message -------- |
               v                                                     v
```

### 1. Fetching Events (GET Request)
When you click **"Load Events"**, JavaScript triggers `loadEvents()` in [script.js](frontend/script.js):
```javascript
const response = await fetch("http://127.0.0.1:8000/api/events");
const events = await response.json();
```
The browser sends an HTTP `GET` request. FastAPI receives it in [main.py](backend/main.py) at `@app.get("/api/events")`, serializes the Python list into JSON format, and sends it back. The JavaScript code then builds HTML event cards dynamically and inserts them into the webpage.

### 2. Registering a Student (POST Request)
When you submit the registration form, JavaScript intercepts the event (`e.preventDefault()`) so the page doesn't refresh:
```javascript
const response = await fetch("http://127.0.0.1:8000/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alex", email: "alex@edu.com", event_id: 1 })
});
const result = await response.json();
```
FastAPI validates the incoming JSON against the `RegistrationRequest` Pydantic model:
```python
class RegistrationRequest(BaseModel):
    name: str
    email: str
    event_id: Optional[int] = None
```
If valid, it records the registration and replies with a success message which displays in the green banner on screen.

### 3. What is CORS and Why Do We Need It?
- **CORS** stands for **Cross-Origin Resource Sharing**.
- In local development, your frontend may run on `http://127.0.0.1:5500` while your backend runs on `http://127.0.0.1:8000`. Because the port numbers are different, web browsers treat them as different origins and block requests by default to protect users.
- To allow the frontend to fetch data from the backend, we enabled `CORSMiddleware` in [backend/main.py](backend/main.py):
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # Permits frontend on any port
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
  This tells the browser that it is completely safe to share resources between the frontend and the backend.

---

## 💡 Troubleshooting & FAQ

- **Backend says "Offline" in the top badge**:
  Make sure you started the Uvicorn server in your terminal:
  `py -m uvicorn backend.main:app --reload --port 8000`
- **Port 8000 is already in use**:
  You can run on a different port:
  `py -m uvicorn backend.main:app --reload --port 8080`
  *(If you change ports, remember to update `API_BASE_URL` in `frontend/script.js` to match).*
- **`python` not found on Windows**:
  Use the Windows Python launcher: `py` instead of `python` (e.g. `py -m pip install -r backend/requirements.txt`).

---

## 📜 License
This project is open-source and intended for learning and educational purposes. Feel free to customize and expand it!

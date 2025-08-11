from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
import requests
from datetime import datetime, timedelta
import uvicorn

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'techpathfinder_db')
ADZUNA_APP_ID = os.environ.get('ADZUNA_APP_ID')
ADZUNA_API_KEY = os.environ.get('ADZUNA_API_KEY')

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db.users
sessions_collection = db.sessions
career_paths_collection = db.career_paths
resources_collection = db.resources

app = FastAPI(title="TechPathfinder API", description="CS/IT Career Guidance Platform")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    last_login: datetime

class Session(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime

class CareerPath(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    skills: List[str]
    roadmap: List[Dict[str, Any]]
    resources: List[Dict[str, str]]
    salary_range: str
    job_outlook: str
    difficulty_level: str

class Resource(BaseModel):
    id: str
    title: str
    description: str
    url: str
    type: str  # video, course, article, tool
    category: str  # web-dev, data-science, etc.
    is_free: bool

class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    excerpt: str
    author: str
    created_at: datetime
    tags: List[str]

# Authentication helpers
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    session = sessions_collection.find_one({"session_token": token})
    
    if not session or session["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user = users_collection.find_one({"id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Initialize career paths data
def initialize_career_paths():
    if career_paths_collection.count_documents({}) == 0:
        career_paths = [
            {
                "id": str(uuid.uuid4()),
                "title": "Web Developer",
                "description": "Build websites and web applications using modern technologies",
                "icon": "🌐",
                "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Python", "Git"],
                "roadmap": [
                    {"step": 1, "title": "HTML & CSS Fundamentals", "duration": "2-4 weeks", "description": "Learn the building blocks of web pages"},
                    {"step": 2, "title": "JavaScript Basics", "duration": "4-6 weeks", "description": "Add interactivity to your websites"},
                    {"step": 3, "title": "Frontend Framework (React)", "duration": "6-8 weeks", "description": "Build dynamic user interfaces"},
                    {"step": 4, "title": "Backend Development", "duration": "8-10 weeks", "description": "Learn server-side programming"},
                    {"step": 5, "title": "Database Management", "duration": "4-6 weeks", "description": "Store and manage application data"},
                    {"step": 6, "title": "Deployment & DevOps", "duration": "3-4 weeks", "description": "Deploy your applications to the web"}
                ],
                "resources": [
                    {"name": "freeCodeCamp", "url": "https://freecodecamp.org", "type": "course"},
                    {"name": "MDN Web Docs", "url": "https://developer.mozilla.org", "type": "documentation"},
                    {"name": "JavaScript30", "url": "https://javascript30.com", "type": "practice"},
                    {"name": "React Official Tutorial", "url": "https://react.dev/learn", "type": "tutorial"}
                ],
                "salary_range": "$65,000 - $120,000",
                "job_outlook": "13% growth (faster than average)",
                "difficulty_level": "Beginner to Intermediate"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Data Scientist",
                "description": "Analyze large datasets to extract insights and build predictive models",
                "icon": "📊",
                "skills": ["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas", "NumPy", "Matplotlib"],
                "roadmap": [
                    {"step": 1, "title": "Python Programming", "duration": "4-6 weeks", "description": "Master Python fundamentals"},
                    {"step": 2, "title": "Statistics & Math", "duration": "6-8 weeks", "description": "Essential mathematical foundations"},
                    {"step": 3, "title": "Data Manipulation", "duration": "4-6 weeks", "description": "Learn Pandas and NumPy"},
                    {"step": 4, "title": "Data Visualization", "duration": "3-4 weeks", "description": "Create compelling data visualizations"},
                    {"step": 5, "title": "Machine Learning", "duration": "8-12 weeks", "description": "Build predictive models"},
                    {"step": 6, "title": "Advanced Topics", "duration": "ongoing", "description": "Deep learning, NLP, computer vision"}
                ],
                "resources": [
                    {"name": "Kaggle Learn", "url": "https://kaggle.com/learn", "type": "course"},
                    {"name": "Coursera Data Science", "url": "https://coursera.org", "type": "specialization"},
                    {"name": "Python for Data Analysis", "url": "https://wesmckinney.com/book/", "type": "book"},
                    {"name": "Jupyter Notebooks", "url": "https://jupyter.org", "type": "tool"}
                ],
                "salary_range": "$95,000 - $165,000",
                "job_outlook": "35% growth (much faster than average)",
                "difficulty_level": "Intermediate to Advanced"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Cybersecurity Analyst",
                "description": "Protect organizations from cyber threats and security breaches",
                "icon": "🔒",
                "skills": ["Network Security", "Ethical Hacking", "Risk Assessment", "Incident Response", "Python", "Linux", "Cryptography"],
                "roadmap": [
                    {"step": 1, "title": "IT Fundamentals", "duration": "4-6 weeks", "description": "Computer networks and systems"},
                    {"step": 2, "title": "Security Basics", "duration": "6-8 weeks", "description": "Core security principles"},
                    {"step": 3, "title": "Network Security", "duration": "6-8 weeks", "description": "Firewalls, VPNs, and monitoring"},
                    {"step": 4, "title": "Ethical Hacking", "duration": "8-10 weeks", "description": "Penetration testing techniques"},
                    {"step": 5, "title": "Incident Response", "duration": "4-6 weeks", "description": "Handle security breaches"},
                    {"step": 6, "title": "Certifications", "duration": "3-6 months", "description": "Security+, CEH, CISSP"}
                ],
                "resources": [
                    {"name": "Cybrary", "url": "https://cybrary.it", "type": "platform"},
                    {"name": "TryHackMe", "url": "https://tryhackme.com", "type": "practice"},
                    {"name": "SANS Training", "url": "https://sans.org", "type": "training"},
                    {"name": "Security+ Study Guide", "url": "https://comptia.org", "type": "certification"}
                ],
                "salary_range": "$85,000 - $140,000",
                "job_outlook": "33% growth (much faster than average)",
                "difficulty_level": "Intermediate"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Software Engineer",
                "description": "Design, develop, and maintain software applications and systems",
                "icon": "💻",
                "skills": ["Programming Languages", "Data Structures", "Algorithms", "System Design", "Git", "Testing", "Agile"],
                "roadmap": [
                    {"step": 1, "title": "Programming Fundamentals", "duration": "6-8 weeks", "description": "Choose a language and master basics"},
                    {"step": 2, "title": "Data Structures & Algorithms", "duration": "8-12 weeks", "description": "Essential CS concepts"},
                    {"step": 3, "title": "Object-Oriented Programming", "duration": "4-6 weeks", "description": "Design patterns and OOP principles"},
                    {"step": 4, "title": "Software Development Practices", "duration": "6-8 weeks", "description": "Version control, testing, debugging"},
                    {"step": 5, "title": "System Design", "duration": "8-10 weeks", "description": "Architecture and scalability"},
                    {"step": 6, "title": "Specialization", "duration": "ongoing", "description": "Mobile, web, systems, or game development"}
                ],
                "resources": [
                    {"name": "LeetCode", "url": "https://leetcode.com", "type": "practice"},
                    {"name": "GitHub", "url": "https://github.com", "type": "platform"},
                    {"name": "Clean Code", "url": "https://amazon.com", "type": "book"},
                    {"name": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "guide"}
                ],
                "salary_range": "$85,000 - $160,000",
                "job_outlook": "25% growth (much faster than average)",
                "difficulty_level": "Intermediate to Advanced"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "AI Engineer",
                "description": "Develop artificial intelligence and machine learning solutions",
                "icon": "🤖",
                "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision"],
                "roadmap": [
                    {"step": 1, "title": "Python & Math Foundations", "duration": "6-8 weeks", "description": "Linear algebra, calculus, statistics"},
                    {"step": 2, "title": "Machine Learning Basics", "duration": "8-10 weeks", "description": "Supervised and unsupervised learning"},
                    {"step": 3, "title": "Deep Learning", "duration": "10-12 weeks", "description": "Neural networks and frameworks"},
                    {"step": 4, "title": "Specialization Areas", "duration": "12-16 weeks", "description": "NLP, computer vision, or reinforcement learning"},
                    {"step": 5, "title": "MLOps", "duration": "6-8 weeks", "description": "Model deployment and monitoring"},
                    {"step": 6, "title": "Advanced Research", "duration": "ongoing", "description": "Latest AI developments and research"}
                ],
                "resources": [
                    {"name": "Fast.ai", "url": "https://fast.ai", "type": "course"},
                    {"name": "Deep Learning Specialization", "url": "https://coursera.org", "type": "specialization"},
                    {"name": "Papers With Code", "url": "https://paperswithcode.com", "type": "research"},
                    {"name": "Hugging Face", "url": "https://huggingface.co", "type": "platform"}
                ],
                "salary_range": "$120,000 - $200,000",
                "job_outlook": "23% growth (much faster than average)",
                "difficulty_level": "Advanced"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Cloud Engineer",
                "description": "Design and manage cloud infrastructure and services",
                "icon": "☁️",
                "skills": ["AWS/Azure/GCP", "Docker", "Kubernetes", "Infrastructure as Code", "DevOps", "Linux", "Networking"],
                "roadmap": [
                    {"step": 1, "title": "Linux & Networking", "duration": "4-6 weeks", "description": "System administration basics"},
                    {"step": 2, "title": "Cloud Platform Basics", "duration": "6-8 weeks", "description": "Choose AWS, Azure, or GCP"},
                    {"step": 3, "title": "Containerization", "duration": "4-6 weeks", "description": "Docker and container orchestration"},
                    {"step": 4, "title": "Infrastructure as Code", "duration": "6-8 weeks", "description": "Terraform, CloudFormation"},
                    {"step": 5, "title": "CI/CD Pipelines", "duration": "4-6 weeks", "description": "Automated deployment processes"},
                    {"step": 6, "title": "Monitoring & Security", "duration": "6-8 weeks", "description": "Cloud security and observability"}
                ],
                "resources": [
                    {"name": "AWS Training", "url": "https://aws.amazon.com/training/", "type": "training"},
                    {"name": "A Cloud Guru", "url": "https://acloudguru.com", "type": "platform"},
                    {"name": "Docker Documentation", "url": "https://docs.docker.com", "type": "documentation"},
                    {"name": "Kubernetes.io", "url": "https://kubernetes.io/docs/", "type": "documentation"}
                ],
                "salary_range": "$95,000 - $155,000",
                "job_outlook": "15% growth (faster than average)",
                "difficulty_level": "Intermediate to Advanced"
            }
        ]
        career_paths_collection.insert_many(career_paths)

# API Routes
@app.on_event("startup")
async def startup_event():
    initialize_career_paths()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "TechPathfinder API"}

# Auth endpoints
@app.get("/api/auth/login")
async def initiate_login():
    preview_url = "https://9a02cb3f-b17a-42e2-8ece-2337c532d6e6.preview.emergentagent.com"
    auth_url = f"https://auth.emergentagent.com/?redirect={preview_url}/profile"
    return {"auth_url": auth_url}

@app.post("/api/auth/profile")
async def create_profile(request: Request):
    # Get session ID from headers
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Call Emergent auth API
    try:
        response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        response.raise_for_status()
        user_data = response.json()
    except requests.RequestException:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check if user exists
    existing_user = users_collection.find_one({"email": user_data["email"]})
    
    user_id = str(uuid.uuid4())
    if not existing_user:
        # Create new user
        user = {
            "id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }
        users_collection.insert_one(user)
    else:
        user_id = existing_user["id"]
        # Update last login
        users_collection.update_one(
            {"id": user_id},
            {"$set": {"last_login": datetime.utcnow()}}
        )
    
    # Create session token
    session_token = str(uuid.uuid4())
    session = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": datetime.utcnow() + timedelta(days=7),
        "created_at": datetime.utcnow()
    }
    sessions_collection.insert_one(session)
    
    return {
        "user": user_data,
        "session_token": session_token,
        "expires_at": session["expires_at"]
    }

@app.get("/api/user/profile")
async def get_profile(current_user = Depends(get_current_user)):
    return current_user

# Career paths endpoints
@app.get("/api/career-paths")
async def get_career_paths():
    career_paths = list(career_paths_collection.find({}, {"_id": 0}))
    return {"career_paths": career_paths}

@app.get("/api/career-paths/{path_id}")
async def get_career_path(path_id: str):
    career_path = career_paths_collection.find_one({"id": path_id}, {"_id": 0})
    if not career_path:
        raise HTTPException(status_code=404, detail="Career path not found")
    return career_path

# Blog/tips endpoints
@app.get("/api/blog/posts")
async def get_blog_posts():
    posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "How to Stay Motivated While Learning to Code",
            "excerpt": "Practical tips to maintain motivation during your coding journey",
            "author": "Devset Team",
            "created_at": datetime.utcnow(),
            "tags": ["motivation", "learning", "coding"]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Building Your First Portfolio Project",
            "excerpt": "Step-by-step guide to creating impressive portfolio projects",
            "author": "Devset Team",
            "created_at": datetime.utcnow(),
            "tags": ["portfolio", "projects", "career"]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Networking Tips for CS Students",
            "excerpt": "How to build professional relationships in the tech industry",
            "author": "Devset Team",
            "created_at": datetime.utcnow(),
            "tags": ["networking", "career", "students"]
        }
    ]
    return {"posts": posts}

# Internship/job guidance
@app.get("/api/job-guidance")
async def get_job_guidance():
    guidance = {
        "internship_tips": [
            "Start applying early - many companies recruit 3-6 months in advance",
            "Customize your resume for each application",
            "Build projects that demonstrate relevant skills",
            "Practice coding interviews on platforms like LeetCode",
            "Network with professionals on LinkedIn",
            "Attend career fairs and tech meetups"
        ],
        "application_process": [
            "Research the company and role thoroughly",
            "Tailor your cover letter to the specific position",
            "Highlight relevant projects and experiences",
            "Prepare for technical and behavioral interviews",
            "Follow up appropriately after interviews",
            "Be persistent but respectful"
        ],
        "resume_templates": [
            {
                "name": "Software Engineer Resume Template",
                "description": "Perfect for software development roles",
                "url": "https://docs.google.com/document/d/example1"
            },
            {
                "name": "Data Science Resume Template",
                "description": "Tailored for data science positions",
                "url": "https://docs.google.com/document/d/example2"
            },
            {
                "name": "Cybersecurity Resume Template",
                "description": "Optimized for security roles",
                "url": "https://docs.google.com/document/d/example3"
            }
        ],
        "interview_prep": [
            "Practice coding problems daily",
            "Review data structures and algorithms",
            "Prepare STAR method examples for behavioral questions",
            "Research common interview questions for your target role",
            "Mock interviews with peers or mentors",
            "Prepare thoughtful questions to ask the interviewer"
        ]
    }
    return guidance

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
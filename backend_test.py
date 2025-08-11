#!/usr/bin/env python3
"""
TechPathfinder Backend API Testing Suite
Tests all backend endpoints according to test_result.md requirements
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Backend URL from frontend/.env
BACKEND_URL = "https://9a02cb3f-b17a-42e2-8ece-2337c532d6e6.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.session_token = None
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def test_health_check(self):
        """Test GET /api/health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and "service" in data:
                    self.log_test("Health Check", True, f"Service: {data.get('service')}")
                    return True
                else:
                    self.log_test("Health Check", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_career_paths_list(self):
        """Test GET /api/career-paths endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/career-paths", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                career_paths = data.get("career_paths", [])
                
                if len(career_paths) == 6:
                    # Verify expected career paths exist
                    expected_titles = [
                        "Web Developer", "Data Scientist", "Cybersecurity Analyst",
                        "Software Engineer", "AI Engineer", "Cloud Engineer"
                    ]
                    actual_titles = [cp.get("title") for cp in career_paths]
                    
                    missing_titles = [title for title in expected_titles if title not in actual_titles]
                    if not missing_titles:
                        # Verify structure of first career path
                        first_path = career_paths[0]
                        required_fields = ["id", "title", "description", "icon", "skills", "roadmap", "resources", "salary_range"]
                        missing_fields = [field for field in required_fields if field not in first_path]
                        
                        if not missing_fields:
                            self.log_test("Career Paths List", True, f"Found all 6 career paths with complete data")
                            return True, career_paths
                        else:
                            self.log_test("Career Paths List", False, f"Missing fields: {missing_fields}")
                            return False, None
                    else:
                        self.log_test("Career Paths List", False, f"Missing career paths: {missing_titles}")
                        return False, None
                else:
                    self.log_test("Career Paths List", False, f"Expected 6 career paths, got {len(career_paths)}")
                    return False, None
            else:
                self.log_test("Career Paths List", False, f"HTTP {response.status_code}", response.text)
                return False, None
                
        except Exception as e:
            self.log_test("Career Paths List", False, f"Connection error: {str(e)}")
            return False, None
    
    def test_career_path_detail(self, career_paths):
        """Test GET /api/career-paths/{path_id} endpoint"""
        if not career_paths:
            self.log_test("Career Path Detail", False, "No career paths available for testing")
            return False
            
        try:
            # Test with valid ID
            test_path = career_paths[0]
            path_id = test_path["id"]
            
            response = self.session.get(f"{API_BASE}/career-paths/{path_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == path_id and data.get("title") == test_path["title"]:
                    # Verify roadmap structure
                    roadmap = data.get("roadmap", [])
                    if roadmap and isinstance(roadmap, list) and len(roadmap) > 0:
                        first_step = roadmap[0]
                        if "step" in first_step and "title" in first_step and "duration" in first_step:
                            self.log_test("Career Path Detail (Valid ID)", True, f"Retrieved {data.get('title')} with {len(roadmap)} roadmap steps")
                        else:
                            self.log_test("Career Path Detail (Valid ID)", False, "Invalid roadmap structure")
                            return False
                    else:
                        self.log_test("Career Path Detail (Valid ID)", False, "Missing or empty roadmap")
                        return False
                else:
                    self.log_test("Career Path Detail (Valid ID)", False, "Response data doesn't match request")
                    return False
            else:
                self.log_test("Career Path Detail (Valid ID)", False, f"HTTP {response.status_code}", response.text)
                return False
            
            # Test with invalid ID
            invalid_id = str(uuid.uuid4())
            response = self.session.get(f"{API_BASE}/career-paths/{invalid_id}", timeout=10)
            
            if response.status_code == 404:
                self.log_test("Career Path Detail (Invalid ID)", True, "Correctly returned 404 for invalid ID")
                return True
            else:
                self.log_test("Career Path Detail (Invalid ID)", False, f"Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Career Path Detail", False, f"Connection error: {str(e)}")
            return False
    
    def test_auth_login(self):
        """Test GET /api/auth/login endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/auth/login", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                auth_url = data.get("auth_url")
                
                if auth_url and "auth.emergentagent.com" in auth_url:
                    self.log_test("Auth Login", True, "Returns valid Emergent auth URL")
                    return True
                else:
                    self.log_test("Auth Login", False, "Invalid or missing auth_url", data)
                    return False
            else:
                self.log_test("Auth Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Auth Login", False, f"Connection error: {str(e)}")
            return False
    
    def test_auth_profile(self):
        """Test POST /api/auth/profile endpoint"""
        try:
            # Test without session ID (should fail)
            response = self.session.post(f"{API_BASE}/auth/profile", timeout=10)
            
            if response.status_code == 400:
                self.log_test("Auth Profile (No Session)", True, "Correctly rejects request without session ID")
            else:
                self.log_test("Auth Profile (No Session)", False, f"Expected 400, got {response.status_code}")
                return False
            
            # Test with invalid session ID (should fail)
            headers = {"X-Session-ID": "invalid-session-id"}
            response = self.session.post(f"{API_BASE}/auth/profile", headers=headers, timeout=10)
            
            if response.status_code == 401:
                self.log_test("Auth Profile (Invalid Session)", True, "Correctly rejects invalid session ID")
                return True
            else:
                self.log_test("Auth Profile (Invalid Session)", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth Profile", False, f"Connection error: {str(e)}")
            return False
    
    def test_job_guidance(self):
        """Test GET /api/job-guidance endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/job-guidance", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required sections
                required_sections = ["internship_tips", "application_process", "resume_templates", "interview_prep"]
                missing_sections = [section for section in required_sections if section not in data]
                
                if not missing_sections:
                    # Verify content quality
                    internship_tips = data.get("internship_tips", [])
                    resume_templates = data.get("resume_templates", [])
                    
                    if len(internship_tips) >= 5 and len(resume_templates) >= 3:
                        # Check resume template structure
                        if resume_templates and "name" in resume_templates[0] and "description" in resume_templates[0]:
                            self.log_test("Job Guidance", True, f"Complete guidance with {len(internship_tips)} tips and {len(resume_templates)} templates")
                            return True
                        else:
                            self.log_test("Job Guidance", False, "Invalid resume template structure")
                            return False
                    else:
                        self.log_test("Job Guidance", False, f"Insufficient content: {len(internship_tips)} tips, {len(resume_templates)} templates")
                        return False
                else:
                    self.log_test("Job Guidance", False, f"Missing sections: {missing_sections}")
                    return False
            else:
                self.log_test("Job Guidance", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Job Guidance", False, f"Connection error: {str(e)}")
            return False
    
    def test_blog_posts(self):
        """Test GET /api/blog/posts endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/blog/posts", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get("posts", [])
                
                if len(posts) >= 3:
                    # Verify post structure
                    first_post = posts[0]
                    required_fields = ["id", "title", "excerpt", "author", "created_at", "tags"]
                    missing_fields = [field for field in required_fields if field not in first_post]
                    
                    if not missing_fields:
                        # Check content quality
                        motivation_posts = [post for post in posts if "motivation" in post.get("tags", [])]
                        if motivation_posts:
                            self.log_test("Blog Posts", True, f"Found {len(posts)} posts including motivation content")
                            return True
                        else:
                            self.log_test("Blog Posts", False, "No motivation content found")
                            return False
                    else:
                        self.log_test("Blog Posts", False, f"Missing fields in posts: {missing_fields}")
                        return False
                else:
                    self.log_test("Blog Posts", False, f"Expected at least 3 posts, got {len(posts)}")
                    return False
            else:
                self.log_test("Blog Posts", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Blog Posts", False, f"Connection error: {str(e)}")
            return False

    def test_job_search(self):
        """Test POST /api/jobs/search endpoint"""
        try:
            # Test basic job search
            search_data = {
                "query": "software engineer",
                "location": "San Francisco",
                "job_type": "full_time"
            }
            
            response = self.session.post(f"{API_BASE}/jobs/search", 
                                       json=search_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                count = data.get("count", 0)
                
                if results and count > 0:
                    # Verify job structure
                    first_job = results[0]
                    required_fields = ["id", "title", "company", "location", "description", "salary", "job_type"]
                    missing_fields = [field for field in required_fields if field not in first_job]
                    
                    if not missing_fields:
                        self.log_test("Job Search API", True, f"Found {count} jobs with complete structure")
                        
                        # Test different search parameters
                        search_data2 = {"query": "data scientist"}
                        response2 = self.session.post(f"{API_BASE}/jobs/search", 
                                                    json=search_data2, timeout=15)
                        
                        if response2.status_code == 200:
                            self.log_test("Job Search (Different Query)", True, "Successfully handled different search parameters")
                            return True
                        else:
                            self.log_test("Job Search (Different Query)", False, f"HTTP {response2.status_code}")
                            return False
                    else:
                        self.log_test("Job Search API", False, f"Missing fields in job results: {missing_fields}")
                        return False
                else:
                    self.log_test("Job Search API", False, "No job results returned")
                    return False
            else:
                self.log_test("Job Search API", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Job Search API", False, f"Connection error: {str(e)}")
            return False

    def test_resume_templates(self):
        """Test GET /api/resume-templates endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/resume-templates", timeout=10)
            
            if response.status_code == 200:
                templates = response.json()
                
                if isinstance(templates, list) and len(templates) >= 3:
                    # Verify template structure
                    first_template = templates[0]
                    required_fields = ["id", "name", "description", "download_url", "category"]
                    missing_fields = [field for field in required_fields if field not in first_template]
                    
                    if not missing_fields:
                        # Check for expected template IDs
                        template_ids = [t.get("id") for t in templates]
                        expected_ids = ["software_engineer", "data_scientist", "web_developer", "cybersecurity"]
                        found_expected = [tid for tid in expected_ids if tid in template_ids]
                        
                        if len(found_expected) >= 2:
                            self.log_test("Resume Templates API", True, f"Found {len(templates)} templates with proper structure")
                            return True, templates
                        else:
                            self.log_test("Resume Templates API", False, f"Missing expected template IDs: {expected_ids}")
                            return False, None
                    else:
                        self.log_test("Resume Templates API", False, f"Missing fields: {missing_fields}")
                        return False, None
                else:
                    self.log_test("Resume Templates API", False, f"Expected at least 3 templates, got {len(templates) if isinstance(templates, list) else 'invalid format'}")
                    return False, None
            else:
                self.log_test("Resume Templates API", False, f"HTTP {response.status_code}", response.text)
                return False, None
                
        except Exception as e:
            self.log_test("Resume Templates API", False, f"Connection error: {str(e)}")
            return False, None

    def test_resume_template_download(self, templates):
        """Test GET /api/resume-templates/{template_id}/download endpoint"""
        if not templates:
            self.log_test("Resume Template Download", False, "No templates available for testing")
            return False
            
        try:
            # Test with valid template IDs
            test_templates = ["software_engineer", "data_scientist"]
            success_count = 0
            
            for template_id in test_templates:
                response = self.session.get(f"{API_BASE}/resume-templates/{template_id}/download", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Verify template content structure
                    if "template_name" in data and "sections" in data:
                        sections = data.get("sections", [])
                        if sections and isinstance(sections, list):
                            # Check section structure
                            first_section = sections[0]
                            if "name" in first_section and "content" in first_section:
                                self.log_test(f"Resume Template Download ({template_id})", True, 
                                            f"Downloaded template with {len(sections)} sections")
                                success_count += 1
                            else:
                                self.log_test(f"Resume Template Download ({template_id})", False, 
                                            "Invalid section structure")
                        else:
                            self.log_test(f"Resume Template Download ({template_id})", False, 
                                        "Missing or invalid sections")
                    else:
                        self.log_test(f"Resume Template Download ({template_id})", False, 
                                    "Missing template_name or sections")
                else:
                    self.log_test(f"Resume Template Download ({template_id})", False, 
                                f"HTTP {response.status_code}")
            
            # Test with invalid template ID
            response = self.session.get(f"{API_BASE}/resume-templates/invalid_template/download", timeout=10)
            if response.status_code == 404:
                self.log_test("Resume Template Download (Invalid ID)", True, "Correctly returned 404 for invalid template")
                success_count += 1
            else:
                self.log_test("Resume Template Download (Invalid ID)", False, f"Expected 404, got {response.status_code}")
            
            return success_count >= 2
                
        except Exception as e:
            self.log_test("Resume Template Download", False, f"Connection error: {str(e)}")
            return False

    def test_job_application_auth_required(self):
        """Test POST /api/jobs/apply endpoint (authentication required)"""
        try:
            # Test without authentication (should fail)
            application_data = {
                "job_id": "test_job_123",
                "applicant_name": "John Smith",
                "email": "john.smith@email.com",
                "phone": "555-0123",
                "cover_letter": "I am interested in this position..."
            }
            
            response = self.session.post(f"{API_BASE}/jobs/apply", json=application_data, timeout=10)
            
            if response.status_code == 403:
                self.log_test("Job Application (No Auth)", True, "Correctly requires authentication")
                return True
            elif response.status_code == 401:
                self.log_test("Job Application (No Auth)", True, "Correctly requires authentication (401)")
                return True
            else:
                self.log_test("Job Application (No Auth)", False, f"Expected 401/403, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Job Application (No Auth)", False, f"Connection error: {str(e)}")
            return False

    def test_my_applications_auth_required(self):
        """Test GET /api/jobs/my-applications endpoint (authentication required)"""
        try:
            # Test without authentication (should fail)
            response = self.session.get(f"{API_BASE}/jobs/my-applications", timeout=10)
            
            if response.status_code == 403:
                self.log_test("My Applications (No Auth)", True, "Correctly requires authentication")
                return True
            elif response.status_code == 401:
                self.log_test("My Applications (No Auth)", True, "Correctly requires authentication (401)")
                return True
            else:
                self.log_test("My Applications (No Auth)", False, f"Expected 401/403, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("My Applications (No Auth)", False, f"Connection error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("TechPathfinder Backend API Testing Suite")
        print("=" * 60)
        print(f"Testing backend at: {API_BASE}")
        print()
        
        # Test 1: Health Check (High Priority)
        health_ok = self.test_health_check()
        
        # Test 2: Career Paths API (High Priority - Core Value)
        career_paths_ok, career_paths = self.test_career_paths_list()
        career_detail_ok = self.test_career_path_detail(career_paths)
        
        # Test 3: Authentication (High Priority)
        auth_login_ok = self.test_auth_login()
        auth_profile_ok = self.test_auth_profile()
        
        # Test 4: Job Guidance (Medium Priority)
        job_guidance_ok = self.test_job_guidance()
        
        # Test 5: Blog Posts (Medium Priority)
        blog_posts_ok = self.test_blog_posts()
        
        # Test 6: NEW JOB-RELATED APIs (High Priority)
        print("=" * 40)
        print("TESTING NEW JOB-RELATED APIS")
        print("=" * 40)
        
        job_search_ok = self.test_job_search()
        resume_templates_ok, templates = self.test_resume_templates()
        resume_download_ok = self.test_resume_template_download(templates)
        job_apply_auth_ok = self.test_job_application_auth_required()
        my_apps_auth_ok = self.test_my_applications_auth_required()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print()
        
        # Critical functionality assessment
        core_apis_working = health_ok and career_paths_ok and career_detail_ok
        auth_working = auth_login_ok and auth_profile_ok
        content_working = job_guidance_ok and blog_posts_ok
        job_apis_working = job_search_ok and resume_templates_ok and resume_download_ok and job_apply_auth_ok and my_apps_auth_ok
        
        print("CORE FUNCTIONALITY STATUS:")
        print(f"✅ Health & Career Paths (Core Value): {'WORKING' if core_apis_working else 'FAILED'}")
        print(f"✅ Authentication System: {'WORKING' if auth_working else 'FAILED'}")
        print(f"✅ Content APIs (Job/Blog): {'WORKING' if content_working else 'FAILED'}")
        print(f"✅ NEW Job-Related APIs: {'WORKING' if job_apis_working else 'FAILED'}")
        print()
        
        if core_apis_working and job_apis_working:
            print("🎉 ALL BACKEND FUNCTIONALITY IS WORKING!")
            print("Both core features and new job-related APIs are functional.")
        elif core_apis_working:
            print("✅ CORE BACKEND FUNCTIONALITY IS WORKING!")
            print("⚠️  Some issues found in new job-related APIs.")
        else:
            print("⚠️  CRITICAL ISSUES FOUND IN CORE FUNCTIONALITY")
            print("Career exploration features need attention.")
        
        return {
            "total_tests": total_tests,
            "passed": passed_tests,
            "core_working": core_apis_working,
            "auth_working": auth_working,
            "content_working": content_working,
            "job_apis_working": job_apis_working,
            "detailed_results": self.test_results
        }

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results["core_working"]:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure
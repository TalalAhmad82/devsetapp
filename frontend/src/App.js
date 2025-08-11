import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

// Context for authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('session_token');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`);
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('session_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Header Component
const Header = () => {
  const { user, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">Devset</span>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
            <a href="#careers" className="text-gray-700 hover:text-blue-600 transition-colors">Careers</a>
            <a href="#jobs" className="text-gray-700 hover:text-blue-600 transition-colors">Jobs</a>
            <a href="#blog" className="text-gray-700 hover:text-blue-600 transition-colors">Blog</a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.picture && (
                  <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
            
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Home</a>
              <a href="#careers" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Careers</a>
              <a href="#jobs" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Jobs</a>
              <a href="#blog" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Blog</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Discover Your Path in 
              <span className="text-blue-600"> Tech</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explore exciting computer science and IT careers with our comprehensive roadmaps, 
              free resources, and expert guidance tailored for students aged 16-25.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Exploring
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="lg:text-right">
            <img 
              src="https://images.unsplash.com/photo-1637249769470-3c4f4506a263" 
              alt="Student learning technology" 
              className="rounded-2xl shadow-2xl max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Career Paths Section
const CareerPathsSection = () => {
  const [careerPaths, setCareerPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  const fetchCareerPaths = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/career-paths`);
      const data = await response.json();
      setCareerPaths(data.career_paths);
    } catch (error) {
      console.error('Error fetching career paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCareerDetails = (path) => {
    setSelectedPath(path);
  };

  const closeCareerDetails = () => {
    setSelectedPath(null);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading career paths...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="careers" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Tech Career Paths</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from various exciting career paths in computer science and IT. 
            Each path includes detailed roadmaps, resources, and expert guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careerPaths.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden cursor-pointer"
              onClick={() => openCareerDetails(path)}
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{path.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                <p className="text-gray-600 mb-4">{path.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {path.salary_range}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {path.job_outlook}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {path.difficulty_level}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {path.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {path.skills.length > 3 && (
                      <span className="text-gray-400 text-xs">+{path.skills.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Details Modal */}
      {selectedPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-6xl mb-4">{selectedPath.icon}</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedPath.title}</h2>
                  <p className="text-lg text-gray-600">{selectedPath.description}</p>
                </div>
                <button
                  onClick={closeCareerDetails}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Learning Roadmap */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Learning Roadmap</h3>
                  <div className="space-y-4">
                    {selectedPath.roadmap.map((step, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 pb-4">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3">
                            {step.step}
                          </span>
                          <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                        <span className="text-xs text-blue-600 font-medium">Duration: {step.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources & Skills */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🛠️ Key Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPath.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">📖 Free Resources</h3>
                  <div className="space-y-3">
                    {selectedPath.resources.map((resource, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-1">{resource.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Type: {resource.type}</p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Visit Resource →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Job Guidance Section
const JobGuidanceSection = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchResumeTemplates();
    if (user) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchResumeTemplates = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/resume-templates`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching resume templates:', error);
    }
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/jobs/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMyApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const searchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/jobs/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery || 'software developer',
          location: location,
          job_type: jobType
        })
      });
      const data = await response.json();
      setJobs(data.results || []);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const openApplicationModal = (job) => {
    if (!user) {
      alert('Please sign in to apply for jobs');
      return;
    }
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const submitApplication = async (applicationData) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/jobs/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...applicationData,
          job_id: selectedJob.id
        })
      });
      
      if (response.ok) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        fetchMyApplications();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    }
  };

  const downloadTemplate = async (templateId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/resume-templates/${templateId}/download`);
      const data = await response.json();
      
      // Create a downloadable text file with the template structure
      const content = `${data.template_name}\n\n${data.sections.map(section => 
        `${section.name}:\n${section.content}\n\n`
      ).join('')}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.template_name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  return (
    <section id="jobs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Jobs & Career Resources</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find real job opportunities, apply directly, and access professional resume templates 
            to boost your career in tech.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {['search', 'templates', 'applications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab === 'search' && '🔍 Job Search'}
                {tab === 'templates' && '📄 Resume Templates'}
                {tab === 'applications' && '📋 My Applications'}
              </button>
            ))}
          </div>
        </div>

        {/* Job Search Tab */}
        {activeTab === 'search' && (
          <div>
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Job title or keyword"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Job Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <button
                    onClick={searchJobs}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search Jobs'}
                  </button>
                </div>
              </div>
            </div>

            {/* Job Results */}
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-lg text-blue-600 font-semibold mb-1">{job.company}</p>
                      <p className="text-gray-600 mb-2">📍 {job.location}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>💰 {job.salary}</span>
                        <span>📅 {new Date(job.posted_date).toLocaleDateString()}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {job.job_type}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{job.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openApplicationModal(job)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </button>
                    {job.apply_url && job.apply_url !== '#' && (
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View Original
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {jobs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No jobs found. Try searching with different keywords.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid md:grid-cols-2 gap-8">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={template.preview_url}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full mb-4 inline-block">
                    {template.category}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadTemplate(template.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {!user ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">Please sign in to view your applications</p>
                <button
                  onClick={() => {/* This should trigger login */}}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Application #{application.id.slice(0, 8)}
                        </h3>
                        <p className="text-gray-600">Applied: {new Date(application.applied_at).toLocaleDateString()}</p>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                            application.status === 'hired' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {myApplications.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <p className="text-gray-600">You haven't submitted any applications yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedJob && (
          <ApplicationModal
            job={selectedJob}
            onClose={() => setShowApplicationModal(false)}
            onSubmit={submitApplication}
          />
        )}
      </div>
    </section>
  );
};

// Application Modal Component
const ApplicationModal = ({ job, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    cover_letter: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.applicant_name || !formData.email || !formData.cover_letter) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
              <p className="text-lg text-blue-600 font-semibold">{job.title}</p>
              <p className="text-gray-600">{job.company} - {job.location}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.applicant_name}
                onChange={(e) => setFormData({...formData, applicant_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                required
                rows={6}
                value={formData.cover_letter}
                onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Blog Section
const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/posts`);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Student Success Tips</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get motivated and learn strategies for personal development, effective learning, 
            and building a successful career in tech.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">👤</span>
                    {post.author}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <h3 className="text-2xl font-bold">Devset</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering the next generation of tech professionals with comprehensive 
              career guidance and learning resources powered by Devset.
            </p>
            <div className="flex space-x-4">
              <span className="text-2xl cursor-pointer hover:text-blue-400">📧</span>
              <span className="text-2xl cursor-pointer hover:text-blue-400">🐦</span>
              <span className="text-2xl cursor-pointer hover:text-blue-400">💼</span>
              <span className="text-2xl cursor-pointer hover:text-blue-400">📘</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Career Paths</a></li>
              <li><a href="#jobs" className="hover:text-white transition-colors">Job Guidance</a></li>
              <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Devset. All rights reserved. Built for students, by students.</p>
        </div>
      </div>
    </footer>
  );
};

// Profile Page Component
const ProfilePage = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check if we're on the profile page with session_id in URL fragment
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const sessionIdFromURL = params.get('session_id');
    
    if (sessionIdFromURL) {
      setSessionId(sessionIdFromURL);
      authenticateUser(sessionIdFromURL);
    }
  }, []);

  const authenticateUser = async (sessionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('session_token', data.session_token);
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  if (sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Authentication</h2>
          <p className="text-gray-600">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          {user ? (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 text-center">
                {user.picture && (
                  <img src={user.picture} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4" />
                )}
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
              <p className="text-gray-600 mb-8">You need to be signed in to view your profile.</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Simple routing based on URL path
    const path = window.location.pathname;
    if (path === '/profile') {
      setCurrentPage('profile');
    } else {
      setCurrentPage('home');
    }
  }, []);

  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gray-50">
        {currentPage === 'profile' ? (
          <ProfilePage />
        ) : (
          <>
            <Header />
            <main>
              <HeroSection />
              <CareerPathsSection />
              <JobGuidanceSection />
              <BlogSection />
            </main>
            <Footer />
          </>
        )}
      </div>
    </AuthProvider>
  );
};

export default App;
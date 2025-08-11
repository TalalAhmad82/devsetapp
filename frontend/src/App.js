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
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobGuidance();
  }, []);

  const fetchJobGuidance = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/job-guidance`);
      const data = await response.json();
      setGuidance(data);
    } catch (error) {
      console.error('Error fetching job guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job guidance...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="jobs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Land Your Dream Job</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get expert guidance on finding internships, applying for entry-level positions, 
            and acing your interviews in the tech industry.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Internship Tips */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              Internship Tips
            </h3>
            <ul className="space-y-4">
              {guidance?.internship_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-blue-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">📋</span>
              Application Process
            </h3>
            <ul className="space-y-4">
              {guidance?.application_process.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-green-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Resume Templates & Interview Prep */}
        <div className="grid lg:grid-cols-2 gap-12 mt-12">
          {/* Resume Templates */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">📄</span>
              Resume Templates
            </h3>
            <div className="space-y-4">
              {guidance?.resume_templates.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  <a
                    href={template.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors inline-block"
                  >
                    Download Template
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Preparation */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">🎤</span>
              Interview Preparation
            </h3>
            <ul className="space-y-4">
              {guidance?.interview_prep.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-purple-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
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
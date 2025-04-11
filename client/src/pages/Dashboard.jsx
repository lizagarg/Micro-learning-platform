import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch lessons
        const lessonsResponse = await axios.get('https://micro-learning-platform.onrender.com/api/lessons');
        setLessons(lessonsResponse.data);
        
        // Fetch user progress
        if (user && user._id) {
          const progressResponse = await axios.get(`https://micro-learning-platform.onrender.com/api/progress/${user._id}`);
          
          // Transform progress data to be more easily accessible
          const progressMap = {};
          progressResponse.data.forEach((item) => {
            progressMap[item.lessonId] = item;
          });
          
          setProgress(progressMap);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    if (!lessons.length) return 0;
    
    const completedLessons = Object.values(progress).filter(p => p.completed).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  // Calculate current streak
  const calculateStreak = () => {
    if (!Object.keys(progress).length) return 0;
    
    // This is a simplified streak calculation
    // A real implementation would check for consecutive days
    return Object.values(progress).filter(p => p.lastAccessed).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'Learner'}!</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Overall Progress</p>
                <p className="mt-2 text-3xl font-bold text-blue-800">{calculateOverallProgress()}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Current Streak</p>
                <p className="mt-2 text-3xl font-bold text-green-800">{calculateStreak()} days</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Lessons Completed</p>
                <p className="mt-2 text-3xl font-bold text-purple-800">
                  {Object.values(progress).filter(p => p.completed).length} / {lessons.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Lessons</h2>
            
            {error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : null}

            {lessons.length === 0 ? (
              <p className="text-gray-500">No lessons available right now. Check back later!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson) => {
                  const lessonProgress = progress[lesson._id] || { completed: false, percentComplete: 0 };
                  
                  return (
                    <div key={lesson._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{lesson.title}</h3>
                        <p className="text-gray-500 text-sm mb-3">
                          {lesson.description ? lesson.description.substring(0, 80) + '...' : 'No description available'}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                          <div 
                            className={`h-2.5 rounded-full ${lessonProgress.completed ? 'bg-green-600' : 'bg-blue-600'}`}
                            style={{ width: `${lessonProgress.percentComplete || 0}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {lessonProgress.completed ? 'Completed' : `${lessonProgress.percentComplete || 0}% complete`}
                          </span>
                          <Link 
                            to={`/lessons/${lesson._id}`}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            {lessonProgress.percentComplete > 0 ? 'Continue' : 'Start'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 

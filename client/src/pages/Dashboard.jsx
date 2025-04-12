import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [userStats, setUserStats] = useState({
    overallProgress: 0,
    currentStreak: 0,
    lessonsCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch lessons
        const lessonsResponse = await axios.get('/api/lessons');
        setLessons(lessonsResponse.data);
        
        // Fetch user progress
        if (user && user._id) {
          const progressResponse = await axios.get(`/api/progress/${user._id}`);
          
          // Transform progress data to be more easily accessible
          const progressMap = {};
          let totalStreak = 0;
          let completedLessons = 0;
          
          progressResponse.data.forEach((item) => {
            progressMap[item.lessonId] = item;
            
            // Get streak from highest streak count in any lesson
            if (item.currentStreak > totalStreak) {
              totalStreak = item.currentStreak;
            }
            
            // Count completed lessons
            if (item.completed) {
              completedLessons++;
            }
          });
          
          setProgress(progressMap);
          
          // Calculate overall progress
          const overallPercentage = lessonsResponse.data.length > 0 
            ? Math.round((completedLessons / lessonsResponse.data.length) * 100)
            : 0;
            
          setUserStats({
            overallProgress: overallPercentage,
            currentStreak: totalStreak,
            lessonsCompleted: completedLessons
          });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {user?.name || 'Learner'}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Continue your learning journey</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8 transition-colors duration-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg transition-colors duration-200">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Overall Progress</p>
                <p className="mt-2 text-3xl font-bold text-blue-800 dark:text-blue-200">{userStats.overallProgress}%</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg transition-colors duration-200">
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Current Streak</p>
                <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{userStats.currentStreak} days</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {userStats.currentStreak > 0 
                    ? 'Keep learning daily to increase your streak!' 
                    : 'Start your streak by completing lessons today!'}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg transition-colors duration-200">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Lessons Completed</p>
                <p className="mt-2 text-3xl font-bold text-purple-800 dark:text-purple-200">
                  {userStats.lessonsCompleted} / {lessons.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Lessons</h2>
            
            {error ? (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : null}

            {lessons.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No lessons available right now. Check back later!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson) => {
                  const lessonProgress = progress[lesson._id] || { completed: false, percentComplete: 0 };
                  
                  return (
                    <div key={lesson._id} className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-200 bg-white dark:bg-gray-800">
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{lesson.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                          {lesson.description ? lesson.description.substring(0, 80) + '...' : 'No description available'}
                        </p>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                          <div 
                            className={`h-2.5 rounded-full ${lessonProgress.completed ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}`}
                            style={{ width: `${lessonProgress.percentComplete || 0}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {lessonProgress.completed ? 'Completed' : `${lessonProgress.percentComplete || 0}% complete`}
                          </span>
                          <Link 
                            to={`/lessons/${lesson._id}`}
                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded transition-colors duration-200"
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

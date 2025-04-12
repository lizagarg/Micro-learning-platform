import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch lesson data
        const lessonResponse = await axios.get(`/api/lessons/${lessonId}`);
        setLesson(lessonResponse.data);
        
        // Fetch user progress for this lesson
        if (user && user._id) {
          try {
            const progressResponse = await axios.get(`/api/progress/${user._id}/${lessonId}`);
            setProgress(progressResponse.data);
            
            // If there's saved progress, set the current step
            if (progressResponse.data && progressResponse.data.currentStep) {
              setCurrentStep(progressResponse.data.currentStep);
            }
          } catch (err) {
            // It's ok if there's no progress yet
            console.log('No existing progress found');
          }
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, user]);

  // Update progress in the backend
  const updateProgress = async (updatedProgress) => {
    try {
      if (!user || !user._id) {
        console.error('Cannot update progress: User or user ID is missing', user);
        return;
      }
      
      console.log('Updating progress with user:', user);
      console.log('User ID for progress update:', user._id);
      
      const progressData = {
        userId: user._id.toString(), // Ensure it's a string
        lessonId,
        ...updatedProgress,
        // lastAccessed will be updated on the server automatically
      };
      
      console.log('Sending progress data:', progressData);
      
      const response = await axios.post('/api/progress', progressData);
      console.log('Progress update response:', response.data);
      
      // Update local progress state with the response from server
      // which will include the updated streak information
      setProgress(response.data);
      
    } catch (err) {
      console.error('Error updating progress:', err.response?.data || err.message);
    }
  };

  const handleNextStep = async () => {
    if (!lesson || !lesson.content) return;
    
    // If there are questions in the current step and not all are answered correctly
    const currentContent = lesson.content[currentStep];
    if (currentContent.questions && currentContent.questions.length > 0) {
      const allQuestionsAnsweredCorrectly = currentContent.questions.every(
        (q) => feedbacks[q._id] && feedbacks[q._id].correct
      );
      
      if (!allQuestionsAnsweredCorrectly) {
        // Don't allow proceeding unless all questions are answered correctly
        setError('Please answer all questions correctly before proceeding.');
        return;
      }
    }
    
    // Clear any previous errors
    setError('');
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Calculate progress percentage
    const percentComplete = Math.round((nextStep / lesson.content.length) * 100);
    const isCompleted = nextStep >= lesson.content.length;
    
    // Update progress in backend
    await updateProgress({
      currentStep: nextStep,
      percentComplete,
      completed: isCompleted
    });
    
    // If the lesson is completed, redirect back to dashboard after a delay
    if (isCompleted) {
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer
    });
  };

  const checkAnswer = (questionId) => {
    if (!lesson) return;
    
    const currentContent = lesson.content[currentStep];
    const question = currentContent.questions.find(q => q._id === questionId);
    
    if (!question) return;
    
    const isCorrect = answers[questionId] === question.correctAnswer;
    
    setFeedbacks({
      ...feedbacks,
      [questionId]: {
        checked: true,
        correct: isCorrect,
        message: isCorrect ? 'Correct!' : 'Try again'
      }
    });
    
    // Only save correct answers to progress
    if (isCorrect) {
      // Update answers in progress
      const updatedAnswers = { ...progress?.answers } || {};
      updatedAnswers[questionId] = {
        selected: answers[questionId],
        correct: isCorrect
      };
      
      updateProgress({ answers: updatedAnswers });
    }
  };

  // Add function to reset feedback for a question
  const resetQuestionFeedback = (questionId) => {
    const newFeedbacks = { ...feedbacks };
    delete newFeedbacks[questionId];
    setFeedbacks(newFeedbacks);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error || 'Lesson not found'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Lesson completion
  if (currentStep >= lesson.content.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center transition-colors duration-200">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Congratulations!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              You have completed the "{lesson.title}" lesson.
            </p>
            <div className="mb-8">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Redirecting to dashboard in a few seconds...
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              Return to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = lesson.content[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
            <div 
              className="h-2.5 rounded-full bg-blue-600 dark:bg-blue-500"
              style={{ width: `${Math.round((currentStep / lesson.content.length) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {lesson.content.length}
          </p>
        </div>

        {/* Lesson content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors duration-200">
          {currentContent.type === 'text' && (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{currentContent.title}</h2>
              <div className="text-gray-700 dark:text-gray-300">{currentContent.body}</div>
            </div>
          )}

          {currentContent.type === 'video' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{currentContent.title}</h2>
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe 
                  src={currentContent.videoUrl} 
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                  title={currentContent.title}
                ></iframe>
              </div>
              {currentContent.description && (
                <div className="text-gray-700 dark:text-gray-300 mt-4">{currentContent.description}</div>
              )}
            </div>
          )}

          {/* Questions for this step */}
          {currentContent.questions && currentContent.questions.length > 0 && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Check Your Understanding</h3>
              
              {currentContent.questions.map((question, qIndex) => (
                <div key={question._id || qIndex} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">{question.text}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`question_${question._id}_option_${oIndex}`}
                          name={`question_${question._id}`}
                          value={option}
                          checked={answers[question._id] === option}
                          onChange={() => handleAnswerChange(question._id, option)}
                          className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <label
                          htmlFor={`question_${question._id}_option_${oIndex}`}
                          className="ml-2 block text-gray-700 dark:text-gray-300"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {!feedbacks[question._id]?.checked ? (
                    <button
                      onClick={() => checkAnswer(question._id)}
                      disabled={!answers[question._id]}
                      className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="mt-3">
                      <div className={`p-2 rounded ${feedbacks[question._id].correct ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'}`}>
                        {feedbacks[question._id].message}
                      </div>
                      
                      {/* Add Try Again button for incorrect answers */}
                      {!feedbacks[question._id].correct && (
                        <button
                          onClick={() => resetQuestionFeedback(question._id)}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>
          <button
            onClick={handleNextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            {currentStep < lesson.content.length - 1 ? 'Next' : 'Complete Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail; 

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
      if (!user || !user._id) return;
      
      const progressData = {
        userId: user._id,
        lessonId,
        ...updatedProgress,
        lastAccessed: new Date().toISOString()
      };
      
      await axios.post('/api/progress', progressData);
      
      // Update local progress state
      setProgress({
        ...progress,
        ...updatedProgress
      });
    } catch (err) {
      console.error('Error updating progress:', err);
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
    
    // Update answers in progress
    const updatedAnswers = { ...progress?.answers } || {};
    updatedAnswers[questionId] = {
      selected: answers[questionId],
      correct: isCorrect
    };
    
    updateProgress({ answers: updatedAnswers });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Lesson not found'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h1>
            <p className="text-xl text-gray-600 mb-6">
              You have completed the "{lesson.title}" lesson.
            </p>
            <div className="mb-8">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 mb-6">
              Redirecting to dashboard in a few seconds...
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="h-2.5 rounded-full bg-blue-600"
              style={{ width: `${Math.round((currentStep / lesson.content.length) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {lesson.content.length}
          </p>
        </div>

        {/* Lesson content */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {currentContent.type === 'text' && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">{currentContent.title}</h2>
              <div className="text-gray-700">{currentContent.body}</div>
            </div>
          )}

          {currentContent.type === 'video' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{currentContent.title}</h2>
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe 
                  src={currentContent.videoUrl} 
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                  title={currentContent.title}
                ></iframe>
              </div>
              {currentContent.description && (
                <div className="text-gray-700 mt-4">{currentContent.description}</div>
              )}
            </div>
          )}

          {/* Questions for this step */}
          {currentContent.questions && currentContent.questions.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Check Your Understanding</h3>
              
              {currentContent.questions.map((question, qIndex) => (
                <div key={question._id || qIndex} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-3">{question.text}</p>
                  
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`question_${question._id}_option_${oIndex}`}
                          className="ml-2 block text-gray-700"
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
                      className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className={`mt-3 p-2 rounded ${feedbacks[question._id].correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {feedbacks[question._id].message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {currentStep < lesson.content.length - 1 ? 'Next' : 'Complete Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail; 
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const PomodoroTimer = ({ isOpen, onClose, task, onSessionComplete, timerState, onTimerUpdate }) => {
  const [settings, setSettings] = useState({
    focusTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsUntilLongBreak: 4,
    targetSessions: 4
  });
  
  const currentSession = timerState || {
    type: 'focus',
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    sessionCount: 0,
    completedFocusSessions: 0,
    isRunning: false,
    isPaused: false
  };

  const setCurrentSession = (newState) => {
    if (onTimerUpdate) {
      if (typeof newState === 'function') {
        onTimerUpdate(newState(currentSession));
      } else {
        onTimerUpdate(newState);
      }
    }
  };
  
  const [showSettings, setShowSettings] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (!timerState || (!timerState.isRunning && timerState.timeLeft === 25 * 60)) {
        resetTimer();
      }
      audioRef.current = new Audio();
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (currentSession.timeLeft === 0 && currentSession.isRunning) {
      handleSessionComplete();
    }
  }, [currentSession.timeLeft, currentSession.isRunning]);

  const resetTimer = () => {
    const focusTimeInSeconds = settings.focusTime * 60;
    setSessionHistory([]);
    setCurrentSession({
      taskId: task?.id,
      type: 'focus',
      timeLeft: focusTimeInSeconds,
      totalTime: focusTimeInSeconds,
      sessionCount: 0,
      completedFocusSessions: 0,
      isRunning: false,
      isPaused: false
    });
  };

  const startTimer = async () => {
    if (currentSession.type === 'focus' && task && !currentSession.isPaused) {
      try {
        await api.post(`/api/tasks/${task.id}/start_pomodoro/`);
      } catch (error) {
        console.error('Error starting pomodoro session:', error);
      }
    }
    
    setCurrentSession(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));
  };

  const pauseTimer = () => {
    setCurrentSession(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  };

  const stopTimer = async () => {
    if (currentSession.type === 'focus' && task && currentSession.isRunning) {
      try {
        await api.post(`/api/tasks/${task.id}/end_pomodoro/`);
      } catch (error) {
        console.error('Error ending pomodoro session:', error);
      }
    }
    
    resetTimer();
  };

  const skipToBreak = async () => {
    if (currentSession.type === 'focus') {
      if (task && currentSession.isRunning) {
        try {
          await api.post(`/api/tasks/${task.id}/end_pomodoro/`);
        } catch (error) {
          console.error('Error ending pomodoro session:', error);
        }
      }

      const newSessionCount = currentSession.sessionCount + 1;
      const newCompletedFocusSessions = currentSession.completedFocusSessions + 1;
      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
      const breakTime = isLongBreak ? settings.longBreakTime : settings.breakTime;
      const breakTimeInSeconds = breakTime * 60;

      const completedSession = {
        type: 'focus',
        duration: currentSession.totalTime,
        completedAt: new Date(),
        taskName: task?.name || 'General Session',
        skipped: true
      };
      
      setSessionHistory(prev => [...prev, completedSession]);

      if (onSessionComplete) {
        onSessionComplete(completedSession);
      }

      setCurrentSession({
        taskId: task?.id || currentSession.taskId,
        type: isLongBreak ? 'longBreak' : 'break',
        timeLeft: breakTimeInSeconds,
        totalTime: breakTimeInSeconds,
        sessionCount: newSessionCount,
        completedFocusSessions: newCompletedFocusSessions,
        isRunning: false,
        isPaused: false
      });
    }
  };

  const skipToFocus = () => {
    if (currentSession.type === 'break' || currentSession.type === 'longBreak') {
      const completedSession = {
        type: currentSession.type,
        duration: currentSession.totalTime,
        completedAt: new Date(),
        taskName: task?.name || 'General Session',
        skipped: true
      };
      
      setSessionHistory(prev => [...prev, completedSession]);

      if (onSessionComplete) {
        onSessionComplete(completedSession);
      }

      const focusTimeInSeconds = settings.focusTime * 60;
      setCurrentSession({
        taskId: task?.id || currentSession.taskId,
        type: 'focus',
        timeLeft: focusTimeInSeconds,
        totalTime: focusTimeInSeconds,
        sessionCount: currentSession.sessionCount,
        completedFocusSessions: currentSession.completedFocusSessions,
        isRunning: false,
        isPaused: false
      });
    }
  };

  const markTaskComplete = async () => {
    if (task) {
      try {
        await api.post(`/api/tasks/${task.id}/complete/`);
        
        if (onSessionComplete) {
          onSessionComplete({ taskCompleted: true });
        }
        
        onClose();
      } catch (error) {
        console.error('Error completing task:', error);
      }
    }
  };

  const handleSessionComplete = async () => {
    playNotificationSound();
    
    const completedSession = {
      type: currentSession.type,
      duration: currentSession.totalTime,
      completedAt: new Date(),
      taskName: task?.name || 'General Session'
    };
    
    setSessionHistory(prev => [...prev, completedSession]);

    if (currentSession.type === 'focus') {
      if (task) {
        try {
          await api.post(`/api/tasks/${task.id}/end_pomodoro/`);
          
          if (onSessionComplete) {
            onSessionComplete(completedSession);
          }
        } catch (error) {
          console.error('Error ending pomodoro session:', error);
        }
      }

      const newSessionCount = currentSession.sessionCount + 1;
      const newCompletedFocusSessions = currentSession.completedFocusSessions + 1;
      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
      const breakTime = isLongBreak ? settings.longBreakTime : settings.breakTime;
      const breakTimeInSeconds = breakTime * 60;

      setCurrentSession({
        taskId: task?.id || currentSession.taskId,
        type: isLongBreak ? 'longBreak' : 'break',
        timeLeft: breakTimeInSeconds,
        totalTime: breakTimeInSeconds,
        sessionCount: newSessionCount,
        completedFocusSessions: newCompletedFocusSessions,
        isRunning: false,
        isPaused: false
      });
    } else {
      const focusTimeInSeconds = settings.focusTime * 60;
      setCurrentSession({
        taskId: task?.id || currentSession.taskId,
        type: 'focus',
        timeLeft: focusTimeInSeconds,
        totalTime: focusTimeInSeconds,
        sessionCount: currentSession.sessionCount,
        completedFocusSessions: currentSession.completedFocusSessions,
        isRunning: false,
        isPaused: false
      });
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBC2B0+7U'
      audioRef.current.play().catch(() => {});
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeInfo = () => {
    switch (currentSession.type) {
      case 'focus':
        return {
          title: 'Focus Time',
          icon: '🎯',
          accentColor: 'var(--primary)',
          bgColor: 'var(--primary-light)',
          textColor: 'var(--text)'
        };
      case 'break':
        return {
          title: 'Short Break',
          icon: '☕',
          accentColor: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          textColor: 'var(--text)'
        };
      case 'longBreak':
        return {
          title: 'Long Break',
          icon: '🌊',
          accentColor: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)',
          textColor: 'var(--text)'
        };
      default:
        return {
          title: 'Focus Time',
          icon: '🎯',
          accentColor: 'var(--primary)',
          bgColor: 'var(--primary-light)',
          textColor: 'var(--text)'
        };
    }
  };

  const progress = ((currentSession.totalTime - currentSession.timeLeft) / currentSession.totalTime) * 100;
  const sessionInfo = getSessionTypeInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border)'
          }}
        >
          <div 
            className="px-6 py-4"
            style={{
              backgroundColor: sessionInfo.bgColor,
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <h2 
                className="text-2xl font-bold flex items-center space-x-2"
                style={{ color: sessionInfo.textColor }}
              >
                <span className="text-3xl">{sessionInfo.icon}</span>
                <span>Pomodoro Timer</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--hover)]"
                  style={{ color: 'var(--text-gray)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--hover)]"
                  style={{ color: 'var(--text-gray)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {task && (
              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: sessionInfo.bgColor,
                  border: '1px solid var(--border)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sessionInfo.accentColor }}
                  ></div>
                  <span 
                    className="font-semibold"
                    style={{ color: sessionInfo.textColor }}
                  >
                    Working on:
                  </span>
                </div>
                <p 
                  className="mt-2 font-medium"
                  style={{ color: sessionInfo.textColor }}
                >
                  {task.name}
                </p>
                
                <div className="mt-3">
                  <div 
                    className="flex items-center justify-between text-sm mb-1"
                    style={{ color: 'var(--text-light)' }}
                  >
                    <span>Progress</span>
                    <span>{currentSession.completedFocusSessions}/{settings.targetSessions} sessions</span>
                  </div>
                  <div 
                    className="w-full rounded-full h-2"
                    style={{ backgroundColor: 'var(--bg)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: sessionInfo.accentColor,
                        width: `${Math.min((currentSession.completedFocusSessions / settings.targetSessions) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full font-semibold mb-4"
                style={{
                  backgroundColor: sessionInfo.bgColor,
                  color: sessionInfo.textColor,
                  border: '1px solid var(--border)'
                }}
              >
                <span className="mr-2">{sessionInfo.icon}</span>
                {sessionInfo.title}
              </div>
              
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="8"
                    fill="none"
                    style={{ stroke: 'var(--border)' }}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                    style={{ stroke: sessionInfo.accentColor }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div 
                      className="text-6xl font-bold mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      {formatTime(currentSession.timeLeft)}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--text-light)' }}
                    >
                      Focus Sessions: {currentSession.completedFocusSessions}/{settings.targetSessions}
                    </div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-gray)' }}
                    >
                      Current Cycle: {currentSession.sessionCount + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-3 flex-wrap">
              {!currentSession.isRunning ? (
                <button
                  onClick={startTimer}
                  className="px-6 py-3 rounded font-semibold transition-all duration-200 flex items-center space-x-2 text-white hover:opacity-90"
                  style={{ backgroundColor: sessionInfo.accentColor }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>{currentSession.isPaused ? 'Resume' : 'Start'}</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-3 rounded font-semibold transition-all duration-200 flex items-center space-x-2 hover:bg-[var(--hover)]"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Pause</span>
                </button>
              )}
              
              {currentSession.type === 'focus' && (
                <button
                  onClick={skipToBreak}
                  className="px-6 py-3 rounded font-semibold transition-all duration-200 flex items-center space-x-2 text-white hover:opacity-90"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" clipRule="evenodd" />
                  </svg>
                  <span>Skip to Break</span>
                </button>
              )}

              {(currentSession.type === 'break' || currentSession.type === 'longBreak') && (
                <button
                  onClick={skipToFocus}
                  className="px-6 py-3 rounded font-semibold transition-all duration-200 flex items-center space-x-2 text-white hover:opacity-90"
                  style={{ backgroundColor: sessionInfo.accentColor }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M15.445 14.832A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4A1 1 0 0010 14v-2.798l5.445 3.63z" clipRule="evenodd" />
                  </svg>
                  <span>Skip to Focus</span>
                </button>
              )}
              
              <button
                onClick={stopTimer}
                className="px-6 py-3 rounded font-semibold transition-all duration-200 flex items-center space-x-2 hover:bg-red-700"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white'
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span>Reset</span>
              </button>
            </div>

            {task && currentSession.completedFocusSessions >= settings.targetSessions && (
              <div 
                className="mt-4 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid var(--primary)'
                }}
              >
                <div className="text-center">
                  <div 
                    className="font-semibold mb-2"
                    style={{ color: 'var(--text)' }}
                  >
                    🎉 Target Sessions Completed!
                  </div>
                  <div 
                    className="text-sm mb-3"
                    style={{ color: 'var(--text-light)' }}
                  >
                    You've completed {currentSession.completedFocusSessions} focus sessions. Ready to mark the task as done?
                  </div>
                  <button
                    onClick={markTaskComplete}
                    className="px-6 py-2 rounded font-semibold transition-all duration-200 flex items-center space-x-2 mx-auto text-white hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mark Task Complete</span>
                  </button>
                </div>
              </div>
            )}

            {showSettings && (
              <div 
                className="pt-6 space-y-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--text)' }}
                >
                  Timer Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      Focus Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.focusTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, focusTime: parseInt(e.target.value) || 25 }))}
                      className="w-full px-3 py-2 rounded focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      Break Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.breakTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, breakTime: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-2 rounded focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      Long Break (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreakTime: parseInt(e.target.value) || 15 }))}
                      className="w-full px-3 py-2 rounded focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      Sessions until Long Break
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="8"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) || 4 }))}
                      className="w-full px-3 py-2 rounded focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text)' }}
                    >
                      Target Focus Sessions to Complete Task
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.targetSessions}
                      onChange={(e) => setSettings(prev => ({ ...prev, targetSessions: parseInt(e.target.value) || 4 }))}
                      className="w-full px-3 py-2 rounded focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-gray)' }}
                    >
                      Number of focus sessions needed before you can mark the task as complete
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    resetTimer();
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-2 rounded font-medium transition-colors hover:bg-[var(--hover)]"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)'
                  }}
                >
                  Apply Settings & Reset Timer
                </button>
              </div>
            )}

            {sessionHistory.length > 0 && (
              <div 
                className="pt-6"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--text)' }}
                >
                  Today's Sessions
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sessionHistory.slice(-5).map((session, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{session.type === 'focus' ? '🎯' : session.type === 'break' ? '☕' : '🌊'}</span>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--text)' }}
                        >
                          {session.taskName}
                        </span>
                        {session.skipped && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)'
                            }}
                          >
                            Skipped
                          </span>
                        )}
                      </div>
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-gray)' }}
                      >
                        {formatTime(session.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;

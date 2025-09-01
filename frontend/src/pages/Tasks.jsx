import { useState, useEffect } from 'react';
import TaskModal from '../components/TaskModal';
import ConfirmationModal from '../components/ConfirmationModal';
import PomodoroTimer from '../components/PomodoroTimer';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [activeTimers, setActiveTimers] = useState({});

  useEffect(() => {
    const intervals = {};
    
    Object.entries(activeTimers).forEach(([taskId, timer]) => {
      if (timer && timer.isRunning && timer.timeLeft > 0) {
        intervals[taskId] = setInterval(() => {
          setActiveTimers(prev => {
            const currentTimer = prev[taskId];
            if (currentTimer && currentTimer.timeLeft > 0) {
              return {
                ...prev,
                [taskId]: {
                  ...currentTimer,
                  timeLeft: currentTimer.timeLeft - 1
                }
              };
            }
            return prev;
          });
        }, 1000);
      } else if (timer && timer.timeLeft === 0 && timer.isRunning) {
        setActiveTimers(prev => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isRunning: false
          }
        }));
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [activeTimers]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setModalMode('create');
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleStartPomodoro = (task) => {
    setSelectedTask(task);
    
    const existingTimer = getTaskTimer(task.id);
    if (!existingTimer) {
      setActiveTimers(prev => ({
        ...prev,
        [task.id]: {
          taskId: task.id,
          timeLeft: 25 * 60,
          totalTime: 25 * 60,
          isRunning: false,
          type: 'focus',
          sessionCount: 0,
          completedFocusSessions: 0,
          isPaused: false
        }
      }));
    }
    
    setIsPomodoroOpen(true);
  };

  const handleTimerUpdate = (timerState) => {
    if (timerState && timerState.taskId) {
      setActiveTimers(prev => ({
        ...prev,
        [timerState.taskId]: timerState
      }));
    }
  };

  const getTaskTimer = (taskId) => {
    return activeTimers[taskId] || null;
  };

  const getTimerButtonContent = (taskId) => {
    const timer = getTaskTimer(taskId);
    const isRunning = timer && timer.isRunning;
    const timeLeft = timer ? timer.timeLeft : 0;
    
    return {
      isRunning,
      displayText: isRunning ? formatTime(timeLeft) : "Focus",
      title: isRunning ? "Timer Running - Click to view" : "Start Pomodoro Timer"
    };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePomodoroComplete = async (session) => {
    await fetchTasks();
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const endpoint = task.completed ? 'uncomplete' : 'complete';
      const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/${endpoint}/`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const saveTask = async (formData) => {
    const url = modalMode === 'edit' 
      ? `http://localhost:8000/api/tasks/${selectedTask.id}/`
      : 'http://localhost:8000/api/tasks/';
    
    const method = modalMode === 'edit' ? 'PUT' : 'POST';

    console.log(`${method} ${url}`, formData);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', response.status, errorText);
      throw new Error(`Failed to ${modalMode} task`);
    }

    await fetchTasks();
  };

  const deleteTask = async () => {
    const response = await fetch(`http://localhost:8000/api/tasks/${selectedTask.id}/`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    await fetchTasks();
  };

  const isOverdue = (dueDate, taskCompleted) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !taskCompleted;
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return `Due ${date.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 mx-auto" style={{borderTop: '2px solid var(--primary)', borderRight: '2px solid transparent'}}></div>
          <p className="mt-4 body" style={{color: 'var(--text-light)'}}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="title text-3xl mb-2">
              Tasks
            </h1>
            <p className="subtitle">Organize and track your tasks efficiently</p>
          </div>
          <button 
            onClick={handleCreateTask}
            className="btn-primary flex items-center space-x-2 px-4 py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New task</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--primary-light)'}}>
              <svg className="w-8 h-8" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="title text-xl mb-3">No tasks yet</h3>
            <p className="subtitle mb-8 max-w-md mx-auto">
              Start organizing your work. Create your first task to boost your productivity.
            </p>
            <button 
              onClick={handleCreateTask}
              className="primary px-6 py-2.5"
            >
              Create first task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="card p-5 group">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleTaskCompletion(task)}
                    className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0"
                    style={{
                      backgroundColor: task.completed ? 'var(--primary)' : 'transparent',
                      borderColor: task.completed ? 'var(--primary)' : 'var(--border)',
                      color: task.completed ? 'white' : 'var(--text)'
                    }}
                    onMouseEnter={(e) => {
                      if (!task.completed) {
                        e.target.style.borderColor = 'var(--text-gray)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!task.completed) {
                        e.target.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 transition-colors ${
                          task.completed 
                            ? 'line-through opacity-60' 
                            : ''
                        }`} style={{color: 'var(--text)'}}>
                          {task.name}
                        </h3>
                        
                        {task.description && (
                          <p className="body mb-3 whitespace-pre-wrap" style={{color: 'var(--text-light)'}}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {task.due_date && (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              isOverdue(task.due_date, task.completed) 
                                ? 'bg-red-900/30 text-red-300 border border-red-800' 
                                : 'bg-gray-800/50 text-gray-300'
                            }`}>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDueDate(task.due_date)}
                            </span>
                          )}
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--text-light)'}}
                                >
                                  {typeof tag === 'object' ? tag.name : tag}
                                </span>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="px-2 py-1 rounded text-xs font-medium" style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--text-gray)'}}>
                                  +{task.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}


                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3" style={{borderTop: '1px solid var(--border)'}}>
                          <div className="flex items-center space-x-4 caption">
                            <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                            {task.updated_at !== task.created_at && (
                              <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditTask(task)}
                            className="p-1.5 rounded transition-colors"
                            style={{color: 'var(--text-gray)'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            title="Edit task"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task)}
                            className="p-1.5 rounded transition-colors"
                            style={{color: 'var(--text-gray)'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            title="Delete task"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                          {!task.completed && (
                           (() => {
                             const buttonContent = getTimerButtonContent(task.id);
                             return (
                               <button 
                                 onClick={() => handleStartPomodoro(task)}
                                 className="btn-primary px-3 py-1.5 text-xs gap-1.5"
                                 title={buttonContent.title}
                               >
                                 {buttonContent.isRunning ? (
                                   <>
                                     <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                     </svg>
                                     <span>{buttonContent.displayText}</span>
                                   </>
                                 ) : (
                                   <>
                                     <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                     </svg>
                                     <span>{buttonContent.displayText}</span>
                                   </>
                                 )}
                               </button>
                             );
                           })()
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={saveTask}
        task={selectedTask}
        mode={modalMode}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteTask}
        item={selectedTask}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        confirmText="Delete Task"
        itemName="name"
        itemContent="description"
      />

      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        task={selectedTask}
        onSessionComplete={handlePomodoroComplete}
        timerState={selectedTask ? getTaskTimer(selectedTask.id) : null}
        onTimerUpdate={handleTimerUpdate}
      />
    </>
  );
};

export default Tasks;

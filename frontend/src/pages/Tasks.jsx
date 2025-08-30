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
    setIsPomodoroOpen(true);
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              📋 Tasks
            </h1>
            <p className="text-gray-600">Organize and track your tasks efficiently</p>
          </div>
          <button 
            onClick={handleCreateTask}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Task</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
            <div className="text-8xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No tasks yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start organizing your work. Create your first task to boost your productivity!
            </p>
            <button 
              onClick={handleCreateTask}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button 
                      onClick={() => toggleTaskCompletion(task)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-bold transition-colors mb-2 ${
                        task.completed 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900 group-hover:text-green-600'
                      }`}>
                        {task.name}
                      </h3>
                      
                      {task.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          task.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.completed ? '✅ Completed' : '⏳ Pending'}
                        </span>
                        
                        {task.due_date && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isOverdue(task.due_date, task.completed) 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                              >
                                {typeof tag === 'object' ? tag.name : tag}
                              </span>
                            ))}
                            {task.tags.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                +{task.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {task.total_pomodoro_time && task.total_pomodoro_time !== '0:00:00' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            🍅 {task.total_pomodoro_time}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-200/50">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                        {task.updated_at !== task.created_at && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-4">
                    {!task.completed && (
                      <button 
                        onClick={() => handleStartPomodoro(task)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50/80 transition-all duration-200 hover:scale-110"
                        title="Start Pomodoro Timer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditTask(task)}
                      className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50/80 transition-all duration-200 hover:scale-110"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50/80 transition-all duration-200 hover:scale-110"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
      />
    </>
  );
};

export default Tasks;

import { useState, useEffect } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ tasks: {}, notes: {} });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTasksOnly, setShowTasksOnly] = useState(false);
  const [showNotesOnly, setShowNotesOnly] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await fetch(
        `http://localhost:8000/api/calendar/?month=${month}&year=${year}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        const regroupedData = { tasks: {}, notes: {} };
        
        Object.values(data.tasks).flat().forEach(task => {
          if (task.due_date) {
            const taskDate = new Date(task.due_date);
            const localDate = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
            if (!regroupedData.tasks[localDate]) {
              regroupedData.tasks[localDate] = [];
            }
            regroupedData.tasks[localDate].push(task);
          }
        });
        
        Object.values(data.notes).flat().forEach(note => {
          const noteDate = new Date(note.created_at);
          const localDate = `${noteDate.getFullYear()}-${String(noteDate.getMonth() + 1).padStart(2, '0')}-${String(noteDate.getDate()).padStart(2, '0')}`;
          if (!regroupedData.notes[localDate]) {
            regroupedData.notes[localDate] = [];
          }
          regroupedData.notes[localDate].push(note);
        });
        
        setCalendarData(regroupedData);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getItemsForDate = (dateKey) => {
    const tasks = calendarData.tasks[dateKey] || [];
    const notes = calendarData.notes[dateKey] || [];
    
    let filteredTasks = tasks;
    let filteredNotes = notes;
    
    if (showTasksOnly) {
      filteredNotes = [];
    }
    if (showNotesOnly) {
      filteredTasks = [];
    }
    
    return { tasks: filteredTasks, notes: filteredNotes };
  };

  const hasItemsForDate = (dateKey) => {
    const { tasks, notes } = getItemsForDate(dateKey);
    return tasks.length > 0 || notes.length > 0;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 bg-gray-50/50 rounded-lg"></div>
      );
    }
    

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { tasks, notes } = getItemsForDate(dateKey);
      const hasItems = hasItemsForDate(dateKey);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isSelected = selectedDate === dateKey;
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(selectedDate === dateKey ? null : dateKey)}
          className={`h-32 p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'border-blue-500 bg-blue-50/80 shadow-lg scale-105'
              : isToday
              ? 'border-blue-300 bg-blue-50/50 shadow-md'
              : hasItems
              ? 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
              : 'border-gray-200 bg-white/70 hover:border-gray-300'
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          
          <div className="space-y-1 overflow-hidden">
            {tasks.slice(0, 2).map((task, index) => (
              <div
                key={`task-${task.id}`}
                className={`text-xs px-2 py-1 rounded truncate ${
                  task.completed
                    ? 'bg-green-100 text-green-700 line-through'
                    : task.due_date && new Date(task.due_date) < new Date()
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
                title={task.name}
              >
                📋 {task.name}
              </div>
            ))}
            
            {notes.slice(0, 2).map((note, index) => (
              <div
                key={`note-${note.id}`}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded truncate"
                title={note.name}
              >
                📝 {note.name}
              </div>
            ))}
            
            {(tasks.length + notes.length) > 2 && (
              <div className="text-xs text-gray-500 px-2">
                +{(tasks.length + notes.length) - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;
    
    const { tasks, notes } = getItemsForDate(selectedDate);
    const date = new Date(selectedDate);
    
    return (
      <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <span>📅</span>
          <span>{date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>📋</span>
              <span>Tasks ({tasks.length})</span>
            </h4>
            
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : task.due_date && new Date(task.due_date) < new Date()
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className={`font-medium ${
                      task.completed ? 'line-through text-green-700' : 'text-gray-900'
                    }`}>
                      {task.name}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>
                        {task.completed ? '✅ Completed' : '⏳ Pending'}
                      </span>
                      {task.due_date && (
                        <span>
                          Due: {new Date(task.due_date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No tasks for this date
              </div>
            )}
          </div>
          

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>📝</span>
              <span>Notes ({notes.length})</span>
            </h4>
            
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border bg-purple-50 border-purple-200"
                  >
                    <div className="font-medium text-gray-900">
                      {note.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {note.notes}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(note.created_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No notes for this date
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📅 Calendar
          </h1>
          <p className="text-gray-600">View your tasks and notes by date</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTasksOnly(!showTasksOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showTasksOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Tasks Only
            </button>
            <button
              onClick={() => setShowNotesOnly(!showNotesOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showNotesOnly
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Notes Only
            </button>
            <button
              onClick={navigateToToday}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Today
            </button>
          </div>
        </div>
      </div>


      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>


        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>


        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </div>


      {renderSelectedDateDetails()}
    </div>
  );
};

export default Calendar;

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
        <div key={`empty-${i}`} className="h-32 rounded-lg" style={{backgroundColor: 'var(--hover)'}}></div>
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
          className="h-32 p-2 rounded-lg border cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: isSelected
              ? 'var(--primary-light)'
              : isToday
              ? 'var(--hover)'
              : 'var(--bg-secondary)',
            borderColor: isSelected
              ? 'var(--primary)'
              : isToday
              ? 'var(--border)'
              : 'var(--border)'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.target.style.borderColor = 'var(--text-gray)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.target.style.borderColor = 'var(--border)';
            }
          }}
        >
          <div className="text-sm font-semibold mb-1" style={{
            color: isToday ? 'var(--primary)' : 'var(--text)'
          }}>
            {day}
          </div>
          
          <div className="space-y-1 overflow-hidden">
            {tasks.slice(0, 2).map((task, index) => (
              <div
                key={`task-${task.id}`}
                className="text-xs px-2 py-1 rounded truncate"
                style={{
                  backgroundColor: task.completed 
                    ? '#4a5568' 
                    : task.due_date && new Date(task.due_date) < new Date()
                    ? '#e53e3e'
                    : '#3182ce',
                  color: task.completed 
                    ? '#a0aec0' 
                    : task.due_date && new Date(task.due_date) < new Date()
                    ? '#ffffff'
                    : '#ffffff',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}
                title={task.name}
              >
                {task.name}
              </div>
            ))}
            
            {notes.slice(0, 2).map((note, index) => (
              <div
                key={`note-${note.id}`}
                className="text-xs px-2 py-1 rounded truncate"
                style={{backgroundColor: '#60a5fa', color: '#ffffff'}}
                title={note.name}
              >
                {note.name}
              </div>
            ))}
            
            {(tasks.length + notes.length) > 2 && (
              <div className="text-xs px-2" style={{color: 'var(--text-gray)'}}>
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
      <div className="mt-8 card p-6">
        <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--text)'}}>
          {date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div>
            <h4 className="text-lg font-semibold mb-3" style={{color: 'var(--text)'}}>
              Tasks ({tasks.length})
            </h4>
            
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className={`font-medium ${task.completed ? 'line-through' : ''}`}
                      style={{color: task.completed ? 'var(--text-gray)' : 'var(--text)'}}>
                      {task.name}
                    </div>
                    {task.description && (
                      <div className="text-sm mt-1" style={{color: 'var(--text-light)'}}>
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs" style={{color: 'var(--text-gray)'}}>
                      <span>
                        {task.completed ? 'Completed' : 'Pending'}
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
              <div className="text-center py-4" style={{color: 'var(--text-gray)'}}>
                No tasks for this date
              </div>
            )}
          </div>
          

          <div>
            <h4 className="text-lg font-semibold mb-3" style={{color: 'var(--text)'}}>
              Notes ({notes.length})
            </h4>
            
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="font-medium" style={{color: 'var(--text)'}}>
                      {note.name}
                    </div>
                    <div className="text-sm mt-1 line-clamp-3" style={{color: 'var(--text-light)'}}>
                      {note.notes}
                    </div>
                    <div className="text-xs mt-2" style={{color: 'var(--text-gray)'}}>
                      Created: {new Date(note.created_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4" style={{color: 'var(--text-gray)'}}>
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
          <div className="animate-spin rounded-full h-8 w-8 mx-auto" style={{borderTop: '2px solid var(--primary)', borderRight: '2px solid transparent'}}></div>
          <p className="mt-4 body" style={{color: 'var(--text-light)'}}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="title text-3xl mb-2">
            Calendar
          </h1>
          <p className="subtitle">View your tasks and notes by date</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTasksOnly(!showTasksOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showTasksOnly
                  ? 'btn-primary'
                  : 'btn'
              }`}
            >
              Tasks Only
            </button>
            <button
              onClick={() => setShowNotesOnly(!showNotesOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showNotesOnly
                  ? 'btn-primary'
                  : 'btn'
              }`}
            >
              Notes Only
            </button>
            <button
              onClick={navigateToToday}
              className="btn-primary px-4 py-2"
            >
              Today
            </button>
          </div>
        </div>
      </div>


      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg transition-colors hover-bg"
            style={{color: 'var(--text-gray)'}}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold" style={{color: 'var(--text)'}}>
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg transition-colors hover-bg"
            style={{color: 'var(--text-gray)'}}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>


        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-semibold py-2" style={{color: 'var(--text-light)'}}>
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

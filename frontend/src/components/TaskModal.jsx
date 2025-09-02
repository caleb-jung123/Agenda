import { useState, useEffect } from 'react';
import TagManager from './TagManager';
import api from '../utils/api';

const TaskModal = ({ isOpen, onClose, onSave, task, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
    tag_ids: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      if (mode === 'edit' && task) {
        setFormData({
          name: task.name || '',
          description: task.description || '',
          due_date: task.due_date ? task.due_date.slice(0, 16) : '',
          tag_ids: task.tags ? task.tags.map(tag => typeof tag === 'object' ? tag.id : tag) : []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          due_date: '',
          tag_ids: []
        });
      }
    }
  }, [isOpen, task, mode]);

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/tags/');
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a task name');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        due_date: formData.due_date || null
      };
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 transition-opacity"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" style={{backgroundColor: 'var(--bg-secondary)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}}>
          <div className="px-6 py-4" style={{borderBottom: '1px solid var(--border)'}}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{color: 'var(--text)'}}>
                {mode === 'edit' ? 'Edit task' : 'New task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md transition-colors hover-bg"
                style={{color: 'var(--text-gray)'}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div>
              <label className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
                Task name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input text-base"
                placeholder="Enter task name..."
                required
              />
            </div>

            <div>
              <label className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="input resize-none"
                placeholder="Add a description..."
              />
              <div className="mt-1 caption">
                {formData.description.length} characters
              </div>
            </div>

            <div>
              <label className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
                Due date
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="body font-medium" style={{color: 'var(--text)'}}>
                  Tags
                </label>
                <button
                  type="button"
                  onClick={() => setIsTagManagerOpen(true)}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Manage Tags
                </button>
              </div>
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        formData.tag_ids.includes(tag.id)
                          ? 'text-white'
                          : ''
                      }`}
                      style={{
                        backgroundColor: formData.tag_ids.includes(tag.id) ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: formData.tag_ids.includes(tag.id) ? 'white' : 'var(--text)',
                        border: formData.tag_ids.includes(tag.id) ? '1px solid var(--primary)' : '1px solid var(--border)'
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[var(--text-gray)] text-sm">
                  No tags available. Click "Manage Tags" to create some.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4" style={{borderTop: '1px solid var(--border)'}}>
              <button
                type="button"
                onClick={onClose}
                className="btn px-4 py-2"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-4 py-2 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'edit' ? 'Update' : 'Create'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        onTagsUpdated={fetchTags}
      />
    </div>
  );
};

export default TaskModal;

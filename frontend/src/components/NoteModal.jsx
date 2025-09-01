import { useState, useEffect } from 'react';
import TagManager from './TagManager';

const NoteModal = ({ isOpen, onClose, onSave, note, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    tag_ids: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      if (mode === 'edit' && note) {
        setFormData({
          name: note.name || '',
          notes: note.notes || '',
          tag_ids: note.tags ? note.tags.map(tag => typeof tag === 'object' ? tag.id : tag) : []
        });
      } else {
        setFormData({
          name: '',
          notes: '',
          tag_ids: []
        });
      }
    }
  }, [isOpen, note, mode]);

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tags/', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.notes.trim()) {
      alert('Please fill in both name and content fields');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
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
                {mode === 'edit' ? 'Edit note' : 'New note'}
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
                Title
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input text-base"
                placeholder="Untitled"
                required
              />
            </div>

            <div>
              <label className="body font-medium mb-2 block" style={{color: 'var(--text)'}}>
                Content
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={12}
                className="input resize-none"
                placeholder="Start writing..."
                required
              />
              <div className="mt-1 caption">
                {formData.notes.length} characters
              </div>
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

export default NoteModal;

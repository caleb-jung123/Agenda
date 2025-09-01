import { useState, useEffect } from 'react';

const TagManager = ({ isOpen, onClose, onTagsUpdated }) => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tags/', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else {
        setError('Failed to fetch tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Error fetching tags');
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/tags/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newTagName.trim(),
          is_builtin: false
        })
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        setNewTagName('');
        if (onTagsUpdated) onTagsUpdated();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      setError('Error creating tag');
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tagId) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/api/tags/${tagId}/`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== tagId));
        if (onTagsUpdated) onTagsUpdated();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError('Error deleting tag');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      createTag();
    }
  };

  if (!isOpen) return null;

  const customTags = tags.filter(tag => !tag.is_builtin);
  const builtinTags = tags.filter(tag => tag.is_builtin);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Manage Tags</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-gray)] hover:text-[var(--text)] text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium text-[var(--text)] mb-3">Create New Tag</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter tag name"
              className="flex-1 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text)] placeholder-[var(--text-gray)] focus:outline-none focus:border-[var(--primary)]"
              disabled={loading}
            />
            <button
              onClick={createTag}
              disabled={loading || !newTagName.trim()}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {customTags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-[var(--text)] mb-3">Your Custom Tags</h3>
              <div className="space-y-2">
                {customTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg)] border border-[var(--border)] rounded"
                  >
                    <span className="text-[var(--text)]">{tag.name}</span>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {builtinTags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-[var(--text)] mb-3">Built-in Tags</h3>
              <div className="space-y-2">
                {builtinTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg)] border border-[var(--border)] rounded opacity-75"
                  >
                    <span className="text-[var(--text)]">{tag.name}</span>
                    <span className="text-[var(--text-gray)] text-sm">Built-in</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tags.length === 0 && (
            <div className="text-center text-[var(--text-gray)] py-8">
              No tags available. Create your first custom tag above.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded hover:bg-[var(--hover)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManager;

import { useState, useEffect } from 'react';
import NoteModal from '../components/NoteModal';
import ConfirmationModal from '../components/ConfirmationModal';
import TagManager from '../components/TagManager';
import api from '../utils/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes/');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setModalMode('create');
    setSelectedNote(null);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note) => {
    setModalMode('edit');
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const saveNote = async (formData) => {
    try {
      if (modalMode === 'edit') {
        await api.put(`/api/notes/${selectedNote.id}/`, formData);
      } else {
        await api.post('/api/notes/', formData);
      }
      await fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      throw new Error(`Failed to ${modalMode} note`);
    }
  };

  const deleteNote = async () => {
    try {
      await api.delete(`/api/notes/${selectedNote.id}/`);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 mx-auto" style={{borderTop: '2px solid var(--primary)', borderRight: '2px solid transparent'}}></div>
          <p className="mt-4 body" style={{color: 'var(--text-light)'}}>Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="title text-3xl mb-2">
              Notes
            </h1>
            <p className="subtitle">Capture your thoughts and ideas</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsTagManagerOpen(true)}
              className="btn flex items-center space-x-2 px-4 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Manage Tags</span>
            </button>
            <button 
              onClick={handleCreateNote}
              className="btn-primary flex items-center space-x-2 px-4 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New note</span>
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--primary-light)'}}>
              <svg className="w-8 h-8" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="title text-xl mb-3">No notes yet</h3>
            <p className="subtitle mb-8 max-w-md mx-auto">
              Start capturing your thoughts and ideas. Create your first note to get organized.
            </p>
            <button 
              onClick={handleCreateNote}
              className="btn-primary px-6 py-2.5"
            >
              Create first note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map(note => (
              <div key={note.id} className="card p-5 group cursor-pointer h-fit" onClick={() => handleEditNote(note)}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 pr-2" style={{color: 'var(--text)'}}>
                    {note.name}
                  </h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 rounded transition-colors hover-bg"
                      style={{color: 'var(--text-gray)'}}
                      title="Edit note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note)}
                      className="p-1.5 rounded transition-colors hover-bg"
                      style={{color: 'var(--text-gray)'}}
                      title="Delete note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="body leading-relaxed line-clamp-6 whitespace-pre-wrap" style={{color: 'var(--text-light)'}}>
                    {note.notes}
                  </p>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--text-light)'}}
                        >
                          {typeof tag === 'object' ? tag.name : tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--text-gray)'}}>
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between caption pt-3" style={{borderTop: '1px solid var(--border)'}}>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  <span>{note.notes.length} chars</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={saveNote}
        note={selectedNote}
        mode={modalMode}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteNote}
        item={selectedNote}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        confirmText="Delete Note"
        itemName="name"
        itemContent="notes"
      />

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        onTagsUpdated={fetchNotes}
      />
    </>
  );
};

export default Notes;

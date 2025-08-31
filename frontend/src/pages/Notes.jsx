import { useState, useEffect } from 'react';
import NoteModal from '../components/NoteModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notes/', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
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
    const url = modalMode === 'edit' 
      ? `http://localhost:8000/api/notes/${selectedNote.id}/`
      : 'http://localhost:8000/api/notes/';
    
    const method = modalMode === 'edit' ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Failed to ${modalMode} note`);
    }

    await fetchNotes();
  };

  const deleteNote = async () => {
    const response = await fetch(`http://localhost:8000/api/notes/${selectedNote.id}/`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }

    await fetchNotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Notes
            </h1>
            <p className="text-neutral-600">Capture your thoughts and ideas</p>
          </div>
          <button 
            onClick={handleCreateNote}
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Note</span>
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">No notes yet</h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Start capturing your thoughts and ideas. Create your first note to get organized.
            </p>
            <button 
              onClick={handleCreateNote}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Create First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map(note => (
              <div key={note.id} className="bg-white rounded-lg border border-neutral-200 p-6 hover:border-neutral-300 transition-all duration-200 group">

                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 transition-colors line-clamp-2 pr-2">
                    {note.name}
                  </h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="text-neutral-600 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100 transition-all duration-200"
                      title="Edit note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note)}
                      className="text-neutral-600 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100 transition-all duration-200"
                      title="Delete note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                

                <div className="mb-4">
                  <p className="text-neutral-600 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap">
                    {note.notes}
                  </p>
                </div>
                

                {note.tags && note.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full font-medium"
                        >
                          {typeof tag === 'object' ? tag.name : tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="inline-block bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full font-medium">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                

                <div className="flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-neutral-200">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>{note.notes.length} chars</span>
                  </div>
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
    </>
  );
};

export default Notes;

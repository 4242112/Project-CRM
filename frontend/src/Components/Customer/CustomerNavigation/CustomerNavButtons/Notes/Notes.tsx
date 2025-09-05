import React, { useState, useEffect } from 'react';
import { Customer } from '../../../../../services/CustomerService';
import NotesService, { Note, NoteLocation } from '../../../../../services/NotesService';

interface NotesButtonProps {
  readonly customer: Customer | null;
}

const NotesButton: React.FC<NotesButtonProps> = ({ customer }) => {
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState<Note>({
    title: '',
    description: '',
    location: NoteLocation.CUSTOMER,
  });

  const fetchNotes = async () => {
    if (!customer?.id) return;
    setLoading(true);
    try {
      const data = await NotesService.getNotesByLocation(NoteLocation.CUSTOMER, customer.id);
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Note) => {
    setLoading(true);
    try {
      note.location = NoteLocation.CUSTOMER;
      note.locationId = customer?.id;
      const savedNote = await NotesService.createNote(note);
      setNotes([...notes, savedNote]);
      resetForm();
    } catch (err) {
      setError('Failed to save note.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (note: Note) => {
    setLoading(true);
    try {
      const updated = await NotesService.updateNote(note);
      setNotes(notes.map(n => (n.id === updated.id ? updated : n)));
      resetForm();
    } catch (err) {
      setError('Failed to update note.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await NotesService.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete note");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingNoteId(null);
    setNoteForm({ title: '', description: '', location: NoteLocation.CUSTOMER });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoteForm({ ...noteForm, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNoteId) {
      updateNote({ ...noteForm, id: editingNoteId });
    } else {
      addNote(noteForm);
    }
  };

  useEffect(() => {
    if (customer?.id) {
      fetchNotes();
      setNoteForm({ title: '', description: '', location: NoteLocation.CUSTOMER, locationId: customer.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Notes</h5>
        <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-journal-plus me-1"></i> Add Note
        </button>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <p className="text-muted">No notes available for this Customer.</p>
        ) : (
          <div className="notes-list">
            {notes.map(note => (
              <div key={note.id} className="note-item card mb-3">
                <div className="card-body">
                  <h6 className="card-title"><strong>Title:</strong> {note.title}</h6>
                  <hr />
                  <p className="card-text"><strong>Description:</strong> {note.description}</p>
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditingNoteId(note.id!);
                        setNoteForm({
                          title: note.title,
                          description: note.description,
                          location: NoteLocation.CUSTOMER,
                          locationId: customer?.id,
                        });
                        setShowModal(true);
                      }}
                    >
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteNote(note.id!)}
                    >
                      <i className="bi bi-trash3 me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && <div className="modal-backdrop show" style={{ opacity: 0.5 }}></div>}
        {showModal && (
          <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ paddingRight: '16px' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingNoteId ? 'Edit Note' : 'Add New Note'}</h5>
                  <button type="button" className="btn-close" onClick={resetForm}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={noteForm.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={4}
                        value={noteForm.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <input type="hidden" name="location" value={noteForm.location} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (editingNoteId ? 'Update Note' : 'Save Note')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesButton;

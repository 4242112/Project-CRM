import axios from 'axios';

export enum NoteLocation {
  LEAD = 'LEAD',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER'
}

export interface Note {
  id?: number;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  location: NoteLocation;
  locationId?: number;
}

const BASE_URL = 'http://localhost:8080/api/notes';

/**
 */
const NotesService = {
  /**
   * @returns
   */
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all notes:', error);
      throw error;
    }
  },

  /**
   * @param location 
   * @param id
   * @returns 
   */
  getNotesByLocation: async (location: NoteLocation, id: number): Promise<Note[]> => {
    if (!id) {
      console.error('Location ID is required');
      return [];
    }
    
    try {
      console.log(`Fetching notes for ${location} ID: ${id}`);
      const response = await axios.get(`${BASE_URL}/${location}/${id}`);
      console.log(`Found ${response.data.length} notes for ${location} ID: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notes for ${location} ID ${id}:`, error);
      return [];
    }
  },
  
  /**
   
   * @param Note
   * @returns
   */
  createNote: async (note: Note): Promise<Note> => {
    try {
      console.log('Creating note:', note);
      const response = await axios.post(BASE_URL, note);
      console.log('Note created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },
  
  /**
   * @param note
   * @returns
   */
  updateNote: async (note: Note): Promise<Note> => {
    if (!note.id) {
      throw new Error('Note ID is required for updates');
    }
    
    try {
      console.log(`Updating note ID ${note.id}:`, note);
      const response = await axios.put(`${BASE_URL}/${note.id}`, note);
      console.log('Note updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating note ID ${note.id}:`, error);
      throw error;
    }
  },
  
  /**
   * @param id 
   * @returns
   */
  deleteNote: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting note ID ${id}`);
      await axios.delete(`${BASE_URL}/${id}`);
      console.log(`Note ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting note ID ${id}:`, error);
      throw error;
    }
  }
};

export default NotesService;
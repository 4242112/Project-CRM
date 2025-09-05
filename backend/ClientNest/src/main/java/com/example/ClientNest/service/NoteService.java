package com.example.ClientNest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ClientNest.dto.NoteDTO;
import com.example.ClientNest.model.Note;
import com.example.ClientNest.repository.NoteRepository;
import com.example.ClientNest.misc.Location;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }


    private NoteDTO convertToDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setDescription(note.getDescription());
        dto.setCreatedAt(note.getCreationDate());
        dto.setLocation(note.getLocation().name());
        dto.setLocationId(note.getLocationId());
        return dto;
    }

 
    private Note convertToEntity(NoteDTO noteDTO) {
        Note note = new Note();
        if (noteDTO.getId() != null) {
            note.setId(noteDTO.getId());
        }
        note.setTitle(noteDTO.getTitle());
        note.setDescription(noteDTO.getDescription());

        note.setLocation(Location.valueOf(noteDTO.getLocation()));
        note.setLocationId(noteDTO.getLocationId());        

        return note;
    }

    public List<NoteDTO> getAllNotes() {
        return noteRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    public List<NoteDTO> getNoteByLocationAndId(String location, Long id) {
        var note = noteRepository.findByLocationAndId(location, id);
        return note;
    }


    public NoteDTO createNote(NoteDTO noteDTO) {
        Note note = convertToEntity(noteDTO);
        Note savedNote = noteRepository.save(note);
        return convertToDTO(savedNote);
    }

    public NoteDTO updateNote(Long id, NoteDTO noteDTO) {

        if (!noteRepository.existsById(id)) {
            throw new RuntimeException("Note not found with id: " + id);
        }

        Note note = convertToEntity(noteDTO);
        note.setId(id); 
        Note updatedNote = noteRepository.save(note);
        return convertToDTO(updatedNote);
    }

    public void deleteNote(Long id) {

        if (!noteRepository.existsById(id)) {
            throw new RuntimeException("Note not found with id: " + id);
        }
        noteRepository.deleteById(id);
    }
}
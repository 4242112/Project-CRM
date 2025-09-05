package com.example.ClientNest.dto;

import java.time.LocalDateTime;

import com.example.ClientNest.model.Note;

import lombok.Data;

@Data
public class NoteDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String location;
    private Long locationId;

    public NoteDTO() {
    }

    public NoteDTO(Long id, String title, String description, LocalDateTime createdAt, String location, Long locationId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.location = location;
        this.locationId = locationId;
    }

    public NoteDTO(NoteDTO note) {
        this.id = note.getId();
        this.title = note.getTitle();
        this.description = note.getDescription();
        this.createdAt = note.getCreatedAt();
        this.location = note.getLocation();
        this.locationId = note.getLocationId();
    }

    public NoteDTO(Note note) {
        this.id = note.getId();
        this.title = note.getTitle();
        this.description = note.getDescription();
        this.createdAt = note.getCreationDate();   
        this.location = note.getLocation().name();
        this.locationId = note.getLocationId();
    }
}
package com.example.util;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class Card {
    private String title;
    private List<Note> notes;
    private String creator;

    public Card(String title, List<Note> notes, String creator) {
        this.title = title;
        this.notes = notes;
        this.creator = creator;
    }

    public JSONObject toJSON(){
        JSONArray notes = new JSONArray();
        for(Note note : this.notes){
            notes.put(note.toJSON());
        }
        return new JSONObject()
                .put("title",this.title)
                .put("notes",notes)
                .put("creator",this.creator);
    }

    // Convert JSONObject to an instance of Card
    public static Card jsonToCard(JSONObject card){
        List<Note> notes = new ArrayList<>();
        // Check if the JSONObject has a list of notes
        if(card.has("notes")){
            JSONArray notesObj = card.getJSONArray("notes");
            for(int i = 0; i < notesObj.length(); i++){
                notes.add(Note.jsonToNote(notesObj.getJSONObject(i)));
            }
        }
        return new Card(card.getString("title"),
                notes,
                card.getString("creator"));
    }

    public void addNote(Note note) {
        this.notes.add(note);
    }

    public void deleteNote(int index) {
        this.notes.remove(index);
    }

    @Override
    public String toString() {
        return "Card{" +
                "title='" + title + '\'' +
                ", notes=" + notes +
                ", creator='" + creator + '\'' +
                '}';
    }
}

package com.example.util;

import org.json.JSONException;
import org.json.JSONObject;

public class Note {
    private String text;
    private String creator;

    public Note(String text, String creator) {
        this.text = text;
        this.creator = creator;
    }

    // Convert Note to JSONObject
    public JSONObject toJSON(){
        return new JSONObject()
                .put("text",this.text)
                .put("creator",this.creator);
    }

    // Convert JSONObject to an instance of Note
    public static Note jsonToNote(JSONObject note){
        Note msg = null;
        try {
            msg = new Note(note.getString("text"), note.getString("creator"));
        } catch(JSONException e){
            throw new JSONException(e);
        }
        return msg;
    }

    @Override
    public String toString() {
        return "Note{" +
                "text='" + text + '\'' +
                ", creator='" + creator + '\'' +
                '}';
    }
}

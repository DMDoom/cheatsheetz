package com.dmdoom.cheatsheetz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Question {

    // Basic
    private String submittedBy;
    private String content;
    private String questionToken;
    //private Type type;
    //private ArrayList<Answer> answers;
    // Color should not be client-sided to avoid confusion
    // private Color color;

    // Options
    //boolean specifyTypeRequired;
    //boolean autoSort;
    //boolean preventDuplicates;

    public enum Type {
        OPEN, CLOSED, MULTIPLE_CHOICE;
    }

}

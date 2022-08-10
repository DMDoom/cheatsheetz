package com.dmdoom.cheatsheetz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Question {

    // Basic
    private int number;
    private String submittedBy;
    private String content;
    private String questionToken;
    private String hexColor;
    //private Type type;

    // Options
    //boolean specifyTypeRequired;
    //boolean autoSort;
    //boolean preventDuplicates;

    public enum Type {
        OPEN, CLOSED, MULTIPLE_CHOICE;
    }

}

package com.dmdoom.cheatsheetz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

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
    private boolean blacklisted;
    private ArrayList<ClosedAnswerWrapper> closedAnswers;

    // The closed answers list needs a wrapper class for String because of limitations of Vue where it cannot use
    // v-model on primitives in a list iteration context
    @Data
    public static class ClosedAnswerWrapper {
        private String value;
    }

    public enum Type {
        OPEN, CLOSED, MULTIPLE_CHOICE;
    }
}

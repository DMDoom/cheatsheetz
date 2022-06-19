package com.dmdoom.cheatsheetz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Answer {

    private String content;
    private String submittedBy;
    private String answerToken;

}

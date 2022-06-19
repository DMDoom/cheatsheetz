package com.dmdoom.cheatsheetz.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {

    private String token;
    private ArrayList<Question> questions;
    private ArrayList<String> users;

}

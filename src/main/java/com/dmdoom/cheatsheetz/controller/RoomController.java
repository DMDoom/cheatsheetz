package com.dmdoom.cheatsheetz.controller;

import com.dmdoom.cheatsheetz.model.Answer;
import com.dmdoom.cheatsheetz.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import reactor.core.publisher.Sinks;

import java.util.HashMap;

@Controller
@RequestMapping("/room")
public class RoomController {

    @Autowired
    HashMap<String, Sinks.Many<Question>> questionSinkMap;

    @Autowired
    HashMap<String, Sinks.Many<Answer>> answerSinkMap;

    @GetMapping("/{token}")
    public String getRoom(@PathVariable("token") String token, Model model) {
        // Ensure everything initializes properly
        if (questionSinkMap.get(token) == null || answerSinkMap.get(token) == null) {
            return "errorpage";
        }
        // Will be used to connect to corresponding websockets
        // This way room links can be shared as a way to join a room
        model.addAttribute("token", token);

        return "room";
    }
}

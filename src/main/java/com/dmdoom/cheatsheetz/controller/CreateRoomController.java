package com.dmdoom.cheatsheetz.controller;

import com.dmdoom.cheatsheetz.model.Answer;
import com.dmdoom.cheatsheetz.model.Question;
import com.dmdoom.cheatsheetz.model.Room;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import reactor.core.publisher.Sinks;

import java.util.HashMap;

@Controller
@Slf4j
@RequestMapping("/")
public class CreateRoomController {

    @Autowired
    HashMap<String, Sinks.Many<Question>> questionSinkMap;

    @Autowired
    HashMap<String, Sinks.Many<Answer>> answerSinkMap;

    @GetMapping
    public String getCreatePage() {
        return "create-room";
    }

    @PostMapping
    public String createRoom(@ModelAttribute("room") Room room) {
        // Instantiate corresponding Sinks
        answerSinkMap.computeIfAbsent(room.getToken(), f -> Sinks.many().replay().all());
        questionSinkMap.computeIfAbsent(room.getToken(), f -> Sinks.many().replay().all());

        log.info("Created a room: {}", room.toString());

        return "redirect:/room/" + room.getToken();
    }
}

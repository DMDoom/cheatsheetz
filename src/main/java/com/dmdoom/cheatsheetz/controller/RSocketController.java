package com.dmdoom.cheatsheetz.controller;

import com.dmdoom.cheatsheetz.model.Answer;
import com.dmdoom.cheatsheetz.model.Question;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.util.HashMap;

@Controller
@Slf4j
public class RSocketController {

    @Autowired
    HashMap<String, Sinks.Many<Question>> questionSinkMap;

    @Autowired
    HashMap<String, Sinks.Many<Answer>> answerSinkMap;

    // Questions for room token
    @MessageMapping("questions/{token}")
    public Flux<Question> listenToQuestions(@DestinationVariable("token") String token) {
        if (questionSinkMap.get(token) == null) {
            log.warn("Questions for room token {} cannot be fetched because the room does not exist", token);
            return Flux.empty();
        }

        log.info("Serving out questions to client listening under room token: " + token);
        return questionSinkMap.get(token).asFlux();
    }

    // Answers for room token
    @MessageMapping("answers/{token}")
    public Flux<Answer> listenToAnswers(@DestinationVariable("token") String token) {
        if (answerSinkMap.get(token) == null) {
            log.warn("Answers for room token {} cannot be fetched because the room does not exist", token);
            return Flux.empty();
        }

        log.info("Serving out answers to client listening under room token: {}", token);
        return answerSinkMap.get(token).asFlux();
    }

    // For testing purposes
    @MessageMapping("greet")
    public Mono<String> helloWorld(Mono<String> messageMono) {
        return messageMono
                .doOnNext(message -> log.info("Received a message: {}", message))
                .map(message -> "Hello to you too");
    }
}

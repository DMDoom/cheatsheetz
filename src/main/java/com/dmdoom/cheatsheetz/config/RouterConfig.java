package com.dmdoom.cheatsheetz.config;

import com.dmdoom.cheatsheetz.model.Answer;
import com.dmdoom.cheatsheetz.model.Question;
import com.dmdoom.cheatsheetz.service.QuestionModifierService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.util.HashMap;

@Configuration
@Slf4j
@CrossOrigin(origins = "*")
public class RouterConfig {

    @Autowired
    HashMap<String, Sinks.Many<Question>> questionSinkMap;

    @Autowired
    HashMap<String, Sinks.Many<Answer>> answerSinkMap;

    @Autowired
    QuestionModifierService questionModifier;

    @Bean
    public RouterFunction<ServerResponse> routes() {
        return RouterFunctions
                .route(RequestPredicates.POST("/submit-question")
                        .and(RequestPredicates.queryParam("token", t -> t != null)),
                        this::submitQuestionWithToken)
                .andRoute(RequestPredicates.GET("/get-questions-by-token")
                        .and(RequestPredicates.queryParam("token", t -> t != null)),
                        this::getQuestionStreamByRoomToken)
                .andRoute(RequestPredicates.GET("/get-answers-by-token")
                        .and(RequestPredicates.queryParam("token", t -> t != null)),
                        this::getAnswerStreamByRoomToken)
                .andRoute(RequestPredicates.POST("/submit-answer")
                                .and(RequestPredicates.queryParam("token", t -> t != null)),
                        this::submitAnswerWithToken);
    }

    public Mono<ServerResponse> getAnswerStreamByRoomToken(ServerRequest request) {
        String token = request.queryParam("token").get().toString();
        return ServerResponse.ok().contentType(MediaType.APPLICATION_NDJSON).body(answerSinkMap.get(token).asFlux(), Answer.class).log();
    }

    public Mono<ServerResponse> submitAnswerWithToken(ServerRequest request) {
        String token = request.queryParam("token").get().toString();
        return request.bodyToMono(Answer.class)
                .doOnNext(answer -> {
                    log.info("RECEIVED QUESTION: " + answer.toString());
                    answerSinkMap.get(token).tryEmitNext(answer);
                })
                .flatMap(answer -> {
                    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(answer);
                })
                .log();
    }

    // Get question stream from a specific Sink
    public Mono<ServerResponse> getQuestionStreamByRoomToken(ServerRequest request) {
        String token = request.queryParam("token").get().toString();
        return ServerResponse.ok().contentType(MediaType.APPLICATION_NDJSON).body(questionSinkMap.get(token).asFlux(), Question.class).log();
    }

    // Handle submitted questions
    // Generates question token and publishes to Sink
    public Mono<ServerResponse> submitQuestionWithToken(ServerRequest request) {
        String token = request.queryParam("token").get().toString();
        return request.bodyToMono(Question.class)
                .doOnNext(question -> {
                    // Generate a random question token and color
                    question.setQuestionToken(questionModifier.generateToken());
                    question.setHexColor(questionModifier.generateColor());
                    questionSinkMap.get(token).tryEmitNext(question);
                })
                .flatMap(question -> {
                    // Here is where the saving happens, call the repo method to save Question here in the .body()
                    // Use body(object, object.class) for raw data, use bodyValue for wrapping in Mono/Flux
                    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(question);
                })
                .log();
    }
}

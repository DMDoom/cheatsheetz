package com.dmdoom.cheatsheetz.config;

import com.dmdoom.cheatsheetz.model.Question;
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

    @Bean
    public RouterFunction<ServerResponse> routes() {
        return RouterFunctions
                .route(RequestPredicates.POST("/submit-question")
                        .and(RequestPredicates.queryParam("token", t -> t != null)),
                        this::submitQuestionWithToken)
                .andRoute(RequestPredicates.GET("/get-questions-by-token")
                        .and(RequestPredicates.queryParam("token", t -> t != null)),
                        this::getQuestionStreamByRoomToken);
    }

    // Get question stream from a specific room
    public Mono<ServerResponse> getQuestionStreamByRoomToken(ServerRequest request) {
        String token = request.queryParam("token").get().toString();
        return ServerResponse.ok().contentType(MediaType.APPLICATION_NDJSON).body(questionSinkMap.get(token).asFlux(), Question.class).log();
    }

    // Submit question to a specific room
    public Mono<ServerResponse> submitQuestionWithToken(ServerRequest request) {
        String token = request.queryParam("token").get().toString();
        return request.bodyToMono(Question.class)
                .doOnNext(question -> {
                    question.setQuestionToken("lsfobnk5nmf");
                    questionSinkMap.get(token).tryEmitNext(question);
                })
                .flatMap(question -> {
                    // Here is where the saving happens, call the repo method to save Question here in the .body()
                    // Use body(object, object.class) for raw data, use bodyValue for wrapping in Mono/Flux
                    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(question);
                })
                .log();
    }

    // Submit answer with some kind of question identifier

    // Submit chat message to a room
}

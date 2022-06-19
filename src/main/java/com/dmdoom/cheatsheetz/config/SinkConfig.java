package com.dmdoom.cheatsheetz.config;

import com.dmdoom.cheatsheetz.model.Answer;
import com.dmdoom.cheatsheetz.model.Question;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Sinks;

import java.util.HashMap;

@Configuration
public class SinkConfig {

    @Bean
    HashMap<String, Sinks.Many<Question>> questionSinkMap() {
        return new HashMap<>();
    }

    @Bean
    HashMap<String, Sinks.Many<Answer>> answerSinkMap() {
        return new HashMap<>();
    }
}

package com.dmdoom.cheatsheetz.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.rsocket.RSocketRequester;

import java.net.URI;

@Configuration
public class RSocketConfig {

    @Bean
    RSocketRequester requester(RSocketRequester.Builder builder) {
        return builder.websocket(URI.create("ws://localhost:8080/rsocket"));
    }
}

package com.dmdoom.cheatsheetz.client;

import com.dmdoom.cheatsheetz.model.Answer;
import com.dmdoom.cheatsheetz.model.Question;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.messaging.rsocket.RSocketRequester;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Sinks;

import java.util.HashMap;

@Service
@Slf4j
public class ClientService {

    @Autowired
    private RSocketRequester requester;

    @Autowired
    WebClient webClient;

    @Autowired
    HashMap<String, Sinks.Many<Question>> questionSinkMap;

    @Autowired
    HashMap<String, Sinks.Many<Answer>> answerSinkMap;

    @Bean
    @Profile("dev")
    public ApplicationRunner sender() {
        return args -> {
            /* This will be done upon room creation */
            this.questionSinkMap.computeIfAbsent("clienttoken", f -> Sinks.many().replay().all());
            this.answerSinkMap.computeIfAbsent("clienttoken", f -> Sinks.many().replay().all());

            // Create question sink and send questions
            /*
            String postRequestTokenName = "clienttoken";
            Flux.interval(Duration.ofSeconds(5))
                    .subscribe(e -> {
                        this.questionSinkMap.computeIfAbsent(postRequestTokenName, f -> {
                            Sinks.Many<Question> sink = Sinks.many().replay().all();
                            log.info("Computing a new value");
                            log.info("Key: " + postRequestTokenName);
                            return sink;
                        });

                        log.info("Posting a new question");

                        this.questionSinkMap.get(postRequestTokenName).tryEmitNext(new Question(
                                "John",
                                "Question submitted and flowing through a sink",
                                "kt7dsktmglf")); // will be randomly generated
                    });
            */

            /*
            requester.route("greet")
                    .data("If this message arrives, everything works")
                    .retrieveMono(String.class)
                    .subscribe(reply -> log.info("Reply; {}", reply));
            */

            /* RSOCKET */
            /*
            String token = "clienttoken";
            requester.route("questions/{token}", token)
                    .retrieveFlux(Question.class)
                    .delaySubscription(Duration.ofSeconds(6))
                    .doOnNext(question -> log.info("Received a new question through RSocket: {}", question))
                    .subscribe();
            */

            /* WEBCLIENT */
            /*
            webClient
                    .get()
                    .uri("/get-question-stream")
                    .exchangeToFlux(response -> response.bodyToFlux(Question.class))
                    .subscribe(i -> log.info("Listening to new questions"));

            // Post to the stream
            Question question = new Question(
                    new User("John"),
                    "Question submitted and flowing through a sink",
                    Question.Type.CLOSED,
                    new ArrayList<>(),
                    false,
                    false,
                    false);

            webClient.post()
                    .uri("/submit-question")
                    .bodyValue(question)
                    .exchangeToMono(cr -> Mono.just(cr))
                    .flatMap(cr -> cr.bodyToMono(Question.class))
                    .subscribe(r -> log.info("Submitted a question"));
            */
        };
    }

}

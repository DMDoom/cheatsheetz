package com.dmdoom.cheatsheetz.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public final class QuestionModifierService {

    private List<String> colors;
    private final String charPool;
    private final Random random;

    public QuestionModifierService() {
        this.colors = new ArrayList<>();
        this.random = new Random();
        this.charPool = "ABCDEFGHIJKMLNOPRSTUWXYZ0123456789";

        String[] hexColors = {
                "#3D619B",
                "#EF4B4C",
                "#B85E25",
                "#469D67",
                "#684C9F",
                "#2E3443",
                "#9749A6",
                "#54C4BF",
                "#C77398",
                "#AF987E",
                "#EB9447"
        };

        this.colors.addAll(List.of(hexColors));
    }

    public String generateToken() {
        char[] token = new char[10];
        for (int i = 0; i < token.length; i++) {
            token[i] = this.charPool.charAt(random.nextInt(this.charPool.length()));
        }

        return new String(token);
    }

    public String generateColor() {
        return this.colors.get(this.random.nextInt(colors.size()));
    }
}

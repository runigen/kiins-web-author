package com.runigen.meeoocat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class MeeoocatApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(MeeoocatApiApplication.class, args);
    }
}
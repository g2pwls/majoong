package com.e105.machimnae.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Swagger Test!";
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}

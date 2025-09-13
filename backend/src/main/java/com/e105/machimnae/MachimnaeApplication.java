package com.e105.machimnae;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MachimnaeApplication {
  
	public static void main(String[] args) {
		SpringApplication.run(MachimnaeApplication.class, args);
	}
} 
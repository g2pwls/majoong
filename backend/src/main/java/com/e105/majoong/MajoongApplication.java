package com.e105.majoong;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MajoongApplication {
     
	public static void main(String[] args) {
		SpringApplication.run(MajoongApplication.class, args);
	}
}
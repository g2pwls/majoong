package com.e105.majoong;

import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableJpaAuditing
@EnableBatchProcessing
@SpringBootApplication
public class MajoongApplication {
     
	public static void main(String[] args) {
		SpringApplication.run(MajoongApplication.class, args);
	}
}
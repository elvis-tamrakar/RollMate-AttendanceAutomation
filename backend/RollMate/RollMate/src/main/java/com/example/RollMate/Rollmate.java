package com.example.RollMate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class Rollmate {
	private static final Logger logger = LoggerFactory.getLogger(Rollmate.class);

	@PostConstruct
	public void init() {
		logger.info("Starting Rollmate Application...");
		logger.debug("Database URL: {}", System.getenv("DATABASE_URL"));
	}

	public static void main(String[] args) {
		SpringApplication.run(Rollmate.class, args);
	}
}

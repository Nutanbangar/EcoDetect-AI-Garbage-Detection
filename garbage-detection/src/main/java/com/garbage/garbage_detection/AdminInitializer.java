package com.garbage.garbage_detection;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.garbage.garbage_detection.entity.User;
import com.garbage.garbage_detection.repository.UserRepository;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${ADMIN_MOBILE:}")
    private String adminMobile;

    public AdminInitializer(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User(
                "EcoDetect Admin",
                adminEmail,
                passwordEncoder.encode(adminPassword));

        admin.setMobileNumber(adminMobile);
        admin.setRole("ADMIN");

        userRepository.save(admin);

        System.out.println("EcoDetect Admin account created successfully.");
    }
}
package com.garbage.garbage_detection.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.garbage.garbage_detection.entity.User;
import com.garbage.garbage_detection.repository.UserRepository;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

        @Autowired
        private UserRepository userRepository;

        private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        @PostMapping("/signup")
        public ResponseEntity<?> signup(@RequestBody User user) {

                // Check if email already exists
                if (userRepository.existsByEmail(user.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body("Email already registered");
                }

                user.setRole("USER");
                // Hash password before saving
                user.setPassword(passwordEncoder.encode(user.getPassword()));

                // Save user in MySQL
                userRepository.save(user);

                return ResponseEntity
                                .ok("Account created successfully");
        }

        @PostMapping("/admin/create-worker")
        public ResponseEntity<?> createWorker(@RequestBody User user) {

                if (userRepository.existsByEmail(user.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body("Email already registered");
                }

                user.setRole("WORKER");

                user.setPassword(
                                passwordEncoder.encode(user.getPassword()));

                userRepository.save(user);

                return ResponseEntity.ok(
                                Map.of(
                                                "message", "Worker account created successfully",
                                                "fullName", user.getFullName(),
                                                "email", user.getEmail(),
                                                "mobileNumber", user.getMobileNumber(),
                                                "role", user.getRole()));
        }

        @GetMapping("/workers")
        public ResponseEntity<?> getWorkers() {

                return ResponseEntity.ok(
                                userRepository.findByRole("WORKER"));
        }

        @DeleteMapping("/admin/delete-worker/{id}")
        public ResponseEntity<?> deleteWorker(@PathVariable Integer id) {

                var worker = userRepository.findById(id);

                if (worker.isEmpty()) {
                        return ResponseEntity
                                        .status(404)
                                        .body("Worker not found");
                }

                if (!"WORKER".equals(worker.get().getRole())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body("Only worker accounts can be deleted");
                }

                userRepository.deleteById(id);

                return ResponseEntity.ok(
                                Map.of(
                                                "message",
                                                "Worker deleted successfully"));
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody User user) {

                var existingUser = userRepository.findByEmail(user.getEmail());

                if (existingUser.isEmpty()) {
                        return ResponseEntity
                                        .status(404)
                                        .body(Map.of(
                                                        "message",
                                                        "Account not found. Please create an account first."));
                }

                boolean passwordMatch = passwordEncoder.matches(
                                user.getPassword(),
                                existingUser.get().getPassword());

                if (!passwordMatch) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        "Invalid email or password"));
                }

                return ResponseEntity.ok(
                                Map.of(
                                                "message", "Login successful",
                                                "userId", existingUser.get().getId(),
                                                "fullName", existingUser.get().getFullName(),
                                                "role", existingUser.get().getRole()));
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {

                String email = request.get("email");
                String newPassword = request.get("newPassword");

                if (email == null || email.trim().isEmpty()) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        "Email is required"));
                }

                if (newPassword == null || newPassword.trim().isEmpty()) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        "New password is required"));
                }

                var existingUser = userRepository.findByEmail(email);

                if (existingUser.isEmpty()) {
                        return ResponseEntity
                                        .status(404)
                                        .body(Map.of(
                                                        "message",
                                                        "Account not found"));
                }

                // Hash the new password before saving
                existingUser.get().setPassword(
                                passwordEncoder.encode(newPassword));

                userRepository.save(existingUser.get());

                return ResponseEntity.ok(
                                Map.of(
                                                "message",
                                                "Password reset successfully"));
        }
}
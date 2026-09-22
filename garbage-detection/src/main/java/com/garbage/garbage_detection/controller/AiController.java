package com.garbage.garbage_detection.controller;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;

import com.garbage.garbage_detection.entity.DetectionResult;
import com.garbage.garbage_detection.entity.User;
import com.garbage.garbage_detection.repository.DetectionResultRepository;
import com.garbage.garbage_detection.repository.UserRepository;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
})
public class AiController {

    private final RestTemplate restTemplate = new RestTemplate();

    private final DetectionResultRepository detectionResultRepository;
    private final UserRepository userRepository;

    public AiController(
            DetectionResultRepository detectionResultRepository,
            UserRepository userRepository) {

        this.detectionResultRepository = detectionResultRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/detect")
    public ResponseEntity<?> detectGarbage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam("userId") Integer userId) {

        try {

            // User शोधणे
            User user = userRepository.findById(Integer.valueOf(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String userName = user.getFullName();

            // Image uploads folder मध्ये safely save करणे
            String uploadDir = System.getProperty("user.dir") + "/uploads/";

            Path uploadPath = Path.of(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = image.getOriginalFilename();

            if (fileName == null || fileName.isBlank()) {
                fileName = "garbage-image.jpg";
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.write(filePath, image.getBytes());

            ByteArrayResource fileResource = new ByteArrayResource(image.getBytes()) {

                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            body.add("image", fileResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "http://ai:5000/predict",
                    request,
                    String.class);

            String responseBody = response.getBody();

            // AI result मधून garbage type काढणे
            String garbageType = responseBody
                    .replace("{", "")
                    .replace("}", "")
                    .replace("\"", "")
                    .split(":")[1]
                    .trim();

            // Database मध्ये detection save करणे
            DetectionResult detectionResult = new DetectionResult(
                    userId,
                    userName,
                    image.getOriginalFilename(),
                    LocalDateTime.now(ZoneId.of("Asia/Kolkata")),
                    garbageType,
                    location != null
                            ? location
                            : "Location not available");

            detectionResultRepository.save(detectionResult);

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("AI detection failed: " + e.getMessage());
        }
    }
}
package com.garbage.garbage_detection.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.garbage.garbage_detection.entity.DetectionResult;
import com.garbage.garbage_detection.repository.DetectionResultRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/detections")

public class DetectionController {

    private final DetectionResultRepository detectionResultRepository;

    public DetectionController(
            DetectionResultRepository detectionResultRepository) {

        this.detectionResultRepository = detectionResultRepository;
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<DetectionResult>> getHistory(
            @PathVariable Integer userId) {

        List<DetectionResult> history = detectionResultRepository
                .findByUserIdOrderByDetectedAtDesc(userId);

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDetection(
            @PathVariable Long id) {

        if (!detectionResultRepository.existsById(id)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        detectionResultRepository.deleteById(id);

        return ResponseEntity.ok("Detection deleted successfully");
    }

    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String fileName) {

        String uploadDir = System.getProperty("user.dir") + "/uploads/";

        java.io.File imageFile = new java.io.File(uploadDir + fileName);

        if (!imageFile.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(imageFile);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
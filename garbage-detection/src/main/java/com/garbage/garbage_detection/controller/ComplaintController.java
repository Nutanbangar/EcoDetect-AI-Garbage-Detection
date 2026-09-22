
package com.garbage.garbage_detection.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.garbage.garbage_detection.entity.Complaint;
import com.garbage.garbage_detection.repository.ComplaintRepository;
import com.garbage.garbage_detection.repository.UserRepository;
import com.garbage.garbage_detection.entity.User;

@RestController
@RequestMapping("/api/complaints")

public class ComplaintController {

        private final ComplaintRepository complaintRepository;
        private final UserRepository userRepository;

        public ComplaintController(
                        ComplaintRepository complaintRepository,
                        UserRepository userRepository) {

                this.complaintRepository = complaintRepository;
                this.userRepository = userRepository;
        }

        @PostMapping
        public ResponseEntity<?> createComplaint(
                        @RequestBody Complaint complaint) {

                complaint.setStatus("Pending");
                complaint.setCreatedAt(LocalDateTime.now());

                Complaint savedComplaint = complaintRepository.save(complaint);

                return ResponseEntity.ok(savedComplaint);
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<List<Complaint>> getUserComplaints(
                        @PathVariable Integer userId) {

                List<Complaint> complaints = complaintRepository
                                .findByUserIdOrderByCreatedAtDesc(userId);

                return ResponseEntity.ok(complaints);
        }

        @GetMapping("/all")
        public ResponseEntity<List<Complaint>> getAllComplaints() {

                List<Complaint> complaints = complaintRepository
                                .findAllByOrderByCreatedAtDesc();

                return ResponseEntity.ok(complaints);
        }

        @GetMapping("/worker/{workerId}")
        public ResponseEntity<List<Complaint>> getWorkerComplaints(
                        @PathVariable Integer workerId) {

                List<Complaint> complaints = complaintRepository
                                .findByWorkerIdOrderByCreatedAtDesc(workerId);

                return ResponseEntity.ok(complaints);
        }

        @GetMapping("/worker/{workerId}/contacts")
        public ResponseEntity<?> getWorkerComplaintContacts(
                        @PathVariable Integer workerId) {

                List<Complaint> complaints = complaintRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);

                User admin = userRepository.findByRole("ADMIN")
                                .stream()
                                .findFirst()
                                .orElse(null);

                List<Map<String, Object>> result = new java.util.ArrayList<>();

                for (Complaint complaint : complaints) {

                        User user = userRepository
                                        .findById(complaint.getUserId())
                                        .orElse(null);

                        Map<String, Object> contact = new java.util.HashMap<>();

                        contact.put("complaintId", complaint.getId());

                        contact.put(
                                        "userMobile",
                                        user != null && user.getMobileNumber() != null
                                                        ? user.getMobileNumber()
                                                        : "");

                        contact.put(
                                        "adminMobile",
                                        admin != null && admin.getMobileNumber() != null
                                                        ? admin.getMobileNumber()
                                                        : "");

                        result.add(contact);
                }

                return ResponseEntity.ok(result);
        }

        @GetMapping("/user/{userId}/contacts")
        public ResponseEntity<?> getUserComplaintContacts(
                        @PathVariable Integer userId) {

                List<Complaint> complaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);

                User admin = userRepository.findByRole("ADMIN")
                                .stream()
                                .findFirst()
                                .orElse(null);

                List<Map<String, Object>> result = new java.util.ArrayList<>();

                for (Complaint complaint : complaints) {

                        Map<String, Object> contact = new java.util.HashMap<>();

                        contact.put("complaintId", complaint.getId());

                        contact.put(
                                        "adminMobile",
                                        admin != null && admin.getMobileNumber() != null
                                                        ? admin.getMobileNumber()
                                                        : "");

                        String workerMobile = "";

                        if (complaint.getWorkerId() != null) {

                                User worker = userRepository
                                                .findById(complaint.getWorkerId())
                                                .orElse(null);

                                if (worker != null && worker.getMobileNumber() != null) {
                                        workerMobile = worker.getMobileNumber();
                                }
                        }

                        contact.put("workerMobile", workerMobile);

                        result.add(contact);
                }

                return ResponseEntity.ok(result);
        }

        @GetMapping("/admin/{adminId}/contacts")
        public ResponseEntity<?> getAdminComplaintContacts(
                        @PathVariable Integer adminId) {

                List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();

                List<Map<String, Object>> result = new java.util.ArrayList<>();

                for (Complaint complaint : complaints) {

                        Map<String, Object> contact = new java.util.HashMap<>();

                        contact.put("complaintId", complaint.getId());

                        User user = userRepository
                                        .findById(complaint.getUserId())
                                        .orElse(null);

                        contact.put(
                                        "userMobile",
                                        user != null && user.getMobileNumber() != null
                                                        ? user.getMobileNumber()
                                                        : "");

                        String workerMobile = "";

                        if (complaint.getWorkerId() != null) {

                                User worker = userRepository
                                                .findById(complaint.getWorkerId())
                                                .orElse(null);

                                if (worker != null && worker.getMobileNumber() != null) {
                                        workerMobile = worker.getMobileNumber();
                                }
                        }

                        contact.put("workerMobile", workerMobile);

                        result.add(contact);
                }

                return ResponseEntity.ok(result);
        }

        @PutMapping("/{id}/verify")
        public ResponseEntity<?> verifyComplaint(@PathVariable Long id) {

                return complaintRepository.findById(id)
                                .map(complaint -> {

                                        complaint.setStatus("Verified");

                                        Complaint updatedComplaint = complaintRepository.save(complaint);

                                        return ResponseEntity.ok(updatedComplaint);
                                })
                                .orElseGet(() -> ResponseEntity.notFound().build());
        }

        @PutMapping("/{id}/assign")
        public ResponseEntity<?> assignWorker(
                        @PathVariable Long id,
                        @RequestBody Map<String, Object> data) {

                return complaintRepository.findById(id)
                                .map(complaint -> {

                                        Integer workerId = Integer.valueOf(
                                                        data.get("workerId").toString());

                                        String workerName = data.get("workerName").toString();

                                        complaint.setWorkerId(workerId);
                                        complaint.setWorkerName(workerName);
                                        complaint.setStatus("Assigned");

                                        Complaint updatedComplaint = complaintRepository.save(complaint);

                                        return ResponseEntity.ok(updatedComplaint);
                                })
                                .orElseGet(() -> ResponseEntity.notFound().build());
        }

        @PutMapping("/{id}/start-cleaning")
        public ResponseEntity<?> startCleaning(@PathVariable Long id) {

                return complaintRepository.findById(id)
                                .map(complaint -> {

                                        complaint.setStatus("Cleaning in Progress");

                                        Complaint updatedComplaint = complaintRepository.save(complaint);

                                        return ResponseEntity.ok(updatedComplaint);
                                })
                                .orElseGet(() -> ResponseEntity.notFound().build());
        }

        // ==========================================
        // Cleaning Proof Upload + AI Verification
        // ==========================================

        @PostMapping("/{id}/cleaning-proof")
        public ResponseEntity<?> uploadCleaningProof(
                        @PathVariable Long id,
                        @RequestParam("image") MultipartFile image) {

                try {

                        Complaint complaint = complaintRepository.findById(id)
                                        .orElseThrow(() -> new RuntimeException("Complaint not found"));

                        String uploadDir = System.getProperty("user.dir") + "/uploads/";

                        Path uploadPath = Path.of(uploadDir);

                        if (!Files.exists(uploadPath)) {
                                Files.createDirectories(uploadPath);
                        }

                        String originalFileName = image.getOriginalFilename();

                        if (originalFileName == null ||
                                        originalFileName.isBlank()) {

                                originalFileName = "cleaning-proof.jpg";
                        }

                        String fileName = "proof_" + id + "_" + originalFileName;

                        Path filePath = uploadPath.resolve(fileName);

                        // Save cleaning proof image
                        Files.write(
                                        filePath,
                                        image.getBytes());

                        complaint.setCleaningProofImage(fileName);

                        // ==========================================
                        // Send image to Flask AI Verification
                        // ==========================================

                        RestTemplate restTemplate = new RestTemplate();

                        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

                        body.add(
                                        "image",
                                        new FileSystemResource(filePath.toFile()));

                        HttpHeaders headers = new HttpHeaders();

                        headers.setContentType(
                                        MediaType.MULTIPART_FORM_DATA);

                        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(
                                        body,
                                        headers);

                        ResponseEntity<Map> aiResponse = restTemplate.postForEntity(
                                        "http://ai:5000/verify",
                                        request,
                                        Map.class);

                        Map<String, Object> aiResult = aiResponse.getBody();

                        String verificationResult = aiResult != null
                                        ? String.valueOf(
                                                        aiResult.get("verificationResult"))
                                        : "";
                        System.out.println("AI VERIFICATION RESULT = [" + verificationResult + "]");
                        // ==========================================
                        // Set complaint status
                        // ==========================================

                        if ("CLEAN".equalsIgnoreCase(
                                        verificationResult)) {

                                complaint.setStatus("Resolved");

                        } else if ("NOT_CLEAN".equalsIgnoreCase(
                                        verificationResult)) {

                                complaint.setStatus(
                                                "Re-cleaning Required");

                        } else {

                                complaint.setStatus(
                                                "AI Verification Failed");
                        }

                        Complaint updatedComplaint = complaintRepository.save(complaint);

                        return ResponseEntity.ok(updatedComplaint);

                } catch (IOException e) {

                        return ResponseEntity
                                        .internalServerError()
                                        .body(
                                                        "Failed to save cleaning proof image");

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .internalServerError()
                                        .body(
                                                        "AI Verification failed: "
                                                                        + e.getMessage());
                }
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteComplaint(
                        @PathVariable Long id) {

                if (!complaintRepository.existsById(id)) {
                        return ResponseEntity.notFound().build();
                }

                complaintRepository.deleteById(id);

                return ResponseEntity.ok(
                                "Complaint deleted successfully");
        }

}

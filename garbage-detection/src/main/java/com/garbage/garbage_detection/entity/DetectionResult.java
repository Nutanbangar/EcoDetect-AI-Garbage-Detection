package com.garbage.garbage_detection.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "detection_results")
public class DetectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "image_name", nullable = false)
    private String imageName;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    @Column(name = "garbage_type", nullable = false)
    private String garbageType;

    @Column(name = "location", nullable = false, length = 500)
    private String location;

    public DetectionResult() {
    }

    public DetectionResult(
            Integer userId,
            String userName,
            String imageName,
            LocalDateTime detectedAt,
            String garbageType,
            String location) {

        this.userId = userId;
        this.userName = userName;
        this.imageName = imageName;
        this.detectedAt = detectedAt;
        this.garbageType = garbageType;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }

    public String getGarbageType() {
        return garbageType;
    }

    public void setGarbageType(String garbageType) {
        this.garbageType = garbageType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
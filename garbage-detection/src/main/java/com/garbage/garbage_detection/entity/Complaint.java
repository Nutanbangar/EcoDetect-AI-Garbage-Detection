package com.garbage.garbage_detection.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "garbage_type", nullable = false)
    private String garbageType;

    @Column(name = "image_name")
    private String imageName;

    @Column(name = "location", nullable = false, length = 500)
    private String location;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "worker_id")
    private Integer workerId;

    @Column(name = "worker_name")
    private String workerName;

    @Column(name = "cleaning_proof_image")
    private String cleaningProofImage;

    public Complaint() {
    }

    public Complaint(
            Integer userId,
            String userName,
            String garbageType,
            String imageName,
            String location,
            String status,
            LocalDateTime createdAt) {

        this.userId = userId;
        this.userName = userName;
        this.garbageType = garbageType;
        this.imageName = imageName;
        this.location = location;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getGarbageType() {
        return garbageType;
    }

    public void setGarbageType(String garbageType) {
        this.garbageType = garbageType;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Integer workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getCleaningProofImage() {
        return cleaningProofImage;
    }

    public void setCleaningProofImage(String cleaningProofImage) {
        this.cleaningProofImage = cleaningProofImage;
    }
}
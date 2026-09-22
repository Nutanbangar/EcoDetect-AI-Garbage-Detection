package com.garbage.garbage_detection.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.garbage.garbage_detection.entity.DetectionResult;

public interface DetectionResultRepository extends JpaRepository<DetectionResult, Long> {

    List<DetectionResult> findByUserIdOrderByDetectedAtDesc(Integer userId);

}
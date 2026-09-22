package com.garbage.garbage_detection.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.garbage.garbage_detection.entity.Complaint;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByWorkerIdOrderByCreatedAtDesc(Integer workerId);
}

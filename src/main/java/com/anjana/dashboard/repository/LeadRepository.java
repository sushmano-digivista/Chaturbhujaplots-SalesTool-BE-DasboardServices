package com.anjana.dashboard.repository;

import com.anjana.dashboard.model.Lead;
import com.anjana.dashboard.model.Lead.LeadStatus;
import com.anjana.dashboard.model.Lead.LeadSource;
import com.anjana.dashboard.model.ProjectContent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadRepository extends MongoRepository<Lead, String> {
    List<Lead> findAllByOrderByCreatedAtDesc();
    List<Lead> findByStatus(LeadStatus status);
    List<Lead> findBySource(LeadSource source);
    List<Lead> findByCategoryInterest(String category);
    long countByStatus(LeadStatus status);
    long countByCreatedAtAfter(LocalDateTime after);
    boolean existsByPhone(String phone);
}

@Repository
interface ProjectContentRepository extends MongoRepository<ProjectContent, String> {
    // Singleton document accessed by id = "CONTENT"
}

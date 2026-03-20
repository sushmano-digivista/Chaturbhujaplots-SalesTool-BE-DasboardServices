package com.anjana.dashboard.repository;

import com.anjana.dashboard.model.ProjectContent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectContentRepository extends MongoRepository<ProjectContent, String> {
    // Singleton document accessed by id = "CONTENT"
}

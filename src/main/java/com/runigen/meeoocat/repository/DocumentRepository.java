package com.runigen.meeoocat.repository;

import com.runigen.meeoocat.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    int countByFolderId(Long folderId);
}

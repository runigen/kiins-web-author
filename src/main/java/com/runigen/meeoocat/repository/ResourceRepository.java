package com.runigen.meeoocat.repository;

import com.runigen.meeoocat.entity.Document;
import com.runigen.meeoocat.entity.Resource;
import com.runigen.meeoocat.entity.ResourcePk;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, ResourcePk> {
    // List<Resource> findByDocumentId(String no);

    Resource findByFileIdAndDocumentId(String fileId, String documentId);
}

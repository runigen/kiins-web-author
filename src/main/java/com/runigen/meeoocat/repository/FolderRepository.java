package com.runigen.meeoocat.repository;

import com.runigen.meeoocat.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    int countByUpperId(Long folderId);
}

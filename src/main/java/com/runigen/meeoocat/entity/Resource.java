package com.runigen.meeoocat.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.runigen.meeoocat.vo.FolderVO;
import com.runigen.meeoocat.vo.ResourceVO;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
@NoArgsConstructor
@IdClass(ResourcePk.class)
@Table(name = "resource")
public class Resource {
    @Id
    @Column(length = 14, name = "file_id", unique = true, nullable = false)
    private String fileId;

    @Column(name = "org_file_name", nullable = false)
    private String orgFileName;

    @Column(name="file_name", nullable = false)
    private String fileName;

    @Column(name="file_ext", nullable = true)
    private String fileExt;

    @Column(name="mime_type", nullable = true)
    private String mimeType;

    @Column(name="url", nullable = false)
    private String url;

    @Column(name="file_size", nullable = true)
    private long fileSize;

    @Id
    @Column(name="document_id", nullable = false)
    private String documentId;

    @Column(name="reg_date", updatable = false)
    @CreationTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    private LocalDateTime regDate;

    @Builder(builderClassName = "initBuilder", builderMethodName = "initBuilder")
    public Resource(ResourceVO resourceVO) {
        this.fileId = resourceVO.getFileId();
        this.orgFileName = resourceVO.getOrgFileName();
        this.fileName = resourceVO.getFileName();
        this.fileExt = resourceVO.getFileExt();
        this.mimeType = resourceVO.getMimeType();
        this.url = resourceVO.getUrl();
        this.fileSize = resourceVO.getFileSize();
        this.documentId = resourceVO.getNo();
    }
}

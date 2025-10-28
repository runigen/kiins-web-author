package com.runigen.meeoocat.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.runigen.meeoocat.vo.FolderVO;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Entity
@DynamicInsert
@NoArgsConstructor
@Table(name = "folder")
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "folder_id", unique = true, nullable = false)
    private long folderId;

    @Column(name = "upper_id", nullable = true)
    private long upperId;

    @Column(name="name", nullable = false)
    private String name;

    @Column(name = "user_id", nullable = true)
    private String userId;

    @Column(name="reg_date", updatable = false)
    @CreationTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    private LocalDateTime regDate;

    @Column(name="mod_date")
    @UpdateTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    private LocalDateTime modDate;

    @Builder(builderClassName = "initBuilder", builderMethodName = "initBuilder")
    public Folder(FolderVO folderVO) {
        if (folderVO.getFolderId() != null) {
            this.folderId = folderVO.getFolderId();
        }
        this.upperId = folderVO.getUpperId();
        this.name = folderVO.getName();
        this.userId = folderVO.getUserId();
    }
}

package com.runigen.meeoocat.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.runigen.meeoocat.converter.NullToNConverter;
import com.runigen.meeoocat.converter.NullToZeroConverter;
import com.runigen.meeoocat.vo.DocumentVO;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.annotations.Update;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.Type;
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Entity
@DynamicInsert
@JsonInclude(JsonInclude.Include.NON_NULL)
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "document")
public class Document {
    @Id
    @Column(length = 14, name = "no", unique = true, nullable = false)
    private String no;

    @Column(name = "name", nullable = true)
    private String name;

    @Convert(converter = NullToZeroConverter.class)
    @Column(name = "folder_id", nullable = true)
    private Long folderId;

    @Column(name = "user_id", nullable = true)
    private String userId;

    @Convert(converter = NullToNConverter.class)
    @Column(name = "is_export", nullable = true)
    private String isExport;

    @Column(name="export_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    @DateTimeFormat(pattern = "yyyy-MM-dd hh:mm:ss")
    private LocalDateTime exportDate;

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

    @Type(JsonType.class)
    @Column(name="doc_content_list", columnDefinition = "json")
    private List<Map<String, Object>> docContentList;

    @Builder(builderClassName = "initVOBuilder", builderMethodName = "initVOBuilder")
    public Document(DocumentVO documentVO) {
        this.no = documentVO.getNo();
        this.name = documentVO.getName();
        this.folderId = documentVO.getFolderId();
        this.userId = documentVO.getUserId();
        this.isExport = documentVO.getIsExport();
        this.exportDate = documentVO.getExportDate();
        this.docContentList = documentVO.getDocContentList();
    }

    @Builder(builderClassName = "initDocumentBuilder", builderMethodName = "initDocumentBuilder")
    public Document(String no, String name, Long folderId, String userId, String isExport, LocalDateTime exportDate, List<Map<String, Object>> docContentList) {
        this.no = no;
        this.name = name;
        this.folderId = folderId;
        this.userId = userId;
        this.isExport = isExport;
        this.exportDate = exportDate;
        this.docContentList = docContentList;
    }
}

package com.runigen.meeoocat.vo;

import com.runigen.meeoocat.entity.ResourcePk;
import jakarta.persistence.IdClass;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ResourceVO {
    private String fileId;
    private String documentId;
    private String orgFileName;
    private String fileName;
    private String fileExt;
    private String mimeType;
    private String url;
    private Long fileSize;
    private String no;

//    @Builder
//    public ResourceVO(String fileId, String orgFileName, String fileName, String fileExt, String mimeType, String url, Long fileSize, String no) {
//        this.fileId = fileId;
//        this.orgFileName = orgFileName;
//        this.fileName = fileName;
//        this.fileExt = fileExt;
//        this.mimeType = mimeType;
//        this.url = url;
//        this.fileSize = fileSize;
//        this.no = no;
//    }
}

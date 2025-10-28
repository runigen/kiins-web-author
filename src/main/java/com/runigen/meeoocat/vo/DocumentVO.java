package com.runigen.meeoocat.vo;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
public class DocumentVO {
    private String no;
    private Long folderId;
    private String name;
    private String userId;
    private String isExport;
    private LocalDateTime exportDate;
    private List<Map<String, Object>> docContentList;
    private String regStartDate;
    private String regEndDate;
    private String modStartDate;
    private String modEndDate;

//    public DocumentVO(String no, Long folderId) {
//        this.no = no;
//        this.folderId = folderId;
//    }
//
//    public DocumentVO(String no, Long folderId, String name, String userId, String isExport, LocalDateTime exportDate, List<Map<String, Object>> docContentList ) {
//        this.no = no;
//        this.folderId = folderId;
//        this.name = name;
//        this.userId = userId;
//        this.isExport = isExport;
//        this.exportDate = exportDate;
//        this.docContentList = docContentList;
//    }
//
//    public DocumentVO(String no, Long folderId, String name, String userId, String isExport, LocalDateTime exportDate, List<Map<String, Object>> docContentList, String regStartDate, String regEndDate, String modStartDate, String modEndDate ) {
//        this.no = no;
//        this.folderId = folderId;
//        this.name = name;
//        this.userId = userId;
//        this.isExport = isExport;
//        this.exportDate = exportDate;
//        this.docContentList = docContentList;
//        this.regStartDate = regStartDate;
//        this.regEndDate = regEndDate;
//        this.modStartDate = modStartDate;
//        this.modEndDate = modEndDate;
//    }
}

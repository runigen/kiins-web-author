package com.runigen.meeoocat.vo;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class FolderVO {
    private Long folderId;
    private Long upperId;
    private String name;
    private String userId;
    private String regStartDate;
    private String regEndDate;
    private String modStartDate;
    private String modEndDate;


//    public FolderVO(Long folderId, Long upperId, String name, String userId) {
//        this.folderId = folderId;
//        this.upperId = upperId;
//        this.name = name;
//        this.userId = userId;
//    }
//
//    public FolderVO(Long folderId, Long upperId, String name, String userId, String regStartDate, String regEndDate, String modStartDate, String modEndDate) {
//        this.folderId = folderId;
//        this.upperId = upperId;
//        this.name = name;
//        this.userId = userId;
//        this.regStartDate = regStartDate;
//        this.regEndDate = regEndDate;
//        this.modStartDate = modStartDate;
//        this.modEndDate = modEndDate;
//    }
}

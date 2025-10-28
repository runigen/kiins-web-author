package com.runigen.meeoocat.vo;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfInfoVO {
    int pageSize;
    String filename;
    String ext;
    Long fileSize;
    int generatedImageCnt;
    String savedFilePath;
}

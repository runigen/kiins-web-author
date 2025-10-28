package com.runigen.meeoocat.vo;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfImageVO {
    String fileName;
    String filePath;
    float width;
    float height;
    float realWidth;
    float realHeight;
    float positionX;
    float positionY;
    String accessUrl;
}

package com.runigen.meeoocat.vo;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfTextVO {
    String text;
    float positionX;
    float positionY;
    float width;
    float height;
    float fontSize;
}

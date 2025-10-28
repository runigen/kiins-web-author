package com.runigen.meeoocat.vo;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfPageInfoVO {
    int pageNum;
    float width;
    float height;
}

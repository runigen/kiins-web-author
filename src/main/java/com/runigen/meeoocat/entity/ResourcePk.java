package com.runigen.meeoocat.entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class ResourcePk implements Serializable {
    private String fileId;

    private String documentId;
}

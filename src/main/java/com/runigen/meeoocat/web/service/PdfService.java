package com.runigen.meeoocat.web.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface PdfService {

    public Map<String, Object> savePdf(String pdfId, MultipartFile file) throws IOException;
}

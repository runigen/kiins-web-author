
package com.runigen.meeoocat.web.controller;

import com.runigen.meeoocat.vo.*;
import com.runigen.meeoocat.web.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    @Autowired
    PdfService pdfService;

    @PostMapping("/save")
    public ResponseEntity<Result> pdfSaveAndReturnInfo (
            @RequestPart(value = "pdf_id") String pdfId,
            @RequestPart(value = "file") MultipartFile file) throws IOException {

        Map<String, Object> returnValue;
        returnValue = pdfService.savePdf(pdfId, file);
        Result result = Result.res(HttpStatus.OK, returnValue);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
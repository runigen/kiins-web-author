package com.runigen.meeoocat.web.controller;

import com.runigen.meeoocat.vo.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/docs")
public class ImageController {
    @GetMapping("/{no}/res/{filename}")
    public ResponseEntity<Resource> fileDownload(@PathVariable String no, @PathVariable String filename) throws IOException{
        String rootPath = System.getProperty("user.dir");
        Path filePath = Paths.get(rootPath + File.separator + "docs" + File.separator + no + File.separator + "res" + File.separator + filename);
        InputStreamResource resource = new InputStreamResource(new FileInputStream(filePath.toString()));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .cacheControl(CacheControl.noCache())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .body(resource);
    }

    @GetMapping("/{no}/pdf/{filename}")
    public ResponseEntity<Resource> fileDownloadPdf(@PathVariable String no, @PathVariable String filename) throws IOException{
        String rootPath = System.getProperty("user.dir");
        Path filePath = Paths.get(rootPath + File.separator + "docs" + File.separator + no + File.separator + "pdf" + File.separator + filename);
        InputStreamResource resource = new InputStreamResource(new FileInputStream(filePath.toString()));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .cacheControl(CacheControl.noCache())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .body(resource);
    }
}

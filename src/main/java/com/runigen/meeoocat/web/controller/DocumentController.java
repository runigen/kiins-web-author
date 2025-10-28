package com.runigen.meeoocat.web.controller;

import com.runigen.meeoocat.entity.Document;
import com.runigen.meeoocat.vo.Result;
import com.runigen.meeoocat.vo.DocumentVO;
import com.runigen.meeoocat.web.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/document")
public class DocumentController {
    @Autowired
    DocumentService documentService;

    @GetMapping("/read/{no}")
    public ResponseEntity<Result> readDocument(@PathVariable String no) {
        Document data = documentService.readDocument(no);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PostMapping("/list")
    public ResponseEntity<Result> readDocumentList(@RequestBody(required = false) DocumentVO vo) {
        List<Document> data = documentService.readDocumentList(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PostMapping("/listByFolderId")
    public ResponseEntity<Result> readDocumentListByFolerId(@RequestBody(required = false) DocumentVO vo) {
        List<Map<String, String>> data = documentService.getDocumentListByFolderId(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<Result> updateDocument(@RequestBody DocumentVO vo) throws Exception {
        Document data = documentService.updateDocument(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PutMapping("/update/folder")
    public ResponseEntity<Result> updateFolder(@RequestBody DocumentVO vo) throws Exception {
        Document data = documentService.updateFolder(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<Result> createDocument(@RequestBody DocumentVO vo) throws Exception {
        Document data = documentService.createDocument(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{no}")
    public ResponseEntity<Result> deleteDocuemt(@PathVariable String no) throws IOException {
        documentService.deleteDocument(no);
        return new ResponseEntity<>(Result.res(HttpStatus.OK), HttpStatus.OK);
    }

    @PostMapping("/exportProc")
    public ResponseEntity<Resource> exportProc(@RequestParam MultipartFile file, @RequestParam String no) throws IOException {
        File downloadFile = documentService.exportProc(file, no);
        InputStreamResource resource = new InputStreamResource(new FileInputStream(downloadFile));
        downloadFile.delete();

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .cacheControl(CacheControl.noCache())
                .header("Content-disposition", "attachment; filename=\"" + downloadFile.getName() + "\"")
                .body(resource);
    }

    @PostMapping("/saveAs")
    public ResponseEntity<Result> saveAs(@RequestBody DocumentVO vo) throws IOException {
        Document data = documentService.saveAs(vo);

        Map<String, String> result = new HashMap<String, String>();
        result.put("no", data.getNo());

        return new ResponseEntity<>(Result.res(HttpStatus.OK, result), HttpStatus.OK);
    }
 }

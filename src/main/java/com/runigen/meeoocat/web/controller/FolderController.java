package com.runigen.meeoocat.web.controller;

import com.runigen.meeoocat.entity.Folder;
import com.runigen.meeoocat.vo.FolderVO;
import com.runigen.meeoocat.vo.Result;
import com.runigen.meeoocat.web.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/folder")
public class FolderController {
    @Autowired
    FolderService folderService;

    @GetMapping("/read/{folderId}")
    public ResponseEntity<Result> readDocument(@PathVariable Long folderId) {
        Folder data = folderService.readFolder(folderId);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PostMapping("/list")
    public ResponseEntity<Result> readDocumentList(@RequestBody(required = false)FolderVO vo) {
        List<Folder> data = folderService.readFolderList(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<Result> updateDocument(@RequestBody FolderVO vo) throws Exception {
        Folder data = folderService.updateFolder(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<Result> createDocument(@RequestBody FolderVO vo) throws Exception {
        Folder data = folderService.createFolder(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{folderId}")
    public ResponseEntity<Result> deleteDocuemt(@PathVariable Long folderId) throws IOException {
        folderService.deleteFolder(folderId);
        return new ResponseEntity<>(Result.res(HttpStatus.OK), HttpStatus.OK);
    }
 }

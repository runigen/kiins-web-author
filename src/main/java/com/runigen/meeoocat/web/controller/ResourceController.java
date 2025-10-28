package com.runigen.meeoocat.web.controller;

import com.runigen.meeoocat.entity.Resource;
import com.runigen.meeoocat.mapper.ResourceMapper;
import com.runigen.meeoocat.vo.ResourceVO;
import com.runigen.meeoocat.vo.Result;
import com.runigen.meeoocat.web.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resource")
public class ResourceController {
    @Autowired
    private ResourceService resourceService;

    @Value("${file.upload-path}")
    private String fileUpliadPath;

    @PostMapping("/upload")
    public ResponseEntity<Result> uploadResource(@RequestParam MultipartFile files, @RequestParam String no) throws IOException {

        String rootPath = System.getProperty("user.dir");

        Path directory = Paths.get(rootPath, fileUpliadPath, no, "res");
        Files.createDirectories(directory);

//        for (MultipartFile file : files) {
        File saveFile = new File(rootPath + File.separator + fileUpliadPath + File.separator + no + File.separator + "res" + File.separator + files.getOriginalFilename());
        files.transferTo(saveFile);
//        }

        Map<String, String> data = new HashMap<String, String>();
        String fileName = saveFile.getName();
        String name = fileName.substring(0, fileName.lastIndexOf("."));
        String ext = fileName.substring(fileName.lastIndexOf(".") + 1);
        String mimeType = Files.probeContentType(saveFile.toPath());
        data.put("name", name);
        data.put("ext", ext);
        data.put("mimetype", mimeType);
        data.put("filename", saveFile.getName());
        data.put("url", "docs/" + no + "/res/" + fileName);

        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @PostMapping("/upload/data")
    public ResponseEntity<Result> uploadResourceData(@RequestParam MultipartFile files, @RequestParam String no) throws IOException {
        Resource resource = resourceService.createResource(files, no);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, resource), HttpStatus.OK);
    }

    @PostMapping("/upload/player")
    public ResponseEntity<Result> uploadPlayer(@RequestParam MultipartFile player, @RequestParam MultipartFile license) throws IOException {
        resourceService.uploadPlayer(player, license);
        return new ResponseEntity<>(Result.res(HttpStatus.OK), HttpStatus.OK);
    }

    @PostMapping("/list")
    public ResponseEntity<Result> readResourceList(@RequestBody ResourceVO vo) {
        List<Resource> data = resourceService.readResourceList(vo);
        return new ResponseEntity<>(Result.res(HttpStatus.OK, data), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{documentId}/{fileId}")
    public ResponseEntity<Result> deleteResource(@PathVariable String documentId, @PathVariable String fileId) throws IOException {
        resourceService.deleteResource(documentId, fileId);
        return new ResponseEntity<>(Result.res(HttpStatus.OK), HttpStatus.OK);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Result> deleteResource(@RequestBody Map<String, Object> params) throws IOException {
        resourceService.deleteResource(params);
        return new ResponseEntity<>(Result.res(HttpStatus.OK), HttpStatus.OK);
    }
}

package com.runigen.meeoocat.web.service.impl;

import com.runigen.meeoocat.entity.Resource;
import com.runigen.meeoocat.mapper.ResourceMapper;
import com.runigen.meeoocat.repository.ResourceRepository;
import com.runigen.meeoocat.vo.ResourceVO;
import com.runigen.meeoocat.web.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    @Value("${file.upload-path}")
    private String fileUploadPath;

    @Value("${file.player-path}")
    private String playerPath;

    @Autowired
    ResourceLoader resourceLoader;

    private final ResourceRepository resourceRepository;

    private final ResourceMapper resourceMapper;

    // @Override
    // public Resource readResource(String no) {
    //     return resourceRepository.findById(no).orElseThrow(() -> new MeeoocatException(ErrorCode.INTERNAL_SERVER_ERROR));
    // }

    @Override
    public List<Resource> readResourceList(ResourceVO vo) {
        return resourceMapper.getResourceList(vo);
    }


    @Override
    public Resource createResource(MultipartFile files, String no) throws IOException {
//        Document document = documentRepository.findById(params.getNo()).orElseGet(() -> null);
//        if (document != null) {
//            throw new Exception("이미 등록된 문서 입니다..");
//        }

        UUID uuid = UUID.randomUUID();
        String fileId = Integer.toString(ByteBuffer.wrap(uuid.toString().getBytes()).getInt(), 10);
        String rootPath = System.getProperty("user.dir");
        String orgFileName = files.getOriginalFilename();
        String ext = orgFileName.substring(orgFileName.lastIndexOf(".") + 1);

        Path directory = Paths.get(rootPath, fileUploadPath, no, "res");
        Files.createDirectories(directory);
        File saveFile = new File(rootPath + File.separator + fileUploadPath + File.separator + no + File.separator + "res" + File.separator + fileId + "." + ext);
        files.transferTo(saveFile);

        Resource resource = new Resource();
        String fileName = saveFile.getName();
        String name = fileName.substring(0, fileName.lastIndexOf("."));
        String mimeType = Files.probeContentType(saveFile.toPath());

        resource.setFileId(fileId);
        resource.setDocumentId(no);
        resource.setOrgFileName(orgFileName);
        resource.setFileName(name);
        resource.setFileExt(ext);
        resource.setMimeType(mimeType);
        resource.setFileSize(files.getSize());
        resource.setUrl("docs/" + no + "/res/" + saveFile.getName());

        return resourceRepository.save(resource);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteResource(String documentId, String fileId) throws IOException {
        Resource resource = resourceRepository.findByFileIdAndDocumentId(fileId, documentId);

        if (resource != null) {
            resourceRepository.delete(resource);
            String rootPath = System.getProperty("user.dir");
            String uploadPath = rootPath + File.separator + fileUploadPath;
            String resourcePath = uploadPath + File.separator + resource.getDocumentId() + File.separator + "res" + File.separator + resource.getFileName() + "." + resource.getFileExt();
            Files.deleteIfExists(Paths.get(resourcePath));
        }
    }

    @Override
    public void deleteResource(Map<String, Object> params) throws IOException {
        List<String> fileIds = (List<String>) params.get("fileIds");
        String documentId = (String) params.get("documentId");

        for (String fileId : fileIds) {
            deleteResource(documentId, fileId);
        }
    }

    @Override
    public void uploadPlayer(MultipartFile player, MultipartFile license) throws IOException {
        String _rootPath = System.getProperty("user.dir");
        Path _playerPath = Paths.get(_rootPath, playerPath);
        Files.createDirectories(_playerPath);
        File _playerFile = new File(_playerPath + File.separator + "meeoocat-player.js");
        player.transferTo(_playerFile);
        File _licenseFile = new File(_playerPath + File.separator + "meeoocat-player.js.LICENSE.txt");
        license.transferTo(_licenseFile);
    }
}

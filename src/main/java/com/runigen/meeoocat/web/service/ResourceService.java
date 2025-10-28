package com.runigen.meeoocat.web.service;

import com.runigen.meeoocat.entity.Document;
import com.runigen.meeoocat.entity.Resource;
import com.runigen.meeoocat.vo.ResourceVO;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ResourceService {

    // public Resource readResource(String fileId);

    public List<Resource> readResourceList(ResourceVO vo);

    public Resource createResource(MultipartFile files, String no) throws IOException;

    public void deleteResource(String documentId, String fileId) throws IOException;

    public void deleteResource(Map<String, Object> fileIds) throws IOException;

    public void uploadPlayer(MultipartFile player, MultipartFile license) throws IOException;
}

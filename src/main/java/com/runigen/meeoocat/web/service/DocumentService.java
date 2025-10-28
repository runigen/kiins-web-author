package com.runigen.meeoocat.web.service;

import com.runigen.meeoocat.entity.Document;
import com.runigen.meeoocat.vo.DocumentVO;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface DocumentService {

    public Document readDocument(String no);

    public List<Document> readDocumentList(DocumentVO vo);

    public List<Map<String, String>> getDocumentListByFolderId(DocumentVO vo);

    public Document updateDocument(DocumentVO vo) throws Exception;

    public Document updateFolder(DocumentVO vo) throws IOException;

    public Document createDocument(DocumentVO params) throws Exception;

    public void deleteDocument(String no) throws IOException;

    public File exportProc(MultipartFile file, String no) throws IOException;

    public Document saveAs(DocumentVO vo) throws IOException;
}

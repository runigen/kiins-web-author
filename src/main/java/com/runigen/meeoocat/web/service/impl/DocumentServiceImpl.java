package com.runigen.meeoocat.web.service.impl;

import com.runigen.meeoocat.constant.ErrorCode;
import com.runigen.meeoocat.entity.Document;
import com.runigen.meeoocat.exception.MeeoocatException;
import com.runigen.meeoocat.mapper.DocumentMapper;
import com.runigen.meeoocat.mapper.ResourceMapper;
import com.runigen.meeoocat.repository.ResourceRepository;
import com.runigen.meeoocat.vo.DocumentVO;
import com.runigen.meeoocat.web.service.DocumentService;
import com.runigen.meeoocat.repository.DocumentRepository;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipOutputStream;

import com.runigen.meeoocat.utils.CommonUtils;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    @Value("${file.upload-path}")
    private String fileUploadPath;

    @Value("${file.player-path}")
    private String playerPath;

    private final DocumentRepository documentRepository;

    private final ResourceRepository resourceRepository;

    private final DocumentMapper documentMapper;

    private final ResourceMapper resourceMapper;

    @PersistenceContext
    EntityManager entityManager;

    @Override
    public Document readDocument(String no) {
        return documentRepository.findById(no).orElseThrow(() -> new MeeoocatException(ErrorCode.NOT_FOUND_DOCUMENT));
    }

    @Override
    public List<Document> readDocumentList(DocumentVO vo) {
        return documentMapper.getDocumentList(vo);
    }

    @Override
    public List<Map<String, String>> getDocumentListByFolderId(DocumentVO vo) {
        return documentMapper.getDocumentListByFolderId(vo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Document updateDocument(DocumentVO vo) throws Exception {
        Document document = documentRepository.findById(vo.getNo()).orElseThrow(() -> new MeeoocatException(ErrorCode.NOT_FOUND_DOCUMENT));
        document.setNo(vo.getNo());
        document.setName(vo.getName());
        document.setFolderId(vo.getFolderId());
        document.setIsExport(vo.getIsExport());
        document.setExportDate(vo.getExportDate());
        document.setDocContentList(vo.getDocContentList());
        return document;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Document updateFolder(DocumentVO vo) throws IOException {
        Document document = documentRepository.findById(vo.getNo()).orElseThrow(() -> new MeeoocatException(ErrorCode.NOT_FOUND_DOCUMENT));
        document.setFolderId(vo.getFolderId());
        return document;
    }

    @Override
    public Document createDocument(DocumentVO vo) throws Exception {
        Document document = document = documentRepository.findById(vo.getNo()).orElseGet(() -> null);
        if (document != null) {
            document.setNo(vo.getNo());
            document.setName(vo.getName());
            document.setFolderId(vo.getFolderId());
            document.setUserId(vo.getUserId());
            document.setDocContentList(vo.getDocContentList());
        } else {
            document = Document.initVOBuilder().documentVO(vo).build();
        }
        document = documentRepository.save(document);

        return document;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteDocument(String no) throws IOException {
        Document document = documentRepository.findById(no).orElseGet(() -> null);

        if (document != null) {
            documentRepository.delete(document);
            String rootPath = System.getProperty("user.dir");
            String uploadPath = rootPath + File.separator + fileUploadPath;
            String uploadDocPath = uploadPath + File.separator + no;

            Path docPath = Paths.get(uploadDocPath);
//            Files.deleteIfExists(docPath);
            if (Files.exists(docPath)) {
                Files.walk(docPath)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public File exportProc(MultipartFile jsfile, String no) throws IOException, EntityExistsException {

        String rootPath = System.getProperty("user.dir");
        String uploadPath = rootPath + File.separator + fileUploadPath;
        String uploadDocPath = uploadPath + File.separator + no;
        String viewPath = rootPath + File.separator + playerPath;

        Document document = documentRepository.findById(no).orElseThrow(EntityExistsException::new);

        Path docPath = Paths.get(uploadDocPath);
        Files.createDirectories(docPath);

        Resource[] resources = ResourcePatternUtils
                .getResourcePatternResolver(new DefaultResourceLoader())
                .getResources("document_sample.html");

        InputStream inputStream = null;

        for (Resource resource : resources) {
            inputStream = resource.getInputStream();
        }

        Path newDocFile = Paths.get(uploadDocPath + File.separator + document.getName() + ".html");
        Path newViewFile = Paths.get(viewPath + File.separator + document.getName() + ".html");
        Path viewDocPath = Paths.get(viewPath + File.separator + "docs");
        Path newViewDocPath = Paths.get(viewDocPath + File.separator + no);

        Files.copy(inputStream, newDocFile, StandardCopyOption.REPLACE_EXISTING);
        Files.copy(newDocFile, newViewFile, StandardCopyOption.REPLACE_EXISTING);
        String viewerHtmlContent = "";

        if (document != null) {
            String htmlContents = "<title>[%s] - MEEOOCAT PLAYER</title>\n" +
                    "</head>\n" +
                    "<body>            \n" +
                    "<div id=\"mycontent\"></div>\n" +
                    "<script src=\"%s\"></script>\n" +
                    "<script>\n" +
                    "    meeoocatPlayer.loadContent(\"mycontent\", \"%s\", \"%s\", function() {  \n" +
                    "        // meeoocatPlayer.play();\n" +
                    "    });\n" +
                    "</script>\n" +
                    "</body>\n" +
                    "</html>";

            String ver = readVersion();
            String docHtmlContent = String.format(htmlContents, document.getName(), "../meeoocat-player.js?ver=" + ver, "../", document.getNo());
            Files.write(newDocFile, docHtmlContent.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);

            String exportHtmlContent = String.format(htmlContents, document.getName(), "meeoocat-player.js?ver=" + ver, "docs", document.getNo());
            Files.write(newViewFile, exportHtmlContent.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);

//            viewerHtmlContent = String.format(htmlContents, document.getName(), "../../meeoocat-player.js?ver=" + ver, "../", document.getNo());
        }

        jsfile.transferTo(new File(uploadDocPath + File.separator + jsfile.getOriginalFilename()));

        if (!Files.exists(viewDocPath)) {
            Files.createDirectories(viewDocPath);
        }

        // 파일 복사
        Files.walk(docPath)
            .forEach(source -> {
                try {
                    Files.copy(source, newViewDocPath.resolve(docPath.relativize(source)), StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });

        File zipFile = new File( rootPath, "meeoocat-viewer.zip");
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile));
        File fileToZip = new File(viewPath + File.separator);

        CommonUtils.zipFile(fileToZip, zipFile.getName(), zos);
        zos.close();

        // 삭제
//        Files.deleteIfExists(newDocFile);
        Files.deleteIfExists(newViewFile);
//        Files.deleteIfExists(Paths.get(uploadDocPath + File.separator + jsfile.getOriginalFilename()));
        Files.walk(viewDocPath)
            .sorted(Comparator.reverseOrder())
            .map(Path::toFile)
            .forEach(File::delete);

//        Files.write(newDocFile, viewerHtmlContent.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        document.setIsExport("Y");
        document.setExportDate(LocalDateTime.now());

        documentRepository.save(document);

        return zipFile;
    }

    @Override
    @Transactional
    public Document saveAs(DocumentVO vo) throws IOException {
        String no = vo.getNo();
        Document document = documentRepository.findById(no).orElseThrow(EntityExistsException::new);
        entityManager.detach(document);
        // 신규 Document No 생성
        Date date = new Date();
        String newNo = String.format("MCD%s", Long.toHexString(date.getTime()));

        String rootPath = System.getProperty("user.dir");
        String uploadPath = rootPath + File.separator + fileUploadPath;
        String uploadDocPath = uploadPath + File.separator + no;
        String newUploadDocPath = uploadPath + File.separator + newNo;

        Path docPath = Paths.get(uploadDocPath + File.separator + "res");
        Path newDocPath = Paths.get(newUploadDocPath + File.separator + "res");

        if (Files.exists(docPath)) {
            if (!Files.exists(newDocPath)) {
                Files.createDirectories(newDocPath);
            }

            Files.walk(docPath)
                .forEach(source -> {
                    try {
                        Files.copy(source, newDocPath.resolve(docPath.relativize(source)), StandardCopyOption.REPLACE_EXISTING);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
        }

        List<Map<String, Object>> newDocContentList = document.getDocContentList().stream().map(s -> {
            s.put("docPageContent", s.get("docPageContent").toString().replaceAll(no, newNo));
            return s;
        }).collect(Collectors.toList());

        if (vo.getUserId() != null) {
            document.setUserId(vo.getUserId());
        }

        if (vo.getFolderId() != null) {
            document.setFolderId(vo.getFolderId());
        }

        Document newDocument = Document.initDocumentBuilder()
                .no(newNo)
                .name(vo.getName())
                .folderId(document.getFolderId())
                .userId(document.getUserId())
                .docContentList(newDocContentList)
                .build();

        newDocument = documentRepository.save(newDocument);

        resourceMapper.insertDocumentResource(document.getNo(), newNo);

        return newDocument;
    }

    private String readVersion() {
        String rootPath = System.getProperty("user.dir");
        String viewPath = rootPath + File.separator + playerPath + File.separator + "meeoocat-player.js.LICENSE.txt";
        String result = "";

        try(BufferedReader br = Files.newBufferedReader(Paths.get(viewPath), StandardCharsets.UTF_8)) {
            StringBuilder builder = new StringBuilder();
            String str = null;
            while((str = br.readLine()) != null) {
                if (str.indexOf("Version") > -1) {
                    result = str.substring(str.indexOf(":") + 1, str.length()).trim();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    // public static void  main(String[] args) {
    //     String fileURl = "...";

//        // PDFBox 설정
//        InputStream stream = new URL(fileURl).openStream();
//        PDDocument document = PDDocument.load(stream);stream
//        PDFTextStripper stripper = new PDFTextStripper();
//
//        // 텍스트 추출
//        String extractText = stripper.getText(document);
//
//        // 공백 제거
//        extractText = extractText.trim().replace(" ", "");
//
//        // 특정 문자 추출 (예제: 이메일)
//        Set<String> emails = new HashSet<>();
//        // 이메일 정규식
//        String regEx = "^[a-zA-Z0-9]+\@[a-zA-Z]+\.[a-zA-Z]+$";
//
//        Pattern pattern = Pattern.compile(regEx);
//        Matcher matcher = pattern.matcher(extractText);
//
//        // 추출한 텍스트에서 정규식에 의한 특정 문자 추출
//        while (matcher.find()) {
//            emails.add(matcher.group());
//        }
    // }
}

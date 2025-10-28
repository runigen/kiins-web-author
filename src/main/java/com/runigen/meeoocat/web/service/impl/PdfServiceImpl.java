package com.runigen.meeoocat.web.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.runigen.meeoocat.entity.Resource;
import com.runigen.meeoocat.repository.ResourceRepository;
import com.runigen.meeoocat.utils.GetImageLocationsAndSize;
import com.runigen.meeoocat.vo.PdfImageVO;
import com.runigen.meeoocat.vo.PdfInfoVO;
import com.runigen.meeoocat.vo.PdfPageInfoVO;
import com.runigen.meeoocat.vo.PdfTextVO;
import com.runigen.meeoocat.web.service.PdfService;
import org.apache.pdfbox.contentstream.operator.Operator;
import org.apache.pdfbox.cos.COSBase;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripperByArea;
import org.apache.pdfbox.text.TextPosition;
import org.apache.pdfbox.util.Matrix;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class PdfServiceImpl implements PdfService {

    @Value("${file.upload-path}")
    private String fileUploadPath;

    @Autowired
    ResourceRepository resourceRepository;

    @Override
    public Map<String, Object> savePdf(String pdfId, MultipartFile fromClientfile) throws IOException {

        String rootPath = System.getProperty("user.dir");
        final Map<String, Object> returnValue = new HashMap<String, Object>();  // 리턴 객체 선언
        final int[] imageCnt = {0};   // pdf 내의 이미지 갯수

            // 파일 경로 세팅 및 파일 저장 폴더가 없을 경우 생성.
            //String id = UUID.randomUUID().toString().substring(1,14);   // 나중에 pdfId로 변경.
            String id = pdfId;   // 나중에 pdfId로 변경.

            Path filePath = Paths.get(rootPath, fileUploadPath ,id, "res"); // 전체 경로
            Path fileStringPath = Paths.get(fileUploadPath, id, "res");    // db에 저장될 경로 docs/8269a22-8b9b-/pdf
            Path fileAccessPath = Paths.get(id , "res");
            Files.createDirectories(filePath);

            // 실제 pdf 파일 생성.
            File readfile = new File(filePath + "/" + fromClientfile.getOriginalFilename());
            fromClientfile.transferTo(readfile);
            String fileName = readfile.getName();   // 확장자 포함 파일명.
            String fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));     // 확장자가 없는 파일명
            String ext = fileName.substring(fileName.lastIndexOf(".") + 1); // 확장자 .pdf

            // 확장자 체크
            if(!ext.equals("pdf")) {
                throw new Error(".pdf 확장자만 가능합니다.");
            }

            // pdf 파일 로드
            PDDocument document = PDDocument.load(readfile);
            int pageSize = document.getNumberOfPages();

            // pdf 파일내에서 페이지 추출.
            PDPageTree list = document.getPages();
            int pageIndex = 0;  // 페이지 순번 1 부터 시작
            List pageList = new ArrayList<>();
            List textList = new ArrayList<>();  // 텍스트 객체를 페이지 별로 담을 리스트.
            List<Resource> resourceList = new ArrayList<Resource>();    // db 에 저장될 resource객체 리스트 선언.

            // 각 페이지 별로 반복.
            for (PDPage page : list) {

                // pdf 페이지 정보 가져오기
                float pdfWidth = page.getMediaBox().getWidth();
                float pdfHeight = page.getMediaBox().getHeight();

                // 페이지 정보를 담을 맵 생성.
                Map<String, Object> pageMap = new HashMap<String, Object>();

                // 이미지를 담을 리스트 생성
                List<PdfImageVO> imageList = new ArrayList<PdfImageVO>();

                // 텍스트를 담을 리스트 생성.
                List<PdfTextVO> pdfTextList = new ArrayList<PdfTextVO>();

                // PDRectangle 객체를 PDPage로 부터 가져온다.
                PDRectangle mediaBox = page.getMediaBox();
                Rectangle2D.Float rectangle = new Rectangle2D.Float(mediaBox.getLowerLeftX(),
                        mediaBox.getLowerLeftY(),
                        mediaBox.getWidth(),
                        mediaBox.getHeight());

                PDFTextStripperByArea stripper = new PDFTextStripperByArea() {

                    @Override
                    protected void writeString(String string, List<TextPosition> textPositions) throws IOException {
                        float x = textPositions.get(0).getXDirAdj();
                        float y = textPositions.get(0).getYDirAdj();
                        float width = textPositions.get(textPositions.size() - 1).getXDirAdj()
                                + textPositions.get(textPositions.size() - 1).getWidthDirAdj() - x;
                        float height = textPositions.get(textPositions.size() - 1).getYDirAdj() - y;
                        float fontSize = textPositions.get(0).getFontSize();

                        // PdfText 객체를 생성 하여 담는다.
                        PdfTextVO pdfText = new PdfTextVO();
                        pdfText.setText(string);
                        pdfText.setPositionX(x);
                        pdfText.setPositionY(y);
                        pdfText.setWidth(width);
                        pdfText.setHeight(height);
                        pdfText.setFontSize(fontSize);

                        // 리스트에 PdfText 객체를 추가 한다.
                        pdfTextList.add(pdfText);
                        super.writeString(string, textPositions);
                    }
                };

                stripper.setSortByPosition(true);
                stripper.addRegion("region", rectangle);
                stripper.extractRegions(page);

                //String text = stripper.getTextForRegion("region");

                // 이미지 관련 파싱 시작.
                int finalPageIndex = pageIndex;
                int[] imageIndexPerPage = {0};
                GetImageLocationsAndSize printer = new GetImageLocationsAndSize() {
                    @Override
                    protected void processOperator(Operator operator, List<COSBase> operands) throws IOException
                    {
                        String operation = operator.getName();
                        if( "Do".equals(operation)) {
                            COSName objectName = (COSName) operands.get(0);
                            // get the PDF object
                            PDXObject xobject = getResources().getXObject( objectName );
                            // check if the object is an image object
                            if( xobject instanceof PDImageXObject)
                            {
                                imageCnt[0]++;      // 이미지 갯수 추가
                                imageIndexPerPage[0]++; // 페이지별 인덱스
                                PDImageXObject image = (PDImageXObject) xobject;

                                Matrix ctmNew = getGraphicsState().getCurrentTransformationMatrix();

                                float imageXScale = ctmNew.getScalingFactorX();
                                float imageYScale = ctmNew.getScalingFactorY();
                                float positionX = ctmNew.getTranslateX();
                                float positionY = ctmNew.getTranslateY();
                                int imageWidth = image.getWidth();
                                int imageHeight = image.getHeight();

                                String randomId = UUID.randomUUID().toString();  // 파일마다 랜덤 아이디 생성.
                                String fileId = Integer.toString(ByteBuffer.wrap(randomId.getBytes()).getInt(), 10);
                                // orgFileName 형태 : 문서제목(pdf000...)-0페이지번호-0페이지내순번 (순번, 페이지 2자리로 채우기)
                                String orgFileName = fileNameWithoutExtension + "-" + String.format("%02d", finalPageIndex + 1) + "-" + String.format("%02d", imageIndexPerPage[0]) + ".png";

                                File file = new File(filePath + File.separator + fileId + "." + "png");  // 파일 객체 생성.
                                String mimeType = Files.probeContentType(file.toPath());

                                BufferedImage bufferedImage = image.getImage();
                                ImageIO.write(bufferedImage, "png", file);  // 생성된 파일에 이미지 write

                                // image 정보 추가.
                                // positionY 의 계산 방법이 html과 pdf방식이 다르다.
                                // html 은 위에서 아래로 계산하는 방식이고 pdf는 아래에서 위로 계산하는 방식이라 아래와 같이 계산해 준다.
                                PdfImageVO pdfImage = PdfImageVO.builder()
                                        .fileName(file.getName())
                                        .filePath(fileStringPath + File.separator + file.getName())
                                        .accessUrl(fileAccessPath + File.separator + file.getName())
                                        .width(imageXScale)
                                        .height(imageYScale)
                                        .realWidth(imageWidth)
                                        .realHeight(imageHeight)
                                        .positionX(positionX)
                                        .positionY( Math.abs(pdfHeight - positionY - imageYScale) )
                                        .build();
                                imageList.add(pdfImage);

                                // db에 저장할 이미지 정보를 resource 객체에 담는다.
                                Resource resource = new Resource();
                                resource.setFileId(fileId);
                                resource.setDocumentId(id);
                                resource.setOrgFileName(orgFileName);
                                //resource.setFileName(file.getName().substring(0, file.getName().lastIndexOf(".")));
                                resource.setFileName(fileId);
                                resource.setFileExt("png");
                                resource.setMimeType(mimeType);
                                resource.setFileSize(file.length());
                                resource.setUrl(fileStringPath + File.separator + file.getName());

                                // db 에 저장할 resource를 list에 추가하기
                                resourceList.add(resource);
                            }
                        } else {
                            super.processOperator( operator, operands);
                        }
                    }
                };
                printer.processPage(page);

                // 각 pdf 페이지로 부터 리소스 가져오기.
                PdfPageInfoVO pdfPageInfo = PdfPageInfoVO.builder()
                        .pageNum(pageIndex)
                        .height(pdfHeight)
                        .width(pdfWidth)
                        .build();

                // 각 페이지 별로 세팅된 정보를 map에 담기
                pageMap.put("pageNum", pdfPageInfo); // 페이지 정보
                pageMap.put("images", imageList);    // 페이지내 이미지
                pageMap.put("texts" , pdfTextList);  // 페이지내 텍스트 정보

                textList.add(pdfTextList);  // 각 페이지 별로 텍스트 리스트에 텍스트 담기.
                pageList.add(pageMap);  // 담은 pageMap 을 리스트에 담기.

                pageIndex++;    // 한 페이지가 끝나면  카운트 하나씩 올려 주기.
            }

            // pdf text resource 객체 생성 및 resource 리스트에 add.
            String randomId = UUID.randomUUID().toString();
            String fileId = Integer.toString(ByteBuffer.wrap(randomId.getBytes()).getInt(), 10);

            // pdf text 파일 생성 및 쓰기.
            File pdfTextFile = new File(filePath + "/" + fileId + ".txt");  // 파라미터로 온 id값 으로 파일명 작업.
            // jackson objectmapper 객체 생성
            ObjectMapper objectMapper = new ObjectMapper();
            String pdtTextAll = objectMapper.writeValueAsString(textList);
            FileWriter fw = new FileWriter(pdfTextFile);
            BufferedWriter writer = new BufferedWriter(fw);
            writer.write(pdtTextAll);
            writer.close();

            Resource resource = new Resource();
            resource.setFileId(fileId);
            resource.setDocumentId(id);
            resource.setOrgFileName(fileNameWithoutExtension + ".txt"); // 텍스트 파일은 없기 때문에 기존 파일명에 .txt확장자를 붙여 준다.
            resource.setFileName(fileId);
            resource.setFileExt("txt");
            resource.setMimeType("text/plain");
            resource.setFileSize(pdfTextFile.length());
            resource.setUrl(fileStringPath + File.separator + pdfTextFile.getName());
            resourceList.add(resource); // pdf text 객체 list에 삽입.

            // 한꺼번에 resource 객체를 를 DB에 저장한다.
            resourceRepository.saveAll(resourceList);

            // 모든 페이지의 loop이 종료 되면 리턴값을 세팅한다.
            // info 정보 세팅.
            PdfInfoVO info = PdfInfoVO.builder()
                    .filename(fileName)
                    .fileSize(fromClientfile.getSize())
                    .ext(ext)
                    .savedFilePath(fileStringPath + File.separator)
                    .pageSize(pageSize)
                    .generatedImageCnt(imageCnt[0])
                    .build();

            // return 객체에 info , pages 넣기.
            returnValue.put("info", info);
            returnValue.put("pages", pageList);

            document.close();   // document 닫기

            return returnValue;
    }

}

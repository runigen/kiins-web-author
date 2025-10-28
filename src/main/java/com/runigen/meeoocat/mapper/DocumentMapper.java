package com.runigen.meeoocat.mapper;

import com.runigen.meeoocat.entity.Document;
import com.runigen.meeoocat.vo.DocumentVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface DocumentMapper {
    List<Document> getDocumentList(DocumentVO vo);

    List<Map<String, String>> getDocumentListByFolderId(DocumentVO vo);
}

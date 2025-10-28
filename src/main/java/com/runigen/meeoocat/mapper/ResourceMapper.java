package com.runigen.meeoocat.mapper;

import com.runigen.meeoocat.entity.Resource;
import com.runigen.meeoocat.vo.ResourceVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ResourceMapper {
    List<Resource> getResourceList(ResourceVO vo);

    void insertDocumentResource(@Param("orgDocumentId") String orgDocumentId, @Param("newDocumentId") String newDocumentId);
}

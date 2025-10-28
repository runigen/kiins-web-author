package com.runigen.meeoocat.mapper;

import com.runigen.meeoocat.entity.Folder;
import com.runigen.meeoocat.vo.FolderVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface FolderMapper {
    List<Folder> getFolderList(FolderVO vo);
}

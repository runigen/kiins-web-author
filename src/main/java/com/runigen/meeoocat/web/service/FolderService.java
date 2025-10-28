package com.runigen.meeoocat.web.service;

import com.runigen.meeoocat.entity.Folder;
import com.runigen.meeoocat.vo.FolderVO;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface FolderService {

    public Folder readFolder(Long folderId);

    public List<Folder> readFolderList(FolderVO vo);

    public Folder updateFolder(FolderVO vo);

    public Folder createFolder(FolderVO vo);

    public void deleteFolder(Long folderId);
}

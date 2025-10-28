package com.runigen.meeoocat.web.service.impl;

import com.runigen.meeoocat.constant.ErrorCode;
import com.runigen.meeoocat.entity.Folder;
import com.runigen.meeoocat.exception.MeeoocatException;
import com.runigen.meeoocat.mapper.FolderMapper;
import com.runigen.meeoocat.repository.DocumentRepository;
import com.runigen.meeoocat.repository.FolderRepository;
import com.runigen.meeoocat.vo.FolderVO;
import com.runigen.meeoocat.web.service.DocumentService;
import com.runigen.meeoocat.web.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;

    private final FolderMapper folderMapper;

    private final DocumentRepository documentRepository;

    @Override
    public Folder readFolder(Long folderId) {
        return folderRepository.findById(folderId).orElseThrow(() -> new MeeoocatException(ErrorCode.NOT_FOUND_FOLDER));
    }

    @Override
    public List<Folder> readFolderList(FolderVO vo) {
        return folderMapper.getFolderList(vo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Folder updateFolder(FolderVO vo) {
        Folder folder = folderRepository.findById(vo.getFolderId()).orElseThrow(() -> new MeeoocatException(ErrorCode.NOT_FOUND_FOLDER));
        folder.setFolderId(vo.getFolderId());
        folder.setName(vo.getName());
        folder.setUpperId(vo.getUpperId());
        return folder;
    }

    @Override
    public Folder createFolder(FolderVO vo) {
        Folder folder = Folder.initBuilder().folderVO(vo).build();
        return folderRepository.save(folder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteFolder(Long folderId) {
        int docCnt = documentRepository.countByFolderId(folderId);
        int folderCnt = folderRepository.countByUpperId(folderId);
        if (docCnt > 0 || folderCnt > 0) {
            throw new MeeoocatException(ErrorCode.FOLDER_NOT_EMPTY);
        }

        Folder documentFolder = folderRepository.findById(folderId).orElseGet(() -> null);
        if (documentFolder == null) {
            throw new MeeoocatException(ErrorCode.NOT_FOUND_FOLDER);
        }
        folderRepository.delete(documentFolder);
    }
}

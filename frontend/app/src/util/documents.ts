// import { createDocumentRegistry } from 'typescript';
import * as DataStore from '../store/DataStore';
import { IDocContents, IdocInfo, IdocListInfo } from '../const/types';
import {
    // getCurrentDateTime,
    // sortObjectList,
    getNewObjectOrderNo,
    setLastObjectOrderNo,
} from './common';
import $ from 'jquery';
import workInfo from '../store/workInfo';
// import userInfo from '../store/userInfo';
import * as objects from '../util/objects';
import * as pages from '../util/pages';
import docData from '../store/docData';
import { UserConfigDialog, hideDialog, showToastMessage } from '../util/dialog';
import { autoSaveTimerDelay } from '../const/basicData';
import { saveLogicContent } from '../util/logiceditor';
// import { setTextEditMode } from '../util/texteditor';

const docNoHead = 'MCD';
// const folderNoHead = 'MCF';

export const getNewDocNo = () => {
    return docNoHead + new Date().getTime().toString(16);
};
export const getNewDocName = () => {
    return '제목 없는 문서';
};
export const getDocumentInfo = async (docNo: string) => {
    const docInfo: IdocInfo | null = await DataStore.getDocument(docNo);
    // if (docInfo === null) {
    //     const pageObj = pages.createPageObject();
    //     const docContentInfo: IDocContents = {
    //         docPageContent: pageObj.outerHTML,
    //         docPageId: pageObj.id,
    //         docPageName: '',
    //         docPageThumbnail: '',
    //         logicContent: '',
    //         logicActionList: [],
    //     };
    //     docInfo = {
    //         no: docNo,
    //         name: '',
    //         userId: DataStore.getUserId(),
    //         folderId: 0,
    //         docContentList: [docContentInfo],
    //         regdate: getCurrentDateTime(),
    //     };
    // }
    if (docInfo !== null) {
        setHtmlTitle(docInfo.name);
    }
    return docInfo;
};
export const loadDocument = async (docNo: string) => {
    console.log('loadDocument docNo : ', docNo);
    const docInfo = await getDocumentInfo(docNo);

    // 문서데이터가 없으면 문서목록 오픈
    if (docInfo === null) {
        docData.setDocNo('');
        workInfo.setListMode();
        return;
    }
    console.log('getDocumentInfo : 2');
    console.log('docInfo : ', docInfo);

    docData.setDocName(docInfo.name !== '' ? docInfo.name : getNewDocName());
    docData.setFolderId(docInfo.folderId || 0);

    // const docContentsList = docInfo.content;
    // $('#idx_canvas_sheet').html(docInfo.content[0]);
    docData.setDocContentList(docInfo.docContentList);
    // docData.setLogicContentList(docInfo.logicContentList || []);
    // docData.setLogicActionList(docInfo.logicActionList);
    docData.setCurrPage(1);
    // initializeObjects();

    DataStore.setNewDocChkSum(docInfo);
};
export const loadPageContent = (content: string) => {
    $('#idx_canvas_sheet').html(content);
    initializeObjects();
};

/** 현재 문서 내용을 (페이지별 배열로)불러온다. : 현재 페이지가 1개만 존재하므로, 임시로 현재 캔버스의 데이터 1개만 리턴 */
export const getDocContentList = () => {
    // return [$('#idx_canvas_sheet').html()];
    return docData.getDocContentsList();
};
export const saveDocumentInfo = async (docInfo: IdocInfo) => {
    try {
        // user id check
        const userId = DataStore.getUserId();
        if (userId === '') {
            UserConfigDialog((textForm: HTMLInputElement) => {
                const userId = textForm.value.trim();
                if (userId === '') {
                    showToastMessage('사용자 아이디를 입력해주세요.');
                    textForm.focus();
                    return;
                }
                DataStore.setUserId(userId);
                hideDialog();
                saveDocumentInfo(docInfo);
            });
            return false;
        }

        // const orgDocInfo: IdocInfo | null =
        //     (await DataStore.getDocument(docInfo.no)) || null;
        // let newDocInfo: IdocInfo;

        // if (orgDocInfo) {
        //     // 기존에 있는 문서인경우 기존 내용에 덮어쓰기
        //     newDocInfo = {
        //         ...orgDocInfo,
        //         ...docInfo,
        //         userId: userId,
        //         moddate: getCurrentDateTime(),
        //     };
        // } else {
        // 새로운 문서인 경우 전달 받은 정보로 모두 업데이트
        const newDocInfo: IdocInfo = {
            ...docInfo,
            userId: userId,
            // regdate: getCurrentDateTime(),
            // moddate: getCurrentDateTime(),
        };
        // }
        const saveRst = await DataStore.setDocument(newDocInfo);
        if (saveRst === false) {
            console.log('save fail docNo : ', docInfo.no);
            return false;
        }
        setHtmlTitle(docInfo.name);
        console.log('save success docNo : ', docInfo.no);
        return true;
    } catch (e) {
        console.log('save fail docNo : ', docInfo.no);
        return false;
    }
};
export const saveCurrentDocument = async () => {
    try {
        setCurrentDocContent();
        const docInfo: IdocInfo = {
            no: docData.getDocNo(),
            name: docData.getDocName(),
            userId: DataStore.getUserId(),
            folderId: docData.getFolderId(),
            docContentList: docData.getDocContentsList(),
        };
        console.log('saveCurrentDocument docInfo : ', docInfo);
        const rst = await saveDocumentInfo(docInfo);
        return rst;
    } catch (e) {
        console.log('save fail docNo : ', docData.getDocNo());
        return false;
    }
};
export const setCurrentDocContent = () => {
    docData.setDocPageContent($('#idx_canvas_sheet').html());
    const pageName = pages.getPageName();
    const pageTplType = pages.getTplType();
    docData.setDocPageName(pageName);
    docData.setDocPageTplType(pageTplType);
    docData.setDocPageId(pages.getPageId());
};
export const setHtmlTitle = (title: string) => {
    if (title === '') {
        title = 'UNTITLED';
    }
    document.title = `[${title}] KIINS.${process.env.REACT_APP_VERSION}`;
};
// export const getDocumentList = async (): Promise<IdocInfo[]> => {
//     let docList = await DataStore.getDocumentList(docNoHead);
//     if (docList.length) {
//         docList = sortObjectList(docList, 'name', 'ASC');
//     }
//     return docList;
// };
export const getDocumentList = async (
    folderId = 0,
): Promise<IdocListInfo[]> => {
    return await DataStore.getDocumentList(folderId);
};
export const initializeObjects = () => {
    // workInfo.setObjectList([]);
    const objectList: HTMLElement[] = [];
    let lastOrderNo = 0;
    $('#idx_canvas_sheet .object').each(
        (index: number, element: HTMLElement) => {
            // workInfo.addObjectList(element);
            if (objects.getObjectOrderNo(element) === 0) {
                lastOrderNo = getNewObjectOrderNo();
                objects.setObjectOrderNo(element, lastOrderNo);
            } else {
                lastOrderNo = objects.getObjectOrderNo(element);
            }
            objectList.push(element);

            // textbox guide line 제거
            $(element).find('.text-object-outline').remove();
            $(element).find('.textbox').removeAttr('contenteditable');
            $(element).find('.textbox_guide').remove();
        },
    );
    setLastObjectOrderNo(lastOrderNo);
    workInfo.setObjectList(objectList);
};

// 현재 문서를 뷰어용으로 정리
export const getViewerSource = (canvasContainer: HTMLDivElement): string => {
    const tmpContainer = document.createElement('div');
    $(tmpContainer).html($(canvasContainer).html());

    // 필요없는 오브젝트 제거
    $(tmpContainer).children('.object.folder').remove();

    // 필요없는 속성 제거
    $(tmpContainer)
        .children('.object')
        .each((index: number, element: Element) => {
            $(element).removeAttr('folderinfo');
            $(element).removeAttr('folderstatus');
            $(element).removeAttr('folderview');
            // $(element).removeAttr('folderview2');
            // $(element).removeAttr('folderview3');
            $(element).removeAttr('orderno');
        });
    return $(tmpContainer).html();
};
export const getDocViewerContentList = () => {
    // const canvasObject = getCanvasObject();
    // if (canvasObject) {
    //     return [getViewerSource(canvasObject)];
    // } else {
    //     return [];
    // }
    const docContentsList = docData.getDocContentsList();
    const viewerContentsList: IDocContents[] = [];
    docContentsList.forEach(content => {
        const tmpContainer = document.createElement('div');
        $(tmpContainer).html(content.docPageContent);
        viewerContentsList.push({
            ...content,
            docPageContent: getViewerSource(tmpContainer),
            logicContent: '',
            docPageThumbnail: '',
        });
    });
    return viewerContentsList;
};
let autoSaveIntervalTimer: any = null;
export const setAutoSave = () => {
    // if (autoSaveIntervalTimer) {
    //     clearInterval(autoSaveIntervalTimer);
    //     autoSaveIntervalTimer = null;
    // }
    unsetAutoSave();
    autoSaveIntervalTimer = setInterval(async () => {
        if (docData.getModified()) {
            console.log('auto save start');
            const rst = await saveCurrentDocument();
            if (rst) {
                showOnceTitleMessage('저장되었습니다.');
                docData.setModified(false);
            } else {
                showToastMessage('저장에 실패했습니다.');
            }
        } else {
            console.log('auto save skip');
        }
    }, autoSaveTimerDelay * 1000);
};
export const unsetAutoSave = () => {
    if (autoSaveIntervalTimer) {
        clearInterval(autoSaveIntervalTimer);
        autoSaveIntervalTimer = null;
    }
};
export const showOnceTitleMessage = (msg: string, sec = 3) => {
    const orgTitleMsg = document.title;
    document.title = `${msg} - ${orgTitleMsg}`;
    setTimeout(() => {
        document.title = orgTitleMsg;
    }, sec * 1000);
};
/** docs/{docNo}/ 패턴의 경로를 공백으로 치환
 * ex)
 * docs/MCD186742d3f27/res/dd.png  => res/dd.png
 */
export const replaceDocImagePathAll = (
    docNo: string,
    docContentString: string,
) => {
    const regexAllCase = new RegExp(`docs/${docNo}/`, 'g');
    return docContentString.replace(regexAllCase, '');
};
export const saveAsDocument = async (docName: string) => {
    const docNo = docData.getDocNo();
    return await DataStore.setSaveAsDocument(docNo, docName);
};
export const sendToDocument = async (docName: string, userId: string) => {
    const docNo = docData.getDocNo();
    return await DataStore.setSendToDocument(docNo, docName, userId);
};

/**
 * @description 페이지가 닫히거나 새로고침될때 현재 문서를 저장하는 request를 보낸다.(응답은 무시), window.unload 이벤트에 등록하여 사용, 저장할 문서의 데이터가 없으면 저장하지 않는다. 저장할 문서의 데이터크기가 크면 저장되지 않을 수 있다.
 *
 */
export const setDocumentBeforeUnload = () => {
    const logicMode = workInfo.getLogicMode();
    if (logicMode === true) {
        saveLogicContent();
    }
    setCurrentDocContent();
    const docInfo: IdocInfo = {
        no: docData.getDocNo(),
        name: docData.getDocName(),
        userId: DataStore.getUserId(),
        docContentList: docData.getDocContentsList(),
    };
    DataStore.setDocumentBeacon(docInfo);
};
/**
 * @param searchFolderId : 문서가 속한 폴더의 id (searchFolderId가 0이면 현재 열린 문서가 속한 폴더id 기준으로 검색)
 * @param maxSearchDepth : 최대 검색 깊이
 * @returns IdocListInfo[]
 * @description 현재 문서가 속한 폴더의 경로를 배열로 순서에 맞게 가져온다. 기본 10depth까지 검색하고, searchFolderId가 0이면 현재 열린 문서가 속한 폴더를 기준으로 검색한다.
 */
export const getDocFolderPathInfo = async (
    searchFolderId = 0,
    maxSearchDepth = 10,
) => {
    if (searchFolderId === 0) {
        searchFolderId = docData.getFolderId();
    }
    let newFolderPathList: IdocListInfo[] = [];
    for (let i = 0; i < maxSearchDepth; i++) {
        const curDocFolderInfo = await DataStore.getFolderInfo(searchFolderId);
        console.log('curDocFolderInfo : ', curDocFolderInfo);
        if (curDocFolderInfo === null) {
            newFolderPathList = [];
            break;
        }
        newFolderPathList.unshift({
            isFolder: 'Y',
            isExport: 'N',
            exportDate: null,
            modDate: '',
            name: curDocFolderInfo.name,
            cnt: 0,
            regDate: '',
            id: String(curDocFolderInfo.folderId),
            upperId: curDocFolderInfo.upperId,
            userId: curDocFolderInfo.userId,
        });
        if (curDocFolderInfo.upperId === 0) {
            break;
        }
        searchFolderId = curDocFolderInfo.upperId;
    }
    return newFolderPathList;
};

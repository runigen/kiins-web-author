import $ from 'jquery';
import * as basicData from '../const/basicData';
import {
    // IshapeInfo,
    // IstyleInfo,
    IstretchCssInfo,
    // IobjectSizeInfo,
    IpageSizeInfo,
    EundoStackAddType,
    ETemplateType,
    IDocContents,
} from '../const/types';
// import * as keyframe from './keyframe';
// import * as transition from './transition';
// import * as KeyEvent from '../event/KeyEvent';
import * as CommonEvent from '../event/CommonEvent';
import * as dialog from './dialog';
import * as common from './common';
import workInfo from '../store/workInfo';
import docData from '../store/docData';
import * as dostack from './dostack';
import * as documents from './documents';
import * as htmlToImage from 'html-to-image';

let lastPageWidth = basicData.defaultPageSizeInfo.width;
let lastPageHeight = basicData.defaultPageSizeInfo.height;

export const getCanvasObject = (): HTMLDivElement => {
    return document.getElementById('idx_canvas_sheet') as HTMLDivElement;
};
export const getCanvasShadowObject = (): HTMLDivElement => {
    return document.getElementById('idx_canvas_sheet_shadow') as HTMLDivElement;
};
export const getCanvasContainer = (): HTMLDivElement => {
    return document.getElementById('idx_canvas_container') as HTMLDivElement;
};
export const getPreviewCanvasObject = (): HTMLDivElement | null => {
    return document.getElementById(
        'idx_meeoocat_view_container',
    ) as HTMLDivElement | null;
};
export const getWorkspace = (): HTMLDivElement => {
    return document.getElementById('idx_workspace') as HTMLDivElement;
};
export const getBodyMiddleWorkspace = (): HTMLDivElement => {
    return document.getElementById(
        'idx_body_middle_workspace',
    ) as HTMLDivElement;
};
export const getCanvasDropAreaObject = (): HTMLDivElement => {
    return document.getElementById('idx_canvas_drop_area') as HTMLDivElement;
};
export const createPageObject = (
    tplType: ETemplateType = ETemplateType.none,
) => {
    const pageObj = document.createElement('div') as HTMLDivElement;
    pageObj.id = common.getNewPageId();
    pageObj.className = 'page';
    pageObj.setAttribute('object-type', 'page');
    pageObj.setAttribute('page-name', common.getNewPageName());
    pageObj.setAttribute('tpl-type', tplType);
    $(pageObj).css({
        // width: basicData.defaultPageSizeInfo.width,
        // height: basicData.defaultPageSizeInfo.height,
        width: lastPageWidth,
        height: lastPageHeight,
        backgroundColor: basicData.defaultPageBgColor,
    });
    return pageObj;
};
export const getPageObject = (
    elem: HTMLElement | null = null,
): HTMLDivElement => {
    const pageObj = elem
        ? (elem.querySelector('.page') as HTMLDivElement)
        : (document.querySelector('#idx_canvas_sheet .page') as HTMLDivElement);
    return pageObj;
};
export const getPreviewPageObject = (
    elem: HTMLElement | null = null,
): HTMLDivElement => {
    const pageObj = elem
        ? (elem.querySelector('.page') as HTMLDivElement)
        : (document.querySelector(
              '#idx_meeoocat_view_container .page',
          ) as HTMLDivElement);
    return pageObj;
};
export const setPageName = (pageName: string) => {
    const pageObj = getPageObject();
    $(pageObj).attr('page-name', pageName);
    docData.setDocPageName(pageName);
};
export const getPageName = (): string => {
    const pageObj = getPageObject();
    return String($(pageObj).attr('page-name') || '');
};
export const setPageSize = (
    pageSizeInfo: IpageSizeInfo | null = null,
    bAddUndoStack = true,
) => {
    const pageObj = getPageObject();
    if (pageSizeInfo === null) {
        pageSizeInfo = basicData.defaultPageSizeInfo;
    }
    $(pageObj).css({ width: pageSizeInfo.width, height: pageSizeInfo.height });
    setWorkSpaceMinSize();
    if (bAddUndoStack === true) {
        // dostack.addUndoStack('', EundoStackAddType.page);
        dostack.addUndoStack('', EundoStackAddType.all);
    }
};
export const getPageSize = (): IpageSizeInfo => {
    const pageObj = getPageObject();
    return {
        // width: Number($(pageObj).css('width').replace(/px/,'')),
        // height: Number($(pageObj).css('height').replace(/px/,'')),
        width: $(pageObj).width() || basicData.defaultPageSizeInfo.width,
        height: $(pageObj).height() || basicData.defaultPageSizeInfo.height,
    };
};
// canvas 사이즈를 이용해 workspace 의 minSize 설정 (캔버스와 워크스페이스간에 일정 간격을 항상 두기 위해)
export const setWorkSpaceMinSize = () => {
    console.log('setFitCanvas');
    const bodyWorkspace = getBodyMiddleWorkspace();
    if (bodyWorkspace === null) return;

    const pagesObj = getPageObject();
    if (pagesObj === null) return;

    const pagesObjWidth = $(pagesObj).width() || 0;
    const pagesObjHeight = $(pagesObj).height() || 0;
    console.log('pagesObjWidth :', pagesObjWidth);
    console.log('pagesObjHeight :', pagesObjHeight);

    $(bodyWorkspace).css(
        'min-height',
        pagesObjHeight + basicData.workSpaceMinSizeConst,
    );
    $(bodyWorkspace).css(
        'min-width',
        pagesObjWidth + basicData.workSpaceMinSizeConst,
    );
};

export const setPageBackColor = (color: string, bAddUndoStack = true) => {
    const pageObj = getPageObject();
    // const pageObj = docData.getPageObject();
    if (pageObj === null) return;

    // // 이전 컬러값 추출
    // const orgRgb = getPageBackColor();
    // const orgRgbList = common.cssRgbToColorArray(orgRgb);
    // let orgOpacity = 1;
    // if (orgRgbList.length === 4) {
    //     orgOpacity = orgRgbList[3];
    // }

    // const newRgb = common.hexToRgb(color);
    // newRgb.push(orgOpacity);
    // const newCssRgb = 'rgba(' + newRgb.join(',') + ')';

    // $(pageObj).css('background-color', newCssRgb);
    // if (color === '') {
    //     $(pageObj).css('background', '');
    //     $(pageObj).css('opacity', '');
    // }
    $(pageObj).css('background-color', color);

    if (color === '') {
        $(pageObj).css('background', '');
        $(pageObj).css('opacity', '');
        $(pageObj).removeAttr('resource-id');
    }

    if (bAddUndoStack === true) {
        // dostack.addUndoStack('', EundoStackAddType.page);
        dostack.addUndoStack('', EundoStackAddType.all);
    }
};
export const getPageBackColor = () => {
    const pageObj = getPageObject();
    return $(pageObj).css('background-color');
};
export const getPageStyleInfo = () => {
    const pageObj = getPageObject();
    const currBackColor = $(pageObj).css('background-color');
    const currBackImage = $(pageObj)
        .css('background-image')
        .replace(/^url\(['"](.+)['"]\)/, '$1');
    const currBackImageSize =
        $(pageObj).css('background-size') ||
        basicData.defaultBgStretchList.css.bgSize;
    const currBackImageRepeat =
        $(pageObj).css('background-repeat') ||
        basicData.defaultBgStretchList.css.bgRepeat;
    const currBackImagePosition =
        $(pageObj).css('background-repeat') ||
        basicData.defaultBgStretchList.css.bgPosition;
    const currOpacity = Number(Number($(pageObj).css('opacity')).toFixed(2));

    return {
        backgroundColor: currBackColor,
        backgroundImage: currBackImage,
        backgroundSize: currBackImageSize,
        backgroundRepeat: currBackImageRepeat,
        backgroundPosition: currBackImagePosition,
        opacity: currOpacity,
    };
};
export const setPageBgStretchInfo = (stretchInfo: IstretchCssInfo) => {
    const pageObj = getPageObject();
    $(pageObj).css({
        backgroundSize: stretchInfo.bgSize,
        backgroundRepeat: stretchInfo.bgRepeat,
        backgroundPosition: stretchInfo.bgPosition,
    });
    // dostack.addUndoStack('', EundoStackAddType.page);
    // dostack.addUndoStack('', EundoStackAddType.all);
};
export const setOpacityToPage = (currOpacity: number) => {
    const pageObj = getPageObject();
    $(pageObj).css({ opacity: currOpacity });
    // const pageObj = getPageObject();
    // const orgRgb = getPageBackColor();
    // const newCssRgb = common.convToCssRgba(orgRgb, currOpacity);
    // // $(pageObj).css({opacity: currOpacity});
    // $(pageObj).css('background-color', newCssRgb);
};

// 특정 아이디를 가진 오브젝트의 페이지 내에서의 순번(0부터)
export const getObjectIndex = (objectId: string) => {
    const canvasObj = getCanvasObject() as HTMLDivElement;
    let objectIndex = 0;
    for (let i = 0; i < canvasObj.childNodes.length; i++) {
        const objElement = canvasObj.childNodes[i] as HTMLElement;
        if (objElement.id === objectId) {
            objectIndex = i - 1; // canvasObj 0번째 자식 노드는 page 객체이므로 -1
            break;
        }
    }
    return objectIndex;
};
export const removeObjectFromCanvas = (objectId: string) => {
    console.log('CommonEvent:removeObject:objectId:', objectId);
    const squareObj: HTMLElement | null = document.getElementById(objectId);
    try {
        if (squareObj) {
            $(squareObj).remove();
            workInfo.removeObjectList(squareObj);
        }
    } catch (e) {
        console.log(e);
    }
};
export const removeAllObjectFromCanvas = () => {
    const canvasObj = getCanvasObject() as HTMLDivElement;
    let cnt = 0;
    while (canvasObj.childNodes.length > 1) {
        cnt++;
        if (cnt > 1000) break;
        const objElement = canvasObj.childNodes[
            canvasObj.childNodes.length - 1
        ] as HTMLElement;
        // -- page 외 모든 오브젝트 제거
        if (objElement.getAttribute('object-type') !== 'page') {
            canvasObj.removeChild(objElement);
        }
    }
    workInfo.setObject(null);
    workInfo.emptyObjectGroup();
    workInfo.emptyObjectList();
};
export const emptyCanvasContent = () => {
    const canvasObj = getCanvasObject() as HTMLDivElement;
    $(canvasObj).empty();
    workInfo.setObject(null);
    workInfo.emptyObjectGroup();
    workInfo.emptyObjectList();
};
export const restoreObjectToCanvas = (
    objectContent: string,
    objectIndex = -1,
) => {
    console.log('CommonEvent:restoreObjectToCanvas:objectIndex:', objectIndex);

    try {
        const objContainer = document.createElement('div') as HTMLDivElement;
        objContainer.innerHTML = objectContent;
        if (objContainer.firstChild) {
            const addObject = objContainer.firstChild;

            const canvasObj = getCanvasObject() as HTMLDivElement;
            if (objectIndex < 0) {
                canvasObj.appendChild(addObject);
            } else {
                let bInsert = false;
                // 원래 위치에 삽입
                for (let i = 0; i < canvasObj.childNodes.length; i++) {
                    if (i === objectIndex + 1) {
                        // canvasObj 0번째 자식 노드는 page 객체이므로 +1 부터 계산한다.
                        canvasObj.insertBefore(
                            addObject,
                            canvasObj.childNodes[i],
                        );
                        bInsert = true;
                        break;
                    }
                }
                // 원래 위치에 삽입하지 못했다면 마지막에 삽입
                if (bInsert !== true) {
                    canvasObj.appendChild(addObject);
                }
            }
            workInfo.addObjectList(addObject);
        }
    } catch (e) {
        console.log(e);
    }
};
export const updateObjectToCanvas = (
    objectContent: string,
    stackType:
        | EundoStackAddType.style
        | EundoStackAddType.keyframe
        | EundoStackAddType.interaction
        | EundoStackAddType.transition
        | EundoStackAddType.sprite
        | EundoStackAddType.animation
        | EundoStackAddType.textbox,
) => {
    console.log('CommonEvent:updateObjectToCanvas');

    try {
        const objContainer = document.createElement('div') as HTMLDivElement;
        objContainer.innerHTML = objectContent;
        if (objContainer.firstChild) {
            const cloneObject = objContainer.firstChild as HTMLDivElement;
            const cloneObjectId = cloneObject.id;

            if ($(cloneObject).attr('object-type') === 'page') {
                return;
            }

            const targetObject = document.getElementById(cloneObjectId);
            if (targetObject) {
                // textbox 내용 복구
                if (stackType === EundoStackAddType.textbox) {
                    const targetTextBox = targetObject.querySelector(
                        '.textbox',
                    ) as HTMLDivElement;
                    const cloneTextBox = cloneObject.querySelector(
                        '.textbox',
                    ) as HTMLDivElement;

                    // 현재도 이전에도 텍스트박스가 있었으면 박스 전체를 교체
                    if (targetTextBox && cloneTextBox) {
                        targetObject.replaceChild(cloneTextBox, targetTextBox);
                        if ($(cloneTextBox).attr('contenteditable')) {
                            $(cloneTextBox).removeAttr('contenteditable');
                        }

                        // 현재 텍스트박스가 없는데, 이전에 있었으면 추가
                    } else if (cloneTextBox && !targetTextBox) {
                        targetObject.appendChild(cloneTextBox);
                        if ($(cloneTextBox).attr('contenteditable')) {
                            $(cloneTextBox).removeAttr('contenteditable');
                        }

                        // 현재 텍스트박스가 있는데, 이전에 없었으면 제거
                    } else if (!cloneTextBox && targetTextBox) {
                        targetObject.removeChild(targetTextBox);
                    }

                    // attr 내용 복구 (style, sprite, transition, keyframe, animation)
                } else {
                    const cloneAttr = $(cloneObject).attr(stackType) || null;
                    if (cloneAttr) {
                        $(targetObject).attr(stackType, cloneAttr);
                    } else {
                        $(targetObject).removeAttr(stackType);
                    }

                    // sprite 인경우 style도 설정해야 하므로, style 재귀호출 하고 여기서 종료
                    if (stackType === EundoStackAddType.sprite) {
                        updateObjectToCanvas(
                            objectContent,
                            EundoStackAddType.style,
                        );
                        return;
                    }

                    // style 변경인 경우 class 까지 원복
                    if (stackType === EundoStackAddType.style) {
                        const cloneClass = String($(cloneObject).attr('class'));
                        $(targetObject).attr('class', cloneClass);
                    }
                }

                workInfo.setUpdateKey();
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export const updatePageToCanvas = (objectContent: string) => {
    const objContainer = document.createElement('div') as HTMLDivElement;
    objContainer.innerHTML = objectContent;
    const dummyPageObj = getPageObject(objContainer);
    if (dummyPageObj) {
        if ($(dummyPageObj).attr('object-type') !== 'page') {
            return;
        }
        const pageObject = getPageObject();
        if (pageObject) {
            const cloneAttr = $(dummyPageObj).attr('style') || null;
            if (cloneAttr) {
                $(pageObject).attr('style', cloneAttr);
            }
        }
    }
};

export const updateAllToCanvas = (objectContent: string) => {
    console.log('CommonEvent:updateAllToCanvas');
    const dummyObject = document.createElement('div') as HTMLDivElement;
    dummyObject.innerHTML = objectContent;
    const pageObj = getPageObject(dummyObject);
    if (pageObj && $(pageObj).attr('object-type') === 'page') {
        const canvasObject = getCanvasObject();
        if (canvasObject) {
            canvasObject.innerHTML = objectContent;
        }
        documents.initializeObjects();
    }
};

let defaultWorkSpaceMinWidth = 0;
let defaultWorkSpaceMinHeight = 0;
let setZoomFirst = true;
export const setCanvasZoom = (zoomVal: number) => {
    const canvasContainer = getCanvasContainer();
    const bodyMiddleWorkspace = getBodyMiddleWorkspace();
    const pageObj = getPageObject();
    if (canvasContainer && bodyMiddleWorkspace) {
        $(canvasContainer).css({
            transform: 'scale(' + zoomVal + ') translate(-50%, -50%)',
            transformOrigin: '0 0',
        });

        // 워크스페이스컨테이너의 기본 minWidth, minHeight 값 정의
        // const defaultWorkSpaceMinWidth = 1400;
        // const defaultWorkSpaceMinHeight = 900;
        // 최초 실행시 현재 bodyMiddleWorkspace의 min 값을 디폴트값으로 설정한다.
        if (setZoomFirst) {
            defaultWorkSpaceMinWidth = Number(
                $(bodyMiddleWorkspace).css('minWidth').replace(/px/, ''),
            );
            defaultWorkSpaceMinHeight = Number(
                $(bodyMiddleWorkspace).css('minHeight').replace(/px/, ''),
            );
            setZoomFirst = false;
        }

        console.log(
            'defaultWorkSpaceMinWidth :',
            defaultWorkSpaceMinWidth,
            ' defaultWorkSpaceMinHeight :',
            defaultWorkSpaceMinHeight,
        );

        // 페이지의 가로/세로 값 변수 세팅
        const pageWidth = Number($(pageObj).width());
        const pageHeight = Number($(pageObj).height());
        console.log('pageWidth :', pageWidth, ' pageHeight :', pageHeight);

        // 줌 설정에 따라 조절할 minWidth, miniHeight 비율 조정값 설정
        const zoomMinWidthRatioConst = pageWidth / defaultWorkSpaceMinWidth;
        const zoomMinHeightRatioConst = pageHeight / defaultWorkSpaceMinHeight;
        console.log(
            'zoomMinWidthRatioConst :',
            zoomMinWidthRatioConst,
            ' zoomMinHeightRatioConst :',
            zoomMinHeightRatioConst,
        );

        //
        const minWidthVal =
            defaultWorkSpaceMinWidth +
            (defaultWorkSpaceMinWidth * zoomVal - defaultWorkSpaceMinWidth) *
                zoomMinWidthRatioConst;
        const minHeightVal =
            defaultWorkSpaceMinHeight +
            (defaultWorkSpaceMinHeight * zoomVal - defaultWorkSpaceMinHeight) *
                zoomMinHeightRatioConst;

        $(bodyMiddleWorkspace).css({
            minWidth: minWidthVal,
            minHeight: minHeightVal,
        });
    }
};

// resizeZoomVal 만큼 추가적으로 확대/축소
export const resizeCanvasZoom = (resizeZoomVal = 0) => {
    console.log('wheel resizeZoomVal :', resizeZoomVal);

    // 수정전 줌 값
    let zoomRatioVal = Number($('#idx_canvas_zoom').val());

    const minVal = Math.min(...basicData.canvasZoomPreset);
    const maxVal = Math.max(...basicData.canvasZoomPreset);

    if (resizeZoomVal === 0) return;
    if (resizeZoomVal < 0 && zoomRatioVal <= minVal) {
        console.log('min stop');
        return;
    }
    if (resizeZoomVal > 0 && zoomRatioVal >= maxVal) {
        console.log('max stop');
        return;
    }

    zoomRatioVal += resizeZoomVal;

    // 10단위로
    zoomRatioVal = Math.ceil(zoomRatioVal / 10) * 10;

    // 최소값보다 작으면 최소값으로
    if (zoomRatioVal < minVal) {
        zoomRatioVal = minVal;
    }
    // 최대값보다 크면 최대값으로
    if (zoomRatioVal > maxVal) {
        zoomRatioVal = maxVal;
    }

    const changeZoomRatio = Number((zoomRatioVal / 100).toFixed(2));
    setCanvasZoom(changeZoomRatio);
    workInfo.setPageZoom(changeZoomRatio);

    $('#idx_canvas_zoom').val(zoomRatioVal);
};
export const setTempatePage = (type: ETemplateType) => {
    // if(type === ETemplateType.line) {
    const pageObj = getPageObject();
    if (pageObj) {
        $(pageObj).addClass('tpl');

        if ($(pageObj).hasClass(ETemplateType.line)) {
            $(pageObj).removeClass(ETemplateType.line);
        }
        if ($(pageObj).hasClass(ETemplateType.select)) {
            $(pageObj).removeClass(ETemplateType.select);
        }
        if ($(pageObj).hasClass(ETemplateType.quiz)) {
            $(pageObj).removeClass(ETemplateType.quiz);
        }
        if ($(pageObj).hasClass(ETemplateType.result)) {
            $(pageObj).removeClass(ETemplateType.result);
        }

        $(pageObj).addClass(type);

        $(pageObj).attr('tpl-type', type);
    }
    // }
    docData.setTemplateMode(type);
    docData.setDocPageTplType(type);
};
export const getTplType = (
    pageObj: HTMLDivElement | null = null,
): ETemplateType => {
    let tplType = ETemplateType.none;
    if (pageObj === null) {
        pageObj = getPageObject();
    }
    if (pageObj) {
        tplType =
            ($(pageObj).attr('tpl-type') as ETemplateType) ||
            ETemplateType.none;
    }
    return tplType;
};
export const getPageId = (pageObj: HTMLDivElement | null = null) => {
    if (pageObj === null) {
        pageObj = getPageObject();
    }
    if (pageObj) {
        return pageObj.id;
    }
    return '';
};

export const loadPageDocument = (page = 1) => {
    const docCotent = docData.getDocContent(page - 1).docPageContent;
    $('#idx_canvas_sheet').empty();
    $('#idx_canvas_sheet').html(docCotent);
    documents.initializeObjects();
};

export const addNewPage = (
    tplType: ETemplateType = ETemplateType.none,
    bCopy = false,
) => {
    //새페이지를 생성하기 전, 현재 페이지의 사이즈를 저장한다.
    CommonEvent.unselectObjects();

    const orgPageObj = getPageObject();
    if (orgPageObj) {
        lastPageWidth = Number($(orgPageObj).css('width').replace('px', ''));
        lastPageHeight = Number($(orgPageObj).css('height').replace('px', ''));
    }

    // 페이지 내용 비우기
    emptyCanvasContent();

    // 페이지 생성
    const canvasObj = getCanvasObject();
    const pageObj = createPageObject(tplType);
    canvasObj.appendChild(pageObj);

    // const lastPageNo = docData.getTotalPage();
    const currPage = docData.getCurrPage();

    let docContentInfo: IDocContents = {
        docPageContent: pageObj.outerHTML,
        docPageId: pageObj.id,
        docPageName: pageObj.getAttribute('page-name') || '',
        docPageThumbnail: '',
        docPageTplType: tplType,
        logicContent: '',
        logicActionList: [],
    };
    // 복제인경우 기존 페이지정보를 복제한다.(페이지아이디만 새로 생성)
    if (bCopy) {
        const currDocContent = docData.getDocContent(currPage);
        const currDocContentString = JSON.stringify(currDocContent);

        const orgPageId = orgPageObj.id;
        const newPageId = common.getNewPageId();

        // 새 페이지에 입력된 페이지 아이디를 새로운 페이지 아이디로 변경
        const regexAllCase = new RegExp(orgPageId, 'g');
        const newDocContentString = currDocContentString.replace(
            regexAllCase,
            newPageId,
        );
        docContentInfo = JSON.parse(newDocContentString) as IDocContents;
    }

    // docData.appendDocContent($('#idx_canvas_sheet').html());
    // docData.appendDocContent(docContentInfo);
    // 현재 페이지 아래 새 페이지 삽입
    docData.addDocContent(docContentInfo, currPage);

    // 추가된 페이지로 이동
    docData.setCurrPage(currPage + 1);
};

// 현재 페이지의 내용 전체를 복사하여 현재페이지 바로 다음에 새 페이지로 생성
export const copyPage = () => {
    addNewPage(ETemplateType.none, true);
};

// export const removePage = (pageNo = 0) => {
//     const currPageNo = docData.getCurrPage();
//     const totalPage = docData.getTotalPage();

//     // 1보다 작은 페이지는 현재 페이지로 변경
//     if (pageNo < 1) {
//         pageNo = currPageNo;
//     }

//     // 페이지가 1개 이하면 삭제 안함
//     if (totalPage === 1) {
//         dialog.showToastMessage('마지막 페이지 입니다.');
//         return;
//     }

//     // 삭제
//     docData.removeDocContent(pageNo);

//     // 삭제한 페이지가 마지막 페이지인지 확인
//     if (pageNo === totalPage) {
//         // 마지막 페이지이면 이전 페이지로 이동
//         docData.setCurrPage(pageNo - 1);
//     }

//     docData.setDocUpdateKey();
// };
export const removePage = (pageList = [0]) => {
    const currPageNo = docData.getCurrPage();
    const totalPage = docData.getTotalPage();

    // 페이지가 1개 이하면 삭제 안함
    if (totalPage === 1) {
        dialog.showToastMessage('마지막 페이지 입니다.');
        return;
    }

    // 중복 제거
    pageList = pageList.filter((item, index) => {
        return pageList.indexOf(item) === index;
    });

    // 삭제할 페이지 개수가 전체 페이지 개수보다 많으면 삭제 안함
    if (pageList.length >= totalPage) {
        dialog.showToastMessage('잘못된 요청입니다.');
        return;
    }

    // 내림차순 정렬
    pageList.sort((a, b) => {
        return b - a;
    });

    // 삭제 후 이동할 페이지 번호
    let resultMovePageNo = currPageNo;
    // 현재 페이지가 삭제할 페이지 목록에 포함되어 있거나, 삭제후 마지막 페이지 번호보다 크면 첫번째 페이지로 이동
    // if (pageList.indexOf(currPageNo) > -1) {
    //     resultMovePageNo = 1;
    // }
    // if (currPageNo > totalPage - pageList.length) {
    //     resultMovePageNo = 1;
    // }

    for (let pageNo of pageList) {
        // 1보다 작은 페이지는 현재 페이지로 변경
        if (pageNo < 1) {
            pageNo = currPageNo;
        }
        // 삭제
        docData.removeDocContent(pageNo);
    }

    if (currPageNo > docData.getTotalPage()) {
        resultMovePageNo = docData.getTotalPage();
    }

    docData.setCurrPage(resultMovePageNo);

    // // 삭제한 페이지가 마지막 페이지인지 확인
    // if (pageNo === totalPage) {
    //     // 마지막 페이지이면 이전 페이지로 이동
    //     docData.setCurrPage(pageNo - 1);
    // }

    docData.setDocUpdateKey();
};

export const makeCurrentPageThumbnail = () => {
    try {
        const pageObj = getCanvasObject();
        if (pageObj === null) return;

        const pageWidth = pageObj.offsetWidth;
        // const thumbnailContainerWidth = 152;
        const thumbnailContainerWidth =
            $('.doc-list .doc-box .doc_thumb').first().width() || 0;
        const ratio = thumbnailContainerWidth / pageWidth;
        console.log('ratio', ratio);

        htmlToImage
            .toPng(pageObj, { quality: 0.1, pixelRatio: ratio })
            .then(dataUrl => {
                if (dataUrl === null) return;
                docData.setDocPageThumbnail(dataUrl);
            })
            .catch(function (error) {
                console.error('oops, page thumbnail error!', error);
            });
    } catch (error) {
        console.error('oops, makeCurrentPageThumbnail error!', error);
    }
};

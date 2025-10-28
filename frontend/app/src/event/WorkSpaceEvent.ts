// import React from 'react';
import $ from 'jquery';
// import keyName, { getKeyCode } from './KeyEvent';
import * as KeyEvent from './KeyEvent';
import * as CommonEvent from './CommonEvent';
import workInfo from '../store/workInfo';
import * as common from '../util/common';
import { EkeyName, EworkStatus, EobjectType } from '../const/types';
import { canvasZoomStep, objectMultiSelectorMinSize } from '../const/basicData';
import * as pages from '../util/pages';
import { hideDropDown } from '../util/dialog';
import * as SquareEvent from '../event/SquareEvent';
import { checkAndDeleteObjects } from '../event/TimeLineEvent';
import * as texteditor from '../util/texteditor';
import * as objects from '../util/objects';
import { closeAllObjectFilterContainer } from '../components/popup/ObjectFilterList';

// let copyObjectId = '';
let mDown = false;
let mMove = false;
let mdownStartX = 0;
let mdownStartY = 0;
let selectorLeft = 0;
let selectorTop = 0;
let copyContentsList: string[] = [];
let copyContentsPageId = '';
export const addWorkSpaceEvent = () => {
    const workSpaceObj = pages.getBodyMiddleWorkspace();
    if (workSpaceObj) {
        workSpaceObj.addEventListener('mousedown', workspaceMouseDownEvent);
        workSpaceObj.addEventListener('dblclick', workspaceMouseDblClickEvent);
        workSpaceObj.addEventListener('contextmenu', addContextMenuEvent);
        workSpaceObj.addEventListener('dragover', common.allEventCancel);
        workSpaceObj.addEventListener('drop', common.allEventCancel);
        workSpaceObj.addEventListener('dragenter', workspaceDragEnterEvent);
        workSpaceObj.addEventListener('dragleave', workspaceDragLeaveEvent);
        workSpaceObj.addEventListener('wheel', workspaceMouseWheelEvent, {
            capture: true,
            passive: false,
        });
    }
    document.addEventListener('mousedown', closeDialogs);
    document.addEventListener('keydown', addKeydownEvent);
};

export const removeWorkSpaceEvent = () => {
    const workSpaceObj = document.getElementById(
        'idx_body_middle_workspace',
    ) as HTMLDivElement;
    if (workSpaceObj) {
        workSpaceObj.removeEventListener('mousedown', workspaceMouseDownEvent);
        workSpaceObj.removeEventListener('contextmenu', addContextMenuEvent);
    }
    document.removeEventListener('mousedown', closeDialogs);
    document.removeEventListener('keydown', addKeydownEvent);
};

const workspaceDragEnterEvent = () => {
    console.log('workspaceDragEnterEvent');
    $('#idx_canvas_drop_area').show();
};
const workspaceDragLeaveEvent = () => {
    console.log('workspaceDragLeaveEvent');
    // $('#idx_canvas_drop_area').hide();
};

const addKeydownEvent = (event: any) => {
    const workStatus = workInfo.getStatus();
    console.log('keydown workStatus : ', workStatus);
    if (workStatus !== '') return;

    // logic, view 모드에서는 편집기의 이벤트 무시
    if (workInfo.getLogicMode() === true || workInfo.getViewMode() === true)
        return;

    const currKeyCode = KeyEvent.getKeyCode(event);

    const bColorPickerOpen = common.checkOpenedColorPicker();
    if (bColorPickerOpen) {
        return;
    }

    if (currKeyCode === EkeyName.ESC) {
        unselectObjects();
        return;
    }

    const currObject = workInfo.getObject();
    if ($(currObject).children().attr('contenteditable')) {
        console.log('contenteditable');
        return;
    }

    if (currKeyCode === EkeyName.DEL || currKeyCode === EkeyName.BS) {
        // deleteSelectedObjcts();
        checkAndDeleteObjects();
    }
    if ((event.ctrlKey || event.metaKey) && currKeyCode === 'c') {
        copySelectedObjects();
    }
    if ((event.ctrlKey || event.metaKey) && currKeyCode === 'v') {
        pasteSelectedObjects();
    }
    if ((event.ctrlKey || event.metaKey) && currKeyCode === 'a') {
        selectAllObjects();
        common.allEventCancel(event);
    }
};

const closeDialogs = (event: any) => {
    hideDropDown();
    closeAllObjectFilterContainer();
    // hideDialog();
    common.cancelBubble(event);
};

const workspaceMouseDownEvent = (event: any) => {
    try {
        const workStatus = workInfo.getStatus();
        console.log('workspaceMouseDownEvent workStatus : ', workStatus);

        // 메인 드롭다운 메뉴 닫기
        //        $('.nav-template-list .sub-list').removeClass('active');

        // 그리는 중엔 편집중엔 N/A
        if (workStatus === 'draw') return;
        // if(workStatus === "input") return;

        // 빈 워크스페이스, 빈 캔버스 선택 시 객체선택 취소
        let targetObj: any = event.target;

        // console.log('targetObj : ', targetObj);

        // 캔버스 마우스 다운시 모든 객체 선택 취소하고, 선택박스 그리기
        if (targetObj) {
            if (
                $(targetObj).hasClass('body-middle-workspace') || // 빈 워크스페이스
                $(targetObj).hasClass('canvas-sheet') || // 빈 캔버스
                $(targetObj).hasClass('page') // 빈 페이지
            ) {
                setDragMultiSelectionMode(event);
                return;
            }

            // 객체의 최상위 앨리먼트가 항상 선택되도록 처리
            try {
                // 마우스로 선택한 엘리먼트의 부모 object를 항상 선택
                if (!$(targetObj).hasClass('image')) {
                    targetObj = texteditor.getParentElement(
                        targetObj,
                        'div',
                        'object',
                    );
                }
            } catch (e) {
                console.log(e);
            }

            if (targetObj === null) return;

            // 잠긴 오브젝트에 마우스 다운시 캔버스에 다운한것으로 처리
            if (objects.isLocked(targetObj.id)) {
                setDragMultiSelectionMode(event);
                return;
            }

            setObjDownEvent(targetObj, event);
        }
    } catch (e) {
        console.log(e);
    } finally {
        // common.allEventCancel(event);
    }
};

const setDragMultiSelectionMode = (event: any) => {
    workInfo.setStatus(EworkStatus.none);
    unselectObjects();
    setWorkSpaceMouseDragDownEvent(event);
};

// 워크스페이스 빈곳에 마우스 드래그시 오브젝트 선택 가이드 박스 그리기
const setWorkSpaceMouseDragDownEvent = (event: MouseEvent) => {
    mDown = true;

    const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    const canvasTop = canvasObj.getBoundingClientRect().top;
    const canvasLeft = canvasObj.getBoundingClientRect().left;

    mdownStartX = event.clientX;
    mdownStartY = event.clientY;

    selectorLeft = mdownStartX - canvasLeft;
    selectorTop = mdownStartY - canvasTop;
    const pageZoomRatio = workInfo.getPageZoom();
    if (pageZoomRatio !== 1) {
        selectorLeft = Math.ceil(selectorLeft / pageZoomRatio);
        selectorTop = Math.ceil(selectorTop / pageZoomRatio);
    }

    const objectMultiSelector = document.createElement('div');
    objectMultiSelector.className = 'object-multi-selector';
    $(objectMultiSelector).css({
        top: selectorTop,
        left: selectorLeft,
    });
    $('#idx_canvas_sheet_shadow').append(objectMultiSelector);

    window.addEventListener('mousemove', setWorkSpaceMouseDragMoveEvent);
    window.addEventListener('mouseup', setWorkSpaceMouseDragUpvent);
};
const setWorkSpaceMouseDragMoveEvent = (event: MouseEvent) => {
    if (mDown !== true) return;

    let moveX = event.clientX - mdownStartX;
    let moveY = event.clientY - mdownStartY;

    const pageZoomRatio = workInfo.getPageZoom();
    if (pageZoomRatio !== 1) {
        moveX = Math.ceil(moveX / pageZoomRatio);
        moveY = Math.ceil(moveY / pageZoomRatio);
    }

    // mdownStartX = event.clientX;
    // mdownStartY = event.clientY;

    const selectorBoxWidth = Math.abs(moveX);
    const selectorBoxHeight = Math.abs(moveY);

    if (
        selectorBoxWidth > objectMultiSelectorMinSize &&
        selectorBoxHeight > objectMultiSelectorMinSize
    ) {
        mMove = true;
    } else {
        mMove = false;
    }

    $('.object-multi-selector').css({
        width: selectorBoxWidth,
        height: selectorBoxHeight,
    });

    if (moveX < 0) {
        $('.object-multi-selector').css({
            left: selectorLeft + moveX,
        });
    }
    if (moveY < 0) {
        $('.object-multi-selector').css({
            top: selectorTop + moveY,
        });
    }

    common.allEventCancel(event);
};
const setWorkSpaceMouseDragUpvent = () => {
    window.removeEventListener('mousemove', setWorkSpaceMouseDragMoveEvent);
    window.removeEventListener('mouseup', setWorkSpaceMouseDragUpvent);

    if (mMove === true) {
        selectBoundaryObjects();
    }

    $('.object-multi-selector').remove();

    mDown = false;
    mMove = false;
};
const selectBoundaryObjects = () => {
    try {
        const objectList = workInfo.getObjectList();
        if (objectList.length === 0) return;

        // 선택가이드 박스의 네 모서리 좌표 가져오기
        const boundaryTop = $('.object-multi-selector').position().top;
        const boundaryLeft = $('.object-multi-selector').position().left;
        const boundaryRight =
            boundaryLeft +
            $('.object-multi-selector')[0].getBoundingClientRect().width;
        const boundaryBottom =
            boundaryTop +
            $('.object-multi-selector')[0].getBoundingClientRect().height;
        console.log(
            'selectBoundaryObjects : boundaryTop : ',
            boundaryTop,
            ', boundaryLeft : ',
            boundaryLeft,
            ', boundaryRight : ',
            boundaryRight,
            ', boundaryBottom : ',
            boundaryBottom,
        );

        // console.log('selectBoundaryObjects : objectList : ', objectList);
        objectList.forEach((obj: any) => {
            if (objects.isLocked(obj.id)) {
                return false;
            }
            if (objects.getObjectType(obj) === EobjectType.folder) {
                return false;
            }

            const objTop = $(obj).position().top;
            const objLeft = $(obj).position().left;
            const objRight = objLeft + obj.getBoundingClientRect().width;
            const objBottom = objTop + obj.getBoundingClientRect().height;
            console.log(
                'selectBoundaryObjects => objTop : ',
                objTop,
                ', objLeft : ',
                objLeft,
                ', objRight : ',
                objRight,
                ', objBottom : ',
                objBottom,
            );

            // 오브젝트가 선택가이드 박스에 포함되면 선택
            if (
                objTop >= boundaryTop &&
                objTop <= boundaryBottom &&
                objLeft >= boundaryLeft &&
                objLeft <= boundaryRight &&
                objRight >= boundaryLeft &&
                objRight <= boundaryRight &&
                objBottom >= boundaryTop &&
                objBottom <= boundaryBottom
            ) {
                selectObject(obj, null);
                SquareEvent.addSelectorEvent();
            }
        });
    } catch (e) {
        console.log(e);
    }
};

const selectAllObjects = () => {
    const objectList = workInfo.getObjectList();
    const objectGroup = workInfo.getObjectGroup();
    if (objectList.length === 0) return;
    objectList.forEach((obj: any) => {
        if (objectGroup.filter((ob: any) => ob.id === obj.id).length === 0) {
            if (objects.isLocked(obj.id)) {
                return false;
            }
            if (objects.getObjectType(obj) === EobjectType.folder) {
                return false;
            }
            selectObject(obj, null);
            SquareEvent.addSelectorEvent();
        }
    });
};

const workspaceMouseDblClickEvent = (event: any) => {
    const workStatus = workInfo.getStatus();
    console.log('workspaceMouseDblClickEvent workStatus : ', workStatus);

    // 그리는 중엔 편집중엔 N/A
    if (workStatus === 'draw') return;

    // 빈 워크스페이스, 빈 캔버스 선택 시 객체선택 취소
    const targetObj: any = event.target;
    if (targetObj) {
        if (
            $(targetObj).hasClass('body-middle-workspace') ||
            $(targetObj).hasClass('canvas-sheet') ||
            $(targetObj).hasClass('page')
        ) {
            return;
        }
        setObjDblClickEvent(targetObj);
    }

    common.allEventCancel(event);
};

const addContextMenuEvent = (event: any) => {
    console.log('addContextMenuEvent');
    common.allEventCancel(event);
};
// ctrl + wheel 조절 시 캔버스 줌 조절
const workspaceMouseWheelEvent = (event: any) => {
    if (event.ctrlKey) {
        console.log('ctrl + wheel : ', event.deltaY);

        // 축소 (아래로 스크롤)
        if (event.deltaY > 0) {
            pages.resizeCanvasZoom(-canvasZoomStep);

            // 확대 (위로 스크롤)
        } else if (event.deltaY < 0) {
            pages.resizeCanvasZoom(canvasZoomStep);
        }

        common.allEventCancel(event);
    }
};

const selectObject = (obj: any, event: any, type = 'square') => {
    if (
        type === 'square' ||
        type === 'image' ||
        type === 'audio' ||
        type === 'youtube'
    ) {
        SquareEvent.selectSquareObjct(obj, event);
        // workInfo.setObject(obj);
    }
};

const unselectObjects = () => {
    SquareEvent.unselectSquareObjcts();
    // workInfo.setObject(null);
};

const setObjDownEvent = (obj: any, event: any) => {
    // console.log('setObjDownEvent : ', obj);

    if ($(obj).children().attr('contenteditable')) {
        return;
    }

    if ($(obj).hasClass('object')) {
        // unselectObjects();

        // shift 카만 눌린경우 셀렉터 누작
        if (
            event.shiftKey &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
        ) {
            // 그외는 기존 셀렉터 모두 제거
        } else {
            CommonEvent.removeSelectors();
        }

        // 이전에 선택된 오브젝트가 있고, 텍스트 편집모드인경우 이전 오브젝트 편집모드 해제
        if (workInfo.getDteStatus() && workInfo.getObject()) {
            texteditor.setTextEditMode(workInfo.getObject(), false);
        }

        const objectType = objects.getObjectType(obj);
        // if (
        //     $(obj).hasClass('square') ||
        //     $(obj).hasClass('image') ||
        //     $(obj).hasClass('audio')
        // ) {
        //     selectObject(obj, event, 'square');
        // }
        selectObject(obj, event, objectType);
    } else if (obj.className === 'object-selector') {
        // object-selector mousedown event here!
        console.log('object-selector');
    }
};

// -- 오브젝트 더블클릭 시 내부에 텍스트 영역 생성 후 텍스트 입력 모드로 전환
const setObjDblClickEvent = (obj: any) => {
    // console.log('setObjDblClickEvent obj; : ', obj);

    if ($(obj).hasClass('object-selector')) {
        const objectId = String($(obj).attr('ref-obj'));
        obj = document.getElementById(objectId);
    }

    if (!$(obj).hasClass('object') || !$(obj).hasClass('square')) {
        return;
    }
    // inputbox나 checkbox  가 들어있으면 취소
    if ($(obj).hasClass('input-box') || $(obj).hasClass('check-box')) {
        return;
    }

    if (objects.isLocked(obj.id)) return;

    texteditor.setTextEditMode(obj, true);
};

// const deleteSelectedObjcts = () => {
//     console.log('delete obj');
//     SquareEvent.deleteSelectSquareObjcts();
// };

// const copySelectedObjects = () => {
//     const selectedObject = workInfo.getObject();
//     if(selectedObject === null) return;
//     copyObjectId = selectedObject.id;
//     console.log('selectedObject : ', copyObjectId);
// };
// const pasteSelectedObjects = () => {
//     if(copyObjectId !== '') {
//         const newObjectId  = CommonEvent.pasteSelectedObject(copyObjectId);
//         if(newObjectId) {
//             copyObjectId = newObjectId;
//         }
//     }
// };
// copyContentsList
const copySelectedObjects = () => {
    copyContentsList = [];
    const selectedObjectList = workInfo.getObjectGroup();
    console.log('selectedObjectList.length : ', selectedObjectList.length);
    if (selectedObjectList.length === 0) return;

    copyContentsPageId = pages.getPageObject().id;
    selectedObjectList.forEach((obj: any) => {
        copyContentsList.push(obj.outerHTML);
    });
    console.log('copyContentsList : ', copyContentsList);
};
const pasteSelectedObjects = () => {
    if (copyContentsList.length !== 0) {
        const pastedContentsPageId = pages.getPageObject().id;

        // copyContentsList 에 새로 생성된 오브젝트 목록을 넣어준다.
        copyContentsList = CommonEvent.pasteSelectedObject(
            copyContentsList,
            pastedContentsPageId === copyContentsPageId,
        );
    }
};

// import React, { useState } from 'react';
import $ from 'jquery';
import { EkeyName, EobjectType, EundoStackAddType } from '../const/types';
import { addUndoStackTimerDelay } from '../const/basicData';
import * as KeyEvent from './KeyEvent';
import * as CommonEvent from './CommonEvent';
import workInfo from '../store/workInfo';
import * as pages from '../util/pages';
import * as dostack from '../util/dostack';
import * as texteditor from '../util/texteditor';
import * as keyframe from '../util/keyframe';
import * as objects from '../util/objects';
import { allEventCancel, get_degrees, getMagneticDegree } from '../util/common';

let bMouseDown = false;
let bMouseMoving = false;
let moveStartAbsX = 0;
let moveStartAbsY = 0;
let moveStartX = 0;
let moveStartY = 0;
// let moveEndX = 0;
// let moveEndY = 0;
let orgObjLeft = 0;
let orgObjTop = 0;
let orgObjWidth = 0;
let orgObjHeight = 0;
let orgObjRotate = 0;

const minIndicatorWidth = 30;
const minIndicatorHeight = 30;
const keyMoveSize = 10; // 키보드로 object 이동시 1회 키다운에 이동할 거리

let workSpaceObj: HTMLDivElement;
let squareObj: HTMLElement | null = null;
let selectorObj: HTMLDivElement | null = null;

let indicatorObj = null;
let actionMode = '';
let resizeType = '';
let addUndoStackTimer: any = null;
export const unselectSquareObjcts = () => {
    if (squareObj) {
        texteditor.setTextEditMode(squareObj, false);
    }

    CommonEvent.removeSelectors();

    squareObj = null;
    selectorObj = null;
    workInfo.setObject(null);
    // workInfo.emptyObjectGroup();

    try {
        document.removeEventListener('keydown', squareKeyMoveEvent);
    } catch (e) {
        // console.log(e);
    }
};

export const initializeSquareEventConfig = () => {
    bMouseDown = false;
    bMouseMoving = false;
    actionMode = '';
    resizeType = '';
    indicatorObj = null;
    //console.log('actionMode: ', actionMode);

    if (selectorObj) {
        if ($(selectorObj).children('.p0').hasClass('active')) {
            $(selectorObj).children('.p0').removeClass('active');
        }
    }

    // 이벤트 제거
    removeSelectorEvent();
};

export const deleteSelectSquareObjcts = () => {
    try {
        const objectGroup = workInfo.getObjectGroup();
        objectGroup.forEach((obj: any) => {
            $(obj).remove();
            workInfo.removeObjectList(obj);
        });
        // dostack.addUndoStack('', EundoStackAddType.all);
        workInfo.emptyObjectGroup();
    } catch (e) {
        console.log(e);
    } finally {
        unselectSquareObjcts();
    }
};

export const refreshObjectSelector = (obj: HTMLElement) => {
    console.log('refreshObjectSelector refresh');
    CommonEvent.removeSelectors(obj.id);
    selectSquareObjct(obj);
    addSelectorEvent();
};

export const selectSquareObjct = (obj: HTMLElement, event: any = null) => {
    squareObj = obj;
    workInfo.setObject(obj);
    console.log('addObjectGroup addObjectGroup addObjectGroup');
    workInfo.addObjectGroup(obj);
    console.log('selectSquareObjct id: ', obj.id);
    workSpaceObj = document.getElementById(
        'idx_body_middle_workspace',
    ) as HTMLDivElement;

    if (objects.getObjectType(obj) === EobjectType.folder) {
        return;
    }

    addSelectorObj(obj);

    // bMouseDown = true;
    if (event !== null) {
        squareDownEvent(event);
    }

    document.addEventListener('keydown', squareKeyMoveEvent);
};

export const addSelectorObj = (obj: HTMLElement) => {
    selectorObj = document.createElement('div');
    selectorObj.className =
        'object-selector' + obj.className.replace(/^object/, '');
    selectorObj.id = 'SEL_' + obj.id;
    selectorObj.setAttribute('ref-obj', obj.id);

    $(selectorObj).css({
        left: $(obj).css('left'),
        top: $(obj).css('top'),
    });

    const outerWidth = $(obj).outerWidth(true);
    const outerHeight = $(obj).outerHeight(true);

    if (outerWidth !== undefined && outerHeight !== undefined) {
        $(selectorObj).css({
            width: outerWidth,
            height: outerHeight,
        });
    }

    selectorObj.style.transform = obj.style.transform;
    // selectorObj.setAttribute("style", obj.getAttribute("style"));

    const objWidth = parseInt(obj.style.width.replace('/px/', ''), 10);
    const objHeight = parseInt(obj.style.height.replace('/px/', ''), 10);

    const indicatorList: HTMLDivElement[] = [];

    const indicator0 = document.createElement('div');
    indicator0.className = 'object-indicator p0';
    selectorObj.appendChild(indicator0);
    indicatorList.push(indicator0);

    if (objWidth >= minIndicatorWidth) {
        const indicator1 = document.createElement('div');
        indicator1.className = 'object-indicator p1';
        selectorObj.appendChild(indicator1);
        indicatorList.push(indicator1);
    }

    const indicator2 = document.createElement('div');
    indicator2.className = 'object-indicator p2';
    selectorObj.appendChild(indicator2);
    indicatorList.push(indicator2);

    if (objHeight >= minIndicatorHeight) {
        const indicator3 = document.createElement('div');
        indicator3.className = 'object-indicator p3';
        selectorObj.appendChild(indicator3);
        indicatorList.push(indicator3);
    }

    const indicator4 = document.createElement('div');
    indicator4.className = 'object-indicator p4';
    selectorObj.appendChild(indicator4);
    indicatorList.push(indicator4);

    if (objWidth >= minIndicatorWidth) {
        const indicator5 = document.createElement('div');
        indicator5.className = 'object-indicator p5';
        selectorObj.appendChild(indicator5);
        indicatorList.push(indicator5);
    }

    const indicator6 = document.createElement('div');
    indicator6.className = 'object-indicator p6';
    selectorObj.appendChild(indicator6);
    indicatorList.push(indicator6);

    if (objHeight >= minIndicatorHeight) {
        const indicator7 = document.createElement('div');
        indicator7.className = 'object-indicator p7';
        selectorObj.appendChild(indicator7);
        indicatorList.push(indicator7);
    }

    const indicator8 = document.createElement('div');
    indicator8.className = 'object-indicator p8';
    selectorObj.appendChild(indicator8);
    indicatorList.push(indicator8);

    //-- rotate dot
    const indicator9 = document.createElement('div');
    indicator9.className = 'object-indicator p9';
    selectorObj.appendChild(indicator9);

    // -- rotate dot line
    const rotateLine = document.createElement('div');
    rotateLine.className = 'rotate-dot-line';
    indicator9.appendChild(rotateLine);

    indicatorList.push(indicator9);

    //setIndicatorEvent(indicator1, indicator2, indicator3, indicator4, indicator5, indicator6, indicator7, indicator8);
    setIndicatorEvent(...indicatorList);

    // const minIndicatorWidth = 30;
    // const minIndicatorHeight = 30;

    $('#idx_canvas_sheet_shadow').append(selectorObj);
    // $(".object-selector-area").show();
};

export const addSelectorEvent = () => {
    if (!selectorObj || !workSpaceObj) return;

    console.log('================ addSelectorEvent ==================');

    selectorObj.addEventListener('mousedown', squareDownEvent); // 다운이벤트는 해당 객체만
    workSpaceObj.addEventListener('mousemove', squareMoveEvent); // 무브 이벤트는 워크스페이스 내 에서만
    window.addEventListener('mouseup', squareUpEvent); // 마우스업 이벤트는 전체에서
    // selectorObj.addEventListener("mouseleave", squareLeaveEvent);   //
    //
};
export const removeSelectorEvent = () => {
    if (!selectorObj || !workSpaceObj) return;
    workSpaceObj.removeEventListener('mousemove', squareMoveEvent);
    document.removeEventListener('mouseup', squareUpEvent);
    // selectorObj.removeEventListener("mouseleave", squareLeaveEvent);
};

export const squareDownEvent = (event: any) => {
    console.log('----------- squareDownEvent --------------');

    moveStartX = event.clientX;
    moveStartY = event.clientY;

    moveStartAbsX = event.clientX;
    moveStartAbsY = event.clientY;

    // console.log("start: ", moveStartX, moveStartY);

    // orgObjLeft = parseInt(event.target.style.left, 10);
    // orgObjTop = parseInt(event.target.style.top, 10);
    // orgObjWidth = parseInt(event.target.style.width, 10);
    // orgObjHeight = parseInt(event.target.style.height, 10);

    if (!selectorObj || !workSpaceObj) return;

    // shift 키 선택상테에서 셀렉터 선택 시 셀렉터 해제
    if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const downElement = event.target as HTMLElement;
        if (downElement && downElement.classList.contains('object-selector')) {
            const objectId = downElement.getAttribute('ref-obj');
            if (objectId) {
                CommonEvent.removeSelectors(objectId);
                // squareObj = document.getElementById(objectId);
                // if(squareObj) {
                //     workInfo.removeObjectGroup(squareObj);
                // }
                return;
            }
        }
    }

    orgObjLeft = parseInt(selectorObj.style.left, 10);
    orgObjTop = parseInt(selectorObj.style.top, 10);
    orgObjWidth = parseInt(selectorObj.style.width, 10);
    orgObjHeight = parseInt(selectorObj.style.height, 10);

    bMouseDown = true;
    actionMode = 'move';
    bMouseMoving = false;
    // console.log('actionMode: ', actionMode);

    addSelectorEvent();
};
export const squareMoveEvent = (event: any) => {
    if (bMouseDown !== true) return;
    //console.log('----------- squareMoveEvent --------------');
    const pageZoomRatio = workInfo.getPageZoom();

    bMouseMoving = true;

    if (actionMode === '') return;

    let moveX = event.clientX - moveStartX;
    let moveY = event.clientY - moveStartY;

    moveStartX = event.clientX;
    moveStartY = event.clientY;

    // console.log('move: ', moveX, moveY);
    if (moveX === 0 && moveY === 0) return;

    if (pageZoomRatio !== 1) {
        moveX = moveX / pageZoomRatio;
        moveY = moveY / pageZoomRatio;
    }

    // const moveXStyle = Math.ceil(orgObjLeft + moveX);
    // const moveYStyle = Math.ceil(orgObjTop + moveY);

    if (!squareObj || !selectorObj) return;

    const objectGroup = workInfo.getObjectGroup();
    if (objectGroup.length === 0) return;

    // console.log('squareMoveEvent : ', moveX, moveY);

    if (actionMode === 'move') {
        let magnetResizeLeft = 0;
        let magnetResizeTop = 0;
        const objectCanvasMagnetSize = 5;
        const canvasWidth = Math.ceil(pages.getPageObject().offsetWidth);
        const canvasHeight = Math.ceil(pages.getPageObject().offsetHeight);
        objectGroup.forEach((obj: any) => {
            $(obj).css({
                left: `+=${moveX}`,
                top: `+=${moveY}`,
            });
            const objSelector = objects.getObjectSelector(obj);
            if (objSelector) {
                $(objSelector).css({
                    left: `+=${moveX}`,
                    top: `+=${moveY}`,
                });
            }

            // ----------------- 캔버스 테두리에 근접했는지 확인하여 근접한 경우 거리 값 할당 -----------------
            // 왼쪽
            let movedLeft = parseInt($(obj).css('left'), 10);
            if (
                magnetResizeLeft === 0 &&
                Math.abs(movedLeft) <= objectCanvasMagnetSize
            ) {
                magnetResizeLeft = -movedLeft;
            }
            // 위쪽
            let movedTop = parseInt($(obj).css('top'), 10);
            if (
                magnetResizeTop === 0 &&
                Math.abs(movedTop) <= objectCanvasMagnetSize
            ) {
                magnetResizeTop = -movedTop;
            }
            // 오른쪽
            movedLeft =
                parseInt($(obj).css('left'), 10) + ($(obj).width() || 0);
            if (
                magnetResizeLeft === 0 &&
                Math.abs(canvasWidth - movedLeft) <= objectCanvasMagnetSize
            ) {
                magnetResizeLeft = canvasWidth - movedLeft;
            }
            // 아래쪽
            movedTop = parseInt($(obj).css('top'), 10) + ($(obj).height() || 0);
            if (
                magnetResizeTop === 0 &&
                Math.abs(canvasHeight - movedTop) <= objectCanvasMagnetSize
            ) {
                magnetResizeTop = canvasHeight - movedTop;
            }
        });

        // --- 캔버스 테두리에 가까와지면 달라붙기 (오브젝트의 테두리가 캔버스에 objectCanvasMagnetSize 값 이하로 가까와지면) : shift 키 누르고 있는경우 는 무시됨.
        if (!event.shiftKey) {
            if (magnetResizeLeft !== 0 || magnetResizeTop !== 0) {
                objectGroup.forEach((obj: any) => {
                    if (magnetResizeLeft !== 0) {
                        $(obj).css({
                            left: `+=${magnetResizeLeft}`,
                        });
                        const objSelector = objects.getObjectSelector(obj);
                        if (objSelector) {
                            $(objSelector).css({
                                left: `+=${magnetResizeLeft}`,
                            });
                        }
                    }
                    if (magnetResizeTop !== 0) {
                        $(obj).css({
                            top: `+=${magnetResizeTop}`,
                        });
                        const objSelector = objects.getObjectSelector(obj);
                        if (objSelector) {
                            $(objSelector).css({
                                top: `+=${magnetResizeTop}`,
                            });
                        }
                    }
                });
            }
        }
    } else if (actionMode === 'resize') {
        // -- rotate
        if (resizeType === 'p9') {
            if (objectGroup.length > 1) return;

            const click_degrees = get_degrees(
                selectorObj,
                moveStartAbsX,
                moveStartAbsY,
            );
            let degrees =
                get_degrees(selectorObj, event.clientX, event.clientY) -
                click_degrees +
                orgObjRotate;

            console.log('degrees : ', degrees);

            // 45도 단위 근처로 가면 달라붙게 하기
            degrees = getMagneticDegree(degrees);

            let objScale = 1;
            if (squareObj.style.transform) {
                const scaleMatch =
                    squareObj.style.transform.match(/scale\(([\d.]+)\)/);
                if (scaleMatch) {
                    objScale = Number(Number(scaleMatch[1]).toFixed(2));
                }
            }

            $(squareObj).css(
                'transform',
                'rotate(' + degrees + 'deg) scale(' + objScale + ')',
            );
            $(selectorObj).css(
                'transform',
                'rotate(' + degrees + 'deg) scale(' + objScale + ')',
            );

            // -- resize
        } else {
            if ($(selectorObj).hasClass('sprite')) {
                bMouseDown = false;
                actionMode = '';
                return;
            }

            // const resizeXStyle = Math.ceil(orgObjWidth + moveX);
            // const resizeYStyle = Math.ceil(orgObjHeight + moveY);
            // const resizeXMinusStyle = Math.ceil(orgObjWidth - moveX);
            // const resizeYMinusStyle = Math.ceil(orgObjHeight - moveY);

            objectGroup.forEach((obj: any) => {
                switch (resizeType) {
                    case 'p1':
                        $(obj).css({
                            top: `+=${moveY}`,
                            height: `-=${moveY}`,
                        });
                        break;
                    case 'p2':
                        $(obj).css('width', `+=${moveX}`);
                        $(obj).css('top', `+=${moveY}`);
                        $(obj).css('height', `-=${moveY}`);
                        break;
                    case 'p3':
                        $(obj).css('width', `+=${moveX}`);
                        break;
                    case 'p4':
                        $(obj).css('width', `+=${moveX}`);
                        $(obj).css('height', `+=${moveY}`);
                        break;
                    case 'p5':
                        $(obj).css('height', `+=${moveY}`);
                        break;
                    case 'p6':
                        $(obj).css('left', `+=${moveX}`);
                        $(obj).css('width', `-=${moveX}`);
                        $(obj).css('height', `+=${moveY}`);
                        break;
                    case 'p7':
                        $(obj).css('left', `+=${moveX}`);
                        $(obj).css('width', `-=${moveX}`);
                        break;
                    case 'p8':
                        $(obj).css('top', `+=${moveY}`);
                        $(obj).css('left', `+=${moveX}`);
                        $(obj).css('width', `-=${moveX}`);
                        $(obj).css('height', `-=${moveY}`);
                        break;
                    default:
                    //
                }
                const objSelector = objects.getObjectSelector(obj);
                if (objSelector) {
                    $(objSelector).css({
                        left: $(obj).css('left'),
                        top: $(obj).css('top'),
                        width: $(obj).outerWidth(true) || $(obj).css('width'),
                        height:
                            $(obj).outerHeight(true) || $(obj).css('height'),
                    });
                }
            });
        }
    }
    // workInfo.setUpdateKey();
};

// const setSelectorObjStyle = (styleInfo: any) => {};
export const squareUpEvent = () => {
    // console.log('----------- squareUpEvent --------------');

    try {
        if (!squareObj || !selectorObj) return;

        // 이동이 있었는지 확인하여 undoStack에 기록
        if (bMouseMoving === true) {
            // 리사이즈 완료시 사이즈체크하여 인디케이터 리플래시 (minIndicatorWidth, minIndicatorHeight)
            if (actionMode === 'resize') {
                const objWidth = $(squareObj).outerWidth(true) || 0;
                const objHeight = $(squareObj).outerHeight(true) || 0;
                const indicatorLen = selectorObj.childNodes.length;

                // 가로 / 세로 가 최소 사이즈 이상인데 인디케이터 개수가 안맞으면 인디케이터 새로고침
                if (
                    objWidth >= minIndicatorWidth &&
                    objHeight >= minIndicatorHeight &&
                    indicatorLen < 10
                ) {
                    refreshObjectSelector(squareObj);
                }

                // 가로 / 세로 가 최소 사이즈 미만이면 인디케이터 새로고침
                if (
                    objWidth < minIndicatorWidth ||
                    objHeight < minIndicatorHeight
                ) {
                    refreshObjectSelector(squareObj);
                }
            }

            // undostack에 기록
            // dostack.addUndoStack(squareObj.id, EundoStackAddType.style);
            // const objectGroup = workInfo.getObjectGroup();
            // objectGroup.forEach((obj:any) => {
            //     dostack.addUndoStack(obj.id, EundoStackAddType.style);
            // });

            // autoKeyframe 적용
            const autoKeyframeStatus = workInfo.getAutoKeyframeStatus();
            if (autoKeyframeStatus) {
                keyframe.addKeyFrame();
                // dostack.addUndoStack(squareObj.id, EundoStackAddType.keyframe);
            }

            workInfo.setUpdateKey();

            dostack.addUndoStack('', EundoStackAddType.all);
        }

        initializeSquareEventConfig();
    } catch (e) {
        console.log(e);
    }
};
export const squareLeaveEvent = () => {
    // bMouseDown = false;
};
export const squareKeyMoveEvent = (event: any) => {
    console.log('key down......');

    const workStatus = workInfo.getStatus();

    if (!squareObj || !selectorObj) return;
    if (workStatus !== '') return;

    const currKeyCode = KeyEvent.getKeyCode(event);
    if (
        currKeyCode !== EkeyName.RIGHT &&
        currKeyCode !== EkeyName.LEFT &&
        currKeyCode !== EkeyName.UP &&
        currKeyCode !== EkeyName.DOWN
    )
        return;

    moveSelectedObjects(event);
    allEventCancel(event); // 캔버스에 영향주지 않도록 이벤트 취소 처리 (캔버스 스크롤)
    workInfo.setUpdateKey();
};

const moveSelectedObjects = (event: any) => {
    if (!squareObj || !selectorObj) return;

    const currKeyCode = KeyEvent.getKeyCode(event);

    console.log('key Move : currKeyCode : ', currKeyCode);
    console.log('event.shiftKey : ', event.shiftKey);

    let currMoveSize = keyMoveSize;
    if (event.shiftKey === true) {
        currMoveSize = 1;
    }
    console.log('currMoveSize : ', currMoveSize);

    const objectGroup = workInfo.getObjectGroup();
    objectGroup.forEach((obj: any) => {
        if (currKeyCode === EkeyName.UP || currKeyCode === EkeyName.DOWN) {
            if (currKeyCode === EkeyName.UP) {
                $(obj).css('top', '-=' + currMoveSize);
            } else {
                $(obj).css('top', '+=' + currMoveSize);
            }
        }
        if (currKeyCode === EkeyName.LEFT || currKeyCode === EkeyName.RIGHT) {
            if (currKeyCode === EkeyName.LEFT) {
                $(obj).css('left', '-=' + currMoveSize);
            } else {
                $(obj).css('left', '+=' + currMoveSize);
            }
        }

        CommonEvent.setObjectSelectorShape(obj);

        // undo stack 기록 타이머 (addUndoStackTimerDelay 시간 내에 다시 요청시에는 기록하지 않는다.)
        if (addUndoStackTimer) {
            clearTimeout(addUndoStackTimer);
            addUndoStackTimer = null;
        }
        const objectId = obj.id;
        addUndoStackTimer = setTimeout(
            id => {
                addUndoStackTimer = null;
                if (id) {
                    // dostack.addUndoStack(id, EundoStackAddType.style);

                    // autoKeyframe 적용
                    const autoKeyframeStatus = workInfo.getAutoKeyframeStatus();
                    if (autoKeyframeStatus) {
                        keyframe.addKeyFrame();
                        // dostack.addUndoStack(id, EundoStackAddType.keyframe);
                    }
                }

                dostack.addUndoStack('', EundoStackAddType.all);
            },
            addUndoStackTimerDelay * 1000,
            objectId,
        );
    });
};

export const setIndicatorEvent = (...indicators: HTMLDivElement[]) => {
    const evtIndicatorDown = (event: any) => {
        console.log('------------ setIndicatorEvent -------------');

        if (!squareObj) return;

        actionMode = 'resize';
        console.log('actionMode: ', actionMode);
        bMouseDown = true;
        moveStartX = event.clientX;
        moveStartY = event.clientY;
        moveStartAbsX = event.clientX;
        moveStartAbsY = event.clientY;

        indicatorObj = event.target;
        selectorObj = indicatorObj.parentNode;

        if (!selectorObj) return;

        // 다운 시 셀렉터의 사이즈로 orgObj 사이즈를 재세팅 한다. (orgObj, selectorObj 는 사이즈가 동일)
        orgObjLeft = parseInt(squareObj.style.left, 10);
        orgObjTop = parseInt(squareObj.style.top, 10);

        orgObjWidth = parseInt(squareObj.style.width, 10);
        orgObjHeight = parseInt(squareObj.style.height, 10);

        console.log(orgObjLeft, orgObjTop, orgObjWidth, orgObjHeight);

        /// =-=------------------ rotate... 작성중..
        // (180*Math.atan(y/x))/Math.PI
        console.log('squareObj.style.transform :', squareObj.style.transform);
        //orgObjRotate = !squareObj.style.transform ? 0 : parseInt(squareObj.style.transform.replace(/[^0-9.]/g,''), 10);

        if (squareObj.style.transform) {
            const rotateMatch = squareObj.style.transform.match(
                /rotate\(([\d.]+)deg\)/g,
            );
            if (rotateMatch) {
                orgObjRotate = Number(
                    parseInt(
                        rotateMatch[0].replace(/[^0-9.]/g, ''),
                        10,
                    ).toFixed(2),
                );
            }
        } else {
            orgObjRotate = 0;
        }

        const typeMatch = indicatorObj.className.match(/\bp\d{1}\b/);
        if (typeMatch !== null) {
            resizeType = typeMatch[0];
        }
        console.log('resizeType: ', resizeType);

        event.preventDefault();
        event.stopPropagation();
        addIndicatorEvent();

        // ---- rotate 핸들 마우스 다운시 객체 센터 표시
        if (resizeType === 'p9') {
            if (!$(selectorObj).children('.p0').hasClass('active')) {
                $(selectorObj).children('.p0').addClass('active');
            }
        }
    };

    const addIndicatorEvent = () => {
        if (!selectorObj) return;

        workSpaceObj.addEventListener('mousemove', squareMoveEvent); // 무브 이벤트는 워크스페이스 내 에서만
        document.addEventListener('mouseup', squareUpEvent); // 마우스업 이벤트는 전체에서
        // selectorObj.addEventListener("mouseleave", squareLeaveEvent);   //
    };
    // const removeIndicatorEvent = () => {
    //     if (!selectorObj) return;
    //     workSpaceObj.removeEventListener('mousemove', squareMoveEvent);
    //     document.removeEventListener('mouseup', squareUpEvent);
    //     // selectorObj.removeEventListener("mouseleave", squareLeaveEvent);
    // };

    for (const obj of indicators) {
        // if($(obj).hasClass("p4")) {
        obj.addEventListener('mousedown', evtIndicatorDown);
        // }
    }
    // document.addEventListener("mousemove", evtIndicatorMove);    // 무브 이벤트는 워크스페이스 내 에서만
    // document.addEventListener("mouseup", evtIndicatorUp);            // 마우스업 이벤트는 전체에서
};

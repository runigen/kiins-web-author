import { ChangeEvent } from 'react';
import $ from 'jquery';
import {
    EkeyName,
    // EobjectType,
    // EundoStackAddType,
    // ILogic_Conneted_Info,
    ELogic_Connect_Pos,
    ELogic_Object_Type,
    // ELogic_Action_Transform_Operator_Type,
    ELogic_Action_Transform_Size_Type,
} from '../const/types';
import * as KeyEvent from './KeyEvent';
// import * as CommonEvent from './CommonEvent';
import workInfo from '../store/workInfo';
// import * as pages from '../util/pages';
import * as dostackLogic from '../util/dostackLogic';
import { getParentElement } from '../util/texteditor';
// import * as keyframe from '../util/keyframe';
// import * as objects from '../util/objects';
import * as logiceditor from '../util/logiceditor';
import { allEventCancel, cancelBubble } from '../util/common';
import { showToastMessage } from '../util/dialog';
// import { canvasZoomStep, objectMultiSelectorMinSize } from '../const/basicData';

let startX = 0;
let startY = 0;
let mDown = false;
let mDownObj: any = null;
let bMove = false;

export const addCanvasEvents = () => {
    const canvas = logiceditor.getCanvasObject();
    if (canvas === null) return;
    canvas.addEventListener('mousedown', addCanvasMouseDownEvent);
    canvas.addEventListener('dragenter', addCanvasDragEnterEvent);
    canvas.addEventListener('dblclick', addCanvasDblClickEvent);
    canvas.addEventListener('wheel', addCanvasMouseWheelEvent, {
        capture: true,
        passive: false,
    });
    document.addEventListener('keydown', addCanvasKeydownEvent);
    document.addEventListener('keyup', addCanvasKeyupEvent);

    logiceditor.emptySelectedObjectList();

    // 로드시 hide-all-connectors 클래스 제거
    canvas.classList.remove('hide-all-connectors');
};
export const removeCanvasEvents = () => {
    const canvas = logiceditor.getCanvasObject();
    if (canvas === null) return;
    canvas.removeEventListener('mousedown', addCanvasMouseDownEvent);
    canvas.removeEventListener('dragenter', addCanvasDragEnterEvent);
    canvas.removeEventListener('dblclick', addCanvasDblClickEvent);
    canvas.removeEventListener('wheel', addCanvasMouseWheelEvent);
    document.removeEventListener('keydown', addCanvasKeydownEvent);
    document.removeEventListener('keyup', addCanvasKeyupEvent);
    logiceditor.emptySelectedObjectList();
};

const addCanvasMouseWheelEvent = (event: any) => {
    if (event.ctrlKey) {
        console.log('ctrl + wheel : ', event.deltaY);

        // 축소 (아래로 스크롤)
        if (event.deltaY > 0) {
            logiceditor.changeLogicCanvasZoom(-0.1, event);

            // 확대 (위로 스크롤)
        } else if (event.deltaY < 0) {
            logiceditor.changeLogicCanvasZoom(0.1, event);
        }
        allEventCancel(event);
    }
};

// 액션 타이틀에 더블클릭 이벤트
const addCanvasDblClickEvent = (event: any) => {
    console.log('addCanvasDblClickEvent');
    const targetObj: any = event.target as HTMLElement;

    console.log('targetObj : ', targetObj);
    if (targetObj === null) return;

    if (
        targetObj.nodeName.toLocaleLowerCase() !== 'input' ||
        targetObj.className !== 'action-title-input'
    ) {
        return;
    }
    targetObj.removeAttribute('readonly');
    targetObj.classList.add('active');
    targetObj.addEventListener('keydown', setActionTitleInputCancelBubbleEvent);
    targetObj.addEventListener('keyup', setActionTitleInputKeyupEvent);
    targetObj.addEventListener('blur', setActionTitleInputBlurEvent);
    targetObj.focus();
    targetObj.select();

    // 폼 입력이 활성화 되면 캔버스에 마우스 다운 이벤트를 제거한다.
    const canvas = logiceditor.getCanvasObject();
    if (canvas === null) return;
    canvas.removeEventListener('mousedown', addCanvasMouseDownEvent);
};
const setActionTitleInputBlurEvent = (event: any) => {
    const targetObj = event.target as HTMLInputElement;
    targetObj.setAttribute('readonly', 'readonly');
    targetObj.classList.remove('active');

    targetObj.removeEventListener(
        'keydown',
        setActionTitleInputCancelBubbleEvent,
    );
    targetObj.removeEventListener('keyup', setActionTitleInputKeyupEvent);
    targetObj.removeEventListener('blur', setActionTitleInputBlurEvent);

    // 폼 입력이 비활성화 되면 캔버스에 마우스 다운 이벤트를 다시 등록한다.
    const canvas = logiceditor.getCanvasObject();
    if (canvas === null) return;
    canvas.addEventListener('mousedown', addCanvasMouseDownEvent);

    // textform에 선택된 텍스트영역을 모두 제거
    const objSelection = window.getSelection();
    if (objSelection) {
        objSelection.removeAllRanges();
    }

    dostackLogic.add();
};
const setActionTitleInputCancelBubbleEvent = (event: any) => {
    cancelBubble(event);
};
const setActionTitleInputKeyupEvent = (event: any) => {
    const targetObj = event.target as HTMLInputElement;
    console.log('keyup targetObj : ', targetObj.value);
    const inputVal = targetObj.value;

    // action-container title
    let containerObj = getParentElement(targetObj, 'div', 'action-container');

    // interaction-container title
    if (containerObj === null) {
        containerObj = getParentElement(targetObj, 'div', 'interaction');
    }

    if (containerObj) {
        containerObj.setAttribute('object-name', inputVal);
        targetObj.setAttribute('value', inputVal);
    }
};

const addCanvasKeydownEvent = (event: KeyboardEvent) => {
    const keyCode = KeyEvent.getKeyCode(event);
    if (keyCode === null) return;

    console.log('target : ', event.target);
    if (
        event.target &&
        (event.target as HTMLElement).id === 'idx_logic_canvas_zoom'
    )
        return;

    // 뷰 모드에서는 로직에디터의 키보드 이벤트 무시
    if (workInfo.getViewMode() === true) return;

    // 1. 방향키로 이동
    if (
        keyCode === EkeyName.RIGHT ||
        keyCode === EkeyName.LEFT ||
        keyCode === EkeyName.UP ||
        keyCode === EkeyName.DOWN
    ) {
        logiceditor.moveActiveObjectByKey(event);
        allEventCancel(event);

        // 2. 삭제
    } else if (keyCode === EkeyName.DEL || keyCode === EkeyName.BS) {
        logiceditor.removeActiveObjects();
        allEventCancel(event);

        // 3. 전체 선택
    } else if ((event.ctrlKey || event.metaKey) && keyCode === 'a') {
        logiceditor.setFullSelectedObjectList();
        allEventCancel(event);

        // shift key down  => 커서모양 grab
    } else if (
        event.shiftKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
    ) {
        const canvasSvgObject = logiceditor.getCanvasSvgObject();
        if (canvasSvgObject) {
            canvasSvgObject.classList.add('move');
        }

        // redo
    } else if (
        ((event.ctrlKey || event.metaKey) &&
            event.shiftKey &&
            keyCode === 'z') ||
        (event.ctrlKey && keyCode === 'y')
    ) {
        dostackLogic.redo();
        allEventCancel(event);

        // undo
    } else if ((event.ctrlKey || event.metaKey) && keyCode === 'z') {
        dostackLogic.undo();
        allEventCancel(event);

        // copy
    } else if ((event.ctrlKey || event.metaKey) && keyCode === 'c') {
        logiceditor.copySelectedLogicObject();

        // paste
    } else if ((event.ctrlKey || event.metaKey) && keyCode === 'v') {
        logiceditor.pasteCopyLogicObject();
    }
};
const addCanvasKeyupEvent = (event: KeyboardEvent) => {
    console.log('addCanvasKeyupEvent event : ', event);
    // shift key up  => 커서모양 grab 제거
    const canvasSvgObject = logiceditor.getCanvasSvgObject();
    if (canvasSvgObject) {
        canvasSvgObject.classList.remove('move');
    }
};

// 캔버스에 마우스 다운 이벤트
const addCanvasMouseDownEvent = (event: any) => {
    console.log('addCanvasMouseDownEvent');
    const downObj: any = event.target;
    if (downObj === null) return;

    // console.log('addCanvasMouseDownEvent downObj : ', downObj);

    // shift 누르고 드래그 하는경우 항상 캔버스 이동
    // if (event.shiftKey) {
    //     mDown = true;
    //     startX = event.clientX;
    //     startY = event.clientY;

    //     // shift 누르고 드래그 하는경우 캔버스 이동
    //     window.addEventListener('mousemove', addCanvasMouseMoveEvent);
    //     window.addEventListener('mouseup', addCanvasMouseUpEvent);

    //     // 선택된 오브젝트는 해제
    //     // logiceditor.emptySelectedObjectList();
    // } else
    // 커텍트 인경우 해당 이벤트로 연결
    if (
        downObj.classList.contains('connect') &&
        downObj.classList.contains('out')
    ) {
        setConnectorMouseDownEvent(event);
        allEventCancel(event);

        // svg, path
    } else if (
        downObj.nodeName.toLocaleLowerCase() === 'svg' ||
        downObj.nodeName.toLocaleLowerCase() === 'path'
    ) {
        mDown = true;
        startX = event.clientX;
        startY = event.clientY;

        // const keyCode = KeyEvent.getKeyCode(event);
        // shift 누르고 드래그 하는경우 캔버스 이동
        if (event.shiftKey) {
            window.addEventListener('mousemove', addCanvasMouseMoveEvent);
            window.addEventListener('mouseup', addCanvasMouseUpEvent);

            // shift 누르지 않고 드래그 하는경우 오브젝트 선택 사각박스 생성
        } else {
            addMultiSelectObjectMouseDownEvent(event as MouseEvent);
        }

        // 선택된 오브젝트는 해제
        logiceditor.emptySelectedObjectList();
    } else {
        // 커넥터, svg 가 아닌경우

        // 1. input
        if (
            downObj.nodeName.toLocaleLowerCase() === 'input' &&
            downObj.className !== 'action-title-input'
        ) {
            console.log('input');
            downObj.addEventListener('change', setInputChangeEvent);
            downObj.addEventListener(
                'keydown',
                setActionTitleInputCancelBubbleEvent,
            );

            // 드래그 방지1(최상위 컨테이너)
            const containerObj1 = getParentElement(
                downObj,
                'div',
                'action-container',
            );
            if (containerObj1) {
                containerObj1.removeAttribute('draggable');
            }

            // 드래그 방지2 (부모 컨테이너)
            const containerObj2 = getParentElement(downObj, 'div', 'block');
            if (containerObj2) {
                containerObj2.removeAttribute('draggable');
            }

            cancelBubble(event);
            return;
        }

        // 1.5. action-unit-title -> drop down button
        if (
            downObj.classList.contains('action-unit-title') &&
            !downObj.classList.contains('no-body')
        ) {
            console.log('action-unit-title drop down button clicked');
            downObj.parentNode.classList.toggle('hide');
            // cancelBubble(event);

            // 바디 감추기/보이기 시 액션컨테이너의 연결선을 업데이트 한다.
            const actionContainer =
                (getParentElement(
                    downObj,
                    'div',
                    'action-container',
                    false,
                ) as HTMLDivElement) || null;
            if (actionContainer) {
                setTimeout(() => {
                    logiceditor.drawSvgPathFromObj(actionContainer);
                    dostackLogic.add();
                }, 0);
            }
            return;
        }

        // 2. select
        if (downObj.nodeName.toLocaleLowerCase() === 'select') {
            console.log('select');
            downObj.addEventListener('change', setSelectChangeEvent);
            cancelBubble(event);
            return;
        }

        // 2.5. interaction resize control
        if (downObj.className === 'interaction-resize') {
            console.log('interaction-resize');
            setInteractionResizeMouseDownEvent(event);
            cancelBubble(event);
            return;
        }

        // 3. interaction minimize button
        if (downObj.className === 'btn-min') {
            console.log('btn-min');
            setInteractionMinimize(event);
            cancelBubble(event);
            return;
        }

        // 4. object block
        const targetObj = getParentElement(
            downObj,
            'div',
            'block',
        ) as HTMLDivElement | null;
        console.log(targetObj);
        if (targetObj === null) {
            // 3-1. object block 이 아닌경우
            console.log('non object block');
            logiceditor.emptySelectedObjectList();
            return;
        }

        /*
        targetObj.setAttribute('draggable', 'true');
        // add drag event
        targetObj.addEventListener('dragstart', setObjectDragStartEvent);
        targetObj.addEventListener('dragend', setObjectDragEndEvent);
        */

        // 현재 오브젝트 선택 처리 (action_unit이면 부모 오브젝트 선택)
        // 3-2. object block 이면서 action_unit 인경우, drag & drop 이벤트 추가
        if (targetObj.getAttribute('object-type') === 'action_unit') {
            const actionUnitParentObj = getParentElement(
                targetObj,
                'div',
                'block',
                false,
            ) as HTMLDivElement | null;
            if (actionUnitParentObj) {
                logiceditor.addSelectedObjectList(actionUnitParentObj, event);
            }
            targetObj.setAttribute('draggable', 'true');
            // add drag event
            targetObj.addEventListener('dragstart', setObjectDragStartEvent);
            targetObj.addEventListener('dragend', setObjectDragEndEvent);

            // 3-3. object block 이면서 action_unit 이 아닌경우 (일반 오브젝트), mouse move, up 이벤트 추가
        } else {
            logiceditor.addSelectedObjectList(targetObj, event);
            mDown = true;
            mDownObj = targetObj;
            const canvasZoomVal = logiceditor.getCanvasZoomVal();
            startX = event.clientX / canvasZoomVal;
            startY = event.clientY / canvasZoomVal;
            window.addEventListener('mousemove', setObjectMouseMoveEvent);
            window.addEventListener('mouseup', setObjectMouseUpEvent);

            // shift 누른채로 클릭한 경우, 이벤트 취소 (화면의 선택 - 텍스트 - 영역이 나타나는 것을 방지)
            // if (
            //     event &&
            //     event.shiftKey &&
            //     !event.ctrlKey &&
            //     !event.altKey &&
            //     !event.metaKey
            // ) {
            allEventCancel(event);
            // }
        }

        cancelBubble(event);
    }
};

const setInteractionMinimize = (event: MouseEvent) => {
    const interactionContainer = getParentElement(
        event.target as HTMLDivElement,
        'div',
        'interaction',
    ) as HTMLDivElement | null;
    if (!interactionContainer) return;
    logiceditor.toggleInteractionMinimize(interactionContainer);
};
const setInteractionResizeMouseDownEvent = (event: MouseEvent) => {
    mDownObj = event.target as HTMLDivElement | null;
    if (!mDownObj) return;

    mDown = true;
    const canvasZoomVal = logiceditor.getCanvasZoomVal();
    startX = Math.round(event.clientX / canvasZoomVal / 10) * 10;
    startY = Math.round(event.clientY / canvasZoomVal / 10) * 10;

    window.addEventListener('mousemove', setInteractionResizeMouseMoveEvent);
    window.addEventListener('mouseup', setInteractionResizeMouseUpEvent);
};
const setInteractionResizeMouseMoveEvent = (event: MouseEvent) => {
    if (!mDown) return;
    const interactionObj = getParentElement(mDownObj, 'div', 'interaction');
    if (!interactionObj) return;

    const canvasZoomVal = logiceditor.getCanvasZoomVal();

    // 10단위로 끊어서 이동
    const eventX = Math.round(event.clientX / canvasZoomVal / 10) * 10;
    const eventY = Math.round(event.clientY / canvasZoomVal / 10) * 10;
    const moveX = eventX - startX;
    const moveY = eventY - startY;
    // const moveX = event.clientX - startX;
    // const moveY = event.clientY - startY;
    console.log(moveX, moveY);

    $(interactionObj).css({
        width: `+=${moveX}`,
        height: `+=${moveY}`,
    });

    startX = eventX;
    startY = eventY;
};
const setInteractionResizeMouseUpEvent = (event: MouseEvent) => {
    console.log('setInteractionResizeMouseUpEvent event : ', event);
    mDownObj = null;
    mDown = false;
    startX = 0;
    startY = 0;
    window.removeEventListener('mousemove', setInteractionResizeMouseMoveEvent);
    window.removeEventListener('mouseup', setInteractionResizeMouseUpEvent);
};

let selectorLeft = 0;
let selectorTop = 0;
const addMultiSelectObjectMouseDownEvent = (event: MouseEvent) => {
    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;
    const canvasTop = canvasObj.getBoundingClientRect().top;
    const canvasLeft = canvasObj.getBoundingClientRect().left;
    mDown = true;
    startX = event.clientX;
    startY = event.clientY;

    selectorLeft = startX - canvasLeft;
    selectorTop = startY - canvasTop;
    const canvasZoomVal = logiceditor.getCanvasZoomVal();
    if (canvasZoomVal !== 1) {
        selectorLeft = Math.ceil(selectorLeft / canvasZoomVal);
        selectorTop = Math.ceil(selectorTop / canvasZoomVal);
    }
    // const pageZoomRatio = workInfo.getPageZoom();
    // if (pageZoomRatio !== 1) {
    //     selectorLeft = Math.ceil(selectorLeft / pageZoomRatio);
    //     selectorTop = Math.ceil(selectorTop / pageZoomRatio);
    // }

    // 멀티셀렉터 생성
    const objectMultiSelector = logiceditor.createObjectMultiSelector();
    if (!objectMultiSelector) return;
    $(objectMultiSelector).css({
        top: selectorTop,
        left: selectorLeft,
    });

    window.addEventListener('mousemove', addMultiSelectObjectMouseMoveEvent);
    window.addEventListener('mouseup', addMultiSelectObjectMouseUpEvent);
};
const addMultiSelectObjectMouseMoveEvent = (event: MouseEvent) => {
    console.log('addMultiSelectObjectMouseMoveEvent');

    if (!mDown) return;

    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;
    const objectMultiSelector = logiceditor.getObjectMultiSelector();
    if (!objectMultiSelector) return;

    let moveX = event.clientX - startX;
    let moveY = event.clientY - startY;
    const canvasZoomVal = logiceditor.getCanvasZoomVal();
    if (canvasZoomVal !== 1) {
        moveX = Math.ceil(moveX / canvasZoomVal);
        moveY = Math.ceil(moveY / canvasZoomVal);
    }

    console.log('moveX', moveX);
    console.log('moveY', moveY);

    const selectorBoxWidth = Math.abs(moveX);
    const selectorBoxHeight = Math.abs(moveY);

    $(objectMultiSelector).css({
        width: `${selectorBoxWidth}`,
        height: `${selectorBoxHeight}`,
    });

    if (moveX < 0) {
        $(objectMultiSelector).css({
            left: selectorLeft + moveX,
        });
    }
    if (moveY < 0) {
        $(objectMultiSelector).css({
            top: selectorTop + moveY,
        });
    }
    allEventCancel(event);
};
const addMultiSelectObjectMouseUpEvent = (event: MouseEvent) => {
    console.log('addMultiSelectObjectMouseUpEvent event: ', event);
    console.log('addMultiSelectObjectMouseUpEvent');
    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;
    const objectMultiSelector = logiceditor.getObjectMultiSelector();
    if (objectMultiSelector) {
        logiceditor.selectBoundaryObjects();
        objectMultiSelector.parentNode?.removeChild(objectMultiSelector);
    }

    mDown = false;
    startX = 0;
    startY = 0;
    selectorLeft = 0;
    selectorTop = 0;

    window.removeEventListener('mousemove', addMultiSelectObjectMouseMoveEvent);
    window.removeEventListener('mouseup', addMultiSelectObjectMouseUpEvent);
};

const setObjectMouseMoveEvent = (event: MouseEvent) => {
    if (mDown !== true) return;
    const targetObj = event.target as HTMLDivElement | null;
    if (targetObj === null) return;

    const canvasZoomVal = logiceditor.getCanvasZoomVal();

    // 10단위로 끊어서 이동
    const eventX = Math.round(event.clientX / canvasZoomVal / 10) * 10;
    const eventY = Math.round(event.clientY / canvasZoomVal / 10) * 10;
    startX = Math.round(startX / 10) * 10;
    startY = Math.round(startY / 10) * 10;

    const moveX = eventX - startX;
    const moveY = eventY - startY;
    // const moveX = Math.round((eventX - startX) / canvasZoomVal / 10) * 10;
    // const moveY = Math.round((eventY - startY) / canvasZoomVal / 10) * 10;

    const selectedObjectList = logiceditor.getSelectedObjectList();
    if (selectedObjectList.length === 0) return;

    selectedObjectList.forEach(obj => {
        $(obj).css({
            left: `+=${moveX}px`,
            top: `+=${moveY}px`,
        });
        logiceditor.drawSvgPathFromObj(obj);
    });

    startX = eventX;
    startY = eventY;
    bMove = true;
};
const setObjectMouseUpEvent = (event: MouseEvent) => {
    console.log('setObjectMouseUpEvent event: ', event);
    let downObj = mDownObj;
    downObj = getParentElement(downObj, 'div', 'block') as HTMLDivElement;
    console.log('setObjectMouseUpEvent downObj : ', downObj);
    if (downObj) {
        const parentInteractionObj = getParentElement(
            downObj,
            'div',
            'interaction',
            false,
        );
        // 해당 오브젝특 특정 인터렉션에 포함되어 있는데, 그 인터렉션 박스 외부로 이동한경우 오브젝트 자체를 인터렉션 박스 밖으로 이동시킨다.
        if (parentInteractionObj) {
            const minLeft = -downObj.offsetWidth;
            const minTop = -downObj.offsetHeight;
            const maxRight = parentInteractionObj.offsetWidth;
            const maxBottom = parentInteractionObj.offsetHeight;

            const downObjLeft = downObj.offsetLeft;
            const downObjTop = downObj.offsetTop;
            const parentInteractionObjLeft = parentInteractionObj.offsetLeft;
            const parentInteractionObjTop = parentInteractionObj.offsetTop;

            if (
                downObjLeft < minLeft ||
                downObjTop < minTop ||
                downObjLeft > maxRight ||
                downObjTop > maxBottom
            ) {
                console.log('setObjectMouseUpEvent moving');
                const selectedObjectList = logiceditor.getSelectedObjectList();
                const canvasObj = logiceditor.getCanvasObject();
                if (selectedObjectList.length > 0 && canvasObj) {
                    selectedObjectList.forEach(obj => {
                        $(obj).css({
                            left: `+=${parentInteractionObjLeft}`,
                            top: `+=${parentInteractionObjTop}`,
                        });
                        canvasObj.appendChild(obj);
                        console.log('setObjectMouseUpEvent moved');
                        // logiceditor.drawSvgPathFromObj(obj);
                        logiceditor.removeSvgPathFromObj(obj);
                    });
                }
            } else {
                console.log('setObjectMouseUpEvent not moved');
            }
        }

        // 오브젝트가 어떤 인터렉션에도 포함되어 있지 않은 경우
        const parentInteractionObj2 = getParentElement(
            downObj,
            'div',
            'interaction',
            true,
        );
        if (parentInteractionObj2 === null) {
            // 이동된 오브젝트가 특정 인터렉션 위치에 들어가면, 해당 인터렉션 박스 내부로 이동시킨다.
            const interactionList = logiceditor.getInteractionList();
            interactionList.forEach(interaction => {
                const interactionLeft = interaction.offsetLeft;
                const interactionTop = interaction.offsetTop;
                const interactionRight =
                    interactionLeft + interaction.offsetWidth;
                const interactionBottom =
                    interactionTop + interaction.offsetHeight;

                const downObjLeft = downObj.offsetLeft;
                const downObjTop = downObj.offsetTop;
                const downObjRight = downObjLeft + downObj.offsetWidth;
                const downObjBottom = downObjTop + downObj.offsetHeight;

                if (
                    downObjLeft >= interactionLeft &&
                    downObjTop >= interactionTop &&
                    downObjRight <= interactionRight &&
                    downObjBottom <= interactionBottom
                ) {
                    const selectedObjectList =
                        logiceditor.getSelectedObjectList();
                    const canvasObj = logiceditor.getCanvasObject();
                    if (selectedObjectList.length > 0 && canvasObj) {
                        selectedObjectList.forEach(obj => {
                            $(obj).css({
                                left: `-=${interactionLeft}`,
                                top: `-=${interactionTop}`,
                            });
                            interaction.appendChild(obj);
                        });
                    }
                }
            });
        }

        if (bMove === true) {
            dostackLogic.add();
        }
    }

    window.removeEventListener('mousemove', setObjectMouseMoveEvent);
    window.removeEventListener('mouseup', setObjectMouseUpEvent);
    mDown = false;
    bMove = false;
    mDownObj = null;
    startX = 0;
    startY = 0;
};

// canvas drag move
const addCanvasMouseMoveEvent = (event: MouseEvent) => {
    if (mDown === false) return;
    const canvasContainer = logiceditor.getCanvasContainer();
    if (!canvasContainer) return;

    const moveX = event.clientX - startX;
    const moveY = event.clientY - startY;

    const prevCanvasScrollLeft = canvasContainer.scrollLeft;
    const prevCanvasScrollTop = canvasContainer.scrollTop;

    const scrollLeft = prevCanvasScrollLeft - moveX;
    const scrollTop = prevCanvasScrollTop - moveY;
    // console.log('addCanvasMouseMoveEvent scrollLeft : ', scrollLeft);
    // console.log('addCanvasMouseMoveEvent scrollTop : ', scrollTop);

    canvasContainer.scrollLeft = scrollLeft;
    canvasContainer.scrollTop = scrollTop;

    startX = event.clientX;
    startY = event.clientY;

    // const canvasSvgObject = logiceditor.getCanvasSvgObject();
    // if (canvasSvgObject) {
    //     canvasSvgObject.classList.add('move');
    // }

    cancelBubble(event);
};
const addCanvasMouseUpEvent = (event: MouseEvent) => {
    console.log('addCanvasMouseUpEvent event: ', event);
    mDown = false;
    startX = 0;
    startY = 0;
    window.removeEventListener('mousemove', addCanvasMouseMoveEvent);
    window.removeEventListener('mouseup', addCanvasMouseUpEvent);

    // const canvasSvgObject = logiceditor.getCanvasSvgObject();
    // if (canvasSvgObject) {
    //     canvasSvgObject.classList.remove('move');
    // }
};

// action-unit의 각 폼값 변경 이벤트
const setInputChangeEvent = (event: ChangeEvent) => {
    console.log('setInputChangeEvent');
    const inputObj = event.target as HTMLInputElement;
    console.log('inputObj.value : ', inputObj.value);
    $(inputObj).attr('value', inputObj.value);
    $(inputObj).attr('selected-val', inputObj.value);
};
const setSelectChangeEvent = (event: any) => {
    console.log('setSelectChangeEvent');
    const selectObj = event.target as HTMLSelectElement;
    $(selectObj).attr('selected-val', selectObj.value);
    // $(selectObj).attr('operator', selectObj.value);

    // if (selectObj.value === ELogic_Action_Transform_Size_Type.rand) {
    //     $(selectObj).next().attr('type', 'text');
    // } else {
    //     $(selectObj).next().attr('type', 'number');
    //     // if ($(selectObj).next().val() === '') {
    //     //     $(selectObj).next().val(0);
    //     // }
    // }

    const actionUnitBodyElem = getParentElement(
        selectObj,
        'div',
        'action-unit-body',
    );
    if (actionUnitBodyElem) {
        const sizeInputFormObj = actionUnitBodyElem.querySelector(
            'input[name="size"].size',
        );
        if (sizeInputFormObj) {
            // rand 타입인경우 size 항목의 input 타입을 text로 변경
            if (selectObj.value === ELogic_Action_Transform_Size_Type.rand) {
                $(sizeInputFormObj).attr('type', 'text');

                // fix 타입인경우 size 항목의 input 타입을 number 변경
            } else if (
                selectObj.value === ELogic_Action_Transform_Size_Type.fix
            ) {
                $(sizeInputFormObj).attr('type', 'number');
            }
        }
    }

    $(selectObj).next().trigger('focus').trigger('select');

    const optionList = selectObj.options;
    for (let i = 0; i < optionList.length; i++) {
        const option = optionList[i];
        if (option.value === selectObj.value) {
            $(option).attr('selected', 'selected');
        } else {
            $(option).removeAttr('selected');
        }
    }
    selectObj.removeEventListener('change', setSelectChangeEvent);
};

const setObjectDragStartEvent = (event: any) => {
    if (event.dataTransfer && event.currentTarget) {
        console.log('event.currentTarget : ', event.currentTarget);
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.setData('text/plain', event.currentTarget.id);
        event.currentTarget.classList.add('moving');
        logiceditor.setMousePosition(event.clientX, event.clientY);
    }
    cancelBubble(event);
};
const setObjectDragEndEvent = (event: any) => {
    console.log('setObjectDragEndEvent');
    if (event.currentTarget) {
        event.currentTarget.classList.remove('moving');
        event.currentTarget.removeEventListener(
            'dragstart',
            setObjectDragStartEvent,
        );
        event.currentTarget.removeEventListener(
            'dragend',
            setObjectDragEndEvent,
        );
    }
};
const addCanvasDragEnterEvent = (event: any) => {
    const downObj: any = event.target;
    console.log('addCanvasDragEnterEvent', downObj);
    if (downObj === null) return;

    // action-body 에 진입
    const actionBodyObj = getParentElement(downObj, 'div', 'action-body');
    console.log(actionBodyObj);
    if (actionBodyObj) {
        // actionBodyObj.addEventListener('dragenter', setActionDragEnterEvent);
        actionBodyObj.addEventListener('dragover', setActionDragOverEvent);
        actionBodyObj.addEventListener('drop', setActionDropEvent);
        actionBodyObj.addEventListener('dragleave', setActionDragLeaveEvent);
        cancelBubble(event);
    } else {
        // interaction 에 진입 (todo...)
    }
};
// const setActionDragEnterEvent = (event: any) => {
//     console.log('bodyObj ondragover');
//     const actionBodyObj = event.target;
//     actionBodyObj.classList.add('dragover');
// };
const setActionDragOverEvent = (event: any) => {
    console.log('bodyObj ondragover');
    const actionBodyObj = event.target;
    actionBodyObj.classList.add('dragover');
};
const setActionDragLeaveEvent = (event: any) => {
    const actionBodyObj = event.target;
    actionBodyObj.classList.remove('dragover');

    // actionBodyObj.removeEventListener('dragenter', setActionDragEnterEvent);
    actionBodyObj.removeEventListener('dragover', setActionDragOverEvent);
    actionBodyObj.removeEventListener('drop', setActionDropEvent);
    actionBodyObj.removeEventListener('dragleave', setActionDragLeaveEvent);

    cancelBubble(event);
};
const setActionDropEvent = (event: any) => {
    console.log('bodyObj drop');
    const actionBodyObj = event.target;
    if (actionBodyObj.classList.contains('action-body') === false) {
        cancelBubble(event);
        return;
    }
    actionBodyObj.classList.remove('dragover');

    const actionContainer = getParentElement(
        actionBodyObj,
        'div',
        'action-container',
    );
    if (actionContainer === null) return;

    const actionContainerObjectType =
        actionContainer.getAttribute('object-type') || '';

    // 드래그한 오브젝트
    const data = event.dataTransfer.getData('text/plain');
    const dragObj = document.getElementById(data) as HTMLDivElement;
    if (dragObj) {
        const objectType = dragObj.getAttribute('object-type');
        if (objectType === null) return;

        // // 액션컨테이너에는 action_unit 만 드롭가능
        // if (
        //     objectType !== 'm_action_unit' &&
        //     objectType !== 'action_unit' &&
        //     objectType !== 'm_condition_unit' &&
        //     objectType !== 'condition_unit'
        // ) {
        //     //cancelBubble(event); // 그외에는 모두 취소(캔버스로 이벤트 전달 안함)
        //     return;
        // }

        if (actionContainerObjectType === 'action') {
            // 액션컨테이너에는 action_unit 만 드롭가능
            if (
                objectType !== 'm_action_unit' &&
                objectType !== 'action_unit'
            ) {
                showToastMessage('Action탭의 속성만 드롭할 수 있습니다.', 1);
                cancelBubble(event);
                return;
            }
        }
        if (actionContainerObjectType === 'condition') {
            // 컨디션컨테이너에는 condition_unit 만 드롭가능
            if (
                objectType !== 'm_condition_unit' &&
                objectType !== 'condition_unit'
            ) {
                showToastMessage('Condition탭의 속성만 드롭할 수 있습니다.', 1);
                cancelBubble(event);
                return;
            }
        }

        let moveObj = null;

        // 우측 액션 유닛에서 끌어온 경우
        if (
            objectType === 'm_action_unit' ||
            objectType === 'm_condition_unit'
        ) {
            moveObj = logiceditor.createNewActionUnit(dragObj);

            // 캔버스 내에서 끌어온경우 (다른 액션컨테이너 내에서 끌어온경우)
        } else {
            moveObj = dragObj;
        }
        if (!moveObj) return;

        actionBodyObj.appendChild(moveObj);
        if (moveObj) moveObj.removeAttribute('style');

        // action-unit 이 추가되면 action-container 의 연결선을 업데이트 한다. (animation 효과로 인해 딜레이를 준다.)
        setTimeout(() => {
            logiceditor.drawSvgPathFromObj(
                actionBodyObj.parentNode as HTMLDivElement,
            );
            dostackLogic.add();
        }, 500);
    }

    // actionBodyObj.removeEventListener('dragenter', setActionDragEnterEvent);
    actionBodyObj.removeEventListener('dragover', setActionDragOverEvent);
    actionBodyObj.removeEventListener('drop', setActionDropEvent);
    actionBodyObj.removeEventListener('dragleave', setActionDragLeaveEvent);

    cancelBubble(event);
};

/**
 * connector event list
 *
 *
 *
 *
 */
const setConnectorMouseDownEvent = (event: MouseEvent) => {
    const connectorObj = event.target as HTMLDivElement;
    // connectorObj.addEventListener('mousedown', setConnectorMouseDownEvent);
    console.log('connector down');

    mDown = true;
    mDownObj = connectorObj;
    console.log('connectorObj : ', connectorObj);

    const canvasZoomVal = logiceditor.getCanvasZoomVal();

    startX = event.clientX / canvasZoomVal;
    startY = event.clientY / canvasZoomVal;

    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;

    const svgObj = logiceditor.getCanvasSvgObject();
    if (!svgObj) return;

    // const connectorPos =
    //     ($(connectorObj).attr('pos') as ELogic_Connect_Pos) ||
    //     ELogic_Connect_Pos.right;
    const parentObjId = $(connectorObj).attr('ref-obj-id') || '';
    if (parentObjId === '') return;

    // 현재 커넥터의 연결정보, 연결된 타겟커넥터의 연결정보 제거, 연결선 제거
    logiceditor.removeConnnectorData(connectorObj);

    dostackLogic.add();

    // 새로 생성
    logiceditor.createSvgPath(connectorObj);

    canvasObj.addEventListener('mousemove', setConnectorMouseMoveEvent);
    window.addEventListener('mouseup', setConnectorMouseUpEvent);
    canvasObj.addEventListener('mouseover', setConnectorMouseOverEvent);
    canvasObj.addEventListener('mouseout', setConnectorMouseOutEvent);
};
const setConnectorMouseMoveEvent = (event: MouseEvent) => {
    // console.log('setConnectorMouseMoveEvent', mDownObj);
    if (mDown === false) return;
    if (mDownObj === null) return;

    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;

    const svgObj = logiceditor.getCanvasSvgObject();
    if (!svgObj) return;

    const mDownObjPos = logiceditor.getObjectAbsCenterPos(mDownObj);
    const canvasZoomVal = logiceditor.getCanvasZoomVal();

    const movePos = {
        left: event.clientX / canvasZoomVal - startX,
        top: event.clientY / canvasZoomVal - startY,
    };

    const connectorPos = $(mDownObj).attr('pos') || 'top';
    const parentObjId = $(mDownObj).attr('ref-obj-id') || '';
    if (parentObjId === '') return;

    const pathId = 'path_' + parentObjId + '_' + connectorPos;
    const pathObj = svgObj.querySelector(`#${pathId}`) as SVGPathElement | null;
    if (!pathObj) return;

    const pathStart = {
        left: mDownObjPos.left,
        top: mDownObjPos.top,
    };
    const pathEnd = {
        left: mDownObjPos.left + movePos.left,
        top: mDownObjPos.top + movePos.top,
    };
    logiceditor.drawSvgPathPostoPos(pathObj, pathStart, pathEnd);
};

const setConnectorMouseUpEvent = (event: MouseEvent) => {
    console.log('setConnectorMouseUpEvent', event.target);

    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;
    const svgObj = logiceditor.getCanvasSvgObject();
    if (!svgObj) return;

    if (mDown === false) return;
    if (mDownObj === null) return;

    canvasObj.removeEventListener('mousemove', setConnectorMouseMoveEvent);
    window.removeEventListener('mouseup', setConnectorMouseUpEvent);
    canvasObj.removeEventListener('mouseover', setConnectorMouseOverEvent);
    canvasObj.removeEventListener('mouseout', setConnectorMouseOutEvent);
    mDown = false;

    if (mDownObj !== null) {
        console.log(mDownObj);
    }
    const targetConnectorObj = event.target as HTMLDivElement;

    const targetConnectorPos =
        ($(targetConnectorObj).attr('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.top;
    const targetParentObjId = $(targetConnectorObj).attr('ref-obj-id') || '';
    const targetParentObjType =
        ($(targetConnectorObj)
            .parent()
            .attr('object-type') as ELogic_Object_Type) ||
        ELogic_Object_Type.none;
    const targetConnectorType =
        $(targetConnectorObj).attr('connect-type') || '';
    let targetOrgObjId = '';
    if (targetParentObjType === ELogic_Object_Type.object) {
        targetOrgObjId =
            $(targetConnectorObj).parent().attr('ref-obj-id') || '';
    }
    let targetOrgObjActions = '';
    if (targetParentObjType === ELogic_Object_Type.trigger) {
        targetOrgObjActions =
            $(targetConnectorObj).parent().attr('trigger-val') || '';
    }

    const connectorPos =
        ($(mDownObj).attr('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.top;
    const parentObjId = $(mDownObj).attr('ref-obj-id') || '';
    const parentObjType =
        ($(mDownObj).parent().attr('object-type') as ELogic_Object_Type) ||
        ELogic_Object_Type.none;
    if (parentObjId === '') return;
    let parentOrgObjId = '';
    if (parentObjType === ELogic_Object_Type.object) {
        parentOrgObjId = $(mDownObj).parent().attr('ref-obj-id') || '';
    }
    let parentOrgObjActions = '';
    if (parentObjType === ELogic_Object_Type.trigger) {
        parentOrgObjActions = $(mDownObj).parent().attr('trigger-val') || '';
    }

    if (
        !targetConnectorObj.classList.contains('connect') || // 커넥터인지 확인
        targetConnectorType !== 'in' || // in 커넥터만 연결가능
        parentObjId === targetParentObjId || // 자신에게 연결 불가
        ((parentObjType === ELogic_Object_Type.action ||
            parentObjType === ELogic_Object_Type.condition) &&
            targetParentObjType !== ELogic_Object_Type.action &&
            targetParentObjType !== ELogic_Object_Type.condition) // action 에서는  action 으로만 연결 가능
    ) {
        // const svgObj = logiceditor.getCanvasSvgObject();
        // if (!svgObj) return;
        const pathId = 'path_' + parentObjId + '_' + connectorPos;
        const pathObj = svgObj.querySelector(
            `#${pathId}`,
        ) as SVGPathElement | null;
        if (pathObj) {
            $(pathObj).remove();
        }

        if (
            parentObjType === ELogic_Object_Type.none ||
            targetParentObjType === ELogic_Object_Type.none
        ) {
            return;
        }

        if (
            (parentObjType === ELogic_Object_Type.action ||
                parentObjType === ELogic_Object_Type.condition) &&
            targetParentObjType !== ELogic_Object_Type.action &&
            targetParentObjType !== ELogic_Object_Type.condition
        ) {
            showToastMessage(
                'Container는 Container만 연결 가능합니다.' +
                    parentObjType +
                    ',' +
                    targetParentObjType,
                1.5,
            );
        }
        return;
    }

    /**
     * @todo 인터렉션정보가 다른 오브젝트간에는 연결 불가 처리 추가
     */

    logiceditor.addConnectedInfo(mDownObj, {
        id: targetParentObjId,
        pos: targetConnectorPos,
        objectType: targetParentObjType,
        refObjId: targetOrgObjId,
        actions: targetOrgObjActions,
    });
    logiceditor.addConnectedInfo(targetConnectorObj, {
        id: parentObjId,
        pos: connectorPos,
        objectType: parentObjType,
        refObjId: parentOrgObjId,
        actions: parentOrgObjActions,
    });

    // 부모 오브젝트에 연결된 원래 오브젝트 정보 추가
    // const targetParentObj = document.getElementById(
    //     targetParentObjId,
    // ) as HTMLDivElement;
    // if (targetParentObj) {
    //     addConnectedInfo(targetParentObj, {
    //         id: parentObjId,
    //         pos: connectorPos,
    //         objectType: parentObjType,
    //         refObjId: parentOrgObjId,
    //     });
    // }

    // const canvasObj = logiceditor.getCanvasObject();
    // if (!canvasObj) return;
    // const svgObj = logiceditor.getCanvasSvgObject();
    // if (!svgObj) return;

    const startConnectorPos = logiceditor.getObjectAbsCenterPos(mDownObj);
    const endConnectorPos =
        logiceditor.getObjectAbsCenterPos(targetConnectorObj);

    mDownObj.classList.add('connected');
    targetConnectorObj.classList.add('connected');

    const pathId = 'path_' + parentObjId + '_' + connectorPos;
    const pathObj = svgObj.querySelector(`#${pathId}`) as SVGPathElement | null;
    if (!pathObj) return;
    pathObj.setAttributeNS(null, 'pos2', targetConnectorPos);
    logiceditor.drawSvgPathPostoPos(
        pathObj,
        startConnectorPos,
        endConnectorPos,
    );

    // canvasObj.removeEventListener('mousemove', setConnectorMouseMoveEvent);
    // window.removeEventListener('mouseup', setConnectorMouseUpEvent);

    // mDown = false;
    mDownObj = null;

    dostackLogic.add();
};
const setConnectorMouseOverEvent = (event: MouseEvent) => {
    console.log('mouse over event call');

    if (mDownObj !== null) {
        console.log(mDownObj);
    }

    const targetConnectorObj = event.target as HTMLDivElement;
    const targetConnectorType =
        $(targetConnectorObj).attr('connect-type') || '';

    if (
        !targetConnectorObj.classList.contains('connect') || // 커넥터인지 확인
        targetConnectorType !== 'in'
    )
        return;

    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;
    const svgObj = logiceditor.getCanvasSvgObject();
    if (!svgObj) return;

    console.log('setConnectorMouseOverEvent', event.target);

    // 마우스 오버시 커넥터 연결 후  마우스 이동 이벤트 제거
    canvasObj.removeEventListener('mousemove', setConnectorMouseMoveEvent);

    const targetConnectorPos =
        ($(targetConnectorObj).attr('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.top;

    const connectorPos =
        ($(mDownObj).attr('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.top;
    const parentObjId = $(mDownObj).attr('ref-obj-id') || '';
    if (parentObjId === '') return;

    const startConnectorPos = logiceditor.getObjectAbsCenterPos(mDownObj);
    const endConnectorPos =
        logiceditor.getObjectAbsCenterPos(targetConnectorObj);

    const pathId = 'path_' + parentObjId + '_' + connectorPos;
    const pathObj = svgObj.querySelector(`#${pathId}`) as SVGPathElement | null;
    if (!pathObj) return;
    pathObj.setAttributeNS(null, 'pos2', targetConnectorPos);
    logiceditor.drawSvgPathPostoPos(
        pathObj,
        startConnectorPos,
        endConnectorPos,
    );
};
const setConnectorMouseOutEvent = (event: MouseEvent) => {
    if (mDownObj !== null) {
        console.log(mDownObj);
    }

    const canvasObj = logiceditor.getCanvasObject();
    if (!canvasObj) return;
    const svgObj = logiceditor.getCanvasSvgObject();
    if (!svgObj) return;

    const targetConnectorObj = event.target as HTMLDivElement;
    const targetConnectorType =
        $(targetConnectorObj).attr('connect-type') || '';

    if (
        !targetConnectorObj.classList.contains('connect') || // 커넥터인지 확인
        targetConnectorType !== 'in'
    )
        return;

    // 마우스 아웃시 마우스 이동 이벤트 복구
    console.log('setConnectorMouseOutEvent', event.target);
    canvasObj.addEventListener('mousemove', setConnectorMouseMoveEvent);
};

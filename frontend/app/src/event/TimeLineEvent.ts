import $ from 'jquery';
import workInfo from '../store/workInfo';
import * as dostack from '../util/dostack';
import * as objects from '../util/objects';
import * as context from '../util/context';
import {
    showToastMessage,
    showFolderDeleteDialog,
    hideDialog,
} from '../util/dialog';
import { getParentElement } from '../util/texteditor';
import * as KeyEvent from '../event/KeyEvent';
import * as SquareEvent from '../event/SquareEvent';
import * as CommonEvent from '../event/CommonEvent';
import * as TimeLineResizeEvent from '../event/TimeLineSizeEvent';
import {
    // IinteractionsInfo,
    ItransitionInfo,
    EworkStatus,
    EundoStackAddType,
    EkeyName,
    EobjectType,
    EObjectFolderStatus,
    EObjectFolderView,
} from '../const/types';
import {
    // convertTimeFormat,
    // setPlayTimeView,
    allEventCancel,
    cancelBubble,
    // getNewObjectOrderNo,
    // cancelBubble,
    // parseJsonData,
    // numSort,
    sortObjectList,
    // getUniqId,
    getFolderIdHead,
    // getFolderNameHead,
    // setLastObjectOrderNo,
} from '../util/common';
import * as keyframe from '../util/keyframe';
import * as transition from '../util/transition';

// 타임라인 키 이벤트 (del, backspace)
export const setKeydownEvent = (event: KeyboardEvent) => {
    const workStatus = workInfo.getStatus();
    if (workStatus === '') return;

    const currKeyCode = KeyEvent.getKeyCode(event);

    console.log('TimeSpace setKeydownEvent workStatus :', workStatus);
    console.log('TimeSpace setKeydownEvent currKeyCode :', currKeyCode);

    if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey)
        return;

    if (currKeyCode === EkeyName.DEL || currKeyCode === EkeyName.BS) {
        //--- keyframe 삭제
        if (workStatus === EworkStatus.selectKeyframe) {
            const selectedKeyframeTimeLeft = workInfo.getCurrKeyframeTimeLeft();
            console.log(
                'TimeSpace setKeydownEvent selectedKeyframeTimeLeft :',
                selectedKeyframeTimeLeft,
            );

            keyframe.removeKeyframeStep(
                workInfo.getObject(),
                selectedKeyframeTimeLeft,
            );
            workInfo.setCurrKeyframeStep(-1);

            // transition 삭제
        } else if (workStatus === EworkStatus.selectTransition) {
            const selectedTransitionStep = workInfo.getCurrTransitionStep();
            console.log(
                'TimeSpace setKeydownEvent selectedTransitionStep :',
                selectedTransitionStep,
            );

            transition.removeTransition(
                workInfo.getObject(),
                selectedTransitionStep,
            );
            workInfo.setCurrTransitionStep(-1);
        }

        dostack.addUndoStack('', EundoStackAddType.all);
    }
};

const pixelMag = true; // 타일라인 이동시 10 픽셀 단위로 달라붙게
let keyFrameStepMoveInfo: any = null;
let keyFrameStepMouseDown = false;
let keyFrameStepMoveStartX = 0;
let timelineObjMouseMoving = false;
let transitionMouseDown = false;
let transitionMoveStartX = 0;
let transitionMoveInfo: any = null;
let dragObjectId = '';
let dropAreaObjectId = '';
let dropEnterType = '';

export const initSelectStep = () => {
    //workInfo.setCurrKeyframeTarget('');
    workInfo.setCurrKeyframeStep(-1);
    workInfo.setCurrTransitionStep(-1);
};
export const selectCurrObject = (objectId: string, event: any) => {
    if (objects.isLocked(objectId)) return;

    initSelectStep();
    workInfo.setCurrKeyframeTimeLeft(0);

    const selectedObject = objects.getObject(objectId);
    const objectType = objects.getObjectType(selectedObject);
    console.log('objectType : ', objectType);

    // shift 키 누른채 선택하면 (멀티 선택)
    if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const selelectedObjectFolderInfo =
            objects.getObjectFolderInfo(selectedObject);

        // 선택한 오브젝트가 폴더이면, 하위 폴더 모두 해제
        if (objectType === EobjectType.folder) {
            const childFolderInfo = selelectedObjectFolderInfo + '/' + objectId;
            const currObjectGroup = workInfo.getObjectGroup();
            const childObjectList = currObjectGroup.filter(
                obj => obj.folderInfo.indexOf(childFolderInfo) === 0,
            );
            if (childObjectList.length > 0) {
                childObjectList.forEach(obj => {
                    workInfo.removeObjectGroup(obj);
                });
            }
        }

        // 선택한 오브젝트의 상위폴더가 있으면 상위폴더 모두 해제
        if (selelectedObjectFolderInfo) {
            const currObjectGroup = workInfo.getObjectGroup();
            // const parentFolderInfo = selelectedObjectFolderInfo.split('/')[1];
            // const parentObjectList = currObjectGroup.filter(obj => (obj.folderInfo.indexOf('/'+parentFolderInfo) === 0 || obj.id === parentFolderInfo) && obj.type === EobjectType.folder);
            // const parentObjectList = currObjectGroup.filter(obj => ( obj.type === EobjectType.folder && obj.folderInfo + '/' + obj.id === selelectedObjectFolderInfo));
            const parentObjectList = currObjectGroup.filter(
                obj =>
                    obj.type === EobjectType.folder &&
                    selelectedObjectFolderInfo.indexOf(
                        obj.folderInfo + '/' + obj.id,
                    ) === 0,
            );
            if (parentObjectList.length > 0) {
                parentObjectList.forEach(obj => {
                    workInfo.removeObjectGroup(obj);
                });
            }
        }

        const currObjectGroup = workInfo.getObjectGroup();
        if (
            currObjectGroup.filter((obj: any) => obj.id === objectId).length > 0
        ) {
            CommonEvent.removeSelectors(objectId);
        } else {
            SquareEvent.selectSquareObjct(selectedObject);
            SquareEvent.addSelectorEvent();
        }
    } else {
        CommonEvent.unselectObjects();
        SquareEvent.selectSquareObjct(selectedObject);
        SquareEvent.addSelectorEvent();
    }

    allEventCancel(event);
};

export const selectKeyframeStep = (
    objectId: string,
    step: number,
    timeLeft: number,
    event: any = null,
) => {
    allEventCancel(event);

    if (objects.isLocked(objectId)) return;

    CommonEvent.selectObject(objectId);
    workInfo.setCurrTransitionStep(-1); // transform 선택은 해제
    // selectKeyframeTarget(objectId, step);
    console.log('selectKeyframeStep step : ', objectId, step);
    workInfo.setCurrKeyframeStep(step);
    workInfo.setCurrKeyframeTimeLeft(timeLeft);
    workInfo.setStatus(EworkStatus.selectKeyframe);

    if (event !== null) {
        addMouseDownEvent_KeyFrameStep_Move(objectId, step, event);
    }
};
const addMouseDownEvent_KeyFrameStep_Move = (
    objectId: string,
    step: number,
    event: any,
) => {
    console.log('addMouseDownEvent_KeyFrameStep_Move Down : ', objectId, step);

    if (objects.isLocked(objectId)) return;

    keyFrameStepMouseDown = true;
    keyFrameStepMoveStartX = event.clientX;

    timelineObjMouseMoving = false;

    keyFrameStepMoveInfo = keyframe.getKeyFrameStepMoveInfo(step);
    console.log('keyFrameStepMoveInfo: ', keyFrameStepMoveInfo);

    window.addEventListener('mousemove', addMouseMoveEvent_KeyFrameStep_Move);
    window.addEventListener('mouseup', addMouseUpEvent_KeyFrameStep_Move);
};

const addMouseMoveEvent_KeyFrameStep_Move = (event: any) => {
    console.log('addMouseMoveEvent_KeyFrameStep_Move Move');

    if (keyFrameStepMouseDown !== true) return;
    if (keyFrameStepMoveInfo === null) return;

    if (event.clientX - keyFrameStepMoveStartX === 0) return;
    timelineObjMouseMoving = true;

    const timelineZoom = workInfo.getTimelineZoom();
    const currMovedX = (event.clientX - keyFrameStepMoveStartX) / timelineZoom;

    let keyFrameStepMoveXStart = currMovedX + keyFrameStepMoveInfo.currTimeLeft;
    let keyFrameStepMoveXEnd = currMovedX + keyFrameStepMoveInfo.nextTimeLeft;

    // console.log('keyFrameStepMoveXStart: ', keyFrameStepMoveXStart);
    // console.log('keyFrameStepMoveXEnd: ', keyFrameStepMoveXEnd);

    if (keyFrameStepMoveXStart < 0) return;

    // 10 픽셀 단위로 이동 처리
    if (pixelMag) {
        if (keyFrameStepMoveXStart % 10 < 5) {
            keyFrameStepMoveXStart =
                Math.floor(keyFrameStepMoveXStart / 10) * 10;
        } else {
            keyFrameStepMoveXStart =
                Math.ceil(keyFrameStepMoveXStart / 10) * 10;
        }
        if (keyFrameStepMoveXEnd % 10 < 5) {
            keyFrameStepMoveXEnd = Math.floor(keyFrameStepMoveXEnd / 10) * 10;
        } else {
            keyFrameStepMoveXEnd = Math.ceil(keyFrameStepMoveXEnd / 10) * 10;
        }
    }

    keyframe.setKeyFrameStepBoxMoveInfo(
        keyFrameStepMoveInfo,
        keyFrameStepMoveXStart,
        keyFrameStepMoveXEnd,
    );
};
const addMouseUpEvent_KeyFrameStep_Move = () => {
    console.log('addMouseUpEvent_KeyFrameStep_Move UP');

    window.removeEventListener(
        'mousemove',
        addMouseMoveEvent_KeyFrameStep_Move,
    );
    window.removeEventListener('mouseup', addMouseUpEvent_KeyFrameStep_Move);
    keyFrameStepMoveInfo = null;
    keyFrameStepMouseDown = false;
    keyFrameStepMoveStartX = 0;

    // 실제 이동이 있었으면 undostack 에 기록
    if (timelineObjMouseMoving === true) {
        const currObject = workInfo.getObject();
        if (currObject) {
            // dostack.addUndoStack(gCurrObject.id, EundoStackAddType.keyframe);

            // 키프레임 정보 변경 플래그 처리
            workInfo.setModifiedKeyframe();

            dostack.addUndoStack('', EundoStackAddType.all);
        }
        timelineObjMouseMoving = false;
    }
};

export const showFrameStepContext = (
    objectId: string,
    step: number,
    timeLeft: number,
    event: any,
) => {
    if (objects.isLocked(objectId)) return;

    selectKeyframeStep(objectId, step, timeLeft, null);
    context.showFrameStepContextMenu(objectId, timeLeft, event);
};

export const addMouseDownEvent_KeyFrameStep_Resize = (
    objectId: string,
    step: number,
    event: any,
) => {
    console.log('addMouseDownEvent_KeyFrameStep_Resize: ', objectId, step);
    //        if(timeLeft === 0) return;

    allEventCancel(event);
    CommonEvent.selectObject(objectId);

    keyFrameStepMoveInfo = keyframe.getKeyFrameStepMoveInfo(step);
    console.log('keyFrameStepMoveInfo: ', keyFrameStepMoveInfo);
    // if(frameStepIndex < 0) return;      // 못찾으면 중단 (-1 인경우)

    keyFrameStepMouseDown = true;
    keyFrameStepMoveStartX = event.clientX;

    timelineObjMouseMoving = false;

    window.addEventListener('mousemove', addMouseMoveEvent_KeyFrameStep_Resize);
    window.addEventListener('mouseup', addMouseUpEvent_KeyFrameStep_Resize);
};

const addMouseMoveEvent_KeyFrameStep_Resize = (event: any) => {
    if (keyFrameStepMouseDown !== true) return;
    if (keyFrameStepMoveInfo === null) return;

    if (event.clientX - keyFrameStepMoveStartX === 0) return;
    timelineObjMouseMoving = true;

    const timelineZoom = workInfo.getTimelineZoom();
    const currMovedX = (event.clientX - keyFrameStepMoveStartX) / timelineZoom;

    let keyFrameStepMoveX = currMovedX + keyFrameStepMoveInfo.currTimeLeft;
    console.log('keyFrameStepMoveX: ', keyFrameStepMoveX);

    // 10 픽셀 단위로 이동 처리
    if (pixelMag) {
        if (keyFrameStepMoveX % 10 < 5) {
            keyFrameStepMoveX = Math.floor(keyFrameStepMoveX / 10) * 10;
        } else {
            keyFrameStepMoveX = Math.ceil(keyFrameStepMoveX / 10) * 10;
        }
    }

    keyframe.setKeyFrameStepMoveInfo(keyFrameStepMoveInfo, keyFrameStepMoveX);
};
const addMouseUpEvent_KeyFrameStep_Resize = () => {
    window.removeEventListener(
        'mousemove',
        addMouseMoveEvent_KeyFrameStep_Resize,
    );
    window.removeEventListener('mouseup', addMouseUpEvent_KeyFrameStep_Resize);
    keyFrameStepMoveInfo = null;
    keyFrameStepMouseDown = false;
    keyFrameStepMoveStartX = 0;

    // 실제 이동이 있었으면 undostack 에 기록
    if (timelineObjMouseMoving === true) {
        const currObject = workInfo.getObject();
        if (currObject) {
            // 키프레임 정보 변경 플래그 처리
            workInfo.setModifiedKeyframe();
            dostack.addUndoStack('', EundoStackAddType.all);
        }
        timelineObjMouseMoving = false;
    }
};

// transition body click
export const selectTransitionStep = (
    objectId: string,
    transition: ItransitionInfo,
    step: number,
    event: any,
) => {
    console.log('selectTransitionStep');
    console.log(objectId, transition, step, event);

    if (objects.isLocked(objectId)) return;

    CommonEvent.selectObject(objectId);

    initSelectStep();

    workInfo.setCurrTransitionStep(step);
    // workInfo.setCurrKeyframeStep(-1);

    workInfo.setStatus(EworkStatus.selectTransition);

    allEventCancel(event);
};

// rtransition resize handle down/move/up event
export const addResizeEvent = (event: any) => {
    TimeLineResizeEvent.addResizeTimeLineEvent(event);
};

export const addMouseDownEvent_Transition_Resize = (
    objectId: string,
    transition: ItransitionInfo,
    point: string,
    step: number,
    event: any,
) => {
    console.log(
        'addMouseDownEvent_Transition_Resize : ',
        objectId,
        transition,
        point,
        step,
    );
    allEventCancel(event);

    if (objects.isLocked(objectId)) return;

    transitionMouseDown = true;
    transitionMoveStartX = event.clientX;
    transitionMoveInfo = {
        objectId: objectId,
        transition: transition,
        point,
        step: step,
    };

    timelineObjMouseMoving = false;

    window.addEventListener('mousemove', addMouseMoveEvent_Transition_Resize);
    window.addEventListener('mouseup', addMouseUpEvent_Transition_Resize);
};

const addMouseMoveEvent_Transition_Resize = (event: any) => {
    if (transitionMouseDown !== true) return;
    if (transitionMoveInfo === null) return;

    // let moveX = event.clientX - transitionMoveStartX;
    const timelineZoom = workInfo.getTimelineZoom();
    let moveX = (event.clientX - transitionMoveStartX) / timelineZoom;

    // 10 픽셀 단위로 이동 처리
    if (pixelMag) {
        if (moveX % 10 < 5) {
            moveX = Math.floor(moveX / 10) * 10;
        } else {
            moveX = Math.ceil(moveX / 10) * 10;
        }
    }

    let startVal = transitionMoveInfo.transition.start;
    let endVal = transitionMoveInfo.transition.end;

    if (transitionMoveInfo.point === 'start') {
        startVal = transitionMoveInfo.transition.start + moveX;
    } else {
        endVal = transitionMoveInfo.transition.end + moveX;
    }

    // 이동할 곳이 0보다 작으면 이동하지 않는다.
    if (startVal < 0) return;

    timelineObjMouseMoving = true;

    const newTransition = {
        ...transitionMoveInfo.transition,
        start: startVal,
        end: endVal,
    };

    transition.replaceTransitionInfo(transitionMoveInfo.step, newTransition);
};
const addMouseUpEvent_Transition_Resize = () => {
    transitionMouseDown = false;
    transitionMoveStartX = 0;
    transitionMoveInfo = null;

    // 실제 이동이 있었으면 undostack 에 기록
    if (timelineObjMouseMoving === true) {
        const currObject = workInfo.getObject();
        if (currObject) {
            // dostack.addUndoStack(gCurrObject.id, EundoStackAddType.transition);
            // 키프레임 정보 변경 플래그 처리
            workInfo.setModifiedKeyframe();
            dostack.addUndoStack('', EundoStackAddType.all);
        }
        timelineObjMouseMoving = false;
    }

    removeMouseDownEvent_Transition_Resize();
};
const removeMouseDownEvent_Transition_Resize = () => {
    window.removeEventListener(
        'mousemove',
        addMouseMoveEvent_Transition_Resize,
    );
    window.removeEventListener('mouseup', addMouseUpEvent_Transition_Resize);
};

// transition body context
export const showTransitionStepContext = (
    objectId: string,
    transition: ItransitionInfo,
    step: number,
    event: any,
) => {
    console.log('showTransitionStepContext');
    console.log(objectId, transition, step, event);

    if (objects.isLocked(objectId)) return;

    selectTransitionStep(objectId, transition, step, event);

    context.showTransitionStepContextMenu(objectId, transition, step, event);
};

// transition body mouse down/move/up
export const addMouseDownEvent_Transition_Move = (
    objectId: string,
    transition: ItransitionInfo,
    step: number,
    event: any,
) => {
    console.log('addMouseDownEvent_Transition_Move');
    console.log(objectId, transition, step, event);

    if (objects.isLocked(objectId)) return;

    selectTransitionStep(objectId, transition, step, event);
    allEventCancel(event);

    transitionMouseDown = true;
    transitionMoveStartX = event.clientX;
    transitionMoveInfo = {
        objectId: objectId,
        transition: transition,
        step: step,
    };
    timelineObjMouseMoving = false;

    window.addEventListener('mousemove', addMouseMoveEvent_Transition_Move);
    window.addEventListener('mouseup', addMouseUpEvent_Transition_Move);
};
const addMouseMoveEvent_Transition_Move = (event: any) => {
    if (transitionMouseDown !== true) return;
    if (transitionMoveInfo === null) return;

    const timelineZoom = workInfo.getTimelineZoom();
    let moveX = (event.clientX - transitionMoveStartX) / timelineZoom;
    //        let moveX = event.clientX - transitionMoveStartX;

    timelineObjMouseMoving = true;

    // 10 픽셀 단위로 이동 처리
    if (pixelMag) {
        if (moveX % 10 < 5) {
            moveX = Math.floor(moveX / 10) * 10;
        } else {
            moveX = Math.ceil(moveX / 10) * 10;
        }
    }

    const startVal = transitionMoveInfo.transition.start + moveX;
    const endVal = transitionMoveInfo.transition.end + moveX;

    // 이동할 곳이 0보다 작으면 이동하지 않는다.
    if (startVal < 0) return;
    timelineObjMouseMoving = true;

    const newTransition = {
        ...transitionMoveInfo.transition,
        start: startVal,
        end: endVal,
    };

    transition.replaceTransitionInfo(transitionMoveInfo.step, newTransition);
};
const addMouseUpEvent_Transition_Move = () => {
    transitionMouseDown = false;
    transitionMoveStartX = 0;
    transitionMoveInfo = null;

    // 실제 이동이 있었으면 undostack 에 기록
    if (timelineObjMouseMoving === true) {
        const currObject = workInfo.getObject();
        if (currObject) {
            // 키프레임 정보 변경 플래그 처리
            workInfo.setModifiedKeyframe();
            // dostack.addUndoStack(gCurrObject.id, EundoStackAddType.transition);
            dostack.addUndoStack('', EundoStackAddType.all);
        }
        timelineObjMouseMoving = false;
    }

    removeMouseDownEvent_Transition_Move();
};
const removeMouseDownEvent_Transition_Move = () => {
    window.removeEventListener('mousemove', addMouseMoveEvent_Transition_Move);
    window.removeEventListener('mouseup', addMouseUpEvent_Transition_Move);
};

export const dragStartEvent = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string,
) => {
    console.log('start');
    console.log('start objectId : ', objectId);
    dragObjectId = objectId;
};

/**
 *   +--------------------------+
 *   |           front          |
 *   | +----------------------+ |
 *   | |         inner        | |
 *   | +----------------------+ |
 *   |           rear           |
 *   +--------------------------+
 */

// const dragEnterEvent = (event: React.MouseEvent<HTMLDivElement>, objectId: string, enterType: 'object' | 'folder' = 'object') => {
export const dragEnterEvent = (
    event: React.MouseEvent<HTMLDivElement>,
    objectId: string,
    enterType: 'front' | 'inner' | 'rear' = 'front',
) => {
    console.log('enter');
    console.log('enter objectId : ', objectId);
    console.log('enter enterType : ', enterType);

    $('.timeline-body-elements-container').removeAttr('style');

    dropAreaObjectId = objectId;
    dropEnterType = enterType;
    cancelBubble(event);

    // 드래그오브젝트와 드랍오브젝트가 같은 경우 N/A
    if (dragObjectId === objectId) {
        console.log('dragEnterEvent : 동일한 오브젝트입니다. - N/A');
        return;
    }

    const targetObj = event.currentTarget;
    const styleTargetObj = getParentElement(
        targetObj,
        'div',
        'timeline-body-elements-container',
    );
    if (styleTargetObj === null) return;

    if (enterType === 'inner') {
        // 폴더에 들어온 경우 배경색 적용
        if (objectId.substr(0, 3) === getFolderIdHead()) {
            $(styleTargetObj).css(
                'background-color',
                'rgba(97, 117, 129, 0.5)',
            );

            // 오브젝트에 들어온 경우 front로 다시 적용
        } else {
            dragEnterEvent(event, objectId, 'front');
        }
    } else if (enterType === 'front') {
        $(styleTargetObj).css('border', '1px solid #ff0000');
        $(styleTargetObj).css('border-width', '1px 0 0 0');
    } else {
        $(styleTargetObj).css('border', '1px solid #ff0000');
        $(styleTargetObj).css('border-width', ' 0 0 1px 0');
    }
};

// const dragOverEvent = (event: React.MouseEvent<HTMLDivElement>) => {
//     console.log('over');
//     const obj = event.currentTarget;
//     $(obj).css('border', '1px solid #ff0000');
//     $(obj).css('border-width', '1px 0 0 0');
// };
// const dragLeaveEvent = (event: React.MouseEvent<HTMLDivElement>) => {
//     console.log('leave');
//     const obj = event.currentTarget;
//     $(obj).css('border', '');
//     $(obj).css('border-width', '');
//     // $(obj).css('background-color', '');
// };

export const dropEvent = () => {
    console.log('dropdropdropdropdrop');
};

export const dragEndEvent = () => {
    console.log('end');
    console.log('end dragObjectId : ', dragObjectId);
    console.log('end dropAreaObjectId : ', dropAreaObjectId);
    console.log('end dropEnterType : ', dropEnterType);

    $('.timeline-body-elements-container').removeAttr('style');

    const currObjectList = workInfo.getObjectList();
    const dropAreaObj: any = objects.getObject(dropAreaObjectId);
    const dragObj: any = objects.getObject(dragObjectId);

    if (dropAreaObj === null || dragObj === null) return;

    // 드래그오브젝트와 드랍오브젝트가 같은 경우 N/A
    if (dragObjectId === dropAreaObjectId) {
        console.log('dragEndEvent : 동일한 오브젝트입니다. - N/A');
        return;
    }
    // inner 로 들어왔는데, 드랍오브젝트가 폴더가 아닌 경우 N/A
    if (dropEnterType === 'inner' && dropAreaObj.type !== EobjectType.folder) {
        console.log('dragEndEvent : 폴더가 아닙니다. - N/A');
        return;
    }

    const dropAreaObjFolderInfo = objects.getObjectFolderInfo(dropAreaObj);
    // const dropAreaObjFolderDepth = dropAreaObj.folderDepth;
    // if(dropAreaObjFolderInfo === null) {
    //     dropAreaObjFolderInfo = '';
    // }

    // let dragObjFolderInfo = objects.getObjectFolderInfo(dragObj);
    // const dragObjFolderDepth = dragObj.folderDepth;
    // if(dragObjFolderInfo === null) {
    //     dragObjFolderInfo = '';
    // }

    const newFolderInfo =
        dropEnterType === 'inner'
            ? dropAreaObjFolderInfo + '/' + dropAreaObjectId
            : dropAreaObjFolderInfo;
    // const newFolderDepth = newFolderInfo.split('/').length - 1;

    // 폴더를 자신의 자식폴더에 이동은 불가능
    if (
        dragObj.type === EobjectType.folder &&
        dropAreaObjFolderInfo.indexOf('/' + dragObjectId) !== -1
    ) {
        showToastMessage('부모폴더를 자식폴더로 이동할 수 없습니다.');
        return;
    }

    // 드래그한 오브젝트의 OrderNo 계산
    let newOrderNo = 0;

    // 폴더/오브젝트의 앞이나 뒤에 드롭한 경우
    if (dropEnterType === 'front' || dropEnterType === 'rear') {
        newOrderNo = 0;
        let prevOrderNo = 0;
        currObjectList.forEach((obj: any) => {
            const currOrderNo = objects.getObjectOrderNo(obj);
            // const currFolderInfo = objects.getObjectFolderInfo(obj);
            obj.orderNo = currOrderNo;
            if (obj.id === dropAreaObjectId) {
                // 특정 오브젝트의 앞에 드롭한경우, 특정오브젝트의 orderNo과 그 이전루프 오브젝트의 orderNo 중간값
                if (dropEnterType === 'front') {
                    newOrderNo = (currOrderNo + prevOrderNo) / 2;

                    // 특정 오브젝트의 뒤에 드롭한경우
                } else {
                    // 해당 오브젝트가 폴더인경우 하위 오브젝트 검사
                    if (obj.type === EobjectType.folder) {
                        const subObjList = objects.getObjectSubList(obj);

                        // 하위 오브젝트가 있는경우 하위 오브젝트중 마지막 오브젝트.orderNo + 0.01
                        if (subObjList.length > 0) {
                            const lastObj = subObjList[subObjList.length - 1];
                            newOrderNo =
                                objects.getObjectOrderNo(lastObj) + 0.01;

                            // 하위 오브젝트가 없는 경우 바로 다음에 위치하도록 해당 폴더의 orderNo + 0.01
                        } else {
                            newOrderNo = currOrderNo + 0.01;
                        }

                        // 해당 오브젝트가 폴더가 아니면 바로 다음에 위치하도록 OrderNo + 0.01
                    } else {
                        newOrderNo = currOrderNo + 0.01;
                    }
                }
                return false;
            }

            prevOrderNo = currOrderNo;
        });
        console.log('end newOrderNo : ', newOrderNo);

        // 폴더내에 드롭한 경우 폴더내 처음에 위치하도록
    } else if (dropEnterType === 'inner') {
        newOrderNo = Number(dropAreaObj.orderNo) + 0.01;
    }

    // 등롭영역의 폴더뷰(펼쳐침여부) 체크하여 적용
    const dropAreaObjFolderStatus = objects.getObjectFolderStatus(
        dropAreaObj,
    ) as EObjectFolderStatus;
    const dropAreaObjFolderView =
        dropAreaObjFolderStatus === EObjectFolderStatus.fold
            ? EObjectFolderView.hide
            : EObjectFolderView.show;

    // 새로운 OrderNo 이 만들어졌다면, dragObj의 OrderNo 을 업데이트 하고,
    if (newOrderNo > 0) {
        // currObjectList.filter(obj => obj.id === dragObjectId)[0].orderNo = newOrderNo;
        // const targetMoveObject = objects.getObject(dragObjectId);
        objects.setObjectOrderNo(dragObj, newOrderNo);
        dragObj.orderNo = newOrderNo;

        // dragObj가 폴여였다면 해당 폴더 내 오브젝트들도 모두 폴더정보 업데이트
        if (dragObj.type === EobjectType.folder) {
            let updateOrderNo = newOrderNo;
            currObjectList.forEach((obj: any) => {
                const currFolderInfo = objects.getObjectFolderInfo(obj);
                const dragObjFolderInfo = objects.getObjectFolderInfo(dragObj);
                console.log();
                // if('/' + dragObj.id === currFolderInfo) {
                if (
                    currFolderInfo &&
                    currFolderInfo.indexOf(
                        dragObjFolderInfo + '/' + dragObj.id,
                    ) > -1
                ) {
                    updateOrderNo = updateOrderNo + 0.01;
                    console.log('end updateOrderNo : ', updateOrderNo);
                    objects.setObjectOrderNo(obj, updateOrderNo);
                    obj.orderNo = updateOrderNo;

                    const newFolderPath = currFolderInfo.replace(
                        dragObjFolderInfo + '/' + dragObj.id,
                        newFolderInfo + '/' + dragObj.id,
                    );
                    objects.setObjectFolderInfo(obj, newFolderPath);
                    //if(dropAreaObj.type === EobjectType.folder) {
                    if (
                        dropEnterType !== 'inner' &&
                        dropAreaObjFolderInfo !== ''
                    ) {
                        objects.setObjectFolderView(obj, dropAreaObjFolderView);
                    }
                }
            });
        }
    }

    objects.setObjectFolderInfo(dragObj, newFolderInfo);

    // 드롭 영역이 폴더일 경우, 드롭 영역의 FolderStatus를 보고 FolderView를 세팅하고
    if (dropAreaObj.type === EobjectType.folder) {
        if (dropEnterType === 'inner') {
            objects.setObjectFolderView(dragObj, dropAreaObjFolderView);
        } else {
            objects.setObjectFolderView(dragObj, EObjectFolderView.show);
        }

        // 드롭 영역이 폴더가 아닐 경우, 드롭 영역의 FolderView를 그대로 FolderView에 세팅
        // } else {
        //     const dropAreaObjFolderView2 = objects.getObjectFolderView(dropAreaObj);
        //     objects.setObjectFolderView(dragObj, dropAreaObjFolderView2);
    }

    // orderNo 기준으로 소팅
    const newSortObjectList = sortObjectList(
        currObjectList,
        'orderNo',
        'ASC',
        'n',
    );
    workInfo.setObjectList(newSortObjectList);

    // objectList 업데이트 감지 안되므로 업데이트 신호 보내줌
    // workInfo.setUpdateKey();
    workInfo.setModifiedOrderNo();
    dostack.addUndoStack('', EundoStackAddType.all);

    dragObjectId = '';
    dropAreaObjectId = '';
    dropEnterType = '';
};

export const checkAndDeleteObjects = () => {
    console.log('checkAndDeleteObjects : START');

    // 선택된 오브젝트에 폴더가 포함되어 있는지 확인
    const currObjectGroup = workInfo.getObjectGroup();
    if (currObjectGroup.length === 0) return;
    let isSubList = false;
    // for(let i=0; i<currObjectList.length; i++) {
    //     const obj = currObjectList[i];
    //     if(obj.type === EobjectType.folder) {
    //         selectedFolderObject = obj;
    //         break;
    //     }
    // }
    for (const obj of currObjectGroup) {
        if (obj.type === EobjectType.folder) {
            isSubList = objects.getObjectSubList(obj).length > 0 ? true : false;
            if (isSubList) break;
        }
    }
    console.log('checkAndDeleteObjects : isSubList : ', isSubList);

    // 선택된 오브젝트들에 폴더가 있고, 해당 폴더하위에 오브젝트가 있으면
    if (isSubList) {
        console.log('checkAndDeleteObjects : 하위 폴더 삭제 묻기 ');

        showFolderDeleteDialog([
            {
                text: 'Group and Contents',
                func: () => {
                    console.log('Group and Contents');
                    hideDialog();
                    objects.removeSelectdObject(true);
                    dostack.addUndoStack('', EundoStackAddType.all);
                },
            },
            {
                text: 'Group only',
                func: () => {
                    console.log('Group only');
                    hideDialog();
                    objects.removeSelectdObject(false);
                    dostack.addUndoStack('', EundoStackAddType.all);
                },
            },
            {
                text: 'Cancel',
                func: () => {
                    console.log('cancel');
                    hideDialog();
                },
            },
        ]);

        // 아니면 일반 오브젝트로 간주하여 모두 삭제
    } else {
        console.log(
            'checkAndDeleteObjects : 일반 오브젝트로 간주하여 모두 삭제 ',
        );
        SquareEvent.deleteSelectSquareObjcts();
        dostack.addUndoStack('', EundoStackAddType.all);
    }
};

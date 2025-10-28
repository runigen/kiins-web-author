import workInfo from '../store/workInfo';
import docData from '../store/docData';
import { IundoStackLogicInfo } from '../const/types';
import * as pages from './pages';
import { undoStackLimit } from '../const/basicData';
import * as logiceditor from '../util/logiceditor';

let stackList: IundoStackLogicInfo[] = [];
let currIndex: number = -1;

export const getUndoStackList = () => {
    return stackList;
};
export const checkStackListCnt = () => {
    if (stackList.length > 0) {
        return true;
    }
    return false;
};
export const getUndoStackInfo = (stackIndex: number) => {
    try {
        if (stackIndex < 0 || stackIndex > stackList.length - 1) {
            console.log(
                'getUndoStackInfo stackIndex Error stackIndex : ',
                stackIndex,
                'stackList.length: ',
                stackList.length,
            );
            return null;
        }
        return stackList[stackIndex];
    } catch (e) {
        console.log(e);
        return null;
    }
};
export const initialize = () => {
    stackList = [];
    currIndex = -1;
};
export const add = () => {
    try {
        let addObject: HTMLElement;
        addObject = pages.getCanvasObject();
        if (addObject === null) return;

        // 현재 차수 이후에 스텍이 존재하면 이후 스텍은 모두 제거
        if (currIndex <= stackList.length - 1) {
            stackList.splice(currIndex + 1);
        }

        // 해당 오브젝트가 몇번째 오브젝트인지 기록 (undo => redo 시 원래있던 위치에 그대로 삽입하기 위해)
        const canvasObject = logiceditor.getCanvasObject();
        if (canvasObject === null) return;

        // 캔버스에서 데이터 가져오기 전에 셀렉트된 오브젝트가 있으면 일시적으로 셀렉트 해제
        const selectedObject = logiceditor.getSelectedObjectList();
        if (selectedObject.length > 0) {
            const canvas = logiceditor.getCanvasObject();
            if (canvas) {
                canvas.querySelectorAll('div.block').forEach(item => {
                    item.classList.remove('active');
                });
            }
        }

        const newStackInfo: IundoStackLogicInfo = {
            content: canvasObject.innerHTML,
        };

        // 일시적으로 셀렉트 해제된 내역이 있으면 다시 셀렉트 원복
        if (selectedObject.length > 0) {
            logiceditor.setActiveObjectFlag();
        }

        // 마지막 스텍값과 중복 비교하여 중단
        if (stackList.length > 0) {
            const lastStackInfo = stackList.slice(-1)[0];
            if (
                JSON.stringify(lastStackInfo) === JSON.stringify(newStackInfo)
            ) {
                console.log('addUndoStack duplicate => N/A');
                return;
            }
        }
        stackList.push(newStackInfo);

        // stackLimit 개수를 초과하면 과거부터 삭제하여 개수 맞춤
        if (stackList.length > undoStackLimit) {
            const overCnt = stackList.length - undoStackLimit;
            stackList.splice(0, overCnt);
        }

        currIndex = stackList.length - 1;

        // 스텍 저장 후 document 컨텐츠 업데이트
        // docData.setLogicContent(canvasObject.innerHTML);
        logiceditor.saveLogicContent();
        docData.setModified(true);

        console.log(
            'undo addUndoStack stackList : ',
            stackList,
            ' currIndex : ',
            currIndex,
        );

        logiceditor.setDoStackStatusIcon();
    } catch (e) {
        console.log(e);
    }
};

export const undo = () => {
    try {
        const logicMode = workInfo.getLogicMode();
        if (!logicMode) return; // logic editor 모드에서만 로직에디터의 undo/redo 가능

        if (!checkStackListCnt()) {
            console.log('undo stack empty...');
            return;
        }
        if (currIndex < 1) {
            console.log('undo nomore prev stack');
            return;
        }

        const prevStack = getUndoStackInfo(currIndex - 1);
        if (prevStack === null) return;
        logiceditor.setLogicContentToCanvas(prevStack.content);

        // 스텍 복구 후 document 컨텐츠 업데이트
        // docData.setLogicContent(prevStack.content);
        logiceditor.saveLogicContent();
        docData.setModified(true);

        currIndex--;

        console.log(
            'undo result =>  currIndex : ',
            currIndex,
            ' stackList len : ',
            stackList.length,
        );

        logiceditor.setDoStackStatusIcon();
    } catch (e) {
        console.log(e);
    }
};
export const redo = () => {
    try {
        const logicMode = workInfo.getLogicMode();
        if (!logicMode) return; // logic editor 모드에서만 로직에디터의 undo/redo 가능

        if (!checkStackListCnt()) {
            console.log('undo stack empty...');
            return;
        }
        if (currIndex >= stackList.length - 1) {
            console.log('undo nomore next stack');
            return;
        }

        const nextStack = getUndoStackInfo(currIndex + 1);
        if (nextStack === null) return;
        logiceditor.setLogicContentToCanvas(nextStack.content);
        currIndex++;

        // 스텍 복구 후 document 컨텐츠 업데이트
        // docData.setLogicContent(nextStack.content);
        logiceditor.saveLogicContent();
        docData.setModified(true);

        console.log(
            'undo redo result =>  currIndex : ',
            currIndex,
            ' stackList len : ',
            stackList.length,
        );

        logiceditor.setDoStackStatusIcon();
    } catch (e) {
        console.log(e);
    }
};

export const checkUndoStack = () => {
    if (currIndex < 1) {
        return false;
    }
    return true;
};
export const checkRedoStack = () => {
    if (currIndex >= stackList.length - 1) {
        return false;
    }
    return true;
};

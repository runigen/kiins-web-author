import workInfo from '../store/workInfo';
import { EundoStackAddType, IundoStackInfo } from '../const/types';
import * as pages from './pages';
import { unselectSquareObjcts } from '../event/SquareEvent';
import { undoStackLimit } from '../const/basicData';
import * as SquareEvent from '../event/SquareEvent';
import * as documents from './documents';
import docData from '../store/docData';

let stackList: IundoStackInfo[] = [];
let currIndex: number = -1;

export const getUndoStackList = () => {
    return stackList;
};
const checkStackListCnt = () => {
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
    workInfo.setUndoStackIndex(currIndex);
    workInfo.setUndoStackCount(0);
};
export const addUndoStack = (
    addObjectId: string = '',
    addType: EundoStackAddType = EundoStackAddType.all,
) => {
    try {
        if (
            addType !== EundoStackAddType.page &&
            addType !== EundoStackAddType.load &&
            addType !== EundoStackAddType.all &&
            addObjectId === ''
        )
            return;

        let addObject: HTMLElement;
        if (addType === EundoStackAddType.page) {
            addObject = pages.getPageObject();
        } else if (
            addType === EundoStackAddType.load ||
            addType === EundoStackAddType.all
        ) {
            addObject = pages.getCanvasObject();
        } else {
            addObject = document.getElementById(addObjectId) as HTMLElement;
        }
        if (addObject === null) return;

        // page load 시에는 undoStack 초기화
        if (addType === EundoStackAddType.load) {
            initialize();
        }

        // 현재 차수 이후에 스텍이 존재하면 이후 스텍은 모두 제거
        if (currIndex <= stackList.length - 1) {
            stackList.splice(currIndex + 1);
        }

        // 해당 오브젝트가 몇번째 오브젝트인지 기록 (undo => redo 시 원래있던 위치에 그대로 삽입하기 위해)
        let addObjectIndex = -1;
        if (addType !== EundoStackAddType.page) {
            addObjectIndex = pages.getObjectIndex(addObjectId);
        }

        let newContent = '';
        if (
            addType === EundoStackAddType.load ||
            addType === EundoStackAddType.all
        ) {
            newContent = addObject.innerHTML;
        } else if (addType === EundoStackAddType.textbox) {
            const dummyObjectContainer = document.createElement(
                'div',
            ) as HTMLDivElement;
            dummyObjectContainer.innerHTML = addObject.outerHTML;

            const dummyObject = dummyObjectContainer.firstChild as HTMLElement;
            if (dummyObject === null) return;

            const dummyTextBoxObj = dummyObject.firstChild as HTMLElement;

            if (
                dummyTextBoxObj &&
                dummyTextBoxObj.classList.contains('textbox')
            ) {
                if (dummyTextBoxObj.getAttribute('contenteditable')) {
                    dummyTextBoxObj.removeAttribute('contenteditable');
                }
                newContent = dummyObject.outerHTML;
            } else {
                return;
            }
        } else {
            newContent = addObject.outerHTML;
        }

        const newStackInfo = {
            content: newContent,
            objectId: addObject.id,
            objectIndex: addObjectIndex,
            type: addType,
        };

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
        workInfo.setUndoStackIndex(currIndex);
        workInfo.setUndoStackCount(currIndex + 1);

        // 스텍 저장 후 document 컨텐츠 업데이트
        documents.setCurrentDocContent();

        console.log('addUndoStack Ok addType : ', addType);

        // console.log(
        //     'undo addUndoStack stackList : ',
        //     stackList,
        //     ' currIndex : ',
        //     currIndex,
        //     ' addObjectid : ',
        //     addObject.id,
        //     ' addObjectIndex : ',
        //     addObjectIndex,
        // );

        // make thumbnail (페이지 로드가 아닌 경우만)
        if (addType !== EundoStackAddType.load) {
            pages.makeCurrentPageThumbnail();
            docData.setModified(true);
            workInfo.setModifyObjectKey();
        }
    } catch (e) {
        console.log(e);
    }
};

export const undo = () => {
    try {
        if (!checkStackListCnt()) {
            console.log('undo stack empty...');
            return;
        }
        if (currIndex < 1) {
            console.log('undo nomore prev stack');
            return;
        }

        // 최상위 스텍인경우
        if (currIndex === 1) {
            const loadStack: IundoStackInfo | null = getUndoStackInfo(0);
            if (loadStack && loadStack.type === EundoStackAddType.load) {
                unselectSquareObjcts();
                documents.loadPageContent(loadStack.content);

                currIndex--;
                workInfo.setUndoStackIndex(currIndex);
                workInfo.setUndoStackCount(stackList.length);

                // undo 후 document 컨텐츠 업데이트
                documents.setCurrentDocContent();

                // make thumbnail
                pages.makeCurrentPageThumbnail();

                console.log(
                    'undo load content initialized : result =>  currIndex : ',
                    currIndex,
                    ' stackList len : ',
                    stackList.length,
                );
            }
            return;
        }

        // undo 하기 전 현재 상태의 stack 검사
        const currStack: IundoStackInfo | null = getUndoStackInfo(currIndex);
        if (currStack === null) return;

        // 현재 stack 이 add 된 것이었으면 => 추가되었던 오브젝트 삭제
        if (currStack.type === EundoStackAddType.add) {
            pages.removeObjectFromCanvas(currStack.objectId);

            // 현재 stack 이 del 된 것이었으면 => 삭제되었던 오브젝트 원복
        } else if (currStack.type === EundoStackAddType.del) {
            pages.restoreObjectToCanvas(
                currStack.content,
                currStack.objectIndex,
            );

            // page 설정인경우
        } else if (currStack.type === EundoStackAddType.page) {
            const prevStack = getUndoStackInfo(currIndex - 1);
            if (prevStack === null) return;
            pages.updatePageToCanvas(prevStack.content);

            // 최초 로딩인경우
        } else if (currStack.type === EundoStackAddType.load) {
            console.log('first loaded content => N/A');

            // 전체 컨텐츠
        } else if (currStack.type === EundoStackAddType.all) {
            const prevStack = getUndoStackInfo(currIndex - 1);
            if (prevStack === null) return;
            pages.updateAllToCanvas(prevStack.content);
            console.log('all content => N/A');

            // 현재 stack 이 수정 된것 이었으면 => 오브젝트 속성 변경
        } else {
            const prevStack = getUndoStackInfo(currIndex - 1);
            if (prevStack === null) return;
            pages.updateObjectToCanvas(prevStack.content, currStack.type);
        }

        currIndex--;
        workInfo.setUndoStackIndex(currIndex);
        workInfo.setUndoStackCount(stackList.length);

        // select object 처리
        if (
            currStack.type === EundoStackAddType.add ||
            currStack.type === EundoStackAddType.del
        ) {
            // 셀렉션이 남아 있으면 오브젝트 삭제후에 엉뚱한 곳에 있을 수 있으므로 미리 제거한다.
            unselectSquareObjcts();
        } else if (currStack.type === EundoStackAddType.style) {
            const currObject = workInfo.getObject();
            if (currObject) {
                SquareEvent.refreshObjectSelector(currObject);
            }
        }

        // undo 후 document 컨텐츠 업데이트
        documents.setCurrentDocContent();

        // make thumbnail
        pages.makeCurrentPageThumbnail();

        docData.setModified(true);

        workInfo.setModifyObjectKey();

        console.log(
            'undo result =>  currIndex : ',
            currIndex,
            ' stackList len : ',
            stackList.length,
        );
    } catch (e) {
        console.log(e);
    }
};
export const redo = () => {
    try {
        if (!checkStackListCnt()) {
            console.log('undo stack empty...');
            return;
        }
        if (currIndex >= stackList.length - 1) {
            console.log('undo nomore next stack');
            return;
        }

        const nextStack = getUndoStackInfo(currIndex + 1);
        if (nextStack) {
            if (nextStack.type === EundoStackAddType.add) {
                pages.restoreObjectToCanvas(
                    nextStack.content,
                    nextStack.objectIndex,
                );
            } else if (nextStack.type === EundoStackAddType.del) {
                pages.removeObjectFromCanvas(nextStack.objectId);
            } else if (nextStack.type === EundoStackAddType.page) {
                pages.updatePageToCanvas(nextStack.content);
            } else if (nextStack.type === EundoStackAddType.load) {
                console.log('first loaded content => N/A');

                // 전체 컨텐츠
            } else if (nextStack.type === EundoStackAddType.all) {
                pages.updateAllToCanvas(nextStack.content);
                console.log('all content => N/A');

                // 현재 stack 이 mod 된것 이었으면 => 오브젝트 속성 변경
            } else {
                pages.updateObjectToCanvas(nextStack.content, nextStack.type);
            }

            currIndex++;
            workInfo.setUndoStackIndex(currIndex);
            workInfo.setUndoStackCount(stackList.length);

            // select object 처리
            if (
                nextStack.type === EundoStackAddType.add ||
                nextStack.type === EundoStackAddType.del
            ) {
                // 셀렉션이 남아 있으면 오브젝트 삭제후에 엉뚱한 곳에 있을 수 있으므로 미리 제거한다.
                unselectSquareObjcts();
            } else if (nextStack.type === EundoStackAddType.style) {
                const currObject = workInfo.getObject();
                if (currObject) {
                    SquareEvent.refreshObjectSelector(currObject);
                }
            }
        }

        // redo 후 document 컨텐츠 업데이트
        documents.setCurrentDocContent();

        // make thumbnail
        pages.makeCurrentPageThumbnail();

        docData.setModified(true);

        workInfo.setModifyObjectKey();

        console.log(
            'undo redo result =>  currIndex : ',
            currIndex,
            ' stackList len : ',
            stackList.length,
        );
    } catch (e) {
        console.log(e);
    }
};

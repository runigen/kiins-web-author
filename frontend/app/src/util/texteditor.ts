import $ from 'jquery';
import workInfo from '../store/workInfo';
import userInfo from '../store/userInfo';
import * as basicData from '../const/basicData';
import * as CommonEvent from '../event/CommonEvent';
import { allEventCancel } from '../util/common';
import { squareKeyMoveEvent } from '../event/SquareEvent';
import * as KeyEvent from '../event/KeyEvent';
import * as dostack from '../util/dostack';
import {
    EundoStackAddType,
    ITextEditorToolsInfo,
    ETextEditorToolsType,
    ETextEditorToolsName,
    ETextEditorToolsUnit,
    EkeyName,
} from '../const/types';

export const setTextEditMode = (
    targetObject: HTMLElement | null,
    bMode = true,
) => {
    // console.log('setTextEditMode targetObject : ', targetObject);

    if (targetObject === null) return;

    try {
        // 에디트 모드 활성화
        if (bMode) {
            //$(targetObject).attr('contenteditable', 'true');
            CommonEvent.removeSelectors();

            let textBox = targetObject.querySelector(
                '.textbox',
            ) as HTMLDivElement;
            if (textBox === null) {
                // textBox = document.createElement('div');
                // textBox.className = 'textbox';
                // textBox.innerHTML = '<p><br></p>';
                // textBox.style.padding = '10px';
                textBox = createTextBox();
                targetObject.appendChild(textBox);

                //textbox 추가될때 오브젝트 변화 업데이트
                workInfo.setUpdateKey();
            }

            // textbox 에서 포커스이탈시 에디트모드 해제
            // textBox.onblur = () => {
            //     console.log(
            //         'blur.... contenteditable : ',
            //         $(textBox).attr('contenteditable'),
            //     );
            //     if ($(textBox).attr('contenteditable')) {
            //         // textBox.removeEventListener('mousedown', cancelBubble);
            //         textBox.removeEventListener(
            //             'mouseup',
            //             addEditorMouseUpEvent,
            //         );
            //         textBox.removeEventListener('keyup', addEditorKeyUpEvent);
            //         textBox.removeEventListener('paste', addEditorPasteEvent);

            //         // 해제시 코드 정리
            //         convRootExtNodes();

            //         $(textBox).removeAttr('contenteditable');

            //         $(targetObject).children('.text-object-outline').remove();
            //     }
            //     workInfo.setDteStatus(false);

            //     // 텍스트박스 빠져나올때 내용이 비어 있으면 텍스트박스 제거
            //     if (
            //         (textBox &&
            //             textBox.innerHTML.toLowerCase().trim() === '') ||
            //         textBox.innerHTML.toLowerCase().trim() === '<p><br></p>'
            //     ) {
            //         textBox.parentNode?.removeChild(textBox);
            //     }
            // };

            // 오브젝트에 걸려있는 keydown 이벤트 제거
            document.removeEventListener('keydown', squareKeyMoveEvent);

            $(textBox).attr('contenteditable', 'true');

            // 포커싱이 바로 안되는관계로 시간차
            setTimeout(() => {
                console.log('focus');
                // textBox.addEventListener('mousedown', cancelBubble);
                textBox.addEventListener('mouseup', addEditorMouseUpEvent);
                textBox.addEventListener('keyup', addEditorKeyUpEvent);
                textBox.addEventListener('paste', addEditorPasteEvent);
                textBox.focus();

                const textObjectOutline = document.createElement('div');
                textObjectOutline.className = 'text-object-outline';
                targetObject.appendChild(textObjectOutline);

                updateAllToolbarState(true);
                workInfo.setDteStatus(true);

                // const removeBtn = document.createElement('div');
                // removeBtn.style.width = '10px';
                // removeBtn.style.height = '10px';
                // removeBtn.style.backgroundColor = 'red';
                // removeBtn.style.position = 'absolute';

                // targetObject.appendChild(removeBtn);
            }, 100);

            // 에디트 모드 비활성화
        } else {
            if (
                targetObject.childNodes.length &&
                (targetObject.firstChild as HTMLDivElement).classList.contains(
                    'textbox',
                )
            ) {
                const textBox = targetObject.firstChild as HTMLDivElement;
                if ($(textBox).attr('contenteditable')) {
                    // targetObject.firstChild.removeEventListener('mousedown', cancelBubble);
                    textBox.removeEventListener(
                        'mouseup',
                        addEditorMouseUpEvent,
                    );
                    textBox.removeEventListener('keyup', addEditorKeyUpEvent);
                    textBox.removeEventListener('paste', addEditorPasteEvent);

                    // 해제시 코드 정리
                    convRootExtNodes();

                    $(textBox).removeAttr('contenteditable');

                    $(targetObject).children('.text-object-outline').remove();
                }
                workInfo.setDteStatus(false);

                // // 텍스트박스 내용이 비어 있으면 텍스트박스 제거
                // if (
                //     (textBox &&
                //         textBox.innerHTML.toLowerCase().trim() === '') ||
                //     textBox.innerHTML.toLowerCase().trim() === '<p><br></p>'
                // ) {
                //     textBox.parentNode?.removeChild(textBox);
                // }
            }
        }
    } catch (e) {
        console.log('setTextEditMode error : ', e);
    }
};
export const createTextBox = (
    text = '',
    fontSize = 0,
    align:
        | ETextEditorToolsName.left
        | ETextEditorToolsName.center
        | ETextEditorToolsName.right
        | ETextEditorToolsName.justify = ETextEditorToolsName.center,
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
) => {
    const textBox = document.createElement('div');
    textBox.className = 'textbox middle';
    if (text !== '') {
        if (fontSize > 0) {
            textBox.innerHTML = `<p style="text-align: ${align};"><span style="font-size: ${fontSize}px;">${text}</span></p>`;
        } else {
            textBox.innerHTML = `<p style="text-align: ${align};">${text}</p>`;
        }
    } else {
        textBox.innerHTML = `<p style="text-align: ${align};"><br></p>`;
    }
    textBox.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    return textBox;
};

export const addEditorMouseUpEvent = (event: MouseEvent) => {
    console.log('addEditorMouseUpEvent : ', event.target);
    updateAllToolbarState();
    closeAllCtlBoxList();
};
export const addEditorKeyUpEvent = (event: KeyboardEvent) => {
    const keyCode = KeyEvent.getKeyCode(event);

    if (keyCode === EkeyName.ENTER) {
        console.log('addEditorKeyUpEvent Enter -> ');
        convRootExtNodes();

        // 처리후에 저장
        setTimeout(() => {
            const currObject = workInfo.getObject();
            if (currObject) {
                dostack.addUndoStack(currObject.id, EundoStackAddType.textbox);
            }
        }, 500);
    }

    updateAllToolbarState();
};
export const addEditorPasteEvent = (event: ClipboardEvent) => {
    try {
        console.log('addEditorPasteEvent : ', event);
        // const keyCode = KeyEvent.getKeyCode(event);

        const pasteContent = event.clipboardData?.getData('text/plain');
        console.log('pasteContent : ', pasteContent);

        if (pasteContent) {
            const currObject = workInfo.getObject();
            if (currObject) {
                const sel = window.getSelection();
                if (sel) {
                    const range = sel.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(pasteContent));
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    allEventCancel(event);
                }
            }
        }
        updateAllToolbarState();
    } catch (e) {
        console.log(e);
    }
};

export const getToolbarId = (execName: string) => {
    return `idx_tool_${execName}`;
};

export const closeAllCtlBoxList = () => {
    $('.dynamic-text-tools-container .toolbar .list-container').removeClass(
        'active',
    );
    $('.dynamic-text-tools-container .toolbar .color-picker').removeClass(
        'active',
    );
    $(
        '.dynamic-text-tools-container .toolbar .text-effect-tools-container',
    ).removeClass('active');
};

const updateQueryCommandState = (execName: string) => {
    let bCommandState = false;
    try {
        bCommandState = document.queryCommandState(execName);
    } catch (e) {
        console.log(e);
    }
    return bCommandState;

    /* // ----------------- queryCommandState : 브라우저에서 더이상 지원 안될경우 아래 코드로 대체 사용예정 (2022/06/06 현재 작동 문제 없음 )-------------------
    let bCommandState = false;
    let specificTag = 'i';
    let node = window.getSelection()?.focusNode as HTMLElement | null;
    if(node) {
        while(node && node.className !== 'textbox') {
            if(node.nodeName.toLowerCase() === specificTag){
                bCommandState = true;
                break;
            }
            node = node.parentElement;
        } 
    }
    return bCommandState;
    */
};
const getTextBoxObj = () => {
    try {
        const currObject = workInfo.getObject();
        if (currObject === null) {
            return null;
        }
        const textBox = currObject.firstChild as HTMLDivElement;
        if (textBox && textBox.getAttribute('contenteditable')) {
            return textBox;
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
};

const insertCoreHTMLElem = (htmlElement: Node) => {
    try {
        const objSelection = window.getSelection();
        if (objSelection === null) return;

        const objRange = objSelection.getRangeAt(0);

        objSelection.removeAllRanges();
        objRange.deleteContents();

        const objStartContainer = objRange.startContainer;
        const posStartOffset = objRange.startOffset;

        if (objStartContainer.nodeType == 3) {
            const objTextNode = objStartContainer;
            const objParentNode = objTextNode.parentNode;
            if (objParentNode === null) return;

            const strTextValue = objTextNode.nodeValue;
            if (strTextValue === null) return;

            const strTextBefore = strTextValue.substr(0, posStartOffset);
            const strTextAfter = strTextValue.substr(posStartOffset);

            const objBeforeNode = document.createTextNode(strTextBefore);
            const objAfterNode = document.createTextNode(strTextAfter);

            objParentNode.insertBefore(objAfterNode, objTextNode);

            if (null == htmlElement) {
                const objInsertTextNode = document.createTextNode('&nbsp;');

                objParentNode.insertBefore(objInsertTextNode, objAfterNode);
                objParentNode.insertBefore(objBeforeNode, objInsertTextNode);
            } else {
                objParentNode.insertBefore(htmlElement, objAfterNode);
                objParentNode.insertBefore(objBeforeNode, htmlElement);
            }

            objParentNode.removeChild(objTextNode);
        } // simply insert the node
        else {
            const objAfterNode = objStartContainer.childNodes[posStartOffset];

            if (objAfterNode) {
                objStartContainer.appendChild(htmlElement);
            } else {
                objStartContainer.insertBefore(htmlElement, objAfterNode);
            }
        }
    } catch (e) {
        console.log(e);
    }
};

const insertCoreHTMLCode = (
    htmlCode: string | null,
    htmlElement: Node | null,
) => {
    try {
        const objSelection = window.getSelection();
        if (objSelection === null) return;

        const objRange = document.createRange();

        let objLastInsertNode = null;

        if (null != htmlCode) {
            const objTempDivElement = document.createElement('div');
            const objCopyDivElement = document.createElement('div');
            objCopyDivElement.innerHTML = htmlCode;

            insertCoreHTMLElem(objTempDivElement);

            const objParentNode = objTempDivElement.parentNode;
            if (objParentNode) {
                // while (true) {
                while (objCopyDivElement.childNodes.length > 0) {
                    // if (0 == objCopyDivElement.childNodes.length) break;

                    objLastInsertNode = objParentNode.insertBefore(
                        objCopyDivElement.childNodes[0],
                        objTempDivElement,
                    );
                }
                objParentNode.removeChild(objTempDivElement);
            }
        } else {
            if (null == htmlElement) return;

            insertCoreHTMLElem(htmlElement);

            objLastInsertNode = htmlElement;
        }

        if (objLastInsertNode === null) return;

        objRange.setStartAfter(objLastInsertNode);
        objRange.setEndAfter(objLastInsertNode);

        objSelection.addRange(objRange);
    } catch (e) {
        console.log(e);
    }
};

let strTimeCodeID_Start = '';
let strTimeCodeID_End = '';
const emptyChar = '&#8203;';
const markSelectRange = () => {
    const objSelection = document.getSelection();
    if (objSelection === null) return;

    const objRange = objSelection.getRangeAt(0);
    if (objSelection.rangeCount > 1) return;

    let bOnlyTextSelected = false;
    let objAncestorNode = objRange.commonAncestorContainer;

    if (objRange.collapsed) {
        const span = document.createElement('span');
        span.innerHTML = emptyChar;
        insertCoreHTMLCode(null, span);

        objSelection.removeAllRanges();

        const spanRange = document.createRange();
        spanRange.selectNodeContents(span);
        objSelection.addRange(spanRange);

        // //-- 셀렉션 다시 계산
        // objSelection = document.getSelection();
        // objRange = objSelection.getRangeAt(0);
        // if(objSelection.rangeCount > 1) return;
        objAncestorNode = objRange.commonAncestorContainer;
    }

    if (3 == objAncestorNode.nodeType) {
        bOnlyTextSelected = true;
    }

    const objDate = new Date();
    const strTimeCodeID = objDate.getTime();
    strTimeCodeID_Start = 'S_' + strTimeCodeID;
    strTimeCodeID_End = 'E_' + strTimeCodeID;

    if (bOnlyTextSelected) {
        // 임시 기준 SPAN 태그 생성
        const objTempSpan_Start = document.createElement('span');
        const objTempSpan_End = document.createElement('span');

        objTempSpan_Start.id = strTimeCodeID_Start;
        objTempSpan_End.id = strTimeCodeID_End;

        const objTextContainer = objRange.startContainer;

        if (objTextContainer.parentNode) {
            objTextContainer.parentNode.insertBefore(
                objTempSpan_Start,
                objTextContainer,
            );

            if (objTextContainer.nextSibling) {
                objTextContainer.parentNode.insertBefore(
                    objTempSpan_End,
                    objTextContainer.nextSibling,
                );
            } else {
                objTextContainer.parentNode.appendChild(objTempSpan_End);
            }
        }
    } else {
        // 현재 선택된 영역의 위치 얻어오기
        const objStartContainer = objRange.startContainer;
        const posStartOffset = objRange.startOffset;

        const objEndContainer = objRange.endContainer;
        const posEndOffset = objRange.endOffset;

        // 임시 기준 SPAN 태그 생성
        const objTempSpan_Start = document.createElement('span');
        const objTempSpan_End = document.createElement('span');

        objTempSpan_Start.id = strTimeCodeID_Start;
        objTempSpan_End.id = strTimeCodeID_End;

        objSelection.removeAllRanges();

        const objEndLetterRange = document.createRange();
        objEndLetterRange.setStartBefore(objEndContainer);
        objEndLetterRange.setEnd(objEndContainer, posEndOffset);
        objEndLetterRange.collapse(false);

        objSelection.addRange(objEndLetterRange);
        insertCoreHTMLCode(null, objTempSpan_End);

        objSelection.removeAllRanges();

        const objStartLetterRange = document.createRange();
        objStartLetterRange.setStart(objStartContainer, posStartOffset);
        objStartLetterRange.setEndAfter(objStartContainer);
        objStartLetterRange.collapse(true);

        objSelection.addRange(objStartLetterRange);
        insertCoreHTMLCode(null, objTempSpan_Start);
    }
};

const recoverSelectRange = () => {
    const objSelection = window.getSelection();
    if (objSelection === null) return;

    let objTempSpan_Start: HTMLSpanElement | null = null;
    let objTempSpan_End: HTMLSpanElement | null = null;

    if (strTimeCodeID_Start !== '') {
        objTempSpan_Start = document.getElementById(
            strTimeCodeID_Start,
        ) as HTMLSpanElement;
    }
    if (strTimeCodeID_End !== '') {
        objTempSpan_End = document.getElementById(
            strTimeCodeID_End,
        ) as HTMLSpanElement;
    }

    if (!objTempSpan_Start || !objTempSpan_End) return;

    // 이전에 선택된 영역 다시 선택되도록 처리
    objSelection.removeAllRanges();

    const objAncestorResultRange = document.createRange();

    let firstNode: any = objTempSpan_Start.nextSibling;
    let lastNode: any = objTempSpan_End.previousSibling;

    if (lastNode === null) {
        lastNode = objTempSpan_End.parentNode;
    }

    let bFoundFirst = false;
    let bFoundLast = false;

    if (
        firstNode &&
        firstNode.nodeType !== 3 &&
        lastNode &&
        lastNode.nodeType !== 3
    ) {
        bFoundFirst = firstNode.nodeType === 3;
        bFoundLast = lastNode.nodeType === 3;

        while (bFoundFirst === false) {
            if (firstNode.firstChild === null) {
                firstNode = firstNode.parentNode;
                bFoundFirst = true;

                break;
            } else {
                firstNode = firstNode.firstChild;

                if (firstNode.nodeType === 3) {
                    bFoundFirst = true;

                    break;
                }
            }
        }

        while (bFoundLast === false) {
            if (lastNode.lastChild === null) {
                lastNode = lastNode.parentNode;
                bFoundLast = true;

                break;
            } else {
                lastNode = lastNode.lastChild;

                if (lastNode.nodeType === 3) {
                    bFoundLast = true;

                    break;
                }
            }
        }
    }

    if (bFoundFirst === true && bFoundLast === true) {
        objAncestorResultRange.setStart(firstNode, 0);
        objAncestorResultRange.setEnd(
            lastNode,
            lastNode.nodeType === 3
                ? lastNode.nodeValue.length
                : lastNode.childNodes.length,
        );
    } else {
        objAncestorResultRange.setStartAfter(objTempSpan_Start);
        objAncestorResultRange.setEndBefore(objTempSpan_End);
    }

    objSelection.addRange(objAncestorResultRange);

    // 임시 SPAN 객체 제거
    const objParent_Start = getParentElement(objTempSpan_Start) as HTMLElement;
    if (null == objParent_Start) return;

    const objParent_End = getParentElement(objTempSpan_End) as HTMLElement;
    if (null == objParent_End) return;

    //IE11 에서 간혹 다운현상이 있어 아래 처리 함 (제거 검토)
    setTimeout(function () {
        try {
            if (objTempSpan_Start) {
                objParent_Start.removeChild(objTempSpan_Start);
            }
            if (objTempSpan_End) {
                objParent_End.removeChild(objTempSpan_End);
            }
        } catch (e) {
            console.log(e);
        }
    }, 0);
};

export const getParentElement = (
    node: HTMLElement,
    searchNodeName: string | undefined = undefined,
    searchClassName: string | undefined = undefined,
    bSelf = true,
) => {
    try {
        let currNode = node;

        if (searchNodeName === undefined) {
            if (currNode === null) {
                return null;
            }
            return currNode.parentNode as HTMLElement;
        }

        searchNodeName = searchNodeName.toLowerCase();
        let searchNodeNameList = searchNodeName.split(',');
        searchNodeNameList = searchNodeNameList.map(string => string.trim());

        if (bSelf !== true) {
            currNode = node.parentNode as HTMLElement;
        }

        if (searchNodeNameList.indexOf(currNode.nodeName.toLowerCase()) > -1) {
            if (searchClassName === undefined) {
                return currNode;
            } else {
                if (currNode.classList.contains(searchClassName)) {
                    return currNode;
                }
            }
        }

        let loopCnt = 0;
        while (currNode) {
            loopCnt++;
            if (loopCnt > 50) break;

            if (
                searchNodeNameList.indexOf(currNode.nodeName.toLowerCase()) > -1
            ) {
                //return currNode;
                if (searchClassName === undefined) {
                    return currNode;
                } else {
                    if (currNode.classList.contains(searchClassName)) {
                        return currNode;
                    }
                }
            }
            if (
                currNode.className === 'canvas-sheet' ||
                currNode.id === 'idx_canvas_container' ||
                currNode.id === 'idx_body_middle_workspace' ||
                currNode.id === 'idx_workspace' ||
                currNode.id === 'idx_logic_canvas' ||
                currNode.nodeName.toLowerCase() === 'body'
            ) {
                return null;
            }

            currNode = currNode.parentNode as HTMLElement;
        }
        return null;
    } catch (e) {
        console.log(e);
        return null;
    }
};

const convLineHeightPxToPer = (fontSizePx: number, lineHeightPx: number) => {
    const currLineHeightNum = (lineHeightPx / fontSizePx).toFixed(1);
    return Number(currLineHeightNum) * 100;
};

const updateBasicToolbarState = () => {
    // queryCommandState 처리로 할것들
    const commandList = [
        ETextEditorToolsName.bold,
        ETextEditorToolsName.italic,
        ETextEditorToolsName.underline,
        ETextEditorToolsName.strikethrough,
        ETextEditorToolsName.superscript,
        ETextEditorToolsName.subscript,
        ETextEditorToolsName.insertorderedlist,
        ETextEditorToolsName.insertunorderedlist,
    ];
    for (let i = 0; i < commandList.length; i++) {
        const bCommandState = updateQueryCommandState(commandList[i]);
        // console.log(commandList[i], bCommandState);
        const toolbarObj = document.getElementById(
            getToolbarId(commandList[i]),
        ) as HTMLDivElement;
        // console.log('toolbarObj : ', toolbarObj);
        if (bCommandState) {
            if (!$(toolbarObj).hasClass('active')) {
                $(toolbarObj).addClass('active');
            }
        } else {
            if ($(toolbarObj).hasClass('active')) {
                $(toolbarObj).removeClass('active');
            }
        }
    }
};

const updateAllToolbarState = (bFocus = false) => {
    try {
        const textBox = getTextBoxObj();
        if (textBox) {
            updateBasicToolbarState();
            updateExtToolbarState();

            // bFocus 가 true인경우 (에디터에 포커스되었을때) 만 아래 호출(박스스타일)
            if (bFocus === true) {
                updateTextBoxValignState();
                updateTextBoxPaddingState();
            }
        }
    } catch (e) {
        console.log(e);
    }
};

const updateExtToolbarState = () => {
    try {
        const objSelection = document.getSelection();
        if (objSelection === null) return;
        const objRange = objSelection.getRangeAt(0);
        if (objSelection.rangeCount > 1) return;

        // const objAncestorNode = objRange.commonAncestorContainer;
        const objStartContainer = objRange.startContainer;
        // const objEndContainer = objRange.endContainer;

        let targetContainer: Element = objStartContainer as Element;
        if (objStartContainer.nodeType === 3) {
            targetContainer = objStartContainer.parentNode as Element;
        }

        // font-family
        const currFontPropertyVal = window
            .getComputedStyle(targetContainer, null)
            .getPropertyValue('font-family');
        const currFontPropertyList = currFontPropertyVal.split(',');
        let currFontFamily = '';
        if (0 == currFontPropertyList.length) {
            currFontFamily = '';
        } else {
            currFontFamily = currFontPropertyList[0];
        }
        currFontFamily = currFontFamily.replace(/["|']+/g, '');

        const fontToolbar = document.getElementById(
            getToolbarId(ETextEditorToolsName.fontfamily),
        ) as HTMLDivElement;
        if (fontToolbar) {
            const toolbarValueObj = fontToolbar.firstChild as HTMLDivElement;
            if (toolbarValueObj) {
                if (currFontFamily) {
                    toolbarValueObj.innerText = currFontFamily;
                } else {
                    toolbarValueObj.innerText = 'unknown';
                }
            }
        }
        const fontToolId = getToolbarId(ETextEditorToolsName.fontfamily);
        $(`#${fontToolId} .list-container .list`).each(
            (index: number, elem: HTMLElement) => {
                if ($(elem).attr('dataval') === currFontFamily) {
                    $(elem).addClass('active');
                } else {
                    $(elem).removeClass('active');
                }
            },
        );

        // font-size
        const currFontSizePx = window
            .getComputedStyle(targetContainer, null)
            .getPropertyValue('font-size');
        // const sizeToolbar = document.getElementById(getToolbarId(ETextEditorToolsName.fontsize)) as HTMLDivElement;
        // if(sizeToolbar) {
        //     const toolbarValueObj = sizeToolbar.firstChild as HTMLDivElement;
        //     if(toolbarValueObj) {
        //         if(currFontSizePx) {
        //             toolbarValueObj.innerText = currFontSizePx.replace(/px/,'');
        //         } else {
        //             toolbarValueObj.innerText = 'unknown';
        //         }
        //     }
        // }
        const fontsizeToolId = getToolbarId(ETextEditorToolsName.fontsize);
        $(`#${fontsizeToolId} input`).val(currFontSizePx.replace(/px/, ''));
        $(`#${fontsizeToolId} .list-container .list`).each(
            (index: number, elem: HTMLElement) => {
                if (
                    $(elem).attr('dataval') === currFontSizePx.replace(/px/, '')
                ) {
                    $(elem).addClass('active');
                } else {
                    $(elem).removeClass('active');
                }
            },
        );

        // letter-spacing
        let currLetterSpacingPx =
            window
                .getComputedStyle(targetContainer, null)
                .getPropertyValue('letter-spacing') || '0px';
        if (currLetterSpacingPx === 'normal') {
            currLetterSpacingPx = '0px';
        }
        const letterspacingToolId = getToolbarId(
            ETextEditorToolsName.letterspacing,
        );
        $(`#${letterspacingToolId} input`).val(
            currLetterSpacingPx.replace(/px/, ''),
        );
        $(`#${letterspacingToolId} .list-container .list`).each(
            (index: number, elem: HTMLElement) => {
                if (
                    $(elem).attr('dataval') ===
                    currLetterSpacingPx.replace(/px/, '')
                ) {
                    $(elem).addClass('active');
                } else {
                    $(elem).removeClass('active');
                }
            },
        );

        // line-height
        const currLineHeightPx = window
            .getComputedStyle(targetContainer, null)
            .getPropertyValue('line-height');
        const currLineHeightPercent = convLineHeightPxToPer(
            parseInt(currFontSizePx.replace(/px/, ''), 10),
            parseInt(currLineHeightPx.replace(/px/, ''), 10),
        );
        const lineheightToolId = getToolbarId(ETextEditorToolsName.lineheight);
        $(`#${lineheightToolId} .list-container .list`).each(
            (index: number, elem: HTMLElement) => {
                if ($(elem).attr('dataval') === String(currLineHeightPercent)) {
                    $(elem).addClass('active');
                } else {
                    $(elem).removeClass('active');
                }
            },
        );

        // text-align
        const currTextAlign = window
            .getComputedStyle(targetContainer, null)
            .getPropertyValue('text-align');
        console.log('currTextAlign : ', currTextAlign);
        if (currTextAlign) {
            $(
                '.toolbar.btn.left, .toolbar.btn.center, .toolbar.btn.right, .toolbar.btn.justify',
            ).each((index, tool) => {
                if ($(tool).hasClass(currTextAlign)) {
                    $(tool).addClass('active');
                } else {
                    if ($(tool).hasClass('active')) {
                        $(tool).removeClass('active');
                    }
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
};

export const updateTextEffectToolbarState = () => {
    try {
        const objSelection = document.getSelection();
        if (objSelection === null) return;
        const objRange = objSelection.getRangeAt(0);
        if (objSelection.rangeCount > 1) return;

        // const objAncestorNode = objRange.commonAncestorContainer;
        const objStartContainer = objRange.startContainer;
        // const objEndContainer = objRange.endContainer;

        let targetContainer: Element = objStartContainer as Element;
        if (objStartContainer.nodeType === 3) {
            targetContainer = objStartContainer.parentNode as Element;
        }

        // text-shadow
        let currTextShadowVal =
            window
                .getComputedStyle(targetContainer, null)
                .getPropertyValue('text-shadow') || '';

        if (currTextShadowVal === 'none' || currTextShadowVal === '') {
            currTextShadowVal = 'rgb(0,0,0) 0px 0px 0px';
        }

        let textShadowX = 0;
        let textShadowY = 0;
        let textShadowB = 0;
        let textShadowC = 'rgb(0,0,0)';
        if (currTextShadowVal) {
            const colorList = currTextShadowVal.match(/rgb\(.+\)/g) || [
                'rgb(0,0,0)',
            ];
            textShadowC = colorList[0];
            console.log('colorList', colorList);
            console.log('textShadowC', textShadowC);

            const positionString = (
                currTextShadowVal.replace(/rgb\(.+\)/g, '') || '0px 0px 0px'
            ).trim();
            const positionList = positionString.split(' ');
            textShadowX = parseInt(positionList[0].replace(/px/, ''), 10);
            textShadowY = parseInt(positionList[1].replace(/px/, ''), 10);
            textShadowB = parseInt(positionList[2].replace(/px/, ''), 10);

            console.log('positionList', positionList);
            console.log('textShadowX', textShadowX);
            console.log('textShadowY', textShadowY);
            console.log('textShadowB', textShadowB);

            $('#textshadow_x').val(textShadowX);
            $('#textshadow_y').val(textShadowY);
            $('#textshadow_b').val(textShadowB);
            $('#idx_textshadow_color_selector').css(
                'background-color',
                textShadowC,
            );
        }

        // text-outline  (-webkit-text-stroke 속성은 가져올 수 없어 width, color를 따로 가져옴)
        const currTextOutlineWidth = (
            $(targetContainer).css('-webkit-text-stroke-width') || '0px'
        ).replace(/px/, '');
        const currTextOutlineColor =
            $(targetContainer).css('-webkit-text-stroke-color') ||
            'rgb(255,255,255)';
        console.log('currTextOutlineWidth : ', currTextOutlineWidth);
        console.log('currTextOutlineColor : ', currTextOutlineColor);

        $('#textoutline_w').val(currTextOutlineWidth);
        $('#idx_textoutline_color_selector').css(
            'background-color',
            currTextOutlineColor,
        );
    } catch (e) {
        console.log(e);
    }
};

const removeEmptySpans = (targetContainer: HTMLElement) => {
    const spans = Array.from(
        targetContainer.querySelectorAll('span') as NodeListOf<HTMLSpanElement>,
    ).reverse();
    for (let i = 0; i < spans.length; i++) {
        if (
            spans[i].getAttribute('style') === null ||
            spans[i].getAttribute('style') === undefined ||
            spans[i].getAttribute('style') === ''
        ) {
            spans[i].outerHTML = spans[i].innerHTML;
        } else {
            // 현재 노드내에 내용이 없다면 현재 노드 제거
            if (spans[i].innerHTML === '') {
                spans[i].remove();
                continue;
            }

            // 현재 노드의 형제중 비어있는 텍스트 노드 제거
            const parentChildNodes = Array.from(
                spans[i].parentNode?.childNodes as NodeListOf<HTMLSpanElement>,
            ).reverse();
            for (let j = 0; j < parentChildNodes.length; j++) {
                if (
                    parentChildNodes[j].nodeType === Node.TEXT_NODE &&
                    parentChildNodes[j].textContent === ''
                ) {
                    parentChildNodes[j].remove();
                }
            }

            // 현재 노드의 형제가 없는경우(부모의 단일노드) 현재 노드의 스타일을 부모에게 적용하고 현재 노드의 span 태그 제거
            if (
                spans[i].parentNode?.nodeName.toLowerCase() === 'span' &&
                spans[i].parentNode?.childNodes.length === 1
            ) {
                const parentNode = spans[i].parentNode as HTMLElement;
                if (parentNode) {
                    const currStyles = spans[i].style;
                    console.log('currStyles : ', currStyles);
                    for (let i = 0, len = currStyles.length; i < len; ++i) {
                        const styleName = currStyles[i];
                        const styleValue =
                            currStyles.getPropertyValue(styleName);
                        parentNode.style.setProperty(styleName, styleValue);
                    }
                    parentNode.innerHTML = spans[i].innerHTML;
                }
                // const currCss = $(spans[i]).attr('style');
                // let parentCss = '';
                // const parentNode = spans[i].parentNode as HTMLElement;
                // if (parentNode) {
                //     parentCss = $(parentNode).attr('style') || '';
                //     if (parentCss !== '') {
                //         parentCss += ';';
                //     }
                //     parentCss = parentCss.replace(/;;+/g, ';');
                //     $(parentNode).attr('style', parentCss + currCss);
                //     parentNode.innerHTML = spans[i].innerHTML;
                // }
            }
        }
    }

    // var css = "";
    // $("span").each(function (i) {
    //   css += $(this).attr('style')+';';
    // });
    // $("span").children().unwrap('<span>');
    // $("span").attr('style', css);
};

const removeCssProperty = (
    targetContainer: HTMLElement,
    CssPropertyName: string,
    bSelfRemove = true,
) => {
    try {
        if (bSelfRemove) {
            targetContainer.style.removeProperty(CssPropertyName);
        }
        const spanElements = targetContainer.querySelectorAll(
            'span',
        ) as NodeListOf<HTMLElement>;
        if (spanElements.length > 0) {
            spanElements.forEach(elem => {
                elem.style.removeProperty(CssPropertyName);
                // $(elem).css({ CssPropertyName: '' });
            });
        }
    } catch (e) {
        console.log(e);
    }
};

export const execExtCommand = (
    execName: ETextEditorToolsName,
    execVal: string,
) => {
    console.log('execExtCommand: ', execName, execVal);

    if (
        execName !== ETextEditorToolsName.letterspacing &&
        execName !== ETextEditorToolsName.textshadow &&
        execName !== ETextEditorToolsName.textoutline
    )
        return;

    try {
        const objSelection = document.getSelection();
        if (objSelection === null) return;

        const objRange = objSelection.getRangeAt(0);
        if (objSelection.rangeCount > 1) return;

        const targetContainer = objRange.commonAncestorContainer as HTMLElement;
        if (targetContainer === null) return;

        let spanElement: any = null;
        let bIsParentElement = false;
        if (
            targetContainer.nodeType === Node.ELEMENT_NODE &&
            targetContainer.nodeName.toLowerCase() === 'span'
        ) {
            spanElement = targetContainer;
            bIsParentElement = true;
        } else {
            const rangeHTML = objRange.cloneContents();
            spanElement = document.createElement('span');
            spanElement.appendChild(rangeHTML);
            bIsParentElement = false;
        }

        if (execName === ETextEditorToolsName.letterspacing) {
            // spanElement.style.letterSpacing = execVal;
            $(spanElement).css({ 'letter-spacing': execVal });
            // spanElement 이하의 span 태그들의 letter-spacing 속성을 제거한다.
            removeCssProperty(spanElement, 'letter-spacing', false);
        } else if (execName === ETextEditorToolsName.textshadow) {
            // spanElement.style.textShadow = execVal;
            $(spanElement).css({ 'text-shadow': execVal });
            // spanElement 이하의 span 태그들의 text-shadow 속성을 제거한다.
            removeCssProperty(spanElement, 'text-shadow', false);
        } else if (execName === ETextEditorToolsName.textoutline) {
            // spanElement.style.WebkitTextStroke = execVal;
            $(spanElement).css({ '-webkit-text-stroke': execVal });
            // spanElement 이하의 span 태그들의 text-shadow 속성을 제거한다.
            removeCssProperty(spanElement, '-webkit-text-stroke', false);
            removeCssProperty(spanElement, '-webkit-text-stroke-width', false);
            removeCssProperty(spanElement, '-webkit-text-stroke-color', false);
        }

        spanElement.normalize();

        if (bIsParentElement !== true) {
            objRange.deleteContents();
            objRange.insertNode(spanElement);
        }
        // objRange.deleteContents();
        // objRange.insertNode(spanElement);
        objRange.selectNodeContents(spanElement);

        // objRange.collapse(false);
        objSelection.removeAllRanges();
        objSelection.addRange(objRange);

        // 툴바 상태 업데이트
        updateAllToolbarState();

        // 처리후에 dostack에 저장
        setTimeout(() => {
            const currObject = workInfo.getObject();
            if (currObject) {
                dostack.addUndoStack(currObject.id, EundoStackAddType.textbox);
            }
        }, 500);
    } catch (e) {
        console.log(e);
    }
};

export const execBasicCommand = (
    execName: ETextEditorToolsName,
    execVal: string | undefined = undefined,
) => {
    try {
        if (window.getSelection()) {
            // const selectRange = window.getSelection()?.getRangeAt(0) || null;

            const objSelection = document.getSelection();
            if (objSelection === null) return;

            const objRange = objSelection.getRangeAt(0);
            if (objSelection.rangeCount > 1) return;

            if (objRange) {
                console.log(
                    'execBasicCommand execName : ',
                    execName,
                    ', execVal : ',
                    execVal,
                );

                const currObject = workInfo.getObject();
                // 처리전에 dostack에 저장
                if (currObject) {
                    dostack.addUndoStack(
                        currObject.id,
                        EundoStackAddType.textbox,
                    );
                }

                if (execName === ETextEditorToolsName.fontfamily) {
                    execName = ETextEditorToolsName.fontname;
                }

                // li 내에 sytle 적용 전 체크
                // li 내 font style 처리하는경우 li 자체 font style 이 제거되므로 임시 저장
                const objAncestorNode =
                    objRange.commonAncestorContainer as HTMLElement;
                const selectedText = getSelectionTextValue(objRange);
                console.log('selectedText : ', selectedText);
                const liObj = getParentElement(objAncestorNode, 'li');
                let liStyle = null;
                if (liObj) {
                    liStyle = $(liObj).attr('style') || null;
                }

                // window.getSelection()?.removeAllRanges();
                // window.getSelection()?.addRange(objRange);

                document.execCommand(execName, false, execVal);

                // // li 내에 sytle 적용 후 처리  (이전에 저장한것 원복)
                if (liObj) {
                    console.log(
                        'selectedText liObj.innerText : ',
                        liObj.innerText,
                    );
                    // li 내용 전체를 선택한 경우 execCommand 적용 이후 li 자체에 스타일 적용
                    if (liObj.innerText === selectedText) {
                        if (execVal !== undefined) {
                            // if(execName === ETextEditorToolsName.fontsize) {
                            //     liObj.style.fontSize = execVal;
                            // } else if(execName === ETextEditorToolsName.forecolor) {
                            //     liObj.style.color = execVal;
                            // }
                            setParagraphStyle(execName, execVal);
                        }

                        // li 내용 일부 선택한 경우 execCommand 적용 이전 li style 값을 execCommand 적용 이후 다시 적용
                    } else {
                        if (liStyle) {
                            $(liObj).attr('style', liStyle);
                        }
                    }
                }

                // 스타일 보정 (font tag -> span tag)
                if (execVal !== undefined) {
                    updateValidStyle(execName, execVal);
                }

                // ol/ul 실행 시 최상위노드 업데이트
                if (
                    execName === ETextEditorToolsName.insertorderedlist ||
                    execName === ETextEditorToolsName.insertunorderedlist
                ) {
                    convRootExtNodes();
                }

                updateAllToolbarState();

                // 처리후에 dostack에 저장
                setTimeout(() => {
                    if (currObject) {
                        dostack.addUndoStack(
                            currObject.id,
                            EundoStackAddType.textbox,
                        );
                    }
                }, 500);
            }
        }
    } catch (e) {
        console.log(e);
    }
};

// -- textbox 내부 최상위 노드 정리
const convRootExtNodes = () => {
    const textBox = getTextBoxObj();
    if (!textBox) return;

    const textBoxText = textBox.innerText.trim();

    // 텍스트박스 내에 텍스트가 없으면 텍스트박스 제거
    if (textBoxText === '') {
        textBox.parentNode?.removeChild(textBox);
        return;
    }

    if (textBox && textBox.childNodes.length) {
        // -- textbox 내부 최상위 노드에 div, span 노드가 생길경우 p 로 변환처리, br 제거
        //$('.object .textbox > div, .object .textbox > span, .object .textbox > br').each( function( index, elem)  {
        //$('.object .textbox').children().each( function( index, elem)  {
        for (let i = textBox.childNodes.length - 1; i > -1; i--) {
            const elem = textBox.childNodes[i] as HTMLElement;

            const currNodeType = elem.nodeType;
            const currNodeName = elem.nodeName.toLowerCase();

            // 빈 노드 제거
            if (currNodeType === 1 && elem.childNodes.length === 0) {
                textBox.removeChild(elem);
                continue;
            }

            // 정상 최상위 노드는 건너띔
            if (
                currNodeName === 'p' ||
                currNodeName === 'ol' ||
                currNodeName === 'ul' ||
                currNodeName === 'table' ||
                currNodeName === 'hr' ||
                currNodeName === 'h1' ||
                currNodeName === 'h2' ||
                currNodeName === 'h3' ||
                currNodeName === 'h4' ||
                currNodeName === 'h5' ||
                currNodeName === 'h6'
            ) {
                continue;
            }

            console.log(
                'convRootExtNodes currNodeName currNodeType : ',
                currNodeName,
                currNodeType,
            );

            // textnode 이거나, span, img 면 새 p 노드 내부로 노드전체를 이동후 그 자리에 p 노드 위치
            if (
                currNodeType === 3 ||
                currNodeName === 'span' ||
                currNodeName === 'img'
            ) {
                const pNode = document.createElement('p');
                if (elem.nextSibling) {
                    textBox.insertBefore(pNode, elem.nextSibling);
                } else {
                    textBox.appendChild(pNode);
                }
                pNode.appendChild(elem);

                // div 이면 새 p 노드 내부로 div 내부 앨리먼트만 옮긴 후 div자리에 p 노드 삽입 하고 div 제거
            } else if (currNodeName === 'div') {
                const pNode = document.createElement('p');
                while (elem.firstChild) {
                    pNode.appendChild(elem.firstChild);
                }
                if (!pNode.firstChild) {
                    pNode.innerHTML = '<br>';
                }

                if (elem.nextSibling) {
                    textBox.insertBefore(pNode, elem.nextSibling);
                } else {
                    textBox.appendChild(pNode);
                }
                textBox.removeChild(elem);

                // 기타 노드는 모두 제거
            } else {
                textBox.removeChild(elem);
            }
        }

        // span merge
        removeEmptySpans(textBox);
    }
};

const updateValidStyle = (
    execName: ETextEditorToolsName | undefined = undefined,
    execVal: string | undefined = undefined,
) => {
    const textBox = getTextBoxObj();
    if (textBox) {
        // p 내부에 추가되는 ol/ul 목록을 밖으로 옮긴다.
        if (
            execName === ETextEditorToolsName.insertorderedlist ||
            execName === ETextEditorToolsName.insertunorderedlist
        ) {
            $('.object .textbox > p > ul, .object .textbox > p > ol').each(
                function (index, elem) {
                    if (elem.parentNode) {
                        if (elem.parentNode.nextSibling) {
                            elem.parentNode.parentNode?.insertBefore(
                                elem,
                                elem.parentNode.nextSibling,
                            );
                        } else {
                            elem.parentNode.parentNode?.appendChild(elem);
                        }
                    }
                },
            );
            return;
        }

        if (execName !== undefined && execVal !== undefined) {
            // 현재 셀렉션영역 범위 마킹 삽입
            markSelectRange();

            // font 태그 내부 속성을 style 로 변환한다.
            $('.object .textbox font').each(function () {
                // fontsize
                if (execName === ETextEditorToolsName.fontsize) {
                    if ($(this).attr('size')) {
                        $(this).removeAttr('size');
                        $(this).css('font-size', execVal);
                    }
                }
                // font-family
                if (
                    execName === ETextEditorToolsName.fontfamily ||
                    execName === ETextEditorToolsName.fontname
                ) {
                    if ($(this).attr('face')) {
                        $(this).removeAttr('face');
                        $(this).css('font-family', execVal);
                    }
                }
                // font-color
                if (execName === ETextEditorToolsName.forecolor) {
                    if ($(this).attr('color')) {
                        $(this).removeAttr('color');
                        $(this).css('color', execVal);
                    }
                }
            });

            // font 태그를 span 태그로 변환한다.
            textBox.innerHTML = textBox.innerHTML
                .replace(/<font/gi, '<span')
                .replace(/\/font>/gi, '/span>');

            // 현재 셀렉션영역 범위 마킹 복원
            recoverSelectRange();
        }
    }
};

//--줄간격 조절은 문단에 대해서만 적용(P)
export const setParagraphStyle = (
    execName: ETextEditorToolsName,
    execVal: string,
) => {
    try {
        // const heightVal = (height/100).toFixed(2);

        const currObject = workInfo.getObject();

        const objSelection = document.getSelection();
        if (objSelection === null) return;

        const objRange = objSelection.getRangeAt(0);
        if (objSelection.rangeCount > 1) return;

        // const objAncestorNode = objRange.commonAncestorContainer as HTMLElement;
        const objStartContainer = objRange.startContainer as HTMLElement;
        const objEndContainer = objRange.endContainer as HTMLElement;

        //---- caret만 있는경우 부모p,li 노드에 적용하고 끝낸다.
        //if(3 == objAncestorNode.nodeType)

        console.log(
            'setParagraphStyle objRange.collapsed :',
            objRange.collapsed,
        );

        if (objRange.collapsed) {
            // let targetNode: HTMLElement | null = null;
            // const pNode = getParentElement(objStartContainer, "p");
            // const liNode =getParentElement(objStartContainer, "li");
            // if(pNode) {
            //     targetNode = pNode;
            // } else if(liNode) {
            //     targetNode = liNode;
            // }
            const targetNode: HTMLElement | null = getParentElement(
                objStartContainer,
                'li,p',
            );
            if (targetNode) {
                // 처리전에 dostack에 저장
                if (currObject) {
                    dostack.addUndoStack(
                        currObject.id,
                        EundoStackAddType.textbox,
                    );
                }

                if (execName === ETextEditorToolsName.lineheight) {
                    targetNode.style.lineHeight = execVal;
                } else if (execName === ETextEditorToolsName.fontsize) {
                    targetNode.style.fontSize = execVal;
                } else if (execName === ETextEditorToolsName.letterspacing) {
                    targetNode.style.letterSpacing = execVal;
                } else if (execName === ETextEditorToolsName.forecolor) {
                    targetNode.style.color = execVal;
                } else if (
                    execName === ETextEditorToolsName.fontfamily ||
                    execName === ETextEditorToolsName.fontname
                ) {
                    targetNode.style.fontFamily = execVal;
                } else if (
                    execName === ETextEditorToolsName.left ||
                    execName === ETextEditorToolsName.center ||
                    execName === ETextEditorToolsName.right ||
                    execName === ETextEditorToolsName.justify
                ) {
                    targetNode.style.textAlign = execVal;
                } else if (execName === ETextEditorToolsName.indent) {
                    $(targetNode).css(
                        'marginLeft',
                        `+=${basicData.inoutdentPx}`,
                    );
                } else if (execName === ETextEditorToolsName.outdent) {
                    $(targetNode).css(
                        'marginLeft',
                        `-=${basicData.inoutdentPx}`,
                    );
                }
            } else {
                return;
            }
            updateAllToolbarState();

            // 처리후에 dostack에 저장
            setTimeout(() => {
                if (currObject) {
                    dostack.addUndoStack(
                        currObject.id,
                        EundoStackAddType.textbox,
                    );
                }
            }, 500);

            return;
        }

        // 처리전에 dostack에 저장
        if (currObject) {
            dostack.addUndoStack(currObject.id, EundoStackAddType.textbox);
        }

        // 1. p node 처리
        const startPNode = getParentElement(objStartContainer, 'li,p');
        const endPNode = getParentElement(objEndContainer, 'li,p');
        let cnt = 0;
        let currNode = startPNode;
        while (currNode) {
            cnt++;
            if (cnt > 1000) break;

            //if(currNode.nodeName.toLowerCase() == 'p') {
            if (execName === ETextEditorToolsName.lineheight) {
                currNode.style.lineHeight = execVal;
            } else if (execName === ETextEditorToolsName.fontsize) {
                currNode.style.fontSize = execVal;
            } else if (execName === ETextEditorToolsName.letterspacing) {
                currNode.style.letterSpacing = execVal;
            } else if (execName === ETextEditorToolsName.forecolor) {
                currNode.style.color = execVal;
            } else if (
                execName === ETextEditorToolsName.fontfamily ||
                execName === ETextEditorToolsName.fontname
            ) {
                currNode.style.fontFamily = execVal;
            } else if (
                execName === ETextEditorToolsName.left ||
                execName === ETextEditorToolsName.center ||
                execName === ETextEditorToolsName.right ||
                execName === ETextEditorToolsName.justify
            ) {
                currNode.style.textAlign = execVal;
            } else if (execName === ETextEditorToolsName.indent) {
                $(currNode).css('marginLeft', `+=${basicData.inoutdentPx}`);
            } else if (execName === ETextEditorToolsName.outdent) {
                $(currNode).css('marginLeft', `-=${basicData.inoutdentPx}`);
            }
            //}
            if (currNode === endPNode) {
                break;
            }
            currNode = currNode.nextSibling as HTMLElement;
        }

        // 2. li node 처리
        // const startLiNode = getParentElement(objStartContainer, "li");
        // const endLiNode = getParentElement(objEndContainer, "li");
        // cnt = 0;
        // currNode = startLiNode;
        // while(currNode) {
        //     cnt++;
        //     if(cnt > 1000) break;

        //     if(currNode.nodeName.toLowerCase() == 'li') {
        //         if(execName === ETextEditorToolsName.lineheight) {
        //             currNode.style.lineHeight = execVal;
        //         } else if(execName === ETextEditorToolsName.left || execName === ETextEditorToolsName.center || execName === ETextEditorToolsName.right || execName === ETextEditorToolsName.justify) {
        //             currNode.style.textAlign = execVal;
        //         } else if(execName === ETextEditorToolsName.indent) {
        //             $(currNode).css('marginLeft', `+=${basicData.inoutdentPx}`);
        //         } else if(execName === ETextEditorToolsName.outdent) {
        //             $(currNode).css('marginLeft', `-=${basicData.inoutdentPx}`);
        //         }
        //     }
        //     if(currNode === endLiNode) {
        //         break;
        //     }
        //     currNode = currNode.nextSibling as HTMLElement;
        // }

        updateAllToolbarState();

        // 처리후에 dostack에 저장
        setTimeout(() => {
            if (currObject) {
                dostack.addUndoStack(currObject.id, EundoStackAddType.textbox);
            }
        }, 500);
    } catch (e) {
        console.log(e);
    }
};

export const setLetterSpacing = (spacing = 0) => {
    // const heightVal = (height / 100).toFixed(2);
    setParagraphStyle(ETextEditorToolsName.letterspacing, spacing + 'px');
};
export const setLineHeight = (height: number) => {
    const heightVal = (height / 100).toFixed(2);
    setParagraphStyle(ETextEditorToolsName.lineheight, heightVal);
};
export const setTextAlign = (
    unitName:
        | ETextEditorToolsName.left
        | ETextEditorToolsName.center
        | ETextEditorToolsName.right
        | ETextEditorToolsName.justify,
) => {
    setParagraphStyle(unitName, unitName);
};
export const setInOutdent = (
    unitName: ETextEditorToolsName.indent | ETextEditorToolsName.outdent,
) => {
    setParagraphStyle(unitName, '');
};
export const getSelectionTextValue = (objRange: Range | null) => {
    let strTextValue = '';
    try {
        if (objRange === null) {
            const objSelection = document.getSelection();
            if (objSelection === null) return '';
            objRange = objSelection.getRangeAt(0);
            if (objSelection.rangeCount > 1) return '';
        }

        const objStartContainer = objRange.startContainer;
        console.log('selectedText nodeType : ', objStartContainer.nodeType);
        //if(objStartContainer.nodeType == 3) {
        strTextValue = objRange.toString();
        //}
        return strTextValue;
    } catch (e) {
        console.log(e);
    }
    return '';
};

/** textbox */
export const setTextBoxValign = (execName: ETextEditorToolsName) => {
    const textBox = getTextBoxObj();
    if (textBox) {
        if ($(textBox).hasClass('middle')) {
            $(textBox).removeClass('middle');
        }
        if ($(textBox).hasClass('bottom')) {
            $(textBox).removeClass('bottom');
        }
        if (execName !== 'top') {
            $(textBox).addClass(execName);
        }
        updateTextBoxValignState();
    }
};

export const updateTextBoxValignState = () => {
    const textBox = getTextBoxObj();
    if (textBox) {
        // box style
        const valignList = [
            ETextEditorToolsName.top,
            ETextEditorToolsName.middle,
            ETextEditorToolsName.bottom,
        ];
        let textBoxValign = 'top';
        if ($(textBox).hasClass('middle')) {
            textBoxValign = 'middle';
        } else if ($(textBox).hasClass('bottom')) {
            textBoxValign = 'bottom';
        }
        for (let i = 0; i < valignList.length; i++) {
            const toolbarObj = document.getElementById(
                getToolbarId(valignList[i]),
            ) as HTMLDivElement;
            if (valignList[i] === textBoxValign) {
                $(toolbarObj).addClass('active');
            } else {
                $(toolbarObj).removeClass('active');
            }
        }
    }
};

export const updateTextBoxPaddingState = () => {
    const textBox = getTextBoxObj();
    if (textBox) {
        const paddingVal = getTextBoxPadding(textBox).toFixed(0);
        //const paddingPxStr = `${paddingPx}px`;
        //$(textBox).css('padding', paddingPxStr);

        console.log('updateTextBoxPaddingState : paddingVal : ', paddingVal);

        const paddingId = getToolbarId(ETextEditorToolsName.padding);
        $(`#${paddingId} .list-container .list`).each(
            (index: number, elem: HTMLElement) => {
                if ($(elem).attr('dataval') === paddingVal) {
                    $(elem).addClass('active');
                } else {
                    $(elem).removeClass('active');
                }
            },
        );
    }
};

export const getTextBoxPadding = (textboxObj: HTMLDivElement | null) => {
    const textBox = textboxObj ? textboxObj : getTextBoxObj();
    if (textBox) {
        const padding = $(textBox).css('padding');
        return parseInt(padding.replace(/px/, ''), 10);
    }
    return 0;
};

export const setPadding = (paddingVal: number) => {
    const textBox = getTextBoxObj();
    if (textBox) {
        $(textBox).css('padding', paddingVal);
        updateTextBoxPaddingState();
    }
};

export const insertChar = (char: string) => {
    // const textNode = document.createTextNode(char);
    // insertCoreHTMLCode(null, textNode);
    insertCoreHTMLCode(char, null);
};

export const getDynamicTextEditorTools = (): ITextEditorToolsInfo[][] => {
    const LANGSET = userInfo.getLangSet();
    return [
        [
            {
                type: ETextEditorToolsType.combobox,
                execName: ETextEditorToolsName.fontfamily,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.FONTFACE,
            },
            {
                type: ETextEditorToolsType.dropdowninput,
                execName: ETextEditorToolsName.fontsize,
                unit: ETextEditorToolsUnit.pixcel,
                title: LANGSET.TEXTEDITOR.FONTSIZE,
            },
            {
                type: ETextEditorToolsType.dropdowninput,
                execName: ETextEditorToolsName.letterspacing,
                unit: ETextEditorToolsUnit.pixcel,
                title: LANGSET.TEXTEDITOR.LETTERSPACING,
            },
            {
                type: ETextEditorToolsType.separator,
                execName: ETextEditorToolsName.none,
                unit: ETextEditorToolsUnit.none,
                title: '',
            },
            {
                type: ETextEditorToolsType.dropdown,
                execName: ETextEditorToolsName.lineheight,
                unit: ETextEditorToolsUnit.percent,
                title: LANGSET.TEXTEDITOR.LINEHEIGHT,
            },
        ],
        [
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.left,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.LEFT,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.center,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.CENTER,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.right,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.RIGHT,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.justify,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.JUSTIFY,
            },
            // {
            //     type: ETextEditorToolsType.separator,
            //     execName: ETextEditorToolsName.none,
            //     unit: ETextEditorToolsUnit.none,
            //     title: '',
            // },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.top,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.TOP,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.middle,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.MIDDLE,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.bottom,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.BOTTOM,
            },
            // {
            //     type: ETextEditorToolsType.separator,
            //     execName: ETextEditorToolsName.none,
            //     unit: ETextEditorToolsUnit.none,
            //     title: '',
            // },
            {
                type: ETextEditorToolsType.dropdown,
                execName: ETextEditorToolsName.padding,
                unit: ETextEditorToolsUnit.pixcel,
                title: LANGSET.TEXTEDITOR.PADDING,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.indent,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.INDENT,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.outdent,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.OUTDENT,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.insertunorderedlist,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.UNORDEREDLIST,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.insertorderedlist,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.ORDEREDLIST,
            },
        ],
        [
            {
                type: ETextEditorToolsType.color,
                execName: ETextEditorToolsName.forecolor,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.FORECOLOR,
            },
            {
                type: ETextEditorToolsType.color,
                execName: ETextEditorToolsName.backcolor,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.BACKCOLOR,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.bold,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.BOLD,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.italic,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.ITALIC,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.underline,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.UNDERLINE,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.strikethrough,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.STRIKETHROUGH,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.superscript,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.SUPERSCRIPT,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.subscript,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.SUBSCRIPT,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.spacialchars,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.SPECIALCHARS,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.textshadow,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.TEXTSHADOW,
            },
            {
                type: ETextEditorToolsType.button,
                execName: ETextEditorToolsName.textoutline,
                unit: ETextEditorToolsUnit.none,
                title: LANGSET.TEXTEDITOR.TEXTOUTLINE,
            },
        ],
    ];
};

import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import * as DataStore from '../../store/DataStore';
import $ from 'jquery';
import { allEventCancel, cancelBubble, parseJsonData } from '../../util/common';
import { ISpecialChars_Info, EkeyName, EobjectType } from '../../const/types';
import { getSpecialCharsList } from '../../const/specialchars';
import { insertChar } from '../../util/texteditor';
import { getKeyCode } from '../../event/KeyEvent';
import { showToastMessage } from '../../util/dialog';
import { createNewObject } from '../../util/objects';
import { createTextBox } from '../../util/texteditor';
import { getCanvasObject } from '../../util/pages';
import {
    selectSquareObjct,
    unselectSquareObjcts,
    addSelectorEvent,
} from '../../event/SquareEvent';

const PdfTextList = observer(() => {
    const { userInfo, workInfo } = store;
    // const [userId, setUserId] = useState('');
    // const [userLang, setUserLang] = useState<EuserLang>(userInfo.getLang());
    const LANGSET = userInfo.getLangSet();
    const showPdfTextList = workInfo.getShowPdfTextList();
    const pdfTextUrl = workInfo.getPdfTextUrl();

    const [list, setList] = useState<any[]>([]);
    const [listIndex, setListIndex] = useState<number>(0);

    useEffect(() => {
        getPdfTextData();

        window.addEventListener('keydown', setKeydownEvent);
        return () => {
            window.removeEventListener('keydown', setKeydownEvent);
        };
    }, []);

    const getPdfTextData = async () => {
        const data = await DataStore.getPdfTextInfo(pdfTextUrl);
        console.log(data);
        setList(data);
    };

    const setKeydownEvent = useCallback((e: KeyboardEvent) => {
        const currKeyCode = getKeyCode(e);
        if (currKeyCode === EkeyName.ESC) {
            closePop();
            allEventCancel(e);
        }
    }, []);

    const closePop = () => {
        workInfo.setShowPdfTextList(false);
    };

    const setPageIndex = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const index = event.target.selectedIndex;
        setListIndex(index);
    };

    const selectText = (event: React.MouseEvent<HTMLLIElement>) => {
        const target = event.currentTarget as HTMLLIElement;
        target.classList.toggle('active');
    };

    const copyText = (
        text: string,
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        // clipboard.writeText(text);
        // copy text to clipboard
        navigator.clipboard.writeText(text).then(
            function () {
                showToastMessage('복사되었습니다.', 0.5);
            },
            function (err) {
                console.error('Async: Could not copy text: ', err);
            },
        );
        cancelBubble(event);
    };

    const getTextFromTextObjBox = (textObjLi: HTMLLIElement) => {
        const textInfo = parseJsonData(textObjLi.getAttribute('text-info'));
        if (textInfo === null) return '';
        console.log(textInfo);
        // 탭, 개행문자, 2개이상의 연속 공백 제거

        const orgTextString: string = textInfo.text || '';
        return orgTextString.replace(/\\n\\r\\t/g, ' ').replace(/[\s]+/g, ' ');
    };

    const insertSelectedItemText = (item: HTMLLIElement, index = 0) => {
        // text 가져오기
        // const textInfo = parseJsonData(item.getAttribute('text-info'));
        // if (textInfo === null) return null;
        // console.log(textInfo);

        // // 탭, 개행문자, 2개이상의 연속 공백 제거
        // const text = textInfo.text
        //     .replace(/\\n\\r\\t/g, ' ')
        //     .replace(/[\s]+/g, ' ');

        const text = getTextFromTextObjBox(item);

        // 답 텍스트 오브젝트 생성
        const squareObj = createNewObject(EobjectType.square) as HTMLDivElement;

        // 텍스트 박스 생성
        const textBox = createTextBox(text);
        squareObj.appendChild(textBox);

        // 가로 사이즈 지정
        // let width = Math.ceil(textInfo.width || 250);
        // if (width < 40) width = 40;
        // if (width > 400) width = 400;
        // const width = 250;

        // 캔버스의 중앙에 위치하도록 설정
        const canvasObject = getCanvasObject();
        const canvasWidth = canvasObject.offsetWidth;
        const canvasHeight = canvasObject.offsetHeight;
        const squareHeight = 50;
        const squareWidth = 250;

        // 여러개 생성시 위치 조정 단위 (가로, 세로)
        const moveSize = 10;

        squareObj.style.top = `${
            (canvasHeight - squareHeight) / 2 + index * moveSize
        }px`;
        squareObj.style.left = `${
            (canvasWidth - squareWidth) / 2 + index * moveSize
        }px`;

        // squareObj.style.height = `${squareHeight}px`;
        // squareObj.style.backgroundColor = '#f2f2f2';

        // -- box width를 text width에 맞추기
        squareObj.style.width = `fit-content`;
        squareObj.style.height = `fit-content`;
        setTimeout(() => {
            // 가로
            let boxWidth = Math.ceil(squareObj.getBoundingClientRect().width);
            if (boxWidth < 40) boxWidth = 40;
            if (boxWidth > 400) boxWidth = 400;
            squareObj.style.width = `${boxWidth}px`;

            // 세로
            let boxHeight = Math.ceil(squareObj.getBoundingClientRect().height);
            if (boxHeight < 40) boxHeight = 40;
            if (boxHeight > 400) boxHeight = 400;
            squareObj.style.height = `${boxHeight}px`;
        }, 0);
        workInfo.addObjectList(squareObj);
        return squareObj;
    };

    const insertTextBox = (event: React.MouseEvent<HTMLLIElement>) => {
        unselectSquareObjcts();

        const target = event.currentTarget as HTMLLIElement;
        const squareObj = insertSelectedItemText(target, 0);
        if (squareObj === null) return;

        setTimeout(() => {
            selectSquareObjct(squareObj);
            addSelectorEvent();
        }, 500);

        closePop();
    };

    const insertSelectedTexts = () => {
        unselectSquareObjcts();
        const selectedList = document.querySelectorAll(
            '.pdf-text-container .text-list-box li.text-list-item.active',
        ) as NodeListOf<HTMLLIElement>;
        const cnt = selectedList.length;
        if (cnt === 0) {
            showToastMessage('선택된 항목이 없습니다.', 1);
            return;
        }

        const bConcatText = (
            document.querySelector('#concat_text') as HTMLInputElement
        ).checked;
        let index = -1;
        let insertedObj: any = null;

        // text 하나로 합쳐서 하나의 박스 생성
        if (bConcatText) {
            const textList: string[] = [];

            for (const item of selectedList) {
                const unitText = getTextFromTextObjBox(item);
                if (unitText === '') continue;
                textList.push(unitText);
            }
            const textString = textList.join('<br />');
            console.log('textString: ', textString);

            const cancatItem = document.createElement('li');
            cancatItem.setAttribute(
                'text-info',
                JSON.stringify({ text: textString }),
            );

            const squareObj = insertSelectedItemText(cancatItem);
            // cancatItem.remove();

            if (squareObj) insertedObj = squareObj;

            // text 하나씩 박스 생성
        } else {
            for (const item of selectedList) {
                index++;
                const squareObj = insertSelectedItemText(item, index);
                if (squareObj === null) continue;
                insertedObj = squareObj;
            }
        }

        // 마지막 오브젝트만 선택하고 이벤트 추가
        if (insertedObj !== null) {
            setTimeout(() => {
                selectSquareObjct(insertedObj);
                addSelectorEvent();
            }, 500);
        }

        closePop();
    };

    if (showPdfTextList === false) return null;

    return (
        <>
            <div className="common-popup-container-dim" onClick={closePop}>
                <div className="pdf-text-container" onClick={cancelBubble}>
                    <button className="btn-close" onClick={closePop}></button>
                    <div className="title">PdfTextList</div>

                    <div className="simple-line-box">
                        <select onChange={setPageIndex} value={listIndex}>
                            {list.map((pageData, pageIndex) => {
                                return (
                                    <option
                                        key={`page_${pageIndex}`}
                                        value={pageIndex}
                                    >
                                        {pageIndex + 1} page
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="text-list-box">
                        <ol>
                            {list.length > 0 &&
                                list[listIndex].map(
                                    (listText: any, index: number) => {
                                        return (
                                            <li
                                                className={`text-list-item ${
                                                    listText.text.trim() === ''
                                                        ? 'hide'
                                                        : ''
                                                }`}
                                                key={`text_${index}`}
                                                onClick={selectText}
                                                onDoubleClick={insertTextBox}
                                                {...{
                                                    'text-info':
                                                        JSON.stringify(
                                                            listText,
                                                        ),
                                                }}
                                            >
                                                {listText.text}
                                                <button
                                                    className="btn-copy"
                                                    title="copy text"
                                                    onClick={e =>
                                                        copyText(
                                                            listText.text,
                                                            e,
                                                        )
                                                    }
                                                ></button>
                                            </li>
                                        );
                                    },
                                )}
                        </ol>
                    </div>

                    <div className="simple-line-box center">
                        <input type="checkbox" id="concat_text" />
                        <label htmlFor="concat_text">
                            선택한 항목을 하나의 박스로 삽입
                        </label>
                    </div>

                    <div className="common-popup-foot">
                        <button
                            type="button"
                            className="btn-default-action"
                            onClick={insertSelectedTexts}
                        >
                            Add Text
                        </button>

                        <button
                            type="button"
                            className="btn-default-action"
                            onClick={closePop}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
});

export default PdfTextList;

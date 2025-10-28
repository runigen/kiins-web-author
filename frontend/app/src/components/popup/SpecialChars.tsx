import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import * as DataStore from '../../store/DataStore';
// import $ from 'jquery';
import { allEventCancel, cancelBubble } from '../../util/common';
import { ISpecialChars_Info, EkeyName } from '../../const/types';
import { getSpecialCharsList } from '../../const/specialchars';
import { insertChar } from '../../util/texteditor';
import { getKeyCode } from '../../event/KeyEvent';

let SEL: any = null;
let RANGE: any = null;
const SpecialChars = observer(() => {
    const { userInfo, workInfo } = store;
    // const [userId, setUserId] = useState('');
    // const [userLang, setUserLang] = useState<EuserLang>(userInfo.getLang());
    const LANGSET = userInfo.getLangSet();
    const [list, setList] = useState<ISpecialChars_Info[]>(
        getSpecialCharsList(),
    );
    const [listIndex, setListIndex] = useState<number>(0);
    const [historyList, setHistoryList] = useState<string[]>([]);

    const showSpecialChars = workInfo.getShowSpecialChars();

    useEffect(() => {
        setList(getSpecialCharsList());
        const historyCharObj = DataStore.getSpecialCharsHistoryList();
        setHistoryList(historyCharObj.list);
        setListIndex(historyCharObj.category);
        saveOrgSelection();

        window.addEventListener('keydown', setKeydownEvent);
        return () => {
            window.removeEventListener('keydown', setKeydownEvent);
        };
    }, []);

    const setKeydownEvent = useCallback((e: KeyboardEvent) => {
        const currKeyCode = getKeyCode(e);
        if (currKeyCode === EkeyName.ESC) {
            closePop();
            allEventCancel(e);
        }
    }, []);

    const changeIndex = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const index = event.target.selectedIndex;
        setListIndex(index);
        DataStore.setSpecialCharsCategoryHistory(index);
    };

    const closePop = () => {
        initOrgSelection();
        workInfo.setShowSpecialChars(false);
    };

    const zoomChar = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const char = target.innerText;
        console.log('zoomChar', char);

        const zoomBox = document.querySelector(
            '.char-zoom-box',
        ) as HTMLDivElement;
        if (!zoomBox) return;
        zoomBox.innerText = char;
    };

    const addChar = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const char = target.innerText;
        console.log('addChar', char);
        const inputObj = document.querySelector(
            '.char-input-box input',
        ) as HTMLInputElement;
        if (!inputObj) return;
        inputObj.value += char;
        cancelBubble(e);
    };

    const insertCharToEditor = (char: string) => {
        restoreOrgSelection();
        insertChar(char);
        const charLen = char.length;
        for (let i = 0; i < charLen; i++) {
            DataStore.addSpecialCharsHistory(char[i].trim());
        }
    };
    const evtDblClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const char = target.innerText;
        console.log('evtDblClick', char);
        insertCharToEditor(char);
        closePop();
        cancelBubble(e);
    };
    const insertSelectedChars = () => {
        console.log('insertSpecialChar');
        const inputObj = document.querySelector(
            '.char-input-box input',
        ) as HTMLInputElement;
        if (!inputObj) return;
        const char = inputObj.value;
        if (char === '') {
            closePop();
        } else {
            insertCharToEditor(char);
            closePop();
        }
    };

    // 기존 셀렉션 저장
    const saveOrgSelection = () => {
        SEL = window.getSelection();
        if (SEL && SEL.rangeCount > 0) {
            RANGE = SEL.getRangeAt(0);
        }
    };
    // 저장된 셀렉션 정보를 이용해 기존 셀렉션 복원
    const restoreOrgSelection = () => {
        if (RANGE) {
            const currSelection = window.getSelection();
            if (currSelection) {
                currSelection.removeAllRanges();
                currSelection.addRange(RANGE);
            }
        }
    };
    // 셀렉션 초기화
    const initOrgSelection = () => {
        SEL = null;
        RANGE = null;
    };

    if (showSpecialChars === false) return null;

    return (
        <>
            <div className="common-popup-container-dim" onClick={closePop}>
                <div className="specialchars-container" onClick={cancelBubble}>
                    <button className="btn-close" onClick={closePop}></button>
                    <div className="specialchars-title">
                        {LANGSET.TEXTEDITOR.SPECIALCHARS}
                    </div>
                    <div className="specialchars-category">
                        <select onChange={changeIndex} value={listIndex}>
                            {list.map((item, index) => {
                                return (
                                    <option key={index} value={index}>
                                        {item.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="specialchars-body">
                        <div className="char-list-box">
                            {list[listIndex].content.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="char-list-item"
                                        onMouseDown={allEventCancel}
                                        onMouseOver={zoomChar}
                                        onClick={addChar}
                                        onDoubleClick={evtDblClick}
                                    >
                                        {item}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="char-input-container">
                            <div className="char-zoom-box"></div>

                            <div className="char-input-title">
                                {
                                    LANGSET.TEXTEDITOR.SPECIALCHARS_LIST
                                        .SELECT_CHAR
                                }{' '}
                                :
                            </div>
                            <div className="char-input-box">
                                <input type="text" />
                            </div>

                            <div className="char-input-title">
                                {
                                    LANGSET.TEXTEDITOR.SPECIALCHARS_LIST
                                        .RECECT_CHAR
                                }{' '}
                                :
                            </div>
                            <div className="char-history-box">
                                {historyList.map((item, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="char-history-item"
                                            onMouseDown={allEventCancel}
                                            onMouseOver={zoomChar}
                                            onClick={addChar}
                                            onDoubleClick={evtDblClick}
                                        >
                                            {item}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="common-popup-foot">
                        <button
                            type="button"
                            className="btn-default-action"
                            onClick={insertSelectedChars}
                        >
                            Ok
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

export default SpecialChars;

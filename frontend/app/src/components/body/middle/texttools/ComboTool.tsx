import React, { useEffect, useState } from 'react';
// import store from '../../../../store';
import $ from 'jquery';
import {
    fontFamilyList,
    fontSizeList,
    lineHeightList,
} from '../../../../const/basicData';
import {
    ETextEditorToolsName,
    ETextEditorToolsUnit,
    ITextToolsProps,
} from '../../../../const/types';
import { allEventCancel, cancelBubble } from '../../../../util/common';
import * as texteditor from '../../../../util/texteditor';
import * as DataStore from '../../../../store/DataStore';

// 1. combo tool (현재 폰트 목록에만 사용되고 있음.)
const ComboTool = ({ refToolsInfo }: ITextToolsProps) => {
    // const { userInfo, docData, workInfo } = store;

    const [dataList, setDataList] = useState<number[] | string[]>([]);
    const [historyFontList, setHistoryFontList] = useState<string[]>([]);

    useEffect(() => {
        setComboBoxData(refToolsInfo.execName);
    }, []);

    const setComboBoxData = (execName: ETextEditorToolsName) => {
        if (execName === ETextEditorToolsName.fontsize) {
            setDataList(fontSizeList);
        } else if (execName === ETextEditorToolsName.fontfamily) {
            // 폰트 목록에 사용자가 사용했던 히스토리 폰트가  있으면 추가한다.
            // const fontHistoryList = DataStore.getFontHistoryList();
            // if (fontHistoryList.length > 0) {
            //     fontHistoryList.push(''); // 빈값 추가( 경계선 추가용)
            // }
            setDataList(fontFamilyList);
        } else if (execName === ETextEditorToolsName.lineheight) {
            setDataList(lineHeightList);
        }
    };

    const showComboBox = (event: React.MouseEvent<HTMLDivElement>) => {
        const toolbarObj = event.currentTarget;
        if (toolbarObj) {
            const comboList = toolbarObj.lastChild as HTMLDivElement;

            if ($(comboList).hasClass('active')) {
                $(comboList).removeClass('active');
            } else {
                // show 할때 히스토리를 불러온다.
                const storeFontHistoryList = DataStore.getFontHistoryList();
                if (storeFontHistoryList.length > 0) {
                    storeFontHistoryList.push(''); // 빈값 추가( 경계선 추가용)
                }
                setHistoryFontList(storeFontHistoryList);

                texteditor.closeAllCtlBoxList();
                $(comboList).addClass('active');
            }
        }
        cancelBubble(event);
    };

    const setVal = (
        dataVal: string | number,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        console.log('dataVal : ', refToolsInfo.execName, dataVal);
        // const currObject = workInfo.getObject();

        // 처리전에 저장
        // if(currObject) {
        //     dostack.addUndoStack(currObject.id, EundoStackAddType.textbox);
        // }

        const currVal = String(dataVal) + refToolsInfo.unit;

        if (refToolsInfo.execName === ETextEditorToolsName.lineheight) {
            texteditor.setLineHeight(Number(dataVal));
        } else {
            texteditor.execBasicCommand(refToolsInfo.execName, currVal);
        }

        // 드롭다운 닫기
        const listObj = event.currentTarget;
        if (listObj) {
            const comboList = listObj.parentNode as HTMLDivElement;
            if (comboList) {
                $(comboList).removeClass('active');
            }
        }

        // 폰트 변경시 폰트 히스토리 저장
        if (refToolsInfo.execName === ETextEditorToolsName.fontfamily) {
            DataStore.addFontHistory(String(dataVal));
        }
        // 처리후에 저장
        // setTimeout(()=>{
        //     if(currObject) {
        //         dostack.addUndoStack(currObject.id, EundoStackAddType.textbox);
        //     }
        // }, 500);

        cancelBubble(event);
    };

    return (
        <div
            className={`toolbar combo ${refToolsInfo.execName}`}
            id={texteditor.getToolbarId(refToolsInfo.execName)}
            onClick={showComboBox}
            onMouseDown={allEventCancel}
            title={refToolsInfo.title}
        >
            <div className="data-value">{dataList[0]}</div>

            {refToolsInfo.unit !== ETextEditorToolsUnit.none && (
                <div className="data-unit">{refToolsInfo.unit}</div>
            )}

            <div className="data-arrow"></div>
            <div className="list-container">
                {historyFontList.length > 0 &&
                    historyFontList.map(
                        (dataVal: number | string, index: number) => (
                            <div
                                key={'combo_datalist_history_' + index}
                                {...{ dataval: dataVal }}
                                className={`list ${
                                    dataVal === '' ? 'separator' : ''
                                }`}
                                onClick={e => setVal(dataVal, e)}
                                onMouseDown={allEventCancel}
                                title={String(dataVal)}
                                style={{
                                    fontFamily:
                                        refToolsInfo.execName ===
                                        ETextEditorToolsName.fontfamily
                                            ? String(dataVal)
                                            : 'inherit',
                                }}
                            >
                                {dataVal} {refToolsInfo.unit}
                            </div>
                        ),
                    )}

                {dataList.map((dataVal: number | string, index: number) => (
                    <div
                        key={'combo_datalist' + index}
                        {...{ dataval: dataVal }}
                        className={`list`}
                        onClick={e => setVal(dataVal, e)}
                        onMouseDown={allEventCancel}
                        title={String(dataVal)}
                        style={{
                            fontFamily:
                                refToolsInfo.execName ===
                                ETextEditorToolsName.fontfamily
                                    ? String(dataVal)
                                    : 'inherit',
                        }}
                    >
                        {dataVal} {refToolsInfo.unit}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComboTool;

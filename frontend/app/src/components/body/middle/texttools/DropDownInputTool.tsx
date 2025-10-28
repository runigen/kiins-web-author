import React, { useEffect, useState } from 'react';
import {
    ETextEditorToolsName,
    // ETextEditorToolsUnit,
    ITextToolsProps,
} from '../../../../const/types';
import { allEventCancel, cancelBubble } from '../../../../util/common';
import {
    fontSizeList,
    fontSizeRange,
    letterSpacingList,
    letterSpacingRange,
} from '../../../../const/basicData';
import * as texteditor from '../../../../util/texteditor';
import userInfo from '../../../../store/userInfo';
import $ from 'jquery';

const DropDownInputTool = ({ refToolsInfo }: ITextToolsProps) => {
    const LANGSET = userInfo.getLangSet();
    const [dataList, setDataList] = useState<number[]>([]);

    useEffect(() => {
        setDropDownData(refToolsInfo.execName);
    }, []);

    const setDropDownData = (execName: ETextEditorToolsName) => {
        if (execName === ETextEditorToolsName.fontsize) {
            setDataList(fontSizeList);
        } else if (execName === ETextEditorToolsName.letterspacing) {
            setDataList(letterSpacingList);
        }
    };

    const showDropDown = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log('showDropDown ---');

        const toolbarObj = event.currentTarget.parentNode;
        if (toolbarObj) {
            const listContainer = toolbarObj.lastChild as HTMLDivElement;

            if ($(listContainer).hasClass('active')) {
                $(listContainer).removeClass('active');
            } else {
                texteditor.closeAllCtlBoxList();
                $(listContainer).addClass('active');
            }
        }
        cancelBubble(event);
    };

    const setVal = (
        dataVal: number,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        console.log('DropDownTool dataVal : ', refToolsInfo.execName, dataVal);

        if (refToolsInfo.execName === ETextEditorToolsName.fontsize) {
            texteditor.execBasicCommand(
                refToolsInfo.execName,
                String(dataVal) + refToolsInfo.unit,
            );
        } else if (
            refToolsInfo.execName === ETextEditorToolsName.letterspacing
        ) {
            texteditor.execExtCommand(
                refToolsInfo.execName,
                String(dataVal) + refToolsInfo.unit,
            );
        }

        // 드롭다운 닫기
        const listObj = event.currentTarget;
        if (listObj) {
            const dropdownList = listObj.parentNode as HTMLDivElement;
            if (dropdownList) {
                $(dropdownList).removeClass('active');
            }
        }

        cancelBubble(event);
    };

    const decSize = (event: React.MouseEvent<HTMLButtonElement>) => {
        const currSize = parseInt(
            (event.currentTarget.nextSibling as HTMLInputElement).value,
            10,
        );
        console.log('decSize currSize : ', currSize);

        let minSize = 0;
        if (refToolsInfo.execName === ETextEditorToolsName.fontsize) {
            minSize = fontSizeRange.min;
        } else if (
            refToolsInfo.execName === ETextEditorToolsName.letterspacing
        ) {
            minSize = letterSpacingRange.min;
        }
        let targetSize = currSize - 1;
        if (targetSize < minSize) {
            targetSize = minSize;
        }

        if (refToolsInfo.execName === ETextEditorToolsName.fontsize) {
            texteditor.execBasicCommand(
                ETextEditorToolsName.fontsize,
                String(targetSize) + refToolsInfo.unit,
            );
        } else if (
            refToolsInfo.execName === ETextEditorToolsName.letterspacing
        ) {
            texteditor.execExtCommand(
                ETextEditorToolsName.letterspacing,
                String(targetSize) + refToolsInfo.unit,
            );
        }
    };
    const incSize = (event: React.MouseEvent<HTMLButtonElement>) => {
        const currSize = parseInt(
            (event.currentTarget.previousSibling as HTMLInputElement).value,
            10,
        );
        console.log('incSize currSize : ', currSize);

        let maxSize = 0;
        if (refToolsInfo.execName === ETextEditorToolsName.fontsize) {
            maxSize = fontSizeRange.max;
        } else if (
            refToolsInfo.execName === ETextEditorToolsName.letterspacing
        ) {
            maxSize = letterSpacingRange.max;
        }
        let targetSize = currSize + 1;
        if (targetSize > maxSize) {
            targetSize = maxSize;
        }

        if (refToolsInfo.execName === ETextEditorToolsName.fontsize) {
            texteditor.execBasicCommand(
                ETextEditorToolsName.fontsize,
                String(targetSize) + refToolsInfo.unit,
            );
        } else if (
            refToolsInfo.execName === ETextEditorToolsName.letterspacing
        ) {
            texteditor.execExtCommand(
                ETextEditorToolsName.letterspacing,
                String(targetSize) + refToolsInfo.unit,
            );
        }
    };

    return (
        <div
            className={`toolbar dropdowninput ${refToolsInfo.execName}`}
            id={texteditor.getToolbarId(refToolsInfo.execName)}
            title={refToolsInfo.title}
        >
            <label className="dropdowninput-label"></label>

            <button
                type="button"
                className="decrease"
                onClick={decSize}
                title={LANGSET.TEXTEDITOR.DECREASE + ' ' + refToolsInfo.title}
            ></button>
            <input
                type="text"
                className="data-input"
                onClick={showDropDown}
                onMouseDown={allEventCancel}
            />
            <button
                type="button"
                className="increase"
                onClick={incSize}
                title={LANGSET.TEXTEDITOR.INCREASE + ' ' + refToolsInfo.title}
            ></button>

            <div className="list-container">
                {dataList.map((dataVal: number, index: number) => (
                    <div
                        key={'dropdown_datalist' + index}
                        {...{ dataval: dataVal }}
                        className="list"
                        onClick={e => setVal(dataVal, e)}
                        onMouseDown={allEventCancel}
                        title={String(dataVal)}
                    >
                        {dataVal} {refToolsInfo.unit}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default DropDownInputTool;

import React, { useEffect, useState } from 'react';
import {
    ETextEditorToolsName,
    // ETextEditorToolsUnit,
    ITextToolsProps,
} from '../../../../const/types';
import { allEventCancel, cancelBubble } from '../../../../util/common';
import { lineHeightList, paddingList } from '../../../../const/basicData';
import * as texteditor from '../../../../util/texteditor';
import workInfo from '../../../../store/workInfo';
import $ from 'jquery';

const DropDownTool = ({ refToolsInfo }: ITextToolsProps) => {
    const [dataList, setDataList] = useState<number[] | string[]>([]);

    useEffect(() => {
        setDropDownData(refToolsInfo.execName);
    }, []);

    const setDropDownData = (execName: ETextEditorToolsName) => {
        if (execName === ETextEditorToolsName.lineheight) {
            setDataList(lineHeightList);
        } else if (execName === ETextEditorToolsName.padding) {
            setDataList(paddingList);
        }
    };

    const showDropDown = (event: React.MouseEvent<HTMLDivElement>) => {
        const toolbarObj = event.currentTarget;
        if (toolbarObj) {
            const comboList = toolbarObj.lastChild as HTMLDivElement;

            if ($(comboList).hasClass('active')) {
                $(comboList).removeClass('active');
            } else {
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
        console.log('DropDownTool dataVal : ', refToolsInfo.execName, dataVal);

        if (refToolsInfo.execName === ETextEditorToolsName.lineheight) {
            texteditor.setLineHeight(Number(dataVal));
        } else if (refToolsInfo.execName === ETextEditorToolsName.padding) {
            texteditor.setPadding(Number(dataVal));
            workInfo.setUpdateKey();
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
    return (
        <div
            className={`toolbar dropdown ${refToolsInfo.execName}`}
            onClick={showDropDown}
            onMouseDown={allEventCancel}
            id={texteditor.getToolbarId(refToolsInfo.execName)}
            title={refToolsInfo.title}
        >
            <div className="list-container">
                {dataList.map((dataVal: number | string, index: number) => (
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
export default DropDownTool;

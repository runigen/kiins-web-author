import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { SketchPicker, RGBColor } from 'react-color';
import { presetColors } from '../../../../const/basicData';
import { ITextToolsProps, ETextEditorToolsName } from '../../../../const/types';
import { cancelBubble } from '../../../../util/common';
import * as texteditor from '../../../../util/texteditor';
import * as DataStore from '../../../../store/DataStore';

// 3. color tool
let lastSelectColor: RGBColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
};
export const getLastSelectColor = () => {
    return lastSelectColor;
};
export const initLastSelectColor = () => {
    lastSelectColor = {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
    };
};
let SEL: any = null;
let RANGE: any = null;
const ColorTool = ({ refToolsInfo }: ITextToolsProps) => {
    // const [color, setColor] = useState<string>('');
    const [color, setColor] = useState<RGBColor>({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
    });
    const [loadPresetColors, setLoadPresetColors] =
        useState<any[]>(presetColors);

    // 초기컬러값 세팅.
    useEffect(() => {
        if (refToolsInfo.execName === ETextEditorToolsName.forecolor) {
            setColor({
                r: 0,
                g: 0,
                b: 0,
                a: 1,
            });
        }
        // else if (refToolsInfo.execName === ETextEditorToolsName.backcolor) {
        //     setColor({
        //         r: 255,
        //         g: 255,
        //         b: 255,
        //         a: 0,
        //     });
        // }
    }, [refToolsInfo.execName]);

    // useEffect(() => {
    //     setInputKeyDownEvent();

    //     return () => {
    //         unsetInputKeyDownEvent();
    //     };
    // }, []);

    // const setInputKeyDownEvent = () => {
    //     $('.toolbar.btn .color-picker input').on('mousedown', e => {
    //         cancelBubble(e);
    //         // $(e.target).trigger('focus');
    //     });
    // };
    // const unsetInputKeyDownEvent = () => {
    //     $('.toolbar.btn .color-picker input').off('mousedown');
    // };

    //sketch-picker

    const mergeColorPresetList = () => {
        // const historyColors = DataStore.getColorHistoryList()
        //     .reverse()
        //     .concat(presetColors);
        // setLoadPresetColors([...new Set(historyColors)]);
        // setLoadPresetColors(presetColors);
        const mergeColors = presetColors.concat(
            DataStore.getColorHistoryList().reverse(),
        );
        setLoadPresetColors([...new Set(mergeColors)]);
    };

    const showColorPicker = (
        event: React.MouseEvent<HTMLDivElement>,
        bShow = true,
    ) => {
        const btnObjId = texteditor.getToolbarId(refToolsInfo.execName);

        if ($(`#${btnObjId} .color-picker`).hasClass('active')) {
            bShow = false;
        }

        texteditor.closeAllCtlBoxList();
        if (bShow) {
            $(`#${btnObjId} .color-picker`).addClass('active');
            // 컬러피커 열 때 셀렉션 저장
            saveOrgSelection();
        } else {
            $(`#${btnObjId} .color-picker`).removeClass('active');
            // 컬러피커 닫을 때 셀렉션 초기화
            initOrgSelection();
        }

        mergeColorPresetList();

        cancelBubble(event);
        // allEventCancel(event);
    };
    const handleColorChange = (colorObj: RGBColor) => {
        setColor(colorObj);
    };
    const handleColorChange2 = (colorObj: RGBColor) => {
        console.log('handleColorChange2 : colorObj : ', colorObj);
        setColor(colorObj);
        lastSelectColor = colorObj;

        restoreOrgSelection();

        texteditor.execBasicCommand(
            refToolsInfo.execName,
            `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`,
        );

        saveOrgSelection();
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

    return (
        <div
            className={`toolbar btn ${refToolsInfo.execName}`}
            onClick={e => showColorPicker(e)}
            id={texteditor.getToolbarId(refToolsInfo.execName)}
            onMouseDown={cancelBubble}
            title={refToolsInfo.title}
        >
            <div
                className="color-picker"
                onClick={cancelBubble}
                onMouseDown={cancelBubble}
            >
                <SketchPicker
                    presetColors={loadPresetColors}
                    color={color}
                    disableAlpha={false}
                    // onChange={(color, e) => handleColorChange(color.hex, e)}
                    onChange={colorObj => handleColorChange(colorObj.rgb)}
                    onChangeComplete={colorObj =>
                        handleColorChange2(colorObj.rgb)
                    }
                />
            </div>
            {refToolsInfo.execName === 'backcolor' ? (
                <>
                    <i></i>
                    <span
                        className="inline-bg"
                        style={{
                            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                        }}
                    ></span>
                </>
            ) : (
                <span
                    className="inline-bg"
                    style={{
                        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                    }}
                ></span>
            )}
        </div>
    );
};

export default ColorTool;

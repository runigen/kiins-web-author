import React, { useEffect, useState } from 'react';
// import { observer } from 'mobx-react';
import store from '../store';
import $ from 'jquery';
import {
    cancelBubble,
    // allEventCancel,
    cssRgbToColorArray,
    rgbToHex,
} from './common';
import { EundoStackAddType, IcolorPickerInfo } from '../const/types';
// import * as dialog from '../util/dialog';
import { RGBColor, SketchPicker } from 'react-color';
import * as dostack from '../util/dostack';
import * as DataStore from '../store/DataStore';
import { presetColors } from '../const/basicData';

interface IcolorPickerProps {
    inputInfo: IcolorPickerInfo;
}
let gTargetObject: HTMLElement | null = null;
let colorChanged = false;
let gTargetObjectId = '';
let lastSelectColor: RGBColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
};
const ColorPicker = ({ inputInfo }: IcolorPickerProps) => {
    const { workInfo } = store;
    const currObject = workInfo.getObject();

    const [bShow, setBShow] = useState<boolean>(false);
    const [color, setColor] = useState<RGBColor>({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
    });
    const [loadPresetColors, setLoadPresetColors] =
        useState<any[]>(presetColors);

    // const showColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     const obj = event.currentTarget;
    //     if($(obj).hasClass("disabled")) {
    //         dialog.showToastMessage("대상을 선택해 주세요.");
    //         return;
    //     }
    //     dialog.showColorPickerDropDown(event, '', (currColor: string)=>{
    //         console.log('currColor: ', currColor);
    //         inputInfo.changeEvt(currColor);
    //     });
    // }

    useEffect(() => {
        $('.sketch-picker').trigger('mousedown', cancelBubble);
        mergeColorPresetList();
    }, []);

    useEffect(() => {
        gTargetObject = currObject;
    }, [currObject]);

    const closeColorPicker = () => {
        console.log('down colorChanged : ', colorChanged);
        if (colorChanged === true) {
            console.log('gTargetObjectId :', gTargetObjectId);

            // if(gTargetObjectId !== '') {
            //     dostack.addUndoStack(gTargetObjectId, EundoStackAddType.style);
            // } else {
            //     dostack.addUndoStack('', EundoStackAddType.page);
            // }
            dostack.addUndoStack('', EundoStackAddType.all);
            colorChanged = false;

            if (lastSelectColor) {
                DataStore.addColorHistory(
                    rgbToHex(
                        lastSelectColor.r,
                        lastSelectColor.g,
                        lastSelectColor.b,
                    ),
                );
                lastSelectColor = {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1,
                };
            }
        }
        mergeColorPresetList();
        setBShow(false);
        gTargetObjectId = '';
        document.removeEventListener('mousedown', closeColorPicker);
    };

    const mergeColorPresetList = () => {
        // const historyColors = DataStore.getColorHistoryList().reverse();
        // setLoadPresetColors(presetColors.concat(historyColors));
        // const historyColors = DataStore.getColorHistoryList()
        //     .reverse()
        //     .concat(presetColors);
        const mergeColors = presetColors.concat(
            DataStore.getColorHistoryList().reverse(),
        );
        setLoadPresetColors([...new Set(mergeColors)]);
        // setLoadPresetColors(presetColors);
    };

    const showColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('showColorPicker');
        // setBShow(bShow => !bShow);

        if (bShow === true) {
            closeColorPicker();
            cancelBubble(event);
            return;
        }

        setBShow(true);
        colorChanged = false;
        gTargetObjectId = gTargetObject ? gTargetObject.id : '';
        const currColor = event.currentTarget.style.backgroundColor;
        if (gTargetObject) {
            const rgbColor = cssRgbToColorArray(currColor);
            setColor({
                r: rgbColor[0],
                g: rgbColor[1],
                b: rgbColor[2],
                a: rgbColor[3] || 1,
            });
        }
        document.addEventListener('mousedown', closeColorPicker);
    };

    // const handleColorChange = (color: string) => {
    //     console.log('color: ', color);
    //     setColor(color);
    //     inputInfo.changeEvt(color);
    //     lastSelectColor = color;
    //     colorChanged = true;
    // };
    const handleColorChange = (color: RGBColor) => {
        console.log('color: ', color);
        setColor(color);
        const cssColorString =
            'rgba(' +
            color.r +
            ',' +
            color.g +
            ',' +
            color.b +
            ',' +
            color.a +
            ')';
        inputInfo.changeEvt(cssColorString);
        lastSelectColor = color;
        colorChanged = true;
    };

    return (
        <>
            <button
                className="color-selector"
                id={inputInfo.id}
                onClick={showColorPicker}
                onMouseDown={cancelBubble}
                title="배경색"
            >
                <div
                    className={`new-color-picker-container ${
                        bShow ? 'active' : ''
                    }`}
                    onClick={cancelBubble}
                    onMouseDown={cancelBubble}
                >
                    <SketchPicker
                        presetColors={loadPresetColors}
                        color={color}
                        // disableAlpha={true}
                        onChange={colorObj => handleColorChange(colorObj.rgb)}
                    />
                </div>
            </button>
        </>
    );
};

export default ColorPicker;

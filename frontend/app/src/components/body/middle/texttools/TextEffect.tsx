import React, { useCallback, useEffect } from 'react';
// import store from '../../../../store';
import $ from 'jquery';
import {
    ETextEditorToolsName,
    // ETextEditorToolsUnit,
} from '../../../../const/types';
import { cancelBubble } from '../../../../util/common';
import * as texteditor from '../../../../util/texteditor';
// import * as DataStore from '../../../../store/DataStore';
import NumberForm from '../../../../util/NumberForm';
import ColorPicker from '../../../../util/ColorPicker';

type TProps = {
    textEffectInfo: {
        name: ETextEditorToolsName;
    };
};

let SEL: any = null;
let RANGE: any = null;
export const showTextEffectTools = (execName: ETextEditorToolsName) => {
    const textShadowCtlBox = document.querySelector(
        `.toolbar.btn.${execName} .text-effect-tools-container`,
    );
    if (textShadowCtlBox) {
        // hine
        if (textShadowCtlBox.classList.contains('active')) {
            textShadowCtlBox.classList.remove('active');
            // initOrgSelection();

            // show
        } else {
            texteditor.closeAllCtlBoxList();
            textShadowCtlBox.classList.add('active');
            saveOrgSelection();

            texteditor.updateTextEffectToolbarState();
        }
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
// const initOrgSelection = () => {
//     SEL = null;
//     RANGE = null;
// };
const TextEffect = ({ textEffectInfo }: TProps) => {
    // const { userInfo, docData, workInfo } = store;

    useEffect(() => {
        console.log('execName', textEffectInfo.name);
        $('#idx_textshadow_color_selector').css(
            'background-color',
            'rgb(88,88,88)',
        );
        $('#idx_textoutline_color_selector').css(
            'background-color',
            'rgb(255,255,255)',
        );
    }, []);

    const changeTextShadow = useCallback(() => {
        const shadowX = $('#textshadow_x').val();
        const shadowY = $('#textshadow_y').val();
        const shadowB = $('#textshadow_b').val();
        const shadowColor = $('#idx_textshadow_color_selector').css(
            'background-color',
        );

        restoreOrgSelection();

        // 0인경우도 처리되도록 아래 주석처리 (부모에 다른값이 설정되어 있는경우 처리되지 않는 문제가 있음)
        // if (
        //     Number(shadowX) === 0 &&
        //     Number(shadowY) === 0 &&
        //     Number(shadowB) === 0
        // ) {
        //     texteditor.execExtCommand(ETextEditorToolsName.textshadow, '');
        //     return;
        // }

        const shadow = `${shadowColor} ${shadowX}px ${shadowY}px ${shadowB}px`;
        texteditor.execExtCommand(ETextEditorToolsName.textshadow, shadow);
        console.log('shadow', shadow);
    }, []);

    const selectTextShadowColorFunc = (color: string) => {
        console.log('selectTextShadowColorFunc', color);
        $('#idx_textshadow_color_selector').css('background-color', color);
        changeTextShadow();
    };

    const changeTextOutline = useCallback(() => {
        console.log('changeTextOutline');

        const outlineW = $('#textoutline_w').val();
        const outlineColor = $('#idx_textoutline_color_selector').css(
            'background-color',
        );

        restoreOrgSelection();

        // 0인경우도 처리되도록 아래 주석처리 (부모에 다른값이 설정되어 있는경우 처리되지 않는 문제가 있음)
        // if (Number(outlineW) === 0) {
        //     texteditor.execExtCommand(ETextEditorToolsName.textoutline, '');
        //     return;
        // }

        const outline = `${outlineW}px ${outlineColor}`;
        texteditor.execExtCommand(ETextEditorToolsName.textoutline, outline);
        console.log('outline', outline);
    }, []);

    const selectTextOutlineColorFunc = (color: string) => {
        console.log('selectTextOutlineColorFunc', color);
        $('#idx_textoutline_color_selector').css('background-color', color);
        changeTextOutline();
    };

    return (
        <div
            className="text-effect-tools-container"
            onMouseDown={cancelBubble}
            onClick={cancelBubble}
        >
            {textEffectInfo.name === ETextEditorToolsName.textshadow && (
                <>
                    <div className="text-effect-tools-unit">
                        <label>x</label>
                        <NumberForm
                            inputInfo={{
                                title: 'x방향 음영',
                                id: 'textshadow_x',
                                type: 'number',
                                unit: '',
                                min: 0,
                                max: 99,
                                default: 0,
                                changeEvt: changeTextShadow,
                            }}
                        />
                    </div>
                    <div className="text-effect-tools-unit">
                        <label>y</label>
                        <NumberForm
                            inputInfo={{
                                title: 'y방향 음영',
                                id: 'textshadow_y',
                                type: 'number',
                                unit: '',
                                min: 0,
                                max: 99,
                                default: 0,
                                changeEvt: changeTextShadow,
                            }}
                        />
                    </div>
                    <div className="text-effect-tools-unit">
                        <label>b</label>
                        <NumberForm
                            inputInfo={{
                                title: '흐려짐',
                                id: 'textshadow_b',
                                type: 'number',
                                unit: '',
                                min: 0,
                                max: 99,
                                default: 0,
                                changeEvt: changeTextShadow,
                            }}
                        />
                    </div>
                    <div className="text-effect-tools-unit">
                        <ColorPicker
                            inputInfo={{
                                id: 'idx_textshadow_color_selector',
                                changeEvt: selectTextShadowColorFunc,
                            }}
                        />
                    </div>
                </>
            )}

            {textEffectInfo.name === ETextEditorToolsName.textoutline && (
                <>
                    <div className="text-effect-tools-unit">
                        <label>w</label>
                        <NumberForm
                            inputInfo={{
                                title: '두께',
                                id: 'textoutline_w',
                                type: 'number',
                                unit: '',
                                min: 0,
                                max: 99,
                                default: 0,
                                changeEvt: changeTextOutline,
                            }}
                        />
                    </div>
                    <div className="text-effect-tools-unit">
                        <ColorPicker
                            inputInfo={{
                                id: 'idx_textoutline_color_selector',
                                changeEvt: selectTextOutlineColorFunc,
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default TextEffect;

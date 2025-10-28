import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import {EundoStackAddType, IkeyframeInfo} from '../../../../const/types';
// import {cancelBubble} from '../../../../util/common';
// import * as keyframe from '../../../../util/keyframe';
// import * as animation from '../../../../util/animation';
import NumberForm from '../../../../util/NumberForm';
// import * as dostack from '../../../../util/dostack';
import * as texteditor from '../../../../util/texteditor';
// import * as basicData from '../../../../const/basicData';

// let gTargetObject: HTMLElement | null;
let gTextBoxObj: HTMLDivElement | null;
const TextBox = observer(() => {
    const { workInfo } = store;
    const currObject: any = workInfo.getObject();
    const updateKey: number = workInfo.getUpdateKey();
    const [textobj, setTextObj] = useState<HTMLDivElement | null>(null);
    const [valign, setValign] = useState('top');

    // let textboxObj: HTMLDivElement;

    useEffect(() => {
        // gTargetObject = currObject;
        initTextBoxObj(currObject);
    }, [currObject, updateKey]);

    useEffect(() => {
        console.log(textobj);
        if (textobj) {
            setTextBoxValign(textobj);
            setTextBoxPadding(textobj);
        }
        gTextBoxObj = textobj;
    }, [textobj]);

    useEffect(() => {
        console.log('valign :', valign);
    }, [valign]);

    const initTextBoxObj = (currObject: HTMLElement) => {
        if (currObject) {
            const textbox = currObject.firstChild as HTMLDivElement;
            if (textbox && $(textbox).hasClass('textbox')) {
                setTextObj(textbox);
            } else {
                setTextObj(null);
            }
        } else {
            setTextObj(null);
        }
    };

    const setTextBoxValign = (obj: HTMLDivElement) => {
        if (obj === null) return;

        if ($(obj).hasClass('middle')) {
            setValign('middle');
        } else if ($(obj).hasClass('bottom')) {
            setValign('bottom');
        } else {
            setValign('top');
        }
    };
    const setTextBoxPadding = (obj: HTMLDivElement) => {
        if (obj === null) return;
        const padding = texteditor.getTextBoxPadding(obj);
        console.log('padding :', padding);

        $('#idx_textbox_padding').val(padding);
    };

    const changeValign = (
        obj: HTMLDivElement | null,
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        if (obj === null) return;

        const changeVal = event.currentTarget.value;
        console.log('changeVal : ', changeVal);

        if ($(obj).hasClass('middle')) {
            $(obj).removeClass('middle');
        }
        if ($(obj).hasClass('bottom')) {
            $(obj).removeClass('bottom');
        }

        if (changeVal !== 'top') {
            $(obj).addClass(changeVal);
        }
        setValign(changeVal);

        workInfo.setUpdateKey();
    };

    const changeTextBoxPadding = (elem: HTMLInputElement) => {
        if (gTextBoxObj) {
            $(gTextBoxObj).css('padding', elem.value);
            workInfo.setUpdateKey();
        }
    };

    const removeTextBox = (
        event: React.MouseEvent<HTMLButtonElement>,
        obj: HTMLDivElement | null,
    ) => {
        if (obj) {
            obj.parentNode?.removeChild(obj);
            workInfo.setUpdateKey();
        }
    };

    return (
        <article className={'box-list' + (textobj ? '' : ' hide')}>
            <div className="list-title">TextBox</div>
            <div className="list-content">
                <div className="content-styles">
                    세로정렬 :{' '}
                    <div className="ul-dropdown">
                        <select
                            value={valign}
                            onChange={e => changeValign(textobj, e)}
                        >
                            <option value="top">top</option>
                            <option value="middle">middle</option>
                            <option value="bottom">bottom</option>
                        </select>
                    </div>
                </div>
                <div className="content-styles">
                    안쪽여백 :
                    <NumberForm
                        inputInfo={{
                            id: 'idx_textbox_padding',
                            type: 'number',
                            unit: 'px',
                            min: 0,
                            max: 300,
                            default: 0,
                            changeEvt: changeTextBoxPadding,
                        }}
                    />
                </div>
                <div className="content-styles">
                    <button
                        type="button"
                        style={{
                            width: '50px',
                            height: '30px',
                            display: 'block',
                            margin: '10px 0',
                            backgroundColor: 'tomato',
                        }}
                        onClick={e => removeTextBox(e, textobj)}
                    >
                        글상자삭제
                    </button>
                </div>
            </div>
        </article>
    );
});

export default TextBox;

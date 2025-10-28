import React from 'react';
// import { observer } from 'mobx-react';
// import store from '../store';
import $ from 'jquery';
import { cancelBubble } from './common';
import { InumberFormInputInfo } from '../const/types';

let autoDelayTimer: any = null;
let autoTimer: any = null;
let mDown = false;
const autoStartDelay = 0.4; // 이값(초) 만큼 마우스다운 지속시 자동 증가 시작
const autoIncreaseTime = 0.1; // 이값(초)마다 1씩 증가
interface NumberFormProps {
    inputInfo: InumberFormInputInfo;
}
const NumberForm = ({ inputInfo }: NumberFormProps) => {
    const title = inputInfo.title || '';
    const increment = inputInfo.increment || 1;

    // useEffect(()=>{

    // }, []);

    const increase = (event: React.MouseEvent<HTMLButtonElement>) => {
        const inputObj = event.currentTarget.parentNode?.previousSibling
            ?.firstChild as HTMLInputElement;
        const disabledFlag = $(inputObj).attr('disabled') || null;
        if (disabledFlag) {
            console.log('disabledFlag: ', disabledFlag);
            return;
        }

        // const inputObj = document.getElementById(inputInfo.id) as HTMLInputElement;
        if (inputObj) {
            mDown = true;
            const orgVal = Number(inputObj.value);
            if (orgVal < inputInfo.max) {
                inputObj.value = String(orgVal + increment);
                inputInfo.changeEvt(inputObj);
            }
            autoDelayTimer = setTimeout(() => {
                if (mDown !== true) return;
                autoTimer = setInterval(() => {
                    if (inputObj) {
                        const val = Number(inputObj.value);
                        if (val < inputInfo.max) {
                            inputObj.value = String(val + increment);
                            inputInfo.changeEvt(inputObj);
                        } else {
                            clearInterval(autoTimer);
                            autoTimer = null;
                        }
                    }
                }, autoIncreaseTime * 1000);
            }, autoStartDelay * 1000);
        }
    };
    const decrease = (event: React.MouseEvent<HTMLButtonElement>) => {
        const inputObj = event.currentTarget.parentNode?.previousSibling
            ?.firstChild as HTMLInputElement; //document.getElementById(inputInfo.id) as HTMLInputElement;
        const disabledFlag = $(inputObj).attr('disabled') || null;
        if (disabledFlag) {
            console.log('disabledFlag: ', disabledFlag);
            return;
        }
        // const inputObj = document.getElementById(inputInfo.id) as HTMLInputElement;
        if (inputObj) {
            mDown = true;
            const orgVal = Number(inputObj.value);
            if (orgVal > inputInfo.min) {
                inputObj.value = String(orgVal - increment);
                inputInfo.changeEvt(inputObj);
            }
            autoDelayTimer = setTimeout(() => {
                if (mDown !== true) return;
                autoTimer = setInterval(() => {
                    if (inputObj) {
                        const val = Number(inputObj.value);
                        if (val > inputInfo.min) {
                            inputObj.value = String(val - increment);
                            inputInfo.changeEvt(inputObj);
                        } else {
                            clearInterval(autoTimer);
                            autoTimer = null;
                        }
                    }
                }, autoIncreaseTime * 1000);
            }, autoStartDelay * 1000);
        }
    };

    const evtKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        cancelBubble(event);
    };

    const stopAutoIncrease = () => {
        mDown = false;
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
        if (autoDelayTimer) {
            clearTimeout(autoDelayTimer);
            autoDelayTimer = null;
        }
    };

    const focusForm = (event: React.FocusEvent<HTMLInputElement>) => {
        event.currentTarget.select();
    };

    return (
        <>
            <div className="inputbox">
                <input
                    type="number"
                    max={inputInfo.max}
                    min={inputInfo.min}
                    step={inputInfo.increment}
                    id={inputInfo.id}
                    defaultValue={inputInfo.default}
                    title={title}
                    onKeyDown={evtKeydown}
                    onChange={e => inputInfo.changeEvt(e.currentTarget)}
                    onFocus={focusForm}
                />
                {inputInfo.unit !== '' && <span>{inputInfo.unit}</span>}
            </div>
            <div className="btn-adjust">
                <button
                    aria-label="up"
                    onMouseDown={increase}
                    onMouseUp={stopAutoIncrease}
                    onMouseLeave={stopAutoIncrease}
                    onContextMenu={stopAutoIncrease}
                ></button>
                <button
                    aria-label="down"
                    onMouseDown={decrease}
                    onMouseUp={stopAutoIncrease}
                    onMouseLeave={stopAutoIncrease}
                    onContextMenu={stopAutoIncrease}
                ></button>
            </div>
        </>
    );
};

export default NumberForm;

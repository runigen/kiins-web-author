import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
import { EundoStackAddType, IkeyframeInfo } from '../../../../const/types';
// import { cancelBubble } from '../../../../util/common';
import * as keyframe from '../../../../util/keyframe';
import * as animation from '../../../../util/animation';
import NumberForm from '../../../../util/NumberForm';
import * as dostack from '../../../../util/dostack';
import * as basicData from '../../../../const/basicData';

let gTargetObject: HTMLElement | null;
let addUndoStackTimer: any = null;
const Animations = observer(() => {
    const { workInfo } = store;
    // const [objectName, setObjectName] = useState<string>('');
    const currObject: any = workInfo.getObject();
    const updateKey: number = workInfo.getUpdateKey();
    const currKeyframeStep = workInfo.getCurrKeyframeStep();
    // const [currKeyframeStepInfo, setCurrKeyframeStepInfo] =
    //     useState<IkeyframeInfo>();
    const [keyframeinfo, setKeyframeInfo] = useState<IkeyframeInfo[]>([]);
    const [infiniteVal, setInfiniteVal] = useState<boolean>(false);

    useEffect(() => {
        gTargetObject = currObject;
        if (currObject !== null) {
            const keyframeInfoList = keyframe.getKeyFrameInfo(currObject);
            keyframeInfoList.map(keyframe => {
                if (keyframe.ignore === undefined) {
                    keyframe.ignore = {
                        x: false,
                        y: false,
                    };
                }
            });
            setKeyframeInfo(keyframeInfoList);
            const currAnimationInfo =
                animation.getAnimationInfo(currObject) || 0;
            if (currAnimationInfo) {
                setRepeatForm(currAnimationInfo.repeat);
            } else {
                setRepeatForm(1);
            }
        } else {
            setKeyframeInfo([]);
        }
    }, [currObject, updateKey, currKeyframeStep]);

    useEffect(() => {
        console.log('currKeyframe : ', keyframeinfo);
        console.log('currKeyframeStep : ', currKeyframeStep);
    }, [keyframeinfo, currKeyframeStep]);

    const changeRepeatCount = (elem: HTMLInputElement) => {
        if (!gTargetObject) return;
        const repeatCount = Number(elem.value);
        if (gTargetObject === null) return;

        animation.addAnimationInfo(gTargetObject, { repeat: repeatCount });

        // undo stack 기록 타이머 (addUndoStackTimerDelay 시간 내에 다시 요청시에는 기록하지 않는다.)
        if (addUndoStackTimer) {
            clearTimeout(addUndoStackTimer);
            addUndoStackTimer = null;
        }
        const objectId = gTargetObject.id;
        addUndoStackTimer = setTimeout(
            id => {
                addUndoStackTimer = null;
                console.log('addUndoStackTimer objectId : ', id);
                // dostack.addUndoStack(id, EundoStackAddType.animation);
                dostack.addUndoStack('', EundoStackAddType.all);
            },
            basicData.addUndoStackTimerDelay * 1000,
            objectId,
        );
    };
    // const downKeyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //     cancelBubble(event);
    // };
    // const selectFormVal = (event: React.FocusEvent<HTMLInputElement>) => {
    //     cancelBubble(event);
    //     event.target.select();
    // };
    const changeInfinify = (infinite: boolean) => {
        if (!gTargetObject) return;

        const targetInfiniteVal = !infinite;
        if (targetInfiniteVal) {
            setRepeatForm(0);
            animation.addAnimationInfo(gTargetObject, { repeat: 0 });
        } else {
            setRepeatForm(1);
            animation.addAnimationInfo(gTargetObject, { repeat: 1 });
        }
        dostack.addUndoStack('', EundoStackAddType.all);
    };
    const setRepeatForm = (repeat: number) => {
        if (repeat > 0) {
            $('#idx_animation_repeat').val(repeat);
            $('#idx_animation_repeat').removeAttr('disabled');
            setInfiniteVal(false);
        } else {
            $('#idx_animation_repeat').val(0);
            $('#idx_animation_repeat').attr('disabled', 'disabled');
            setInfiniteVal(true);
        }
    };

    const setIgnore = (
        KeyframeStep: number,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        console.log('KeyframeStep: ', KeyframeStep);
        console.log('event: ', event);

        const xForm = document.querySelector(
            '#idx_animation_ignore_x',
        ) as HTMLInputElement;
        const yForm = document.querySelector(
            '#idx_animation_ignore_y',
        ) as HTMLInputElement;
        if (xForm === null || yForm === null) return;

        keyframe.setKeyFrameIgnoreInfo(KeyframeStep + 1, {
            x: xForm.checked,
            y: yForm.checked,
        });

        if (KeyframeStep === 0) {
            keyframe.setKeyFrameIgnoreInfo(KeyframeStep, {
                x: xForm.checked,
                y: yForm.checked,
            });
        }
    };

    return (
        <article
            className={'box-list' + (keyframeinfo.length < 2 ? ' hide' : '')}
        >
            <div className="list-title">Animations</div>
            <div className="list-content">
                <div className="content-animations">
                    <i></i>
                    <NumberForm
                        inputInfo={{
                            id: 'idx_animation_repeat',
                            type: 'number',
                            unit: '',
                            min: 1,
                            max: 99,
                            default: 1,
                            changeEvt: changeRepeatCount,
                        }}
                    />
                    <button
                        className={`btn-infinite ${
                            infiniteVal ? ' active' : ''
                        }`}
                        aria-label="Infinite"
                        onClick={() => changeInfinify(infiniteVal)}
                    ></button>
                </div>
                {currKeyframeStep !== -1 && (
                    <div
                        className="content-animations"
                        style={{ marginTop: '10px' }}
                    >
                        <input
                            type="checkbox"
                            id="idx_animation_ignore_x"
                            defaultChecked={
                                keyframeinfo.length > 0 &&
                                keyframeinfo[currKeyframeStep + 1] !==
                                    undefined &&
                                keyframeinfo[currKeyframeStep + 1].ignore?.x
                                    ? true
                                    : false
                            }
                            onChange={e => setIgnore(currKeyframeStep, e)}
                        />
                        <label htmlFor="idx_animation_ignore_x">Ignore X</label>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <input
                            type="checkbox"
                            id="idx_animation_ignore_y"
                            defaultChecked={
                                keyframeinfo.length > 0 &&
                                keyframeinfo[currKeyframeStep + 1] !==
                                    undefined &&
                                keyframeinfo[currKeyframeStep + 1].ignore?.y
                                    ? true
                                    : false
                            }
                            onChange={e => setIgnore(currKeyframeStep, e)}
                        />
                        <label htmlFor="idx_animation_ignore_y">Ignore Y</label>
                    </div>
                )}
            </div>
        </article>
    );
});

export default Animations;

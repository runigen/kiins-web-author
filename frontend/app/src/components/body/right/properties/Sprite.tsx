import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import * as dialog from '../../../../util/dialog';
import * as basicData from '../../../../const/basicData';
import * as SquareEvent from '../../../../event/SquareEvent';
import * as objects from '../../../../util/objects';
import { EundoStackAddType } from '../../../../const/types';
// import * as FileEvent from '../../../../event/FileEvent';
// import * as ImageEvent from '../../../../event/ImageEvent';
import * as sprite from '../../../../util/sprite';
import { IobjectBgInfo } from '../../../../const/types';
// import {allEventCancel, cancelBubble} from '../../../../util/common';
import animejs from 'animejs';
import NumberForm from '../../../../util/NumberForm';
import * as dostack from '../../../../util/dostack';

let gTargetObject: any = null;
let animationTl: any = null;
interface ObjectBgInfoProps {
    objectBgInfo: IobjectBgInfo;
}
const Sprite = observer(({ objectBgInfo }: ObjectBgInfoProps) => {
    const { workInfo } = store;
    const currObject = workInfo.getObject();
    const currUpdateKey = workInfo.getUpdateKey();
    const [spriteNo, setSpriteNo] = useState(1);
    const [nowPlaying, setNowPlaing] = useState(false);
    const [infiniteVal, setInfiniteVal] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            initialize();
        };
    }, []);

    useEffect(() => {
        gTargetObject = currObject;
        loadCurrentSpriteInfo(currObject);
    }, [currObject, currUpdateKey]);

    useEffect(() => {
        if (nowPlaying !== true) return;

        const steps = Number($('#idx_sprite_cols').val());
        const times = Number($('#idx_sprite_time').val());
        const repeat =
            $('#idx_sprite_repeat').val() === '-1'
                ? true
                : Number($('#idx_sprite_repeat').val()) + 1;
        const totalSize = $('.confirm-dialog-image-box .images').width() || 0;
        const stepSize = totalSize / steps;
        const lastPosition = -totalSize + stepSize + 'px';

        // animationTl = gsap.timeline({repeat: repeat});
        // animationTl.to('#idx_sprite_animation_obj', {backgroundPosition: lastPosition, duration: times, ease: 'steps(' + steps + ')' });       // 스텝으로 나누어 이동 => ease : 'steps(5)'

        // animationTl = gsap.to('#idx_sprite_animation_obj', {backgroundPosition: lastPosition, duration: times, repeat: repeat, ease: 'steps(' + (steps-1) + ')' });       // 스텝으로 나누어 이동 => ease : 'steps(5)'

        const testval = {
            targets: '#idx_sprite_animation_obj',
            backgroundPosition: lastPosition,
            duration: times * 1000,
            easing: 'steps(' + (steps - 1) + ')',
            loop: repeat,
            autoplay: true,
        };
        console.log('testval: ', testval);

        animationTl = animejs({
            targets: '#idx_sprite_animation_obj',
            backgroundPosition: lastPosition,
            duration: times * 1000,
            easing: 'steps(' + (steps - 1) + ')',
            loop: repeat,
            autoplay: true,
            complete: function () {
                console.log('complete');
            },
        });
    }, [nowPlaying]);

    const loadCurrentSpriteInfo = (targetObject: any) => {
        console.log('sprite loadCurrentSpriteInfo');

        if (targetObject === null) return;

        const currSpriteInfo = sprite.getSpriteInfo(targetObject);
        console.log('sprite', currSpriteInfo);

        if (currSpriteInfo) {
            $('#idx_sprite_cols').val(currSpriteInfo.cols);
            $('#idx_sprite_rows').val(currSpriteInfo.rows);
            $('#idx_sprite_repeat').val(currSpriteInfo.repeat);
            $('#idx_sprite_time').val(currSpriteInfo.duration);
            setSpriteNo(currSpriteInfo.cols);
            setRepeatForm(currSpriteInfo.repeat);
        }
    };

    const initialize = () => {
        console.log('sprite initialize');
        if (animationTl !== null) {
            animationTl.pause();
            animationTl.remove();
            animationTl = null;
        }
        setNowPlaing(false);
    };
    const close = () => {
        stopAnimation();
        sprite.hideSpritePopup();
    };
    const changeRows = (elem: HTMLInputElement) => {
        console.log('changeRows : ', elem.value);
    };
    const changeCols = (elem: HTMLInputElement) => {
        const changeVal = Number(elem.value) || 1;
        setSpriteNo(changeVal);
    };
    const changePlayTime = (elem: HTMLInputElement) => {
        const changeVal = Number(elem.value) || 1;
        console.log('changePlayTime : ', changeVal);
    };
    const changePlayRepeat = (elem: HTMLInputElement) => {
        const changeVal = Number(elem.value) || 1;
        console.log('changePlayRepeat : ', changeVal);
    };
    const changeSpriteInfinify = (
        event: React.MouseEvent<HTMLButtonElement>,
        infinite: boolean,
    ) => {
        const targetInfiniteVal = !infinite;
        if (targetInfiniteVal) {
            setRepeatForm(0);
        } else {
            setRepeatForm(1);
        }
    };
    const setRepeatForm = (repeat: number) => {
        if (repeat > 0) {
            $('#idx_sprite_repeat').val(repeat);
            $('#idx_sprite_repeat').removeAttr('disabled');
            setInfiniteVal(false);
        } else {
            $('#idx_sprite_repeat').val(0);
            $('#idx_sprite_repeat').attr('disabled', 'disabled');
            setInfiniteVal(true);
        }
    };
    const playAnimation = () => {
        // initialize();

        // $('.confirm-dialog-image-ani-box').show();
        // $('.confirm-dialog-image-box').hide();
        // $('.area-settings').hide();

        // $(event.currentTarget).next().show();
        // $(event.currentTarget).hide();

        setNowPlaing(true);
    };
    const stopAnimation = (
        event: React.MouseEvent<HTMLButtonElement> | null = null,
    ) => {
        if (animationTl !== null) {
            animationTl.pause();
            animationTl.remove();
            animationTl = null;
        }
        $('.confirm-dialog-image-ani-box').hide();
        $('.confirm-dialog-image-box').show();
        $('.area-settings').show();
        if (event) {
            $(event.currentTarget).prev().show();
            $(event.currentTarget).hide();
        }
        setNowPlaing(false);
    };
    const setSpriteInfo = (targetObject: any) => {
        if (!gTargetObject) return;

        const totalSize = Number($('#idx_sprite_image').width()) || 0;
        const rows = Number($('#idx_sprite_rows').val()) || 1;
        const cols = Number($('#idx_sprite_cols').val()) || 1;
        const times = Number($('#idx_sprite_time').val()) || 1;
        const repeat = Number($('#idx_sprite_repeat').val()) || 0;

        sprite.addSpriteInfo(targetObject, {
            totalSize: totalSize,
            repeat: repeat,
            cols: cols,
            rows: rows,
            duration: times,
        });

        // object 사이즈를 스프라이트 조각 1개 사이즈로 조절한다.
        // const objectWidth = $('#idx_sprite_animation_obj').width() || 0;
        // const objectHeight = $('#idx_sprite_animation_obj').height() || 0;
        const objectWidth = totalSize / cols;
        const objectHeight = Number($('#idx_sprite_image').height()) || 0;

        objects.setObjectSizeInfo(gTargetObject, {
            width: objectWidth,
            height: objectHeight,
        });

        // 배경 이미지 속성을 변경한다. (center 속성 값)
        objects.setBgStretchInfo(targetObject, {
            bgSize: basicData.spriteBgInfo.css.bgSize,
            bgRepeat: basicData.spriteBgInfo.css.bgRepeat,
            bgPosition: basicData.spriteBgInfo.css.bgPosition,
        });

        $(targetObject).addClass('sprite');
        SquareEvent.refreshObjectSelector(targetObject);

        workInfo.setUpdateKey();

        //dostack.addUndoStack(targetObject.id, EundoStackAddType.style);
        // dostack.addUndoStack(targetObject.id, EundoStackAddType.sprite);
        dostack.addUndoStack('', EundoStackAddType.all);

        close();
    };

    return (
        <>
            <div id="idx_dialog_dim" className="dialog-dim dialog-sprite"></div>
            <div id="DIALOG_SPRITE" className="dialog-popup dialog-sprite">
                <div className="container-title">
                    <h1>Create Sprite Image</h1>
                    <button
                        className="btn-close-modal"
                        aria-label="Close"
                        onClick={close}
                    ></button>
                </div>
                <div className="container-body">
                    <div className="confirm-dialog-body">
                        <div
                            className="confirm-dialog-image-box trans_bg"
                            style={{ display: nowPlaying ? 'none' : 'block' }}
                        >
                            <div
                                className="images"
                                id="idx_sprite_image"
                                style={{
                                    backgroundImage: `url(${objectBgInfo.url})`,
                                    width: objectBgInfo.width,
                                    height: objectBgInfo.height,
                                }}
                            ></div>
                            <div
                                className="sprites"
                                style={{
                                    width: objectBgInfo.width,
                                    height: objectBgInfo.height,
                                    backgroundSize:
                                        objectBgInfo.width / spriteNo,
                                }}
                            ></div>
                        </div>
                        <div
                            className="confirm-dialog-image-ani-box trans_bg"
                            style={{ display: nowPlaying ? 'block' : 'none' }}
                        >
                            {nowPlaying === true && (
                                <div
                                    id="idx_sprite_animation_obj"
                                    className="images"
                                    style={{
                                        background: `url(${objectBgInfo.url}) left center`,
                                        width: objectBgInfo.width / spriteNo,
                                        height: objectBgInfo.height,
                                    }}
                                ></div>
                            )}
                        </div>
                    </div>
                    <div className="btn-controls">
                        <button
                            type="button"
                            aria-label="Play"
                            onClick={playAnimation}
                            style={{ display: nowPlaying ? 'none' : 'block' }}
                        ></button>
                        <button
                            type="button"
                            aria-label="Forward"
                            onClick={stopAnimation}
                            style={{ display: nowPlaying ? 'block' : 'none' }}
                        ></button>
                    </div>

                    <div
                        className="area-settings"
                        style={{ display: nowPlaying ? 'none' : '' }}
                    >
                        <div className="setting-rows">
                            <i></i>

                            <NumberForm
                                inputInfo={{
                                    id: 'idx_sprite_rows',
                                    type: 'number',
                                    unit: '',
                                    min: 1,
                                    max: 1,
                                    default: 1,
                                    changeEvt: changeRows,
                                }}
                            />

                            {/* <div className="inputbox">
                                    <input type="number" max="999" />
                                </div>
                                <div className="btn-adjust">
                                    <button aria-label='up'></button>
                                    <button aria-label='down'></button>
                                </div> */}
                        </div>
                        <div className="setting-cols">
                            <i></i>

                            <NumberForm
                                inputInfo={{
                                    id: 'idx_sprite_cols',
                                    type: 'number',
                                    unit: '',
                                    min: 1,
                                    max: 99,
                                    default: 1,
                                    changeEvt: changeCols,
                                }}
                            />

                            {/* <div className="inputbox">
                                    <input type="number" max="999" />
                                </div>
                                <div className="btn-adjust">
                                    <button aria-label='up'></button>
                                    <button aria-label='down'></button>
                                </div> */}
                        </div>
                        <div className="setting-rotate">
                            <i></i>

                            <NumberForm
                                inputInfo={{
                                    id: 'idx_sprite_repeat',
                                    type: 'number',
                                    unit: '',
                                    min: 0,
                                    max: 99,
                                    default: 1,
                                    changeEvt: changePlayRepeat,
                                }}
                            />

                            {/* <div className="inputbox">
                                    <input type="number" max="999" />
                                </div>
                                <div className="btn-adjust">
                                    <button aria-label='up'></button>
                                    <button aria-label='down'></button>
                                </div> */}
                            <button
                                className={`btn-infinite ${
                                    infiniteVal ? ' active' : ''
                                }`}
                                aria-label="Infinite"
                                onClick={e =>
                                    changeSpriteInfinify(e, infiniteVal)
                                }
                            ></button>
                        </div>
                        <div className="setting-time">
                            <i></i>

                            <NumberForm
                                inputInfo={{
                                    id: 'idx_sprite_time',
                                    type: 'number',
                                    unit: 'sec',
                                    min: 1,
                                    max: 99,
                                    default: 1,
                                    changeEvt: changePlayTime,
                                }}
                            />

                            {/* <div className="inputbox">
                                    <input type="number" max="99999" />
                                    <span>sec</span>
                                </div> */}
                        </div>
                    </div>
                </div>
                <div className="container-footer">
                    <button
                        type="button"
                        className="btn-default-action"
                        onClick={() => setSpriteInfo(currObject)}
                    >
                        OK
                    </button>
                    <button
                        type="button"
                        className="btn-default-action cancel"
                        onClick={close}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
});

export default Sprite;

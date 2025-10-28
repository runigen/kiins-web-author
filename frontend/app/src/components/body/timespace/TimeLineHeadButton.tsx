import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import $ from 'jquery';
import {
    EkeyName,
    IshapeInfo,
    EworkStatus,
    EundoStackAddType,
    // IplayTimeInfo,
} from '../../../const/types';
import {
    timelineZoomMin,
    timelineZoomMax,
    timelineZoomStep,
} from '../../../const/basicData';
import {
    convertTimeFormat,
    // parseJsonData,
    // allEventCancel,
    convertTimeToTimeLeft,
    getProgressBarPosition,
    // getTimeLineMagPixcel,
} from '../../../util/common';
// import * as TimeLineResizeEvent from '../../../event/TimeLineSizeEvent';
import * as CommonEvent from '../../../event/CommonEvent';
import * as KeyEvent from '../../../event/KeyEvent';
import * as easing from '../../../util/easing';
import * as dialog from '../../../util/dialog';
import * as keyframe from '../../../util/keyframe';
import * as transition from '../../../util/transition';
import * as objects from '../../../util/objects';
import * as dostack from '../../../util/dostack';
// import NumberForm from '../../../util/NumberForm';
import * as timeline from '../../../util/timeline';

let playBarTimer: any = 0;
//let startTime = 0;
// let totalPlayTime = 0; // 위 위치 까지 이동할 시간 (ms)
let gTotalPlayRange = 0; // 이동 후 마지막 위치 (px)
let gKeyframeRangeList: number[] = [];
let moveObjectList: any[] = [];
let gPrevObjectId = '';
let gCurrObject: any = null;
// let gPlaying = false;

let gCurrKeyframeTimeLeft = 0;
// let gCurrKeyframeTarget = '';
let gProgressbarPos = 0;
let gTimelineZoom = 1;
// let gPlayTimeInfo: IplayTimeInfo = {
//     left: 0,
//     min: '00',
//     sec: '00',
//     ms: '00',
// }

const TimeLineHeadButton = observer(() => {
    const { workInfo } = store;
    // const [show, setShow] = useState(true);
    // const [playing, setPlaying] = useState(false);
    const currObject = workInfo.getObject();
    // const objectList = workInfo.getObjectList();
    // const keyframeDataList = workInfo.getKeyframeDataList();
    //const [playTimeView, setPlayTimeView] = useState("00:00.000");
    // const totalPlayTime = workInfo.getTotalPlayTime();
    const totalPlayRange = workInfo.getTotalPlayRange();
    const keyframeRangeList = workInfo.getKeyframeRangeList();
    const updateKey = workInfo.getUpdateKey();
    const playTimeInfo = workInfo.getPlayTimeInfo();

    // const totalPlayTime =  10;
    // const totalPlayRange = 900;
    const progressbarPos = workInfo.getProgressbarPos();
    const elementDataList = workInfo.getElementDataList();

    const currKeyframeTimeLeft = workInfo.getCurrKeyframeTimeLeft();
    const currKeyframeTarget = workInfo.getCurrKeyframeTarget();

    const timelineZoom = workInfo.getTimelineZoom();
    const tilelineLimit = workInfo.getTimelineLimit();

    const autoKeyframe = workInfo.getAutoKeyframeStatus();

    const playBarMoveMSec = 20; // 1초에 100픽셀 이동으로 계산  (0.03초에 3픽셀)
    const playBarMoveLeft = 2;

    useEffect(() => {
        //console.log('keyframeDataList => ', keyframeDataList);
        // -- 전역에 할당
        moveObjectList = elementDataList;

        // element 가 없으면 플레이타임바를 0 으로
        if (moveObjectList.length === 0) {
            workInfo.setProgressbarPos(0);
        }
    }, [elementDataList]);

    useEffect(() => {
        // console.log('keyframeRangeList => ', keyframeRangeList);
        // -- 전역에 할당
        gKeyframeRangeList = keyframeRangeList;
    }, [keyframeRangeList]);

    useEffect(() => {
        if (workInfo.dataset.playing === true) {
            play();
        } else {
            stop();
        }
    }, [workInfo.dataset.playing]);

    useEffect(() => {
        gTotalPlayRange = totalPlayRange;
        console.log('totalPlayRange : ', totalPlayRange);
    }, [totalPlayRange]);

    useEffect(() => {
        gProgressbarPos = progressbarPos;
        console.log('gProgressbarPos : ', gProgressbarPos);
        moveProgressBar(progressbarPos);
        showTimeStringLeft(progressbarPos);
    }, [progressbarPos]);

    useEffect(() => {
        gCurrObject = currObject;
        if (currObject === null) {
            workInfo.setCurrKeyframeTimeLeft(0);
        }
    }, [currObject, updateKey]);

    useEffect(() => {
        gCurrKeyframeTimeLeft = currKeyframeTimeLeft;
        // gCurrKeyframeTarget = currKeyframeTarget;
    }, [currKeyframeTimeLeft, currKeyframeTarget]);

    useEffect(() => {
        gTimelineZoom = timelineZoom;
    }, [timelineZoom]);

    // useEffect(() => {
    //     gPlayTimeInfo = playTimeInfo;
    // }, [playTimeInfo]);

    const removeObjectSelector = () => {
        if (gCurrObject) {
            gPrevObjectId = gCurrObject.id;
            console.log('gPrevObjectId : ', gPrevObjectId);
            CommonEvent.unselectObjects(); // 진행바 선택시 오브젝트 모두 선택 해제
        } else {
            gPrevObjectId = '';
        }
    };
    const recoverObjectSelector = () => {
        if (gPrevObjectId) {
            setTimeout(() => {
                CommonEvent.selectObject(gPrevObjectId);
            }, 0);
        }
    };
    // const showTimeline = (bShow: boolean) => {
    //     setShow(bShow);
    //     if (bShow === true) {
    //         $('.timeline-body').removeClass('hide');
    //         $('.workspace').removeClass('notimeline');
    //     } else {
    //         $('.timeline-body').addClass('hide');
    //         $('.workspace').addClass('notimeline');
    //     }
    // };

    const checkPlayable = () => {
        let bPlayable = false;
        if (gTotalPlayRange > 0) {
            bPlayable = true;
        }
        return bPlayable;
    };

    const moveProgressBar = (val: number) => {
        $('.progressline').css('left', val);

        // 화면에 보이는 사이즈 계산
        const trackScreenWidth = $('.timeline-body-tracks').width() || 0;
        //console.log('moveProgressBar trackScreenWidth, : ', trackScreenWidth);

        const barPositionConst = 10 + 10; // 왼쪽 마진(10) + 오른쪽 여유 (10)

        const barLeftPosition = val + barPositionConst;
        //console.log('moveProgressBar barLeftPosition, : ', barLeftPosition);

        const currScollLeft = $('.timeline-body-elements').scrollLeft() || 0;
        //console.log('moveProgressBar currScollLeft, : ', currScollLeft);

        // 바가 보이는 화면 오른쪽으로 넘어가면 바 위치에 맞게 스크롤
        if (barLeftPosition > trackScreenWidth + currScollLeft) {
            $('.timeline-body-elements').scrollLeft(
                barLeftPosition - trackScreenWidth,
            );

            // 바가 보이는 화면 왼쪽으로 넘어가면 바 위치에 맞게 스크롤
        } else if (barLeftPosition < currScollLeft) {
            $('.timeline-body-elements').scrollLeft(
                barLeftPosition - barPositionConst,
            );
        }

        // -- 이동막대를 움직일때는 오브젝트 애니메이션도 같이 동작
        moveObjects(val);
    };

    const goStart = () => {
        // if (checkPlayable()) {

        if (playBarTimer) {
            clearInterval(playBarTimer);
        }
        // removeObjectSelector();
        workInfo.setProgressbarPos(0);
        workInfo.setPlaying(false);
        workInfo.setUpdateKey();
        // recoverObjectSelector();
        setTimeout(() => {
            CommonEvent.setObjectSelectorShape(gCurrObject);
        });

        // }
    };
    const goPrev = () => {
        // console.log("goPrev. gKeyframeRangeList : ", gKeyframeRangeList);

        if (gKeyframeRangeList.length <= 1) {
            goStart();
            return;
        }

        const currPos = getProgressBarPosition();
        if (currPos === 0) return;

        let goPos = 0;
        gKeyframeRangeList.map(rangeInfo => {
            if (currPos > rangeInfo) {
                goPos = rangeInfo;
            }
        });

        // removeObjectSelector()
        workInfo.setProgressbarPos(goPos * gTimelineZoom);
        workInfo.setPlaying(false);
        workInfo.setUpdateKey();
        // recoverObjectSelector();
        setTimeout(() => {
            CommonEvent.setObjectSelectorShape(gCurrObject);
        });
    };

    const togglePlay = () => {
        if (checkPlayable()) {
            workInfo.setPlaying(!workInfo.dataset.playing);
        }
    };
    const play = () => {
        if (checkPlayable()) {
            if (playBarTimer) {
                clearInterval(playBarTimer);
            }

            // const totalPlayRange =  500;  // 이동 후 마지막 위치 (px)
            // const totalPlayTime = 5000;        // 위 위치 까지 이동할 시간 (밀리초)
            let startLeft = getProgressBarPosition(); // 현재 바의 위치

            // 진행바가 이미 최대값 이상의 위치로 가 있으면 0에서부터 다시 시작한다.
            if (startLeft >= gTotalPlayRange * gTimelineZoom) {
                startLeft = 0;
            }

            removeObjectSelector();

            let addMoveUnit = startLeft;
            // let addSec = startTime;
            playBarTimer = setInterval(() => {
                addMoveUnit += playBarMoveLeft * gTimelineZoom;
                //addSec += playBarMoveMSec;
                if (addMoveUnit >= gTotalPlayRange * gTimelineZoom) {
                    addMoveUnit = gTotalPlayRange * gTimelineZoom;
                    //addSec = totalPlayTime;
                    clearInterval(playBarTimer);
                    workInfo.setPlaying(false);
                    recoverObjectSelector();
                }
                //$('.progressline').css('left', addMoveUnit);
                // moveProgressBar(addMoveUnit);
                workInfo.setProgressbarPos(addMoveUnit);
                //showTimeString(addSec);
                // showTimeStringLeft(addMoveUnit);
                //startTime = addSec;
            }, playBarMoveMSec);
        }
    };
    const stop = () => {
        if (checkPlayable()) {
            if (playBarTimer) {
                clearInterval(playBarTimer);
            }
            workInfo.setPlaying(false);
            recoverObjectSelector();
        }
    };

    const goNext = () => {
        // console.log("goNext. gKeyframeRangeList : ", gKeyframeRangeList);

        if (gKeyframeRangeList.length <= 1) return;

        const currPos = getProgressBarPosition();
        //if(currPos === 0) return;

        const goPos = gKeyframeRangeList.find(rangeInfo => currPos < rangeInfo);
        if (typeof goPos === 'undefined') return;

        // removeObjectSelector();
        workInfo.setProgressbarPos(goPos * gTimelineZoom);
        workInfo.setPlaying(false);
        workInfo.setUpdateKey();
        // recoverObjectSelector();
        setTimeout(() => {
            CommonEvent.setObjectSelectorShape(gCurrObject);
        });
    };

    const goEnd = () => {
        if (checkPlayable()) {
            if (playBarTimer) {
                clearInterval(playBarTimer);
            }
            // removeObjectSelector();
            workInfo.setProgressbarPos(gTotalPlayRange * gTimelineZoom);
            workInfo.setPlaying(false);
            workInfo.setUpdateKey();
            // recoverObjectSelector();
            setTimeout(() => {
                CommonEvent.setObjectSelectorShape(gCurrObject);
            });
        }
    };

    const checkKeyFrameSelect = () => {
        console.log('checkKeyFrameSelect : ', gCurrKeyframeTimeLeft);
        if (gCurrKeyframeTimeLeft === 0) {
            dialog.basicAlertDialog('키프레임을 선택해주세요');
            return false;
        } else {
            return true;
        }
    };

    const Easing = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (
            !checkEnabledButton(
                event.currentTarget,
                '대상 프레임을 선택해주세요',
            )
        )
            return;

        if (!checkKeyFrameSelect()) return;

        // dialog.showEasingDialog(gCurrKeyframeTarget, gCurrKeyframeTimeLeft, event);
        const keyframeStepInfo = keyframe.getKeyFrameStepInfo(
            gCurrKeyframeTimeLeft,
        );
        if (keyframeStepInfo === null) return;

        const easingVal =
            typeof keyframeStepInfo.easing !== 'undefined'
                ? keyframeStepInfo.easing
                : 'linear';

        dialog.showListItemDialog(
            'easing',
            easingVal,
            (val: any) => {
                keyframe.setKeyFrameEasingInfo(gCurrKeyframeTimeLeft, val);
                // dostack.addUndoStack(gCurrObject.id, EundoStackAddType.keyframe);
                dostack.addUndoStack('', EundoStackAddType.all);
            },
            event,
        );
    };

    const Transition = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (
            !checkEnabledButton(event.currentTarget, '대상 객체를 선택해주세요')
        )
            return;

        if (!gCurrObject) {
            dialog.basicAlertDialog('키프레임을 선택해주세요');
            return false;
        }
        console.log('Transition :: gProgressbarPos : ', gProgressbarPos);

        dialog.showListItemDialog(
            'transition',
            '',
            (val: string) => {
                console.log('Transition result : ', val);
                transition.updateTransitionInfo({
                    type: val.split('_')[0],
                    action: val.split('_')[1],
                    start: gProgressbarPos / gTimelineZoom,
                    end:
                        (gProgressbarPos + transition.defaultFadeDuration) /
                        gTimelineZoom,
                });
                // dostack.addUndoStack(gCurrObject.id, EundoStackAddType.transition);
                dostack.addUndoStack('', EundoStackAddType.all);
            },
            event,
        );
    };

    const autoKeyFrame = (event: React.MouseEvent<HTMLButtonElement>) => {
        const btnObj = event.currentTarget;
        if ($(btnObj).hasClass('active')) {
            $(btnObj).removeClass('active');
            workInfo.setAutoKeyframeStatus(false);
        } else {
            $(btnObj).addClass('active');
            workInfo.setAutoKeyframeStatus(true);
        }
    };

    const addKeyFrame = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (
            !checkEnabledButton(event.currentTarget, '대상 객체를 선택해주세요')
        )
            return;
        keyframe.addKeyFrame();
        // dostack.addUndoStack(gCurrObject.id, EundoStackAddType.keyframe);
        dostack.addUndoStack('', EundoStackAddType.all);
    };

    const checkEnabledButton = (btnObj: HTMLButtonElement, msg: string) => {
        if ($(btnObj).hasClass('disabled')) {
            dialog.showToastMessage(msg, 1);
            return false;
        } else {
            return true;
        }
    };

    // const showTimeString = (msec) => {
    //   setPlayTimeView(convertTimeFormat(msec));
    // }
    const showTimeStringLeft = (left: number) => {
        const currPlayTimeInfo = convertTimeFormat(left / gTimelineZoom);
        workInfo.setPlayTimeInfo(currPlayTimeInfo);
        // setPlayTimeView(convertTimeFormat(left));
    };

    // const addResizeEvent = (event) => {
    //     TimeLineResizeEvent.addResizeTimeLineEvent(event);
    // };

    // const getObjectPos = (obj: any, target: string) => {
    //     return parseInt($(obj).css(target), 10);
    // };

    const selectTime = (event: React.FocusEvent<HTMLInputElement>) => {
        const inputObj = event.currentTarget;
        inputObj.select();
        workInfo.setStatus(EworkStatus.timeInput);
    };

    const unselectTime = () => {
        workInfo.setStatus(EworkStatus.none);
    };

    const keydownPlayTimeInfo = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        // console.log("keydownPlayTimeInfo Call--------------------------");
        // const inputObj = event.currentTarget;

        const currKeyCode = KeyEvent.getKeyCode(event);
        console.log('currKeyCode: ', currKeyCode);

        if (currKeyCode !== EkeyName.UP && currKeyCode !== EkeyName.DOWN) {
            return;
        }

        const inputObj = event.currentTarget;
        let newVal = 0;

        let minVal: any = $('#idx_timecontol_min').val();
        let secVal: any = $('#idx_timecontol_sec').val();
        let msVal: any = $('#idx_timecontol_ms').val();

        if (
            inputObj.id === 'idx_timecontol_min' ||
            inputObj.id === 'idx_timecontol_sec'
        ) {
            if (currKeyCode === EkeyName.UP) {
                newVal = parseInt(inputObj.value, 10) + 1;
            } else {
                newVal = parseInt(inputObj.value, 10) - 1;
            }
            if (inputObj.id === 'idx_timecontol_min') {
                minVal = newVal;
            } else {
                secVal = newVal;
            }
        } else {
            if (currKeyCode === EkeyName.UP) {
                newVal = parseInt(inputObj.value, 10) + 10;
            } else {
                newVal = parseInt(inputObj.value, 10) - 10;
            }
            msVal = newVal;
        }

        // removeObjectSelector();

        if (minVal < 0) minVal = 0;
        if (secVal < 0) secVal = 0;
        if (msVal < 0) msVal = 0;

        console.log(minVal, secVal, msVal);
        const movePos = convertTimeToTimeLeft({
            min: minVal,
            sec: secVal,
            ms: msVal,
        });
        workInfo.setProgressbarPos(movePos);

        // recoverObjectSelector();
        setTimeout(() => {
            CommonEvent.setObjectSelectorShape(gCurrObject);
        });
    };

    const changePlayTimeInfo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputObj = event.currentTarget;
        const currVal = inputObj.value;
        if (!currVal.match(/^[0-9]*$/)) {
            console.log('NaN');
            return false;
        }

        removeObjectSelector();

        const minVal = Number($('#idx_timecontol_min').val());
        const secVal = Number($('#idx_timecontol_sec').val());
        const msVal = Number($('#idx_timecontol_ms').val());

        console.log(minVal, secVal, msVal);
        const movePos = convertTimeToTimeLeft({
            min: minVal,
            sec: secVal,
            ms: msVal,
        });
        workInfo.setProgressbarPos(movePos);

        recoverObjectSelector();
    };

    const moveObjects = (timeLeftPos: number) => {
        try {
            timeLeftPos = timeLeftPos / gTimelineZoom;

            // console.log("timeLeftPos: ",timeLeftPos);
            // console.log("gTotalPlayRange: ",gTotalPlayRange);

            if (timeLeftPos > gTotalPlayRange) return;

            // -- userInfo.progressbarPos 값이 이미 0 인경우 0으로 세팅해도 작동하지 않는 문제가 있어 -1로 세팅할수도 있으므로 아래 코드 사용
            if (timeLeftPos < 0) timeLeftPos = 0;

            moveObjectList.map((moveObject: any) => {
                if (!moveObject.keyframeInfoData) {
                    return false;
                }

                // ------------------------------------------------ transform
                moveObject.keyframeInfoData.map((data: any) => {
                    // if(!keyframeData)
                    //     return false;

                    // const currTarget = keyframeData.target;
                    // const currMoveData = keyframeData.moveData;

                    // keyframeData.map(data => {

                    //현재 위치가 키프레임(timeLeft) 이동 범위안에 들어오면
                    // if(timeLeftPos >= data.timeLeft[0] && timeLeftPos <= data.timeLeft[1]) {

                    const startTimeLeft: number = data.timeLeft[0];
                    const endTimeLeft: number = data.timeLeft[1];
                    const startSize: IshapeInfo = data.size[0];
                    const endSize: IshapeInfo = data.size[1];
                    //const sizeRange = endSize-startSize;

                    if (timeLeftPos === startTimeLeft) {
                        // $(moveObject).css(currTarget, startSize);
                        objects.setObjectShapeInfo(moveObject, startSize);
                        // return false;
                    } else if (timeLeftPos === endTimeLeft) {
                        // $(moveObject).css(currTarget, endSize);
                        objects.setObjectShapeInfo(moveObject, endSize);
                        // return false;
                    } else if (
                        timeLeftPos > startTimeLeft &&
                        timeLeftPos < endTimeLeft
                    ) {
                        // 타임라인 1 이동시 움직일 오브젝트 사이즈
                        /*
                        const unitSize = sizeRange/timeLeftRange;
                        const movingSize = movedTimeLeft * unitSize;
                        const totalMovingSize = startSize + movingSize;
                        */

                        /**
                         *  t : current time => movedTimeLeft
                            b : start value => startSize
                            c : change in value => sizeRange
                            d : duration => timeLeftRange
                            */
                        //const totalMovingSize = easing.linear(movedTimeLeft, startSize, sizeRange, timeLeftRange);

                        //let sizeRange = endSize-startSize;
                        const topSizeRange = endSize.top - startSize.top;
                        const leftSizeRange = endSize.left - startSize.left;
                        const widthSizeRanage = endSize.width - startSize.width;
                        const heightSizeRanage =
                            endSize.height - startSize.height;
                        const rotateSizeRange =
                            endSize.rotate - startSize.rotate;
                        const scaleSizeRange = endSize.scale - startSize.scale;
                        const opacitySizeRanage =
                            endSize.opacity - startSize.opacity;

                        // border-radius 는 px, % 단위가 있어서 따로 처리
                        const startBorderRadius = Math.round(
                            (startSize.borderRadius || '').indexOf('%') > -1
                                ? Number(
                                      (startSize.borderRadius || '').replace(
                                          /(px|%)$/,
                                          '',
                                      ),
                                  ) *
                                      0.01 *
                                      (startSize.width > startSize.height
                                          ? startSize.width
                                          : startSize.height)
                                : Number(
                                      (startSize.borderRadius || '').replace(
                                          /(px|%)$/,
                                          '',
                                      ),
                                  ),
                        );
                        const endBorderRadius = Math.round(
                            (endSize.borderRadius || '').indexOf('%') > -1
                                ? Number(
                                      (endSize.borderRadius || '').replace(
                                          /(px|%)$/,
                                          '',
                                      ),
                                  ) *
                                      0.01 *
                                      (endSize.width > endSize.height
                                          ? endSize.width
                                          : endSize.height)
                                : Number(
                                      (endSize.borderRadius || '').replace(
                                          /(px|%)$/,
                                          '',
                                      ),
                                  ),
                        );
                        const borderRadiusRange =
                            endBorderRadius - startBorderRadius;

                        // -- 변경된값이 없으면 종료
                        if (
                            topSizeRange === 0 &&
                            leftSizeRange === 0 &&
                            widthSizeRanage === 0 &&
                            heightSizeRanage === 0 &&
                            rotateSizeRange === 0 &&
                            scaleSizeRange === 0 &&
                            opacitySizeRanage === 0 &&
                            borderRadiusRange === 0
                        ) {
                            console.log('No Move Action');
                            return;
                        }

                        const currEasing = data.easing || 'linear';
                        const timeLeftRange = endTimeLeft - startTimeLeft;
                        const movedTimeLeft = timeLeftPos - startTimeLeft;

                        const topMovingSize =
                            topSizeRange === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.top,
                                      topSizeRange,
                                      timeLeftRange,
                                  );
                        const leftMovingSize =
                            leftSizeRange === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.left,
                                      leftSizeRange,
                                      timeLeftRange,
                                  );
                        const widthMovingSize =
                            widthSizeRanage === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.width,
                                      widthSizeRanage,
                                      timeLeftRange,
                                  );
                        const heightMovingSize =
                            heightSizeRanage === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.height,
                                      heightSizeRanage,
                                      timeLeftRange,
                                  );
                        const rotateMovingSize =
                            rotateSizeRange === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.rotate,
                                      rotateSizeRange,
                                      timeLeftRange,
                                  );
                        const scaleMovingSize =
                            scaleSizeRange === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.scale,
                                      scaleSizeRange,
                                      timeLeftRange,
                                  );
                        const opacityMovingSize =
                            opacitySizeRanage === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startSize.opacity,
                                      opacitySizeRanage,
                                      timeLeftRange,
                                  );
                        const borderRadiusMovingSize =
                            borderRadiusRange === 0
                                ? Infinity
                                : easing.getEasingMoveSize(
                                      currEasing,
                                      movedTimeLeft,
                                      startBorderRadius,
                                      borderRadiusRange,
                                      timeLeftRange,
                                  );

                        const movingSizeInfo: IshapeInfo = {
                            top: topMovingSize,
                            left: leftMovingSize,
                            width: widthMovingSize,
                            height: heightMovingSize,
                            rotate: rotateMovingSize,
                            scale: scaleMovingSize,
                            opacity: opacityMovingSize,
                            borderRadius: (borderRadiusMovingSize || 0) + 'px',
                        };

                        objects.setObjectShapeInfo(moveObject, movingSizeInfo);
                    }

                    // });
                });

                // ------------------------------------------------ transition
                if (moveObject.transitionInfo.length > 0) {
                    // 현재 timeLeftPos 범위의 transition 을 모두 찾는다.
                    const currTransitionInfoList =
                        moveObject.transitionInfo.filter(
                            (transitionInfo: any) =>
                                timeLeftPos >= transitionInfo.start &&
                                timeLeftPos <= transitionInfo.end,
                        );

                    // -- 현재 timeLeftPos 범위의 transition이 있는경우
                    if (currTransitionInfoList.length > 0) {
                        currTransitionInfoList.map(
                            (currTransitionInfo: any) => {
                                if (currTransitionInfo.type === 'appear') {
                                    if (
                                        currTransitionInfo.action === 'appear'
                                    ) {
                                        $(moveObject).css('opacity', 1);
                                    } else {
                                        $(moveObject).css('opacity', 0);
                                    }
                                } else if (currTransitionInfo.type === 'fade') {
                                    const unitVal =
                                        1 /
                                        (currTransitionInfo.end -
                                            currTransitionInfo.start);
                                    const calcCurrOpacityVal = Number(
                                        (
                                            (timeLeftPos -
                                                currTransitionInfo.start) *
                                            unitVal
                                        ).toFixed(3),
                                    );
                                    let applyOpacityVal = calcCurrOpacityVal;
                                    if (currTransitionInfo.action === 'out') {
                                        applyOpacityVal = Number(
                                            (1 - calcCurrOpacityVal).toFixed(3),
                                        );
                                    }
                                    if (applyOpacityVal < 0)
                                        applyOpacityVal = 0;
                                    if (applyOpacityVal > 1)
                                        applyOpacityVal = 1;
                                    console.log(
                                        'applyOpacityVal : ',
                                        applyOpacityVal,
                                    );
                                    $(moveObject).css(
                                        'opacity',
                                        applyOpacityVal,
                                    );
                                }
                            },
                        );

                        // -- 현재 timeLeftPos 범위의 transition이 없는경우
                    } else {
                        console.log('not transition area');

                        // 전체 transitionList 중 현재 timeLeftPos 보다 작은값을 가진 transition.end 값 검사하여 그중 최대값 (뒤에서부터 검사)
                        console.log(
                            'moveObject.transitionInfo : ',
                            moveObject.transitionInfo,
                        );
                        const reverseTransitionList = [
                            ...moveObject.transitionInfo,
                        ].reverse();
                        console.log(
                            'reverseTransitionList : ',
                            reverseTransitionList,
                        );
                        const prevTransitionInfo = reverseTransitionList.find(
                            transitionInfo => timeLeftPos > transitionInfo.end,
                        );
                        console.log(
                            'prevTransitionInfo : ',
                            prevTransitionInfo,
                        );

                        // 해당값이 있는경우
                        if (typeof prevTransitionInfo !== 'undefined') {
                            if (prevTransitionInfo.type === 'appear') {
                                if (prevTransitionInfo.action === 'appear') {
                                    $(moveObject).css('opacity', 1);
                                } else {
                                    $(moveObject).css('opacity', 0);
                                }
                            } else if (prevTransitionInfo.type === 'fade') {
                                if (prevTransitionInfo.action === 'in') {
                                    $(moveObject).css('opacity', 1);
                                } else {
                                    $(moveObject).css('opacity', 0);
                                }
                            }

                            // 해당값이 없는경우 transitionList 중 첫번째 transition 으로 검사
                        } else {
                            const firstTransitionInfo =
                                moveObject.transitionInfo[0];
                            console.log(
                                'firstTransitionInfo : ',
                                firstTransitionInfo,
                            );

                            if (firstTransitionInfo.type === 'appear') {
                                if (firstTransitionInfo.action === 'appear') {
                                    $(moveObject).css('opacity', 0);
                                } else {
                                    $(moveObject).css('opacity', 1);
                                }
                            } else if (firstTransitionInfo.type === 'fade') {
                                if (firstTransitionInfo.action === 'in') {
                                    $(moveObject).css('opacity', 0);
                                } else {
                                    $(moveObject).css('opacity', 1);
                                }
                            }
                        }
                    }
                } else {
                    // console.log("no transition action list ~~~");
                }
            });
        } catch (e) {
            console.log(e);
        }
    };
    const changeTimelineZoomRatio = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const zoomRatioVal = Number(
            (Number(event.currentTarget.value) / 100).toFixed(2),
        );
        event.currentTarget.value = String(zoomRatioVal * 100);
        console.log('zoomRatioVal : ', zoomRatioVal);
        timeline.applyTimelineZoom(zoomRatioVal);
    };

    return (
        <div className="timeline-head-buttons">
            <div className="time-control">
                <input
                    type="text"
                    name="timecontol_min"
                    id="idx_timecontol_min"
                    value={playTimeInfo.min}
                    onFocus={e => selectTime(e)}
                    onBlur={unselectTime}
                    onKeyDown={e => keydownPlayTimeInfo(e)}
                    onChange={e => changePlayTimeInfo(e)}
                />
                :
                <input
                    type="text"
                    name="timecontol_sec"
                    id="idx_timecontol_sec"
                    value={playTimeInfo.sec}
                    onFocus={e => selectTime(e)}
                    onBlur={unselectTime}
                    onKeyDown={e => keydownPlayTimeInfo(e)}
                    onChange={e => changePlayTimeInfo(e)}
                />
                .
                <input
                    type="text"
                    name="timecontol_ms"
                    id="idx_timecontol_ms"
                    value={playTimeInfo.ms}
                    onFocus={e => selectTime(e)}
                    onBlur={unselectTime}
                    onKeyDown={e => keydownPlayTimeInfo(e)}
                    onChange={e => changePlayTimeInfo(e)}
                />
            </div>

            <div className="btns-func">
                <button
                    type="button"
                    title="AutoKeyFrame"
                    className={`btn_func_autokeyf ${
                        autoKeyframe ? 'active' : 'default'
                    }`}
                    onClick={e => autoKeyFrame(e)}
                ></button>
                <button
                    type="button"
                    title="AddKeyFrame"
                    className={`btn_func_addkeyf ${
                        currObject ? 'default' : 'disabled'
                    }`}
                    onClick={e => addKeyFrame(e)}
                ></button>

                {/* <button type="button" title="Copy Keyframe" className="btn_func_copy"></button>   
                <button type="button" title="Paste Keyframe" className="btn_func_paste"></button>            */}
                <button
                    type="button"
                    title="FadeIn"
                    className={`btn_func_fadeIn`}
                ></button>
                <button
                    type="button"
                    title="FadeOut"
                    className={`btn_func_fadeOut`}
                ></button>
                <button
                    type="button"
                    title="Easing"
                    className={`btn_func_easing ${
                        currKeyframeTimeLeft ? 'default' : 'disabled'
                    }`}
                    onClick={e => Easing(e)}
                ></button>
                <button
                    type="button"
                    title="Transition"
                    className={`btn_func_transition ${
                        currObject ? 'default' : 'disabled'
                    }`}
                    onClick={e => Transition(e)}
                ></button>
            </div>
            <div className="btns-ctrl">
                <button
                    type="button"
                    title="backward"
                    className="btn_backward"
                    onClick={goStart}
                ></button>
                <button
                    type="button"
                    title="backward_step"
                    className="btn_backward_step"
                    onClick={goPrev}
                >
                    {' '}
                </button>
                <button
                    type="button"
                    title={`${
                        workInfo.dataset.playing === true ? 'stop' : 'play'
                    }`}
                    className={`${
                        workInfo.dataset.playing === true
                            ? 'btn_stop'
                            : 'btn_play'
                    }`}
                    onClick={togglePlay}
                ></button>
                <button
                    type="button"
                    title="forward_step"
                    className="btn_forward_step"
                    onClick={goNext}
                ></button>
                <button
                    type="button"
                    title="forward"
                    className="btn_forward"
                    onClick={goEnd}
                ></button>
            </div>
            <div className="box-right">
                <div className="zoom-control">
                    <button
                        type="button"
                        className="btn-zoom-out"
                        onClick={() => timeline.resizeTimelineZoomRatio('dec')}
                    ></button>
                    <input
                        type="range"
                        id="timeline_zoom_range"
                        step={timelineZoomStep}
                        min={timelineZoomMin}
                        max={timelineZoomMax}
                        onChange={changeTimelineZoomRatio}
                        defaultValue="100"
                    />
                    <button
                        type="button"
                        className="btn-zoom-in"
                        onClick={() => timeline.resizeTimelineZoomRatio('inc')}
                    ></button>
                    <button
                        type="button"
                        className="btn-zoom-fit"
                        onClick={timeline.initTimelineZoomRatio}
                    ></button>
                </div>
                <div className="timeline-space-control">
                    <button
                        type="button"
                        onClick={() => timeline.incTimelineLimit(10)}
                    >
                        +10
                    </button>
                    <button
                        type="button"
                        onClick={() => timeline.incTimelineLimit(30)}
                    >
                        +30
                    </button>
                    <button
                        type="button"
                        onClick={() => timeline.incTimelineLimit(60)}
                    >
                        +60
                    </button>
                    <div className="ctrl-box">
                        <input
                            type="text"
                            id="idx_timeline_limit"
                            readOnly={true}
                            value={tilelineLimit}
                        />
                        <span>s</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TimeLineHeadButton;

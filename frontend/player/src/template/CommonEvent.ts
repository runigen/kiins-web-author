import * as util from '../util';
import anime from 'animejs';
import {
    IkeyframeInfo,
    ItransitionInfo,
    IinteractionsInfo,
    ETemplateType,
    EkeyName,
    ILogic_Action_List_Info,
    ILogic_Normal_Actions_Info,
    ILogic_Transform_Actions_Info,
    ELogic_Action_Type,
    ELogic_Action_Transform_Operator_Type,
    ELogic_Transform_Actions_Type,
    ELogic_Normal_Actions_Type,
    ILogic_Conneted_Info,
    ELogic_Object_Type,
    ELogic_Action_Transform_Size_Type,
    ILogic_Condition_Info,
    ELogic_Condition_Actions_Type,
    ELogic_Action_Condition_Type,
    ELogic_Actions_Out_Condition_Type,
    ILogic_Audio_Actions_Info,
    ILogic_Quiz_Actions_Info,
    ILogic_Data_Actions_Info,
    EobjectType,
    ILogic_Data_FormData_StoreInfo,
    ELogic_Action_Data_Field_Type,
    ETemplete_Object_Type,
} from '../types';
import * as LineTemplateEvent from './LineTemplateEvent';
import * as SelectTemplateEvent from './SelectTemplateEvent';
import * as ResultTemplateEvent from './ResultTemplateEvent';
import * as QuizTemplateEvent from './QuizTemplateEvent';
import * as DataStore from '../store/DataStore';

const previewIdChar = 'V_';
let tlList: any[] = [];
let objectInfoList: any[] = [];
let loadedPageNo = 1;
let resultDataList: any[] = []; // 결과값 저장용
let totalPage = 1;
let bAddPreviewWindowKeyDownEvent = false;
let totalScore = 0;
// const addScore = 100;
const storeFormTypeList = ['input-box', 'check-box']; // 폼값 저장시 저장할 폼 종류

// 페이지의 pageload 에 대한 인터렉션 설정
let windowKeyDownEventObjectInfo: {
    trigger: string;
    action: string;
    targetObjectList: any[];
} | null = null;

export const setCanvasContents = (pageNo = 1) => {
    try {
        if (
            window.globalContent === undefined ||
            window.globalContent.docContentList === undefined ||
            Array.isArray(window.globalContent.docContentList) !== true
        ) {
            return;
        }

        // 윈도우 이벤트가 이미 지정되어 있으면 해제
        if (bAddPreviewWindowKeyDownEvent === true) {
            window.removeEventListener('keydown', addPreviewWindowKeyDownEvent);
            bAddPreviewWindowKeyDownEvent = false;
            console.log('removeEventListener : addPreviewWindowKeyDownEvent');
        }

        const totalPage = getTotalPage();
        if (pageNo > totalPage) {
            pageNo = totalPage;
        }
        if (pageNo < 1) {
            pageNo = 1;
        }
        setLoadedPageNo(pageNo);

        console.log(`loadPage : ${pageNo} / ${totalPage}`);

        const previewContainer = util.getPreviewContainer();
        if (previewContainer === null) return;
        previewContainer.innerHTML =
            window.globalContent.docContentList[pageNo - 1].docPageContent;

        // 페이지 사이즈 값으로 컨테이너 사이즈 설정
        const pageObj = util.getPreviewPageObject();
        if (pageObj === null) return;
        previewContainer.style.width = pageObj.style.width;
        previewContainer.style.height = pageObj.style.height;

        // 로드 후 기본 컨텐츠 소스 정리
        initializeSource(previewContainer);

        // 이벤트 설정
        setPreviewContentsEvent();

        // youtube 플레이 환경 설정
        setYoutubePlayEnv(previewContainer);

        // tpl set
        const previewPageObject = util.getPreviewPageObject();
        if (previewPageObject) {
            const tplType: ETemplateType = previewPageObject.getAttribute(
                'tpl-type',
            ) as ETemplateType | ETemplateType.none;
            if (tplType !== ETemplateType.none) {
                setTemplateContentsEvent(tplType);
            }
            if (tplType !== ETemplateType.result) {
                // setTotalScore(0);
            }
            showTotalScore();
            // setLoadedPageNo(pageNo);
        }
    } catch (e) {
        console.log(e);
    }
};

const setYoutubePlayEnv = (previewContainer: HTMLDivElement) => {
    const youtubeObjList = previewContainer.querySelectorAll(
        '.object.youtube',
    ) as NodeListOf<HTMLDivElement>;
    youtubeObjList.forEach((element: HTMLDivElement) => {
        const bMute = element.getAttribute('mute') || 'false';
        const bAutoPlay = element.getAttribute('autoplay') || 'false';
        const youtubeSrc =
            element.querySelector('iframe')?.getAttribute('src') || '';
        if (youtubeSrc) {
            let src = youtubeSrc;
            const paramList: string[] = [];
            if (bMute === 'true') {
                paramList.push('mute=1');
            }
            if (bAutoPlay === 'true') {
                paramList.push('autoplay=1');
            }
            if (paramList.length > 0) {
                src += `&${paramList.join('&')}`;
                element.querySelector('iframe')?.setAttribute('src', src);
            }
        }
    });
};

// 페이지 초기 내용 정리
const initializeSource = (container: HTMLDivElement) => {
    // input-box 에 설정된 disabled 속성을 제거한다.(편집시 적용된 부분)
    const inputBoxObj = container.querySelectorAll(
        '.object.square.input-box input, .object.square.check-box input',
    ) as NodeListOf<HTMLDivElement>;
    inputBoxObj.forEach((element: HTMLDivElement) => {
        element.removeAttribute('disabled');
        element.removeAttribute('readonly');
    });
};

export const setPreviewContentsEvent = () => {
    try {
        // const minTimeLeft = 0;
        let maxTimeLeft = 0;
        objectInfoList = [];
        tlList = [];
        const previewContainer = util.getPreviewContainer();
        if (previewContainer === null) return;

        const previewPageObject = util.getPreviewPageObject();
        if (previewPageObject === null) return;
        previewPageObject.id = previewIdChar + previewPageObject.id;

        const objectList = previewContainer.querySelectorAll('.object');
        if (objectList === null || objectList.length === 0) return;

        objectList.forEach((element: any) => {
            // id 변경
            element.id = previewIdChar + element.id;
            console.log(element.id);

            // check박스인경우 내부 아이디도 변경
            if (element.classList.contains('check-box')) {
                const checkObj = element.querySelector(
                    'input.check-box',
                ) as HTMLDivElement;
                if (checkObj) {
                    checkObj.id = previewIdChar + checkObj.id;
                    const labelObj = element.querySelector(
                        'label.check-box',
                    ) as HTMLDivElement;
                    labelObj.setAttribute('for', checkObj.id);
                }
            }

            // -------------------------------------------------------------------------------------------------------- 각 설정값 로드
            // -- 1. 키프레임 정보 로드
            const currKeyframeInfo = util.getKeyFrameInfo(element);
            console.log('currKeyframeInfo: ', currKeyframeInfo);
            // console.log(currKeyframeInfo);

            // -- 2. 트랜지션 정보 로드
            const currTransitionInfo = util.getTransitionInfo(element);
            // console.log(currKeyframeInfo);

            // -- 3. 인터렉션 정보 로드
            const currInteractions = util.getInteractionsInfo(element);

            // -- 4. 애니메이션 정보 로드
            const currAnimationInfo = util.getAnimationInfo(element);

            // -- 5. sprite 정보 로드
            const currSpriteInfo = util.getSpriteInfo(element);
            console.log('currSpriteInfo: ', currSpriteInfo);

            // 1. keyfrmae 애니메이션 적용
            if (currKeyframeInfo.length > 0) {
                // 반복 처리
                let currLoop: number | boolean = false;
                if (currAnimationInfo) {
                    currLoop =
                        currAnimationInfo.repeat === 0
                            ? true
                            : currAnimationInfo.repeat;
                }

                const tlKeyframe = anime.timeline({
                    targets: element,
                    loop: currLoop,
                    autoplay: false,
                    complete: () => {
                        // 애니메이션 종료 시 인터렉션 처리
                        if (
                            currInteractions.filter(
                                (item: IinteractionsInfo) =>
                                    item.trigger === 'complete',
                            ).length > 0
                        ) {
                            setCompleteInteractions(element, currInteractions);
                        }
                    },
                    update: function () {
                        if (
                            currInteractions.filter(
                                (item: IinteractionsInfo) =>
                                    item.trigger === 'collision',
                            ).length > 0
                        ) {
                            setCollisionInteractions(
                                element,
                                currInteractions.filter(
                                    (item: IinteractionsInfo) =>
                                        item.trigger === 'collision',
                                ),
                            );
                        }
                    },
                });

                element.style.left = currKeyframeInfo[0].size.left + 'px';
                element.style.top = currKeyframeInfo[0].size.top + 'px';
                element.style.width = currKeyframeInfo[0].size.width + 'px';
                element.style.height = currKeyframeInfo[0].size.height + 'px';
                element.style.transform =
                    'rotate(' +
                    currKeyframeInfo[0].size.rotate +
                    'deg) scale(' +
                    currKeyframeInfo[0].size.scale +
                    ')';
                element.style.opacity = currKeyframeInfo[0].size.opacity;
                element.style.borderRadius =
                    currKeyframeInfo[0].size.borderRadius;

                let prevSec = 0;
                let currSec = 0;
                let delayVal = 0;
                currKeyframeInfo.map(
                    (keyframeInfo: IkeyframeInfo, index2: number) => {
                        if (keyframeInfo.timeLeft > maxTimeLeft) {
                            maxTimeLeft = keyframeInfo.timeLeft;
                        }

                        const currLeft = keyframeInfo.size.left;
                        const currTop = keyframeInfo.size.top;
                        const currWidth = keyframeInfo.size.width;
                        const currHeight = keyframeInfo.size.height;
                        const currRotate = keyframeInfo.size.rotate;
                        const currScale = keyframeInfo.size.scale;
                        const currEase = util.convertAnimeEase(
                            keyframeInfo.easing,
                        );
                        const currOpacity = keyframeInfo.size.opacity;
                        const currIgnore = keyframeInfo.ignore || {
                            x: false,
                            y: false,
                        };
                        const currBorderRadius =
                            keyframeInfo.size.borderRadius || '0';

                        console.log('currEase : ', currEase);

                        currSec = keyframeInfo.timeLeft / 100 - prevSec;

                        // 시작이 0초가 아닌 경우 delay 처리
                        if (index2 === 0 && keyframeInfo.timeLeft > 0) {
                            delayVal = keyframeInfo.timeLeft / 100;
                        }

                        console.log(
                            'delayVal :',
                            delayVal,
                            ', currSec :',
                            currSec,
                        );
                        prevSec = keyframeInfo.timeLeft / 100;

                        // 첫번째 키프레임은 애니메이션 시작시 이미 가 있으므로 타임라인에 추가하지 않는다.
                        // if (index2 > 0) {
                        let timelineObj: any = {
                            width: currWidth,
                            height: currHeight,
                            rotate: currRotate,
                            scale: currScale,
                            opacity: currOpacity,
                            duration: currSec * 1000,
                            easing: currEase,
                            delay: delayVal * 1000,
                        };
                        if (currBorderRadius !== '') {
                            timelineObj = {
                                ...timelineObj,
                                borderRadius: currBorderRadius,
                            };
                        }

                        if (currIgnore.x !== true) {
                            timelineObj = {
                                ...timelineObj,
                                left: currLeft,
                            };
                        }
                        if (currIgnore.y !== true) {
                            timelineObj = {
                                ...timelineObj,
                                top: currTop,
                            };
                        }
                        tlKeyframe.add(timelineObj);
                        console.log('tlKeyframe.add index2 : ', index2);
                        console.log('timelineObj : ', timelineObj);
                        /*
                            if (currIgnore.x && currIgnore.y) {
                                tlKeyframe.add({
                                    // left: currLeft,
                                    // top: currTop,
                                    width: currWidth,
                                    height: currHeight,
                                    rotate: currRotate,
                                    scale: currScale,
                                    opacity: currOpacity,
                                    duration: currSec * 1000,
                                    easing: currEase,
                                    delay: delayVal * 1000,
                                });
                            } else if (currIgnore.x) {
                                tlKeyframe.add({
                                    // left: currLeft,
                                    top: currTop,
                                    width: currWidth,
                                    height: currHeight,
                                    rotate: currRotate,
                                    scale: currScale,
                                    opacity: currOpacity,
                                    duration: currSec * 1000,
                                    easing: currEase,
                                    delay: delayVal * 1000,
                                });
                            } else if (currIgnore.y) {
                                tlKeyframe.add({
                                    left: currLeft,
                                    // top: currTop,
                                    width: currWidth,
                                    height: currHeight,
                                    rotate: currRotate,
                                    scale: currScale,
                                    opacity: currOpacity,
                                    duration: currSec * 1000,
                                    easing: currEase,
                                    delay: delayVal * 1000,
                                });
                            } else {
                                tlKeyframe.add({
                                    left: currLeft,
                                    top: currTop,
                                    width: currWidth,
                                    height: currHeight,
                                    rotate: currRotate,
                                    scale: currScale,
                                    opacity: currOpacity,
                                    duration: currSec * 1000,
                                    easing: currEase,
                                    delay: delayVal * 1000,
                                });
                            }
                        */

                        // 처음 delay를 사용했다면 이후의 delay는 0
                        if (delayVal > 0) {
                            delayVal = 0;
                        }
                        // }
                    },
                );

                tlKeyframe.pause();
                tlList.push(tlKeyframe);
            } else {
                const tlKeyframe = anime.timeline();
                tlKeyframe.pause();
                tlList.push(tlKeyframe);
            }

            // -- 객체별 인터렉션 정보를 별도의 변수에 세팅
            objectInfoList.push({
                object: element,
                id: element.id,
                tlIndex: tlList.length - 1,
                interactions: currInteractions,
            });

            // 2. sprite 애니메이션 적용
            if (currSpriteInfo) {
                const currLoop =
                    currSpriteInfo.repeat === 0 ? true : currSpriteInfo.repeat;
                const startPosition =
                    currSpriteInfo.totalSize / currSpriteInfo.cols;
                const endPosition =
                    currSpriteInfo.totalSize / currSpriteInfo.cols -
                    currSpriteInfo.totalSize;
                const spKeyframe = anime({
                    loop: currLoop,
                    autoplay: false,
                    targets: element,
                    // backgroundPosition:
                    //     -(
                    //         currSpriteInfo.totalSize -
                    //         currSpriteInfo.totalSize / currSpriteInfo.cols
                    //     ) + 'px',
                    backgroundPosition: [
                        `${startPosition}px`,
                        `${endPosition}px`,
                    ],
                    duration: currSpriteInfo.duration * 1000,
                    // easing: 'steps(' + (currSpriteInfo.cols - 1) + ')',
                    easing: 'steps(' + currSpriteInfo.cols + ')',
                    update: function () {
                        if (
                            currInteractions.filter(
                                (item: IinteractionsInfo) =>
                                    item.trigger === 'collision',
                            ).length > 0
                        ) {
                            setCollisionInteractions(
                                element,
                                currInteractions.filter(
                                    (item: IinteractionsInfo) =>
                                        item.trigger === 'collision',
                                ),
                            );
                        }
                    },
                });

                spKeyframe.pause();
                tlList.push(spKeyframe);

                // -- 객체별 인터렉션 정보를 별도의 변수에 세팅
                objectInfoList.push({
                    object: element,
                    id: element.id,
                    tlIndex: tlList.length - 1,
                    interactions: [],
                });
            }

            // -------------------------------------------------------------------------------------------------------- 로드된 트랜지션 설정값 적용
            if (currTransitionInfo.length > 0) {
                console.log('currTransitionInfo : ', currTransitionInfo);

                // appear, fade 를 분리
                const appearList = currTransitionInfo.filter(
                    (item: any) => item.type === 'appear',
                );
                const fadeList = currTransitionInfo.filter(
                    (item: any) => item.type === 'fade',
                );

                // appear는 개수만큼 단독 애니메이션 적용
                if (appearList.length > 0) {
                    let currStart = 0;
                    // let currEnd = 0;
                    appearList.map((transitionInfo: ItransitionInfo) => {
                        currStart = transitionInfo.start;
                        // currEnd = transitionInfo.end;
                        const nowDelay = currStart * 10;
                        // const nowDuration = (currEnd - currStart) * 10;

                        let tlTransition: any = null;
                        if (transitionInfo.action === 'appear') {
                            tlTransition = anime({
                                targets: element,
                                loop: false,
                                autoplay: false,
                                delay: nowDelay,
                                duration: 0,
                                opacity: 1,
                                begin: function () {
                                    console.log('begin appear');
                                    // element.style.display = 'block';
                                },
                                complete: () => {
                                    element.style.display = 'block';
                                    console.log('complete appear');
                                },
                            });
                        } else {
                            tlTransition = anime({
                                targets: element,
                                loop: false,
                                autoplay: false,
                                delay: nowDelay,
                                duration: 0,
                                opacity: 1,
                                begin: function () {
                                    console.log('begin disappear');
                                    // element.style.display = 'block';
                                },
                                complete: () => {
                                    element.style.display = 'none';
                                    console.log('complete disappear');
                                },
                            });
                        }

                        if (tlTransition !== null) {
                            tlTransition.pause();
                            tlList.push(tlTransition);

                            objectInfoList.push({
                                object: element,
                                id: element.id,
                                tlIndex: tlList.length - 1,
                                interactions: [],
                            });
                        }
                    });
                }

                // fade 는 하나의 타임라인에 묶어서 연속 적용 (단독으로 적용할 경우 fade-out , fade-in이 동시적용되어 보이지 않는 현상 발생)
                if (fadeList.length > 0) {
                    const tlTransition = anime.timeline({
                        targets: element,
                        loop: false,
                        autoplay: false,
                    });

                    // let prevStart = 0;
                    let currStart = 0;
                    let prevEnd = 0;
                    let currEnd = 0;
                    currTransitionInfo.map(
                        (transitionInfo: ItransitionInfo) => {
                            currStart = transitionInfo.start;
                            currEnd = transitionInfo.end;

                            const currDelay = (currStart - prevEnd) / 100;
                            const currDuration = (currEnd - currStart) / 100; //(transitionInfo.end-transitionInfo.start)/100;

                            console.log(
                                transitionInfo.type,
                                ',',
                                transitionInfo.action,
                                ' : delay : ',
                                currDelay * 1000,
                                'duration : ',
                                currDuration * 1000,
                            );

                            if (transitionInfo.action === 'in') {
                                tlTransition.add({
                                    opacity: [0, 1],
                                    delay: currDelay * 1000,
                                    duration: currDuration * 1000,
                                    easing: 'linear',
                                });
                            } else {
                                tlTransition.add({
                                    opacity: [1, 0],
                                    delay: currDelay * 1000,
                                    duration: currDuration * 1000,
                                    easing: 'linear',
                                });
                            }

                            // prevStart = currStart;
                            prevEnd = currEnd;
                        },
                    );

                    tlTransition.pause();
                    tlList.push(tlTransition);

                    objectInfoList.push({
                        object: element,
                        id: element.id,
                        tlIndex: tlList.length - 1,
                        interactions: [],
                    });
                }

                // 트랜지션 설정에 따라 객체의 초기 상태값 세팅
                if (
                    currTransitionInfo[0].action ===
                    ELogic_Normal_Actions_Type.in
                ) {
                    element.style.opacity = 0;
                    // element.style.display = 'block';
                } else if (
                    currTransitionInfo[0].action ===
                    ELogic_Normal_Actions_Type.out
                ) {
                    element.style.opacity = 1;
                    // element.style.display = 'block';
                } else if (
                    currTransitionInfo[0].action ===
                    ELogic_Normal_Actions_Type.appear
                ) {
                    // element.style.opacity = 1;
                    if (currTransitionInfo[0].start === 0) {
                        element.style.display = 'block';
                    } else {
                        element.style.display = 'none';
                    }
                } else if (
                    currTransitionInfo[0].action ===
                    ELogic_Normal_Actions_Type.disappear
                ) {
                    // element.style.opacity = 1;
                    if (currTransitionInfo[0].start === 0) {
                        element.style.display = 'none';
                    } else {
                        element.style.display = 'block';
                    }
                }
            }
        });

        console.log('tlList : ', tlList);
        // -------------------------------------------------------------------------------------------------------- 로드된 인터렉션 설정값 적용
        if (objectInfoList.length > 0) {
            setObjectInteractions(objectInfoList);
        }

        setPageInteractions();

        setInputBoxKeyUpEvent();
    } catch (e) {
        console.log(e);
    }
};

const setInputBoxKeyUpEvent = () => {
    const inputBoxObjList = document.querySelectorAll(
        'div.object.input-box',
    ) as NodeListOf<HTMLElement>;
    // inputBoxList.forEach((inputBox: HTMLElement) => {
    for (const inputBoxObj of inputBoxObjList) {
        // 정답 값이 설정되어 있는지 체크
        const valid = inputBoxObj.getAttribute('valid') || '';
        if (valid === '') continue;

        // 정답입력만 받게 할것인지 체크
        const validCheck = inputBoxObj.getAttribute('valid-check') || '';
        if (validCheck !== 'true') continue;

        // 정답입력만 받게 하는경우 아래 이벤트를 적용 (keyup, blur)
        const inputBox = inputBoxObj.querySelector(
            'input.input-box',
        ) as HTMLInputElement;
        inputBox.addEventListener('keyup', () => {
            const inputBoxValue = inputBox.value;
            const inputBoxValueLength = inputBoxValue.length;
            if (
                valid.length < inputBoxValueLength ||
                valid.substring(0, inputBoxValueLength) !== inputBoxValue
            ) {
                inputBox.value = inputBoxValue.substring(
                    0,
                    inputBoxValueLength - 1,
                );
                // inputBox.value = '';
            }
        });
        inputBox.addEventListener('blur', () => {
            const inputBoxValue = inputBox.value;
            const inputBoxValueLength = inputBoxValue.length;
            if (
                valid.length < inputBoxValueLength ||
                valid.substring(0, inputBoxValueLength) !== inputBoxValue
            ) {
                inputBox.value = '';
            }
        });
    }
};

export const setCompleteInteractions = (
    element: any,
    interactionList: IinteractionsInfo[],
) => {
    if (interactionList.length === 0) return;

    console.log('setCompleteInteractions');
    console.log('setCompleteInteractions interactionList:', interactionList);

    const completeInteractionList: IinteractionsInfo[] = [];

    // complete 이벤트만 배열로 담는다.
    interactionList.map((interaction: IinteractionsInfo) => {
        if (interaction.trigger === 'complete') {
            completeInteractionList.push(interaction);
        }
    });
    if (completeInteractionList.length === 0) return;

    completeInteractionList.map((interaction: IinteractionsInfo) => {
        const actionName = interaction.action;
        console.log('setCompleteInteractions actionName:', actionName);

        const targetObjectList: any[] = [];
        interaction.targetId.map((targetId: string) => {
            let currTargetObjectList = [];
            if (targetId === 'page') {
                currTargetObjectList.push(util.getPreviewPageObject());
            } else {
                currTargetObjectList = objectInfoList.filter(
                    item => item.id === previewIdChar + targetId,
                );
            }
            if (currTargetObjectList.length > 0) {
                targetObjectList.push(...currTargetObjectList);
            }
        });
        console.log(
            'setCompleteInteractions targetObjectList:',
            targetObjectList,
        );

        if (targetObjectList.length > 0) {
            targetObjectList.map(targetObject => {
                const tlIndex = targetObject.tlIndex;
                console.log('setCompleteInteractions tlIndex:', tlIndex);

                if (actionName === ELogic_Normal_Actions_Type.play) {
                    play(targetObject);
                } else if (actionName === ELogic_Normal_Actions_Type.pause) {
                    pause(targetObject);
                } else if (actionName === ELogic_Normal_Actions_Type.restart) {
                    // restart(tlIndex);
                    restart();
                } else if (actionName === ELogic_Normal_Actions_Type.appear) {
                    // targetObject.object.style.opacity = 1;
                    targetObject.object.style.display = 'block';
                } else if (
                    actionName === ELogic_Normal_Actions_Type.disappear
                ) {
                    // targetObject.object.style.opacity = 0;
                    targetObject.object.style.display = 'none';
                } else if (actionName === ELogic_Normal_Actions_Type.next) {
                    // setCanvasContents(getLoadedPageNo() + 1);
                    goNextPage();
                } else if (actionName === ELogic_Normal_Actions_Type.prev) {
                    // setCanvasContents(getLoadedPageNo() - 1);
                    goPrevPage();
                } else {
                    // user action 처리
                    execUserAction(targetObject.object, actionName);
                }
            });
        }
    });
};

let collisionCheckCount = 0;
const setCollisionInteractions = (
    element: any,
    interactionList: IinteractionsInfo[],
) => {
    if (interactionList.length === 0) return;

    //  민감도 및 리소스 조절 (checkConst 번호출시 1회만 실제로 처리)
    const checkConst = 2;
    if (collisionCheckCount % checkConst) {
        // console.log(
        //     'collisionCheckCount : ',
        //     collisionCheckCount,
        //     ' -> no check',
        // );
        collisionCheckCount++;
        return;
    }
    // console.log(
    //     'collisionCheckCount : ',
    //     collisionCheckCount,
    //     ' -> check, element.id : ',
    //     element.id,
    // );
    collisionCheckCount++;
    collisionCheckCount = collisionCheckCount % checkConst;

    interactionList.map((interaction: IinteractionsInfo) => {
        const actionName = interaction.action;
        // console.log('setCollisionInteractions actionName:', actionName);

        const targetObjectList: any[] = [];
        interaction.targetId.map((targetId: string) => {
            const findObject = objectInfoList.find(
                item => item.id === previewIdChar + targetId,
            );
            if (findObject !== undefined) {
                targetObjectList.push(findObject);
            }
        });
        // console.log(
        //     'setCollisionInteractions targetObjectList:',
        //     targetObjectList,
        // );

        // console.log(
        //     'curr Collision actionName targetObjectList.length : ',
        //     targetObjectList.length,
        // );

        if (targetObjectList.length > 0) {
            targetObjectList.map(targetObject => {
                // const tlIndex = targetObject.tlIndex;
                // console.log('setCollisionInteractions tlIndex:', tlIndex);
                // console.log('curr Collision actionName1 : ', actionName);

                const bCollision = util.checkElementCollision(
                    element,
                    targetObject.object,
                );
                console.log(
                    'bCollision : ',
                    bCollision,
                    ', actionName: ',
                    actionName,
                );

                if (bCollision === true) {
                    console.log('curr Collision actionName2 : ', actionName);
                    if (actionName === ELogic_Normal_Actions_Type.play) {
                        play();
                    } else if (
                        actionName === ELogic_Normal_Actions_Type.pause
                    ) {
                        // pause(tlIndex);
                        pause();
                    } else if (
                        actionName === ELogic_Normal_Actions_Type.restart
                    ) {
                        // restart(tlIndex);
                        restart();
                    } else if (
                        actionName === ELogic_Normal_Actions_Type.appear
                    ) {
                        // targetObject.object.style.opacity = 1;
                        targetObject.object.style.display = 'block';
                        // element.style.opacity = 1;
                        // element.style.display = 'block';
                    } else if (
                        actionName === ELogic_Normal_Actions_Type.disappear
                    ) {
                        // targetObject.object.style.opacity = 0;
                        targetObject.object.style.display = 'none';
                        // element.style.opacity = 0;
                        // element.style.display = 'none';
                    } else if (actionName === ELogic_Normal_Actions_Type.next) {
                        pause();
                        // setCanvasContents(getLoadedPageNo() + 1);
                        goNextPage();
                    } else if (actionName === ELogic_Normal_Actions_Type.prev) {
                        pause();
                        // setCanvasContents(getLoadedPageNo() - 1);
                        goPrevPage();
                    } else {
                        // user action 처리
                        execUserAction(targetObject.object, actionName);
                    }
                }
            });
        }
    });
};
const getTotalScore = () => {
    return totalScore;
};
const setTotalScore = (score: number) => {
    totalScore = score;
};
// const increaseTotalScore = () => {
//     setTotalScore(getTotalScore() + addScore);
//     console.log('increaseTotalScore totalScore : ', totalScore);
// };
// const decreaseTotalScore = () => {
//     setTotalScore(getTotalScore() - addScore);
//     console.log('decreaseTotalScore totalScore : ', totalScore);
// };
// const resetTotalScore = () => {
//     setTotalScore(0);
//     console.log('resetTotalScore totalScore : ', totalScore);
// };
const calcTotalScore = (
    operator: ELogic_Action_Transform_Operator_Type,
    score: number,
) => {
    if (operator === ELogic_Action_Transform_Operator_Type.plus) {
        setTotalScore(getTotalScore() + score);
    } else if (operator === ELogic_Action_Transform_Operator_Type.minus) {
        setTotalScore(getTotalScore() - score);
    } else {
        setTotalScore(score);
    }
};
const showTotalScore = () => {
    console.log('showTotalScore');
    const score = getTotalScore();
    const previewContainer = util.getPreviewContainer();
    if (previewContainer === null) return;
    let textContent = String(score);
    let textboxObj = previewContainer.querySelector(
        '.object.total-score .textbox p span span span',
    );
    if (textboxObj === null) {
        textboxObj = previewContainer.querySelector(
            '.object.total-score .textbox p span span',
        );
    }
    if (textboxObj === null) {
        textboxObj = previewContainer.querySelector(
            '.object.total-score .textbox p span',
        );
    }
    if (textboxObj === null) {
        textboxObj = previewContainer.querySelector(
            '.object.total-score .textbox p',
        );
    }
    if (textboxObj === null) {
        textboxObj = previewContainer.querySelector(
            '.object.total-score .textbox',
        );
        textContent = `<p style="text-align: center;">${score}</p>`;
    }
    if (textboxObj === null) return;
    textboxObj.innerHTML = textContent;
};

// 오브젝트의 click, dblclick, mouseenter, mouseleave 에 대한 인터렉션 설정
export const setObjectInteractions = (objectInfoList: any[]) => {
    try {
        console.log('objectInfoList : ', objectInfoList);

        objectInfoList.map(objectInfo => {
            const currInteractions = objectInfo.interactions;
            if (currInteractions.length > 0) {
                console.log('currInteractions : ', currInteractions);

                const interactionGroupList: any[] = [[], [], [], [], []];

                // 같은 이벤트끼리 묶는다.
                currInteractions.map((interaction: IinteractionsInfo) => {
                    if (interaction.trigger === 'click') {
                        interactionGroupList[0].push(interaction);
                    } else if (interaction.trigger === 'dblclick') {
                        interactionGroupList[1].push(interaction);
                    } else if (interaction.trigger === 'mouseenter') {
                        interactionGroupList[2].push(interaction);
                    } else if (interaction.trigger === 'mouseleave') {
                        interactionGroupList[3].push(interaction);
                    } else if (interaction.trigger === 'change') {
                        interactionGroupList[4].push(interaction);
                    }
                    return true;
                });
                console.log('interactionGroupList : ', interactionGroupList);

                interactionGroupList.map(
                    (interactionGroup: any, triggerIdx: number) => {
                        if (interactionGroup.length === 0) {
                            return false;
                        }
                        let evtName = '';
                        if (triggerIdx === 0) {
                            evtName = 'click';
                        } else if (triggerIdx === 1) {
                            evtName = 'dblclick';
                        } else if (triggerIdx === 2) {
                            evtName = 'mouseenter';
                        } else if (triggerIdx === 3) {
                            evtName = 'mouseleave';
                        } else if (triggerIdx === 4) {
                            evtName = 'change';
                        }
                        if (evtName == '') return false;

                        const targetObjectGroupInfo: any[] = [];
                        const actionList: any[] = [];
                        if (interactionGroup.length) {
                            interactionGroup.map((interaction: any) => {
                                const targetObjectInfo: any[] = [];
                                interaction.targetId.map((targetId: string) => {
                                    let currTargetObjectInfo = [];
                                    if (targetId === 'page') {
                                        currTargetObjectInfo.push(objectInfo);
                                    } else {
                                        currTargetObjectInfo =
                                            objectInfoList.filter(
                                                item =>
                                                    item.id ===
                                                    previewIdChar + targetId,
                                            );
                                    }

                                    if (currTargetObjectInfo.length > 0) {
                                        targetObjectInfo.push(
                                            ...currTargetObjectInfo,
                                        );
                                    }
                                });
                                targetObjectGroupInfo.push(targetObjectInfo);
                                actionList.push(interaction.action);
                            });
                        }
                        console.log(
                            'targetObjectGroupInfo : ',
                            targetObjectGroupInfo,
                        );
                        console.log('actionList : ', actionList);

                        if (targetObjectGroupInfo.length > 0) {
                            const targetObjectGroupList: any[][] = [];
                            const tlIndexGroupList: number[][] = [];
                            targetObjectGroupInfo.map(targetObjectInfo => {
                                const tlIndexList: number[] = [];
                                const targetObjectList: any[] = [];
                                targetObjectInfo.map((currObjectInfo: any) => {
                                    tlIndexList.push(currObjectInfo.tlIndex);
                                    targetObjectList.push(currObjectInfo);
                                    return true;
                                });
                                targetObjectGroupList.push(targetObjectList);
                                tlIndexGroupList.push(tlIndexList);
                            });

                            console.log(
                                'targetObjectGroupList: ',
                                targetObjectGroupList,
                            );
                            console.log(tlIndexGroupList);

                            // checkbox 타입 오브젝트의 이벤트 중복 방지
                            console.log('event set : ', objectInfo.object.id);
                            let eventSetTarget = objectInfo.object;
                            if (
                                eventSetTarget.classList.contains('check-box')
                            ) {
                                eventSetTarget =
                                    eventSetTarget.querySelector(
                                        'input.check-box',
                                    ) || eventSetTarget;
                            }

                            eventSetTarget.addEventListener(evtName, () => {
                                targetObjectGroupList.map(
                                    (
                                        targetObjectList: any,
                                        groupIdx: number,
                                    ) => {
                                        const targetObjectGroupAction =
                                            actionList[groupIdx];
                                        console.log(
                                            'targetObjectGroupAction:',
                                            targetObjectGroupAction,
                                        );

                                        // object id 를 기준으로 오름차순 정렬
                                        targetObjectList = util.sortObjectList(
                                            targetObjectList,
                                            'id',
                                            'ASC',
                                        );

                                        console.log(
                                            'targetObjectList : ',
                                            targetObjectList,
                                        );

                                        // let prevId = '';
                                        targetObjectList.map(
                                            (currObjectInfo: any) => {
                                                // prevId = currObjectInfo.id;
                                                if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.play
                                                ) {
                                                    play(currObjectInfo);
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.pause
                                                ) {
                                                    pause(currObjectInfo);
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.resume
                                                ) {
                                                    resume(currObjectInfo);
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.restart
                                                ) {
                                                    restart();
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.appear
                                                ) {
                                                    currObjectInfo.object.style.display =
                                                        'block';
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.disappear
                                                ) {
                                                    currObjectInfo.object.style.display =
                                                        'none';
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.next
                                                ) {
                                                    goNextPage();
                                                } else if (
                                                    targetObjectGroupAction ===
                                                    ELogic_Normal_Actions_Type.prev
                                                ) {
                                                    goPrevPage();
                                                } else {
                                                    execUserAction(
                                                        currObjectInfo.object,
                                                        targetObjectGroupAction,
                                                    );
                                                }
                                                return true;
                                            },
                                        );
                                        return true;
                                    },
                                );
                            });
                        }
                    },
                );
            }

            return true;
        });
    } catch (e) {
        console.log(e);
    }
};

const userActionAnimeList: any = {};
export const execUserAction = (targetObject: any, actionId: string) => {
    console.log('execUserAction : ', actionId);
    const logicActionList = window.globalContent.docContentList[
        loadedPageNo - 1
    ].logicActionList as any[];
    console.log('logicActionList : ', logicActionList);
    if (logicActionList.length === 0) return;

    const actionInfo = logicActionList.find(
        action => action.actionId === actionId,
    ) as ILogic_Action_List_Info | undefined;
    console.log('actionInfo : ', actionInfo);
    if (actionInfo === undefined) return;

    const outActionList = actionInfo.outActionList;
    console.log('useraction inout =>  outActionList : ', outActionList);

    const inActionList = actionInfo.inActionList || [];
    console.log('useraction inout =>  inActionList : ', inActionList);

    let directionInfo: any = {};
    const appearActionList: ILogic_Normal_Actions_Info[] = [];
    const pageMoveActionList: ILogic_Normal_Actions_Info[] = [];
    const animeActionList: ILogic_Normal_Actions_Info[] = [];
    const scoreActionList: ILogic_Normal_Actions_Info[] = [];
    const timerActionList: ILogic_Normal_Actions_Info[] = [];
    const conditionList: ILogic_Condition_Info[] = [];
    const audioActionList: ILogic_Audio_Actions_Info[] = [];
    const quizActionList: ILogic_Quiz_Actions_Info[] = [];
    const dataActionList: ILogic_Data_Actions_Info[] = [];
    actionInfo.actionsList.map(
        (
            action:
                | ILogic_Transform_Actions_Info
                | ILogic_Normal_Actions_Info
                | ILogic_Condition_Info,
        ) => {
            const currDuration = (action.duration || 0.5) * 1000;
            const currEase = util.convertAnimeEase(action.easing || 'linear');

            let actionSize = Number(action.size);

            // random action
            if (
                action.sizeType &&
                action.sizeType === ELogic_Action_Transform_Size_Type.rand
            ) {
                console.log('rand action old size : ', action.size);

                const randDataList = [];
                const randList = String(action.size).split(',');
                for (const randValue of randList) {
                    if (randValue.indexOf('-') > -1) {
                        const randValueList = randValue.trim().split('-');
                        const randValueStart = Number(
                            randValueList[0].trim() || 0,
                        );
                        const randValueEnd = Number(
                            randValueList[1].trim() || 0,
                        );
                        const randData =
                            Math.floor(
                                Math.random() *
                                    (randValueEnd - randValueStart + 1),
                            ) + randValueStart;
                        randDataList.push(randData);
                    } else {
                        randDataList.push(Number(randValue.trim() || 0));
                    }
                }
                const randValue =
                    randDataList[
                        Math.floor(Math.random() * randDataList.length)
                    ];

                actionSize = randValue;
                console.log('rand action new size : ', actionSize);
            }

            // transform
            if (action.actionType === ELogic_Action_Type.transform) {
                const animeOpaerator =
                    action.operator ===
                    ELogic_Action_Transform_Operator_Type.plus
                        ? '+='
                        : action.operator ===
                          ELogic_Action_Transform_Operator_Type.minus
                        ? '-='
                        : '';

                // let directionInfo = {};
                if (action.actions === ELogic_Transform_Actions_Type.x) {
                    directionInfo = {
                        ...directionInfo,
                        left: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (action.actions === ELogic_Transform_Actions_Type.y) {
                    directionInfo = {
                        ...directionInfo,
                        top: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions === ELogic_Transform_Actions_Type.width
                ) {
                    directionInfo = {
                        ...directionInfo,
                        width: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions === ELogic_Transform_Actions_Type.height
                ) {
                    directionInfo = {
                        ...directionInfo,
                        height: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions === ELogic_Transform_Actions_Type.rotate
                ) {
                    directionInfo = {
                        ...directionInfo,
                        rotate: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions === ELogic_Transform_Actions_Type.rotateY
                ) {
                    directionInfo = {
                        ...directionInfo,
                        rotateY: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions === ELogic_Transform_Actions_Type.rotateX
                ) {
                    directionInfo = {
                        ...directionInfo,
                        rotateX: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions === ELogic_Transform_Actions_Type.opacity
                ) {
                    directionInfo = {
                        ...directionInfo,
                        opacity: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                } else if (
                    action.actions ===
                    ELogic_Transform_Actions_Type.borderRadius
                ) {
                    directionInfo = {
                        ...directionInfo,
                        borderRadius: {
                            value: `${animeOpaerator}${actionSize}`,
                            easing: currEase,
                            duration: currDuration,
                        },
                    };
                }
            } else if (action.actionType === ELogic_Action_Type.fade) {
                directionInfo = {
                    ...directionInfo,
                    opacity: {
                        value:
                            action.actions === ELogic_Normal_Actions_Type.in
                                ? 1
                                : 0,
                        duration: currDuration,
                        easing: currEase,
                    },
                };
            } else if (action.actionType === ELogic_Action_Type.appear) {
                appearActionList.push(action as ILogic_Normal_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.page_move) {
                pageMoveActionList.push(action as ILogic_Normal_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.anime) {
                animeActionList.push(action as ILogic_Normal_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.score) {
                scoreActionList.push(action as ILogic_Normal_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.timer) {
                timerActionList.push(action as ILogic_Normal_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.condition) {
                conditionList.push(action as ILogic_Condition_Info);
            } else if (action.actionType === ELogic_Action_Type.audio) {
                audioActionList.push(action as ILogic_Audio_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.quiz) {
                quizActionList.push(action as ILogic_Quiz_Actions_Info);
            } else if (action.actionType === ELogic_Action_Type.data) {
                dataActionList.push(action as ILogic_Data_Actions_Info);
            }
        },
    );

    console.log('directionInfo : ', directionInfo);

    let inActionObjectList = [targetObject];
    let animeTargets = [targetObject];
    const inAudioObjList: any[] = [];

    // input object들이 있는지 확인
    if (inActionList.length > 0) {
        const inObjectInfoList = inActionList.filter(
            (inAction: ILogic_Conneted_Info) =>
                inAction.objectType === ELogic_Object_Type.object,
        );
        if (inObjectInfoList.length) {
            animeTargets = [];
            inActionObjectList = [];
            inObjectInfoList.map((inObjectInfo: ILogic_Conneted_Info) => {
                const inObject = document.getElementById(
                    previewIdChar + inObjectInfo.refObjId,
                );
                if (inObject) {
                    // animeTargets.push(inObject);
                    if (
                        inObject.getAttribute('object-type') ===
                        ELogic_Object_Type.audio
                    ) {
                        console.log('inobject list : audio id : ', inObject.id);
                        inAudioObjList.push(inObject);
                    } else {
                        console.log('inobject list : anime id : ', inObject.id);
                        animeTargets.push(inObject);
                    }
                    inActionObjectList.push(inObject);
                }
            });
        }
    }

    // 이전 애니메이션이 아직 끝나지 않았으면 이전 애니메이션 중지
    if (
        userActionAnimeList[targetObject.id] !== undefined &&
        userActionAnimeList[targetObject.id] !== null
    ) {
        animeTargets.forEach((animeTarget: any) => {
            userActionAnimeList[targetObject.id].remove(animeTarget);
        });
        userActionAnimeList[targetObject.id] = null;
    }

    const keyframeActionList = Object.keys(directionInfo);

    console.log(
        'actionlist Check : keyframeActionList.length : ',
        keyframeActionList.length,
    );
    console.log(
        'actionlist Check : appearActionList.length : ',
        appearActionList.length,
    );

    let bExecuteOutAction = false;

    // keyframe animation이 설정된 경우 실행
    if (keyframeActionList.length > 0) {
        userActionAnimeList[targetObject.id] = anime({
            targets: animeTargets,
            loop: false,
            autoplay: true,
            delay: 0,
            // duration: 500,
            ...directionInfo,
            complete: () => {
                console.log('useraction complete : actionId : ', actionId);
                // if (getBPreviewPlay() === false) return;
                if (
                    userActionAnimeList[targetObject.id] !== undefined &&
                    userActionAnimeList[targetObject.id] !== null
                ) {
                    animeTargets.forEach((animeTarget: any) => {
                        userActionAnimeList[targetObject.id].remove(
                            animeTarget,
                        );
                    });
                    userActionAnimeList[targetObject.id] = null;
                }

                if (outActionList.length > 0) {
                    checkExecOutAction(targetObject, outActionList);
                }
            },
        });
        bExecuteOutAction = true;
    }

    // appear action이 있는 경우 실행 (appear 액션은 한번에 한가지만 실행 가능 하므로, 여러개 있어도 마지막 액션만 실행 )
    if (appearActionList.length > 0) {
        const appearAction = appearActionList.pop() || null;
        if (appearAction) {
            animeTargets.forEach((animeTarget: any) => {
                if (
                    appearAction.actions === ELogic_Normal_Actions_Type.appear
                ) {
                    animeTarget.style.display = 'block';
                } else if (
                    appearAction.actions ===
                    ELogic_Normal_Actions_Type.disappear
                ) {
                    animeTarget.style.display = 'none';
                } else if (
                    appearAction.actions ===
                    ELogic_Normal_Actions_Type.appearToggle
                ) {
                    if (
                        animeTarget.style.display === 'block' ||
                        animeTarget.style.display === ''
                    ) {
                        animeTarget.style.display = 'none';
                    } else {
                        animeTarget.style.display = 'block';
                    }
                }
            });
        }

        // 위에서 aout action 이 설정되지 않은 경우 여기서 설정한다.
        if (bExecuteOutAction !== true) {
            if (outActionList.length > 0) {
                checkExecOutAction(targetObject, outActionList);
                bExecuteOutAction = true;
            }
        }
    }

    // page move action
    if (pageMoveActionList.length > 0) {
        const pageMoveAction = pageMoveActionList.pop() || null;
        if (pageMoveAction) {
            if (pageMoveAction.actions === ELogic_Normal_Actions_Type.next) {
                // setCanvasContents(getLoadedPageNo() + 1);
                goNextPage();
            } else if (
                pageMoveAction.actions === ELogic_Normal_Actions_Type.prev
            ) {
                // setCanvasContents(getLoadedPageNo() - 1);
                goPrevPage();
            } else if (
                pageMoveAction.actions === ELogic_Normal_Actions_Type.goToPage
            ) {
                const pageNo = Number(pageMoveAction.size || 0);
                goToPage(pageNo);
            } else if (
                pageMoveAction.actions === ELogic_Normal_Actions_Type.openLink
            ) {
                const linkUrl = pageMoveAction.inputtext || '';
                openUrlLink(linkUrl);
            }
        }

        // 위에서 aout action 이 설정되지 않은 경우 여기서 설정한다.
        if (bExecuteOutAction !== true) {
            if (outActionList.length > 0) {
                checkExecOutAction(targetObject, outActionList);
                bExecuteOutAction = true;
            }
        }
    }

    //anime action
    if (animeActionList.length > 0) {
        const animeAction = animeActionList.pop() || null;
        if (animeAction) {
            let currTargetObjectList: any[] = [];
            animeTargets.forEach((animeTarget: any) => {
                // animation정보가 들어있는 objectInfoList 에서 현재 애니메이션 대상의 정보를 가져온다.
                currTargetObjectList = objectInfoList.filter(
                    item => item.id === animeTarget.id,
                );
                if (currTargetObjectList.length > 0) {
                    currTargetObjectList.forEach((currTargetObject: any) => {
                        if (
                            animeAction.actions ===
                            ELogic_Normal_Actions_Type.play
                        ) {
                            play(currTargetObject);
                        } else if (
                            animeAction.actions ===
                            ELogic_Normal_Actions_Type.pause
                        ) {
                            pause(currTargetObject);
                        } else if (
                            animeAction.actions ===
                            ELogic_Normal_Actions_Type.restart
                        ) {
                            restart(currTargetObject);
                        }

                        /**
                         * @todo : complete 애니메이션을 실행하는 부분
                         */
                        // const tlAnime = getTlAnimefromTlIndex(currTargetObject.tlIndex);
                        // if(tlAnime) {
                        //     tlAnime.complete((anim:any) => {

                        //         // complete 애니메이션이 끝나면, complete 애니메이션을 제거한다.
                        //         anim.complete = null;
                        //     });
                        // }
                    });
                }
            });

            // 위에서 aout action 이 설정되지 않은 경우 여기서 설정한다.
            if (bExecuteOutAction !== true) {
                if (outActionList.length > 0) {
                    outActionList.forEach((outAction: any) => {
                        if (
                            outAction.objectType ===
                                ELogic_Object_Type.action ||
                            outAction.objectType ===
                                ELogic_Object_Type.condition
                        ) {
                            // play 인경우 첫번째 오브젝트에만 COMPLETE 애니메이션을 실행한다.
                            if (
                                animeAction.actions ===
                                ELogic_Normal_Actions_Type.play
                            ) {
                                if (currTargetObjectList.length > 0) {
                                    const firstAnimeObject =
                                        currTargetObjectList[0];
                                    const tlAnime = getTlAnimefromTlIndex(
                                        firstAnimeObject.tlIndex,
                                    );
                                    if (tlAnime) {
                                        console.log(
                                            'duration, delay : ',
                                            tlAnime.duration,
                                            tlAnime.delay,
                                        );
                                        setTimeout(() => {
                                            execUserAction(
                                                targetObject,
                                                outAction.id,
                                            );
                                        }, tlAnime.duration + tlAnime.delay);
                                    }
                                }
                            } else {
                                execUserAction(targetObject, outAction.id);
                            }
                        }
                    });
                    bExecuteOutAction = true;
                }
            }
        }
    }

    // score action
    if (scoreActionList.length > 0) {
        const scoreAction = scoreActionList.pop() || null;
        if (scoreAction) {
            if (scoreAction.actions === ELogic_Normal_Actions_Type.scoreset) {
                const scoreSize = Number(scoreAction.size || 0);
                const scoreOperator = scoreAction.operator || '=';
                calcTotalScore(scoreOperator, scoreSize);
                showTotalScore();
            }
        }

        // 위에서 aout action 이 설정되지 않은 경우 여기서 설정한다.
        if (bExecuteOutAction !== true) {
            if (outActionList.length > 0) {
                checkExecOutAction(targetObject, outActionList);
                bExecuteOutAction = true;
            }
        }
    }

    // timer action
    if (timerActionList.length > 0) {
        const timerAction = timerActionList.pop() || null;
        if (timerAction) {
            if (timerAction.actions === ELogic_Normal_Actions_Type.delay) {
                const timerSize = timerAction.size || 0;
                setTimeout(() => {
                    // 위에서 aout action 이 설정되지 않은 경우 여기서 설정한다.
                    if (bExecuteOutAction !== true) {
                        if (outActionList.length > 0) {
                            checkExecOutAction(targetObject, outActionList);
                            bExecuteOutAction = true;
                        }
                    }
                }, timerSize * 1000);
            }
        }
    }

    // audio action
    if (audioActionList.length > 0) {
        console.log('inAudioObjList: len : ', inAudioObjList.length);

        const audioAction = audioActionList.pop() || null;
        if (audioAction) {
            if (audioAction.actions === ELogic_Normal_Actions_Type.play) {
                // console.log('audio targetObject: ', targetObject);

                for (const audioObj of inAudioObjList) {
                    playAudio(audioObj, () => {
                        if (bExecuteOutAction !== true) {
                            if (outActionList.length > 0) {
                                checkExecOutAction(targetObject, outActionList);
                                bExecuteOutAction = true;
                            }
                        }
                    });
                }
            } else if (
                audioAction.actions === ELogic_Normal_Actions_Type.stop
            ) {
                for (const audioObj of inAudioObjList) {
                    stopAudio(audioObj);
                }
            } else if (
                audioAction.actions === ELogic_Normal_Actions_Type.stopAll
            ) {
                stopAllAudio();
            }
            // if (bExecuteOutAction !== true) {
            //     if (outActionList.length > 0) {
            //         checkExecOutAction(targetObject, outActionList);
            //         bExecuteOutAction = true;
            //     }
            // }
        }
    }

    // quiz action
    if (quizActionList.length > 0) {
        for (const quizAction of quizActionList) {
            if (
                quizAction.actions === ELogic_Normal_Actions_Type.reset_answer
            ) {
                console.log('reset_answer');
                QuizTemplateEvent.resetAnswers();

                if (bExecuteOutAction !== true) {
                    if (outActionList.length > 0) {
                        checkExecOutAction(targetObject, outActionList);
                        bExecuteOutAction = true;
                    }
                }
            } else if (
                quizAction.actions === ELogic_Normal_Actions_Type.save_result
            ) {
                const quizResult = getResultDataList();
                console.log('quizResult : ', quizResult);
                DataStore.saveQuizResult(quizResult).then((res: any) => {
                    console.log('saveQuizResult : ', res);

                    if (bExecuteOutAction !== true) {
                        if (outActionList.length > 0) {
                            checkExecOutAction(targetObject, outActionList);
                            bExecuteOutAction = true;
                        }
                    }
                });
            }
        }
    }

    // data action
    if (dataActionList.length > 0) {
        for (const dataAction of dataActionList) {
            if (dataAction.actions === ELogic_Normal_Actions_Type.form_store) {
                for (const inActionObj of inActionObjectList) {
                    if (
                        inActionObj.getAttribute('object-type') ===
                        EobjectType.page
                    ) {
                        const previewContainer = util.getPreviewContainer();
                        if (previewContainer === null) continue;

                        for (const storeFormType of storeFormTypeList) {
                            const inputObjectList =
                                previewContainer.querySelectorAll(
                                    `.object.${storeFormType}`,
                                );
                            console.log('inputObjectList : ', inputObjectList);
                            if (inputObjectList.length === 0) continue;
                            inputObjectList.forEach((inputObject: any) => {
                                const targetForm =
                                    inputObject.querySelector(
                                        `input.${storeFormType}`,
                                    ) || null;
                                if (targetForm) {
                                    storeFormData(inputObject);
                                }
                            });
                        }
                    } else {
                        for (const storeFormType of storeFormTypeList) {
                            if (inActionObj.classList.contains(storeFormType)) {
                                storeFormData(inActionObj);
                                break;
                            }
                        }
                    }
                }
            } else if (
                dataAction.actions === ELogic_Normal_Actions_Type.form_load
            ) {
                console.log('setTimeout form_load');

                for (const inActionObj of inActionObjectList) {
                    if (
                        inActionObj.getAttribute('object-type') ===
                        EobjectType.page
                    ) {
                        const previewContainer = util.getPreviewContainer();
                        if (previewContainer === null) continue;

                        for (const storeFormType of storeFormTypeList) {
                            const inputObjectList =
                                previewContainer.querySelectorAll(
                                    `.object.${storeFormType}`,
                                );
                            console.log('inputObjectList : ', inputObjectList);
                            if (inputObjectList.length === 0) continue;
                            inputObjectList.forEach((inputObject: any) => {
                                loadFormData(inputObject);
                            });
                        }
                    } else {
                        for (const storeFormType of storeFormTypeList) {
                            if (inActionObj.classList.contains(storeFormType)) {
                                loadFormData(inActionObj);
                                break;
                            }
                        }
                    }
                }
            } else if (
                dataAction.actions === ELogic_Normal_Actions_Type.set_data
            ) {
                console.log('dataAction set_data');

                for (const inActionObj of inActionObjectList) {
                    console.log(
                        ' dataAction.dataField : ',
                        dataAction.dataField,
                    );
                    console.log('dataAction obj id : ', inActionObj.id);

                    // -- 데이터 입력 대상이 페이지인경우는 무시한다.
                    if (
                        inActionObj.getAttribute('object-type') ===
                        EobjectType.page
                    )
                        continue;

                    console.log('dataAction: 페이지아님');

                    // 체크박스 처리
                    const previewContainer = util.getPreviewContainer();
                    if (previewContainer === null) continue;

                    if (
                        dataAction.dataField ===
                        ELogic_Action_Data_Field_Type.allcheckboxCnt
                    ) {
                        const checkboxObjectList =
                            previewContainer.querySelectorAll(
                                `.object.check-box`,
                            );
                        const checkboxCnt = checkboxObjectList.length;
                        setDataToObject(inActionObj, String(checkboxCnt));
                    } else if (
                        dataAction.dataField ===
                        ELogic_Action_Data_Field_Type.checkedCnt
                    ) {
                        const checkboxObjectList =
                            previewContainer.querySelectorAll(
                                `.object.check-box input.check-box[type="checkbox"]:checked`,
                            );
                        const checkedCnt = checkboxObjectList.length;
                        setDataToObject(inActionObj, String(checkedCnt));
                    }
                }
            }
        }
        if (bExecuteOutAction !== true) {
            if (outActionList.length > 0) {
                checkExecOutAction(targetObject, outActionList);
                bExecuteOutAction = true;
            }
        }
    }

    // condition action
    if (conditionList.length > 0) {
        // console.log('conditionList : ', conditionList);

        let bCondition = false;
        // conditionList 를 순회하면서 모두 참이면 true, 하나라도 거짓이면 false 를 'bCondition'에 저장한다.
        for (const conditionAction of conditionList) {
            if (
                conditionAction.actions ===
                    ELogic_Condition_Actions_Type.score ||
                conditionAction.actions ===
                    ELogic_Condition_Actions_Type.quizcorrectcnt
            ) {
                const size = Number(conditionAction.size || 0);
                const condition =
                    conditionAction.condition ||
                    ELogic_Action_Condition_Type.equal;

                let checkScore = 0;
                if (
                    conditionAction.actions ===
                    ELogic_Condition_Actions_Type.score
                ) {
                    checkScore = getTotalScore();
                } else {
                    const quizinputcompleteResult = getResultDataList();
                    const previewPageObject = util.getPreviewPageObject();
                    if (previewPageObject) {
                        const currPageResult = quizinputcompleteResult.find(
                            result => result.key === previewPageObject.id,
                        );
                        if (currPageResult !== undefined) {
                            checkScore = currPageResult.correctCnt;
                        }
                    }
                }

                if (condition === ELogic_Action_Condition_Type.equal) {
                    checkScore === size
                        ? (bCondition = true)
                        : (bCondition = false);
                } else if (condition === ELogic_Action_Condition_Type.over) {
                    checkScore > size
                        ? (bCondition = true)
                        : (bCondition = false);
                } else if (condition === ELogic_Action_Condition_Type.under) {
                    checkScore < size
                        ? (bCondition = true)
                        : (bCondition = false);
                } else if (
                    condition === ELogic_Action_Condition_Type.over_equal
                ) {
                    checkScore >= size
                        ? (bCondition = true)
                        : (bCondition = false);
                } else if (
                    condition === ELogic_Action_Condition_Type.under_equal
                ) {
                    checkScore <= size
                        ? (bCondition = true)
                        : (bCondition = false);
                } else if (
                    condition === ELogic_Action_Condition_Type.not_equal
                ) {
                    checkScore !== size
                        ? (bCondition = true)
                        : (bCondition = false);
                } else {
                    bCondition = false;
                }
            } else if (
                conditionAction.actions ===
                ELogic_Condition_Actions_Type.checked
            ) {
                // in으로 연결된 체크박스 오브젝트를 모두 검사하여 하나라도 체크되지 않았으면 false 를 리턴한다.
                for (const inActionObj of inActionObjectList) {
                    if (inActionObj.classList.contains('check-box')) {
                        const checkFormObj = inActionObj.querySelector(
                            'input[type="checkbox"]',
                        ) as HTMLInputElement;
                        if (checkFormObj) {
                            if (checkFormObj.checked) {
                                bCondition = true;
                            } else {
                                bCondition = false;
                                break;
                            }
                        }
                    }
                }
            } else if (
                conditionAction.actions ===
                ELogic_Condition_Actions_Type.input_valid
            ) {
                // in으로 연결된 체크박스 오브젝트를 모두 검사하여 하나라도 체크되지 않았으면 false 를 리턴한다.
                for (const inActionObj of inActionObjectList) {
                    if (inActionObj.classList.contains('input-box')) {
                        const checkFormObj = inActionObj.querySelector(
                            'input[type="text"]',
                        ) as HTMLInputElement;
                        if (checkFormObj) {
                            const inputValid = String(
                                inActionObj.getAttribute('valid') || '',
                            ).trim();
                            if (inputValid !== '') {
                                const userInputValue =
                                    checkFormObj.value.trim();
                                if (userInputValue === inputValid) {
                                    bCondition = true;
                                } else {
                                    bCondition = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            } else if (
                conditionAction.actions ===
                ELogic_Condition_Actions_Type.correct_answer
            ) {
                // in으로 연결된 체크박스 오브젝트를 모두 검사하여 하나라도 체크되지 않았으면 false 를 리턴한다.
                for (const inActionObj of inActionObjectList) {
                    // quiz 유형 처리
                    const previewPageObject = util.getPreviewPageObject();
                    if (previewPageObject) {
                        const tplType = util.getTplType(previewPageObject);
                        if (tplType !== ETemplateType.none) {
                            const tplObjectType = (inActionObj.getAttribute(
                                'tpl-object-type',
                            ) ||
                                ETemplete_Object_Type.none) as ETemplete_Object_Type;
                            if (
                                tplObjectType === ETemplete_Object_Type.question
                            ) {
                                const correct =
                                    util.getObjCorrectAnswer(inActionObj);
                                if (correct) {
                                    bCondition = true;
                                } else {
                                    bCondition = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            } else if (
                conditionAction.actions ===
                ELogic_Condition_Actions_Type.quizinputcomplete
            ) {
                const quizinputcompleteResult = getResultDataList();
                console.log(
                    'quizinputcompleteResult : ',
                    quizinputcompleteResult,
                );
                const previewPageObject = util.getPreviewPageObject();
                if (previewPageObject) {
                    const currPageResult = quizinputcompleteResult.find(
                        result => result.key === previewPageObject.id,
                    );
                    let inputComplete = false;
                    if (currPageResult !== undefined) {
                        inputComplete = true;
                        if (currPageResult.totalCnt > currPageResult.inputCnt) {
                            inputComplete = false;
                        }
                    }
                    console.log('inputComplete : ', inputComplete);
                    bCondition = inputComplete;
                }
            }

            // 루프값중 하나라도 false 이면 루프를 빠져나간다.
            if (bCondition !== true) {
                break;
            }
        }

        if (bExecuteOutAction !== true) {
            if (outActionList.length > 0) {
                checkExecOutCondition(outActionList, targetObject, bCondition);
                bExecuteOutAction = true;
            }
        }
    }
};
const checkExecOutAction = (
    targetObject: any,
    outActionList: ILogic_Conneted_Info[],
) => {
    if (outActionList.length === 0) return;
    outActionList.forEach(outAction => {
        if (
            outAction.objectType === ELogic_Object_Type.action ||
            outAction.objectType === ELogic_Object_Type.condition
        ) {
            execUserAction(targetObject, outAction.id);
        }
    });
};
const checkExecOutCondition = (
    outActionList: ILogic_Conneted_Info[],
    targetObject: any,
    bCondition = false,
) => {
    if (outActionList.length === 0) return;
    outActionList.forEach(outAction => {
        if (
            outAction.objectType === ELogic_Object_Type.action ||
            outAction.objectType === ELogic_Object_Type.condition
        ) {
            if (
                outAction.actions === ELogic_Actions_Out_Condition_Type.yes &&
                bCondition === true
            ) {
                execUserAction(targetObject, outAction.id);
            } else if (
                outAction.actions === ELogic_Actions_Out_Condition_Type.no &&
                bCondition === false
            ) {
                execUserAction(targetObject, outAction.id);
            }
        }
    });
};
// 페이지의 pageload 에 대한 인터렉션 설정
const setPageInteractions = () => {
    try {
        windowKeyDownEventObjectInfo = null;
        const previewContainer = util.getPreviewContainer();
        if (previewContainer == null) return;
        const pageObj = util.getPreviewPageObject();
        if (pageObj == null) return;
        const pageInteractionList: IinteractionsInfo[] =
            util.getInteractionsInfo(pageObj);
        if (pageInteractionList.length === 0) return;

        console.log('pageInteractionList : ', pageInteractionList);

        pageInteractionList.map((interaction: any) => {
            // pageload 만 처리.
            if (
                interaction.trigger !== 'pageload' &&
                interaction.trigger !== 'keydown' &&
                interaction.trigger !== 'change'
            ) {
                return true;
            }
            console.log('pageInteractionList Call');
            // const actionName = '';
            const targetObjectList: any[] = [];
            interaction.targetId.map((targetId: string) => {
                let currTargetObjectInfo = [];
                if (targetId === 'page') {
                    currTargetObjectInfo.push({
                        object: pageObj,
                        id: pageObj.id,
                        tlIndex: 1,
                        interactions: [],
                    });
                } else {
                    currTargetObjectInfo = objectInfoList.filter(
                        item => item.id === previewIdChar + targetId,
                    );
                }
                if (currTargetObjectInfo.length > 0) {
                    targetObjectList.push(...currTargetObjectInfo);
                }
            });
            if (targetObjectList.length === 0) return true;
            if (interaction.trigger === 'pageload') {
                targetObjectList.map((currObjectInfo: any) => {
                    if (
                        interaction.action === ELogic_Normal_Actions_Type.play
                    ) {
                        setTimeout(() => {
                            play(currObjectInfo);
                        }, 0);
                    } else if (
                        interaction.action ===
                        ELogic_Normal_Actions_Type.restart
                    ) {
                        setTimeout(() => {
                            restart();
                        }, 0);
                    } else if (
                        interaction.action === ELogic_Normal_Actions_Type.appear
                    ) {
                        // currObjectInfo.object.style.opacity = 1;
                        currObjectInfo.object.style.display = 'block';
                    } else if (
                        interaction.action ===
                        ELogic_Normal_Actions_Type.disappear
                    ) {
                        // currObjectInfo.object.style.opacity = 0;
                        currObjectInfo.object.style.display = 'none';
                    } else if (
                        interaction.action === ELogic_Normal_Actions_Type.next
                    ) {
                        setTimeout(() => {
                            // setCanvasContents(getLoadedPageNo() + 1);
                            goNextPage();
                        }, 0);
                    } else if (
                        interaction.action === ELogic_Normal_Actions_Type.prev
                    ) {
                        setTimeout(() => {
                            // setCanvasContents(getLoadedPageNo() - 1);
                            goPrevPage();
                        }, 0);
                    } else {
                        // user action 처리
                        execUserAction(
                            currObjectInfo.object,
                            interaction.action,
                        );
                    }

                    return true;
                });
            } else if (interaction.trigger === 'keydown') {
                windowKeyDownEventObjectInfo = {
                    trigger: interaction.trigger,
                    action: interaction.action,
                    targetObjectList,
                };
                console.log('addPreviewWindowKeyDownEvent SET');
                window.addEventListener(
                    'keydown',
                    addPreviewWindowKeyDownEvent,
                );
                // input form value change event set
            } else if (interaction.trigger === 'change') {
                for (const storeFormType of storeFormTypeList) {
                    const inputObjectList = previewContainer.querySelectorAll(
                        `.object.${storeFormType}`,
                    );
                    if (inputObjectList.length === 0) continue; // bug fix
                    inputObjectList.forEach((inputObject: any) => {
                        const eventSetTarget =
                            inputObject.querySelector(
                                `input.${storeFormType}`,
                            ) || null;

                        if (eventSetTarget) {
                            eventSetTarget.addEventListener('change', () => {
                                // execUserAction(inputObject, interaction.action); // 체크한 폼만 저장 (체크하지 않으면 데이터도 저장되지 않음)
                                execUserAction(pageObj, interaction.action); // 페이지 전체의 폼을 모두 저장 (체크하지 않아도 데이터 저장됨)
                            });
                        }
                    });
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
};

const addPreviewWindowKeyDownEvent = (event: KeyboardEvent) => {
    console.log(
        'addPreviewWindowKeyDownEvent windowKeyDownEventObjectInfo : ',
        windowKeyDownEventObjectInfo,
    );

    const keyCode = util.getKeyCode(event);
    console.log('preview keyCode : ', keyCode);

    bAddPreviewWindowKeyDownEvent = true;

    if (windowKeyDownEventObjectInfo === null) return;
    if (windowKeyDownEventObjectInfo.trigger !== 'keydown') return;
    if (windowKeyDownEventObjectInfo.targetObjectList.length === 0) return;

    for (const currObjectInfo of windowKeyDownEventObjectInfo.targetObjectList) {
        // windowKeyDownEventObjectInfo.targetObjectList.map((currObjectInfo: any) => {
        // if (windowKeyDownEventObjectInfo === null) return false;
        const targetObjectGroupAction = windowKeyDownEventObjectInfo.action;
        if (currObjectInfo === undefined || currObjectInfo.object === undefined)
            continue;

        if (keyCode === EkeyName.RIGHT) {
            // currObjectInfo.object.style.left =
            //     parseInt(currObjectInfo.object.style.left, 10) + 10 + 'px';
            anime({
                targets: currObjectInfo.object,
                loop: false,
                autoplay: true,
                delay: 0,
                duration: 500,
                easing: 'easeOutCirc',
                left: '+=100',
            });
        } else if (keyCode === EkeyName.LEFT) {
            // currObjectInfo.object.style.left =
            //     parseInt(currObjectInfo.object.style.left, 10) - 10 + 'px';
            anime({
                targets: currObjectInfo.object,
                loop: false,
                autoplay: true,
                delay: 0,
                duration: 500,
                easing: 'easeOutCirc',
                left: '-=100',
            });
        } else if (keyCode === EkeyName.UP) {
            if (targetObjectGroupAction === ELogic_Normal_Actions_Type.play) {
                play(currObjectInfo);
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.pause
            ) {
                pause(currObjectInfo);
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.resume
            ) {
                resume(currObjectInfo);
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.restart
            ) {
                restart(currObjectInfo);
                // restart();
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.appear
            ) {
                currObjectInfo.object.style.opacity = 1;
                currObjectInfo.object.style.display = 'block';
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.disappear
            ) {
                currObjectInfo.object.style.opacity = 0;
                currObjectInfo.object.style.display = 'none';
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.next
            ) {
                // setCanvasContents(getLoadedPageNo() + 1);
                goNextPage();
            } else if (
                targetObjectGroupAction === ELogic_Normal_Actions_Type.prev
            ) {
                // setCanvasContents(getLoadedPageNo() - 1);
                goPrevPage();
            }
        }
    }
};

export const getTlAnimefromTlIndex = (tlIndex: number) => {
    let ret = null;
    for (let index = 0; index < tlList.length; index++) {
        if (index === tlIndex) {
            ret = tlList[index];
            break;
        }
    }
    return ret;
};

export const play = (targetObject: any = null) => {
    try {
        let tlIndex = -1;
        if (targetObject) {
            const objectType = util.getObjectType(targetObject.object);
            if (objectType === EobjectType.audio) {
                playAudio(targetObject.object, null);
                return;
            }
            tlIndex = targetObject.tlIndex;
        }
        // console.log('play index => tlIndex : ', tlIndex);
        // console.log('play index => tlList : ', tlList);

        tlList.some((currTl: any, index: number) => {
            // tlList.forEach((currTl: any, index: number) => {
            //        tlList.map((currTl, index) => {
            // 전체 키프레임 동시 동작
            if (tlIndex < 0) {
                console.log('play index ok : ', index);
                currTl.play();

                // 특정 키프레임만 선택 동작
            } else {
                console.log('tlIndex : ', tlIndex, ', currTl.index : ', index);
                // if(currTl.objectIndex === tlIndex) {
                if (index === tlIndex) {
                    console.log('play index ok : ', index);
                    currTl.play();
                    return true;
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
};
export const pause = (targetObject: any = null) => {
    try {
        let tlIndex = -1;
        if (targetObject) {
            const objectType = util.getObjectType(targetObject.object);
            if (objectType === EobjectType.audio) {
                stopAudio(targetObject.object);
                return;
            }
            tlIndex = targetObject.tlIndex;
        }
        tlList.map((currTl, index) => {
            if (tlIndex < 0) {
                currTl.pause();
            } else {
                if (index === tlIndex) {
                    currTl.pause();
                }
            }
            return true;
        });
    } catch (e) {
        console.log(e);
    }
};
export const resume = (targetObject: any = null) => {
    try {
        let tlIndex = -1;
        if (targetObject) {
            const objectType = util.getObjectType(targetObject.object);
            if (objectType === EobjectType.audio) {
                stopAudio(targetObject.object);
                return;
            }
            tlIndex = targetObject.tlIndex;
        }
        tlList.map((currTl, index) => {
            if (tlIndex < 0) {
                currTl.play();
            } else {
                if (index === tlIndex) {
                    currTl.play();
                }
            }
            return true;
        });
    } catch (e) {
        console.log(e);
    }
};
export const restart = (targetObject: any = null) => {
    try {
        let tlIndex = -1;
        if (targetObject) {
            const objectType = util.getObjectType(targetObject.object);
            if (objectType === EobjectType.audio) {
                playAudio(targetObject.object);
                return;
            }
            tlIndex = targetObject.tlIndex;
        }
        tlList.map((currTl, index) => {
            if (tlIndex < 0) {
                currTl.restart();
            } else {
                if (index === tlIndex) {
                    currTl.restart();
                }
            }
            return true;
        });
    } catch (e) {
        console.log(e);
    }
};

/**
 * template
 * @param tplType template type
 */
export const setTemplateContentsEvent = (tplType: ETemplateType) => {
    console.log('setTemplateContentsEvent tplType : ', tplType);
    if (tplType === ETemplateType.line) {
        LineTemplateEvent.setTemplateEvent();
    } else if (tplType === ETemplateType.select) {
        SelectTemplateEvent.setTemplateEvent();
    } else if (tplType === ETemplateType.quiz) {
        QuizTemplateEvent.setTemplateEvent();
    } else if (tplType === ETemplateType.result) {
        ResultTemplateEvent.setTemplateEvent(previewIdChar);
    }
};

export const getLoadedPageNo = () => {
    return loadedPageNo;
};
export const setLoadedPageNo = (pageNo: number) => {
    loadedPageNo = pageNo;
};
export const getTotalPage = () => {
    return totalPage;
};
export const setTotalPage = (pageNo: number) => {
    totalPage = pageNo;
};

export const initResultDataList = () => {
    resultDataList = [];
};
export const setResultDataList = (list: any[] = []) => {
    resultDataList = list;
    console.log('setResultDataList : ', resultDataList);
    return resultDataList;
};
export const getResultDataList = () => {
    console.log('resultDataList : ', resultDataList);
    return resultDataList;
};
export const addResultDataList = (resultObj: any) => {
    console.log('setResultDataList old resultDataList : ', resultDataList);
    let isMatch = false;
    if (resultDataList.length > 0) {
        resultDataList = resultDataList.map(currResultObj => {
            if (currResultObj.key === resultObj.key) {
                isMatch = true;
                return resultObj;
            }
            return currResultObj;
        });
    }
    if (isMatch === false) {
        resultDataList.push(resultObj);
    }
    console.log('resultDataList : ', resultDataList);
    console.log('resultDataList : ', JSON.stringify(resultDataList));
    return resultDataList;
};
export const removeResultDataList = (key: string) => {
    resultDataList = resultDataList.filter(result => result.key !== key);
    console.log('resultDataList : ', resultDataList);
    return resultDataList;
};
// export const goNextPage = () => {
//     setCanvasContents(getLoadedPageNo() + 1);
// };
// export const goPrevPage = () => {
//     setCanvasContents(getLoadedPageNo() - 1);
// };
export const goNextPage = () => {
    const previewContainer = util.getPreviewContainer();
    if (previewContainer === null) return;

    previewContainer.style.opacity = '0';
    setTimeout(() => {
        setCanvasContents(getLoadedPageNo() + 1);
        previewContainer.style.opacity = '1';
    }, 500);
};
export const goPrevPage = () => {
    // setCanvasContents(getLoadedPageNo() - 1);

    const previewContainer = util.getPreviewContainer();
    if (previewContainer === null) return;

    previewContainer.style.opacity = '0';
    setTimeout(() => {
        setCanvasContents(getLoadedPageNo() - 1);
        previewContainer.style.opacity = '1';
    }, 500);
};
export const goToPage = (pageNo = 1) => {
    const previewContainer = util.getPreviewContainer();
    if (previewContainer === null) return;
    previewContainer.style.opacity = '0';
    setTimeout(() => {
        setCanvasContents(pageNo);
        previewContainer.style.opacity = '1';
    }, 500);
};
export const openUrlLink = (url: string) => {
    const validUrl = util.getValidUrlLink(url);

    console.log('validUrl : ', validUrl);
    if (validUrl === '') return;

    const win = window.open(validUrl, '_blank');
    win?.focus();
};
export const playAudio = (audioObj: any, endCB: any = null) => {
    const audioUrl = audioObj.getAttribute('resource-url') || '';
    if (audioUrl === '') return;

    let audioId = audioObj.getAttribute('resource-id') || '';
    if (audioId === '') return;
    audioId = 'mcd_audio_' + audioId;

    let audioPlayerObj = document.getElementById(audioId) as HTMLAudioElement;

    // 재생중 이라면 멈춘다.
    if (audioPlayerObj !== null && audioPlayerObj.paused === false) {
        audioPlayerObj.pause();
        // audioPlayerObj.currentTime = 0;
        return;
    }

    if (audioPlayerObj === null) {
        audioPlayerObj = document.createElement('audio') as HTMLAudioElement;
        audioPlayerObj.setAttribute('id', audioId);
        audioPlayerObj.setAttribute('preload', '');
        audioPlayerObj.setAttribute('controls', 'none');
        audioPlayerObj.style.display = 'none';
        audioPlayerObj.setAttribute('src', audioUrl);
        const ctlContainer = document.querySelector(
            '.meeoocat-view-container-ctl',
        ) as HTMLDivElement;
        if (ctlContainer !== null) {
            ctlContainer.appendChild(audioPlayerObj);
        } else {
            document.body.appendChild(audioPlayerObj);
        }
    }
    // audioPlayerObj.setAttribute('src', audioUrl);
    console.log('audio play url : ', audioUrl);
    audioPlayerObj.load();
    audioPlayerObj.play();
    audioPlayerObj.addEventListener('ended', () => {
        console.log('audio end');
        if (typeof endCB === 'function') {
            endCB();
        }
    });
};
export const stopAudio = (audioObj: any) => {
    try {
        const audioId = audioObj.getAttribute('resource-id') || '';
        if (audioId === '') return;
        const audioPlayerObj = document.getElementById(
            'mcd_audio_' + audioId,
        ) as HTMLAudioElement;
        if (audioPlayerObj !== null && audioPlayerObj.paused === false) {
            audioPlayerObj.pause();
            audioPlayerObj.currentTime = 0;
        }
    } catch (e) {
        console.log(e);
    }
};
export const stopAllAudio = () => {
    try {
        const audioPlayerObjList = document.querySelectorAll('audio');
        audioPlayerObjList.forEach((audioPlayerObj: any) => {
            if (
                audioPlayerObj.id.indexOf('mcd_audio_') === 0 &&
                audioPlayerObj.paused === false
            ) {
                audioPlayerObj.pause();
                audioPlayerObj.currentTime = 0;
            }
        });
    } catch (e) {
        console.log(e);
    }
};

export const storeFormData = (obj: any) => {
    console.log('storeFormData obj : ', obj);

    const previewPageObject = util.getPreviewPageObject();
    if (previewPageObject === null) return;
    for (const storeFormType of storeFormTypeList) {
        const checkObj =
            (obj.querySelector(`input.${storeFormType}`) as HTMLInputElement) ||
            null;
        if (checkObj) {
            let isChecked = false;
            let formValue = '';
            if (checkObj.type === 'checkbox') {
                isChecked = checkObj.checked;
                formValue = isChecked ? 'on' : 'off';
            } else if (checkObj.type === 'text') {
                formValue = checkObj.value.trim();
                if (formValue !== '') {
                    isChecked = true;
                }
            }
            const data: ILogic_Data_FormData_StoreInfo = {
                pageId: previewPageObject.id,
                objId: obj.id,
                formValue: formValue,
                isChecked: isChecked,
                formType: checkObj.type,
            };
            console.log('setFormData data : ', data);
            DataStore.setFormData(data);
        }
    }
};
export const loadFormData = (obj: any) => {
    // console.log('loadFormData obj : ', obj);

    const previewPageObject = util.getPreviewPageObject();
    if (previewPageObject === null) return;
    for (const storeFormType of storeFormTypeList) {
        const checkObj =
            (obj.querySelector(`input.${storeFormType}`) as HTMLInputElement) ||
            null;
        if (checkObj) {
            const formData = DataStore.getFormData(
                previewPageObject.id,
                obj.id,
            );
            console.log('loadFormData formData : ', formData);
            if (formData !== null) {
                if (
                    formData.formType === 'checkbox' &&
                    checkObj.type === 'checkbox'
                ) {
                    if (formData.isChecked === true) {
                        checkObj.checked = formData.isChecked;
                        setTimeout(() => {
                            const event = new Event('change');
                            checkObj.dispatchEvent(event);
                        }, 100);
                    }
                } else if (
                    formData.formType === 'text' &&
                    checkObj.type === 'text'
                ) {
                    checkObj.value = formData.formValue;
                }
            }
        }
    }
};
const setDataToObject = (obj: any, data = '') => {
    console.log('setDataToObject');
    if (obj === null) return;
    let textContent = String(data);

    let textboxObj = null;
    textboxObj = obj.querySelector('.textbox p span span span');
    if (textboxObj === null) {
        textboxObj = obj.querySelector('.textbox p span span');
    }
    if (textboxObj === null) {
        textboxObj = obj.querySelector('.textbox p span');
    }
    if (textboxObj === null) {
        textboxObj = obj.querySelector('.textbox p');
    }
    if (textboxObj === null) {
        textboxObj = obj.querySelector('.textbox');
        textContent = `<p style="text-align: center;">${data}</p>`;
    }
    if (textboxObj === null) {
        textboxObj = document.createElement('div');
        textboxObj.setAttribute('class', 'textbox');
        obj.appendChild(textboxObj);
    }
    if (textboxObj === null) return;
    textboxObj.innerHTML = textContent;
};

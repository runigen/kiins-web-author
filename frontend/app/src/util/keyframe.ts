import $ from 'jquery';
import * as common from './common';
import * as objects from './objects';
import workInfo from '../store/workInfo';
// import { showToastMessage } from './dialog';
import {
    IkeyframeInfo,
    IkeyFrameStepMoveInfo,
    IignoreInfo,
} from '../const/types';
import { refreshObjectSelector } from '../event/SquareEvent';

export const applyKeyframeInfo = (
    targetObject: HTMLElement,
    keyframeInfo: IkeyframeInfo[],
) => {
    if (keyframeInfo.length === 0) {
        $(targetObject).removeAttr('keyframe-info');
        $(targetObject).removeClass('keyframe');
    } else {
        $(targetObject).attr('keyframe-info', JSON.stringify(keyframeInfo));
        $(targetObject).addClass('keyframe');
    }
    refreshObjectSelector(targetObject);

    //workInfo.setObject(null);
    workInfo.setObject(targetObject);
    workInfo.setUpdateKey();

    // 키프레임 정보 변경 플래그 처리
    workInfo.setModifiedKeyframe();
};

export const addKeyFrame = () => {
    // const targetObject = workInfo.getObject();
    const timelineZoom = workInfo.getTimelineZoom();
    const objectGroup = workInfo.getObjectGroup();

    //if (targetObject === null) return;
    if (objectGroup.length === 0) return;

    objectGroup.forEach(obj => {
        const sizeObj = objects.getObjectShapeInfo(obj);
        // console.log("sizeObj : ", sizeObj);

        const timeLeftVal = common.getProgressBarPosition();
        const keyframeInfo = {
            timeLeft: timeLeftVal / timelineZoom,
            size: sizeObj,
            ignore: {
                x: false,
                y: false,
            },
        };

        // 이전 설정된 키 프레임에 업데이트
        const newKeyframeInfoList = updateKeyframeInfo(
            obj,
            keyframeInfo,
            'merge',
        );
        // console.log("newKeyframeInfoList : " , newKeyframeInfoList);

        applyKeyframeInfo(obj, newKeyframeInfoList);
        // showToastMessage('키프레임이 추가되었습니다.', 1);
    });
};

export const getKeyFrameInfo = (
    targetObject: HTMLElement,
    bRemove = false,
): IkeyframeInfo[] => {
    if (!targetObject) return [];
    const orgKeyFrameInfo: IkeyframeInfo[] | null = common.parseJsonData(
        targetObject.getAttribute('keyframe-info'),
    );
    if (orgKeyFrameInfo === null) return [];
    if (bRemove) {
        removeAllKeyframe(targetObject);
    }
    return orgKeyFrameInfo;
};

/*
export const removeKeyFrame = (targetObject: any, targetVal: number, timeLeftVal: number) => {

    if (targetObject === null) return;

    console.log("removeKeyFrame Start : " , targetVal, timeLeftVal);

    const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
    if (orgKeyFrameInfo.length === 0) return;

    const currKeyFrameItem = orgKeyFrameInfo.find((item: any) => item.target === targetVal);
    if(typeof currKeyFrameItem === 'undefined') return;

    const currKeyFrameData = currKeyFrameItem.frameData;
    console.log("currKeyFrameData: " , currKeyFrameData);
    if(typeof currKeyFrameData === 'undefined') return;

    const currrameStepInfo = currKeyFrameData.find((item: IkeyframeInfo) => item.timeLeft === timeLeftVal);
    if(typeof currrameStepInfo === 'undefined') return;
    
    const newKeyFrameStepInfo = currKeyFrameData.filter((item: IkeyframeInfo) => item.timeLeft !== timeLeftVal);
    console.log("newKeyFrameStepInfo: " , newKeyFrameStepInfo);

    
    const setKeyframeInfo = {
        target: targetVal,
        frameData : [...newKeyFrameStepInfo]
    };
    let newKeyframeInfoList = updateKeyframeInfo(targetObject, setKeyframeInfo, 'replace');

    applyKeyframeInfo(targetObject, newKeyframeInfoList);

    // targetObject.setAttribute(
    //     'keyframe-info',
    //     JSON.stringify(newKeyframeInfoList),
    // );
    // //workInfo.setObject(null);
    // workInfo.setObject(targetObject);
    // workInfo.setUpdateKey();

    console.log("removeKeyFrame End ---");

};
*/

export const removeAllKeyframe = (currObject: HTMLElement) => {
    if (currObject === null) return;
    $(currObject).removeAttr('keyframe-info');
    $(currObject).removeClass('keyframe');
};

/**
 *
 * @param {*} targetObject : 대상 객체
 * @param {*} timeLeft : 선택한 키프레임의 timeLeft 값
 * @returns
 */
export const removeKeyframeStep = (
    targetObject: HTMLElement,
    timeLeft: number,
) => {
    if (targetObject === null) return;

    console.log('removeKeyFrame Start : timeLeft : ', timeLeft);

    const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
    if (orgKeyFrameInfo.length === 0) return;

    const newKeyFrameStepInfo = orgKeyFrameInfo.filter(
        (item: IkeyframeInfo) => item.timeLeft !== timeLeft,
    );
    let newKeyframeInfoList = updateKeyframeInfo(
        targetObject,
        newKeyFrameStepInfo,
        'replace',
    );

    if (newKeyframeInfoList.length === 1) {
        newKeyframeInfoList = [];
    }

    applyKeyframeInfo(targetObject, newKeyframeInfoList);

    console.log('removeKeyFrame End ---');
};

/**
 * updateKeyframeInfo : 현재 객체의 키프레임 정보를 갱신하고, 갱신된 키프레임 전체정보를 배열형태로 리턴한다.
 * @param {*} currObject : 업데이트할 객체
 * @param {*} newKeyframeInfo : 업데이트할 키프레임정보 (아래 updateType 이 merge 인경우 객체, 그렇지 않은경우는 배열)
 * @param {*} updateType : merge : 기존값에 추가 (timeLeft 가 동일한값이 이미 존재할경우 해당 timeLeft항목에 대체), merge외 : 기존 키프레임값 전체를 대체
 * @returns Array : 해당 객체의 키프레임 전체 목록
 */
export const updateKeyframeInfo = (
    currObject: HTMLElement,
    newKeyframeInfo: any,
    updateType = 'merge',
) => {
    const orgKeyFrameInfo = getKeyFrameInfo(currObject);

    let updateKeyFrameInfoList: any;
    //    if (Array.isArray(orgKeyFrameInfo) && orgKeyFrameInfo.length > 0) {

    // 이전 키프레임 정보가 없었다면 replace 로 간주
    if (orgKeyFrameInfo.length === 0) {
        updateType = 'replace';
    }

    // -- merge (add)
    if (updateType === 'merge') {
        // 객체형태로 들어와야 하지만 배열로 들어오는경우 첫번째값만 취한다.
        if (Array.isArray(newKeyframeInfo)) {
            updateKeyFrameInfoList = newKeyframeInfo[0];

            // 객체형태 정상
        } else {
            const orgMatchKeyframeInfo = orgKeyFrameInfo.find(
                (item: IkeyframeInfo) =>
                    item.timeLeft === newKeyframeInfo.timeLeft,
            );
            if (typeof orgMatchKeyframeInfo !== 'undefined') {
                newKeyframeInfo = {
                    ...orgMatchKeyframeInfo,
                    ...newKeyframeInfo,
                };
            }

            const noDuplicatesList = orgKeyFrameInfo.filter(
                (item: IkeyframeInfo) =>
                    item.timeLeft !== newKeyframeInfo.timeLeft,
            );
            noDuplicatesList.push(newKeyframeInfo);
            updateKeyFrameInfoList = noDuplicatesList;
        }

        // -- replace all
    } else {
        // 배열 형태 정상
        if (Array.isArray(newKeyframeInfo)) {
            updateKeyFrameInfoList = [...newKeyframeInfo];

            // 배열형태로 들어와야 정상이지만 객체형태로 들어오면 배열로 만든다.
        } else if (typeof newKeyframeInfo === 'object') {
            updateKeyFrameInfoList = [{ ...newKeyframeInfo }];
        }
    }

    //    }

    // timeLeft를 기준으로 정렬
    updateKeyFrameInfoList = common.sortObjectList(
        updateKeyFrameInfoList,
        'timeLeft',
    );

    return updateKeyFrameInfoList;
};

/*
export const updateKeyframeInfo = (currObject, newKeyframeInfo, updateType='merge') => {
    let newKeyframeInfoList = [];
    let updateKeyFrameInfoList = [];

    if (currObject.getAttribute('keyframe-info')) {

        const orgKeyFrameInfo = common.parseJsonData(
            currObject.getAttribute('keyframe-info'),
        );

        let duple = false;
        updateKeyFrameInfoList = orgKeyFrameInfo.map(item=>{

            let newData = [];
            if(item.target === newKeyframeInfo.target) {

                duple = true;

                // merge  : 기존 배열 + 새로운 배열
                if(updateType === 'merge') {

                    // 기존에 세팅되어 있던 timeLeft 값과 추가할 timeLeft 값이 다를 것들로만 새로운 배열 만든다.
                    let uniqData = item.filter(data=>data.timeLeft !== newKeyframeInfo.timeLeft);
                    const matchData = item.find(data=>data.timeLeft === newKeyframeInfo.timeLeft);
                    let addData = {};
                    if(typeof matchData !== 'undefined') {
                        addData = {
                            ...matchData
                        };
                    }
                    addData = {
                        ...addData,
                        ...newKeyframeInfo,
                    };

                    // 새로운 배열에 추가할 timeLeft 값을 삽입한다. 
                    uniqData.push(addData);

                    // timeLeft값으로 정렬
                    uniqData = common.sortObjectList(uniqData, 'timeLeft');

                    // 새로운 데이터 생성
                    newData = {
                        ...uniqData,
                    };

                // replace : 기존 배열을 새로운값으로 교체
                } else {

                    // 데이터가 있는경우만 교체
                    if(newKeyframeInfo.length > 0) {
                        newData = {
                            ...newKeyframeInfo
                        };

                    // 데이터가 없으면 null 로 리턴하고 아래 filter 에서 제거
                    } else {
                        newData = null;
                    }
                }
                
            } else {
                newData = item;
            }            
            return newData;

        }).filter(item=>item !== null);

        // -- target 중복값이 없었으면 위 로직에서 값이 추가 되지 않았으므로 직접 추가해준다.
        if(duple !== true) {
            updateKeyFrameInfoList.push(newKeyframeInfo);
        }

    } else {
        updateKeyFrameInfoList.push(newKeyframeInfo);
    }

    return updateKeyFrameInfoList;

};
*/

export const getKeyFrameStepMoveInfo = (step: number) => {
    let stepInfo = {
        currIndex: step,
        currTimeLeft: 0,
        prevTimeLeft: 0,
        nextTimeLeft: 0,
    };

    try {
        const targetObject = workInfo.getObject();
        if (targetObject === null) return null;

        const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
        if (orgKeyFrameInfo.length === 0) return null;

        if (step < 0) {
            return null;
        }

        const currStepInfo = orgKeyFrameInfo[step];
        stepInfo = {
            ...stepInfo,
            currTimeLeft: currStepInfo.timeLeft,
        };

        if (step === 0) {
            stepInfo = {
                ...stepInfo,
                prevTimeLeft: 0,
            };
        } else {
            stepInfo = {
                ...stepInfo,
                prevTimeLeft: orgKeyFrameInfo[step - 1].timeLeft,
            };
        }

        stepInfo = {
            ...stepInfo,
            nextTimeLeft:
                orgKeyFrameInfo.length > step + 1
                    ? orgKeyFrameInfo[step + 1].timeLeft
                    : Infinity,
        };

        /*
        const currKeyFrameItem = orgKeyFrameInfo.find(item => item.target === targetVal);
        if(typeof currKeyFrameItem === 'undefined') return -2;

        const currKeyFrameData = currKeyFrameItem.frameData;
        if(typeof currKeyFrameData === 'undefined') return -5;

        const currFameStepIndex = currKeyFrameData.findIndex(item => item.timeLeft === timeLeftVal);
        // const currFrameStepInfo = currKeyFrameData.find(item => item.timeLeft === timeLeftVal);

        stepInfo = {
            ...stepInfo,
            currIndex: currFameStepIndex,
        };
        if(currFameStepIndex < 0) {
            return stepInfo;
        }

        stepInfo = {
            ...stepInfo,
            currTimeLeft: currKeyFrameData[currFameStepIndex].timeLeft,
            currSize: currKeyFrameData[currFameStepIndex].size,
        };

        if(currKeyFrameData.length === 1) {
            stepInfo = {
                ...stepInfo,
                prevSize: currKeyFrameData[currFameStepIndex].size,
                nextTimeLeft: Infinity,
                nextSize: currKeyFrameData[currFameStepIndex].size,
            };
            return stepInfo;
        }



        // -- 첫번째 블럭인경우
        if(currFameStepIndex === 0) {
            
            stepInfo = {
                ...stepInfo,
                prevSize: currKeyFrameData[currFameStepIndex].size,
                nextTimeLeft: currKeyFrameData[currFameStepIndex+1].timeLeft,
                nextSize: currKeyFrameData[currFameStepIndex+1].size,
            }

        // -- 마지막 블럭인 경우
        } else if(currFameStepIndex === currKeyFrameData.length-1) {

            stepInfo = {
                ...stepInfo,
                prevTimeLeft: currKeyFrameData[currFameStepIndex-1].timeLeft,
                prevSize: currKeyFrameData[currFameStepIndex-1].size,
                nextTimeLeft: Infinity,
                nextSize: currKeyFrameData[currFameStepIndex].size,
            };

        // -- 그외 블럭
        } else {
            stepInfo = {
                ...stepInfo,
                prevTimeLeft: currKeyFrameData[currFameStepIndex-1].timeLeft,
                prevSize: currKeyFrameData[currFameStepIndex-1].size,
                nextTimeLeft: currKeyFrameData[currFameStepIndex+1].timeLeft,
                nextSize: currKeyFrameData[currFameStepIndex+1].size,
            };
        }
        */

        return stepInfo;
    } catch (e) {
        return null;
    }
};

export const setKeyFrameStepBoxMoveInfo = (
    keyFrameStepMoveInfo: IkeyFrameStepMoveInfo,
    timeLeftStart: number,
    timeLeftEnd: number,
) => {
    try {
        const keyFrameStep = keyFrameStepMoveInfo.currIndex;

        // const targetVal = keyFrameStepMoveInfo.target;
        // console.log("setKeyFrameStepMoveInfo Start ---");
        // console.log("keyFrameStepMoveInfo : ", keyFrameStepMoveInfo);
        // console.log("timeLeftStart : ", timeLeftStart);
        // console.log("timeLeftEnd : ", timeLeftEnd);
        // console.log("keyFrameStep : ", keyFrameStep);

        // start 0보다 작을 수 없음
        if (timeLeftStart < 0) return;

        const targetObject = workInfo.getObject();
        if (targetObject === null) return -14;

        const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
        if (orgKeyFrameInfo.length === 0) return -13;

        const newFrameData = orgKeyFrameInfo.map(
            (item: IkeyframeInfo, index: number) => {
                if (index === keyFrameStep) {
                    return {
                        ...item,
                        timeLeft: timeLeftStart,
                    };
                } else if (index === keyFrameStep + 1) {
                    return {
                        ...item,
                        timeLeft: timeLeftEnd,
                    };
                } else {
                    return item;
                }
            },
        );

        const newKeyFrameInfo = [...newFrameData];
        const newKeyframeInfoList = updateKeyframeInfo(
            targetObject,
            newKeyFrameInfo,
            'replace',
        );

        applyKeyframeInfo(targetObject, newKeyframeInfoList);
    } catch (e) {
        console.log(e);
    }
};

export const setKeyFrameStepMoveInfo = (
    keyFrameStepMoveInfo: IkeyFrameStepMoveInfo,
    timeLeftVal: number,
) => {
    const keyFrameStep = keyFrameStepMoveInfo.currIndex;

    // const targetVal = keyFrameStepMoveInfo.target;

    console.log('setKeyFrameStepMoveInfo Start ---');
    console.log('keyFrameStepMoveInfo : ', keyFrameStepMoveInfo);
    console.log('timeLeftVal : ', timeLeftVal);

    const targetObject = workInfo.getObject();
    if (targetObject === null) return -14;

    const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
    if (orgKeyFrameInfo.length === 0) return -13;

    /*
    const currKeyFrameItem = orgKeyFrameInfo.find(item => item.target === targetVal);
    if(typeof currKeyFrameItem === 'undefined') return -12;

    const currKeyFrameData = currKeyFrameItem;
    if(typeof currKeyFrameData === 'undefined') return -15;

    //let currFrameStepInfo = currKeyFrameData.find((item, index) => keyFrameStep === index);
    //if(typeof currFrameStepInfo === 'undefined') return -16;
    // const newFrameStepInfo = {
    //     ...currFrameStepInfo,
    //     timeLeft: timeLeftVal
    // };

    */

    // ------------------------------------- 사이즈 제한 설정

    // 0보다 작으면 0으로고정
    if (timeLeftVal < 0) {
        timeLeftVal = 0;
    }

    // 이전, 다음 키프레임을 넘을 수 없음
    if (timeLeftVal < keyFrameStepMoveInfo.prevTimeLeft) {
        timeLeftVal = keyFrameStepMoveInfo.prevTimeLeft;
    }
    if (timeLeftVal > keyFrameStepMoveInfo.nextTimeLeft) {
        timeLeftVal = keyFrameStepMoveInfo.nextTimeLeft;
    }

    const newFrameData = orgKeyFrameInfo.map(
        (item: IkeyframeInfo, index: number) => {
            if (index === keyFrameStep) {
                return {
                    ...item,
                    timeLeft: timeLeftVal,
                };
            } else {
                return item;
            }
        },
    );

    const newKeyFrameInfo = [...newFrameData];
    // console.log(newKeyFrameInfo);
    const newKeyframeInfoList = updateKeyframeInfo(
        targetObject,
        newKeyFrameInfo,
        'replace',
    );

    applyKeyframeInfo(targetObject, newKeyframeInfoList);

    // targetObject.setAttribute(
    //     'keyframe-info',
    //     JSON.stringify(newKeyframeInfoList),
    // );
    // workInfo.setObject(targetObject);
    // workInfo.setUpdateKey();

    console.log('setKeyFrameStepMoveInfo End ---');
    return 0;
};

export const getKeyFrameStepInfo = (timeLeftVal: number) => {
    const targetObject = workInfo.getObject();
    if (targetObject === null) return null;

    const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
    if (orgKeyFrameInfo.length === 0) return null;

    const currFrameStepInfo =
        orgKeyFrameInfo.find(
            (item: IkeyframeInfo) => item.timeLeft === timeLeftVal,
        ) || null;
    return currFrameStepInfo;
};

export const setKeyFrameEasingInfo = (
    timeLeftVal: number,
    easingVal = 'linear',
) => {
    const targetObject = workInfo.getObject();
    if (targetObject === null) return null;

    const keyframeStepInfo = getKeyFrameStepInfo(timeLeftVal);

    const newKeyframeStepInfo = {
        ...keyframeStepInfo,
        easing: easingVal,
    };
    const newKeyframeInfoList = updateKeyframeInfo(
        targetObject,
        newKeyframeStepInfo,
        'merge',
    );

    applyKeyframeInfo(targetObject, newKeyframeInfoList);

    // targetObject.setAttribute(
    //     'keyframe-info',
    //     JSON.stringify(newKeyframeInfoList),
    // );
    // //workInfo.setObject(null);
    // workInfo.setObject(targetObject);
    // workInfo.setUpdateKey();

    console.log('removeKeyFrame End ---');
};

export const setKeyFrameIgnoreInfo = (
    keyframeIndex: number,
    ignoreData: IignoreInfo,
) => {
    try {
        const targetObject = workInfo.getObject();
        if (targetObject === null) return null;
        const orgKeyFrameInfo = getKeyFrameInfo(targetObject);
        if (orgKeyFrameInfo.length < keyframeIndex + 1) return null;

        const newKeyframeStepInfo = {
            ...orgKeyFrameInfo[keyframeIndex],
            ignore: ignoreData,
        };
        const newKeyframeInfoList = updateKeyframeInfo(
            targetObject,
            newKeyframeStepInfo,
            'merge',
        );
        applyKeyframeInfo(targetObject, newKeyframeInfoList);
    } catch (e) {
        console.log(e);
    }
};

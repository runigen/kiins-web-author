import $ from 'jquery';
import * as common from './common';
import workInfo from '../store/workInfo';
import { ItransitionInfo } from '../const/types';
import { refreshObjectSelector } from '../event/SquareEvent';

export const defaultFadeDuration = 50; // 500ms

export const applyTransitionInfo = (
    targetObject: HTMLElement | null,
    transitionInfo: ItransitionInfo[],
) => {
    if (targetObject === null) return null;

    if (transitionInfo.length === 0) {
        $(targetObject).removeAttr('transition-info');
        $(targetObject).removeClass('transition');
    } else {
        $(targetObject).attr('transition-info', JSON.stringify(transitionInfo));
        $(targetObject).addClass('transition');
    }
    refreshObjectSelector(targetObject);

    //workInfo.setObject(null);
    workInfo.setObject(targetObject);
    workInfo.setUpdateKey();

    // 키프레임 정보 변경 플래그 처리
    workInfo.setModifiedKeyframe();
};

export const getTransitionInfo = (
    targetObject: HTMLElement | null,
    bRemove = false,
): ItransitionInfo[] => {
    if (targetObject === null) return [];
    const transitionInfoList: ItransitionInfo[] | null = common.parseJsonData(
        targetObject.getAttribute('transition-info'),
    );
    if (transitionInfoList === null) return [];
    if (bRemove) {
        removeAllTransition(targetObject);
    }
    return transitionInfoList;
};

const setTransionInfoList = (transitionInfoList: ItransitionInfo[]) => {
    const targetObject = workInfo.getObject();
    if (targetObject === null) return null;

    transitionInfoList = common.sortObjectList(transitionInfoList, 'start');
    console.log('transitionInfoList : ', transitionInfoList);

    // -- transition 이 1개도 없다면 opacity 속성을 제거한다.
    if (transitionInfoList.length === 0) {
        $(targetObject).css('opacity', '');
    }

    applyTransitionInfo(targetObject, transitionInfoList);
};

/**
 *
 * @param {"type": string, "start": number, "end": number} transitionInfo
 * @returns boolean
 */
export const updateTransitionInfo = (transitionInfo: ItransitionInfo) => {
    const targetObject = workInfo.getObject();
    if (targetObject === null) return null;

    const initTransitionInfo = {
        type: '',
        action: '',
        start: 0,
        end: 0,
    };

    // if(transitionInfo.type === 'fade' && typeof transitionInfo.end === 'undefined') {
    //     transitionInfo.end = transitionInfo.start + defaultFadeDuration;
    // }
    if (transitionInfo.type === 'appear') {
        transitionInfo.end = transitionInfo.start + 1;
    }

    transitionInfo = {
        ...initTransitionInfo,
        ...transitionInfo,
    };
    console.log('updateTransitionInfo transitionInfo : ', transitionInfo);

    const orgTransitionInfo = getTransitionInfo(targetObject);
    let mergeTransitionInfo: ItransitionInfo[] = [];
    if (orgTransitionInfo.length !== 0) {
        const dupleTransitionInfo = orgTransitionInfo.find(
            (item: ItransitionInfo) =>
                item.type === transitionInfo.type &&
                item.start === transitionInfo.start,
        );
        if (typeof dupleTransitionInfo === 'undefined') {
            mergeTransitionInfo = [...orgTransitionInfo];
        } else {
            const undupleTransitionInfo = orgTransitionInfo.filter(
                (item: ItransitionInfo) =>
                    item.type !== transitionInfo.type &&
                    item.start !== transitionInfo.start,
            );
            mergeTransitionInfo = [...undupleTransitionInfo];
        }
    }
    mergeTransitionInfo.push(transitionInfo);
    setTransionInfoList(mergeTransitionInfo);
};

export const removeAllTransition = (currObject: HTMLElement) => {
    if (currObject === null) return;
    $(currObject).removeAttr('transition-info');
    $(currObject).removeClass('transition');
};

// step 번째에(0번부터) 있는 transition 제거
export const removeTransition = (
    targetObject: HTMLElement | null,
    step: number,
) => {
    if (targetObject === null) return;

    console.log('removeTransition Start : step: ', step);

    const orgTransitionInfo = getTransitionInfo(targetObject);
    if (orgTransitionInfo.length === 0) return;

    const newTransitionInfo = orgTransitionInfo.filter(
        (item: ItransitionInfo, index: number) => index !== step,
    );
    console.log('newTransitionInfo: ', newTransitionInfo);

    setTransionInfoList(newTransitionInfo);

    console.log('removeTransition End ---');
};

// step 번째에(0번부터) 있는 transition 값 대체 (start, end 값만)
export const replaceTransitionInfo = (
    step: number,
    transition: ItransitionInfo,
) => {
    const targetObject = workInfo.getObject();
    if (targetObject === null) return null;

    const orgTransitionInfo = getTransitionInfo(targetObject);
    if (orgTransitionInfo.length === 0) return;

    console.log('replaceTransitionInfo Start : ', step, transition);

    const newTransitionList = orgTransitionInfo.filter(
        (item: ItransitionInfo, index: number) => index !== step,
    );
    console.log('newTransitionList: ', newTransitionList);
    newTransitionList.push(transition);

    setTransionInfoList(newTransitionList);

    console.log('replaceTransitionInfo End ---');
};

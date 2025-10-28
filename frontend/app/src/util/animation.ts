import $ from 'jquery';
import * as common from './common';
import workInfo from '../store/workInfo';
import { IanimationInfo } from '../const/types';

// /* 배열형식 사용 */
// const applyAnimationInfo = (targetObject: any, animationInfo: IanimationInfo[]) => {
//     targetObject.setAttribute(
//         'animation-info',
//         JSON.stringify(animationInfo),
//     );
//     workInfo.setObject(targetObject);
//     workInfo.setUpdateKey();
// }
// export const getAnimationInfo = (targetObject: any) : IanimationInfo[] => {
//     if(!targetObject) return [];
//     const animationInfoList: IanimationInfo[] | null = common.parseJsonData(
//         targetObject.getAttribute('animation-info')
//     );
//     if(animationInfoList === null) return [];
//     return animationInfoList;
// };
// export const addAnimationInfo = (targetObject: any, animationInfo: IanimationInfo) : void => {
//     // 현재 1가지만 있으므로 1개만 새팅.
//     applyAnimationInfo(targetObject, [animationInfo]);
// };

/* 객체형식 사용 */
export const applyAnimationInfo = (
    targetObject: HTMLElement,
    animationInfo: IanimationInfo | null | '',
) => {
    if (animationInfo === null || animationInfo === '') {
        $(targetObject).removeAttr('animation-info');
    } else {
        $(targetObject).attr('animation-info', JSON.stringify(animationInfo));
    }

    workInfo.setObject(targetObject);
    workInfo.setUpdateKey();
};
export const getAnimationInfo = (
    targetObject: HTMLElement,
    bRemove = false,
): IanimationInfo | null => {
    if (!targetObject) return null;
    const animationInfoList = common.parseJsonData(
        targetObject.getAttribute('animation-info'),
    );
    if (bRemove) {
        removeAllAnimation(targetObject);
    }
    return animationInfoList;
};
export const addAnimationInfo = (
    targetObject: HTMLElement,
    animationInfo: IanimationInfo,
): void => {
    // 현재 1가지만 있으므로 1개만 새팅.

    let newAnimationInfo = animationInfo;
    const orgAnimationInfo = getAnimationInfo(targetObject);
    if (orgAnimationInfo) {
        newAnimationInfo = {
            ...orgAnimationInfo,
            ...animationInfo,
        };
    }
    applyAnimationInfo(targetObject, newAnimationInfo);
};
export const removeAllAnimation = (currObject: HTMLElement) => {
    if (!currObject) return;
    $(currObject).removeAttr('animation-info');
};

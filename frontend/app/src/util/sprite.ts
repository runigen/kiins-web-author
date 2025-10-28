import $ from 'jquery';
import * as common from './common';
import workInfo from '../store/workInfo';
import { IspriteInfo } from '../const/types';
import * as objects from '../util/objects';

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
const applySpriteInfo = (
    targetObject: HTMLElement | null,
    spriteInfo: IspriteInfo,
) => {
    if (targetObject === null) return;
    targetObject.setAttribute('sprite-info', JSON.stringify(spriteInfo));
    workInfo.setObject(targetObject);
    workInfo.setUpdateKey();
};
export const getSpriteInfo = (
    targetObject: HTMLElement | null,
    bRemove = false,
): IspriteInfo | null => {
    if (!targetObject) return null;
    const spriteInfo: IspriteInfo | null = common.parseJsonData(
        targetObject.getAttribute('sprite-info'),
    );
    if (bRemove) {
        removeAllSprite(targetObject);
    }
    return spriteInfo;
};
export const removeAllSprite = (targetObject: HTMLElement) => {
    if (!targetObject) return;
    $(targetObject).removeAttr('sprite-info');
    $(targetObject).removeClass('sprite');
};
export const addSpriteInfo = (
    targetObject: HTMLElement | null,
    spriteInfo: IspriteInfo,
): void => {
    // 현재 1가지만 있으므로 1개만 새팅.
    let newSpriteInfo = spriteInfo;
    const orgSpriteInfo = getSpriteInfo(targetObject);
    if (orgSpriteInfo) {
        newSpriteInfo = {
            ...orgSpriteInfo,
            ...spriteInfo,
        };
    }
    applySpriteInfo(targetObject, newSpriteInfo);
};

export const showSpritePopup = () => {
    console.log('craeteSpriteImage');
    $('#idx_dialog_dim').show();
    $('#DIALOG_SPRITE').show();
};
export const hideSpritePopup = () => {
    console.log('hideSpritePopup');
    $('#DIALOG_SPRITE').hide();
    $('#idx_dialog_dim').hide();
};

import workInfo from '../store/workInfo';
import * as common from './common';
import { IinteractionsInfo } from '../const/types';
import $ from 'jquery';
import { refreshObjectSelector } from '../event/SquareEvent';
// import { getObjectSelector } from '../util/objects';

export const applyInteractions = (
    currObject: HTMLElement | null,
    interactionsInfo: IinteractionsInfo[],
) => {
    console.log(interactionsInfo);

    if (currObject === null) return;

    // const objectSelector = getObjectSelector(currObject);

    if (interactionsInfo.length === 0) {
        $(currObject).removeAttr('interactions-info');
        $(currObject).removeClass('interactions');
        // if(objectSelector) $(objectSelector).removeClass('interactions');
    } else {
        $(currObject).attr(
            'interactions-info',
            JSON.stringify(interactionsInfo),
        );
        $(currObject).addClass('interactions');
        // if(objectSelector) $(objectSelector).addClass('interactions');
    }

    // -- refreshObjectSelector 문제 있을경우 위 주석문(if문) 풀고, 아래는 주석
    workInfo.setUpdateKey();
    if (workInfo.getObject() === null) return;

    refreshObjectSelector(currObject);
    workInfo.setObject(currObject);

    // 키프레임 정보 변경 플래그 처리
    // workInfo.setModifiedKeyframe();
    workInfo.setModifiedInteraction();
};
export const addInteractions = (
    currObject: HTMLElement | null,
    interactionsInfo: IinteractionsInfo,
) => {
    const interactionsInfoList = getInteractionsInfo(currObject);
    if (interactionsInfoList.length === 0) {
        applyInteractions(currObject, [interactionsInfo]);
    } else {
        // let unMatchList = interactionsInfoList.filter(interaction => interaction.id !== interactionsInfo.id);
        // unMatchList.push(interactionsInfo);
        // applyInteractions(currObject, unMatchList);
        let matchCnt = 0;
        const newInteractionList = interactionsInfoList.map(
            (orgInteractionsInfo: IinteractionsInfo) => {
                if (orgInteractionsInfo.id === interactionsInfo.id) {
                    matchCnt++;
                    return interactionsInfo;
                } else {
                    return orgInteractionsInfo;
                }
            },
        );
        // 기존의 인터렉션과 동일한 셋이 없었다면 마지막에 추가한다.
        if (matchCnt === 0) {
            newInteractionList.push(interactionsInfo);
        }
        applyInteractions(currObject, newInteractionList);
    }
};
// export const removeInteractions = (currObject: any, triggerName: string) => {
//     const interactionsInfoList = getInteractionsInfo(currObject);
//     if(interactionsInfoList.length === 0) return;
//     const unMatchList = interactionsInfoList.filter(interaction => interaction.trigger !== triggerName);
//     applyInteractions(currObject, unMatchList);
// };
export const removeAllInteractions = (currObject: HTMLElement) => {
    if (!currObject) return;
    $(currObject).removeAttr('interactions-info');
    $(currObject).removeClass('interactions');
};
export const removeTargetId = (
    currObject: HTMLElement | null,
    interactionId: string,
    targetId: string,
) => {
    const interactionsInfoList = getInteractionsInfo(currObject);
    if (interactionsInfoList.length === 0) return;
    const targetInteraction = interactionsInfoList.find(
        interaction => interaction.id === interactionId,
    );
    if (targetInteraction === undefined) return;

    const newTargetIdList = targetInteraction.targetId.filter(
        id => id !== targetId,
    );
    const newTargetInteraction = {
        ...targetInteraction,
        targetId: newTargetIdList,
    };

    const newInteractionsInfoList = interactionsInfoList.map(interaction => {
        if (interaction.id === interactionId) {
            return newTargetInteraction;
        } else {
            return interaction;
        }
    });

    applyInteractions(currObject, newInteractionsInfoList);
};

/* 특정 interactionId 를 제거 */
export const removeInteraction = (
    currObject: HTMLElement,
    interactionId: string,
) => {
    const interactionsInfoList = getInteractionsInfo(currObject);
    if (interactionsInfoList.length === 0) return;
    const newInteractionsInfoList = interactionsInfoList.filter(
        interactionsInfo => interactionsInfo.id !== interactionId,
    );
    applyInteractions(currObject, newInteractionsInfoList);
};
export const removeInteractionFromId = (interactionId: string) => {
    const objectList = workInfo.getObjectList();
    if (objectList.length === 0) return;
    objectList.forEach((obj: any) => {
        removeInteraction(obj, interactionId);
    });
};

export const getInteractionsInfo = (
    currObject: HTMLElement | null,
    bRemove = false,
): IinteractionsInfo[] => {
    if (!currObject) return [];
    const interactionsInfo: IinteractionsInfo[] | null = common.parseJsonData(
        currObject.getAttribute('interactions-info'),
    );
    if (interactionsInfo === null) return [];
    if (bRemove) {
        removeAllInteractions(currObject);
    }
    return interactionsInfo;
};

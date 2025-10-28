import {
    IkeyframeInfo,
    ItransitionInfo,
    IinteractionsInfo,
    IspriteInfo,
    IanimationInfo,
    ETemplateType,
    EobjectType,
} from './types';
let toastTimer: NodeJS.Timeout | null = null;
const toastObjId = 'meeoocat_toast_containter';

export const cancelBubble = (event: any) => {
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
};
export const preventDefault = (event: any) => {
    event.preventDefault();
};
export const allEventCancel = (event: any) => {
    try {
        preventDefault(event);
        cancelBubble(event);
    } catch (e) {
        console.log('allEventCancel Error : ', e);
    }
};

export const parseJsonData = (string: any): any => {
    try {
        if (typeof string === 'string' && string.trim() !== '') {
            return JSON.parse(string.trim());
        } else if (typeof string === 'object') {
            return string;
        }
    } catch (e) {
        console.log('parseJsonData Error : ', e);
    }
    return null;
};
export const sortObjectList = (
    objectList: any[],
    sortKey: string,
    sortType = 'ASC',
    sortCharType: 's' | 'n' = 's',
) => {
    const sortedList = objectList.sort(function (a: any, b: any) {
        let x = a[sortKey];
        let y = b[sortKey];

        if (sortCharType === 'n') {
            x = Number(x);
            y = Number(y);
        }

        if (sortType === 'ASC') {
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
        } else {
            if (x < y) {
                return 1;
            }
            if (x > y) {
                return -1;
            }
        }
        return 0;
    });
    return sortedList;
};
export const getCurrentDateTime = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString();

    let month: number | string = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    let day: number | string = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    let hour: number | string = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    let minites: number | string = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString();

    let seconds: number | string = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    return year + month + day + hour + minites + seconds; // + '00';
};
export const getKeyFrameInfo = (targetObject: HTMLElement): IkeyframeInfo[] => {
    if (!targetObject) return [];
    const orgKeyFrameInfo = parseJsonData(
        targetObject.getAttribute('keyframe-info'),
    );
    if (orgKeyFrameInfo === null) return [];
    removeKeyFrameInfo(targetObject);
    return orgKeyFrameInfo;
};
const removeKeyFrameInfo = (targetObject: HTMLElement) => {
    if (!targetObject) return;
    targetObject.removeAttribute('keyframe-info');
};
export const getInteractionsInfo = (
    currObject: HTMLElement,
    bRemove = false,
): IinteractionsInfo[] => {
    if (!currObject) return [];
    const interactionsInfo = parseJsonData(
        currObject.getAttribute('interactions-info'),
    );
    if (interactionsInfo === null) return [];
    if (bRemove) {
        removeInteractionsInfo(currObject);
    }
    return interactionsInfo;
};
const removeInteractionsInfo = (currObject: HTMLElement) => {
    if (!currObject) return;
    currObject.removeAttribute('interactions-info');
};
export const getTransitionInfo = (
    targetObject: HTMLElement,
): ItransitionInfo[] => {
    if (targetObject === null) return [];
    const transitionInfoList = parseJsonData(
        targetObject.getAttribute('transition-info'),
    );
    if (transitionInfoList === null) return [];
    removeTransitionInfo(targetObject);
    return transitionInfoList;
};
const removeTransitionInfo = (targetObject: HTMLElement) => {
    if (targetObject === null) return;
    targetObject.removeAttribute('transition-info');
};
export const getAnimationInfo = (
    targetObject: HTMLElement,
): IanimationInfo | null => {
    if (!targetObject) return null;
    const animationInfoList = parseJsonData(
        targetObject.getAttribute('animation-info'),
    );
    removeAnimationInfo(targetObject);
    return animationInfoList;
};
const removeAnimationInfo = (targetObject: HTMLElement) => {
    if (!targetObject) return;
    targetObject.removeAttribute('animation-info');
};
export const getSpriteInfo = (
    targetObject: HTMLElement,
): IspriteInfo | null => {
    if (!targetObject) return null;
    const spriteInfo: IspriteInfo | null = parseJsonData(
        targetObject.getAttribute('sprite-info'),
    );
    removeSpriteInfo(targetObject);
    return spriteInfo;
};
const removeSpriteInfo = (targetObject: HTMLElement) => {
    if (!targetObject) return;
    targetObject.removeAttribute('sprite-info');
};
export const convertAnimeEase = (easing = 'linear') => {
    try {
        if (easing === 'linear') return easing;
        if (easing === 'step') return 'steps(1)';
        if (easing.substring(0, 5) === 'inout') {
            return (
                'easeInOut' +
                easing.substring(5, 6).toUpperCase() +
                easing.substring(6)
            );
        } else if (easing.substring(0, 2) === 'in') {
            return (
                'easeIn' +
                easing.substring(2, 3).toUpperCase() +
                easing.substring(3)
            );
        } else if (easing.substring(0, 3) === 'out') {
            return (
                'easeOut' +
                easing.substring(3, 4).toUpperCase() +
                easing.substring(4)
            );
        }
    } catch (e) {
        console.log(e);
    }
    return 'linear';
};
export const showToast = (text: string, sec = 1) => {
    try {
        let toastObj = document.getElementById(toastObjId);
        if (toastObj === null) {
            toastObj = document.createElement('div');
            toastObj.id = toastObjId;
            toastObj.className = 'meeoocat-toast-containter';
            toastObj.innerHTML = '<p>' + text + '</p>';
            document.body.appendChild(toastObj);
            setTimeout(() => {
                if (toastObj !== null) {
                    toastObj.classList.add('show');
                    toastTimer = setTimeout(() => {
                        hideToast();
                    }, sec * 1000 + 300); // 300 은 transition 의 시간
                }
            }, 0);
        } else {
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = null;
            toastObj.innerHTML = '<p>' + text + '</p>';
            // toastObj.style.display = "block";

            toastObj.classList.remove('hide');
            toastObj.classList.add('show');
            toastTimer = setTimeout(() => {
                hideToast();
            }, sec * 1000 + 300); // 300 은 transition 의 시간
        }
    } catch (e) {
        console.log(e);
    }
};
export const hideToast = () => {
    try {
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = null;
        const toastObj = document.getElementById(toastObjId);
        if (toastObj) {
            // toastObj.innerHTML = '';
            // toastObj.style.display = "none";
            // document.body.removeChild(toastObj);
            toastObj.classList.remove('show');
            toastObj.classList.add('hide');
        }
    } catch (e) {
        console.log(e);
    }
};
export const getPreviewContainer = () => {
    return document.getElementById(
        'idx_meeoocat_view_container',
    ) as HTMLDivElement | null;
};
export const getPreviewPageObject = () => {
    const previewContainer = getPreviewContainer();
    if (previewContainer === null) return null;
    return previewContainer.querySelector('div.page') as HTMLDivElement | null;
};

export const checkElementCollision = (
    element: HTMLElement,
    element2: HTMLElement,
) => {
    const rect1 = element.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    // return (
    //     rect1.x < rect2.x + rect2.width &&
    //     rect1.x + rect1.width > rect2.x &&
    //     rect1.y < rect2.y + rect2.height &&
    //     rect1.y + rect1.height > rect2.y
    // );
    // 1/2 로 민감도 조절
    rect1.x = rect1.x + rect1.width / 4;
    rect1.y = rect1.y + rect1.height / 4;
    rect1.width = rect1.width / 2;
    rect1.height = rect1.height / 2;

    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
};
export const getKeyCode = (event: any) => {
    console.log('============ getKeyCode Call ===============');

    if (event) {
        console.log('ctrlKey : ', event.ctrlKey);
        console.log('altKey : ', event.altKey);
        console.log('shiftKey : ', event.shiftKey);
        console.log('metaKey : ', event.metaKey);
    }
    const eventKey = event.key.trim();
    if (
        typeof eventKey !== 'undefined' &&
        eventKey !== null &&
        eventKey !== ''
    ) {
        console.log(
            'event.key:[' + eventKey + '], (type:' + typeof eventKey + ')',
        );
        return eventKey.toLowerCase();
    } else if (typeof event.keyCode !== 'undefined') {
        console.log('event.keyCode:', event.keyCode);
        return String(event.keyCode);
    }
    // console.log("event key none");
    return null;
};
export const replaceDocImagePathAll = (
    docNo: string,
    docContentString: string,
) => {
    const regexAllCase = new RegExp(`docs/${docNo}/`, 'g');
    return docContentString.replace(regexAllCase, '');
};

let loadingTimer: any = null;
export const showLoading = (maxSec = 10, transparent = false) => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = null;

    let loadingDim = document.querySelector('.loading-dim') as HTMLDivElement;
    if (loadingDim === null) {
        loadingDim = document.createElement('div');
        loadingDim.className = 'loading-dim';
        document.body.appendChild(loadingDim);
    }
    if (transparent) {
        loadingDim.className = 'loading-dim trans active';
    } else {
        loadingDim.className = 'loading-dim active';
    }
    // loadingDim.style.display = 'block';

    let loadingObj = document.querySelector('.loading') as HTMLDivElement;
    if (loadingObj === null) {
        loadingObj = document.createElement('div');
        loadingObj.className = 'loading';
        loadingDim.appendChild(loadingObj);
    }

    loadingTimer = setTimeout(() => {
        hideLoading();
    }, maxSec * 1000);
};
export const hideLoading = () => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = null;
    const loadingDim = document.querySelector('.loading-dim') as HTMLDivElement;
    if (loadingDim && loadingDim.classList.contains('active')) {
        loadingDim.classList.remove('active');
        // loadingDim.style.display = '';
        // loadingDim.className = 'loading-dim';
    }
};
export const getResultQPageList = (currObject: any) => {
    if (currObject === null) return [];
    const qPageIdList = parseJsonData(
        currObject.getAttribute('tpl-result-q-page-list') || '[]',
    ) as any[];
    if (qPageIdList.length === 0) return [];

    const qPageList = [];
    const docContentList = window.globalContent.docContentList;
    for (const docContent of docContentList) {
        if (qPageIdList.indexOf(docContent.docPageId) > -1) {
            qPageList.push({
                pageId: docContent.docPageId,
                pageName: docContent.docPageName,
            });
        }
    }
    return qPageList;
};
export const getObjResultFieldList = (currObject: any): string[] => {
    if (currObject === null) return [];
    const fieldList = parseJsonData(
        currObject.getAttribute('tpl-result-field-list') || '[]',
    ) as string[];
    return fieldList;
};
export const getObjResultTplType = (currObject: any) => {
    if (currObject === null) '';
    return (currObject.getAttribute('tpl-result-type') || '') as
        | 'table'
        | 'chart'
        | '';
};
export const getObjCorrectAnswer = (currObject: any) => {
    if (currObject === null) return false;
    const isCorrect = parseJsonData(
        currObject.getAttribute('tpl-correct') || false,
    ) as boolean;
    return isCorrect;
};
export const getTplType = (
    pageObj: HTMLDivElement | null = null,
): ETemplateType => {
    let tplType = ETemplateType.none;
    if (pageObj === null) {
        pageObj = getPreviewPageObject();
    }
    if (pageObj) {
        tplType =
            (pageObj.getAttribute('tpl-type') as ETemplateType) ||
            ETemplateType.none;
    }
    return tplType;
};
export const getObjectType = (currObject: HTMLElement | null): EobjectType => {
    if (currObject === null) {
        return EobjectType.none;
    }
    return (currObject.getAttribute('object-type') ||
        EobjectType.none) as EobjectType;
};
export const getValidUrlLink = (url: string) => {
    if (url === '') return '';
    // 앞에 http://, https:// 가 없으면 붙여준다.
    if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
        url = 'http://' + url;
    }
    const regExp =
        /http(s)?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gi;

    const matchList = url.match(regExp);
    if (matchList && matchList.length > 0) {
        return matchList[0];
    } else {
        return '';
    }
};

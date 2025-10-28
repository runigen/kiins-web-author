import $ from 'jquery';
import { ItimeObj, EuserLang } from '../const/types';
import { timelineMoveMagnetic } from '../const/basicData';
import workInfo from '../store/workInfo';
import docData from '../store/docData';
import { getCanvasObject } from './pages';

import { TLANG, LANG as EN } from '../const/lang/en';
import { LANG as KO } from '../const/lang/ko';

// let squareSeq = 0;
// let imageSeq = 0;
let interactionsSeq = 0;
let objectLastOrderNo = 0;
let actionSeq = 0;
// let audioSeq = 0;
// let pageNameSeq = 0;

export const getLangSet = (lang: EuserLang | null = EuserLang.en) => {
    let langSet: TLANG | null = null;
    switch (lang) {
        case 'ko':
            langSet = KO;
            break;
        case 'en':
            langSet = EN;
            break;
        default:
            langSet = EN;
            break;
    }
    return langSet;
};
export const getEnvLang = (): EuserLang => {
    const lang = window.navigator.language;
    if (lang === 'ko-KR' || lang === 'ko') {
        return EuserLang.ko;
    } else {
        return EuserLang.en;
    }
};

export const getUniqId = (headStr = '') => {
    if (headStr !== '') {
        return headStr + '_' + getUniqCode();
    } else {
        return getUniqCode();
    }
};
export const getUniqCode = () => {
    return (
        new Date().getTime().toString(16) +
        Math.random().toString(16).substr(2, 10)
    );
};
export const getNewPageId = () => {
    return getUniqId('PAGE');
};
export const getNewPageName = () => {
    // pageNameSeq++;
    const nextPageNo = docData.getTotalPage() + 1;
    return 'Page-' + (nextPageNo < 10 ? '0' + nextPageNo : nextPageNo);
};
export const getSquareIdHead = () => {
    return 'SQR';
};
export const getSquareName = () => {
    // squareSeq++;
    // return 'Square-' + (squareSeq < 10 ? '0' + squareSeq : squareSeq);
    const nextObjectNo = getNextObjectNo();
    return 'Square-' + (nextObjectNo < 10 ? '0' + nextObjectNo : nextObjectNo);
};
export const getImageIdHead = () => {
    return 'IMG';
};
export const getAudioIdHead = () => {
    return 'ADO';
};
export const getYoutubeIdHead = () => {
    return 'YTB';
};
export const getYoutubeName = () => {
    const nextObjectNo = getNextObjectNo();
    return (
        'youtube-movie-' +
        (nextObjectNo < 10 ? '0' + nextObjectNo : nextObjectNo)
    );
};
export const getImageName = () => {
    // imageSeq++;
    // return 'Image-' + (imageSeq < 10 ? '0' + imageSeq : imageSeq);
    const nextObjectNo = getNextObjectNo();
    return 'Image-' + (nextObjectNo < 10 ? '0' + nextObjectNo : nextObjectNo);
};
const getNextObjectNo = () => {
    return workInfo.getObjectList().length + 1;
};
export const getAudioName = () => {
    // imageSeq++;
    // return 'Audio-' + (audioSeq < 10 ? '0' + audioSeq : audioSeq);
    const nextObjectNo = getNextObjectNo();
    return 'Audio-' + (nextObjectNo < 10 ? '0' + nextObjectNo : nextObjectNo);
};
export const getInteractionsName = () => {
    interactionsSeq++;
    return (
        'Interaction-' +
        (interactionsSeq < 10 ? '0' + interactionsSeq : interactionsSeq)
    );
};
export const getActionsName = () => {
    actionSeq++;
    return 'Action-' + (actionSeq > 9 ? actionSeq : '0' + actionSeq);
};
export const getFolderIdHead = (): string => {
    return 'FLD';
};
export const getFolderNameHead = (): string => {
    return 'Group';
};
export const getInteractionIdHead = (): string => {
    return 'ITR';
};

export const getNewObjectOrderNo = () => {
    objectLastOrderNo++;
    return objectLastOrderNo;
};
export const setLastObjectOrderNo = (orderNo: number) => {
    objectLastOrderNo = orderNo;
};
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
// export const convertTimeFormat = (msec) => {

//     let msPart = (String)(msec%1000);
//     if(msPart.length == 1) {
//         msPart = msPart + "00";
//     } else if(msPart.length == 2) {
//         msPart = msPart + "0";
//     } else if(msPart.length > 3) {
//         msPart = msPart.substring(0,3);
//     }
//     const numberPart = Math.floor(msec/1000);

//     let secPart = (String)(numberPart%60);
//     if(secPart.length < 2) {
//         secPart = "0" + secPart;
//     }

//     let minPart = (String)(Math.floor(numberPart/60));
//     if(minPart.length < 2) {
//         minPart = "0" + minPart;
//     }

//     return minPart + ":" + secPart + "." + msPart;
// }
export const convertTimeFormat = (left: number) => {
    // console.log(left);

    let timeObj = {
        left: left,
        min: '00',
        sec: '00',
        ms: '000',
    };

    if (left === 0) {
        return timeObj;
    }

    const msec = Math.floor(left * 10);

    let msPart = String(msec % 1000);
    if (msPart.length === 1) {
        msPart = '00' + msPart;
    } else if (msPart.length === 2) {
        msPart = '0' + msPart;
    } else if (msPart.length > 3) {
        msPart = msPart.substring(0, 3);
    }
    const numberPart = Math.floor(msec / 1000);

    let secPart = String(numberPart % 60);
    if (secPart.length < 2) {
        secPart = '0' + secPart;
    }

    let minPart = String(Math.floor(numberPart / 60));
    if (minPart.length < 2) {
        minPart = '0' + minPart;
    }
    // console.log(minPart + ':' + secPart + '.' + msPart);

    // return minPart + ':' + secPart + '.' + msPart;
    timeObj = {
        left: left,
        min: minPart,
        sec: secPart,
        ms: msPart,
    };
    return timeObj;
};

export const convertTimeToTimeLeft = (timeObj: ItimeObj) => {
    const convertRatio = 100;
    let minVal = timeObj.min;
    let secVal = timeObj.sec;
    let msVal = timeObj.ms;

    if (minVal < 0) minVal = 0;
    if (secVal < 0) secVal = 0;
    if (msVal < 0) msVal = 0;

    let timeLeft = minVal * 60 * convertRatio;
    timeLeft += secVal * convertRatio;
    timeLeft += msVal / 10;

    return timeLeft;
};

// export const setPlayTimeView = (timeObj = {min: 0, sec: 0, ms: 0}) => {
//     // $('.timeline-head-buttons div.time-control').text(timeview);
//     // console.log(timeObj);
//     $('#idx_timecontol_min').val(timeObj.min);
//     $('#idx_timecontol_sec').val(timeObj.sec);
//     $('#idx_timecontol_ms').val(timeObj.ms);
// };

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

// sortCharType : s: 문자, n: 숫자
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

export const numSort = (list: any) => {
    return list.sort(function (a: any, b: any) {
        return a - b;
    });
};

export const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const getProgressBarPosition = () => {
    try {
        return parseInt(
            $('#idx_progressline').css('left').replace(/px/, ''),
            10,
        );
    } catch (e) {
        return 0;
    }
};
// hex 예 : #ff64c8
export const hexToRgb = (hex: string): number[] => {
    const red = parseInt(hex[1] + hex[2], 16);
    const green = parseInt(hex[3] + hex[4], 16);
    const blue = parseInt(hex[5] + hex[6], 16);
    return [red, green, blue];
};
export const convToCssRgba = (colorCode: string, opacity = 1): string => {
    if (colorCode[0] === '#') {
        const rgba = hexToRgb(colorCode);
        rgba.push(opacity);
        return 'rgba(' + rgba.join(',') + ')';
    }
    if (colorCode.substr(0, 3).toLocaleLowerCase() === 'rgb') {
        let rgbObj: any[] = [];
        if (colorCode.substr(0, 4).toLocaleLowerCase() === 'rgba') {
            rgbObj = cssRgbToColorArray(colorCode).slice(0, 4);
            rgbObj[3] = opacity;
        } else {
            rgbObj = cssRgbToColorArray(colorCode).slice(0, 3);
            rgbObj.push(opacity);
        }
        return 'rgba(' + rgbObj.join(',') + ')';
    } else {
        return '';
    }
};
export const cssRgbToColorArray = (rgb: string) => {
    //let colors = ["red", "green", "blue", "alpha"];
    const colorArr = rgb
        .slice(rgb.indexOf('(') + 1, rgb.indexOf(')'))
        .split(',');
    const newList: number[] = colorArr.map(color => Number(color.trim()));
    return newList;
};

const colorToHex = (color: number): string => {
    const hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? '0' + hexadecimal : hexadecimal;
};
export const rgbToHex = (red: number, green: number, blue: number): string => {
    return '#' + colorToHex(red) + colorToHex(green) + colorToHex(blue);
};

export const parsePathname = (pathStr: string) => {
    pathStr = pathStr.trim();
    console.log('--------parsePathname------ pathStr : ', pathStr);
    if (
        pathStr === '' ||
        pathStr.substr(0, 1) !== '?' ||
        pathStr.indexOf('=') < 0
    ) {
        return null;
    }
    const newPath = pathStr.replace(/^\?/, '');
    const newPathArray = newPath.split('&');
    const resultObj: any = {};
    for (let i = 0; i < newPathArray.length; i++) {
        const currData = newPathArray[i].split('=');
        resultObj[currData[0]] = currData[1];
    }
    return resultObj;
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
export const getTimeLineMagPixcel = (val: number) => {
    if (!timelineMoveMagnetic) return val;

    const timelineZoom = workInfo.getTimelineZoom();
    console.log('timelineZoom :', timelineZoom);

    let moveUnitPxcel = timelineZoom * 10; // 기본은 0.1초 단위 이동
    if (timelineZoom >= 0.2 && timelineZoom < 0.5) {
        // 0.3~0.5배율 사이는 0.5초 단위 이동
        moveUnitPxcel = timelineZoom * 50;
    } else if (timelineZoom >= 0.1 && timelineZoom < 0.2) {
        // 0.3 배율 미만은 1초 단위 이동
        moveUnitPxcel = timelineZoom * 100;
    }

    moveUnitPxcel = Number((moveUnitPxcel / 10).toFixed(1)) * 10;
    console.log('moveUnitPxcel : ', moveUnitPxcel);

    const magUnit = moveUnitPxcel;

    console.log('magUnit : ', magUnit);
    console.log('val : ', val);

    const restVal = val % magUnit;

    if (restVal < magUnit / 2) {
        val = val - restVal;
    } else {
        val = val + magUnit - restVal;
    }

    console.log('val : ', val);
    return val;
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
export const stringToDateTime = (dateStr: string) => {
    return String(dateStr).replace(
        /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
        '$1-$2-$3 $4:$5:$6',
    );
};

// 숫자나 영문자(대/소)로 시작하는 4~20자 영문자(대/소) 또는 숫자, 점(.), 언더바(_)로 구성
export const checkUserId = (userId: string) => {
    return /^[a-zA-Z0-9]+[a-zA-Z0-9._]{3,19}$/.test(userId);
};
export const getUserIdErrorMsg = () => {
    return '아이디는 알파벳/숫자로 시작해야하며, 4~20자의 알파벳, 숫자, 점(.), 언더바(_)만 사용가능합니다.';
};
// left, right 패널 보이기/감추기 토글
export const togglePannel = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.classList.contains('hide')) {
        if (e.currentTarget.classList.contains('document')) {
            document
                .querySelector('.body-wrapper > .documents')
                ?.classList.remove('hide');
            document.documentElement.style.setProperty(
                '--left-pannel-width',
                '200px',
            );
        } else {
            document
                .querySelector('.body-wrapper > .body > .right')
                ?.classList.remove('hide');
            document.documentElement.style.setProperty(
                '--right-pannel-width',
                '300px',
            );
        }
        e.currentTarget.classList.remove('hide');
    } else {
        if (e.currentTarget.classList.contains('document')) {
            document
                .querySelector('.body-wrapper > .documents')
                ?.classList.add('hide');
            document.documentElement.style.setProperty(
                '--left-pannel-width',
                '0px',
            );
        } else {
            document
                .querySelector('.body-wrapper > .body > .right')
                ?.classList.add('hide');
            document.documentElement.style.setProperty(
                '--right-pannel-width',
                '0px',
            );
        }
        e.currentTarget.classList.add('hide');
    }
};

// export const getAllDocumentEmbedImages = () => {
//     const docContentList = docData.getDocContentsList();
//     const docNo = docData.getDocNo();
//     const pageNo = docData.getCurrPage();

//     const regExp = new RegExp(`docs/${docNo}/res/[0-9]+\.[a-zA-Z]{2,4}`, 'g');
//     const allImageList: string[] = [];

//     const currDocPageContent = getCanvasObject().innerHTML;

//     for (let i = 0, len = docContentList.length; i < len; i++) {
//         // 현재 페이지는 화면의 html을 사용한다. (아직 저장되지 않은 경우 현재 페이지 내용이 누락될 수 있음)
//         const docPageContent =
//             i + 1 === pageNo
//                 ? currDocPageContent
//                 : docContentList[i].docPageContent;
//         const imageList = docPageContent.match(regExp);
//         if (imageList) {
//             allImageList.push(...imageList);
//         }
//     }
//     return [...new Set(allImageList)];
// };
export const getAllDocumentEmbedResouces = () => {
    const docContentList = docData.getDocContentsList();
    // const docNo = docData.getDocNo();
    const pageNo = docData.getCurrPage();

    const regExp = /resource-id="([0-9]+)"/g;
    const allResourceList: string[] = [];

    const currDocPageContent = getCanvasObject().innerHTML;

    // 페이지 번호가 전달된경우 해당 페이지만 검색한다.
    /*
    if(bCurrPage) {
        const imageList = currDocPageContent.match(regExp);
        if (imageList) {
            allImageList.push(...imageList);
        }
        return [...new Set(allImageList)];
    }
    */
    for (let i = 0, len = docContentList.length; i < len; i++) {
        // 현재 페이지는 화면의 html을 사용한다. (아직 저장되지 않은 경우 현재 페이지 내용이 누락될 수 있음)
        const docPageContent =
            i + 1 === pageNo
                ? currDocPageContent
                : docContentList[i].docPageContent;
        const resourceList = docPageContent.match(regExp);
        console.log('resourceList', resourceList);
        if (resourceList && resourceList.length > 0) {
            for (let j = 0, len = resourceList.length; j < len; j++) {
                resourceList[j] = resourceList[j].replace(/[^\d]/g, ''); // 숫자만 추출
                allResourceList.push(resourceList[j]);
            }
            // allResourceList.push(...resourceList);
        }
    }
    return [...new Set(allResourceList)];
};
export const checkOpenedColorPicker = () => {
    const pickerContainer = document.querySelectorAll(
        '.new-color-picker-container.active',
    );
    if (pickerContainer.length === 0) return false;
    return true;
};

export const secondsToTime = (sec: number) => {
    try {
        if (sec === 0) {
            return '--:--:--';
        }

        const h = Math.floor(sec / 3600)
                .toString()
                .padStart(2, '0'),
            m = Math.floor((sec % 3600) / 60)
                .toString()
                .padStart(2, '0');
        // s = Math.floor(sec % 60)
        //     .toString()
        //     .padStart(2, '0');

        // 소수점 아래. 표시
        const s = (sec % 60).toFixed(2).toString().padStart(5, '0');

        return h + ':' + m + ':' + s;
    } catch (e) {
        console.log('secondsToTime error', e);
        return '--:--:--';
    }
};

// 마우스다운 좌표와 마우스무브 좌표를 이용해 각도 계산
export const get_degrees = (
    selectorObj: any,
    mouse_x: number,
    mouse_y: number,
) => {
    if (!selectorObj) return 0;
    // const addVal = 25;

    // const radius	= ($(selectorObj).outerWidth(true) || Number($(selectorObj).css('width'))) / 2 + addVal;
    // const center_x	= selectorObj.getBoundingClientRect().left  + radius + addVal;
    // const center_y	= selectorObj.getBoundingClientRect().top + radius + addVal;

    const centerObj = selectorObj.firstChild as HTMLDivElement;
    console.log('get_degrees : centerObj : ' + centerObj);
    const centerObjRadius =
        $(centerObj).outerWidth(true) ||
        Number($(centerObj).css('width') + 2) / 2; // 도형 중심 표시 작은원의 반지름 (테두리포함)
    //const centerObj = selectorObj.firstChild as HTMLDivElement;
    const center_x = centerObj.getBoundingClientRect().left + centerObjRadius; // 화면 x좌표 0 에서부터 도형 중심까지의 거리 x
    const center_y = centerObj.getBoundingClientRect().top + centerObjRadius; // 화면 Y좌표 0 에서부터 도형 중심까지의 거리 y

    console.log('get_degrees : centerObjRadius : ' + centerObjRadius);

    console.log('get_degrees : mouse_x : ' + mouse_x);
    console.log('get_degrees : mouse_y : ' + mouse_y);

    console.log('get_degrees : center_x : ' + center_x);
    console.log('get_degrees : center_y : ' + center_y);

    const radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
    const degrees = Math.round(radians * (180 / Math.PI) * -1 + 100);
    return degrees;
};

// 각도를 전달받아 45도 단위 근사치 인경우(+=5도) 인경우 45도로 고정
export const getMagneticDegree = (degrees: number) => {
    // 항상 + 값으로 보정
    degrees =
        degrees > 0 ? Math.abs(degrees % 360) : 360 - Math.abs(degrees % 360);

    const checkVal = 45; // 45도단위
    const checkValMagnetic = 5; // (+-)5도내에서
    const checkValRest = Math.abs(degrees % checkVal);
    let addVal = 0;
    if (
        checkValRest >= checkVal - checkValMagnetic &&
        checkValRest < checkVal
    ) {
        addVal = checkVal - checkValRest;
        if (degrees > 0) {
            degrees = degrees + addVal;
        } else {
            degrees = degrees - addVal;
        }
    }
    if (checkValRest > 0 && checkValRest <= checkValMagnetic) {
        // addVal = checkValRest - checkVal;
        if (degrees > 0) {
            degrees = degrees - checkValRest;
        } else {
            degrees = degrees + checkValRest;
        }
    }
    degrees = degrees === 360 ? 0 : degrees;
    return degrees;
};

export const addComma = (num: number) => {
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
};

export const getYoutubeId = (url: string) => {
    if (url === '') return '';

    const matchList = url.match(
        /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/,
    );
    if (matchList && matchList.length > 1) {
        return matchList[1];
    } else {
        return '';
    }
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

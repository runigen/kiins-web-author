import $ from 'jquery';
import * as basicData from '../const/basicData';
import {
    IshapeInfo,
    IstyleInfo,
    IstretchCssInfo,
    IobjectSizeInfo,
    EobjectType,
    EorderObjectListType,
    EundoStackAddType,
    IborderStyleInfo,
    EObjectFolderStatus,
    EObjectFolderView,
    EalignObjectListType,
} from '../const/types';
import {
    unselectSquareObjcts,
    refreshObjectSelector,
} from '../event/SquareEvent';
import * as common from '../util/common';
import workInfo from '../store/workInfo';
import docData from '../store/docData';
import * as pages from '../util/pages';
import * as dostack from '../util/dostack';
import { removeAllInteractions } from '../util/interactions';
import { removeAllKeyframe } from '../util/keyframe';
import { removeAllTransition } from '../util/transition';
import { removeAllAnimation } from '../util/animation';

export const getObject = (objectId: string) => {
    return document.getElementById(objectId) as HTMLElement;
};
export const getObjectName = (currObject: HTMLElement | null): string => {
    if (currObject) {
        return String(currObject.getAttribute('object-name') || '');
    }
    return '';
};
export const setObjectName = (
    currObject: HTMLElement | null,
    objName: string,
) => {
    if (currObject) {
        currObject.setAttribute('object-name', objName);
    }
};
export const getObjectType = (currObject: HTMLElement | null): EobjectType => {
    if (currObject === null) {
        return EobjectType.none;
    }
    return (
        ($(currObject).attr('object-type') as EobjectType) || EobjectType.none
    );
};
export const setObjectShapeInfo = (
    currObject: HTMLElement | null,
    moveInfo: IshapeInfo,
) => {
    if (currObject === null) return;

    //  console.log('setObjectShapeInfo : ' , moveInfo);

    try {
        if (moveInfo.top !== Infinity) $(currObject).css('top', moveInfo.top);

        if (moveInfo.left !== Infinity)
            $(currObject).css('left', moveInfo.left);

        if (moveInfo.width !== Infinity)
            $(currObject).css('width', moveInfo.width);

        if (moveInfo.height !== Infinity)
            $(currObject).css('height', moveInfo.height);

        if (moveInfo.rotate !== Infinity && moveInfo.scale !== Infinity) {
            $(currObject).css(
                'transform',
                'rotate(' +
                    moveInfo.rotate +
                    'deg) scale(' +
                    moveInfo.scale +
                    ')',
            );
        } else if (moveInfo.rotate !== Infinity) {
            // scale 값이 변하지 않는다면 기존 값을 가져온다.(rotate, scale 은 항상 두개 모두 세팅되어야 한다.)
            let objScale = 1;
            if (currObject.style.transform) {
                const scaleMatch =
                    currObject.style.transform.match(/scale\(([\d.]+)\)/);
                if (scaleMatch) {
                    objScale = Number(Number(scaleMatch[1]).toFixed(2));
                }
            }
            $(currObject).css(
                'transform',
                'rotate(' + moveInfo.rotate + 'deg) scale(' + objScale + ')',
            );
        } else if (moveInfo.scale !== Infinity) {
            // rotate 값이 변하지 않는다면 기존 값을 가져온다. (rotate, scale 은 항상 두개 모두 세팅되어야 한다.)
            let objRotate = 0;
            if (currObject.style.transform) {
                const rotateMatch = currObject.style.transform.match(
                    /rotate\(([\d.-]+)deg\)/,
                );
                if (rotateMatch) {
                    objRotate = Number(Number(rotateMatch[1]).toFixed(2));
                }
            }
            $(currObject).css(
                'transform',
                'rotate(' + objRotate + 'deg) scale(' + moveInfo.scale + ')',
            );
        }

        if (moveInfo.opacity !== Infinity)
            $(currObject).css('opacity', moveInfo.opacity);

        // if (moveInfo.borderRadius && moveInfo.borderRadius !== '') {
        //     $(currObject).css('border-radius', moveInfo.borderRadius);
        // }
        $(currObject).css('border-radius', moveInfo.borderRadius || '0');
    } catch (e) {
        console.log('setObjectShapeInfo error : ', e);
    }
};
export const getObjectShapeInfo = (
    currObject: HTMLElement | null,
): IshapeInfo => {
    let shapeInfo: IshapeInfo = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        borderRadius: '',
    };
    if (currObject === null) return shapeInfo;

    const objWidth =
        Math.round(
            parseFloat(currObject.style.width.replace('/px/', '')) * 100,
        ) / 100;
    const objHeight =
        Math.round(
            parseFloat(currObject.style.height.replace('/px/', '')) * 100,
        ) / 100;
    const objTop = parseInt(currObject.style.top, 10);
    const objLeft = parseInt(currObject.style.left, 10);
    const objOpacity = Number(
        currObject.style.opacity === '' ? 1 : currObject.style.opacity,
    );

    let objRotate = 0;
    let objScale = 1;
    if (currObject.style.transform) {
        const rotateMatch = currObject.style.transform.match(
            /rotate\(([\d.-]+)deg\)/,
        );
        if (rotateMatch) {
            objRotate = Number(Number(rotateMatch[1]).toFixed(2));
        }
        const scaleMatch =
            currObject.style.transform.match(/scale\(([\d.]+)\)/);
        if (scaleMatch) {
            objScale = Number(Number(scaleMatch[1]).toFixed(2));
        }
    }
    const objBorderRadius = currObject.style.borderRadius || '';

    // const objRotate = !currObject.style.transform ? 0 : parseInt(currObject.style.transform.replace(/[^0-9.-]/g,''), 10);
    // const objScale = 1
    shapeInfo = {
        width: objWidth,
        height: objHeight,
        top: objTop,
        left: objLeft,
        rotate: objRotate,
        scale: objScale,
        opacity: objOpacity,
        //    borderRadius: objBorderRadius,
    };
    if (objBorderRadius !== '') {
        shapeInfo.borderRadius = objBorderRadius;
    }

    return shapeInfo;
};

export const getObjectStyleInfo = (currObject: HTMLElement) => {
    const currBackColor = $(currObject).css('background-color');
    // const currBorderColor = $(currObject).css('border-color');
    // const currBorderWidth = Number(Number($(currObject).css('border-width').replace(/px/gi,'')).toFixed(0));
    // const currBorderStyle = $(currObject).css('border-style');
    const currBackImage = $(currObject)
        .css('background-image')
        .replace(/^url\(['"](.+)['"]\)/, '$1');
    const currBackImageSize =
        $(currObject).css('background-size') ||
        basicData.defaultBgStretchList.css.bgSize;
    const currBackImageRepeat =
        $(currObject).css('background-repeat') ||
        basicData.defaultBgStretchList.css.bgRepeat;
    const currBackImagePosition =
        $(currObject).css('background-repeat') ||
        basicData.defaultBgStretchList.css.bgPosition;
    const currOpacity = Number(Number($(currObject).css('opacity')).toFixed(2));

    return {
        backgroundColor: currBackColor,
        // borderColor: currBorderColor,
        // borderWidth: currBorderWidth,
        // borderStyle: currBorderStyle,
        backgroundImage: currBackImage,
        backgroundSize: currBackImageSize,
        backgroundRepeat: currBackImageRepeat,
        backgroundPosition: currBackImagePosition,
        opacity: currOpacity,
    };
};
export const setObjectBackColor = (
    currObject: HTMLElement | null,
    color: string,
    bAddUndoStack = true,
) => {
    if (currObject === null) return;
    $(currObject).css('background-color', color);
    // 배경 삭제인경우 배경이미지도 삭제
    if (color === '') {
        $(currObject).css('background', '');
        $(currObject).css('opacity', '');
        $(currObject).removeAttr('resource-id');

        const selectorObj = getObjectSelector(currObject);

        if ($(currObject).hasClass('bg')) {
            $(currObject).removeClass('bg');
            if (selectorObj) {
                $(selectorObj).removeClass('bg');
            }
        }
        if ($(currObject).hasClass('sprite')) {
            $(currObject).removeClass('sprite');
            if (selectorObj) {
                $(selectorObj).removeClass('sprite');
            }
            $(currObject).removeAttr('sprite-info');
        }
    }
    if (bAddUndoStack) {
        // dostack.addUndoStack(currObject.id, EundoStackAddType.style);
        dostack.addUndoStack('', EundoStackAddType.all);
    }
};

export const getObjectBorderStyleinfo = (currObject: HTMLElement) => {
    const currBorderColor = $(currObject).css('border-color');
    const currBorderWidth = Number(
        Number($(currObject).css('border-width').replace(/px/gi, '')).toFixed(
            0,
        ),
    );
    const currBorderStyle = $(currObject).css('border-style');
    const currEdgeRadius = $(currObject).css('border-radius');

    return {
        borderColor: currBorderColor,
        borderWidth: currBorderWidth,
        borderStyle: currBorderStyle,
        edgeRadius: currEdgeRadius,
    };
};

export const setObjectBorderStyleinfo = (
    currObject: HTMLElement,
    borderStyleInfo: IborderStyleInfo | null = null,
) => {
    if (borderStyleInfo === null) return;
    //let borderColor = borderStyleInfo.borderColor;
    //if(borderStyleInfo.borderColor !== '') {
    const borderColor = common.convToCssRgba(
        borderStyleInfo.borderColor,
        borderStyleInfo.borderOpacity,
    );
    //}

    // $(currObject).css('border-color', borderColor);
    // $(currObject).css('border-width', borderStyleInfo.borderWidth);
    // $(currObject).css('border-style', borderStyleInfo.borderStyle);
    const cssStr =
        borderStyleInfo.borderWidth +
        'px ' +
        borderStyleInfo.borderStyle +
        ' ' +
        borderColor;
    $(currObject).css('border', cssStr);
    // dostack.addUndoStack(currObject.id, EundoStackAddType.style);
};

export const setObjectEdgeRadius = (
    currObject: HTMLElement,
    radius: number,
    radiusUnit: string,
) => {
    const radiusStr = radius + radiusUnit;
    $(currObject).css('border-radius', radiusStr);
};

/**
 * currObject 의 스타일정보를 스타일세팅 버튼에 적용
 * @param {*} currObject 
 * @param {*} styleInfo = {
 *      backgroundColor: '',
        borderColor: '',
        borderWidth: '',
        borderStyle: '',
 * }
 */
export const setStyleInfoToButton = (styleInfo: IstyleInfo | null) => {
    if (styleInfo === null) {
        $('#idx_background_color_selector').css('background', '');
        $('#idx_background_color_selector').attr('curr-color', '');

        // $('#idx_border_color_selector').css('background', '');
        // $('#idx_border_color_selector').attr('curr-color', '');
        // $('#idx_border_color_selector').attr('curr-width', 0);
        // $('#idx_border_color_selector').attr('curr-style', 'solid');

        $('#object_opacity').val(100);
        $('#object_opacity_range').val(100);

        // $('#object_bg_stretch').val(basicData.defaultBgStretchList.stretchName);

        return;
    }

    if (styleInfo.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        $('#idx_background_color_selector').css('background', 'unset');
    } else {
        $('#idx_background_color_selector').css('background', '');
        $('#idx_background_color_selector').attr('curr-color', '');
    }

    $('#idx_background_color_selector').css(
        'background-color',
        styleInfo.backgroundColor,
    );
    $('#idx_background_color_selector').attr(
        'curr-color',
        styleInfo.backgroundColor,
    );

    // $('#idx_border_color_selector').attr('curr-color', styleInfo.borderColor);
    // $('#idx_border_color_selector').attr('curr-width', styleInfo.borderWidth);
    // $('#idx_border_color_selector').attr('curr-style', styleInfo.borderStyle);
    // $('#idx_border_color_selector').css('background-color', styleInfo.borderColor);
    const opacityVal = (styleInfo.opacity * 100).toFixed(0);
    $('#object_opacity').val(opacityVal);
    $('#object_opacity_range').val(opacityVal);

    // const currStrechInfo = basicData.bgStretchList.find(item => item.css.bgSize === styleInfo.backgroundSize && item.css.bgRepeat === styleInfo.backgroundRepeat) || null;
    // if(currStrechInfo) {
    //     $('#object_bg_stretch').val(currStrechInfo.stretchName);
    // }
    //$('#object_bg_stretch').val(styleInfo.);
};
export const getStyleInfoFromButton = (): IstyleInfo => {
    const currBackColor = $('#idx_background_color_selector').attr(
        'curr-color',
    );
    // const currBorderColor = $('#idx_border_color_selector').attr('curr-color');
    // const currBorderWidth = $('#idx_border_color_selector').attr('curr-width');
    // const currBorderStyle = $('#idx_border_color_selector').attr('curr-style')
    // const currBorderStyle = 'solid';
    const currOpacity = Number($('#object_opacity').val()) / 100;

    const currStretchName = String($('#object_bg_stretch').val());
    const currStrechInfo =
        basicData.bgStretchList.find(
            item => item.stretchName === currStretchName,
        ) || null;
    let currBgSize = '';
    let currBgRepeat = '';
    if (currStrechInfo) {
        currBgSize = currStrechInfo.css.bgSize;
        currBgRepeat = currStrechInfo.css.bgRepeat;
    }

    return {
        backgroundColor:
            typeof currBackColor !== 'undefined' ? currBackColor : '',
        // borderColor: typeof currBorderColor !== 'undefined' ? currBorderColor : '',
        // borderWidth: typeof currBorderWidth !== 'undefined' && currBorderWidth !== '' ? parseInt(currBorderWidth, 10) : 0,
        // borderStyle: typeof currBorderStyle !== 'undefined' ? currBorderStyle : '',
        backgroundImage: '',
        backgroundSize: currBgSize,
        backgroundRepeat: currBgRepeat,
        opacity: currOpacity,
    };
};
export const setOpacityToObject = (
    currObject: HTMLElement,
    currOpacity: number,
) => {
    $(currObject).css({ opacity: currOpacity });
};
export const setBgStretchInfo = (
    currObject: HTMLElement,
    stretchInfo: IstretchCssInfo,
) => {
    $(currObject).css({
        backgroundSize: stretchInfo.bgSize,
        backgroundRepeat: stretchInfo.bgRepeat,
        backgroundPosition: stretchInfo.bgPosition,
    });
    // dostack.addUndoStack(currObject.id, EundoStackAddType.style);
};
export const setObjectSizeInfo = (
    currObject: HTMLElement,
    sizeInfo: IobjectSizeInfo,
) => {
    $(currObject).css({ width: sizeInfo.width, height: sizeInfo.height });
};
export const setOpacityToObjectBorder = (
    currObject: HTMLElement,
    currOpacity: number,
) => {
    //$(currObject).css({opacity: currOpacity});
    console.log('currOpacity : ', currOpacity);
};
export const orderObject = (
    currObject: HTMLElement | null,
    orderType: EorderObjectListType,
) => {
    if (currObject === null) return;
    const canvasObj = pages.getCanvasObject();
    switch (orderType) {
        case EorderObjectListType.front:
            if (currObject.nextSibling) {
                canvasObj.appendChild(currObject);
            }
            break;
        case EorderObjectListType.forward:
            if (currObject.nextSibling) {
                if (currObject.nextSibling.nextSibling) {
                    canvasObj.insertBefore(
                        currObject,
                        currObject.nextSibling.nextSibling,
                    );
                } else {
                    canvasObj.appendChild(currObject);
                }
            }
            break;
        case EorderObjectListType.back:
            {
                const pageObj = pages.getPageObject();
                if (pageObj.nextSibling) {
                    if (currObject !== pageObj.nextSibling) {
                        canvasObj.insertBefore(currObject, pageObj.nextSibling);
                    }
                }
            }
            break;

        case EorderObjectListType.backward:
            if (
                currObject.previousSibling &&
                (currObject.previousSibling as HTMLElement).className !== 'page'
            ) {
                canvasObj.insertBefore(currObject, currObject.previousSibling);
            }
            break;
    }
};

export const alignSelectedObject = (alignType: EalignObjectListType) => {
    const canvasObj = pages.getCanvasObject();
    const objectGroup = workInfo.getObjectGroup();
    if (objectGroup.length < 1) return;
    console.log('alignObject alignType : ', alignType);

    switch (alignType) {
        case EalignObjectListType.top:
            if (objectGroup.length === 1) {
                const item = objectGroup[0];
                item.style.top = '0px';
                refreshObjectSelector(item);
            } else {
                let top = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        top = item.offsetTop;
                    } else {
                        if (top > item.offsetTop) {
                            top = item.offsetTop;
                        }
                    }
                });
                objectGroup.forEach(item => {
                    item.style.top = top + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.middle:
            if (objectGroup.length === 1) {
                const item = objectGroup[0];
                const topSize =
                    (canvasObj.offsetHeight - item.offsetHeight) / 2;
                item.style.top = topSize + 'px';
                refreshObjectSelector(item);
            } else {
                let middle = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        middle = item.offsetTop + item.offsetHeight / 2;
                    } else {
                        const currMiddle =
                            item.offsetTop + item.offsetHeight / 2;
                        if (middle > currMiddle) {
                            middle = currMiddle;
                        }
                    }
                });
                objectGroup.forEach(item => {
                    item.style.top = middle - item.offsetHeight / 2 + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.bottom:
            if (objectGroup.length === 1) {
                const item = objectGroup[0];
                const topSize = canvasObj.offsetHeight - item.offsetHeight;
                item.style.top = topSize + 'px';
                refreshObjectSelector(item);
            } else {
                let bottom = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        bottom = item.offsetTop + item.offsetHeight;
                    } else {
                        const currBottom = item.offsetTop + item.offsetHeight;
                        if (bottom < currBottom) {
                            bottom = currBottom;
                        }
                    }
                });
                objectGroup.forEach(item => {
                    item.style.top = bottom - item.offsetHeight + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.left:
            if (objectGroup.length === 1) {
                const item = objectGroup[0];
                item.style.left = '0px';
                refreshObjectSelector(item);
            } else {
                let left = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        left = item.offsetLeft;
                    } else {
                        if (left > item.offsetLeft) {
                            left = item.offsetLeft;
                        }
                    }
                });
                objectGroup.forEach(item => {
                    item.style.left = left + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.center:
            if (objectGroup.length === 1) {
                const item = objectGroup[0];
                const leftSize = (canvasObj.offsetWidth - item.offsetWidth) / 2;
                item.style.left = leftSize + 'px';
                refreshObjectSelector(item);
            } else {
                let center = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        center = item.offsetLeft + item.offsetWidth / 2;
                    } else {
                        const currCenter =
                            item.offsetLeft + item.offsetWidth / 2;
                        if (center > currCenter) {
                            center = currCenter;
                        }
                    }
                });
                objectGroup.forEach(item => {
                    item.style.left = center - item.offsetWidth / 2 + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.right:
            if (objectGroup.length === 1) {
                const item = objectGroup[0];
                const leftSize = canvasObj.offsetWidth - item.offsetWidth;
                item.style.left = leftSize + 'px';
                refreshObjectSelector(item);
            } else {
                let right = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        right = item.offsetLeft + item.offsetWidth;
                    } else {
                        const currRight = item.offsetLeft + item.offsetWidth;
                        if (right < currRight) {
                            right = currRight;
                        }
                    }
                });
                objectGroup.forEach(item => {
                    item.style.left = right - item.offsetWidth + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.vsplit:
            // vertical same space split
            {
                let vSplitLeft = 0;
                let vSplitRight = 0;
                let vSplitWidth = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        vSplitLeft = item.offsetLeft;
                        vSplitRight = item.offsetLeft + item.offsetWidth;
                        vSplitWidth = item.offsetWidth;
                    } else {
                        if (vSplitLeft > item.offsetLeft) {
                            vSplitLeft = item.offsetLeft;
                        }
                        if (vSplitRight < item.offsetLeft + item.offsetWidth) {
                            vSplitRight = item.offsetLeft + item.offsetWidth;
                        }
                        if (vSplitWidth < item.offsetWidth) {
                            vSplitWidth = item.offsetWidth;
                        }
                    }
                    item.leftPos = Number(item.offsetLeft);
                });
                const vSplitSpace =
                    (vSplitRight - vSplitLeft - vSplitWidth) /
                    (objectGroup.length - 1);
                // objectGroup.forEach((item, index) => {
                //     item.style.left = vSplitLeft + vSplitSpace * index + 'px';
                //     refreshObjectSelector(item);
                // });
                // 오브젝트가 왼쪽에서 오른쪽으로 정렬되도록 (objectGroup은 순서가 선택된 순서이므로 정렬 필요) : 위에서 leftPos를 추가로 저장해둠
                const orderedObjectGroup = objectGroup.sort((a, b) => {
                    return a.leftPos - b.leftPos;
                });
                orderedObjectGroup.forEach((item, index) => {
                    item.style.left = vSplitLeft + vSplitSpace * index + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;

        case EalignObjectListType.hsplit:
            // horizontal same space split
            {
                let hSplitTop = 0;
                let hSplitBottom = 0;
                let hSplitHeight = 0;
                objectGroup.forEach((item, index) => {
                    if (index === 0) {
                        hSplitTop = item.offsetTop;
                        hSplitBottom = item.offsetTop + item.offsetHeight;
                        hSplitHeight = item.offsetHeight;
                    } else {
                        if (hSplitTop > item.offsetTop) {
                            hSplitTop = item.offsetTop;
                        }
                        if (hSplitBottom < item.offsetTop + item.offsetHeight) {
                            hSplitBottom = item.offsetTop + item.offsetHeight;
                        }
                        if (hSplitHeight < item.offsetHeight) {
                            hSplitHeight = item.offsetHeight;
                        }
                    }
                    item.topPos = Number(item.offsetTop);
                });
                const hSplitSpace =
                    (hSplitBottom - hSplitTop - hSplitHeight) /
                    (objectGroup.length - 1);
                // objectGroup.forEach((item, index) => {
                //     item.style.top = hSplitTop + hSplitSpace * index + 'px';
                //     refreshObjectSelector(item);
                // });
                // 오브젝트가 위에서 아래로 정렬되도록 (objectGroup은 순서가 선택된 순서이므로 정렬 필요) : 위에서 topPos를 추가로 저장해둠
                const orderedObjectGroup2 = objectGroup.sort((a, b) => {
                    return a.topPos - b.topPos;
                });
                orderedObjectGroup2.forEach((item, index) => {
                    item.style.top = hSplitTop + hSplitSpace * index + 'px';
                    refreshObjectSelector(item);
                });
            }
            break;
    }
};

export const getObjectSelector = (currObject: HTMLElement | null) => {
    if (currObject) {
        return document.getElementById('SEL_' + currObject.id);
    } else {
        return null;
    }
};

export const isLocked = (objectId: string) => {
    const targetObject = document.getElementById(objectId) as HTMLElement;
    if ($(targetObject).hasClass('lock')) {
        console.log('isLocked : objectId -> locked');
        // dialog.showToastMessage('locked!',1);
        return true;
    } else {
        console.log('isLocked : objectId -> unlocked');
        return false;
    }
};
export const lockObject = (objectId: string, bLock = true) => {
    const targetObject = document.getElementById(
        objectId,
    ) as HTMLElement | null;
    if (targetObject === null) return;

    // 1. 선택한 오브젝트 lock 처리
    if (bLock) {
        $(targetObject).addClass('lock');
    } else {
        $(targetObject).removeClass('lock');
    }

    // 2. 그룹처리 : 대상이 폴더인경우 하위 객체들을 모두 lock 처리
    const targetObjectType = getObjectType(targetObject);
    if (targetObjectType === EobjectType.folder) {
        const subObjectFolderInfo =
            getObjectFolderInfo(targetObject) + '/' + objectId;
        const currObjectList = workInfo.getObjectList();
        currObjectList.forEach(obj => {
            const objFolderInfo = getObjectFolderInfo(obj);
            if (objFolderInfo) {
                if (objFolderInfo.indexOf(subObjectFolderInfo) === 0) {
                    if (bLock) {
                        $(obj).addClass('lock');
                    } else {
                        $(obj).removeClass('lock');
                    }
                }
            }
        });
    }
};
export const hideObject = (objectId: string, bHide = true) => {
    const targetObject = document.getElementById(
        objectId,
    ) as HTMLElement | null;
    if (targetObject === null) return;

    // 1. 선택한 오브젝트 hide 처리
    if (bHide) {
        $(targetObject).addClass('hide');
    } else {
        $(targetObject).removeClass('hide');
    }

    // 2. 그룹처리 : 대상이 폴더인경우 하위 객체들을 모두 hide 처리
    const targetObjectType = getObjectType(targetObject);
    if (targetObjectType === EobjectType.folder) {
        const subObjectFolderInfo =
            getObjectFolderInfo(targetObject) + '/' + objectId;
        const currObjectList = workInfo.getObjectList();
        currObjectList.forEach(obj => {
            const objFolderInfo = getObjectFolderInfo(obj);
            if (objFolderInfo) {
                if (objFolderInfo.indexOf(subObjectFolderInfo) === 0) {
                    if (bHide) {
                        $(obj).addClass('hide');
                    } else {
                        $(obj).removeClass('hide');
                    }
                }
            }
        });
    }
};
export const isHide = (objectId: string) => {
    const targetObject = document.getElementById(objectId) as HTMLElement;
    if ($(targetObject).hasClass('hide')) {
        return true;
    } else {
        return false;
    }
};

export const getObjectOrderNo = (currObject: any) => {
    if (currObject) {
        return Number(currObject.getAttribute('orderno')) || 0;
    } else {
        return 0;
    }
};
export const setObjectOrderNo = (currObject: any, orderNo: number | null) => {
    if (currObject === null) return;
    if (orderNo) {
        currObject.setAttribute('orderno', orderNo);
        currObject.orderNo = orderNo;
    } else {
        currObject.removeAttribute('orderno');
        currObject.orderNo = 0;
    }
};
export const updateObjectOrder = () => {
    const currObjectList = workInfo.getObjectList();
    const newSortObjectList = common.sortObjectList(
        currObjectList,
        'orderNo',
        'ASC',
        'n',
    );
    // orderNo 자연수로 다시 설정
    newSortObjectList.map((obj: any, index: number) => {
        obj.orderNo = index + 1;
        $(obj).attr('orderno', index + 1);
    });
    workInfo.setObjectList(newSortObjectList);
};

export const createNewObject = (objectType: EobjectType, objectName = '') => {
    let newObject: any = null;
    if (objectType === EobjectType.folder) {
        newObject = createFolderObject();
    } else if (objectType === EobjectType.square) {
        newObject = createSquareObject(objectName);
    } else if (objectType === EobjectType.image) {
        newObject = createImageObject();
    } else if (objectType === EobjectType.audio) {
        newObject = createAudioObject();
    } else if (objectType === EobjectType.youtube) {
        newObject = createYoutubeObject();
    }
    workInfo.addObjectList(newObject);
    return newObject;
};
const createYoutubeObject = () => {
    const youtubeObject: any = document.createElement('div');
    const newOrderNo = common.getNewObjectOrderNo();

    youtubeObject.className = 'object youtube';
    youtubeObject.id = common.getUniqId(common.getYoutubeIdHead());
    youtubeObject.style.width = '400px';
    youtubeObject.style.height = '300px';
    youtubeObject.setAttribute('object-type', EobjectType.youtube);
    youtubeObject.setAttribute('object-name', common.getYoutubeName());
    youtubeObject.setAttribute('resource-id', '');
    youtubeObject.setAttribute('resource-url', '');

    youtubeObject.setAttribute('orderno', newOrderNo);
    youtubeObject.setAttribute('folderinfo', '');
    youtubeObject.setAttribute('folderstatus', EObjectFolderStatus.none);
    youtubeObject.setAttribute('folderview', EObjectFolderView.show);
    youtubeObject.orderNo = newOrderNo;

    const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    canvasObj.appendChild(youtubeObject);
    return youtubeObject;
};
const createAudioObject = () => {
    const audioObject: any = document.createElement('div');
    const newOrderNo = common.getNewObjectOrderNo();

    audioObject.className = 'object audio';
    audioObject.id = common.getUniqId(common.getAudioIdHead());
    audioObject.setAttribute('object-type', EobjectType.audio);
    audioObject.setAttribute('orderno', newOrderNo);
    audioObject.setAttribute('folderinfo', '');
    audioObject.setAttribute('folderstatus', EObjectFolderStatus.none);
    audioObject.setAttribute('folderview', EObjectFolderView.show);
    // imageObject.setAttribute('folderview2', EObjectFolderView.show);
    // imageObject.setAttribute('folderview3', EObjectFolderView.show);
    audioObject.orderNo = newOrderNo;

    const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    canvasObj.appendChild(audioObject);
    return audioObject;
};
const createImageObject = () => {
    const imageObject: any = document.createElement('img');
    const newOrderNo = common.getNewObjectOrderNo();

    imageObject.className = 'object image';
    imageObject.id = common.getUniqId(common.getImageIdHead());
    imageObject.setAttribute('object-type', EobjectType.image);
    imageObject.setAttribute('orderno', newOrderNo);
    imageObject.setAttribute('folderinfo', '');
    imageObject.setAttribute('folderstatus', EObjectFolderStatus.none);
    imageObject.setAttribute('folderview', EObjectFolderView.show);
    // imageObject.setAttribute('folderview2', EObjectFolderView.show);
    // imageObject.setAttribute('folderview3', EObjectFolderView.show);
    imageObject.orderNo = newOrderNo;

    const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    canvasObj.appendChild(imageObject);
    return imageObject;
};
const createSquareObject = (objectName = '') => {
    const squareObject: any = document.createElement('div');
    const newOrderNo = common.getNewObjectOrderNo();
    squareObject.className = 'object square';
    squareObject.id = common.getUniqId(common.getSquareIdHead());
    if (objectName === '') {
        squareObject.setAttribute('object-name', common.getSquareName());
    } else {
        squareObject.setAttribute('object-name', objectName);
    }
    squareObject.setAttribute('object-type', EobjectType.square);
    squareObject.setAttribute('orderno', newOrderNo);
    squareObject.setAttribute('folderinfo', '');
    squareObject.setAttribute('folderstatus', EObjectFolderStatus.none);
    squareObject.setAttribute('folderview', EObjectFolderView.show);
    // squareObject.setAttribute('folderview2', EObjectFolderView.show);
    // squareObject.setAttribute('folderview3', EObjectFolderView.show);
    squareObject.orderNo = newOrderNo;

    const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    canvasObj.appendChild(squareObject);
    return squareObject;
};
const createFolderObject = () => {
    const newFolderItem: any = document.createElement('div');
    const uniqKey = common.getUniqId();
    newFolderItem.id = common.getFolderIdHead() + '_' + uniqKey;
    newFolderItem.className = 'object folder';
    newFolderItem.setAttribute(
        'object-name',
        common.getFolderNameHead() +
            '_' +
            uniqKey.substr(uniqKey.length - 10, 10),
    );
    newFolderItem.setAttribute('object-type', EobjectType.folder);
    newFolderItem.setAttribute('orderno', 0);
    newFolderItem.setAttribute('folderinfo', '');
    newFolderItem.setAttribute('folderstatus', EObjectFolderStatus.expand);
    newFolderItem.setAttribute('folderview', EObjectFolderView.show);
    // newFolderItem.setAttribute('folderview2', EObjectFolderView.show);
    // newFolderItem.setAttribute('folderview3', EObjectFolderView.show);
    newFolderItem.orderNo = 0;

    const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    canvasObj.appendChild(newFolderItem);

    return newFolderItem;
};

// export const createCopyObject = (currObject: any) => {
//     if (currObject) {
//         const selObjectHtml = currObject.outerHTML;
//         const newObjectContainer = document.createElement('div');
//         newObjectContainer.innerHTML = selObjectHtml;

//         const newObject: any = newObjectContainer.firstChild;
//         if (newObject === null) return null;

//         const orgIdList = currObject.id.split('_');
//         const newObjectId = orgIdList[0] + '_' + common.getUniqId();
//         const objectType = currObject.getAttribute('object-type') || '';
//         const objectOrderNo = Number(currObject.getAttribute('orderno') || 0);
//         const newOrderNo = common.getNewObjectOrderNo();

//         let newObjectName = common.getSquareName();
//         if (objectType === EobjectType.image) {
//             newObjectName = common.getImageName();
//         }

//         newObject.setAttribute('id', newObjectId);
//         newObject.setAttribute('object-name', newObjectName);
//         newObject.setAttribute('orderno', objectOrderNo + 0.01);

//         // 애니메이션 속성 모두 제거
//         removeAllKeyframe(newObject);
//         removeAllInteractions(newObject);
//         removeAllTransition(newObject);
//         removeAllAnimation(newObject);

//         const canvasObj = pages.getCanvasObject() as HTMLDivElement;
//         canvasObj.appendChild(newObject);

//         // deviateObjectPosition(newObject)
//         $(newObject).css({
//             left: '+=20',
//             top: '+=20',
//         });

//         return newObject;
//     } else {
//         return null;
//     }
// };

export const createCopyObject = (objectContent: string, bSamePage = true) => {
    if (objectContent) {
        const selObjectHtml = objectContent;
        const newObjectContainer = document.createElement('div');
        newObjectContainer.innerHTML = selObjectHtml;

        const newObject: any = newObjectContainer.firstChild;
        if (newObject === null) return null;

        // const orgIdList = newObject.id.split('_');
        // const newObjectId = orgIdList[0] + '_' + common.getUniqId();
        const orgId = newObject.id;
        const orgIdHead = orgId.split('_')[0];
        const newObjectId = orgIdHead + '_' + common.getUniqId();
        // const objectType = newObject.getAttribute('object-type') || '';
        const objectOrderNo = Number(newObject.getAttribute('orderno') || 0);
        // const newOrderNo = common.getNewObjectOrderNo();

        // 하위에 checkbox 가 있으면 checkbox, label 의 id 를 변경한다.
        const checkboxObj = newObject.querySelector('input[type=checkbox]');
        if (checkboxObj) {
            checkboxObj.id = checkboxObj.id.replace(orgId, newObjectId);
            const labelObj = newObject.querySelector('label');
            if (labelObj) {
                labelObj.setAttribute('for', checkboxObj.id);
            }
        }

        // let newObjectName = common.getSquareName();
        // if (objectType === EobjectType.image) {
        //     newObjectName = common.getImageName();
        // } else if (objectType === EobjectType.audio) {
        //     newObjectName = common.getAudioName();
        // }
        const newObjectName = newObject.getAttribute('object-name') + '-1';

        newObject.setAttribute('id', newObjectId);
        newObject.setAttribute('object-name', newObjectName);
        newObject.setAttribute('orderno', objectOrderNo + 0.01);

        // 애니메이션 속성 모두 제거
        removeAllKeyframe(newObject);
        removeAllInteractions(newObject);
        removeAllTransition(newObject);
        removeAllAnimation(newObject);

        const canvasObj = pages.getCanvasObject() as HTMLDivElement;
        canvasObj.appendChild(newObject);

        // deviateObjectPosition(newObject)
        // 같은 페이지에 붙여넣는경우 위치를 옮겨준다.
        if (bSamePage) {
            $(newObject).css({
                left: '+=10',
                top: '+=10',
            });
        }

        workInfo.addObjectList(newObject);

        return newObject;
    } else {
        return null;
    }
};

export const setObjectFolderInfo = (
    currObject: any,
    objectFolderInfo: string | null,
) => {
    if (currObject === null) return;
    if (objectFolderInfo) {
        currObject.setAttribute('folderinfo', objectFolderInfo);
    } else {
        currObject.removeAttribute('folderinfo');
    }
};
export const getObjectFolderInfo = (currObject: any): string => {
    if (currObject) {
        return currObject.getAttribute('folderinfo') || '';
    } else {
        return '';
    }
};
export const setObjectFolderStatus = (
    currObject: any,
    folderStatus: EObjectFolderStatus | null,
) => {
    if (currObject === null) return;
    if (folderStatus) {
        currObject.setAttribute('folderstatus', folderStatus);
    } else {
        currObject.removeAttribute('folderstatus');
    }
};
export const getObjectFolderStatus = (
    currObject: any,
): EObjectFolderStatus | null => {
    if (currObject) {
        return (
            (currObject.getAttribute('folderstatus') as EObjectFolderStatus) ||
            EObjectFolderStatus.expand
        );
    } else {
        return null;
    }
};
export const setObjectFolderView = (
    currObject: any,
    folderView: EObjectFolderView | null,
) => {
    if (currObject === null) return;
    if (folderView) {
        currObject.setAttribute('folderview', folderView);
    } else {
        currObject.removeAttribute('folderview');
    }
};
export const getObjectFolderView = (currObject: any): EObjectFolderView => {
    if (currObject) {
        return (
            (currObject.getAttribute('folderview') as EObjectFolderView) ||
            EObjectFolderView.show
        );
    } else {
        return EObjectFolderView.show;
    }
};
// export const setObjectFolderView2 = (currObject: any, folderView: EObjectFolderView | null) => {
//     if(currObject === null)  return;
//     if(folderView) {
//         currObject.setAttribute('folderview2', folderView);
//     } else {
//         currObject.removeAttribute('folderview2');
//     }
// };
// export const getObjectFolderView2 = (currObject: any): string | null => {
//     if(currObject) {
//         return currObject.getAttribute('folderview2') || EObjectFolderView.show;
//     } else {
//         return null;
//     }
// };
// export const setObjectFolderView3 = (currObject: any, folderView: EObjectFolderView | null) => {
//     if(currObject === null)  return;
//     if(folderView) {
//         currObject.setAttribute('folderview3', folderView);
//     } else {
//         currObject.removeAttribute('folderview3');
//     }
// };
// export const getObjectFolderView3 = (currObject: any): string | null => {
//     if(currObject) {
//         return currObject.getAttribute('folderview3') || EObjectFolderView.show;
//     } else {
//         return null;
//     }
// };

export const getObjectSubList = (currObjectFolder: any): any[] => {
    if (currObjectFolder.type !== EobjectType.folder) return [];

    const subFolderInfo =
        currObjectFolder.folderInfo + '/' + currObjectFolder.id;
    const currObjectList = workInfo.getObjectList();
    const subList: any[] = currObjectList.filter(
        obj => obj.folderInfo && obj.folderInfo.indexOf(subFolderInfo) === 0,
    );
    const sortList = common.sortObjectList(subList, 'orderNo', 'ASC', 'n');
    return sortList;
};

// 선택되어 있는 오브젝트 삭제 (폴더인경우 subRemove 값 설정)
// subRemove : true - sub 오브젝트 삭제
// subRemove : false - sub 오브젝트 삭제 안함
export const removeSelectdObject = (subRemove = false) => {
    const currObjectGroup = workInfo.getObjectGroup();
    if (currObjectGroup.length === 0) return;

    for (const obj of currObjectGroup) {
        if (obj.type === EobjectType.folder) {
            const folderInfo = '/' + obj.id;
            const subList = getObjectSubList(obj);
            for (const subObj of subList) {
                if (!subObj) continue;

                // 하위 모두 제거
                if (subRemove) {
                    $(subObj).remove();
                    workInfo.removeObjectList(subObj);

                    // 하위는 삭제하지 않고, 폴더정보만 업데이트(현재폴더보다 상위로)
                } else {
                    const subFolderInfo = getObjectFolderInfo(subObj);
                    const newFolderInfo = subFolderInfo.replace(folderInfo, '');
                    setObjectFolderInfo(subObj, newFolderInfo);
                }
            }
        }

        $(obj).remove();
        workInfo.removeObjectList(obj);
    }

    unselectSquareObjcts();
};

// 현재 선택된 오브젝트 중 폴더가 있는지 확인
export const checkFolderObjectSelected = (): boolean => {
    const currObjectGroup = workInfo.getObjectGroup();
    if (currObjectGroup.length === 0) return false;
    for (const obj of currObjectGroup) {
        if (obj.type === EobjectType.folder) {
            return true;
        }
    }
    return false;
};

export const addInputBoxObject = (currObject: any, placeholderText = '') => {
    const inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('class', 'input-box');
    // inputBox.setAttribute('disabled', 'true');
    inputBox.setAttribute('readonly', 'true');
    if (placeholderText !== '') {
        inputBox.setAttribute('placeholder', placeholderText);
    }
    currObject.innerHTML = '';
    currObject.appendChild(inputBox);
    currObject.classList.add('input-box');
};
export const removeInputBoxObject = (currObject: any) => {
    currObject.innerHTML = '';
    currObject.classList.remove('input-box');
    currObject.classList.remove('input-box');
    currObject.removeAttribute('valid');
    currObject.removeAttribute('valid-check');
};
export const addCheckBoxObject = (currObject: any) => {
    const checkBoxId = 'check_box_' + currObject.id;

    const inputBox = document.createElement('input');
    inputBox.id = checkBoxId;
    inputBox.setAttribute('type', 'checkbox');
    inputBox.setAttribute('class', 'check-box');
    // inputBox.setAttribute('disabled', 'true');
    inputBox.setAttribute('readonly', 'true');
    currObject.innerHTML = '';
    currObject.appendChild(inputBox);

    const labelObj = document.createElement('label');
    labelObj.setAttribute('class', 'check-box');
    labelObj.setAttribute('for', checkBoxId);
    currObject.appendChild(labelObj);

    currObject.classList.add('check-box');
};
export const removeCheckBoxObject = (currObject: any) => {
    currObject.innerHTML = '';
    currObject.classList.remove('check-box');
};
export const getResultQPageList = (currObject: any) => {
    if (currObject === null) return [];
    const qPageIdList = common.parseJsonData(
        currObject.getAttribute('tpl-result-q-page-list') || '[]',
    ) as any[];
    if (qPageIdList.length === 0) return [];

    const qPageList = [];
    const docContentList = docData.getDocContentsList();
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
export const setResultQPageList = (currObject: any, list: any[]) => {
    if (currObject === null) return;
    if (list.length > 0) {
        currObject.setAttribute('tpl-result-q-page-list', JSON.stringify(list));
    } else {
        currObject.removeAttribute('tpl-result-q-page-list');
    }
};
export const getObjResultFieldList = (currObject: any): string[] => {
    if (currObject === null) return [];
    const fieldList = common.parseJsonData(
        currObject.getAttribute('tpl-result-field-list') || '[]',
    ) as string[];
    return fieldList;
};
export const setObjResultFieldList = (currObject: any, list: string[]) => {
    if (currObject === null) return;
    if (list.length > 0) {
        currObject.setAttribute('tpl-result-field-list', JSON.stringify(list));
    } else {
        currObject.removeAttribute('tpl-result-field-list');
    }
};
export const setResultTableFlag = (currObject: any, flag: boolean) => {
    if (currObject === null) return;
    if (flag) {
        currObject.classList.add('result-table');
        currObject.classList.remove('result-chart');
    } else {
        currObject.classList.remove('result-table');
        currObject.classList.remove('result-chart');
    }
};
export const setResultChartFlag = (currObject: any, flag: boolean) => {
    if (currObject === null) return;
    if (flag) {
        currObject.classList.add('result-chart');
        currObject.classList.remove('result-table');
    } else {
        currObject.classList.remove('result-table');
        currObject.classList.remove('result-chart');
    }
};
export const getObjResultTplType = (currObject: any) => {
    if (currObject === null) '';
    return (currObject.getAttribute('tpl-result-type') || '') as
        | 'table'
        | 'chart'
        | '';
};
export const setObjResultTplType = (currObject: any, type: string) => {
    if (currObject === null) return;
    if (type === '') {
        currObject.removeAttribute('tpl-result-type');
        return;
    }
    currObject.setAttribute('tpl-result-type', type);
};
export const getObjCorrectAnswer = (currObject: any) => {
    if (currObject === null) return false;
    const isCorrect = common.parseJsonData(
        currObject.getAttribute('tpl-correct') || false,
    ) as boolean;
    return isCorrect;
};
export const setYoutubeUrl = (targetObject: any, url: string) => {
    const youtubeId = common.getYoutubeId(url);
    console.log('youtubeId', youtubeId);

    targetObject.setAttribute('resource-url', youtubeId !== '' ? url : '');
    targetObject.setAttribute('resource-id', youtubeId);

    if (youtubeId !== '') {
        const youtubeIframe = document.createElement('iframe');
        // youtubeIframe.setAttribute(
        //     'src',
        //     `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&t=100`,
        // );
        youtubeIframe.setAttribute(
            'src',
            `https://www.youtube.com/embed/${youtubeId}?rel=0`,
        );
        youtubeIframe.setAttribute('width', '100%');
        youtubeIframe.setAttribute('height', '100%');
        youtubeIframe.setAttribute('frameborder', '0');
        youtubeIframe.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        );
        youtubeIframe.setAttribute('allowfullscreen', 'true');
        targetObject.innerHTML = '';
        targetObject.appendChild(youtubeIframe);
        return true;
    } else {
        targetObject.innerHTML = '';
        return false;
    }
};

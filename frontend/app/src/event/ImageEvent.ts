import $ from 'jquery';
// import keyName, { getKeyCode } from './KeyEvent';
import * as KeyEvent from './KeyEvent';
import * as CommonEvent from './CommonEvent';
import workInfo from '../store/workInfo';
import { showToastMessage } from '../util/dialog';
import * as common from '../util/common';
import {
    EobjectType,
    EundoStackAddType,
    IfileInfo,
    IimageSizeInfo,
} from '../const/types';
import { defaultBgStretchList } from '../const/basicData';
import * as pages from '../util/pages';
import * as dostack from '../util/dostack';
import * as objects from '../util/objects';
import docData from '../store/docData';
/**
 * 
 * @param {*} imageInfo = {
        ext: "png"
        filename: "resize-99-834088.png"
        mimetype: "image/png"
        name: "resize-99-834088"
        url: "http://localhost:8088/attach_images/resize-99-834088.png"
    }
 */
export const addImageObject = async (
    imageInfo: IfileInfo,
    order: number = 0,
    event: React.DragEvent,
) => {
    console.log('imageInfo : ', imageInfo);

    const sizeInfo: any = await getOrgImageSize(imageInfo.url).catch(e => {
        console.log(e);
        return;
    });
    console.log(sizeInfo);

    // const mouseX = event.clientX || 0;
    // const mouseY = event.clientY || 0;
    // console.log('mouseX : ', mouseX);
    // console.log('mouseY : ', mouseY);

    // const canvasLeft = pages.getCanvasObject().getBoundingClientRect().left;
    // const canvasTop = pages.getCanvasObject().getBoundingClientRect().top;
    // console.log('canvasLeft : ', canvasLeft);
    // console.log('canvasTop : ', canvasTop);

    // // const scrollLeft = getWorkspace().scrollLeft;
    // // const scrollTop = getWorkspace().scrollTop;

    // const filePosition = {
    //     left: mouseX - canvasLeft,
    //     top: mouseY - canvasTop,
    // };

    // const imageObject: any = document.createElement("img");
    // imageObject.className = 'object image';
    // imageObject.id = common.getUniqId(common.getImageIdHead());
    // $(imageObject).attr('object-type', 'image');
    const imageObject = objects.createNewObject(EobjectType.image);
    imageObject.src = imageInfo.url;
    $(imageObject).attr('resource-id', imageInfo.fileId);
    $(imageObject).attr('object-name', imageInfo.orgFileName);
    $(imageObject).css('width', sizeInfo.width);
    $(imageObject).css('height', sizeInfo.height);

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    console.log('mouseX : ', mouseX);
    console.log('mouseY : ', mouseY);

    if (mouseX === undefined || mouseY === undefined) {
        $(imageObject).css({
            left: order * 10,
            top: order * 10,
            opacity: 1,
        });
    } else {
        const canvasLeft = pages.getCanvasObject().getBoundingClientRect().left;
        const canvasTop = pages.getCanvasObject().getBoundingClientRect().top;
        console.log('canvasLeft : ', canvasLeft);
        console.log('canvasTop : ', canvasTop);

        // const scrollLeft = getWorkspace().scrollLeft;
        // const scrollTop = getWorkspace().scrollTop;

        const filePosition = {
            left: mouseX - canvasLeft,
            top: mouseY - canvasTop,
        };
        $(imageObject).css({
            left: filePosition.left - sizeInfo.width / 2,
            top: filePosition.top - sizeInfo.height / 2,
            opacity: 1,
        });
    }
    // const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    // canvasObj.appendChild(imageObject);
    workInfo.addObjectList(imageObject);
    dostack.addUndoStack('', EundoStackAddType.all);
};
export const changeObjectImage = (currObject: any, imageInfo: IfileInfo) => {
    if (!currObject) return;

    console.log('imageInfo : ', imageInfo);
    const objectType = ($(currObject).attr('object-type') || '') as EobjectType;

    $(currObject).attr('resource-id', imageInfo.fileId);

    // 객체가 이미지인경우
    if (objectType === EobjectType.image) {
        currObject.src = imageInfo.url;
        $(currObject).attr('object-name', imageInfo.orgFileName);
        // $(currObject).attr('object-type', EobjectType.image);
        workInfo.setUpdateKey();

        // 객체가 박스인경우
    } else if (objectType === EobjectType.square) {
        if (!$(currObject).hasClass('bg')) {
            $(currObject).addClass('bg');
        }
        $(currObject).css('background-image', `url(${imageInfo.url})`);
        $(currObject).css('background-size', defaultBgStretchList.css.bgSize);
        $(currObject).css(
            'background-repeat',
            defaultBgStretchList.css.bgRepeat,
        );
        $(currObject).css(
            'background-position',
            defaultBgStretchList.css.bgPosition,
        );

        // $(currObject).css('background-color', '');
        workInfo.setUpdateKey();

        // 객체가 오디오경우
    } else if (objectType === EobjectType.audio) {
        $(currObject).attr('resource-url', imageInfo.url);
        $(currObject).attr('resource-type', imageInfo.mimeType);
        $(currObject).attr('object-name', imageInfo.orgFileName);
        workInfo.setUpdateKey();
    }

    // dostack.addUndoStack(currObject.id, EundoStackAddType.style);
    dostack.addUndoStack('', EundoStackAddType.all);
};
export const changePageImage = (imageInfo: IfileInfo) => {
    console.log('changePageImage imageInfo : ', imageInfo);

    const pageObj = pages.getPageObject();
    if (pageObj) {
        $(pageObj).attr('resource-id', imageInfo.fileId);
        $(pageObj).css('background-image', `url(${imageInfo.url})`);
        $(pageObj).css('background-size', defaultBgStretchList.css.bgSize);
        $(pageObj).css('background-repeat', defaultBgStretchList.css.bgRepeat);
        $(pageObj).css(
            'background-position',
            defaultBgStretchList.css.bgPosition,
        );
        // workInfo.setUpdateKey();
        docData.setPageUpdateKey();
        // docData.setPageObject(pageObj);
        // dostack.addUndoStack('', EundoStackAddType.page);

        dostack.addUndoStack('', EundoStackAddType.all);
    }
};
// export const getOrgImageSize = (imgSrc, callback) => {

//     const orgImgObj = new Image();
//     orgImgObj.src = imgSrc;

//     orgImgObj.onerror = function() {
//         showToastMessage("정확한 이미지 URL을 확인해주세요",1);
//         return;
//     };
//     orgImgObj.onload = function() {
//         if(typeof callback === 'function') {
//             callback({
//                 width: orgImgObj.width,
//                 height: orgImgObj.height
//             });
//         }
//     };

// };

export const getOrgImageSize = (imgSrc: string) => {
    return new Promise((resolve, reject) => {
        const orgImgObj = new Image();
        orgImgObj.src = imgSrc;
        orgImgObj.onerror = function () {
            reject(new Error('getImageSize failed'));
        };
        orgImgObj.onload = function () {
            resolve({
                width: orgImgObj.width,
                height: orgImgObj.height,
            });
        };
    });
};

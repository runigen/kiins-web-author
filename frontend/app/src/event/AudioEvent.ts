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

export const addAudioObject = async (
    audioInfo: IfileInfo,
    order: number = 0,
    event: React.DragEvent,
) => {
    console.log('audioInfo : ', audioInfo);

    // const metaData: any = await getAudioMetaData(audioInfo.url).catch(e => {
    //     console.log(e);
    //     return;
    // });
    // console.log('metaData : ', metaData);

    const audioObject = objects.createNewObject(EobjectType.audio);
    // audioObject.src = imageInfo.url;
    $(audioObject).attr('resource-id', audioInfo.fileId);
    $(audioObject).attr('resource-url', audioInfo.url);
    $(audioObject).attr('resource-type', audioInfo.mimeType);
    $(audioObject).attr('object-name', audioInfo.orgFileName);
    // $(audioObject).css('width', metaData.width);
    // $(audioObject).css('height', metaData.height);

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    console.log('mouseX : ', mouseX);
    console.log('mouseY : ', mouseY);

    if (mouseX === undefined || mouseY === undefined) {
        $(audioObject).css({
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
        $(audioObject).css({
            left: filePosition.left - 25,
            top: filePosition.top - 25,
            opacity: 1,
        });
    }
    // const canvasObj = pages.getCanvasObject() as HTMLDivElement;
    // canvasObj.appendChild(imageObject);
    workInfo.addObjectList(audioObject);
    dostack.addUndoStack('', EundoStackAddType.all);
};
const getAudioMetaData = async (url: string) => {
    console.log('getAudioMetaData : ', url);
};

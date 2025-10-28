import $ from 'jquery';
import * as SquareEvent from './SquareEvent';
//import {deviateObjectPosition} from '../util/objects';
import { EundoStackAddType } from '../const/types';
import * as dostack from '../util/dostack';
import * as objects from '../util/objects';
import workInfo from '../store/workInfo';

export const getObjectSelector = (obj: any = null) => {
    if (obj) {
        const selectorId = 'SEL_' + obj.id;
        return document.getElementById(selectorId) as HTMLDivElement;
    } else {
        return document.querySelector(
            '#idx_canvas_sheet_shadow .object-selector',
        ) as HTMLDivElement;
    }
    // const currObject = document.querySelector('#idx_canvas_sheet_shadow .object-selector');
    // return currObject;
};
export const removeSelectors = (objectId = '') => {
    try {
        if (objectId) {
            $(
                '.canvas-sheet-shadow div.object-selector[ref-obj=' + objectId,
            ).remove();
            const targetObject = document.getElementById(objectId);
            if (targetObject) {
                workInfo.removeObjectGroup(targetObject);
            }
        } else {
            $('.canvas-sheet-shadow div.object-selector').remove();
            $('.canvas-sheet-shadow svg.tpl-line').remove();
            $('.canvas-sheet-shadow div.tpl-ans-mark').remove();
            workInfo.emptyObjectGroup();
        }
    } catch (e) {
        console.log(e);
    }

    // $('.canvas-sheet-shadow div').each((index, elem) => {
    //     if(elem.classList.contains('object-selector')) {
    //         if(objectId) {
    //             if(elem.getAttribute('ref-obj') === objectId) {
    //                 elem.remove();
    //                 return;
    //             }
    //         } else {
    //             elem.remove();
    //         }
    //     }
    // });

    // if(objectId) {
    //     const targetObject = document.getElementById(objectId);
    //     if(targetObject) {
    //         workInfo.removeObjectGroup(targetObject);
    //     }
    // } else {
    //     workInfo.emptyObjectGroup();
    // }

    // if ($('.canvas-sheet-shadow div').hasClass('object-selector')) {
    //     console.log("removeSelectors");
    //     $('.canvas-sheet-shadow div').remove('.object-selector');
    // }
};
export const selectObject = (objectId: string) => {
    console.log('CommonEvent:selectObject:objectId:', objectId);
    const selObject: any = document.getElementById(objectId);
    if (selObject) {
        const itemType = $(selObject).attr('object-type');
        if (itemType === 'square' || itemType === 'image') {
            unselectObjects();
            SquareEvent.selectSquareObjct(selObject);
            SquareEvent.addSelectorEvent();
        }
    }
};
export const setObjectSelectorShape = (currObject: any) => {
    if (!currObject) return;

    const selectorObj = getObjectSelector(currObject);
    if (!selectorObj) return;

    $(selectorObj).css({
        left: $(currObject).css('left'),
        top: $(currObject).css('top'),
        width: $(currObject).css('width'),
        height: $(currObject).css('height'),
        transform: $(currObject).css('transform'),
    });
};
export const unselectObjects = () => {
    SquareEvent.unselectSquareObjcts();
    /* ImageEvent, 등등 추가 */
};
// export const pasteSelectedObject = (objectId: string) => {
//     const selObject: any = document.getElementById(objectId);
//     if(selObject) {

//         unselectObjects();

//         const newObject = objects.createCopyObject(selObject);
//         if(newObject === null) return '';

//         selectObject(newObject.id);

//         dostack.addUndoStack('', EundoStackAddType.all);

//         return newObject.id;

//     }

//     return '';
// }
export const pasteSelectedObject = (
    copyContentsList: string[],
    bSamePage = true,
) => {
    if (copyContentsList.length === 0) return [];
    unselectObjects();

    const pastedObjectContentsList: string[] = [];
    copyContentsList.forEach(objectContent => {
        if (objectContent) {
            const newObject = objects.createCopyObject(
                objectContent,
                bSamePage,
            );
            if (newObject !== null) {
                SquareEvent.selectSquareObjct(newObject, null);
                SquareEvent.addSelectorEvent();
                pastedObjectContentsList.push(newObject.outerHTML);
            }
        }
    });
    dostack.addUndoStack('', EundoStackAddType.all);
    return pastedObjectContentsList;
};

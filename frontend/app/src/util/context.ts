import $ from 'jquery';
import * as basicData from '../const/basicData';
import * as common from './common';
import * as keyframe from './keyframe';
import * as transition from './transition';
import * as KeyEvent from '../event/KeyEvent';
import * as CommonEvent from '../event/CommonEvent';
import * as dialog from './dialog';
import workInfo from '../store/workInfo';
import { ItransitionInfo } from '../const/types';


const contextContainerId = 'idx_context_container';
const contextContainerCss = 'context-container';

let selectedObject: HTMLElement | null = null;
let selectedObjectId = '';
let selectedTarget = '';
let selectedStep = -1;
let selectedTimeLeft = -1;
let selectedTransition: any = null;

const initSelectedInfo = () => {
    selectedObject = null;
    selectedObjectId = '';
    selectedTarget = '';
    selectedStep = -1;
    selectedTimeLeft = -1;
    selectedTransition = null;
}

export const showFrameStepContextMenu = (objectId: string, timeLeft: number, event: any) => {

    console.log("showFrameStepContextMenu");
    common.allEventCancel(event);

    //selectedObject = CommonEvent.selectObject(objectId);
    selectedObject = workInfo.getObject();
    selectedObjectId = objectId;
    // selectedTarget = target;
    // selectedStep = step;
    selectedTimeLeft = timeLeft;

    //console.log(selectedObjectId, selectedTarget, selectedStep, selectedTimeLeft);

    createContextContainer('frameStep', event);

}
export const showTransitionStepContextMenu = (objectId: string, transition: ItransitionInfo, step: number, event: any) => {
    selectedObject = workInfo.getObject();
    selectedObjectId = objectId;
    selectedStep = step;
    selectedTransition = transition;
    createContextContainer('transitionStep', event);
}

const createContextContainer = (contextId: string, event: any) => {

    let container = document.getElementById(contextContainerId);
    if(container === null) {
        container = document.createElement("div");
        container.id = contextContainerId;
        container.className = contextContainerCss;
        // container.innerHTML = "Context " + contextId;
        document.body.appendChild(container);
    }

    // 내용 비우기
    $(container).empty();

    // 내용 새로 채우기
    const contextMenu = createContextMenu(contextId);
    container.appendChild(contextMenu);

    // -- 컨텍스트컨테이너에 마우스 다운시 안닫히게.
    container.addEventListener("mousedown", (event)=>{
        common.allEventCancel(event);
    });

    // -- 컨텍스트컨테이너 외 다른부분 마우스 다운 시  닫힘 처리
    addBackgroundMouseDownEvent();


    // -- 컨테이너 위치조정
    const x = event.clientX;
    const y = event.clientY - container.offsetHeight;

    $(container).css('left', x);
    $(container).css('top', y);

}
const removeContextContainer = (event: any) => {
    const container = document.getElementById(contextContainerId);   
    if(container) {
        removeBackgroundMouseDownEvent();
        document.body.removeChild(container);        
        common.cancelBubble(event);
    }
}

const addBackgroundMouseDownEvent = () => {
    document.addEventListener("mousedown", removeContextContainer);
    document.addEventListener("keydown", removeContextContainer);
}
const removeBackgroundMouseDownEvent = () => {
    document.removeEventListener("mousedown", removeContextContainer);
    document.removeEventListener("keydown", removeContextContainer);
}




// const contextMenuList = [
//     {
//         menuId : 'frameStep',
//         menuList : [
//                 {
//                     type: 'button',
//                     id: 'idx_delete_framestep',
//                     name: 'delete',
//                     func: deleteFrameStep
//                 },
//                 {
//                     type: 'separator'
//                 },
//                 {
//                     type: 'button',
//                     id: 'idx_easing_framestep',
//                     name: 'easing',
//                     func: easingFrameStep
//                 },        
//         ]
//     },


// contextMenu 
const createContextMenu = (contextId: string) => {
    //if(type === 'frameStep') {
        // return createContextMenu(type);
    //}

    const menuObj: any = contextMenuList.find((item: any) => item.contextId === contextId);
    const menuList = [...menuObj.menuList];


    const menuContainer = document.createElement("div");
    menuList.map(menuObj => {

        const item = document.createElement("div");
        if(menuObj.type === 'separator') {
            item.className = "item-separator"
        } else {
            item.innerText = menuObj.name;
            item.className = "item";
            item.onclick = e => {
                removeContextContainer(e);
                menuObj.func(e);
            };
        }

        menuContainer.appendChild(item);

        return true;

    });
    return menuContainer;



}





// FrameStepContext
// const createFrameStepContextMenu = () => {

//     const menuContainer = document.createElement("div");
//     frameStepMenuList.map(menuObj => {

//         const item = document.createElement("div");
//         if(menuObj.type === 'separator') {
//             item.className = "item-separator"
//         } else {
//             item.innerText = menuObj.name;
//             item.className = "item";
//             item.onclick = e => {
//                 removeContextContainer();
//                 menuObj.func(e);
//             };
//         }

//         menuContainer.appendChild(item);

//     });
//     return menuContainer;

// }

const getContextParams = () => {
    let contextParam = null;
    // if(selectedObject && selectedTarget && selectedStep > -1 && selectedTimeLeft > -1) {
    if(selectedObject && selectedTimeLeft > -1) {
        contextParam = {
            object: selectedObject,
            //target: selectedTarget,
            // step: selectedStep,
            timeLeft: selectedTimeLeft
        };
    }
    console.log("getContextParams contextParam : ", contextParam);
    return contextParam;
}

const deleteFrameStep = () => {
    console.log("deleteFrameStep Call");

    const contextParam = getContextParams();
    if(contextParam === null) return;

    dialog.basicConfirmDialog("키프레임 삭제", "선택한 키프레임을 삭제하시겠습니까?",
        [
            ()=>{
                //keyframe.removeKeyFrame(contextParam.object, contextParam.target, contextParam.timeLeft);
                keyframe.removeKeyframeStep(contextParam.object, contextParam.timeLeft);
                workInfo.setCurrKeyframeStep(-1);
            }, 
            ()=>{

            }
        ]
    );   

}

/*
const easingFrameStep = (event: any) => {
    console.log("easingFrameStep Call");

    const contextParam = getContextParams();
    if(contextParam === null) return;

//    dialog.showEasingDialog(contextParam.target, contextParam.timeLeft);
    const keyframeStepInfo = keyframe.getKeyFrameStepInfo(contextParam.timeLeft);
    const easingVal = typeof keyframeStepInfo.easing !== 'undefined' ? keyframeStepInfo.easing : 'linear';
    dialog.showListItemDialog(
        'easing', 
        easingVal, 
        (val: any)=>{
            keyframe.setKeyFrameEasingInfo(contextParam.timeLeft, val);
        },
        event
    );


}
*/





// -------------------------------------------- transition context menu
const getTransitionContextParam = () => {
    let transitionContextParam = null;
    if(selectedObject && selectedTransition && selectedStep > -1) {
        transitionContextParam = {
            object: selectedObject,
            transition: selectedTransition,
            step: selectedStep,
        };
    }
    console.log("getTransitionContextParam transitionContextParam : ", transitionContextParam);
    return transitionContextParam;
};
const deleteTransitionStep = () => {
    const transitionContextParam = getTransitionContextParam();
    if(transitionContextParam === null) return;

    dialog.basicConfirmDialog("Transition 삭제", "선택한 Transition을 삭제하시겠습니까?",
        [
            ()=>{
                transition.removeTransition(transitionContextParam.object, transitionContextParam.step);
                workInfo.setCurrTransitionStep(-1);
            },
        ]
    );   


};











// --- 
const contextMenuList = [
    {
        contextId : 'frameStep',
        menuList : [
                {
                    type: 'button',
                    id: 'idx_delete_framestep',
                    name: 'delete',
                    func: deleteFrameStep
                },
                {
                    type: 'separator'
                },   
        ]
    },
    {
        contextId : 'transitionStep',
        menuList : [
                {
                    type: 'button',
                    id: 'idx_delete_transitionstep',
                    name: 'delete',
                    func: deleteTransitionStep
                },
                {
                    type: 'separator'
                },
        ]
    },
];

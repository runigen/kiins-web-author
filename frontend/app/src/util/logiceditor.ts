import $ from 'jquery';
import {
    getUniqId,
    parseJsonData,
    // getCurrentDateTime,
    getActionsName,
    getInteractionsName,
    getInteractionIdHead,
} from './common';
import {
    ILogic_Conneted_Info,
    ELogic_Connect_Pos,
    ELogic_Connect_Type,
    ELogic_Action_Type,
    ELogic_Transform_Actions_Type,
    EkeyName,
    ELogic_Object_Type,
    IinteractionsInfo,
    ELogic_Action_Condition_Type,
    ELogic_Actions_Out_Condition_Type,
    ELogic_Condition_Actions_Type,
    ELogic_Normal_Actions_Type,
} from '../const/types';
import {
    listDialogItems,
    transformOperatorList,
    transformSizeTypeList,
    logicCanvasZoomPreset,
    dataFieldTypeList,
    // canvasZoomStep,
} from '../const/basicData';
// import * as DataStore from '../store/DataStore';
import docData from '../store/docData';
import { showToastMessage } from './dialog';
import * as documents from './documents';
import { getPageObject } from './pages';
import * as KeyEvent from '../event/KeyEvent';
import * as dostackLogic from './dostackLogic';
import { getParentElement } from './texteditor';
import {
    addInteractions,
    getInteractionsInfo,
    removeInteraction,
} from './interactions';
import workInfo from '../store/workInfo';

let startX = 0;
let startY = 0;
let selectedObjectList: HTMLDivElement[] = [];
let logicCanvasZoomVal = 1;
let copyObjectList: string[] = [];

// let logicDataSet: any[] = [];

export const getCanvasContainer = () => {
    return document.querySelector(
        '.logic-canvas-container',
    ) as HTMLDivElement | null;
};
export const getCanvasObject = () => {
    return document.getElementById('idx_logic_canvas') as HTMLDivElement | null;
};
export const getCanvasSvgObject = () => {
    return document.getElementById(
        'idx_logic_canvas_svg',
    ) as SVGSVGElement | null;
};
const getMainObjectList = () => {
    const canvas = getCanvasObject();
    if (canvas) {
        const list = canvas.querySelectorAll(
            'div.object, div.trigger, div.action-container, div.interaction',
        ) as NodeListOf<HTMLDivElement>;
        return Array.from(list);
    } else {
        return [] as HTMLDivElement[];
    }
};
export const getInteractionList = () => {
    const canvas = getCanvasObject();
    if (canvas) {
        const list = canvas.querySelectorAll(
            'div.interaction',
        ) as NodeListOf<HTMLDivElement>;
        return Array.from(list);
    } else {
        return [] as HTMLDivElement[];
    }
};

export const clearCanvas = () => {
    getMainObjectList().forEach((item: HTMLDivElement) => {
        item.parentNode?.removeChild(item);
    });
    const canvasSvg = getCanvasSvgObject();
    if (canvasSvg) {
        canvasSvg.innerHTML = '';
        dostackLogic.add();
    }
};
export const setLogicActionList = (dataSet: any[]) => {
    // logicDataSet = dataSet;
    docData.setLogicActionList(dataSet);
    return dataSet;
    // console.log('logicDataSet :', logicDataSet);
};
export const getLogicActionList = (pageNo = -1) => {
    return docData.getLogicActionList(pageNo);
    // return logicDataSet;
};
export const saveLogicContent = () => {
    const docNo = docData.getDocNo();
    if (docNo === '') {
        showToastMessage('문서를 먼저 저장해주세요.');
        return;
    }

    // 1. 각각의 실제 오브젝트에 로직에디터의 인터렉션 정보를 저장
    setInteractionDataSetFromCanvas();

    // 2. 위 1번이 반영된 현재 문서정보를 docData 에 저장.
    documents.setCurrentDocContent();

    // const docInfo = documents.getDocumentInfo(docNo);
    // if (docInfo === null) {
    //     showToastMessage('문서를 먼저 저장해주세요.');
    //     return;
    // }
    const canvas = getCanvasObject();
    if (canvas) {
        // 3. canvas 내의 모든 html 을 그대로 저장
        // const currPage = docData.getCurrPage();

        //const logicContentList = docInfo.logicContentList || [];
        // const logicContentList = docData.getDocContentsList();
        // if(logicContentList.length === 0) {
        //     logicContentList.push(canvas.innerHTML);
        // } else {
        //     logicContentList[currPage-1] = canvas.innerHTML;
        // }

        // docData.setLogicContentList(logicContentList);
        docData.setLogicContent(canvas.innerHTML);

        // const logicContentList: string[] = [];
        // logicContentList.push(canvas.innerHTML);

        // 4. canvas 내의 모든 로직을 데이터 형태로 저장
        const logicActionList = setLogicActionList(
            getActionDataSetFromCanvas(),
        );
        docData.setLogicActionList(logicActionList);
        // const newDocInfo = {
        //     ...docInfo,
        //     logicContentList,
        //     logicDataSet,
        //     moddate: getCurrentDateTime(),
        // };
        // documents.saveDocumentInfo(newDocInfo);

        // showToastMessage('저장되었습니다.');
    }
};

// export const getLogicContent = () => {
//     // const docNo = docData.getDocNo();
//     // const docInfo = DataStore.getDocument(docNo);
//     // if (docInfo === null) {
//     //     return [];
//     // }
//     // return docInfo.logicContentList || [];
//     return docData.getLogicContentsList();
// };
export const getCurrPageLogicContent = () => {
    const logicContent = docData.getLogicContent();
    // if (logicContentList.length === 0) {
    //     return '';
    // }
    // return logicContentList[currPage-1];
    return logicContent;
};
// 로직 컨텐츠(html string) 을 로직 캔버스에 적용
export const setLogicContentToCanvas = (logicContent: string | undefined) => {
    const canvas = getCanvasObject();
    if (canvas) {
        if (logicContent === undefined || logicContent === '') {
            clearCanvas();
        } else {
            canvas.innerHTML = logicContent;
        }
    }
};
// 로직 컨텐츠(html string) 을 로직 캔버스에 적용: 최초 로직에디터 로딩시 사용 (doc -> logic 데이터 싱크 까지 진행)
export const setLogicContentToCanvasFirst = (
    logicContent: string | undefined,
) => {
    setLogicContentToCanvas(logicContent);

    setTimeout(() => {
        // doc -> logic 데이터 싱크
        syncInteractionDataSet('logic');

        // 세팅 후 스택이 비어있으면 스택에 추가
        if (!dostackLogic.checkStackListCnt()) {
            dostackLogic.add();
        }
        setDoStackStatusIcon();
    }, 0);
};
const syncInteractionDataSet = (to: 'logic' | 'doc') => {
    const logicCanvas = getCanvasObject();
    if (logicCanvas === null) return;
    const logicInteractionNodeList = logicCanvas.querySelectorAll(
        'div.interaction',
    ) as NodeListOf<HTMLDivElement>;
    const logicInteractionList = Array.from(logicInteractionNodeList);

    const logicObjectNodeList = logicCanvas.querySelectorAll(
        'div.block.object',
    ) as NodeListOf<HTMLDivElement>;
    const logicObjectList = Array.from(logicObjectNodeList);

    const objectList = workInfo.getObjectList();
    const docPageObject = getPageObject();
    if (!docPageObject) return;

    const totalObjectList = [...objectList, docPageObject];

    // if(objectList.length === 0) return;

    // for (const interactionContainer of interactionContainerList) {

    // 문서 데이터를 로직에 반영 (logic)

    if (to === 'logic') {
        let addCount = 0;
        for (const obj of totalObjectList) {
            // doc의 오브젝트명과 logic 의 오브젝트명을 동기화
            const objName =
                $(obj).attr('object-name') || $(obj).attr('page-name') || '';
            const matchObject = logicObjectList.find(
                (logicObject: any) =>
                    $(logicObject).attr('ref-obj-id') === obj.id,
            );
            if (matchObject) {
                $(matchObject).attr('object-name', objName);
                $(matchObject).attr('title', objName);
                $(matchObject).find('p').text(objName);
            }

            // doc 에는 있지만, logic 에는 없는 인터렉션을 생성
            const objInteractionList = getInteractionsInfo(obj);
            if (objInteractionList.length === 0) continue;

            for (const objInteraction of objInteractionList) {
                if (logicInteractionList.length > 0) {
                    const matchInteractions =
                        logicInteractionList.find(
                            (logicInteraction: any) =>
                                objInteraction.id === logicInteraction.id,
                        ) || null;
                    if (matchInteractions === null) {
                        createSimpleInteraction(
                            obj.id,
                            objInteraction,
                            addCount,
                        );
                        addCount++;
                    } else {
                        $(matchInteractions).attr(
                            'object-name',
                            objInteraction.name,
                        );
                        if ($(matchInteractions).hasClass('simple')) {
                            matchInteractions.innerText = objInteraction.name;
                        }
                        if ($(matchInteractions).hasClass('logic')) {
                            matchInteractions
                                .querySelector(
                                    '.interaction-name input.action-title-input',
                                )
                                ?.setAttribute('value', objInteraction.name);
                        }
                    }
                } else {
                    createSimpleInteraction(obj.id, objInteraction, addCount);
                    addCount++;
                }
            }
        }

        // 2. doc 에는 없지만, logic 에는 있는 인터렉션을 삭제
        /**
         * @todo : 삭제 보완 필요 ('테스트' 문서)
         */
        for (const logicInteraction of logicInteractionList) {
            let isMath = false;

            // logic 에서 생성한 인터렉션 중 정상적이지 않은 인터렉션은 삭제하지 않음
            if (
                $(logicInteraction).hasClass('logic') &&
                checkValidInteraction(logicInteraction) === false
            ) {
                isMath = true;
            } else {
                for (const obj of totalObjectList) {
                    const objInteractionList = getInteractionsInfo(obj);
                    const matchInteractions =
                        objInteractionList.find(
                            (objInteraction: any) =>
                                objInteraction.id === logicInteraction.id,
                        ) || null;
                    if (matchInteractions !== null) {
                        isMath = true;
                        break;
                    }
                }
            }
            if (isMath === false) {
                removeSvgPathFromObj(logicInteraction);
                logicCanvas.removeChild(logicInteraction);
            }
        }

        // 3. 잘못된 연결선 제거 (path내 지정된 ref-obj-id 가 가리키는 오브젝트가 실제 존재하지 않는 경우)
        const logicSvgContainer = getCanvasSvgObject();
        if (logicSvgContainer) {
            const logicPathList = logicSvgContainer.querySelectorAll('path');
            const logicPathArr = Array.from(logicPathList);
            for (const logicPath of logicPathArr) {
                const pathRefObjId = $(logicPath).attr('ref-obj-id') || '';
                if (pathRefObjId) {
                    const pathRefObj = logicCanvas.querySelector(
                        '#' + pathRefObjId,
                    );
                    if (pathRefObj === null) {
                        logicSvgContainer.removeChild(logicPath);
                    }
                } else {
                    logicSvgContainer.removeChild(logicPath);
                }
            }
        }

        // 로직데이터를 문서에 반영 (doc)
    } else {
        // else if (to === 'doc') {
    }
};

export const getActionDataSetFromCanvas = () => {
    const canvas = getCanvasObject();
    if (canvas === null) return [];

    // 1. canvas 내의 모든 action을 저장
    const actionsDataList: any[] = [];
    const actionsContainerList = canvas.querySelectorAll(
        'div.action-container',
    ) as NodeListOf<HTMLDivElement>;
    actionsContainerList.forEach((actionContainer: HTMLDivElement) => {
        const actionName = actionContainer.getAttribute('object-name') || '';
        const actionId = actionContainer.id;
        const actionContainerObjectType: ELogic_Object_Type =
            (actionContainer.getAttribute(
                'object-type',
            ) as ELogic_Object_Type) || ELogic_Object_Type.action;
        console.log('actionName : ', actionName);
        console.log('actionContainerObjectType : ', actionContainerObjectType);

        const actionsList: any[] = [];
        const actionsUnitContainerList = actionContainer.querySelectorAll(
            '.action-body div.action-unit-container',
        ) as NodeListOf<HTMLDivElement>;
        actionsUnitContainerList.forEach(
            (actionsUnitContainer: HTMLDivElement) => {
                const actionType =
                    actionsUnitContainer.getAttribute('action-type') || '';
                const actions =
                    actionsUnitContainer.getAttribute('actions') || '';

                console.log('actionType : ', actionType);
                console.log('actions : ', actions);

                // transform, timer, score 내부 props 를 파싱해서 저장
                if (
                    actionType === ELogic_Action_Type.transform ||
                    actionType === ELogic_Action_Type.timer ||
                    actionType === ELogic_Action_Type.score ||
                    actionType === ELogic_Action_Type.condition ||
                    actionType === ELogic_Action_Type.audio ||
                    actionType === ELogic_Action_Type.data ||
                    actionType === ELogic_Action_Type.page_move
                ) {
                    const actionPropsList: any = {};
                    const actionUnitPropsList =
                        actionsUnitContainer.querySelectorAll(
                            '.action-unit-body .transform-actions-unit-props',
                        ) as NodeListOf<any>;
                    actionUnitPropsList.forEach((actionProps: any) => {
                        const actionPropsName =
                            actionProps.getAttribute('name') || '';
                        const actionPropsValue =
                            actionProps.getAttribute('selected-val') || '';
                        if (actionPropsName) {
                            // actionPropsList[actionPropsName] =
                            //     actionPropsName === 'size'
                            //         ? Number(actionPropsValue)
                            //         : actionPropsValue;
                            actionPropsList[actionPropsName] = actionPropsValue;
                        }
                    });
                    actionsList.push({
                        ...actionPropsList,
                        actionType,
                        actions,
                    });
                } else {
                    actionsList.push({
                        actionType,
                        actions,
                    });
                }
            },
        );

        // out connection 이 있는지 확인
        const outActionList: ILogic_Conneted_Info[] = [];
        const outConnectorList = actionContainer.querySelectorAll(
            '.connect.out',
        ) as NodeListOf<HTMLDivElement>;
        outConnectorList.forEach((outConnector: HTMLDivElement) => {
            const connectedInfo = getConnectedInfoList(outConnector);
            if (connectedInfo.length > 0) {
                // conditions
                if (
                    outConnector.classList.contains(
                        ELogic_Actions_Out_Condition_Type.yes,
                    ) ||
                    outConnector.classList.contains(
                        ELogic_Actions_Out_Condition_Type.no,
                    )
                ) {
                    connectedInfo.forEach(
                        (connectedInfo: ILogic_Conneted_Info) => {
                            if (
                                outConnector.classList.contains(
                                    ELogic_Actions_Out_Condition_Type.yes,
                                )
                            ) {
                                connectedInfo.actions =
                                    ELogic_Actions_Out_Condition_Type.yes;
                            } else if (
                                outConnector.classList.contains(
                                    ELogic_Actions_Out_Condition_Type.no,
                                )
                            ) {
                                connectedInfo.actions =
                                    ELogic_Actions_Out_Condition_Type.no;
                            }
                        },
                    );
                }

                outActionList.push(...connectedInfo);
            }
        });

        // in connection 이 있는지 확인
        const inActionList: ILogic_Conneted_Info[] = [];
        const inConnectorList = actionContainer.querySelectorAll(
            '.connect.in',
        ) as NodeListOf<HTMLDivElement>;
        inConnectorList.forEach((inConnector: HTMLDivElement) => {
            const connectedInfo = getConnectedInfoList(inConnector);
            if (connectedInfo.length > 0) {
                inActionList.push(...connectedInfo);
            }
        });

        actionsDataList.push({
            actionName,
            actionId,
            objectType: actionContainerObjectType,
            actionsList,
            outActionList,
            inActionList,
        });
    });

    console.log('actionsDataList', actionsDataList);
    return actionsDataList;
};

/**
 * logic canvas에 그려진 interaction 데이터를 doc의 실제 오브젝트에 등록
 */
export const setInteractionDataSetFromCanvas = () => {
    const canvas = getCanvasObject();
    if (canvas === null) return [];

    const objInteractionMatchList = [];

    // 1. canvas 내의 모든 interaction을 저장
    // const interactionDataList: any[] = [];
    const interactionContainerNodeList = canvas.querySelectorAll(
        'div.interaction',
    ) as NodeListOf<HTMLDivElement>;
    const interactionContainerList = Array.from(interactionContainerNodeList);
    for (const interactionContainer of interactionContainerList) {
        const objectType =
            interactionContainer.getAttribute('object-type') || '';
        if (objectType !== ELogic_Object_Type.interaction) continue;

        if ($(interactionContainer).hasClass('logic') === false) continue;

        const triggerList = interactionContainer.querySelectorAll(
            'div.trigger',
        ) as NodeListOf<HTMLDivElement>;
        if (triggerList.length === 0) continue;

        // 하나의 interaction에 하나의 trigger만 있을 수 있음
        const trigger = triggerList[0];

        const triggerVal = trigger.getAttribute('trigger-val') || '';
        if (triggerVal === '') continue;

        // in connection 이 있는지 확인
        // const inActionList: ILogic_Conneted_Info[] = [];
        const inConnectorList = trigger.querySelectorAll(
            '.connect.in',
        ) as NodeListOf<HTMLDivElement>;
        if (inConnectorList.length === 0) continue;

        // out connection 이 있는지 확인
        // const outActionList: ILogic_Conneted_Info[] = [];
        const outConnectorList = trigger.querySelectorAll(
            '.connect.out',
        ) as NodeListOf<HTMLDivElement>;
        if (outConnectorList.length === 0) continue;

        // trigger의 Input은 object만 가능
        const eventObjectIdList: string[] = [];
        inConnectorList.forEach((inConnector: HTMLDivElement) => {
            const inConnectedInfo = getConnectedInfoList(inConnector);
            if (inConnectedInfo.length > 0) {
                inConnectedInfo.forEach(info => {
                    if (
                        info.objectType === ELogic_Object_Type.object &&
                        info.refObjId !== undefined
                    ) {
                        // 대상 object가 페이지인경우 아이디값을 page 로 넣는다.
                        // if (info.refObjId.substr(0, 5) === 'PAGE_') {
                        if (info.refObjId.indexOf('PAGE_') === 0) {
                            eventObjectIdList.push('page');
                        } else {
                            eventObjectIdList.push(info.refObjId);
                        }
                    }
                });
            }
        });
        if (eventObjectIdList.length === 0) continue;

        // trigger의 Output은 action 만 가능
        const actionIdList: string[] = [];
        outConnectorList.forEach((outConnector: HTMLDivElement) => {
            const outConnectedInfo = getConnectedInfoList(outConnector);
            if (outConnectedInfo.length > 0) {
                outConnectedInfo.forEach(info => {
                    if (
                        info.objectType === ELogic_Object_Type.action ||
                        info.objectType === ELogic_Object_Type.condition
                    ) {
                        actionIdList.push(info.id);
                    }
                });
            }
        });
        if (actionIdList.length === 0) continue;
        // out은 1개만 존재하므로 0번째만 사용
        const outActionId = actionIdList[0];

        // 각각의 object 에 인터렉션 지정
        // const interactionId = interactionContainer.id.replace(/^L_/, '');
        const interactionId = interactionContainer.id;
        const interactionName =
            interactionContainer.getAttribute('object-name') || '';
        eventObjectIdList.forEach(eventObjectId => {
            let currObject = null;

            // id가 page인 경우는 페이지오브젝트를 설정한다.
            if (eventObjectId === 'page') {
                currObject = getPageObject();
            } else {
                currObject = document.getElementById(eventObjectId);
            }
            if (currObject) {
                addInteractions(currObject, {
                    id: interactionId,
                    name: interactionName,
                    trigger: triggerVal,
                    targetId: eventObjectIdList,
                    action: outActionId,
                });
            }
        });

        objInteractionMatchList.push({
            interactionId: interactionId,
            evtObjIdList: eventObjectIdList,
        });
    }

    console.log('objInteractionMatchList', objInteractionMatchList);

    /*
            // eventObjectIdList 목록에 있는 오브젝트만 interactionId 를 할당할 수 있으므로, 
        // eventObjectIdList 목록에 없는 오브젝트에 위 interactionId 가 할당되어 있는경우 제거한다.
        const objectList = workInfo.getObjectList();
        const docPageObject = getPageObject();
        if (!docPageObject) return;
    
        const totalObjectList = [...objectList, docPageObject];
        for (const obj of totalObjectList) {

            if (eventObjectIdList.indexOf(obj.id) === -1) {

            
        }
    */

    // doc 에는 있는데 logic 에는 없는 interaction들은 제거한다. (로직에디터에서 삭제한것으로 간주)
    const objectList = workInfo.getObjectList();
    const docPageObject = getPageObject();
    if (!docPageObject) return;

    const totalObjectList = [...objectList, docPageObject];
    for (const obj of totalObjectList) {
        const objInteractionList = getInteractionsInfo(obj);
        if (objInteractionList.length === 0) continue;
        for (const objInteraction of objInteractionList) {
            const mathObj =
                interactionContainerList.find(
                    interactionContainer =>
                        interactionContainer.id === objInteraction.id,
                ) || null;
            // logic 에 없는 것은 제거한다.
            if (mathObj === null) {
                removeInteraction(obj, objInteraction.id);
            }
        }
    }
};

const getDropCanvasPosition = (event: any) => {
    let result = {
        x: 0,
        y: 0,
    };
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const canvas = getCanvasObject();
    if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        let canvasX = mouseX - canvasRect.left;
        let canvasY = mouseY - canvasRect.top;

        // 배율 조정
        const canvasZoomVal = getCanvasZoomVal();
        canvasX = canvasX / canvasZoomVal;
        canvasY = canvasY / canvasZoomVal;

        // 10단위로 끊어서 이동
        canvasX = Math.round(canvasX / 10) * 10;
        canvasY = Math.round(canvasY / 10) * 10;

        result = {
            x: canvasX,
            y: canvasY,
        };
    }
    return result;
};

export const setMousePosition = (x: number, y: number) => {
    startX = x;
    startY = y;
    console.log('setMousePosition startX', startX);
    console.log('setMousePosition startY', startY);
};

// 캔버스 위의 object 위치를 마우스기준 중앙으로 이동
const setObjectDefaultPosition = (
    mainObj: HTMLDivElement,
    positionObj: HTMLDivElement | undefined = undefined,
) => {
    const mainObjId = mainObj.id;
    if (document.getElementById(mainObjId) === null) return;

    if (positionObj === undefined) {
        $(mainObj).css({
            left: '-=' + Math.round(mainObj.offsetWidth / 2 / 10) * 10,
            top: '-=' + Math.round(mainObj.offsetHeight / 2 / 10) * 10,
        });
    } else {
        $(mainObj).css({
            left: '-=' + Math.round(positionObj.offsetWidth / 2 / 10) * 10,
            top: '-=' + Math.round(positionObj.offsetHeight / 2 / 10) * 10,
        });
    }
};

export const createNewObject = (dragObj: HTMLElement, event: any) => {
    if (dragObj === null) return null;
    const objectId = dragObj.getAttribute('object-id');
    if (objectId === null) return null;
    const orgObj = document.getElementById(objectId);
    if (orgObj === null) return null;
    let newObj: HTMLDivElement | null = null;
    const canvas = getCanvasObject();
    if (canvas === null) return;

    const objectType = $(orgObj).attr('object-type') || '';
    const objectName =
        $(orgObj).attr('object-name') || $(orgObj).attr('page-name') || '';

    newObj = document.createElement('div') as HTMLDivElement;
    newObj.id = getUniqId('L_OBJ'); // + '_' + orgObj.id;
    newObj.className = 'block object';
    $(newObj).attr('title', objectName);

    // newObj.innerHTML =
    //     '<p>' +
    //     (objectType === 'page'
    //         ? $(orgObj).attr('page-name')
    //         : $(orgObj).attr('object-name')) +
    //     '</p>';
    // newObj.innerHTML =
    //     '<p>' +
    //     (objectType === 'page' ? 'Page' : $(orgObj).attr('object-name')) +
    //     '</p>';
    newObj.innerHTML = `<p>${objectName}</p>`;

    $(newObj).attr('ref-obj-id', orgObj.id);
    // $(newObj).attr('draggable', 'true');
    if (objectType) {
        $(newObj).attr('object-type', ELogic_Object_Type.object);
        $(newObj).addClass(objectType);
    }
    $(newObj).attr('object-name', objectName);

    if ($(orgObj).hasClass('check-box')) {
        $(newObj).addClass('check-box');
    }
    if ($(orgObj).hasClass('input-box')) {
        $(newObj).addClass('input-box');
    }

    /* 
    //object 는 in connector 가 없음 
    const inputObj1 = document.createElement('div');
    inputObj1.className = 'connect in top';
    $(inputObj1).attr('pos', 'top');
    $(inputObj1).attr('connect-type', 'in');
    $(inputObj1).attr('ref-obj-id', newObj.id);
    newObj.appendChild(inputObj1);

    const inputObj2 = document.createElement('div');
    inputObj2.className = 'connect in left';
    $(inputObj2).attr('pos', 'left');
    $(inputObj2).attr('connect-type', 'in');
    $(inputObj2).attr('ref-obj-id', newObj.id);
    newObj.appendChild(inputObj2);
    */

    const outputObj1 = document.createElement('div');
    outputObj1.className = 'connect out right';
    $(outputObj1).attr('ref-obj-id', newObj.id);
    $(outputObj1).attr('pos', 'right');
    $(outputObj1).attr('connect-type', 'out');
    newObj.appendChild(outputObj1);

    const outputObj2 = document.createElement('div');
    outputObj2.className = 'connect out bottom';
    $(outputObj2).attr('ref-obj-id', newObj.id);
    $(outputObj2).attr('pos', 'bottom');
    $(outputObj2).attr('connect-type', 'out');
    newObj.appendChild(outputObj2);

    const dropPosition = getDropCanvasPosition(event);
    $(newObj).css({
        left: dropPosition.x,
        top: dropPosition.y,
    });

    // return newObj;
    canvas.appendChild(newObj);
    addSelectedObjectList(newObj);

    setObjectDefaultPosition(newObj);

    dostackLogic.add();

    return newObj;
};

export const createNewAction = (dragObj: HTMLDivElement, event: any) => {
    if (dragObj === null) return null;
    // let actionObj: HTMLDivElement | null;
    const canvas = getCanvasObject();
    if (canvas === null) return;

    const dropPosition = getDropCanvasPosition(event);

    const actionObj = document.createElement('div');
    actionObj.id = getUniqId('L_ACT');
    actionObj.className = 'block action-container';
    const newActionName = getActionsName();
    $(actionObj).attr('object-type', 'action');
    $(actionObj).attr('object-name', newActionName);
    // $(actionObj).attr('draggable', 'true');
    $(actionObj).css({
        left: dropPosition.x,
        top: dropPosition.y,
    });

    const titleObj = document.createElement('div') as HTMLDivElement;
    titleObj.className = 'action-title';
    //titleObj.innerHTML = `<p>${newActionName}</p>`;
    const inputForm = document.createElement('input') as HTMLInputElement;
    inputForm.type = 'text';
    inputForm.className = 'action-title-input';
    inputForm.setAttribute('value', newActionName);
    inputForm.setAttribute('readonly', 'true');
    titleObj.appendChild(inputForm);
    actionObj.appendChild(titleObj);

    const bodyObj = document.createElement('div') as HTMLDivElement;
    bodyObj.className = 'action-body';
    actionObj.appendChild(bodyObj);

    const inputObj1 = document.createElement('div');
    inputObj1.className = 'connect in top';
    $(inputObj1).attr('pos', 'top');
    $(inputObj1).attr('connect-type', 'in');
    $(inputObj1).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(inputObj1);

    const inputObj2 = document.createElement('div');
    inputObj2.className = 'connect in left';
    $(inputObj2).attr('pos', 'left');
    $(inputObj2).attr('connect-type', 'in');
    $(inputObj2).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(inputObj2);

    const outputObj1 = document.createElement('div');
    outputObj1.className = 'connect out right';
    $(outputObj1).attr('pos', 'right');
    $(outputObj1).attr('connect-type', 'out');
    $(outputObj1).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(outputObj1);

    const outputObj2 = document.createElement('div');
    outputObj2.className = 'connect out bottom';
    $(outputObj2).attr('pos', 'bottom');
    $(outputObj2).attr('connect-type', 'out');
    $(outputObj2).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(outputObj2);

    canvas.appendChild(actionObj);

    addSelectedObjectList(actionObj);

    // 위치 조정
    setObjectDefaultPosition(actionObj, titleObj);

    dostackLogic.add();
};
export const createNewTrigger = (dragObj: HTMLElement, event: any) => {
    if (dragObj === null) return null;
    let newTrigger: HTMLDivElement | null = null;
    const canvas = getCanvasObject();
    if (canvas === null) return;

    const dropPosition = getDropCanvasPosition(event);

    newTrigger = document.createElement('div');
    // newTrigger.id = getUniqId('L_TRI') + '_' + dragObj.id;
    newTrigger.id = getUniqId('L_TRI');
    newTrigger.className = 'block trigger';
    newTrigger.innerHTML = '<p>' + $(dragObj).attr('trigger-name') + '</p>';

    const objectType = $(dragObj).attr('object-type') || '';

    $(newTrigger).attr('trigger-val', $(dragObj).attr('trigger-val') || '');
    // $(newTrigger).attr('draggable', 'true');
    if (objectType) {
        $(newTrigger).attr('object-type', 'trigger');
        $(newTrigger).addClass(objectType);
    }

    // 트리거의 인은 1개만.
    // const inputObj1 = document.createElement('div');
    // inputObj1.className = 'connect in top';
    // $(inputObj1).attr('pos', 'top');
    // $(inputObj1).attr('connect-type', 'in');
    // $(inputObj1).attr('ref-obj-id', newTrigger.id);
    // newTrigger.appendChild(inputObj1);

    const inputObj2 = document.createElement('div');
    inputObj2.className = 'connect in left';
    $(inputObj2).attr('pos', 'left');
    $(inputObj2).attr('connect-type', 'in');
    $(inputObj2).attr('ref-obj-id', newTrigger.id);
    newTrigger.appendChild(inputObj2);

    const outputObj1 = document.createElement('div');
    outputObj1.className = 'connect out right';
    $(outputObj1).attr('pos', 'right');
    $(outputObj1).attr('connect-type', 'out');
    $(outputObj1).attr('ref-obj-id', newTrigger.id);
    newTrigger.appendChild(outputObj1);

    // 트리거의 아웃은 1개만.
    // const outputObj2 = document.createElement('div');
    // outputObj2.className = 'connect out bottom';
    // $(outputObj2).attr('pos', 'bottom');
    // $(outputObj2).attr('connect-type', 'out');
    // $(outputObj2).attr('ref-obj-id', newTrigger.id);
    // newTrigger.appendChild(outputObj2);

    $(newTrigger).css({
        left: dropPosition.x,
        top: dropPosition.y,
    });

    // return newObj;
    canvas.appendChild(newTrigger);

    addSelectedObjectList(newTrigger);

    // 위치 조정
    setObjectDefaultPosition(newTrigger);

    dostackLogic.add();

    return newTrigger;
};

export const createNewActionUnit = (dragObj: HTMLElement) => {
    if (dragObj === null) return null;
    let actionObj: HTMLDivElement | null;
    const canvas = getCanvasObject();
    if (canvas === null) return;

    const actionType =
        ($(dragObj).attr('action-type') as ELogic_Action_Type) ||
        ELogic_Action_Type.none;
    const actionName = $(dragObj).attr('action-name') || '';
    const actions =
        ($(dragObj).attr('actions') as
            | ELogic_Transform_Actions_Type
            | ELogic_Condition_Actions_Type
            | ELogic_Normal_Actions_Type) || ELogic_Transform_Actions_Type.none;

    if (actionType === ELogic_Action_Type.transform) {
        actionObj = createNormalActionsUnit(actionType, actions, '');

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);

        const bodyObj = document.createElement('div') as HTMLDivElement;
        bodyObj.className = 'action-unit-body';

        const actionUnitObj = createTransformActionsUnit(actions);
        if (actionUnitObj) {
            bodyObj.appendChild(actionUnitObj);
        }

        actionObj.appendChild(bodyObj);
    } else if (actionType === ELogic_Action_Type.timer) {
        actionObj = createNormalActionsUnit(actionType, actions, '');

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);

        const bodyObj = document.createElement('div') as HTMLDivElement;
        bodyObj.className = 'action-unit-body';

        const actionUnitObj = createSizeActionsUnit(
            actions,
            'duration(sec)',
            'p',
            0.1,
        );
        if (actionUnitObj) {
            bodyObj.appendChild(actionUnitObj);
        }

        actionObj.appendChild(bodyObj);
    } else if (actionType === ELogic_Action_Type.score) {
        actionObj = createNormalActionsUnit(actionType, actions, '');

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);

        const bodyObj = document.createElement('div') as HTMLDivElement;
        bodyObj.className = 'action-unit-body';

        const actionUnitObj = createSizeActionsUnit(actions, 'value', 'a', 1);
        if (actionUnitObj) {
            bodyObj.appendChild(actionUnitObj);
        }

        actionObj.appendChild(bodyObj);
    } else if (actionType === ELogic_Action_Type.data) {
        actionObj = createNormalActionsUnit(actionType, actions, '');

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);

        if (actions === ELogic_Normal_Actions_Type.set_data) {
            const bodyObj = document.createElement('div') as HTMLDivElement;
            bodyObj.className = 'action-unit-body';

            const actionUnitObj = createDataActionsUnit();
            if (actionUnitObj) {
                bodyObj.appendChild(actionUnitObj);
                actionObj.appendChild(bodyObj);
            }
        } else {
            titleObj.classList.add('no-body');
        }
    } else if (actionType === ELogic_Action_Type.condition) {
        actionObj = createNormalActionsUnit(actionType, actions, '');

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);

        if (
            actions === ELogic_Condition_Actions_Type.quizcorrectcnt ||
            actions === ELogic_Condition_Actions_Type.score
        ) {
            const bodyObj = document.createElement('div') as HTMLDivElement;
            bodyObj.className = 'action-unit-body';

            const actionUnitObj = createConditionUnit('', 1);
            if (actionUnitObj) {
                bodyObj.appendChild(actionUnitObj);
            }
            actionObj.appendChild(bodyObj);
        } else {
            titleObj.classList.add('no-body');
        }
    } else if (
        actionType === ELogic_Action_Type.page_move &&
        (actions === ELogic_Normal_Actions_Type.goToPage ||
            actions === ELogic_Normal_Actions_Type.openLink)
    ) {
        actionObj = createNormalActionsUnit(actionType, actions, '');

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);

        const bodyObj = document.createElement('div') as HTMLDivElement;
        bodyObj.className = 'action-unit-body';

        let actionUnitObj = null;
        // page move
        if (actions === ELogic_Normal_Actions_Type.goToPage) {
            actionUnitObj = createSizeActionsUnit(
                actions,
                'Page No',
                'p',
                1,
                1,
            );

            // open url link
        } else {
            actionUnitObj = createTextActionsUnit(actions, 'URL', true);
        }

        if (actionUnitObj) {
            bodyObj.appendChild(actionUnitObj);
        }

        actionObj.appendChild(bodyObj);
    } else {
        actionObj = createNormalActionsUnit(actionType, actions, actionName);

        const titleObj = document.createElement('div') as HTMLDivElement;
        titleObj.className = 'action-unit-title no-body';
        titleObj.innerHTML = `<p>${actionName}</p>`;
        actionObj.appendChild(titleObj);
    }

    // canvas.appendChild(actionObj);
    return actionObj;
};

const createTransformActionsUnit = (
    actions:
        | ELogic_Transform_Actions_Type
        | ELogic_Condition_Actions_Type
        | ELogic_Normal_Actions_Type,
) => {
    console.log('actions : ', actions);
    const actionsUnitContainerFregment = document.createDocumentFragment();

    // 1. operator
    const actionsUnitContainer = document.createElement('div');
    actionsUnitContainer.className = 'action-unit-props-list';

    const actionsUnitContainerTitle = document.createElement('div');
    actionsUnitContainerTitle.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle.innerText = 'operator';

    const actionsUnitContainerData = document.createElement('div');
    actionsUnitContainerData.className = 'action-unit-props-list-data';
    const selectObj = document.createElement('select');
    $(selectObj).attr('selected-val', transformOperatorList[0]);
    $(selectObj).attr('name', 'operator');
    selectObj.className = 'transform-actions-unit-props select';
    transformOperatorList.forEach(operator => {
        const optionObj = document.createElement('option');
        optionObj.value = operator;
        optionObj.innerText = operator;
        selectObj.appendChild(optionObj);
    });
    actionsUnitContainerData.appendChild(selectObj);

    actionsUnitContainer.appendChild(actionsUnitContainerTitle);
    actionsUnitContainer.appendChild(actionsUnitContainerData);

    //2. size type
    const actionsUnitContainer2 = document.createElement('div');
    actionsUnitContainer2.className = 'action-unit-props-list';

    const actionsUnitContainerTitle2 = document.createElement('div');
    actionsUnitContainerTitle2.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle2.innerText = 'type';

    const actionsUnitContainerData2 = document.createElement('div');
    actionsUnitContainerData2.className = 'action-unit-props-list-data';
    const selectSizeTypeObj = document.createElement('select');
    $(selectSizeTypeObj).attr('selected-val', transformSizeTypeList[0]);
    $(selectSizeTypeObj).attr('name', 'sizeType');
    selectSizeTypeObj.className = 'transform-actions-unit-props select';
    transformSizeTypeList.forEach(sizeType => {
        const optionObj = document.createElement('option');
        optionObj.value = sizeType;
        optionObj.innerText = sizeType;
        selectSizeTypeObj.appendChild(optionObj);
    });
    actionsUnitContainerData2.appendChild(selectSizeTypeObj);

    actionsUnitContainer2.appendChild(actionsUnitContainerTitle2);
    actionsUnitContainer2.appendChild(actionsUnitContainerData2);

    // 3. size value
    const actionsUnitContainer3 = document.createElement('div');
    actionsUnitContainer3.className = 'action-unit-props-list';

    const actionsUnitContainerTitle3 = document.createElement('div');
    actionsUnitContainerTitle3.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle3.innerText = 'value';

    const actionsUnitContainerData3 = document.createElement('div');
    actionsUnitContainerData3.className = 'action-unit-props-list-data';
    const inputObj = document.createElement('input');
    inputObj.className = 'transform-actions-unit-props size';
    inputObj.type = 'number';
    inputObj.name = 'size';
    $(inputObj).attr('value', '0');
    $(inputObj).attr('step', '1');

    if (actions === ELogic_Transform_Actions_Type.borderRadius) {
        $(inputObj).attr('min', '0');
    }

    $(inputObj).attr('selected-val', '0');
    $(inputObj).attr('autoComplete', 'off');

    actionsUnitContainerData3.appendChild(inputObj);

    actionsUnitContainer3.appendChild(actionsUnitContainerTitle3);
    actionsUnitContainer3.appendChild(actionsUnitContainerData3);

    // 4. easing box
    const actionsUnitContainer4 = document.createElement('div');
    actionsUnitContainer4.className = 'action-unit-props-list';

    const actionsUnitContainerTitle4 = document.createElement('div');
    actionsUnitContainerTitle4.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle4.innerText = 'curve';

    const actionsUnitContainerData4 = document.createElement('div');
    actionsUnitContainerData4.className = 'action-unit-props-list-data';
    const easingSelectObj = document.createElement('select');
    $(easingSelectObj).attr('selected-val', 'linear');
    $(easingSelectObj).attr('name', 'easing');
    easingSelectObj.className = 'transform-actions-unit-props select';
    const easingData = listDialogItems.find(item => item.listType === 'easing');
    if (easingData !== undefined) {
        easingData.listData.forEach(easing => {
            const optionObj = document.createElement('option');
            optionObj.value = easing.id;
            optionObj.innerText = easing.name;
            easingSelectObj.appendChild(optionObj);
        });
        actionsUnitContainerData4.appendChild(easingSelectObj);
    }

    actionsUnitContainer4.appendChild(actionsUnitContainerTitle4);
    actionsUnitContainer4.appendChild(actionsUnitContainerData4);

    // 5. easing duration box
    const actionsUnitContainer5 = document.createElement('div');
    actionsUnitContainer5.className = 'action-unit-props-list';

    const actionsUnitContainerTitle5 = document.createElement('div');
    actionsUnitContainerTitle5.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle5.innerText = 'duration(sec)';

    const actionsUnitContainerData5 = document.createElement('div');
    actionsUnitContainerData5.className = 'action-unit-props-list-data';
    const durationInputObj = document.createElement('input');
    durationInputObj.className = 'transform-actions-unit-props size';
    durationInputObj.type = 'number';
    durationInputObj.name = 'duration';
    durationInputObj.min = '0';
    $(durationInputObj).attr('value', '0.5');
    $(durationInputObj).attr('selected-val', '0.5');
    // durationInputObj.max = '1000';
    durationInputObj.step = '0.1';
    $(durationInputObj).attr('selected-val', '0.5');
    actionsUnitContainerData5.appendChild(durationInputObj);

    actionsUnitContainer5.appendChild(actionsUnitContainerTitle5);
    actionsUnitContainer5.appendChild(actionsUnitContainerData5);

    actionsUnitContainerFregment.appendChild(actionsUnitContainer);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer2);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer3);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer4);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer5);

    return actionsUnitContainerFregment;

    // return actionsUnitContainer;
};
const createSizeActionsUnit = (
    actions:
        | ELogic_Transform_Actions_Type
        | ELogic_Condition_Actions_Type
        | ELogic_Normal_Actions_Type,
    text = '',
    range: 'a' | 'p' = 'a', // a : 양|음수 전체 , 'p' : 양수만,  => 모두 '0' 은 포함,
    step = 1,
    min = 0,
) => {
    const actionsUnitContainerFregment = document.createDocumentFragment();

    // select box (operator)
    if (range === 'a') {
        const actionsUnitContainer = document.createElement('div');
        actionsUnitContainer.className = 'action-unit-props-list';

        const actionsUnitContainerTitle = document.createElement('div');
        actionsUnitContainerTitle.className = 'action-unit-props-list-title';
        actionsUnitContainerTitle.innerText = 'operator';

        const actionsUnitContainerData = document.createElement('div');
        actionsUnitContainerData.className = 'action-unit-props-list-data';

        const selectObj = document.createElement('select');
        $(selectObj).attr('selected-val', transformOperatorList[0]);
        $(selectObj).attr('name', 'operator');
        // $(selectObj).attr('operator', '=');
        selectObj.className = 'transform-actions-unit-props select';
        transformOperatorList.forEach(operator => {
            const optionObj = document.createElement('option');
            optionObj.value = operator;
            optionObj.innerText = operator;
            selectObj.appendChild(optionObj);
        });
        // actionsUnitContainer.appendChild(selectObj);
        actionsUnitContainerData.appendChild(selectObj);

        actionsUnitContainer.appendChild(actionsUnitContainerTitle);
        actionsUnitContainer.appendChild(actionsUnitContainerData);
        actionsUnitContainerFregment.appendChild(actionsUnitContainer);
    }

    const actionsUnitContainer = document.createElement('div');
    actionsUnitContainer.className = 'action-unit-props-list';

    const actionsUnitContainerTitle = document.createElement('div');
    actionsUnitContainerTitle.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle.innerText = text; // 'duration(sec)';

    const actionsUnitContainerData = document.createElement('div');
    actionsUnitContainerData.className = 'action-unit-props-list-data';

    // input box
    const inputObj = document.createElement('input');
    inputObj.className = 'transform-actions-unit-props size';
    inputObj.type = 'number';
    inputObj.name = 'size';
    if (min !== 0) {
        inputObj.min = min.toString();
    } else {
        if (range === 'p') {
            inputObj.min = '0';
        }
    }
    // inputObj.max = '1000';
    $(inputObj).attr('value', min !== 0 ? String(min) : '0');
    $(inputObj).attr('selected-val', '0');
    $(inputObj).attr('step', step);
    // inputObj.onmousedown = e => {
    //     cancelBubble(e);
    // };
    // actionsUnitContainer.appendChild(inputObj);

    actionsUnitContainerData.appendChild(inputObj);

    // const textNode = document.createTextNode(text);
    // actionsUnitContainer.appendChild(textNode);

    actionsUnitContainer.appendChild(actionsUnitContainerTitle);
    actionsUnitContainer.appendChild(actionsUnitContainerData);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer);

    // return actionsUnitContainer;
    return actionsUnitContainerFregment;
};

const createTextActionsUnit = (
    actions: ELogic_Normal_Actions_Type,
    text = '',
    fullsize = true,
) => {
    const actionsUnitContainerFregment = document.createDocumentFragment();

    const actionsUnitContainer = document.createElement('div');
    actionsUnitContainer.className = `action-unit-props-list ${
        fullsize ? 'fullsize' : ''
    }`;

    const actionsUnitContainerTitle = document.createElement('div');
    actionsUnitContainerTitle.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle.innerText = text + ' : ';

    const actionsUnitContainerData = document.createElement('div');
    actionsUnitContainerData.className = 'action-unit-props-list-data';

    // input box
    const inputObj = document.createElement('input');
    inputObj.className = 'transform-actions-unit-props inputtext';
    inputObj.type = 'text';
    inputObj.name = 'inputtext';
    inputObj.placeholder = 'http://';

    actionsUnitContainerData.appendChild(inputObj);
    actionsUnitContainer.appendChild(actionsUnitContainerTitle);
    actionsUnitContainer.appendChild(actionsUnitContainerData);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer);

    // return actionsUnitContainer;
    return actionsUnitContainerFregment;
};

const createDataActionsUnit = () => {
    const actionsUnitContainerFregment = document.createDocumentFragment();

    const actionsUnitContainer = document.createElement('div');
    actionsUnitContainer.className = 'action-unit-props-list';

    const actionsUnitContainerTitle = document.createElement('div');
    actionsUnitContainerTitle.className = 'action-unit-props-list-title size2';
    actionsUnitContainerTitle.innerText = 'data';

    const actionsUnitContainerData = document.createElement('div');
    actionsUnitContainerData.className = 'action-unit-props-list-data size2';

    const selectObj = document.createElement('select');
    $(selectObj).attr('selected-val', dataFieldTypeList[0]);
    $(selectObj).attr('name', 'dataField');
    // $(selectObj).attr('operator', '=');
    selectObj.className = 'transform-actions-unit-props select';
    dataFieldTypeList.forEach(dataFieldType => {
        const optionObj = document.createElement('option');
        optionObj.value = dataFieldType;
        optionObj.innerText = dataFieldType;
        selectObj.appendChild(optionObj);
    });
    // actionsUnitContainer.appendChild(selectObj);
    actionsUnitContainerData.appendChild(selectObj);

    actionsUnitContainer.appendChild(actionsUnitContainerTitle);
    actionsUnitContainer.appendChild(actionsUnitContainerData);
    actionsUnitContainerFregment.appendChild(actionsUnitContainer);

    return actionsUnitContainerFregment;
};

const createConditionUnit = (
    // actions: ELogic_Action_Condition_Type,
    text = '',
    step = 1,
) => {
    console.log('text : ', text);
    const conditionUnitContainerFregment = document.createDocumentFragment();

    // 1. operator
    const conditionUnitContainer = document.createElement('div');
    conditionUnitContainer.className = 'action-unit-props-list';

    const actionsUnitContainerTitle = document.createElement('div');
    actionsUnitContainerTitle.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle.innerText = 'operator';

    const actionsUnitContainerData = document.createElement('div');
    actionsUnitContainerData.className = 'action-unit-props-list-data';
    const conditionList = Array.from(
        Object.values(ELogic_Action_Condition_Type),
    );
    const selectObj = document.createElement('select');
    $(selectObj).attr('selected-val', conditionList[0]);
    $(selectObj).attr('name', 'condition');
    selectObj.className = 'transform-actions-unit-props select';
    conditionList.forEach(condition => {
        const optionObj = document.createElement('option');
        optionObj.value = condition;
        optionObj.innerText = condition;
        selectObj.appendChild(optionObj);
    });
    actionsUnitContainerData.appendChild(selectObj);

    conditionUnitContainer.appendChild(actionsUnitContainerTitle);
    conditionUnitContainer.appendChild(actionsUnitContainerData);

    // 2. value
    const conditionUnitContainer2 = document.createElement('div');
    conditionUnitContainer2.className = 'action-unit-props-list';

    const actionsUnitContainerTitle2 = document.createElement('div');
    actionsUnitContainerTitle2.className = 'action-unit-props-list-title';
    actionsUnitContainerTitle2.innerText = 'value';

    const actionsUnitContainerData2 = document.createElement('div');
    actionsUnitContainerData2.className = 'action-unit-props-list-data';
    const inputObj = document.createElement('input');
    inputObj.className = 'transform-actions-unit-props size';
    inputObj.type = 'number';
    inputObj.name = 'size';
    // inputObj.max = '1000';
    $(inputObj).attr('value', '0');
    $(inputObj).attr('selected-val', '0');
    $(inputObj).attr('step', step);
    // inputObj.onmousedown = e => {
    //     cancelBubble(e);
    // };
    actionsUnitContainerData2.appendChild(inputObj);

    conditionUnitContainer2.appendChild(actionsUnitContainerTitle2);
    conditionUnitContainer2.appendChild(actionsUnitContainerData2);

    conditionUnitContainerFregment.appendChild(conditionUnitContainer);
    conditionUnitContainerFregment.appendChild(conditionUnitContainer2);

    return conditionUnitContainerFregment;

    // const textNode = document.createTextNode(text);
    // conditionUnitContainer.appendChild(textNode);
    // return conditionUnitContainer;
};

const createNormalActionsUnit = (
    actionType: ELogic_Action_Type,
    actions:
        | ELogic_Transform_Actions_Type
        | ELogic_Condition_Actions_Type
        | ELogic_Normal_Actions_Type,
    actionName = '',
) => {
    const actionUnitBox = document.createElement('div');
    actionUnitBox.id = getUniqId('L_ACT_UNIT');
    $(actionUnitBox).attr('object-type', 'action_unit');
    $(actionUnitBox).attr('action-type', actionType);
    $(actionUnitBox).attr('actions', actions);
    $(actionUnitBox).attr('draggable', 'true');
    if (actionName !== '') {
        actionUnitBox.className = `block action-unit-container ${actionType}`;
        // $(actionUnitBox).text(actionName);
    } else {
        actionUnitBox.className = `block action-unit-container`;
    }
    return actionUnitBox;
};
// export const moveAction = (dragObj: HTMLDivElement, event: any) => {
//     if (dragObj === null) return null;
//     const canvas = getCanvasObject();
//     if (canvas === null) return;

//     let endX = event.clientX - startX;
//     let endY = event.clientY - startY;
//     // 10단위로 끊어서 이동
//     endX = Math.round(endX / 10) * 10;
//     endY = Math.round(endY / 10) * 10;

//     console.log('calc endX : ' + endX);
//     console.log('calc endY : ' + endY);

//     // style 정보가 있었으면 캔버스내에서 이동
//     if ($(dragObj).attr('style')) {
//         $(dragObj).css({
//             left: `+=${endX}`,
//             top: `+=${endY}`,
//         });

//         // style 정보가 없었으면 액션컨테이너에서 캔버스로 꺼내는 동작
//     } else {
//         const dropPosition = getDropCanvasPosition(event);
//         $(dragObj).css({
//             left: dropPosition.x,
//             top: dropPosition.y,
//         });
//         setObjectDefaultPosition(dragObj);
//     }
//     canvas.appendChild(dragObj);

//     drawSvgPathFromObj(dragObj);

//     startX = 0;
//     startY = 0;
// };

export const createNewCondition = (dragObj: HTMLDivElement, event: any) => {
    if (dragObj === null) return null;
    // let actionObj: HTMLDivElement | null;
    const canvas = getCanvasObject();
    if (canvas === null) return;

    const dropPosition = getDropCanvasPosition(event);

    const actionObj = document.createElement('div');
    actionObj.id = getUniqId('L_ACT');
    actionObj.className = 'block action-container condition';
    const newActionName = 'Condition';
    $(actionObj).attr('object-type', 'condition');
    $(actionObj).attr('object-name', newActionName);
    // $(actionObj).attr('draggable', 'true');
    $(actionObj).css({
        left: dropPosition.x,
        top: dropPosition.y,
    });

    const titleObj = document.createElement('div') as HTMLDivElement;
    titleObj.className = 'action-title condition';
    //titleObj.innerHTML = `<p>${newActionName}</p>`;
    const inputForm = document.createElement('input') as HTMLInputElement;
    inputForm.type = 'text';
    inputForm.className = 'action-title-input';
    inputForm.setAttribute('value', newActionName);
    inputForm.setAttribute('readonly', 'true');
    titleObj.appendChild(inputForm);
    actionObj.appendChild(titleObj);

    const bodyObj = document.createElement('div') as HTMLDivElement;
    bodyObj.className = 'action-body';
    actionObj.appendChild(bodyObj);

    const inputObj1 = document.createElement('div');
    inputObj1.className = 'connect in top';
    $(inputObj1).attr('pos', 'top');
    $(inputObj1).attr('connect-type', 'in');
    $(inputObj1).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(inputObj1);

    const inputObj2 = document.createElement('div');
    inputObj2.className = 'connect in left';
    $(inputObj2).attr('pos', 'left');
    $(inputObj2).attr('connect-type', 'in');
    $(inputObj2).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(inputObj2);

    const outputObj1 = document.createElement('div');
    outputObj1.className = 'connect out right yes';
    $(outputObj1).attr('pos', 'right');
    $(outputObj1).attr('connect-type', 'out');
    $(outputObj1).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(outputObj1);

    const outputObj2 = document.createElement('div');
    outputObj2.className = 'connect out bottom no';
    $(outputObj2).attr('pos', 'bottom');
    $(outputObj2).attr('connect-type', 'out');
    $(outputObj2).attr('ref-obj-id', actionObj.id);
    actionObj.appendChild(outputObj2);

    canvas.appendChild(actionObj);

    addSelectedObjectList(actionObj);

    // 위치 조정
    setObjectDefaultPosition(actionObj, titleObj);

    dostackLogic.add();
};

/**
 *
 * @param dragObj : 캔버스에서 오브젝트를 드래그 하여 휴지통에 드롭
 * @returns
 */
export const removeObjectFromCanvas = (dragObj: HTMLDivElement) => {
    if (dragObj === null || dragObj === undefined) return;
    if (dragObj.parentNode) {
        removeSvgPathFromObj(dragObj);
        dragObj.parentNode.removeChild(dragObj);
    }
};

// 특정 오브젝트에 연결된 모든 오브젝트들의(자신 오브젝트, 타 오브젝트 포함) 연결정보 제거 (연결선, 연결데이터)
export const removeSvgPathFromObj = (obj: HTMLDivElement) => {
    if (obj === null) return;

    const svgObj = getCanvasSvgObject();
    if (!svgObj) return;

    const connectorList = obj.querySelectorAll(
        '.connect',
    ) as NodeListOf<HTMLDivElement>;

    for (const connectorObj of connectorList) {
        const connectedInfoList = getConnectedInfoList(connectorObj);
        if (connectedInfoList.length === 0) continue;

        const connectorPos =
            ($(connectorObj).attr('pos') as ELogic_Connect_Pos) ||
            ELogic_Connect_Pos.none;
        const connectorType =
            ($(connectorObj).attr('connect-type') as ELogic_Connect_Type) ||
            ELogic_Connect_Type.none;
        // const connectorRefObjId = $(connectorObj).attr('ref-obj-id') || '';

        // 현재 오브젝트가 시작점
        if (connectorType === ELogic_Connect_Type.out) {
            // 현재 obj로 출발한 path를 모두 삭제
            const pathId = 'path_' + obj.id + '_' + connectorPos;
            const pathObj = svgObj.querySelector(
                `#${pathId}`,
            ) as SVGPathElement | null;
            if (pathObj) {
                // 현재 커넥터와 연결된 다른 커넥터를 찾아서 정보를 제거하고 Path 삭제
                removeConnnectorData(connectorObj);
            }

            // 현재 오브젝트가 끝점
        } else {
            for (const connectedInfo of connectedInfoList) {
                const startObj = document.getElementById(connectedInfo.id);
                if (!startObj) continue;

                const startConnectorObj = startObj.querySelector(
                    `.connect[pos="${connectedInfo.pos}"]`,
                ) as HTMLDivElement;
                if (!startConnectorObj) continue;

                const pathId =
                    'path_' + connectedInfo.id + '_' + connectedInfo.pos;
                const pathObj = svgObj.querySelector(
                    `#${pathId}`,
                ) as SVGPathElement | null;
                if (pathObj) {
                    // 현재 커넥터와 연결된 다른 커넥터를 찾아서 정보를 제거하고 Path 삭제
                    removeConnnectorData(startConnectorObj);
                }
            }
        }
    }
};

export const getConnectedInfoList = (
    connectorObj: HTMLDivElement,
): ILogic_Conneted_Info[] => {
    if (connectorObj) {
        const infoStr = connectorObj.getAttribute('connected-info');
        if (infoStr) {
            return (parseJsonData(infoStr) as ILogic_Conneted_Info[]) || [];
        } else {
            return [];
        }
    }
    return [];
};
export const setConnectedIfoList = (
    connectorObj: HTMLDivElement,
    infoList: ILogic_Conneted_Info[],
) => {
    if (connectorObj) {
        connectorObj.setAttribute('connected-info', JSON.stringify(infoList));
    }
};
export const addConnectedInfo = (
    connectorObj: HTMLDivElement,
    info: ILogic_Conneted_Info,
) => {
    let connectedInfo = getConnectedInfoList(connectorObj);
    if (connectedInfo) {
        connectedInfo.push(info);
    } else {
        connectedInfo = [info];
    }
    setConnectedIfoList(connectorObj, connectedInfo);
};
export const removeConnectedInfo = (
    connectorObj: HTMLDivElement,
    info: ILogic_Conneted_Info,
) => {
    let connectedInfo = getConnectedInfoList(connectorObj);
    if (connectedInfo) {
        connectedInfo = connectedInfo.filter((item: any) => {
            return item.id !== info.id || item.pos !== info.pos;
        });
        setConnectedIfoList(connectorObj, connectedInfo);
    }
};
export const emptyConnectedInfo = (connectorObj: HTMLDivElement) => {
    setConnectedIfoList(connectorObj, []);
};

export const createSvgPath = (startConnectorObj: HTMLDivElement) => {
    if (startConnectorObj === null) return null;

    const svgObj = getCanvasSvgObject();
    if (!svgObj) return null;

    const connectorPos =
        ($(startConnectorObj).attr('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.right;
    const parentObjId = $(startConnectorObj).attr('ref-obj-id') || '';
    if (parentObjId === '') return null;

    const pathObj = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
    );
    pathObj.setAttributeNS(
        null,
        'id',
        'path_' + parentObjId + '_' + connectorPos,
    );
    pathObj.setAttributeNS(null, 'ref-obj-id', parentObjId);
    pathObj.setAttributeNS(null, 'pos', connectorPos);
    // pathObj.setAttributeNS(null, 'marker-end', 'url(#line_pointer)');
    svgObj.appendChild(pathObj);
    return pathObj;
};

export const removeConnnectorData = (connectorObj: HTMLDivElement) => {
    const svgObj = getCanvasSvgObject();
    if (!svgObj) return;

    const connectorPos =
        ($(connectorObj).attr('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.right;
    const parentObjId = $(connectorObj).attr('ref-obj-id') || '';
    if (parentObjId === '') return;
    const parentObjType =
        ($(connectorObj).parent().attr('object-type') as ELogic_Object_Type) ||
        ELogic_Object_Type.none;

    // 기존에 연결선이 있으면 제거
    const pathId = 'path_' + parentObjId + '_' + connectorPos;
    const pathObj = svgObj.querySelector(`#${pathId}`) as SVGPathElement | null;
    if (pathObj) {
        // 연결선 제거
        $(pathObj).remove();
    }

    // css.connected 제거
    connectorObj.classList.remove('connected');

    // 기존에 연결된 오브젝트 정보가 있으면 제거
    const connectedInfo = getConnectedInfoList(connectorObj);
    if (connectedInfo.length > 0) {
        connectedInfo.forEach((info: any) => {
            // 연결된 오브젝트가 있으면 해당 오브젝트의 연결정보 제거
            const targetObj = document.getElementById(info.id);
            if (targetObj) {
                const targetConnectorObj = targetObj.querySelector(
                    `.connect[pos="${info.pos}"]`,
                ) as HTMLDivElement;
                if (targetConnectorObj) {
                    // targetObj 에서 현재 오브젝트 연결정보 제거
                    removeConnectedInfo(targetConnectorObj, {
                        id: parentObjId,
                        pos: connectorPos,
                        objectType: parentObjType,
                        refObjId: '', // 제거시 이값은 필요 없으므로 빈값으로 설정
                        actions: '',
                    });

                    // 더이상 연결된 선이 없으면 css.connected 제거
                    const targetConnectedInfo =
                        getConnectedInfoList(targetConnectorObj);
                    if (targetConnectedInfo.length === 0) {
                        targetConnectorObj.classList.remove('connected');
                    }

                    const targetParentObjId =
                        $(targetConnectorObj).attr('ref-obj-id') || '';
                    if (targetParentObjId !== '') {
                        const targetParentObj = document.getElementById(
                            targetParentObjId,
                        ) as HTMLDivElement;
                        if (targetParentObj) {
                            removeConnectedInfo(targetParentObj, {
                                id: parentObjId,
                                pos: connectorPos,
                                objectType: parentObjType,
                                refObjId: '', // 제거시 이값은 필요 없으므로 빈값으로 설정
                                actions: '',
                            });
                        }
                    }
                }

                // 현재 오브젝트의 연결 정보에서 타겟 오브젝트 연결정보 제거
                removeConnectedInfo(connectorObj, {
                    id: info.id,
                    pos: info.pos,
                    objectType: info.objectType,
                    refObjId: '', // 제거시 이값은 필요 없으므로 빈값으로 설정
                    actions: '',
                });
            }
        });
    }
};

export const drawSvgPathPostoPos = (
    pathObj: SVGPathElement,
    pathStart: { left: number; top: number },
    pathEnd: { left: number; top: number },
) => {
    if (pathObj === null) return;

    const startPos =
        (pathObj.getAttribute('pos') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.none;
    console.log('drawSvgPathPostoPos startPos : ', startPos);
    const endPos =
        (pathObj.getAttribute('pos2') as ELogic_Connect_Pos) ||
        ELogic_Connect_Pos.none;
    console.log('drawSvgPathPostoPos endPos : ', endPos);

    //right -> left (default)
    // let QPath1 = `${pathStart.left + (pathEnd.left - pathStart.left) / 4} ${
    //     pathStart.top
    // }`;
    // let QPath2 = `${pathStart.left + (pathEnd.left - pathStart.left) / 2} ${
    //     (pathEnd.top - pathStart.top) / 2 + pathStart.top
    // }`;
    let MPath = `${pathStart.left} ${pathStart.top}`;
    let QPath1 = '';
    let QPath2 = '';
    let TPath = `T${pathEnd.left} ${pathEnd.top}`;

    // QPath1 = `${pathStart.left + (pathEnd.left - pathStart.left) / 4} ${
    //     pathStart.top
    // }`;
    // QPath2 = `${pathStart.left + (pathEnd.left - pathStart.left) / 2} ${
    //     (pathEnd.top - pathStart.top) / 2 + pathStart.top
    // }`;
    if (startPos === ELogic_Connect_Pos.right) {
        QPath1 = `${pathStart.left + (pathEnd.left - pathStart.left) / 4} ${
            pathStart.top
        }`;
    } else {
        QPath1 = `${pathStart.left} ${
            pathStart.top + (pathEnd.top - pathStart.top) / 4
        }`;
    }

    if (endPos === ELogic_Connect_Pos.left) {
        QPath2 = `${pathStart.left + (pathEnd.left - pathStart.left) / 2} ${
            (pathEnd.top - pathStart.top) / 2 + pathStart.top
        }`;
    } else {
        QPath2 = `${(pathEnd.left - pathStart.left) / 2 + pathStart.left} ${
            pathStart.top + (pathEnd.top - pathStart.top) / 2
        }`;
    }

    if (
        startPos === ELogic_Connect_Pos.right &&
        endPos === ELogic_Connect_Pos.top
    ) {
        MPath = `${pathStart.left}, ${pathStart.top}`;
        QPath1 = `${(pathEnd.left - pathStart.left) * 0.9 + pathStart.left}`;
        QPath2 = `${(pathEnd.top - pathStart.top) * 0.1 + pathStart.top}`;
        TPath = `${pathEnd.left}, ${pathEnd.top}`;
    } else if (
        startPos === ELogic_Connect_Pos.bottom &&
        endPos === ELogic_Connect_Pos.left
    ) {
        MPath = `${pathStart.left}, ${pathStart.top}`;
        QPath1 = `${(pathEnd.left - pathStart.left) * 0.1 + pathStart.left}`;
        QPath2 = `${(pathEnd.top - pathStart.top) * 0.9 + pathStart.top}`;
        TPath = `${pathEnd.left}, ${pathEnd.top}`;
    }

    //
    pathObj.setAttributeNS(
        null,
        'd',
        `
        M${MPath} 
        Q${QPath1}, ${QPath2} 
        ${TPath}
        `,
    );
};

export const getObjectAbsCenterPos = (obj: HTMLDivElement) => {
    if (obj === null) return { left: 0, top: 0 };

    const canvasObj = getCanvasObject();
    if (!canvasObj) return { left: 0, top: 0 };

    const canvasZoomVal = getCanvasZoomVal();

    const leftVal =
        (obj.getBoundingClientRect().left +
            canvasObj.scrollLeft +
            (obj.offsetWidth * canvasZoomVal) / 2 -
            canvasObj.getBoundingClientRect().left) /
        canvasZoomVal;
    let topVal =
        (obj.getBoundingClientRect().top +
            canvasObj.scrollTop +
            (obj.offsetHeight * canvasZoomVal) / 2 -
            canvasObj.getBoundingClientRect().top) /
        canvasZoomVal;

    // left, right 커넥터가 상단에서 15px 떨어진 위치에 고정된 경우
    if ($(obj).hasClass('left') || $(obj).hasClass('right')) {
        topVal =
            (obj.getBoundingClientRect().top +
                canvasObj.scrollTop +
                (30 * canvasZoomVal) / 2 -
                canvasObj.getBoundingClientRect().top) /
            canvasZoomVal;
    }

    try {
        return {
            left: leftVal,
            top: topVal,
        };
    } catch (e) {
        console.log(e);
        return { left: 0, top: 0 };
    }
};

export const drawSvgPathFromObj = (obj: HTMLDivElement) => {
    if (obj === null) return;

    const canvasObj = getCanvasObject();
    if (!canvasObj) return;

    const svgObj = getCanvasSvgObject();
    if (!svgObj) return;

    const connectorList = obj.querySelectorAll(
        '.connect.connected',
    ) as NodeListOf<HTMLDivElement>;
    // console.log(connectorList);
    if (connectorList.length === 0) return;
    for (const connectorObj of connectorList) {
        //connectorList.forEach((connectorObj: HTMLDivElement) => {
        const connectorPos =
            ($(connectorObj).attr('pos') as ELogic_Connect_Pos) ||
            ELogic_Connect_Pos.none;
        const connectorType =
            ($(connectorObj).attr('connect-type') as ELogic_Connect_Type) ||
            ELogic_Connect_Type.none;
        const connectedInfoList = getConnectedInfoList(connectorObj);
        if (connectedInfoList.length === 0) {
            console.log('continue');
            continue;
        }

        console.log('output...');
        const parentObjId = $(connectorObj).attr('ref-obj-id') || '';
        if (parentObjId === '') continue;

        // init variables
        let pathObj = null;
        let pathStart = {
            left: 0,
            top: 0,
        };
        let pathEnd = {
            left: 0,
            top: 0,
        };

        if (connectorType === ELogic_Connect_Type.out) {
            pathStart = getObjectAbsCenterPos(connectorObj);
            const pathId = 'path_' + parentObjId + '_' + connectorPos;
            pathObj = svgObj.querySelector(
                `#${pathId}`,
            ) as SVGPathElement | null;
        } else {
            pathEnd = getObjectAbsCenterPos(connectorObj);
        }

        for (const info of connectedInfoList) {
            const targetObj = document.getElementById(info.id);
            if (!targetObj) continue;

            const targetConnectorObj = targetObj.querySelector(
                `.connect[pos="${info.pos}"]`,
            ) as HTMLDivElement;
            if (!targetConnectorObj) continue;

            if (connectorType === ELogic_Connect_Type.out) {
                pathEnd = getObjectAbsCenterPos(targetConnectorObj);
            } else {
                pathStart = getObjectAbsCenterPos(targetConnectorObj);
                const pathId2 = 'path_' + info.id + '_' + info.pos;
                console.log('pathId2 : ', pathId2);
                pathObj = svgObj.querySelector(
                    `#${pathId2}`,
                ) as SVGPathElement | null;
            }
            if (!pathObj) continue;

            drawSvgPathPostoPos(pathObj, pathStart, pathEnd);
        }
    }
};

export const setActiveObjectFlag = () => {
    const canvas = getCanvasObject();
    if (canvas === null) return;
    const objectList = getMainObjectList();
    const activeObjectList = getSelectedObjectList();
    const activeObjectListCnt = activeObjectList.length;
    if (activeObjectListCnt === 0) {
        objectList.forEach(item => {
            item.classList.remove('active');
        });
        return;
    }
    // let addCnt = 0;
    for (let i = 0; i < objectList.length; i++) {
        const obj = objectList[i];
        if (activeObjectList.indexOf(obj) > -1) {
            obj.classList.add('active');
            // addCnt++;
            console.log('setActiveObjectFlag obj.id : ', obj.id);
            //            if (addCnt === activeObjectListCnt) break;
        } else {
            obj.classList.remove('active');
        }
    }
};
export const getSelectedObjectList = () => {
    return selectedObjectList;
};
export const emptySelectedObjectList = () => {
    selectedObjectList = [];
    setActiveObjectFlag();
};
export const addSelectedObjectList = (
    obj: HTMLDivElement,
    event: any = null,
) => {
    // shift key 누르고 있으면 추가
    if (
        event &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
    ) {
        // 기존에 있는지 확인하고 있으면 제거
        if (selectedObjectList.indexOf(obj) > -1) {
            removeSelectedObjectList(obj);

            // 기존에 없음면 추가
        } else {
            selectedObjectList.push(obj);
        }

        // shift 누르지 않았으면 기존 리스트 제거하고 추가
    } else {
        // emptySelectedObjectList();
        // selectedObjectList.push(obj);
        if (selectedObjectList.indexOf(obj) === -1) {
            emptySelectedObjectList();
            selectedObjectList.push(obj);
        }
    }
    setActiveObjectFlag();
};
const removeSelectedObjectList = (obj: HTMLDivElement) => {
    const idx = selectedObjectList.indexOf(obj);
    if (idx === -1) return;
    selectedObjectList.splice(idx, 1);
    setActiveObjectFlag();
};
export const setFullSelectedObjectList = () => {
    const canvas = getCanvasObject();
    if (canvas === null) return;
    const objectList = getMainObjectList();
    selectedObjectList = [];
    for (let i = 0; i < objectList.length; i++) {
        const interactionParent = getParentElement(
            objectList[i],
            'div',
            'interaction',
            false,
        );
        if (interactionParent) continue;
        selectedObjectList.push(objectList[i]);
    }
    setActiveObjectFlag();
};

const keyMoveDelay = 1; // key입력으로 이동할때 delay시간내에 같은 key가 입력되면 undostack에 저장하지 않음 (키입력이 빠르면 모두 undostack에 저장되지 않도록하고, 마지막에 한번만 저장하도록함)
let keyMoveDelayTimer: any = null;
export const moveActiveObjectByKey = (event: KeyboardEvent) => {
    const activeObjectList = getSelectedObjectList();
    if (activeObjectList.length === 0) return;

    const keyCode = KeyEvent.getKeyCode(event);

    let moveSize = 50;
    if (event.shiftKey) moveSize = 10;

    activeObjectList.forEach(obj => {
        if (keyCode === EkeyName.RIGHT) {
            $(obj).css({ left: `+=${moveSize}` });
        } else if (keyCode === EkeyName.LEFT) {
            $(obj).css({ left: `-=${moveSize}` });
        } else if (keyCode === EkeyName.UP) {
            $(obj).css({ top: `-=${moveSize}` });
        } else if (keyCode === EkeyName.DOWN) {
            $(obj).css({ top: `+=${moveSize}` });
        }
        drawSvgPathFromObj(obj);
    });
    if (keyMoveDelayTimer) {
        clearTimeout(keyMoveDelayTimer);
        keyMoveDelayTimer = null;
    }
    keyMoveDelayTimer = setTimeout(() => {
        keyMoveDelayTimer = null;
        dostackLogic.add();
    }, keyMoveDelay * 1000);
};
export const removeActiveObjects = () => {
    console.log('removeActiveObjects call');
    if (selectedObjectList.length === 0) return;
    let cnt = 0;
    while (selectedObjectList.length > 0) {
        const obj = selectedObjectList[0];
        // activeObjectList[0].parentNode?.removeChild(activeObjectList[0]);
        removeSelectedObjectList(obj);
        removeObjectFromCanvas(obj);
        cnt++;
        if (cnt > 1000) break;
    }
    dostackLogic.add();
};

// dostack 카운트에 따라 아이콘 변경
export const setDoStackStatusIcon = () => {
    // undostack이 초기화 될때까지 기다렸다 실행한다.
    const bUndo = dostackLogic.checkUndoStack();
    if (bUndo) {
        $('.btn-undo-redo.undo').removeClass('disabled');
    } else {
        $('.btn-undo-redo.undo').addClass('disabled');
    }
    const bRedo = dostackLogic.checkRedoStack();
    if (bRedo) {
        $('.btn-undo-redo.redo').removeClass('disabled');
    } else {
        $('.btn-undo-redo.redo').addClass('disabled');
    }
};

/**
 *
 * @param delta 0이면 1로 초기화, 0보다 크면 zoom in, 0보다 작으면 zoom out (0.1단위)
 * @param event (mouse event)
 * @returns {void}
 */
export const changeLogicCanvasZoom = (delta = 0, event: any = null): void => {
    // 소수점 두자리까지
    delta = Math.round(delta * 100) / 100;

    const orgLogicCanvasZoomVal = getCanvasZoomVal();

    // 범위를 벗어나면 리턴
    if (orgLogicCanvasZoomVal <= 0.3 && delta < 0) return;
    if (orgLogicCanvasZoomVal >= 4 && delta > 0) return;

    // if (type === 'inc') {
    //     logicCanvasZoomVal += 0.1;
    // } else if (type === 'dec') {
    //     logicCanvasZoomVal -= 0.1;
    // } else {
    //     logicCanvasZoomVal = 1;
    // }
    if (delta == 0) {
        logicCanvasZoomVal = 1;
    } else {
        logicCanvasZoomVal += delta;
    }
    logicCanvasZoomVal = Math.round(logicCanvasZoomVal * 100) / 100;

    if (orgLogicCanvasZoomVal === logicCanvasZoomVal) return;

    // logicCanvasZoomVal = Math.round(logicCanvasZoomVal * 10) / 10;

    if (logicCanvasZoomVal < Math.min(...logicCanvasZoomPreset) / 100)
        logicCanvasZoomVal = Math.min(...logicCanvasZoomPreset) / 100;
    if (logicCanvasZoomVal > Math.max(...logicCanvasZoomPreset) / 100)
        logicCanvasZoomVal = Math.max(...logicCanvasZoomPreset) / 100;
    setCanvasZoom(logicCanvasZoomVal);

    // 비율만큼 스크롤
    const canvasContainer = getCanvasContainer();
    const canvasObject = getCanvasObject();
    if (canvasContainer === null || canvasObject === null) return;

    // 가로 전체는 10000
    // let zoomRatio = 1;
    // if (type === 'inc') {
    //     zoomRatio = 0.1;
    // } else if (type === 'dec') {
    //     zoomRatio = -0.1;
    // } else {
    //     zoomRatio = 1 - orgLogicCanvasZoomVal;
    // }
    const zoomRatio = logicCanvasZoomVal - orgLogicCanvasZoomVal;
    console.log('zoomRatio', zoomRatio);

    // 배율 조정후 화면대비 중심점 비율
    let leftCenterRatio = 0.5;
    let topCenterRatio = 0.5;

    // const canvasContainerTop = canvasContainer?.offsetTop;
    // const canvasContainerLeft = canvasContainer?.offsetLeft;
    const canvasContainerTop = canvasContainer.getBoundingClientRect().top;
    const canvasContainerLeft = canvasContainer.getBoundingClientRect().left;

    console.log('canvasContainerTop', canvasContainerTop);
    console.log('canvasContainerLeft', canvasContainerLeft);

    const mouseX = event?.clientX;
    const mouseY = event?.clientY;
    console.log('mouseX', mouseX);
    console.log('mouseY', mouseY);
    if (mouseX && mouseY) {
        leftCenterRatio =
            (mouseX - canvasContainerLeft) / canvasContainer?.offsetWidth;
        topCenterRatio =
            (mouseY - canvasContainerTop) / canvasContainer?.offsetHeight;
    }
    console.log('leftCenterRatio', leftCenterRatio);
    console.log('topCenterRatio', topCenterRatio);

    const currScrollLeft = canvasContainer?.scrollLeft | 0;
    const currScrollTop = canvasContainer?.scrollTop | 0;

    let addScrollLeft =
        currScrollLeft * zoomRatio +
        canvasContainer?.offsetWidth * zoomRatio * leftCenterRatio;
    console.log('addScrollLeft', addScrollLeft);
    let addScrollTop =
        currScrollTop * zoomRatio +
        canvasContainer?.offsetHeight * zoomRatio * topCenterRatio;
    console.log('addScrollTop', addScrollTop);

    addScrollLeft = addScrollLeft / orgLogicCanvasZoomVal;
    addScrollTop = addScrollTop / orgLogicCanvasZoomVal;

    const moveScollLeft = currScrollLeft + addScrollLeft;
    const moveScollTop = currScrollTop + addScrollTop;
    console.log('moveScollLeft', moveScollLeft);
    console.log('moveScollTop', moveScollTop);

    canvasContainer?.scrollTo(moveScollLeft, moveScollTop);
};
export const setCanvasZoom = (zoomVal: number = logicCanvasZoomVal) => {
    const canvas = getCanvasObject();
    if (canvas) {
        $(canvas).css({
            transform: `scale(${zoomVal})`,
        });
    }

    const viewZoomVal = Math.round(zoomVal * 100);

    $('.logic-canvas-zoombtn-container .display').text(`${viewZoomVal}%`);
    $('#idx_logic_canvas_zoom').val(viewZoomVal);
};
export const getCanvasZoomVal = () => {
    return logicCanvasZoomVal;
};

export const createObjectMultiSelector = () => {
    const canvasObj = getCanvasObject();
    if (!canvasObj) return null;

    let objectMultiSelector = getObjectMultiSelector();
    if (objectMultiSelector) {
        objectMultiSelector.parentNode?.removeChild(objectMultiSelector);
    }
    // 셀렉터 새로 생성
    objectMultiSelector = document.createElement('div');
    objectMultiSelector.className = 'object-multi-selector';
    $(objectMultiSelector).css({
        top: 0,
        left: 0,
    });
    canvasObj.appendChild(objectMultiSelector);
    return objectMultiSelector;
};
export const getObjectMultiSelector = () => {
    const canvasObj = getCanvasObject();
    if (!canvasObj) return null;
    return canvasObj.querySelector(
        '.object-multi-selector',
    ) as HTMLDivElement | null;
};
export const removeObjectMultiSelector = () => {
    const canvasObj = getCanvasObject();
    if (!canvasObj) return;
    const objectMultiSelector = getObjectMultiSelector();
    if (objectMultiSelector) {
        objectMultiSelector.parentNode?.removeChild(objectMultiSelector);
    }
};
export const selectBoundaryObjects = () => {
    try {
        const objectList = getMainObjectList();
        if (objectList.length === 0) return;

        const canvasObj = getCanvasObject();
        if (!canvasObj) return;
        const objectMultiSelector = getObjectMultiSelector();
        if (!objectMultiSelector) return;

        // 선택가이드 박스의 네 모서리 좌표 가져오기
        const boundaryTop = $(objectMultiSelector).position().top;
        const boundaryLeft = $(objectMultiSelector).position().left;
        const boundaryRight =
            boundaryLeft +
            $(objectMultiSelector)[0].getBoundingClientRect().width;
        const boundaryBottom =
            boundaryTop +
            $(objectMultiSelector)[0].getBoundingClientRect().height;
        // console.log(
        //     'selectBoundaryObjects : boundaryTop : ',
        //     boundaryTop,
        //     ', boundaryLeft : ',
        //     boundaryLeft,
        //     ', boundaryRight : ',
        //     boundaryRight,
        //     ', boundaryBottom : ',
        //     boundaryBottom,
        // );

        // console.log('selectBoundaryObjects : objectList : ', objectList);
        selectedObjectList = [];
        objectList.forEach((obj: any) => {
            const objTop = $(obj).position().top;
            const objLeft = $(obj).position().left;

            const interactionParent = getParentElement(
                obj,
                'div',
                'interaction',
                false,
            );

            // 해당 오브젝트를 interaction으로 감싸고 있는 경우 좌표값을 조정
            if (interactionParent) {
                // objTop = $(interactionParent).position().top + objTop;
                // objLeft = $(interactionParent).position().left + objLeft;
                return false;
            }

            const objRight = objLeft + obj.getBoundingClientRect().width;
            const objBottom = objTop + obj.getBoundingClientRect().height;
            console.log(
                'selectBoundaryObjects => objTop : ',
                objTop,
                ', objLeft : ',
                objLeft,
                ', objRight : ',
                objRight,
                ', objBottom : ',
                objBottom,
            );

            // 오브젝트가 선택가이드 박스에 포함되면 선택
            if (
                objTop >= boundaryTop &&
                objTop <= boundaryBottom &&
                objLeft >= boundaryLeft &&
                objLeft <= boundaryRight &&
                objRight >= boundaryLeft &&
                objRight <= boundaryRight &&
                objBottom >= boundaryTop &&
                objBottom <= boundaryBottom
            ) {
                selectedObjectList.push(obj);
            }
        });

        setActiveObjectFlag();
    } catch (e) {
        console.log(e);
    }
};

/**
 *
 * @param interactionInfo : interaction 정보
 * @param addCount : interaction이 겹치지 않게 그리기 위한 카운트
 */
const createSimpleInteraction = (
    objId: string,
    interactionInfo: IinteractionsInfo,
    addCount = 0,
) => {
    console.log('addCount', addCount);
    if (!interactionInfo) return;
    const canvasObj = getCanvasObject();
    if (!canvasObj) return null;

    // interaction container
    const interactionObj = document.createElement('div');
    interactionObj.id = interactionInfo.id;
    interactionObj.className = 'block interaction simple';
    interactionObj.innerText = interactionInfo.name;
    $(interactionObj).attr('object-type', 'interaction');
    $(interactionObj).attr('object-name', interactionInfo.name);
    $(interactionObj).attr('ref-obj-id', objId);

    /**
     * @todo : interaction의 위치 지정 (겹치지 않게 처리)
     */
    // $(interactionObj).css({
    //     left: (addCount + 1) * 10 +  20 * addCount,
    //     top: (addCount + 1) * 10 + 30 * addCount,
    // });

    // $(interactionObj).css({
    //     left: (addCount + 1) * 20,
    //     top: (addCount + 1) * 20,
    // });

    canvasObj.appendChild(interactionObj);
};

const createNewInteraction = () => {
    const canvasObj = getCanvasObject();
    if (!canvasObj) return null;

    // interaction container
    const interactionObj = document.createElement('div');
    interactionObj.id = getUniqId('L_' + getInteractionIdHead());
    interactionObj.className = 'block interaction logic';
    const newInteractionName = getInteractionsName();
    $(interactionObj).attr('object-type', 'interaction');
    $(interactionObj).attr('object-name', newInteractionName);
    $(interactionObj).css({
        width: 100,
        height: 100,
    });

    // interaction name label box
    const interactionNameObj = document.createElement('div');
    interactionNameObj.className = 'interaction-name';
    // interactionNameObj.innerHTML = newInteractionName;
    interactionObj.appendChild(interactionNameObj);

    // interaction name input box
    const inputForm = document.createElement('input') as HTMLInputElement;
    inputForm.type = 'text';
    inputForm.className = 'action-title-input';
    inputForm.setAttribute('value', newInteractionName);
    inputForm.setAttribute('readonly', 'true');
    interactionNameObj.appendChild(inputForm);

    const minimizeBtn = document.createElement('div');
    minimizeBtn.className = 'btn-min';
    interactionNameObj.appendChild(minimizeBtn);

    const interactionResizeObj = document.createElement('div');
    interactionResizeObj.className = 'interaction-resize';
    interactionObj.appendChild(interactionResizeObj);

    canvasObj.appendChild(interactionObj);
    return interactionObj;
};

export const addInteraction = () => {
    console.log('addInteraction');

    const canvasObj = getCanvasObject();
    if (!canvasObj) return;

    const selectedObjectList = getSelectedObjectList();
    console.log('addInteraction selectedObjectList : ', selectedObjectList);

    // 부보가 이미 interaction으로 감싸져 있는 오브젝트가 있으면 중단
    for (const obj of selectedObjectList) {
        const interactionParent = getParentElement(
            obj,
            'div',
            'interaction',
            true,
        );
        if (interactionParent) {
            showToastMessage(
                '이미 다른 interaction에 포함된 오브젝트가 있습니다.',
            );
            return;
        }
    }

    const interactionObj = createNewInteraction();
    if (!interactionObj) return;

    if (selectedObjectList.length > 0) {
        let minLeft = 0;
        let minTop = 0;
        let maxRight = 0;
        let maxBottom = 0;
        // let bParentInteraction = false;
        selectedObjectList.forEach((obj: HTMLDivElement, index: number) => {
            const objLeft = parseInt($(obj).css('left') as string);
            const objTop = parseInt($(obj).css('top') as string);
            const objWidth = obj.offsetWidth;
            const objHeight = obj.offsetHeight;
            const objRight = objLeft + objWidth;
            const objBottom = objTop + objHeight;

            if (index === 0) {
                minLeft = objLeft;
                minTop = objTop;
            }

            if (objLeft < minLeft) minLeft = objLeft;
            if (objTop < minTop) minTop = objTop;
            if (objRight > maxRight) maxRight = objRight;
            if (objBottom > maxBottom) maxBottom = objBottom;
            interactionObj.appendChild(obj);
        });

        console.log('addInteraction => minLeft : ', minLeft);
        console.log('addInteraction => minTop : ', minTop);
        console.log('addInteraction => maxRight : ', maxRight);
        console.log('addInteraction => maxBottom : ', maxBottom);

        let interactionLeft = minLeft;
        let interactionTop = minTop;
        let interactionWidth = maxRight - minLeft;
        let interactionHeight = maxBottom - minTop;

        // 10px 단위로 끊어서 좌표값을 조정
        interactionLeft = Math.round(interactionLeft / 10) * 10;
        interactionTop = Math.round(interactionTop / 10) * 10;
        interactionWidth = Math.round(interactionWidth / 10) * 10;
        interactionHeight = Math.round(interactionHeight / 10) * 10;

        const interBoxPadding = 50;

        $(interactionObj).css({
            left: interactionLeft,
            top: interactionTop,
            width: interactionWidth + interBoxPadding * 2,
            height: interactionHeight + interBoxPadding * 2,
        });

        selectedObjectList.forEach((obj: HTMLDivElement) => {
            $(obj).css({
                left:
                    parseInt($(obj).css('left') as string) -
                    interactionLeft +
                    interBoxPadding,
                top:
                    parseInt($(obj).css('top') as string) -
                    interactionTop +
                    interBoxPadding,
            });
            drawSvgPathFromObj(obj);
        });
    } else {
        // 선택된 오브젝트가 없으면 interaction을 클릭한 위치에 생성
        $(interactionObj).css({
            left: 100,
            top: 100,
            width: 600,
            height: 400,
        });
    }

    dostackLogic.add();
};

export const toggleInteractionMinimize = (
    interactionContainer: HTMLDivElement,
) => {
    const innerObjectList = interactionContainer.querySelectorAll(
        'div.block',
    ) as NodeListOf<HTMLDivElement>;

    // show
    if ($(interactionContainer).hasClass('min')) {
        $(interactionContainer).removeClass('min');

        let orgSizeInfo = parseJsonData(
            interactionContainer.getAttribute('org-size'),
        );
        if (!orgSizeInfo) {
            orgSizeInfo = {
                width: '100px',
                height: '100px',
            };
        } else {
            interactionContainer.removeAttribute('org-size');
        }
        interactionContainer.style.width = orgSizeInfo.width;
        interactionContainer.style.height = orgSizeInfo.height;
        $(interactionContainer).css({
            width: orgSizeInfo.width,
            height: orgSizeInfo.height,
            padding: '',
        });

        if (innerObjectList.length > 0) {
            innerObjectList.forEach((obj: HTMLDivElement) => {
                showHideConnectionLine(obj, true);
            });
        }

        // 숨겼다가 다시 보여줄때는 내부 object 들의 svg path를 다시 그려준다. (숨긴상태에서 타이틀만 드래그하여 이동시 내부 svg path가 그려지지 않는 문제가 있음)
        drawSvgPathFromObj(interactionContainer);

        // hide
    } else {
        $(interactionContainer).addClass('min');
        const orgSizeInfo = {
            width: interactionContainer.style.width,
            height: interactionContainer.style.height,
        };
        interactionContainer.setAttribute(
            'org-size',
            JSON.stringify(orgSizeInfo),
        );
        $(interactionContainer).css({
            width: '0px',
            height: '0px',
            padding: '0px',
        });

        const leftPosition = parseInt(
            $(interactionContainer).css('left') as string,
            10,
        );
        const topPosition = parseInt(
            $(interactionContainer).css('top') as string,
            10,
        );
        // 왼쪽으로 숨지 않게
        if (leftPosition < 0) {
            $(interactionContainer).css('left', '0px');
        }
        // 위쪽으로 숨지 않게 (타이틀바가 30px)
        if (topPosition < 30) {
            $(interactionContainer).css('top', '30px');
        }

        if (innerObjectList.length > 0) {
            innerObjectList.forEach((obj: HTMLDivElement) => {
                showHideConnectionLine(obj, false);
            });
        }
    }
};

const showHideConnectionLine = (obj: HTMLDivElement, bShow: boolean) => {
    const svgObj = getCanvasSvgObject();
    if (!svgObj) return;

    const outConnectorList = obj.querySelectorAll(
        '.connect.out',
    ) as NodeListOf<HTMLDivElement>;
    if (outConnectorList.length === 0) return;
    for (const connectorObj of outConnectorList) {
        const connectorPos =
            ($(connectorObj).attr('pos') as ELogic_Connect_Pos) ||
            ELogic_Connect_Pos.right;
        const parentObjId = $(connectorObj).attr('ref-obj-id') || '';
        if (parentObjId === '') continue;

        // 기존에 연결선이 있으면 hide
        const pathId = 'path_' + parentObjId + '_' + connectorPos;
        const pathObj = svgObj.querySelector(
            `#${pathId}`,
        ) as SVGPathElement | null;
        if (pathObj) {
            // 연결선 보이기
            if (bShow) {
                $(pathObj).removeClass('hide');

                // 연결선 숨기기
            } else {
                $(pathObj).addClass('hide');
            }
        }
    }
};

// 정상적인 interaction인지 확인 (내부에 trigger, in connection, out connection이 모두 있는지 확인)
const checkValidInteraction = (interactionObj: HTMLDivElement) => {
    const objectType = interactionObj.getAttribute('object-type') || '';
    if (objectType !== ELogic_Object_Type.interaction) return false;

    // trigger 가 있는지 확인
    const triggerList = interactionObj.querySelectorAll(
        'div.trigger',
    ) as NodeListOf<HTMLDivElement>;
    if (triggerList.length === 0) return false;

    // 하나의 interaction에 하나의 trigger만 있을 수 있음
    const trigger = triggerList[0];

    const triggerVal = trigger.getAttribute('trigger-val') || '';
    if (triggerVal === '') return false;

    // trigger에 연결된 in connection 이 있는지 확인
    // const inActionList: ILogic_Conneted_Info[] = [];
    const inConnectorList = trigger.querySelectorAll(
        '.connect.in.connected',
    ) as NodeListOf<HTMLDivElement>;
    if (inConnectorList.length === 0) return false;

    // trigger에 연결된 out connection 이 있는지 확인
    // const outActionList: ILogic_Conneted_Info[] = [];
    const outConnectorList = trigger.querySelectorAll(
        '.connect.out.connected',
    ) as NodeListOf<HTMLDivElement>;
    if (outConnectorList.length === 0) return false;

    return true;
};

export const copySelectedLogicObject = () => {
    const activeObjectList = getSelectedObjectList();
    if (activeObjectList.length === 0) return;

    copyObjectList = [];

    // activeObjectList.forEach((obj) => {
    for (const obj of activeObjectList) {
        const currObjectType =
            ($(obj).attr('object-type') as ELogic_Object_Type) ||
            ELogic_Object_Type.none;

        console.log('currObjectType', currObjectType);

        // interaction 오브젝트만 복사 가능
        if (currObjectType !== ELogic_Object_Type.interaction) continue;

        // html코드 복사
        copyObjectList.push(obj.outerHTML);
    }
};

const pasteCopyInteractionObject = (newInteractionObj: HTMLDivElement) => {
    // 1. ------------------------------------------------- interaction container 복사
    // id 변경
    const newId = getUniqId('L_' + getInteractionIdHead());
    $(newInteractionObj).attr('id', newId);

    // name 변경
    const newName = ($(newInteractionObj).attr('object-name') || '') + '-01';
    $(newInteractionObj).attr('object-name', newName);

    // name form 값 변경
    const inputForm = newInteractionObj.querySelector(
        '.interaction-name input.action-title-input',
    ) as HTMLInputElement;
    inputForm.setAttribute('value', newName);

    // 위치 변경
    $(newInteractionObj).css({
        left: '+=' + 100,
        top: '+=' + 100,
    });

    // canvas에 interaction object 추가
    const canvas = getCanvasObject();
    if (!canvas) return;
    canvas.appendChild(newInteractionObj);

    // 2. ------------------------------------------------- interaction container 하위 오브젝트 복사
    const subObjectList = newInteractionObj.querySelectorAll(
        '.block',
    ) as NodeListOf<HTMLDivElement>;
    if (subObjectList.length > 0) {
        // 복제된 오브젝트들의 아이디 값을 변경하고,기존 아이디와 새로운 아이디를 저장해둘 배열
        const oldNewObjectIdList: string[][] = [];
        for (const subObj of subObjectList) {
            const subObjectType: ELogic_Object_Type =
                (subObj.getAttribute('object-type') as ELogic_Object_Type) ||
                ELogic_Object_Type.none;
            if (subObjectType === ELogic_Object_Type.none) continue;

            // id, name 변경
            const oldObjectId = $(subObj).attr('id') || '';

            let newObjectId = getUniqId('L_OBJ');
            if (subObjectType === ELogic_Object_Type.trigger) {
                newObjectId = getUniqId('L_TRI');
            } else if (
                subObjectType === ELogic_Object_Type.action ||
                subObjectType === ELogic_Object_Type.condition
            ) {
                newObjectId = getUniqId('L_ACT');
            } else if (
                subObjectType === ELogic_Object_Type.actionUnit ||
                subObjectType === ELogic_Object_Type.conditionUnit
            ) {
                newObjectId = getUniqId('L_ACT_UNIT');
            }

            $(subObj).attr('id', newObjectId);

            // 기존 아이디와 새로운 아이디를 한쌍의 배열로 저장해둠
            oldNewObjectIdList.push([oldObjectId, newObjectId]);

            // action 만 name 변경하므로 주석처리 (오브젝트이름은 고유의 이름이므로 변경하지 않는다.)
            // if (subObjectType === ELogic_Object_Type.object) {
            //     $(subObj).attr('object-name', newObjectName);
            //     $(subObj).attr('title', newObjectName);
            //     $(subObj).find('p').text(newObjectName);
            // } else

            // -- 액션 이름 변경
            if (subObjectType === ELogic_Object_Type.action) {
                const newObjectName =
                    ($(subObj).attr('object-name') ||
                        $(subObj).attr('page-name') ||
                        '') + '-01';

                const titleInputForm = subObj.querySelector(
                    '.action-title input.action-title-input',
                ) as HTMLInputElement;
                titleInputForm.setAttribute('value', newObjectName);
            }
        }

        // 위에서 각각의 오브젝트 아이디를 새로 부여하였으므로, 변경된 전체 오브젝트를 대상으로 연결된 정보를 변경해준다.
        if (oldNewObjectIdList.length > 0) {
            console.log('oldNewObjectIdList', oldNewObjectIdList);

            for (const subObj of subObjectList) {
                /*
                // 인터렉션 정보내에 있는 오브젝트 아이디 변경
                const interactionInfoString =
                    $(subObj).attr('interaction-info') || '';
                if (interactionInfoString !== '') {
                    for (const oldNewIdList of oldNewObjectIdList) {
                        const oldId = oldNewIdList[0];
                        const newId = oldNewIdList[1];

                        if (interactionInfoString.indexOf(oldId) === -1)
                            continue;
                        const newInteractionInfoString =
                            interactionInfoString.replace(oldId, newId);
                        $(subObj).attr(
                            'interaction-info',
                            newInteractionInfoString,
                        );
                    }
                }
                */

                // 커넥션 정보내에 있는 오브젝트 아이디 변경
                const connectorList = subObj.querySelectorAll(
                    '.connect',
                ) as NodeListOf<HTMLDivElement>;
                if (connectorList.length > 0) {
                    for (const connector of connectorList) {
                        const refObjId = $(connector).attr('ref-obj-id') || '';
                        if (refObjId !== '') {
                            for (const oldNewIdList of oldNewObjectIdList) {
                                const oldId = oldNewIdList[0];
                                const newId = oldNewIdList[1];

                                if (refObjId.indexOf(oldId) === -1) continue;
                                const refObjNewId = refObjId.replace(
                                    oldId,
                                    newId,
                                );
                                $(connector).attr('ref-obj-id', refObjNewId);
                            }
                        }

                        // 연결정보(connected info) 삭제할경우
                        // $(connector).removeAttr('connected-info');
                        // $(connector).removeClass('connected');

                        // connected info 삭제하지 않고 사용할 경우, 연결 아이디 정보 업데이트
                        const connectedInfo =
                            $(connector).attr('connected-info') || '';
                        if (connectedInfo !== '') {
                            let newConnectedInfo = connectedInfo;
                            for (const oldNewIdList of oldNewObjectIdList) {
                                const oldId = oldNewIdList[0];
                                const newId = oldNewIdList[1];

                                if (connectedInfo.indexOf(oldId) === -1) {
                                    continue;
                                }
                                const regExCase = new RegExp(`${oldId}`, 'g');
                                newConnectedInfo = newConnectedInfo.replace(
                                    regExCase,
                                    newId,
                                );
                                $(connector).attr(
                                    'connected-info',
                                    newConnectedInfo,
                                );
                            }
                        }

                        // out connector 일 경우, svg path 그리기
                        const connectorType =
                            ($(connector).attr(
                                'connect-type',
                            ) as ELogic_Connect_Type) ||
                            ELogic_Connect_Type.none;
                        if (connectorType !== ELogic_Connect_Type.out) continue;

                        const svgPathObj = createSvgPath(connector);
                        if (!svgPathObj) continue;
                        const pathStart = {
                            left: 0,
                            top: 0,
                        };
                        const pathEnd = {
                            left: 0,
                            top: 0,
                        };
                        drawSvgPathPostoPos(svgPathObj, pathStart, pathEnd);
                    }
                }
            }
        }
    }

    // // canvas에 interaction object 추가
    // const canvas = getCanvasObject();
    // if (!canvas) return null;
    // canvas.appendChild(newInteractionObj);

    //drawSvgPathFromObj(subObj);

    // const subObjectList2 = newInteractionObj.querySelectorAll(
    //     '.block',
    // ) as NodeListOf<HTMLDivElement>;
    // if (subObjectList2.length > 0) {
    //     for (const subObj of subObjectList2) {
    //         drawSvgPathFromObj(subObj);
    //     }
    // }
    drawSvgPathFromObj(newInteractionObj);

    // 새로 생성된 interaction을 선택처리
    emptySelectedObjectList();
    selectedObjectList.push(newInteractionObj);
    setActiveObjectFlag();
};

export const pasteCopyLogicObject = () => {
    if (copyObjectList.length === 0) return;

    for (const copyObjHtml of copyObjectList) {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = copyObjHtml;

        const newObj = tempContainer.firstChild as HTMLDivElement;
        if (!newObj) continue;

        const objectType = (newObj.getAttribute('object-type') ||
            ELogic_Object_Type.none) as ELogic_Object_Type;

        // interaction 오브젝트 붙여넣기
        if (objectType === ELogic_Object_Type.interaction) {
            pasteCopyInteractionObject(newObj);
        }

        tempContainer.remove();
    }
};

// 특정 인터렉션에 연결된 오브젝트 목록을 받고, 전달된 오브젝트목록 외 다른오브젝트에 해당 인터렉션이 설정되어 있는지 확인해서 제거
const removeGabageInteraction = (
    interactionId: string,
    eventObjectIdList: string[],
) => {
    const objectList = workInfo.getObjectList();
    if (objectList.length === 0) return;

    const docPageObject = getPageObject();
    if (!docPageObject) return;

    const totalObjectList = [...objectList, docPageObject]; // page 포함

    // 전체 오브젝트 검사
    for (const obj of totalObjectList) {
        // 각각 오브젝트의 인터렉션을 조회
        const objInteractionList = getInteractionsInfo(obj);

        // 인터렉션 정보가 없으면 다음 오브젝트로
        if (objInteractionList.length === 0) continue;

        // 각각 오브젝트의 인터렉션 아이디를 조회해서 현재 인터렉션과 일치하는지 확인
        const matchInteractionInfo = objInteractionList.find(
            (objInteraction: any) => objInteraction.id === interactionId,
        );

        // 일치하는 인터렉션이 없으면 다음 오브젝트로
        if (matchInteractionInfo === undefined) continue;

        // 현재 오브젝트가 함수에 전달된 오브젝트 목록에 없으면, 현재 오브젝트에서 인터렉션 제거
        if (eventObjectIdList.indexOf(obj.id) === -1) {
            removeInteraction(obj, matchInteractionInfo.id);
            console.log(
                'removeGabageInteraction : ',
                obj.id,
                matchInteractionInfo.id,
            );
        }
    }
};

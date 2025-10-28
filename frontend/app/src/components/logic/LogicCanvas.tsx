import React, { Suspense, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { EpreviewPlayStatus } from '../../const/types';
import $ from 'jquery';
import { allEventCancel, cancelBubble, getUniqId } from '../../util/common';
import * as logiceditor from '../../util/logiceditor';
import * as preview from '../../util/preview';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import ObjectList from './ObjectList';
import {
    basicConfirmDialog,
    hideDialog,
    showToastMessage,
} from '../../util/dialog';
import * as LogicEditorEvent from '../../event/LogicEditorEvent';
import { getParentElement } from '../../util/texteditor';
import * as dostackLogic from '../../util/dostackLogic';
import {
    addCanvasEvents,
    removeCanvasEvents,
} from '../../event/LogicEditorEvent';
import {
    emptySelectedObjectList,
    saveLogicContent,
    setCanvasZoom,
} from '../../util/logiceditor';

const LogicCanvas = observer(() => {
    useEffect(() => {
        console.log('useEffect');

        addCanvasEvents();
        // setCanvasZoom();
        dostackLogic.initialize();

        setInitLogicData();

        // dostack 초기화 (stack이 비어 있으면 현재 컨텐츠를 스택에 넣어준다.)
        // if (!dostackLogic.checkStackListCnt()) {
        //     setTimeout(() => {
        //         dostackLogic.add();
        //     }, 1000);
        // } else {
        // logiceditor.setDoStackStatusIcon();
        // }
        // return () => {
        //     console.log('LogicCanvas useEffect return');
        // };
    }, []);

    const dragover_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('dragover_handler');
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    const drop_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('drop_handler');
        //        event.preventDefault();
        allEventCancel(event);
        const data = event.dataTransfer.getData('text/plain');
        console.log('drop_handler id : ', data);
        const dragObj = document.getElementById(data) as HTMLDivElement;
        if (dragObj) {
            const objectType = dragObj.getAttribute('object-type');
            if (objectType === null) return;

            // m_action_unit은 캔버스에 드랍할 수 없다.(액션컨테이너에만 드랍가능) -> 드랍하면 N/A
            if (objectType === 'm_action_unit') {
                showToastMessage('Action Container에 드롭할 수 있습니다.', 1);
                return;
            }
            // action_unit 은 캔버스에 드랍하면 제거
            if (objectType === 'action_unit') {
                if (dragObj.parentNode) {
                    const actionContainer =
                        (getParentElement(
                            dragObj,
                            'div',
                            'action-container',
                            false,
                        ) as HTMLDivElement) || null;
                    dragObj.parentNode.removeChild(dragObj);
                    if (actionContainer) {
                        setTimeout(() => {
                            logiceditor.drawSvgPathFromObj(actionContainer);
                            dostackLogic.add();
                        }, 0);
                    }
                }
                return;
            }

            let newObject = null;
            // 오브젝트 메뉴에서 끌어온경우
            if (objectType === 'm_action') {
                logiceditor.createNewAction(dragObj, event);

                // condition 메뉴에서 끌어온경우
            } else if (objectType === 'm_condition') {
                logiceditor.createNewCondition(dragObj, event);

                // 액션 메뉴에서 끌어온경우
            } else if (objectType === 'm_object') {
                logiceditor.createNewObject(dragObj, event);

                // 트리거 메뉴에서 끌어온경우
            } else if (objectType === 'm_trigger') {
                logiceditor.createNewTrigger(dragObj, event);

                // 캔버스내 오브젝트를 드래그 한경우
            } else {
                // logiceditor.moveAction(dragObj, event);
            }
        }
    };

    const setInitLogicData = () => {
        // const logicContentList = logiceditor.getLogicContentList();
        // if (logicContentList.length > 0) {
        //     const logicContent = logicContentList[0];
        //     logiceditor.setLogicContentToCanvas(logicContent);
        // }
        const logicContent = logiceditor.getCurrPageLogicContent();
        logiceditor.setLogicContentToCanvasFirst(logicContent);
    };

    return (
        <div className="logic-canvas-container">
            <div
                id="idx_logic_canvas"
                className="logic-canvas"
                onDragOver={dragover_handler}
                onDrop={drop_handler}
                onContextMenu={allEventCancel}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    id="idx_logic_canvas_svg"
                >
                    {/* <defs>
                        <marker
                            id="line_pointer"
                            markerWidth="10"
                            markerHeight="8"
                            refX="9.5"
                            refY="5.1"
                            orient="-45"
                            markerUnits="userSpaceOnUse"
                        >
                            <polyline points="1 1, 9 5, 1 7" />
                        </marker>
                    </defs> */}
                </svg>
            </div>
        </div>
    );
});

export default LogicCanvas;

import React, { Suspense, useEffect } from 'react';
import { observer } from 'mobx-react';
// import { EpreviewPlayStatus } from '../../const/types';
// import $ from 'jquery';
// import { allEventCancel } from '../../util/common';
// import * as preview from '../../util/preview';
import {
    // emptySelectedObjectList,
    saveLogicContent,
    setCanvasZoom,
} from '../../util/logiceditor';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import ObjectList from './ObjectList';
import LogicCanvas from './LogicCanvas';
import ActionList from './ActionList';
import TriggerList from './TriggerList';
import {
    addCanvasEvents,
    removeCanvasEvents,
} from '../../event/LogicEditorEvent';
import * as dostackLogic from '../../util/dostackLogic';
import * as documents from '../../util/documents';
// import {
//     docSubjectDialog,
//     hideDialog,
//     showToastMessage,
// } from '../../util/dialog';

const Logic = observer(() => {
    useEffect(() => {
        addCanvasEvents();
        setCanvasZoom();
        dostackLogic.initialize();
    }, []);

    const closeLogicWindow = async () => {
        removeCanvasEvents();
        // dostackLogic.add();
        dostackLogic.initialize();
        saveLogicContent();

        const rst = await documents.saveCurrentDocument();
        if (rst) {
            //    showToastMessage('저장되었습니다.');
            docData.setModified(false);
        } else {
            //    showToastMessage('저장에 실패했습니다.');
        }
        workInfo.setLogicMode(false);
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div
                className="logic-container-dim"
                onClick={closeLogicWindow}
            ></div>
            <div className="logic-container">
                <div className="logic-header">Logic Editor</div>
                <div className="logic-close" onClick={closeLogicWindow}></div>
                <div className="logic-top">
                    <TriggerList />
                </div>
                <div className="logic-left">
                    <ObjectList />
                </div>
                <div className="logic-canvas-container">
                    <LogicCanvas />
                </div>
                <div className="logic-right">
                    <ActionList />
                </div>
                <div className="logic-bottom">KIINS LOGIC EDITOR</div>
            </div>
        </Suspense>
    );
});

export default Logic;

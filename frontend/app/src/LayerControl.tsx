import React from 'react';
import { observer } from 'mobx-react';
import store from './store';

import * as documents from './util/documents';
import { togglePannel } from './util/common';
import { unselectSquareObjcts } from './event/SquareEvent';
import * as dostackLogic from './util/dostackLogic';
import * as dostack from './util/dostack';

import { removeCanvasEvents } from './event/LogicEditorEvent';

import { saveLogicContent } from './util/logiceditor';

const LayerControl = observer(() => {
    const { docData, workInfo, userInfo } = store;
    const logicMode = workInfo.getLogicMode();
    const LANGSET = userInfo.getLangSet();

    const changeEditMode = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget.classList.contains('active')) {
            console.log('same mode');
            return;
        }

        // logic -> editor
        if (e.currentTarget.classList.contains('editor')) {
            closeLogicWindow();

            // editor -> logic
        } else {
            openLogicWindow();
        }
    };

    const openLogicWindow = () => {
        unselectSquareObjcts();
        if (docData.getModified() === true) {
            documents.saveCurrentDocument().then(() => {
                docData.setModified(false);
            });
        }
        dostack.initialize();
        workInfo.setLogicMode(true);
    };

    const closeLogicWindow = async () => {
        removeCanvasEvents();
        dostackLogic.initialize();
        dostack.initialize();
        saveLogicContent();
        const rst = await documents.saveCurrentDocument();
        if (rst) {
            docData.setModified(false);
        } else {
            //    showToastMessage('저장에 실패했습니다.');
        }
        workInfo.setLogicMode(false);
    };

    return (
        <>
            <div className="left-control"></div>
            <div className="middle-control">
                <div
                    className="btn-hide-pannel document"
                    onClick={togglePannel}
                ></div>
                <div className="edit-mode-control">
                    <div
                        className={`btn-edit-mode editor ${
                            logicMode !== true ? 'active' : ''
                        }`}
                        onClick={changeEditMode}
                    >
                        {LANGSET.HEAD.EDITOR}
                    </div>
                    <div
                        className={`btn-edit-mode logic ${
                            logicMode === true ? 'active' : ''
                        }`}
                        onClick={changeEditMode}
                    >
                        {LANGSET.HEAD.LOGIC}
                    </div>
                </div>
                <div
                    className="btn-hide-pannel property"
                    onClick={togglePannel}
                ></div>
            </div>
            <div className="right-control"></div>
        </>
    );
});

export default LayerControl;

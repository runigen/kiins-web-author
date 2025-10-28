import React from 'react';
// import { observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';
import CanvasZoom from './CanvasZoom';
import LogicCanvasZoom from '../logic/LogicCanvasZoom';
import Objects from './objects';
// import {
//     UserConfigDialog,
//     hideDialog,
//     showToastMessage,
// } from '../../util/dialog';
// import * as DataStore from '../../store/DataStore';
// import { saveDocumentInfo } from '../../util/documents';
// import { checkUserId, getUserIdErrorMsg } from '../../util/common';
import store from '../../store';

const Head = () => {
    const { userInfo, workInfo } = store;
    const logicMode = workInfo.getLogicMode();
    const LANGSET = userInfo.getLangSet();

    // const changeUser = () => {
    //     const userId = DataStore.getUserId();
    //     UserConfigDialog((textForm: HTMLInputElement) => {
    //         const userId = textForm.value;
    //         if (!checkUserId(userId)) {
    //             showToastMessage(getUserIdErrorMsg(), 1);
    //             textForm.select();
    //             return;
    //         }
    //         DataStore.setUserId(userId);
    //         hideDialog();
    //     });
    // };
    const showUserConfig = () => {
        workInfo.setConfigMode();
    };

    return (
        <>
            <div className="nav_quick">
                <Routes>
                    <Route path="*" element={<Objects />} />
                </Routes>
            </div>
            {logicMode === true ? <LogicCanvasZoom /> : <CanvasZoom />}
            <div
                className="logout"
                title={LANGSET.HEAD.USERSETTING}
                onClick={showUserConfig}
            ></div>
        </>
    );
};

export default Head;

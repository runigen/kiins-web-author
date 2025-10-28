import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Routes, Route } from 'react-router-dom';
// import store from '../../../store';
import BtnSquare from './BtnSquare';
import BtnImage from './BtnImage';
import BtnAudio from './BtnAudio';
import BtnNew from './BtnNew';
// import BtnSave from './BtnSave.bak';
// import BtnSaveAs from './BtnSaveAs.bak';
import BtnOpen from './BtnOpen';
// import BtnDownload from './BtnDownload';
// import BtnUpload from './BtnUpload';
// import BtnPreview from './BtnPreview.bak';
// import BtnLogic from './BtnLogic.bak';
import BtnOrder from './BtnOrder';
import BtnUndoRedo from './BtnUndoRedo';
import BtnLogicUndoRedo from '../../logic/BtnLogicUndoRedo';
// import BtnExport from './BtnExport';
// import BtnExportAll from './BtnExportAll';
import BtnTemplate from './BtnTemplate';
import BtnAlign from './BtnAlign';
import BtnSubject from './BtnSubject';
import BtnYoutube from './BtnYoutube';
import TriggerList from '../../logic/TriggerList';
import store from '../../../store';
import { EworkStatus } from '../../../const/types';
import { setCurrentDocContent } from '../../../util/documents';

const Objects = () => {
    const { userInfo, workInfo } = store;
    // const [showAlignMenu, setShowAlignMenu] = useState(false);
    // const [showPositionMenu, setPositionMenu] = useState(false);
    const logicMode = workInfo.getLogicMode();
    const LANGSET = userInfo.getLangSet();

    // const { userInfo, docData } = store;
    // const userList = userInfo.getList();
    // const pageData = docData.getData();
    // console.log("pageData:" , pageData);

    const goPreview = () => {
        // 현재 페이지의 수정된 데이터를 저장한다.
        setCurrentDocContent();

        // 미리보기 페이지로 이동한다.
        workInfo.setViewMode();
    };

    const setNormalMode = () => {
        workInfo.setStatus(EworkStatus.none);
    };

    // const setLogicMode = (bMode = true) => {
    //     workInfo.setLogicMode(bMode);
    // };

    return (
        <>
            <ul className="nav-left">
                <BtnNew />
                <BtnOpen />

                {logicMode === true ? <BtnLogicUndoRedo /> : <BtnUndoRedo />}

                {/* <BtnSave /> */}
                {/* <BtnSaveAs /> */}
                {/* <BtnDownload />
                <BtnUpload /> */}
                <BtnSubject />
            </ul>
            <ul className={`nav-center ${logicMode === true ? 'logic' : ''}`}>
                {logicMode === true ? (
                    <TriggerList />
                ) : (
                    <>
                        <li
                            className={`nav-select`}
                            aria-label="선택"
                            title={LANGSET.HEAD.SEL}
                            onClick={setNormalMode}
                        ></li>
                        <BtnSquare />
                        <BtnImage />
                        <BtnAudio />
                        <li
                            className={`nav-movie`}
                            aria-label="동영상"
                            title={LANGSET.HEAD.MOVIE}
                        ></li>
                        <BtnYoutube />
                        <BtnTemplate />
                    </>
                )}
            </ul>
            <ul className="nav-aligns">
                {logicMode !== true && (
                    <>
                        <BtnAlign />
                        <BtnOrder />
                    </>
                )}
                <li
                    className="nav-play"
                    aria-label="재생"
                    onClick={goPreview}
                ></li>
            </ul>
        </>
    );
};

export default Objects;

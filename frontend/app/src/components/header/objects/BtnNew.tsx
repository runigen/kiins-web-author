import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import * as DataStore from '../../../store/DataStore';

const BtnNew = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const LANGSET = userInfo.getLangSet();

    const setNewDoc = (event: React.MouseEvent<HTMLLIElement>) => {
        const folderId = docData.getFolderId();
        DataStore.setFolderId(String(folderId));
        window.open('/new');
    };

    // const emptyDocument = () => {
    //     $(".canvas-sheet").empty();
    //     $(".canvas-sheet-shadow").empty();
    //     workInfo.emptyObjectList();
    // }

    return (
        <>
            <li
                className="nav-new"
                aria-label="새 문서"
                onClick={setNewDoc}
                title={LANGSET.HEAD.NEW_DOC}
            ></li>
        </>
    );
});

export default BtnNew;

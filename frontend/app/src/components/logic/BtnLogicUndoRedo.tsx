import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../store';
import $ from 'jquery';
import { unselectSquareObjcts } from '../../event/SquareEvent';
// import {parsePathname, getUniqId, allEventCancel, cancelBubble} from '../../../../util/common';
// import * as documents from '../../../../util/documents';
// import {IdocInfo, EkeyName} from '../../../../const/types';
// import * as pages from '../../../../util/pages';

import * as logiceditor from '../../util/logiceditor';
import * as dostackLogic from '../../util/dostackLogic';

const BtnLogicUndoRedo = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();
    const undoStackCount = workInfo.getUndoStackCount();
    const undoStackIndex = workInfo.getUndoStackIndex();

    const undo = (event: React.MouseEvent<HTMLLIElement>) => {
        if (event.currentTarget.classList.contains('disabled')) {
            return;
        }
        dostackLogic.undo();
    };
    const redo = (event: React.MouseEvent<HTMLLIElement>) => {
        if (event.currentTarget.classList.contains('disabled')) {
            return;
        }
        dostackLogic.redo();
    };

    return (
        <>
            <li
                className="nav-undo btn-undo-redo undo disabled"
                aria-label="실행취소"
                onClick={undo}
                title="실행취소"
            >
                Undo
            </li>
            <li
                className="nav-redo btn-undo-redo redo disabled"
                aria-label="재실행"
                onClick={redo}
                title="재실행"
            >
                Undo
            </li>
        </>
    );
});

export default BtnLogicUndoRedo;

import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../../store';
import $ from 'jquery';
import { unselectSquareObjcts } from '../../../event/SquareEvent';
// import {parsePathname, getUniqId, allEventCancel, cancelBubble} from '../../../../util/common';
// import * as documents from '../../../../util/documents';
// import {IdocInfo, EkeyName} from '../../../../const/types';
// import * as pages from '../../../../util/pages';
import * as KeyEvent from '../../../event/KeyEvent';
import * as dostack from '../../../util/dostack';

const BtnUndoRedo = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();
    const LANGSET = userInfo.getLangSet();
    const undoStackCount = workInfo.getUndoStackCount();
    const undoStackIndex = workInfo.getUndoStackIndex();

    useEffect(() => {
        document.addEventListener('keydown', addUndoRedoKeyEvent);
        return () => {
            document.removeEventListener('keydown', addUndoRedoKeyEvent);
        };
    }, []);

    useEffect(() => {
        console.log(
            'undoStackCount : ',
            undoStackCount,
            ' undoStackIndex : ',
            undoStackIndex,
        );

        if (undoStackIndex < 1) {
            $('.nav-undo').addClass('disabled');
        } else {
            $('.nav-undo').removeClass('disabled');
        }
        if (undoStackIndex + 1 >= undoStackCount) {
            $('.nav-redo').addClass('disabled');
        } else {
            $('.nav-redo').removeClass('disabled');
        }
    }, [undoStackCount, undoStackIndex]);

    const addUndoRedoKeyEvent = useCallback((event: KeyboardEvent) => {
        const currKeyCode = KeyEvent.getKeyCode(event);
        if (
            ((event.ctrlKey || event.metaKey) &&
                event.shiftKey &&
                currKeyCode === 'z') ||
            (event.ctrlKey && currKeyCode === 'y')
        ) {
            redo();
        } else if ((event.ctrlKey || event.metaKey) && currKeyCode === 'z') {
            undo();
        }
    }, []);

    const undo = () => {
        const logicMode = workInfo.getLogicMode();
        if (logicMode) return; // logic editor 모드에서는 에디터 영역의 undo/redo 불가
        console.log('undo');
        if ($('.nav-undo').hasClass('disabled')) {
            console.log('disable undo');
            return;
        }
        unselectSquareObjcts();
        dostack.undo();
    };
    const redo = () => {
        const logicMode = workInfo.getLogicMode();
        if (logicMode) return; // logic editor 모드에서는 에디터 영역의 undo/redo 불가
        console.log('redo');
        if ($('.nav-redo').hasClass('disabled')) {
            console.log('disable redo');
            return;
        }
        unselectSquareObjcts();
        dostack.redo();
    };

    return (
        <>
            <li
                className="nav-undo disabled"
                aria-label="실행취소"
                onClick={undo}
                title={LANGSET.HEAD.UNDO}
            >
                {LANGSET.HEAD.UNDO}
            </li>
            <li
                className="nav-redo disabled"
                aria-label="재실행"
                onClick={redo}
                title={LANGSET.HEAD.REDO}
            >
                {LANGSET.HEAD.REDO}
            </li>
        </>
    );
});

export default BtnUndoRedo;

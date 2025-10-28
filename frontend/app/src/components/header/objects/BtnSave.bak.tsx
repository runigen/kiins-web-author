import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../../store';
import $ from 'jquery';
import {
    docSubjectDialog,
    hideDialog,
    showToastMessage,
} from '../../../util/dialog';
import { allEventCancel } from '../../../util/common';
import * as documents from '../../../util/documents';
import * as KeyEvent from '../../../event/KeyEvent';

let saveAvailable = true;
let saveAvailableTimer: any = null;
let saveAvailableTime = 10; // sec (지정된 초 내에서 저장버튼을 누르면 저장이 되지 않는다. - docData.modified 와는 별개)

const BtnSave = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();

    useEffect(() => {
        setShortCutKeyEvent();
        // setBeforeUnloadEvent();
        setUnloadEvent();
        documents.setAutoSave();
    }, []);

    // 저장안하고 창이 닫히거나 새로고침 되는 경우 경고창
    const setBeforeUnloadEvent = () => {
        window.addEventListener('beforeunload', e => {
            if (docData.getModified() === true) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    };
    // 창이 닫히거나 새로고침 되는 경우 자동 저장 처리
    const setUnloadEvent = () => {
        window.addEventListener('unload', e => {
            if (docData.getModified() === true) {
                documents.setDocumentBeforeUnload();
            }
        }, false);
    };
    const setShortCutKeyEvent = () => {
        $(document).on('keydown', event => {
            const currKeyCode = KeyEvent.getKeyCode(event);

            if ((event.ctrlKey || event.metaKey) && currKeyCode === 's') {
                setSave();
                allEventCancel(event);
            }
        });
    };
    const setSave = () => {
        const docName = docData.getDocName();

        if (docName === '') {
            console.log('제목');

            docSubjectDialog([
                (formObj: HTMLInputElement) => {
                    console.log('text: ', formObj.value);
                    if (formObj.value.trim() !== '') {
                        docData.setDocName(formObj.value);
                        save();
                        hideDialog();
                    } else {
                        showToastMessage('제목을 입력해주세요.');
                        return;
                    }
                },
                () => {
                    console.log('cancel');
                    hideDialog();
                },
            ]);
        } else {
            save();
        }
    };

    const save = async () => {
        // const docInfo: IdocInfo = {
        //     no: docData.getDocNo(),
        //     name: docData.getDocName(),
        //     content : documents.getDocContentList(),
        // }
        // const rst = documents.saveDocumentInfo(docInfo);
        if (saveAvailable !== true && docData.getModified() === false) {
            showToastMessage(
                '저장은 필요할 때 한번만 하세요(직접 저장하지 않으도 주기적으로 자동 저장됩니다.)',
            );
            return;
        }

        const rst = await documents.saveCurrentDocument();
        if (rst) {
            showToastMessage('저장되었습니다.');

            docData.setModified(false);
            saveAvailable = false;
            if (saveAvailableTimer) {
                clearTimeout(saveAvailableTimer);
            }
            saveAvailableTimer = setTimeout(() => {
                saveAvailable = true;
            }, saveAvailableTime * 1000);
        } else {
            showToastMessage('저장에 실패했습니다.');
        }
    };

    return (
        <>
            <li
                className="nav-save"
                aria-label="저장"
                onClick={setSave}
                title="저장"
            >
                Save
            </li>
        </>
    );
});

export default BtnSave;

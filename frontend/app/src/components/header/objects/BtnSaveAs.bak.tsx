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

const BtnSaveAs = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();

    // useEffect(()=>{
    //     const paramObj = parsePathname(search);
    //     console.log('paramObj : ', paramObj);
    //     setDocInfo(paramObj);
    // }, []);

    // const setDocInfo = (paramObj: any) => {
    //     let docNo = '';
    //     if(paramObj && paramObj.docNo) {
    //         docNo = paramObj.docNo;
    //     } else {
    //         docNo = documents.getNewDocNo();
    //     }
    //     docData.setDocNo(docNo);
    //     $('.nav-save').attr('doc_no', docNo);
    // }

    /**
 * 
 *   if(event.metaKey && currKeyCode === 's') {
                
                allEventCancel(event);
            }

 */

    const setSaveAs = () => {
        const docName = docData.getDocName();
        const docNo = docData.getDocNo();
        docSubjectDialog(
            [
                (formObj: HTMLInputElement) => {
                    console.log('text: ', formObj.value);
                    if (formObj.value.trim() !== '') {
                        hideDialog();
                        saveAs(docNo, formObj.value.trim());
                    } else {
                        showToastMessage('제목을 입력해주세요.');
                        formObj.focus();
                        return;
                    }
                },
                () => {
                    console.log('cancel');
                    hideDialog();
                },
            ],
            'Save as...',
            docName + '의 사본',
        );
    };

    const saveAs = async (docNo: string, docName: string) => {
        const rst = await documents.saveCurrentDocument().catch(err => {
            console.log('saveAs err : ', err);
            showToastMessage('저장에 실패했습니다.');
            return false;
        });
        if (rst) {
            console.log('save as go');
            const newDocNo = await documents
                .saveAsDocument(docNo)
                .catch(err => {
                    console.log('saveAs err : ', err);
                    showToastMessage('저장에 실패했습니다.');
                    return '';
                });
            if (newDocNo !== '') {
                window.open('/' + newDocNo);
                return;
            }
        } else {
            showToastMessage('저장에 실패했습니다.');
        }
    };

    return (
        <>
            <li
                className="nav-saveas"
                aria-label="다른이름으로 저장하기"
                onClick={setSaveAs}
                title="다른이름으로 저장하기"
            >
                BtnSaveAs
            </li>
        </>
    );
});

export default BtnSaveAs;

import React from 'react';
import store from '../../../store';
import * as documents from '../../../util/documents';
import * as KeyEvent from '../../../event/KeyEvent';
import {
    // docSubjectDialog,
    // hideDialog,
    showToastMessage,
} from '../../../util/dialog';
import { EkeyName } from '../../../const/types';
import * as CommonEvent from '../../../event/CommonEvent';

const BtnSubject = () => {
    const { docData } = store;
    const docName = docData.getDocName();

    // docName 이 변경될때 저장 실행
    // useEffect(() => {
    //     if(docName === '' || docName === undefined) return;
    //     saveDocument();
    //     console.log('BtnSubject docName : ', docName);
    //     return () => {
    //         console.log('BtnSubject useEffect return');
    //     }
    // }, [docName]);

    const setFocusSubject = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log('setFocusSubject');
        CommonEvent.unselectObjects();
        event.currentTarget.focus();
        event.currentTarget.select();
    };
    const setKeyDownEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log('setKeyDownEvent');
        const currKeyCode = KeyEvent.getKeyCode(event);
        if (currKeyCode === EkeyName.ENTER) {
            event.currentTarget.blur();
        }
    };
    const setKeyUpEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // console.log('setKeyUpEvent');
        // const subjectVal = event.currentTarget.value.trim();
        // if (subjectVal !== '') {
        //     docData.setDocName(subjectVal);
        // }
        const inputVal = event.currentTarget.value;
        event.currentTarget.value = inputVal.replace(
            /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s\-_.()[\]]/gi,
            '',
        );
    };
    const setKeyBlurEvent = async (
        event: React.FocusEvent<HTMLInputElement>,
    ) => {
        console.log('btnSubject setKeyBlurEvent');

        const orgSubject = docData.getDocName();
        const subjectVal = event.currentTarget.value.trim();
        event.currentTarget.value = subjectVal;

        if (subjectVal === '') {
            event.currentTarget.value = orgSubject;
            showToastMessage('문서 제목을 입력해주세요.', 1);
        } else if (subjectVal !== orgSubject) {
            docData.setDocName(subjectVal);
            saveDocument();
        }
    };
    const saveDocument = async () => {
        console.log('btnSubject saveDocument');
        const rst = await documents.saveCurrentDocument().catch(err => {
            console.log('btnSubject saveDocument err : ', err);
            return false;
        });
        if (!rst) {
            showToastMessage('문서 제목 저장에 실패했습니다.', 1);
            return;
        }
        showToastMessage('문서 제목이 변경되었습니다.', 1);
    };

    return (
        <>
            <li className="nav-subject">
                <input
                    type="text"
                    className="nav-subject-input"
                    defaultValue={docName}
                    onFocus={setFocusSubject}
                    onKeyDown={setKeyDownEvent}
                    onKeyUp={setKeyUpEvent}
                    onBlur={setKeyBlurEvent}
                />
            </li>
        </>
    );
};

export default BtnSubject;

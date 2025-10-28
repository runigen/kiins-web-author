import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
// import $ from 'jquery';
// import * as ImageEvent from '../../../../event/ImageEvent';
// import {basicAlertDialog} from '../../../../util/dialog';
// import * as FileEvent from '../../../../event/FileEvent';
// import * as SquareEvent from '../../../../event/SquareEvent';
// import {allEventCancel} from '../../../../util/common';
import { IdocInfo } from '../../../const/types';
import * as documents from '../../../util/documents';
import { basicAlertDialog, showToastMessage } from '../../../util/dialog';

const BtnUpload = observer(() => {
    const { userInfo, docData, workInfo } = store;

    useEffect(() => {}, []);

    const attachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        showToastMessage('업로드기능은 준비중입니다.');

        // if (event.target.files) {
        //     const file = event.target.files[0];
        //     const fileReader = new FileReader();
        //     fileReader.onload = () => {
        //         console.log(fileReader.result);
        //         if (fileReader.result !== '') {
        //             const docInfo: IdocInfo = JSON.parse(
        //                 String(fileReader.result),
        //             );
        //             saveAndOpen(docInfo);
        //         }
        //     };
        //     fileReader.readAsText(file);
        // } else {
        //     console.log('file error');
        // }
        // event.target.value = '';
    };

    const saveAndOpen = async (docInfo: IdocInfo) => {
        // 새문서번호로 저장
        docInfo.no = documents.getNewDocNo();
        const rst = await documents.saveDocumentInfo(docInfo);
        if (rst) {
            basicAlertDialog('업로드한 문서를 새창으로 엽니다.', () => {
                window.open('/' + docInfo.no);
            });
        } else {
            showToastMessage('업로드문서를 로드하는중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <li className="nav-upload" aria-label="문서업로드">
                <input type="file" accept=".zip" onChange={attachFile}></input>
            </li>
        </>
    );
});

export default BtnUpload;

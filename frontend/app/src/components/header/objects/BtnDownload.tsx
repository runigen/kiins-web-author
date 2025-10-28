import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../../store';
import { showToastMessage } from '../../../util/dialog';
import * as documents from '../../../util/documents';
import { IdocInfo } from '../../../const/types';
import * as FileEvent from '../../../event/FileEvent';
import * as DataStore from '../../../store/DataStore';

const BtnDownload = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();

    useEffect(() => {}, []);

    const downloadDocument = () => {
        const docInfo: IdocInfo = {
            no: docData.getDocNo(),
            name: docData.getDocName(),
            userId: DataStore.getUserId(),
            docContentList: docData.getDocContentsList(),
        };
        console.log(docInfo);
        if (docInfo.name === '') {
            showToastMessage('문서를 먼저 저장해주세요.');
            return;
        }

        //CreateZip(docInfo);
        // downloadDocumentFile(JSON.stringify(docInfo), docInfo.name + '.mwc');
        FileEvent.downloadDocumentFile(
            JSON.stringify(docInfo),
            docData.getDocNo(),
            docData.getDocName(),
        );
    };

    /*
    const CreateZip = (docInfo:  IdocInfo) => {

        const zip = new JSZip(); // ZIP 객체 생성
    
        //zip.folder("HelloZip").file('꾸생.txt', "Hello 꾸생!\n"); //HelloZip 폴더에 꾸생.txt 생성 <- 폴더예제
        zip.file(docInfo.name+'.mwc', JSON.stringify(docInfo));
    
        zip.generateAsync({type:"blob"}) //압축파일 생성
        .then((resZip) => {            
            download(resZip, docInfo.name+".zip");    
        });
        
    };

    const download = (resZip:Blob, filename: string) => {
        const url = URL.createObjectURL(resZip);
        const aTag = document.createElement('a');
        aTag.download = filename;
        aTag.href= url;
        aTag.click();
    };
    */

    const downloadDocumentFile = (data: string, filename: string) => {
        var fileObj = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(fileObj);
        const aTag = document.createElement('a');
        aTag.download = filename;
        aTag.href = url;
        aTag.click();
    };

    return (
        <>
            <li
                className="nav-download"
                aria-label="내려받기"
                onClick={downloadDocument}
                title="내려받기"
            >
                Download
            </li>
        </>
    );
});

export default BtnDownload;

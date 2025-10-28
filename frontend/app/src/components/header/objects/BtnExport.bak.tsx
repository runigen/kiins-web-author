import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../../store';
import { showToastMessage } from '../../../util/dialog';
import * as documents from '../../../util/documents';
import { IdocInfo } from '../../../const/types';
import * as FileEvent from '../../../event/FileEvent';
import * as DataStore from '../../../store/DataStore';

const BtnExport = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();

    useEffect(() => {}, []);

    const exportDocument = () => {
        const docInfo: IdocInfo = {
            no: docData.getDocNo(),
            name: docData.getDocName(),
            userId: DataStore.getUserId(),
            docContentList: documents.getDocViewerContentList(),
        };
        console.log(docInfo);
        if (docInfo.name === '') {
            showToastMessage('문서를 먼저 저장해주세요.');
            return;
        }

        //CreateZip(docInfo);
        // exportDocumentFile('window.globalContent = ' + JSON.stringify(docInfo), docData.getDocNo());
        // const docContentString = documents.replaceDocImagePathAll(docInfo.no, JSON.stringify(docInfo));
        const docContentString = JSON.stringify(docInfo);
        FileEvent.exportDocumentFile(
            'window.globalContent = ' + docContentString,
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

    // const exportDocumentFile = (data: string, docNo: string) => {
    //     console.log('exportDocumentFile');
    //     var fileObj = new Blob([data], {type: 'text/plain'});
    //     FileEvent.exportDocumentFile(fileObj, docNo);
    // };

    return (
        <>
            <li
                className="nav-export"
                aria-label="내보내기"
                onClick={exportDocument}
                title="내보내기"
            >
                Export
            </li>
        </>
    );
});

export default BtnExport;

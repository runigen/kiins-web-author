import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../../store';
import {
    showToastMessage,
    basicAlertDialog,
    basicConfirmDialog,
} from '../../../util/dialog';
import * as documents from '../../../util/documents';
import { IdocInfo } from '../../../const/types';
import * as FileEvent from '../../../event/FileEvent';
import * as DataStore from '../../../store/DataStore';

const BtnExportAll = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();
    const apiServer = process.env.REACT_APP_API_SERVER;

    useEffect(() => {}, []);

    const exportAll = () => {
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
        FileEvent.exportAll(
            'window.globalContent = ' + docContentString,
            docData.getDocNo(),
            docData.getDocName(),
        );
        const viewerUrl = `${apiServer}/${docInfo.no}/${docInfo.name}.html`;
        basicConfirmDialog(
            '내보내기',
            `웹페이지를 통해서도 확인이 가능합니다.|웹페이지를 여시겠습니까?`,
            [
                () => {
                    navigator.clipboard.writeText(viewerUrl);
                    window.open(viewerUrl, '_blank', 'noopener,noreferrer');
                },
                () => {},
            ],
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
                className="nav-export-all"
                aria-label="뷰어내보내기"
                onClick={exportAll}
                title="뷰어내보내기"
            >
                Export All
            </li>
        </>
    );
});

export default BtnExportAll;

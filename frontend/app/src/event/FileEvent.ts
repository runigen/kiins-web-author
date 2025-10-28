import React from 'react';
// import $ from 'jquery';
import { IfileInfo, EimageAddType, EobjectType } from '../const/types';
// import keyName, { getKeyCode } from './KeyEvent';
// import * as KeyEvent from './KeyEvent';
import * as CommonEvent from './CommonEvent';
import workInfo from '../store/workInfo';
import docData from '../store/docData';
import {
    showToastMessage,
    // hideToastMessage,
    showLoading,
    hideLoading,
} from '../util/dialog';
import * as common from '../util/common';
// import * as dostack from '../util/dostack';
import * as AudioEvent from './AudioEvent';
import * as ImageEvent from './ImageEvent';
import axios from 'axios';
import * as objects from '../util/objects';
import { createTextBox } from '../util/texteditor';
// import { getCanvasObject, getWorkspace } from '../util/pages';

// let uploadFileList = [];
const fileUploadUrl = process.env.REACT_APP_FILEUPLOAD_URL || '';
const fileExportUrl = process.env.REACT_APP_FILEEXPORT_URL || '';
const fileExportAllUrl = process.env.REACT_APP_FILEEXPORTALL_URL || '';
const docDownloadUrl = process.env.REACT_APP_DOCDOWNLOAD_URL || '';
const pdfUploadUrl = process.env.REACT_APP_PDFUPLOAD_URL || '';
// const resourceDeleteUrl = process.env.REACT_APP_RESOURCE_DELETE_URL || '';

export const executeFileDrop = (
    event: React.DragEvent,
    insertType: EimageAddType = EimageAddType.add,
) => {
    console.log('Event executeFileDrop');

    // const files = (event.target as HTMLInputElement).files;

    try {
        if (
            typeof event.dataTransfer.files === 'undefined' ||
            event.dataTransfer.files == null
        ) {
            showToastMessage('지원하지 않는 브라우저 입니다.');
            return;
        }

        // -- 리소스에서 드래그 한 경우 체크
        if (event.dataTransfer.files.length === 0) {
            dropFromResource(event);
            return;
        }

        //업로드 실행
        executeUpload(event, insertType);
    } catch (e) {
        console.log('addFileDropEvent error : ', e);
    }
};

export const executeUpload = (
    event: any,
    insertType: EimageAddType = EimageAddType.add,
) => {
    const docNo = docData.getDocNo();
    if (docNo === '') {
        showToastMessage('문서를 먼저 저장해 주세요.');
        return;
    }

    //const currObject = workInfo.getObject();
    const currObject = workInfo.getObject();

    const files = event.target.files || event.dataTransfer.files;
    let order = -1;
    let uploadedCnt = 0;
    const totalUploadCnt = files.length;
    if (totalUploadCnt === 0) return;

    // pdf 파일은 1개만 업로드 가능
    if (files.length > 1) {
        const pdfFiles: any[] = Array.from(files).filter((file: any) =>
            checkPdfType(file.type),
        );
        if (pdfFiles.length >= 1) {
            showToastMessage('pdf 파일은 1개만 업로드 가능합니다.');
            return;
        }
    }

    let isPdf = false;
    if (files.length === 1 && checkPdfType(files[0].type) === true) {
        isPdf = true;
    }

    showLoading();

    for (let i = 0; i < files.length; i++) {
        // const fileNm = files[i].name;
        // const fileExt = fileNm.substring(fileNm.lastIndexOf('.') + 1);
        // const fileType = files[i].type;
        // console.log('fileNm : ', fileNm);
        // console.log('fileType : ', fileType);
        const formData = new FormData();

        if (isPdf === true) {
            formData.append('file', files[i]);
            formData.append('pdf_id', docNo);
        } else {
            formData.append('files', files[i]);
            formData.append('no', docNo);
        }

        // showToastMessage('File Uploading...', 30);
        axios({
            method: 'post',
            url: isPdf === true ? pdfUploadUrl : fileUploadUrl,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(result => {
                console.log('executeUpload result.data : ', result.data);
                // if (result.data.resp_cd === '100') {
                if (String(result.data.code) === '200') {
                    order++;

                    if (isPdf !== true) {
                        const fileInfo = result.data.data as IfileInfo;
                        console.log('fileInfo : ', fileInfo);
                        const objectGroup = workInfo.getObjectGroup();
                        if (
                            objectGroup.length &&
                            insertType === EimageAddType.replace
                        ) {
                            objectGroup.forEach((obj: any) => {
                                ImageEvent.changeObjectImage(obj, fileInfo);
                            });
                        } else if (
                            currObject === null &&
                            insertType === EimageAddType.page
                        ) {
                            ImageEvent.changePageImage(fileInfo);
                        } else if (insertType === EimageAddType.add) {
                            addFileUrlToCanvas(fileInfo, order, event);
                        }
                    } else {
                        console.log('============== isPDF ==============');
                    }
                }
                uploadedCnt++;
                if (uploadedCnt >= totalUploadCnt) {
                    hideLoading();
                    docData.setFileUpdateKey();
                }
            })
            .catch(e => {
                uploadedCnt++;
                if (uploadedCnt >= totalUploadCnt) {
                    hideLoading();
                }
                showToastMessage('업로드중 오류가 발생 했습니다.');
                console.log('executeUpload error : ', e);
            });
    }
};

// 우측 리소스영억에서 리소스를 캔버스영역으로 드롭 한 경우
const dropFromResource = (event: React.DragEvent) => {
    try {
        const dragObjId = event.dataTransfer.getData('text/plain');
        console.log('drop_handler id : ', dragObjId);
        if (dragObjId === '') return;

        const resourceContainer = document.querySelector(
            '.section-resources .resource-container',
        ) as HTMLDivElement;
        if (resourceContainer === null) return;

        const dragObj = resourceContainer.querySelector(
            '#' + dragObjId,
        ) as HTMLDivElement;
        if (dragObj === null) return;

        const fileInfo: IfileInfo | null = common.parseJsonData(
            dragObj.getAttribute('fileinfo'),
        ) as IfileInfo | null;
        if (fileInfo === null) return;

        common.allEventCancel(event);

        const objectGroup = workInfo.getObjectGroup();
        if (objectGroup.length && checkImageType(fileInfo.mimeType)) {
            objectGroup.forEach((obj: any) => {
                ImageEvent.changeObjectImage(obj, fileInfo);
            });
        } else {
            CommonEvent.unselectObjects();
            addFileUrlToCanvas(fileInfo, 0, event);
        }
    } catch (e) {
        console.log('executeFileDrop error : ', e);
    }
};

/**
 * 
 * @param fileInfo = {
        ext: "png"
        filename: "resize-99-834088.png"
        mimetype: "image/png"
        name: "resize-99-834088"
        url: "http://localhost:8088/attach_images/resize-99-834088.png"
  }
 * @param {*} order : 동시에 여러개의 이미지가 삽입되는경우 계단식으로 삽입하기 위한 순서
 * @returns void
 */

const addFileUrlToCanvas = (
    fileInfo: IfileInfo,
    order = 0,
    event: React.DragEvent,
) => {
    console.log('addFileUrlToCanvas : ', fileInfo);
    if (checkImageType(fileInfo.mimeType)) {
        ImageEvent.addImageObject(fileInfo, order, event);
        return;
    }
    if (checkAudioType(fileInfo.mimeType)) {
        AudioEvent.addAudioObject(fileInfo, order, event);
        return;
    }
    if (checkTextType(fileInfo.mimeType)) {
        workInfo.setShowPdfTextList(true, fileInfo.url);
        return;
    }

    showToastMessage('파일 형식이 맞지 않습니다.');
};

const checkImageType = (type: string) => {
    const imageTypeList = [
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/bmp',
    ];
    const fileType = imageTypeList.find(
        currType => currType === type.toLowerCase(),
    );
    if (typeof fileType === 'undefined') {
        return false;
    } else {
        return true;
    }
};
const checkAudioType = (type: string) => {
    const audioTypeList = [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/x-wav',
        'audio/x-pn-wav',
        'audio/ogg',
        'audio/webm',
    ];
    const fileType = audioTypeList.find(
        currType => currType === type.toLowerCase(),
    );
    if (typeof fileType === 'undefined') {
        return false;
    } else {
        return true;
    }
};
const checkPdfType = (type: string) => {
    const pdfType = 'application/pdf';
    if (pdfType === type.toLowerCase()) {
        return true;
    } else {
        return false;
    }
};
const checkTextType = (type: string) => {
    if (type.toLowerCase() === 'text/plain') {
        return true;
    } else {
        return false;
    }
};

// 문서전체 데이터 다운로드 하기  (json, 리소스, html)
export const downloadDocumentFile = (
    fileContent: string,
    docNo: string,
    docName: string,
) => {
    console.log('downloadDocumentFile');

    // const fileObj = new Blob([fileContent], {type: 'text/plain'});
    const fileObj = new File([fileContent], `${docNo}.json`, {
        type: 'text/plain',
    });

    const formData = new FormData();
    formData.append('doc_file', fileObj);
    formData.append('doc_no', docNo);
    formData.append('doc_name', docName);

    //showToastMessage('File Export...', 30);
    showLoading();

    axios({
        method: 'post',
        url: docDownloadUrl,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
    })
        .then(result => {
            hideLoading();

            const fileObj = new Blob([result.data]);
            const url = URL.createObjectURL(fileObj);
            const aTag = document.createElement('a');
            // aTag.download = docNo + '.zip';
            aTag.download = docName + '.zip';
            aTag.href = url;
            aTag.click();
        })
        .catch(e => {
            hideLoading();
            showToastMessage('내보내기 중 오류가 발생 했습니다.');
            console.log(e);
        });
};

// 문서데이터만 내보내기 (js, 리소스, html)
export const exportDocumentFile = (
    fileContent: string,
    docNo: string,
    docName: string,
) => {
    console.log('exportDocumentFile');

    // const fileObj = new Blob([fileContent], {type: 'text/plain'});
    const fileObj = new File([fileContent], `${docNo}.js`, {
        type: 'text/plain',
    });

    const formData = new FormData();
    formData.append('doc_file', fileObj);
    formData.append('doc_no', docNo);
    formData.append('doc_name', docName);

    //showToastMessage('File Export...', 30);
    showLoading();

    axios({
        method: 'post',
        url: fileExportUrl,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
    })
        .then(result => {
            hideLoading();

            const fileObj = new Blob([result.data]);
            const url = URL.createObjectURL(fileObj);
            const aTag = document.createElement('a');
            aTag.download = docNo + '.zip';
            aTag.href = url;
            aTag.click();
        })
        .catch(e => {
            hideLoading();
            showToastMessage('내보내기 중 오류가 발생 했습니다.');
            console.log(e);
        });
};

// 전체 내보내기 (js, 리소스, html + 뷰어)
export const exportAll = (
    fileContent: string,
    docNo: string,
    docName: string,
) => {
    console.log('exportAll');

    // const fileObj = new Blob([fileContent], {type: 'text/plain'});
    const fileObj = new File([fileContent], `${docNo}.js`, {
        type: 'text/plain',
    });

    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('no', docNo);

    //showToastMessage('File Export...', 30);
    showLoading();

    axios({
        method: 'post',
        url: fileExportAllUrl,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
    })
        .then(result => {
            hideLoading();

            const fileObj = new Blob([result.data]);
            const url = URL.createObjectURL(fileObj);
            const aTag = document.createElement('a');
            // aTag.download = `${docName}.zip`;
            aTag.download = 'meeoocat-viewer.zip';
            aTag.href = url;
            aTag.click();
        })
        .catch(e => {
            hideLoading();
            showToastMessage('내보내기 중 오류가 발생 했습니다.');
            console.log(e);
        });
};

// 원본문서 내려받기
export const downloadDoc = (
    fileContent: string,
    docNo: string,
    docName: string,
) => {
    console.log('downloadDoc');

    // const fileObj = new Blob([fileContent], {type: 'text/plain'});
    const fileObj = new File([fileContent], `${docNo}.js`, {
        type: 'text/plain',
    });

    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('no', docNo);

    //showToastMessage('File Export...', 30);
    showLoading();

    axios({
        method: 'post',
        url: fileExportAllUrl,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
    })
        .then(result => {
            hideLoading();

            const fileObj = new Blob([result.data]);
            const url = URL.createObjectURL(fileObj);
            const aTag = document.createElement('a');
            // aTag.download = `${docName}.zip`;
            aTag.download = `${docNo}.zip`;
            // aTag.download = 'meeoocat-viewer.zip';
            aTag.href = url;
            aTag.click();
        })
        .catch(e => {
            hideLoading();
            showToastMessage('내보내기 중 오류가 발생 했습니다.');
            console.log(e);
        });
};

import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import { allEventCancel } from '../../../util/common';
import * as FileEvent from '../../../event/FileEvent';
import * as CommonEvent from '../../../event/CommonEvent';
import $ from 'jquery';
import * as pages from '../../../util/pages';
import * as documents from '../../../util/documents';
import * as dostack from '../../../util/dostack';
import { EundoStackAddType, ETemplateType } from '../../../const/types';
import TextTools from './texttools/TextTools';
// import * as basicData from '../../../const/basicData';

const Canvas = observer(() => {
    const { docData, workInfo } = store;
    const docNo = docData.getDocNo();
    const docName = docData.getDocName();
    // const objectGroup = workInfo.getObjectGroup();
    const currPageNo = docData.getCurrPage();
    // const docContentsList = docData.getDocContentsList();
    const docUpdateKey = docData.getDocUpdateKey();
    let pageObj: HTMLDivElement | null = null;

    useEffect(() => {
        const canvasDragAreaObj = pages.getCanvasDropAreaObject();
        addFileDragEvents(canvasDragAreaObj);
        return () => {
            removeFileDragEvents(canvasDragAreaObj);
        };
    }, []);

    useEffect(() => {
        console.log('docNo : ', docNo);
        if (docNo) {
            documents.loadDocument(docNo);
            // docData.setCurrPage(1);
        }
    }, [docNo]);

    useEffect(() => {
        console.log('docUpdateKey currPageNo : ', currPageNo);
        // -- page 변경시 처리
        // 1. 셀렉션 해제
        CommonEvent.unselectObjects();

        // 2. 페이지 데이터 로드
        if (currPageNo > 0) {
            loadPageData(currPageNo);
        }
    }, [currPageNo, docUpdateKey]);

    const loadPageData = (pageNo: number) => {
        if (pageNo > 0) {
            CommonEvent.removeSelectors();

            const docContent = docData.getDocContent(pageNo);
            $('#idx_canvas_sheet').html(docContent.docPageContent);

            pageObj = pages.getPageObject();
            if (pageObj) {
                // docName 이 없으면 생성
                if (docName === '') {
                    // setDefaultPageInfo(pageNo);
                    setDefaultPageName(pageNo);
                }

                // 캔버스크기 대비 워크스페이스를 더 크게 설정
                pages.setWorkSpaceMinSize();

                // addFileDragEvents(pageObj);
                docData.setPageObject(pageObj);

                const tplType = pages.getTplType();
                docData.setTemplateMode(tplType);

                // 페이지 데이터 삽입 후 페이지 정보 업데이트
                workInfo.setUpdateKey();

                dostack.addUndoStack('', EundoStackAddType.load);
            }

            // const canvasDragAreaObj = pages.getCanvasDropAreaObject();
            // if (canvasDragAreaObj) {
            //     addFileDragEvents(canvasDragAreaObj);

            // }

            documents.initializeObjects();

            // 최초 페이지 로드시 오브젝트 기본정보 로드하기위해 호출
            workInfo.setModifiedKeyframe();
            workInfo.setModifiedOrderNo();
        }
    };

    // useEffect(()=>{

    //     console.log('--------objectGroup----------', objectGroup);

    // }, [objectGroup]);

    // const loadDocument = (docNo: string) => {
    //     documents.loadDocument(docNo);
    // };

    // const setDefaultPageInfo = (pageNo: number) => {
    //     pages.setPageName('Page-' + (pageNo > 9 ? pageNo : '0' + pageNo));
    //     pages.setPageSize(null, false);
    //     pages.setPageBackColor('#ffffff', false);
    // };
    const setDefaultPageName = (pageNo: number) => {
        pages.setPageName('Page-' + (pageNo > 9 ? pageNo : '0' + pageNo));
    };

    const addFileDragEvents = (divObj: HTMLDivElement) => {
        if (divObj === null) return;
        divObj.addEventListener('dragenter', addFileDragEnterEvent);
        divObj.addEventListener('dragover', addFileDragOverEvent);
        divObj.addEventListener('drop', addFileDropEvent);
        divObj.addEventListener('dragleave', addFileDragLeaveEvent);
        divObj.addEventListener('dragend', addFileDragEndEvent);
    };
    const removeFileDragEvents = (divObj: HTMLDivElement) => {
        if (divObj === null) return;
        divObj.removeEventListener('dragenter', addFileDragEnterEvent);
        divObj.removeEventListener('dragover', addFileDragOverEvent);
        divObj.removeEventListener('drop', addFileDropEvent);
        divObj.removeEventListener('dragleave', addFileDragLeaveEvent);
        divObj.removeEventListener('dragend', addFileDragEndEvent);
    };
    const addFileDragEnterEvent = () => {
        console.log('canvasObj addFileDragEnterEvent');
        // allEventCancel(event);
    };
    const addFileDragOverEvent = (event: any) => {
        // console.log("canvasObj addFileDragOverEvent");
        allEventCancel(event);
    };
    const addFileDropEvent = (event: any) => {
        FileEvent.executeFileDrop(event);
        $('#idx_canvas_drop_area').hide();
        allEventCancel(event);
    };
    const addFileDragLeaveEvent = () => {
        // console.log("canvasObj addFileDragLeaveEvent");
        // allEventCancel(event);
        $('#idx_canvas_drop_area').hide();
    };
    const addFileDragEndEvent = () => {
        $('#idx_canvas_drop_area').hide();
    };

    return (
        <>
            <div className="canvas-container center" id="idx_canvas_container">
                <div className="canvas-sheet trans" id="idx_canvas_sheet">
                    <div
                        className="page"
                        {...{
                            'object-type': 'page',
                            'tpl-type': ETemplateType.none,
                        }}
                    ></div>
                </div>
                <div
                    className="canvas-sheet-shadow"
                    id="idx_canvas_sheet_shadow"
                ></div>
            </div>
            {/* texttools는 캔버스 zoom 의 영향을 안받게 하기 위해 canvas-container 내에 두지 않는다. */}
            <div className="text-tools-shadow" id="idx_text_tools_shadow">
                <TextTools />
            </div>
            <div className="canvas-drop-area" id="idx_canvas_drop_area"></div>
        </>
    );
});

export default Canvas;

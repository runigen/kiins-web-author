import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import $ from 'jquery';
import * as pages from '../../../util/pages';
import * as documents from '../../../util/documents';
import * as dialog from '../../../util/dialog';
import { allEventCancel, cancelBubble } from '../../../util/common';
import { getParentElement } from '../../../util/texteditor';

const Pages = observer(() => {
    const { docData } = store;
    const currPage = docData.getCurrPage();
    const totalPage = docData.getTotalPage();
    const docContentsList = docData.getDocContentsList();
    const [selectPageNoList, setSelectPageNoList] = useState<number[]>([]);

    useEffect(() => {
        console.log('Pages useEffect');
        console.log('Pages selectPageNoList : ', selectPageNoList);
        removeUnselectEvent();
        if (selectPageNoList.length > 0) {
            addUnselectEvent();
        }
    }, [selectPageNoList.length]);

    const addUnselectEvent = () => {
        console.log('Pages addUnselectEvent');
        document.addEventListener('mousedown', unselectPages);
    };
    const removeUnselectEvent = () => {
        console.log('Pages removeUnselectEvent');
        document.removeEventListener('mousedown', unselectPages);
    };
    const unselectPages = (event: MouseEvent) => {
        const targetObj = event.target as HTMLElement;
        if (!targetObj) return;

        // 부모가 doc-box 인 곳을 클릭하려 경우 선택된 페이지 유지
        if (getParentElement(targetObj, 'div', 'doc-box')) return;
        // 삭제 버튼을 클릭할 경우 선택된 페이지 유지
        if (targetObj.classList.contains('btn-del')) return;

        // const targetClassList = targetObj.classList;
        // if (targetClassList.contains('doc_thumb')) return;
        // if (targetClassList.contains('btn-del')) return;
        // if (targetClassList.contains('doc_header')) return;
        // if (targetClassList.contains('doc-box')) return;

        // 위 경위가 아닌 경우 선택된 페이지 해제
        initSelectedPages();
    };

    const changePage = (pageNo: number, e: any) => {
        console.log('Pages changePage : ', pageNo);

        // shift 키 입력시 페이지 이동하지 않고 선택한 페이지 체크
        if (e.shiftKey) {
            console.log('Pages changePage shiftKey');
            addSelectPageNo(pageNo);
            cancelBubble(e);
            return;
        }

        // 페이지 변경하기 전, 현재 페이지 데이터 저장(docData)
        documents.setCurrentDocContent();
        docData.setCurrPage(pageNo);
        setSelectPageNoList([]);
    };

    const addSelectPageNo = (pageNo = 0) => {
        console.log('Pages addSelectPageNo pageNo : ', pageNo);
        if (pageNo === 0) return;
        // 선택한 페이지가 이미 선택되어 있는지 확인하고 선택되어 있으면 선택 해제, 선택되어 있지 않으면 선택
        setSelectPageNoList(selectPageNoList =>
            selectPageNoList.includes(pageNo)
                ? selectPageNoList.filter(item => item !== pageNo)
                : [...selectPageNoList, pageNo],
        );
    };

    const addNewPage = () => {
        pages.addNewPage();
        docData.setModified(true);
    };
    const copyPage = () => {
        console.log('copyNewPage');
        pages.copyPage();
        docData.setModified(true);
    };

    const removePage = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget.classList.contains('disabled')) return;

        // const selectedPageCnt = $('.doc_thumb.select').length;
        const selectedPageCnt = selectPageNoList.length;
        console.log('removePage selectedPageCnt : ', selectedPageCnt);

        dialog.basicConfirmDialog(
            '페이지 삭제',
            selectedPageCnt > 0
                ? `선택된 ${selectedPageCnt}개의 페이지를 삭제하시겠습니까?`
                : '현재 페이지를 삭제하시겠습니까?',
            [
                () => {
                    const removePageContainerList =
                        selectedPageCnt > 0
                            ? $('.doc-list .doc-box.select')
                            : $('.doc-list .doc-box.active');
                    // removePageContainerList.slideUp(300, () => {
                    //     console.log('slide up'); // 앨리먼트 개수만큼 실행됨.
                    //     pages.removePage(
                    //         selectedPageCnt > 0 ? selectPageNoList : [currPage],
                    //     );
                    //     docData.setModified(true);
                    //     initSelectedPages();
                    // });
                    // removePageContainerList.hide();

                    removePageContainerList.slideUp(300);
                    setTimeout(() => {
                        pages.removePage(
                            selectedPageCnt > 0 ? selectPageNoList : [currPage],
                        );
                        docData.setModified(true);
                        initSelectedPages();
                    }, 300);
                },
                () => {
                    console.log('cancel');
                    initSelectedPages();
                },
            ],
        );
        cancelBubble(event);
    };

    const pageDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        const dragObj = event.currentTarget;
        if (!dragObj) return;
        const pageNo = dragObj.getAttribute('pageno');
        if (!pageNo) return;
        console.log('pageDragStart pageNo :  ', pageNo);
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.setData('text/plain', pageNo);
    };
    const pageDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('pageDragEnter');

        const refPageObj = event.currentTarget;
        if (!refPageObj) return;
        const pageNo = refPageObj.getAttribute('pageno');
        if (!pageNo) return;
        console.log('pageDragEnter bottomPageObj pageNo :  ', pageNo);
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        hidePageSpace();

        const docHeaderObj = refPageObj.querySelector(
            '.doc_header',
        ) as HTMLDivElement;
        if (!docHeaderObj) return;
        $(docHeaderObj).addClass('active');
    };
    const pageDrop = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('pageDrop');
        allEventCancel(event);
        hidePageSpace();

        const refPageObj = event.currentTarget;
        if (!refPageObj) return;
        const refPageNo = Number(refPageObj.getAttribute('pageno'));
        if (!refPageNo) return;
        console.log('refPageNo pageNo : ', refPageNo);

        const data = event.dataTransfer.getData('text/plain');
        const dragPageNo = Number(data);
        console.log('dragPageNo pageNo : ', dragPageNo);

        if (refPageNo === dragPageNo) return;

        if (refPageNo < dragPageNo) {
            docData.moveDocContent(dragPageNo - 1, refPageNo - 1);
            docData.setCurrPage(refPageNo);
        } else {
            docData.moveDocContent(dragPageNo - 1, refPageNo - 2);
            docData.setCurrPage(refPageNo - 1);
        }

        docData.setModified(true);
    };
    const dragEnd = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('dragEnd event : ', event);
        hidePageSpace();
    };
    const hidePageSpace = () => {
        $('.doc-list .doc_header').removeClass('active');
    };
    const dragover_handler = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const initSelectedPages = () => {
        setSelectPageNoList([]);
    };

    return (
        <>
            <div className="doc-btns">
                <button
                    className="btn-add"
                    onClick={addNewPage}
                    title="아래에 빈 페이지 추가"
                >
                    Add
                </button>
                <button
                    className="btn-copy"
                    onClick={copyPage}
                    title="현재페이지 복사하여 아래에 추가"
                >
                    Copy
                </button>
                <button
                    className={`btn-del ${
                        totalPage < 2 || selectPageNoList.length >= totalPage
                            ? 'disabled'
                            : ''
                    }`}
                    title="현재페이지 삭제"
                    onClick={removePage}
                >
                    Delete
                </button>
            </div>
            <div className="doc-list">
                {docContentsList.map((docContent: any, index: number) => (
                    <div
                        key={`${docContent.docPageId}`}
                        className={
                            'doc-box' +
                            (currPage === index + 1 ? ' active' : '') +
                            (selectPageNoList.includes(index + 1)
                                ? ' select'
                                : '')
                        }
                        onDragEnter={pageDragEnter}
                        {...{
                            pageno: index + 1,
                            pagename: docContent.docPageName,
                        }}
                        onDragOver={dragover_handler}
                        onDrop={pageDrop}
                    >
                        <span>{index + 1}</span>
                        <div
                            className="doc"
                            onMouseDown={e => changePage(index + 1, e)}
                        >
                            <div className="doc_header">
                                {docContent.docPageName}
                            </div>
                            <div
                                // className={`doc_thumb ${
                                //     selectPageNoList.includes(index + 1)
                                //         ? 'select'
                                //         : ''
                                // }`}
                                className={`doc_thumb`}
                                {...{ pageno: index + 1 }}
                                style={{
                                    backgroundImage: `url(${docContent.docPageThumbnail})`,
                                }}
                                draggable
                                onDragStart={pageDragStart}
                                onDragEnd={dragEnd}
                            ></div>
                            <div className="doc_bottom"></div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
});

export default Pages;

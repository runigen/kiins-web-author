import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import store from '../../store';
import $ from 'jquery';
import * as documents from '../../util/documents';
import {
    IdocListInfo,
    IdocInfo,
    EkeyName,
    ETemplateType,
} from '../../const/types';
import {
    sortObjectList,
    cancelBubble,
    allEventCancel,
    // getNewPageName,
} from '../../util/common';
import { showToastMessage, basicConfirmDialog } from '../../util/dialog';
import * as DataStore from '../../store/DataStore';
import * as pages from '../../util/pages';
import * as KeyEvent from '../../event/KeyEvent';

let gFolderPathList: IdocListInfo[] = [];
let makeFolderTimer: any = null;
const DocumentList = observer(() => {
    const navigate = useNavigate();
    const { docData, workInfo } = store;
    const listMode = workInfo.getListMode();
    const [folderPathList, setFolderPathList] = useState<IdocListInfo[]>([]);
    const [docList, setDocList] = useState<IdocListInfo[]>([]);
    const currDocNo = docData.getDocNo();
    const viewerUrl = process.env.REACT_APP_DOC_VIEWER_URL;

    useEffect(() => {
        console.log('DocumentList.tsx useEffect');
        // updateCurrentDocList();
        goCurrDocFolder();
        document.addEventListener('keydown', escKeyClose);

        focusButton();

        return () => {
            document.removeEventListener('keydown', escKeyClose);
        };
    }, []);

    useEffect(() => {
        console.log('folderPathList useEffect : ', folderPathList);
        gFolderPathList = folderPathList;
        // docData.setFolderPath(folderPathList);
    }, [folderPathList]);

    // const addKeyDownEvent = () => {
    //     document.addEventListener('keydown', escKeyClose);
    // };
    // const removeKeyDownEvent = () => {
    //     document.removeEventListener('keydown', escKeyClose);
    // };
    const escKeyClose = useCallback((e: KeyboardEvent) => {
        const keyCode = KeyEvent.getKeyCode(e);
        if (keyCode === EkeyName.ESC) {
            closePop();
        }
    }, []);

    const focusButton = () => {
        setTimeout(() => {
            $('.document-list-container .common-popup-foot button')
                .eq(1)
                .trigger('focus');
        }, 500);
    };

    const closePop = () => {
        const orgDocNo = docData.getDocNo();
        if (orgDocNo !== '') {
            workInfo.setListMode(false);

            // 닫힐때 폴더 목록 초기화.
            gFolderPathList = [];
        }
    };
    const updateCurrentDocList = async (folderId = 0, refresh = false) => {
        // 폴더이동으로 인해 화면 갱신시 (글자겹침) 어색함 제거용 코드
        if (refresh === false) {
            $('.document-list-content').css('opacity', '0');
        }

        let currentDocList = (await documents.getDocumentList(
            folderId,
        )) as IdocListInfo[];
        currentDocList = sortObjectList(currentDocList, 'name', 'ASC');
        currentDocList = sortObjectList(currentDocList, 'isFolder', 'DESC');

        setDocList(currentDocList);

        // 폴더이동으로 인해 화면 갱신시 (글자겹침) 어색함 제거용 코드
        if (refresh === false) {
            $('.document-list-content').animate({ opacity: 1 }, 300);
        }
    };

    const refreshCurrentFolderList = async () => {
        const currFolderId =
            gFolderPathList.length > 0
                ? Number(gFolderPathList[gFolderPathList.length - 1].id)
                : 0;
        updateCurrentDocList(currFolderId, true);
    };

    const openDblClickedDoc = (event: React.MouseEvent<HTMLLabelElement>) => {
        const openDocNo = event.currentTarget.getAttribute('id');
        console.log('openDocNo', openDocNo);
        if (openDocNo === null) return;

        if (openDocNo === currDocNo) {
            showToastMessage('현재 열려있는 문서입니다.');
            return;
        }

        const targetDocInfo = docList.find(doc => doc.id === openDocNo);
        if (targetDocInfo === undefined) return;
        if (targetDocInfo.isFolder === 'Y') {
            openChildFolder(targetDocInfo);
        } else {
            openDoc(openDocNo);
        }
    };
    const openSelectedDoc = () => {
        const checkedList = document.querySelectorAll(
            '.document-list-content .list input[type="checkbox"]:checked',
        ) as NodeListOf<HTMLInputElement>;
        if (checkedList.length !== 1) {
            showToastMessage('오픈할 문서를 1개 선택해주세요.');
            return;
        }
        const checkObj = checkedList[0];
        const openDocNo = checkObj.value;

        const targetDocInfo = docList.find(doc => doc.id === openDocNo);
        if (targetDocInfo === undefined) return;
        if (targetDocInfo.isFolder === 'Y') {
            openChildFolder(targetDocInfo);
        } else {
            openDoc(openDocNo);
        }
    };
    const openDoc = (openDocNo: string) => {
        const orgDocNo = docData.getDocNo();

        // 현재 문서번호가 없으면 현재 창에 그대로 새 문서 생성
        if (orgDocNo === '') {
            navigate('/' + openDocNo, { replace: true });
        } else {
            window.open('/' + openDocNo);
        }
        workInfo.setListMode(false);
    };

    const deleteDoc = async (e: React.MouseEvent<HTMLButtonElement>) => {
        cancelBubble(e);

        if (!$('.document-list-content').hasClass('checkform')) {
            $('.document-list-content').addClass('checkform');
            $('.document-list-content .list input[type="checkbox"]').prop(
                'checked',
                false,
            );
            return;
        }

        const checkedList = document.querySelectorAll(
            '.document-list-content .list input[type="checkbox"]:checked',
        ) as NodeListOf<HTMLInputElement>;

        if (!checkedList.length) {
            showToastMessage('삭제할 문서를 선택해주세요.');
            return;
        }

        // // 체크한 문서중 하위리스트가 있는 폴더
        // const folderList = document.querySelectorAll(
        //     '.document-list-content .list input[type="checkbox"]:checked[isfolder="Y"]',
        // ) as NodeListOf<HTMLInputElement>;

        basicConfirmDialog(
            '문서 삭제',
            `삭제한 문서는 복구할수 없습니다.|선택한 문서(${checkedList.length}개)를 모두 삭제하시겠습니까?`,
            [
                async () => {
                    let undeletedFolderCnt = 0;
                    for (const checkObj of checkedList) {
                        // checkedList.forEach(async checkObj => {

                        const docNo = checkObj.value;
                        const idFolder =
                            checkObj.getAttribute('isfolder') || 'N';
                        const cnt = Number(checkObj.getAttribute('cnt') || '0');

                        // 폴더
                        if (idFolder === 'Y') {
                            if (cnt > 0) {
                                undeletedFolderCnt++;
                            } else {
                                const result = await DataStore.deleteFolder(
                                    Number(docNo),
                                );
                                if (result) {
                                    // checkObj.parentElement?.parentElement?.remove();
                                    // getParentElement(checkObj, 'div', 'list')?.remove();
                                }
                            }

                            // 파일
                        } else {
                            const result = await DataStore.deleteDocument(
                                docNo,
                            );
                            if (result) {
                                // checkObj.parentElement?.parentElement?.remove();
                                // getParentElement(checkObj, 'div', 'list')?.remove();
                            }
                        }
                    }

                    if (undeletedFolderCnt > 0) {
                        showToastMessage(
                            `비어있지 않은 폴더는 삭제할 수 없습니다.|선택된 ${checkedList.length}개중 ${undeletedFolderCnt}개의 폴더는 삭제하지 못했습니다.`,
                        );
                    } else {
                        showToastMessage(
                            `총 ${checkedList.length}개의 문서(폴더)를 삭제했습니다.`,
                        );
                    }

                    // refresh
                    hideCheckForm();
                    refreshCurrentFolderList();
                },
            ],
        );
    };

    const hideCheckForm = () => {
        if ($('.document-list-content').hasClass('checkform')) {
            $('.document-list-content .list input[type="checkbox"]').prop(
                'checked',
                false,
            );
            $('.document-list-content').removeClass('checkform');
        }
    };

    const newDoc = () => {
        const orgDocNo = docData.getDocNo();

        // 현재 문서번호가 없으면 현재 창에 그대로 새 문서 생성
        if (orgDocNo === '') {
            loadNewDoc();

            // 현재 문서번호가 있으면 새 창에 새 문서 생성
        } else {
            const currFolderId =
                gFolderPathList.length > 0
                    ? gFolderPathList[gFolderPathList.length - 1].id
                    : 0;
            DataStore.setFolderId(String(currFolderId));
            window.open('/new');
        }

        workInfo.setListMode(false);
    };

    const loadNewDoc = async () => {
        const docNo = documents.getNewDocNo();
        const pageObj = pages.createPageObject();
        const docContentInfo = {
            docPageContent: pageObj.outerHTML,
            docPageId: pageObj.id,
            docPageName: pageObj.getAttribute('page-name') || '',
            docPageThumbnail: '',
            docPageTplType: (pageObj.getAttribute('tpl-type') ||
                '') as ETemplateType,
            logicContent: '',
            logicActionList: [],
        };
        const docInfo: IdocInfo = {
            no: docNo,
            name: documents.getNewDocName(),
            userId: DataStore.getUserId(),
            docContentList: [docContentInfo],
            // regdate: getCurrentDateTime(),
            // moddate: getCurrentDateTime(),
        };
        const rst = await documents.saveDocumentInfo(docInfo).catch(err => {
            console.log('saveDocumentInfo err : ', err);
            return false;
        });
        if (!rst) {
            showToastMessage(
                '문서를 생성할 수 없습니다. 새로고침 해 주세요.',
                1,
            );
            return;
        }

        // 문서정보를 저장하고 나서 해당 문서번호를 다시 로드
        navigate('/' + docNo, { replace: true });
    };

    const openChildFolder = (folderInfo: IdocListInfo) => {
        updateCurrentDocList(Number(folderInfo.id));
        setFolderPathList(folderPathList => [...folderPathList, folderInfo]);
    };
    const openParentFolder = () => {
        console.log('openParent');
        const prentFolderInfo: IdocListInfo | null =
            gFolderPathList.length > 1
                ? gFolderPathList[gFolderPathList.length - 2]
                : null;
        updateCurrentDocList(
            prentFolderInfo === null ? 0 : Number(prentFolderInfo.id),
        );
        setFolderPathList(folderPathList =>
            folderPathList.slice(0, folderPathList.length - 1),
        );
    };

    const openRootFolder = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (gFolderPathList.length === 0) return;
        updateCurrentDocList(0);
        setFolderPathList([]);
        cancelBubble(e);
    };

    const newFolder = (e: React.MouseEvent<HTMLButtonElement>) => {
        // 체크되어 있는것들을 모두 해제
        $('.document-list-content .list input[type="checkbox"]:checked').prop(
            'checked',
            false,
        );

        const newFolderPop = document.querySelector(
            '.new-folder-form-container',
        ) as HTMLDivElement;
        newFolderPop.classList.add('active');
        const newFolderName = document.querySelector(
            '.new-folder-form-container input',
        ) as HTMLInputElement;
        newFolderName.value = '';
        setTimeout(() => {
            newFolderName.focus();
        }, 100);

        cancelBubble(e);
    };
    const closeNewFolderPop = () => {
        const newFolderPop = document.querySelector(
            '.new-folder-form-container',
        ) as HTMLDivElement;
        newFolderPop.classList.remove('active');
    };

    const makeFolder = async (
        e: React.MouseEvent<HTMLButtonElement> | null = null,
    ) => {
        console.log('makeFolder CAll');

        // 0.5초내 폴더생성 명령 다시 들어오면 중단(중복실행 방지: 맥에서 한글입력하고 엔터치면 2번 들어오는경우 있음)
        if (makeFolderTimer !== null) return;

        makeFolderTimer = setTimeout(() => {
            clearInterval(makeFolderTimer);
            makeFolderTimer = null;
        }, 500);

        console.log('makeFolder gogo');

        try {
            const newFolderName = document.querySelector(
                '.new-folder-form-container input',
            ) as HTMLInputElement;
            if (newFolderName === null) return;
            newFolderName.value = newFolderName.value.trim();
            if (newFolderName.value === '') {
                showToastMessage('폴더명을 입력해주세요.', 1);
                setTimeout(() => {
                    newFolderName.focus();
                }, 100);
                return;
            }
            const saveFolderId =
                gFolderPathList.length > 0
                    ? Number(gFolderPathList[gFolderPathList.length - 1].id)
                    : 0;
            const saveFolderName = newFolderName.value.trim();

            const checkedList = document.querySelectorAll(
                '.document-list-content .list input[type="checkbox"]:checked[isfolder="Y"]',
            ) as NodeListOf<HTMLInputElement>;

            // 체크된 폴더가 있으면 수정
            if (checkedList.length > 0) {
                const folderId = Number(checkedList[0].value);
                const result = await DataStore.modifyFolderName(
                    folderId,
                    saveFolderName,
                    saveFolderId,
                );
                if (result === false) {
                    showToastMessage(
                        '폴더명 변경중 오류가 발생했습니다. 다시한번 시도해주세요.',
                        1,
                    );
                    return;
                }
                checkedList[0].checked = false;

                // 없으면 생성
            } else {
                const newFolderId = await DataStore.createFolder(
                    saveFolderId,
                    saveFolderName,
                );
                if (newFolderId === 0) {
                    showToastMessage(
                        '폴더 생성중 오류가 발생했습니다. 다시한번 시도해주세요.',
                        1,
                    );
                    return;
                }
            }
            newFolderName.value = '';

            // const currFolderId = gFolderPathList.length > 0 ? Number(gFolderPathList[gFolderPathList.length - 1].id) : 0;
            // updateCurrentDocList(currFolderId);
            hideCheckForm();
            refreshCurrentFolderList();

            closeNewFolderPop();
        } catch (err) {
            console.log('makeFolder err : ', err);
        }

        if (e !== null) cancelBubble(e);
    };

    const applyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log('applyEnter');
        const keyCode = KeyEvent.getKeyCode(e);
        if (keyCode === EkeyName.ENTER) {
            const newFolderName = document.querySelector(
                '.new-folder-form-container input',
            ) as HTMLInputElement;
            newFolderName.blur();
            makeFolder();
        }
    };

    const modFolder = (e: React.MouseEvent<HTMLButtonElement>) => {
        cancelBubble(e);

        if (!$('.document-list-content').hasClass('checkform')) {
            $('.document-list-content').addClass('checkform');
            $('.document-list-content .list input[type="checkbox"]').prop(
                'checked',
                false,
            );
            return;
        }

        console.log('modFolder');
        const checkedList = document.querySelectorAll(
            '.document-list-content .list input[type="checkbox"]:checked',
        ) as NodeListOf<HTMLInputElement>;

        if (
            checkedList.length !== 1 ||
            checkedList[0].getAttribute('isfolder') !== 'Y'
        ) {
            showToastMessage('변경할 폴더를 1개 선택해주세요.');
            return;
        }
        const checkedObj = checkedList[0];
        const subjectSpanObj = checkedObj.parentElement?.querySelector(
            'label span',
        ) as HTMLSpanElement;
        const subject = subjectSpanObj.innerText;
        // const folderId = Number(checkedObj.value);

        const newFolderPop = document.querySelector(
            '.new-folder-form-container',
        ) as HTMLDivElement;
        newFolderPop.classList.add('active');
        const newFolderName = document.querySelector(
            '.new-folder-form-container input',
        ) as HTMLInputElement;
        newFolderName.value = subject;
        setTimeout(() => {
            newFolderName.select();
        }, 100);
    };

    const moveFolder = (
        index: number,
        e: React.MouseEvent<HTMLSpanElement> | null = null,
    ) => {
        // 현재 열려있는 폴더와 같으면 중단.
        // if (index === gFolderPathList.length - 1) {
        //     console.log('moveFolder same folder');
        //     return;
        // }
        const folderId = Number(gFolderPathList[index].id);
        updateCurrentDocList(folderId);
        setFolderPathList(folderPathList => folderPathList.slice(0, index + 1));
        if (e !== null) cancelBubble(e);
    };

    const dragStart = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('dragStart');

        const dragObj = e.currentTarget;
        const dragObjId = dragObj.getAttribute('dragid');
        if (dragObjId === null) return;
        console.log('dragObjId : ', dragObjId);

        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.setData('text/plain', dragObjId);

        const spanObj = e.currentTarget.querySelector(
            'label span',
        ) as HTMLSpanElement;
        const subject = spanObj.innerText;
        console.log('subject : ', subject);
    };
    const dragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('dragEnter');

        const bottomObj = e.currentTarget;
        // const bottomObjId = bottomObj.getAttribute('id');
        // const bottomObjIsFolder = bottomObj.getAttribute('isfolder');

        // 폴더가 아닌곳에 드래그시 중단
        // if (bottomObjIsFolder !== 'Y') return;

        $('.document-list-content .list').removeClass('drag-over');

        if ($(bottomObj).hasClass('folder') === false) return;

        // $('.document-list-content .list').removeClass('drag-over');
        $(bottomObj).addClass('drag-over');

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const spanObj = e.currentTarget.querySelector(
            'label span',
        ) as HTMLSpanElement;
        const subject = spanObj.innerText;
        console.log('subject : ', subject);
    };

    const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
        const dragOverAreaObj = event.currentTarget;
        // 폴더가 아닌곳에 드래그시 중단
        if ($(dragOverAreaObj).hasClass('folder') === false) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const dragEnd = () => {
        console.log('dragEnd');
        $('.document-list-content .list').removeClass('drag-over');
    };

    const dragDrop = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('dragDrop');

        const dropAreaObj = e.currentTarget;
        let dropAreaObjId = dropAreaObj.getAttribute('dropareaid');
        console.log('dropAreaObjId : ', dropAreaObjId);
        if (dropAreaObjId === null) return;

        // 드롭 영역의 아이디가 없으면 상위폴더로 이동으로 간주하여 상위폴더 아이디를 가져옴
        if (dropAreaObjId === '') {
            dropAreaObjId =
                gFolderPathList.length > 1
                    ? gFolderPathList[gFolderPathList.length - 2].id
                    : '0';
        }

        // 폴더가 아닌곳에 드래그시 중단
        if ($(dropAreaObj).hasClass('folder') === false) return;

        const dragObjId = e.dataTransfer.getData('text/plain');
        console.log('dragObjId : ', dragObjId);
        if (dragObjId === null) return;

        // 동일한 폴더로 이동시 중단
        if (dragObjId === dropAreaObjId) return;

        const spanObj = dropAreaObj.querySelector(
            'label span',
        ) as HTMLSpanElement;
        const subject = spanObj.innerText;
        console.log('dropAreaObj subject : ', subject);

        // dragObjIsFolder
        const dragObj = document.querySelector(
            `.document-list-content .list[dropareaid="${dragObjId}"]`,
        ) as HTMLDivElement;
        const dragObjIsFolder = $(dragObj).hasClass('folder') ? 'Y' : 'N';
        console.log('dragObjIsFolder : ', dragObjIsFolder);

        const dragObjSpanObj = dragObj.querySelector(
            'label span',
        ) as HTMLSpanElement;
        const dragObjsubject = dragObjSpanObj.innerText;
        console.log('dragObjsubject subject : ', dragObjsubject);

        if (dragObjIsFolder === 'Y') {
            DataStore.moveFolderToFolder(
                Number(dragObjId),
                dragObjsubject,
                Number(dropAreaObjId),
            ).then(res => {
                console.log('res : ', res);
                if (res) {
                    // refreshCurrentFolderList();
                    // dragObj.parentNode?.removeChild(dragObj);
                    setDocList(docList.filter(item => item.id !== dragObjId));
                }
            });
        } else {
            DataStore.moveDocToFolder(
                String(dragObjId),
                Number(dropAreaObjId),
            ).then(res => {
                console.log('res : ', res);
                if (res) {
                    // refreshCurrentFolderList();
                    // dragObj.parentNode?.removeChild(dragObj);
                    setDocList(docList.filter(item => item.id !== dragObjId));
                }
            });
        }

        allEventCancel(e);
    };
    const openPreview = (
        e: React.MouseEvent<HTMLSpanElement>,
        docNo: string,
        name: string,
    ) => {
        const urlLink = `${viewerUrl}/${docNo}/${name}.html`;
        window.open(urlLink, '_blank', 'noopener,noreferrer');
        cancelBubble(e);
    };

    const goCurrDocFolder = async (
        e: React.MouseEvent<HTMLSpanElement> | null = null,
    ) => {
        //currDocNo
        const currDocFolderId = docData.getFolderId();
        console.log('currDocFolderId : ', currDocFolderId);

        if (currDocFolderId === 0) {
            gFolderPathList = [];
            setFolderPathList([]);
            updateCurrentDocList(0, true);
            return;
        }

        // 1. 현재 열려있는 폴더 경로에서 현재 문서가 속한 폴더를 찾고 있으면 해당 폴더로 이동
        const currFolderIndex = gFolderPathList.findIndex(
            item => item.id === String(currDocFolderId),
        );
        console.log('currFolderIndex : ', currFolderIndex);
        if (currFolderIndex > -1) {
            moveFolder(currFolderIndex);
            return;
        }
        const newFolderPathList = await documents.getDocFolderPathInfo(
            currDocFolderId,
        );

        if (newFolderPathList.length === 0) return;
        console.log('newFolderPathList : ', newFolderPathList);

        setFolderPathList(newFolderPathList);
        gFolderPathList = newFolderPathList;
        moveFolder(gFolderPathList.length - 1);

        if (e !== null) cancelBubble(e);
    };

    if (listMode === false) {
        return null;
    }
    return (
        <>
            <div className="common-popup-container-dim" onClick={closePop}>
                <div
                    className="document-list-container"
                    onMouseDown={closeNewFolderPop}
                    onClick={cancelBubble}
                >
                    <div className="document-head" onClick={hideCheckForm}>
                        <div className="folder-path">
                            <span
                                className="btn-move"
                                onClick={goCurrDocFolder}
                                title="현재 문서 위치로 이동"
                            ></span>
                            <span
                                onClick={openRootFolder}
                                title={`Home 으로 이동`}
                            >
                                Home
                            </span>
                            {folderPathList.map(
                                (folderInfo: IdocListInfo, index: number) => {
                                    return (
                                        <span
                                            key={`folder_path_${folderInfo.id}`}
                                            className="folder-path-item"
                                            onClick={e => moveFolder(index, e)}
                                            title={`${folderInfo.name} 으로 이동`}
                                        >
                                            {folderInfo.name}
                                        </span>
                                    );
                                },
                            )}
                        </div>
                        <div className="list head">
                            {/* {currDocNo !== '' && (
                                <button
                                    className="btn-move"
                                    onClick={goCurrDocFolder}
                                    style={{ backgroundColor: 'burlywood' }}
                                >
                                    현재 문서 위치로 이동
                                </button>
                            )} */}
                            <button
                                className="btn-new-folder"
                                onClick={newFolder}
                                title="새폴더"
                            >
                                새폴더
                            </button>
                            <button
                                className="btn-new-doc"
                                onClick={newDoc}
                                title="새문서"
                            >
                                새문서
                            </button>
                            <button
                                className="btn-edit-folder"
                                onClick={modFolder}
                                title="이름수정"
                            >
                                폴더명 변경
                            </button>
                            <button
                                className=" btn-delete"
                                onClick={deleteDoc}
                                title="삭제"
                            >
                                선택 삭제
                            </button>

                            {currDocNo !== '' && (
                                <button
                                    className="btn-close"
                                    onClick={closePop}
                                    title="창닫기"
                                ></button>
                            )}
                        </div>
                    </div>
                    <div
                        className={`document-list-content ${
                            folderPathList.length > 0 ? 'sub' : ''
                        }`}
                    >
                        {folderPathList.length > 0 && (
                            <div
                                className="list folder prev"
                                key="0"
                                {...{ dropareaid: '' }}
                                onDragEnter={dragEnter}
                                onDragOver={dragOver}
                                onDrop={dragDrop}
                            >
                                <div className="list-name">
                                    <span>
                                        <input
                                            type="checkbox"
                                            disabled
                                            style={{ display: 'none' }}
                                        />
                                        <label
                                            onDoubleClick={openParentFolder}
                                            className="folder prev"
                                        >
                                            <span>..</span>
                                        </label>
                                    </span>
                                </div>
                                <div className="list-right">
                                    <div className="list-preview">
                                        <span></span>
                                    </div>
                                    <div className="list-date">
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {docList.map((docInfo: IdocListInfo) => {
                            return (
                                <div
                                    className={`list ${
                                        docInfo.isFolder === 'Y'
                                            ? 'folder'
                                            : 'file'
                                    } `}
                                    key={docInfo.id}
                                    {...{ dropareaid: docInfo.id }}
                                    onDragEnter={dragEnter}
                                    onDragOver={dragOver}
                                    onDrop={dragDrop}
                                >
                                    <div
                                        className={`list-name ${
                                            docInfo.id === currDocNo
                                                ? 'disabled'
                                                : ''
                                        }`}
                                        {...{ dragid: docInfo.id }}
                                        draggable="true"
                                        onDragStart={dragStart}
                                        onDragEnd={dragEnd}
                                    >
                                        <span>
                                            <input
                                                type="checkbox"
                                                value={docInfo.id}
                                                id={`idx_${docInfo.id}`}
                                                disabled={
                                                    docInfo.id === currDocNo
                                                        ? true
                                                        : false
                                                }
                                                {...{
                                                    isfolder: docInfo.isFolder,
                                                    cnt: docInfo.cnt,
                                                }}
                                            />
                                            <label
                                                htmlFor={`idx_${docInfo.id}`}
                                                {...{ id: docInfo.id }}
                                                onDoubleClick={
                                                    openDblClickedDoc
                                                }
                                                className={
                                                    docInfo.isFolder === 'Y'
                                                        ? 'folder'
                                                        : 'file'
                                                }
                                            >
                                                <span>{docInfo.name}</span>
                                            </label>
                                        </span>
                                    </div>
                                    <div className="list-right">
                                        <div className="list-preview">
                                            <span
                                                className={
                                                    docInfo.isExport === 'Y'
                                                        ? 'export'
                                                        : ''
                                                }
                                                onClick={e =>
                                                    openPreview(
                                                        e,
                                                        docInfo.id,
                                                        docInfo.name,
                                                    )
                                                }
                                                title="미리보기"
                                            ></span>
                                        </div>
                                        <div className="list-date">
                                            <span>
                                                {docInfo.modDate.slice(
                                                    0,
                                                    docInfo.modDate.length - 3,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="common-popup-foot">
                        <button
                            className="btn-default-action"
                            onClick={openSelectedDoc}
                        >
                            Ok
                        </button>
                        {currDocNo !== '' && (
                            <button
                                className="btn-default-action"
                                onClick={closePop}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div
                    className="new-folder-form-container"
                    onMouseDown={cancelBubble}
                    onClick={cancelBubble}
                >
                    <input
                        type="text"
                        placeholder="폴더명을 입력하세요."
                        onKeyDown={applyEnter}
                    />
                    <div className="common-popup-foot">
                        <button
                            className="btn-default-action"
                            onClick={makeFolder}
                        >
                            Ok
                        </button>
                        <button
                            className="btn-default-action"
                            onClick={closeNewFolderPop}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
});

export default DocumentList;

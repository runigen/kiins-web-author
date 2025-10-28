import React, { useCallback, useEffect } from 'react';
import store from '../../../store';
import {
    hideDialog,
    showToastMessage,
    basicConfirmDialog,
    docSubjectDialog,
    docSendToDialog,
} from '../../../util/dialog';
import * as documents from '../../../util/documents';
import { IdocInfo } from '../../../const/types';
import { cancelBubble, allEventCancel } from '../../../util/common';
import * as DataStore from '../../../store/DataStore';
import * as FileEvent from '../../../event/FileEvent';
import { getBodyMiddleWorkspace } from '../../../util/pages';
import * as KeyEvent from '../../../event/KeyEvent';
import { saveLogicContent } from '../../../util/logiceditor';
import { setTextEditMode } from '../../../util/texteditor';
import { observer } from 'mobx-react';

// let saveAvailable = true;
// let saveAvailableTimer: any = null;
// const saveAvailableTime = 10; // sec (지정된 초 내에서 저장버튼을 누르면 저장이 되지 않는다. - docData.modified 와는 별개)

const BtnOpen = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const viewerUrl = process.env.REACT_APP_DOC_VIEWER_URL;
    const LANGSET = userInfo.getLangSet();
    // let folderPathList: string[] = [];

    useEffect(() => {
        // setShortCutKeyEvent();
        window.addEventListener('keydown', setShortCutKeyEvent);
        // setBeforeUnloadEvent();
        window.addEventListener('beforeunload', setBeforeUnloadEvent);
        // setUnloadEvent();
        window.addEventListener('unload', setUnloadEvent, false);

        documents.setAutoSave();

        return () => {
            window.removeEventListener('keydown', setShortCutKeyEvent);
            window.removeEventListener('beforeunload', setBeforeUnloadEvent);
            window.removeEventListener('unload', setUnloadEvent, false);
        };
    }, []);

    // 저장안하고 창이 닫히거나 새로고침 되는 경우 경고창
    const setBeforeUnloadEvent = useCallback((e: BeforeUnloadEvent) => {
        if (docData.getModified() === true) {
            e.preventDefault();
            e.returnValue = '';
        }
    }, []);
    // 창이 닫히거나 새로고침 되는 경우 자동 저장 처리
    const setUnloadEvent = useCallback(() => {
        if (docData.getModified() === true) {
            // 텍스트 편집중이면 편집모드 해제
            if (workInfo.getDteStatus()) {
                setTextEditMode(workInfo.getObject(), false);
            }
            documents.setDocumentBeforeUnload();
        }
    }, []);
    const setShortCutKeyEvent = useCallback((event: KeyboardEvent) => {
        const currKeyCode = KeyEvent.getKeyCode(event);

        // save
        if ((event.ctrlKey || event.metaKey) && currKeyCode === 's') {
            setSave();
            allEventCancel(event);
        }

        // document list
        if ((event.ctrlKey || event.metaKey) && currKeyCode === 'o') {
            openDocList();
            allEventCancel(event);
        }
    }, []);
    const setSave = () => {
        const docName = docData.getDocName();

        if (docName === '') {
            console.log('제목');

            docSubjectDialog([
                (formObj: HTMLInputElement) => {
                    console.log('text: ', formObj.value);
                    if (formObj.value.trim() !== '') {
                        docData.setDocName(formObj.value);
                        save();
                        hideDialog();
                    } else {
                        showToastMessage('제목을 입력해주세요.');
                        return;
                    }
                },
                () => {
                    console.log('cancel');
                    hideDialog();
                },
            ]);
        } else {
            save();
        }
    };

    const save = async () => {
        // const docInfo: IdocInfo = {
        //     no: docData.getDocNo(),
        //     name: docData.getDocName(),
        //     content : documents.getDocContentList(),
        // }
        // const rst = documents.saveDocumentInfo(docInfo);
        // if (saveAvailable !== true && docData.getModified() === false) {
        //     showToastMessage(
        //         '저장은 필요할 때 한번만 하세요(직접 저장하지 않으도 주기적으로 자동 저장됩니다.)',
        //     );
        //     return;
        // }

        // 텍스트 에디터 모드일 경우 텍스트 에디터를 닫는다.(그냥 저장할 경우 텍스트 에디터 관련 가이드라인 들이 남아있는 경우가 있음)
        if (workInfo.getDteStatus()) {
            setTextEditMode(workInfo.getObject(), false);
        }
        const logicMode = workInfo.getLogicMode();
        if (logicMode === true) {
            saveLogicContent();
        }

        const rst = await documents.saveCurrentDocument();
        if (rst) {
            showToastMessage('저장되었습니다.');

            docData.setModified(false);
            // saveAvailable = false;
            // if (saveAvailableTimer) {
            //     clearTimeout(saveAvailableTimer);
            // }
            // saveAvailableTimer = setTimeout(() => {
            //     saveAvailable = true;
            // }, saveAvailableTime * 1000);

            // autosave refresh
            documents.setAutoSave();
        } else {
            showToastMessage('저장에 실패했습니다.');
        }
    };
    const openDocList = async () => {
        console.log('openDocList');
        workInfo.setListMode(true);
        return;
    };

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
        const urlLink = `${viewerUrl}/${docInfo.no}/${docInfo.name}.html`;
        basicConfirmDialog(
            '내보내기',
            `웹페이지를 통해서도 확인이 가능합니다.|웹페이지를 여시겠습니까?`,
            [
                () => {
                    navigator.clipboard.writeText(urlLink);
                    window.open(urlLink, '_blank', 'noopener,noreferrer');
                },
                () => {
                    console.log('cancel');
                },
            ],
        );
    };

    const showOpenList = (e: React.MouseEvent<HTMLLIElement>) => {
        console.log('showTemplateList');
        //setSublistActive(sublistActive => sublistActive === 'active' ? '' : 'active');
        if (e.currentTarget.classList.contains('active')) {
            hideOpenSubList();
        } else {
            showOpenSubList();
        }
        cancelBubble(e);
    };
    const showOpenSubList = () => {
        console.log('showOpenSubList');
        document.querySelector('.nav-open')?.classList.add('active');

        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.addEventListener('mousedown', hideOpenSubList);
        }
    };
    const hideOpenSubList = () => {
        console.log('hideOpenSubList');
        document.querySelector('.nav-open')?.classList.remove('active');
        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.removeEventListener('mousedown', showOpenSubList);
        }
    };

    const setSaveAs = () => {
        const docName = docData.getDocName();
        // const docNo = docData.getDocNo();
        docSubjectDialog(
            [
                (formObj: HTMLInputElement) => {
                    console.log('text: ', formObj.value);
                    if (formObj.value.trim() !== '') {
                        hideDialog();
                        saveAs(formObj.value.trim());
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

    const saveAs = async (docName: string) => {
        const rst = await documents.saveCurrentDocument().catch(err => {
            console.log('saveAs err : ', err);
            showToastMessage('저장에 실패했습니다.');
            return false;
        });
        if (rst) {
            console.log('save as go');
            const newDocNo = await documents.saveAsDocument(docName);
            if (newDocNo !== '') {
                window.open('/' + newDocNo);
                return;
            }
        } else {
            showToastMessage('저장에 실패했습니다.');
        }
    };

    const setSendTo = () => {
        const docName = docData.getDocName();
        // const docNo = docData.getDocNo();
        docSendToDialog(
            [
                (formObj: HTMLInputElement, formObj2: HTMLInputElement) => {
                    console.log('text: ', formObj.value);
                    if (
                        formObj.value.trim() !== '' &&
                        formObj2.value.trim() !== ''
                    ) {
                        hideDialog();
                        sendTo(formObj2.value.trim(), formObj.value.trim());
                    } else if (formObj.value.trim() === '') {
                        showToastMessage('제목을 입력해주세요.');
                        formObj.focus();
                        return;
                    } else {
                        showToastMessage('수신자 아이디를 입력해주세요.');
                        formObj2.focus();
                        return;
                    }
                },
                () => {
                    console.log('cancel');
                    hideDialog();
                },
            ],
            'Send To...',
            docName + '의 사본',
        );
    };
    const sendTo = async (docName: string, userId: string) => {
        const rst = await documents.saveCurrentDocument().catch(err => {
            console.log('saveAs err : ', err);
            showToastMessage('저장에 실패했습니다.');
            return false;
        });
        if (rst) {
            console.log('send to go');
            const newDocNo = await documents.sendToDocument(docName, userId);
            if (newDocNo !== '') {
                showToastMessage('보내기를 완료했습니다.');
            } else {
                showToastMessage('보내기를 실패했습니다.');
            }
        } else {
            showToastMessage('보내기를 실패했습니다.');
        }
    };
    /*
    const downloadDoc = () => {
        console.log('downloadDoc');
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
        const docContentString = JSON.stringify(docInfo);
        FileEvent.downloadDoc(
            docContentString,
            docData.getDocNo(),
            docData.getDocName(),
        );
        // const urlLink = `${viewerUrl}/${docInfo.no}/${docInfo.name}.html`;
        // basicConfirmDialog(
        //     '내보내기',
        //     `웹페이지를 통해서도 확인이 가능합니다.|웹페이지를 여시겠습니까?`,
        //     [
        //         () => {
        //             navigator.clipboard.writeText(urlLink);
        //             window.open(urlLink, '_blank', 'noopener,noreferrer');
        //         },
        //         () => {},
        //     ],
        // );
    };
    */

    // const importDoc = () => {
    //     console.log('importDoc');
    //     showToastMessage('준비중입니다.');
    // };

    return (
        <>
            <li
                className="nav-open hasLayer"
                aria-label="문서도구"
                title="문서도구"
                onClick={showOpenList}
            >
                <div className="layer_menu layer_menu_open">
                    <ul>
                        <li
                            className="save"
                            onClick={setSave}
                            title={LANGSET.HEAD.SAVE}
                        >
                            {LANGSET.HEAD.SAVE}{' '}
                            <span className="shortcut-text">[Ctrl+S]</span>
                        </li>
                        <li
                            className="open"
                            onClick={openDocList}
                            title={LANGSET.HEAD.LOAD}
                        >
                            {LANGSET.HEAD.LOAD}{' '}
                            <span className="shortcut-text">[Ctrl+O]</span>
                        </li>
                        <li
                            className="saveas"
                            onClick={setSaveAs}
                            title={LANGSET.HEAD.SAVE_AS}
                        >
                            {LANGSET.HEAD.SAVE_AS}
                        </li>
                        <li
                            className="sendto"
                            onClick={setSendTo}
                            title={LANGSET.HEAD.SEND_TO}
                        >
                            {LANGSET.HEAD.SEND_TO}
                        </li>
                        {/* <li
                            className="download"
                            onClick={importDoc}
                            title={LANGSET.HEAD.IMPORT}
                        >
                            {LANGSET.HEAD.IMPORT}
                        </li>
                        <li
                            className="download"
                            onClick={downloadDoc}
                            title={LANGSET.HEAD.DOWNLOAD}
                        >
                            {LANGSET.HEAD.DOWNLOAD}
                        </li> */}
                        <li
                            className="exportall"
                            onClick={exportAll}
                            title={LANGSET.HEAD.EXPORT}
                        >
                            {LANGSET.HEAD.EXPORT}
                        </li>
                    </ul>
                </div>
            </li>
        </>
    );
});

export default BtnOpen;

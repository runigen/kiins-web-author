import React, { Suspense, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import store from './store';
import * as DataStore from './store/DataStore';
import { IdocInfo, ETemplateType } from './const/types';

import * as documents from './util/documents';
import * as pages from './util/pages';
import { checkUserId, getUserIdErrorMsg } from './util/common';
import { UserConfigDialog, hideDialog, showToastMessage } from './util/dialog';

import LayerControl from './LayerControl';
import Head from './components/header/Head';
import Right from './components/body/right';
import Workspace from './components/body/middle/Workspace';
import TimeSpace from './components/body/timespace/TimeSpace';

import Pages from './components/body/left/Pages';
import ObjectList from './components/logic/ObjectList';
import LogicCanvas from './components/logic/LogicCanvas';
import ActionList from './components/logic/ActionList';

import './res/scss/main.scss';

const Layout = observer(() => {
    const navigate = useNavigate();
    const { docData, workInfo } = store;
    const logicMode = workInfo.getLogicMode();
    const { docNo } = useParams();

    useEffect(() => {
        console.log('Layout docNo : ', docNo);
        checkDefaultInfo(docNo);
    }, [docNo]);

    const checkDefaultInfo = (docNo: string | undefined) => {
        const userId = DataStore.getUserId();

        if (userId === '') {
            UserConfigDialog((textForm: HTMLInputElement) => {
                const userId = textForm.value;
                if (!checkUserId(userId)) {
                    showToastMessage(getUserIdErrorMsg(), 5);
                    textForm.select();
                    return;
                }
                DataStore.setUserId(userId);
                hideDialog();
                setDocInfo(docNo);
            });
            return;
        }
        setDocInfo(docNo);
    };

    const setDocInfo = async (docNo: string | undefined) => {
        // 문서번호가 없으면 새문서를 생성/저장 한다.

        if (docNo === undefined) {
            workInfo.setListMode(true);
            return;
        }

        if (docNo === 'new') {
            docNo = documents.getNewDocNo();
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
                folderId: Number(DataStore.getFolderId()) || 0,
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
            return;
        }

        // const docInfo = await documents.getDocumentInfo(docNo);
        // console.log('getDocumentInfo : 1');
        // if (docInfo) {
        //     docData.setDocName(docInfo.name !== '' ? docInfo.name : documents.getNewDocName());
        // } else {
        //     showToastMessage('문서를 로드할 수 없습니다. 잠시 후 다시 시도해 주세요.', 1);
        //     return;
        // }
        console.log('docNo docNo docNo : ', docNo);
        docData.setDocNo(docNo);
        // navigate('/' + docNo, { replace: true });
    };

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <div className="container">
                    <header className="header">
                        <h1 className="topLogo">Meeoocat</h1>
                        <Routes>
                            <Route path="*" element={<Head />} />
                        </Routes>
                    </header>
                    <div className="layer-control">
                        <LayerControl />
                    </div>
                    <div className="body-wrapper">
                        <div className="documents">
                            {/* <Routes>
                                <Route path="*" element={<Pages />} />
                            </Routes> */}
                            {logicMode === true ? <ObjectList /> : <Pages />}
                        </div>
                        <div className="body">
                            <div className="body-content">
                                {/* <Routes>
                                    <Route path="*" element={<Workspace />} />
                                </Routes>
                                <Routes>
                                    <Route path="*" element={<TimeSpace />} />
                                </Routes> */}
                                <Workspace />
                                <TimeSpace />
                                {logicMode === true && <LogicCanvas />}
                            </div>
                            <div className="right">
                                {logicMode === true ? (
                                    <ActionList />
                                ) : (
                                    <Right />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Suspense>
        </>
    );
});

export default Layout;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { observer } from 'mobx-react';
import Layout from './Layout';
import Preview from './components/preview';
// import Logic from './components/logic';
import DocumentList from './components/popup/DocumentList';
import UserConfig from './components/popup/UserConfig';
import SpecialChars from './components/popup/SpecialChars';
import PdfTextList from './components/popup/PdfTextList';
import store from './store';
import { useEffect } from 'react';
import { getLangSet } from './util/common';

const App = observer(() => {
    const { workInfo, userInfo } = store;
    const listMode = workInfo.getListMode();
    const viewMode = workInfo.getViewMode();
    // const logicMode = workInfo.getLogicMode();
    const configMode = workInfo.getConfigMode();
    const showSpecialChars = workInfo.getShowSpecialChars();
    const showPdfTextList = workInfo.getShowPdfTextList();
    const lang = userInfo.getLang();

    useEffect(() => {
        console.log('lang : ', lang);
        const langSet = getLangSet(lang);
        console.log('langSet : ', langSet);
        userInfo.setLangSet(langSet);
    }, [lang]);

    useEffect(() => {
        console.log('viewMode : ', viewMode);
    }, [viewMode]);

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/:docNo/*" element={<Layout />} />
                    <Route path="*" element={<Layout />} />
                </Routes>

                {listMode === true && <DocumentList />}
                {viewMode === true && <Preview />}
                {/* {logicMode === true && <Logic />} */}
                {configMode === true && <UserConfig />}
                {showSpecialChars === true && <SpecialChars />}
                {showPdfTextList === true && <PdfTextList />}
            </BrowserRouter>
        </>
    );
});

export default App;

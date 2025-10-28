import React, { Suspense, useEffect } from 'react';
import { observer } from 'mobx-react';
import { EpreviewPlayStatus } from '../../const/types';
import $ from 'jquery';
import { cancelBubble } from '../../util/common';
import * as preview from '../../util/preview';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';

const Preview = observer(() => {
    const playStatus = workInfo.getPreviewPlayStatus();
    const keyframeRangeList = workInfo.getKeyframeRangeList();
    const docContentsList = docData.getDocContentsList();
    const currPageNo = docData.getCurrPage();
    const currTotalPage = docData.getTotalPage();
    // const [previewPageNo, setPreviewPageNo] = useState<number>(1);
    const previewPageNo = workInfo.getPreviewPageNo();

    useEffect(() => {
        console.log('useEffect');

        // -- 편집기 화면 스크롤 방지
        $('.container').addClass('noscroll');
        preview.initResultDataList();
        // preview.setCanvasContents();
        preview.setCanvasContents(currPageNo);

        return () => {
            $('.container').removeClass('noscroll');
            initializePreviewAnime();
        };
    }, []);

    useEffect(() => {
        if (keyframeRangeList.length < 1) {
            workInfo.setPreviewPlayStatus(EpreviewPlayStatus.disable);
        }
    }, [keyframeRangeList]);

    useEffect(() => {
        console.log('playStatus : ', playStatus);
    }, [playStatus]);

    const initializePreviewAnime = () => {
        preview.pause();
        preview.setBPreviewPlay(false);
        preview.removeAllAnime();
        workInfo.setPreviewPlayStatus(EpreviewPlayStatus.pause);
    };
    const initializePreviewAudio = () => {
        preview.stopAllAudio();
    };

    const closePreview = () => {
        initializePreviewAnime();
        initializePreviewAudio();

        // navigate('/' + docData.getDocNo(), { replace: true });
        workInfo.setViewMode(false);
    };
    const playPreview = () => {
        preview.play();
    };
    const pausePreview = () => {
        preview.pause();
    };
    const resumePreview = () => {
        preview.resume();
    };
    const replayPreview = () => {
        preview.restart();
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="preview_container" onClick={closePreview}>
                {/* <div className="preview-dim" onClick={closePreview}></div> */}
                <div className="preview-sheet-container" onClick={cancelBubble}>
                    <div className="preview-title">
                        <h1>
                            Preview
                            {currTotalPage > 1 &&
                                ` (${previewPageNo}/${currTotalPage})`}
                        </h1>
                    </div>
                    <div
                        className="meeoocat-view-container"
                        id="idx_meeoocat_view_container"
                    ></div>
                    <div
                        className="meeoocat-view-container-ctl"
                        id="idx_meeoocat_view_container_ctl"
                    ></div>
                    <div className="preview-btn-container">
                        <div className="preview-progress-container">
                            <div className="preview-progress-bar"></div>
                        </div>

                        {playStatus === EpreviewPlayStatus.stop && (
                            <div
                                className="control-btn play"
                                onClick={playPreview}
                            ></div>
                        )}

                        {playStatus === EpreviewPlayStatus.pause && (
                            <div
                                className="control-btn play"
                                onClick={resumePreview}
                            ></div>
                        )}

                        {playStatus === EpreviewPlayStatus.play && (
                            <div
                                className="control-btn pause"
                                onClick={pausePreview}
                            ></div>
                        )}

                        <div
                            className="control-btn replay"
                            onClick={replayPreview}
                        ></div>

                        {docContentsList.length > 1 && (
                            <>
                                <div
                                    className="control-btn prev"
                                    onClick={preview.goPrevPage}
                                    title="이전 페이지"
                                ></div>
                                <div
                                    className="control-btn next"
                                    onClick={preview.goNextPage}
                                    title="다음 페이지"
                                ></div>
                            </>
                        )}
                    </div>
                    <div className="preview-close" onClick={closePreview}></div>
                </div>
            </div>
        </Suspense>
    );
});

export default Preview;

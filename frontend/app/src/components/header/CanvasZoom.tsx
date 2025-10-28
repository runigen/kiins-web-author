import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import $ from 'jquery';
// import KeyEvent.keyName, {getKeyCode} from '../../../const/keycode';
import { EkeyName, EworkStatus } from '../../const/types';
import { canvasZoomPreset, workSpaceMinSizeConst } from '../../const/basicData';
import * as KeyEvent from '../../event/KeyEvent';
import * as CommonEvent from '../../event/CommonEvent';
import * as SquareEvent from '../../event/SquareEvent';
import { hideDropDown, hideDialog } from '../../util/dialog';
import { allEventCancel, cancelBubble } from '../../util/common';
import Canvas from '../body/middle/Canvas';
import * as WorkSpaceEvent from '../../event/WorkSpaceEvent';
import * as pages from '../../util/pages';

const CanvasZoom = observer(() => {
    const { workInfo, userInfo } = store;
    const LANGSET = userInfo.getLangSet();
    const pageZoom = workInfo.getPageZoom();

    useEffect(() => {
        $('#idx_canvas_zoom').val(pageZoom * 100);
    }, []);

    const changeZoomRatio = (event: React.ChangeEvent<HTMLInputElement>) => {
        const zoomRatioVal = Number(event.currentTarget.value);
        console.log('changeZoomRatio:', zoomRatioVal);
        setZoomRatio(zoomRatioVal);
    };
    const setZoomRatio = (zoomRatioVal: number = 100) => {
        try {
            // 최소값보다 작으면 최소값으로
            if (zoomRatioVal < Math.min(...canvasZoomPreset)) {
                zoomRatioVal = Math.min(...canvasZoomPreset);
            }
            // 최대값보다 크면 최대값으로
            if (zoomRatioVal > Math.max(...canvasZoomPreset)) {
                zoomRatioVal = Math.max(...canvasZoomPreset);
            }

            console.log('setZoomRatio:', zoomRatioVal);

            const changeZoomRatio = Number((zoomRatioVal / 100).toFixed(2));
            pages.setCanvasZoom(changeZoomRatio);
            workInfo.setPageZoom(changeZoomRatio);
        } catch (e) {
            console.log(e);
        }
    };

    const showZoomPreset = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('showDropDown');
        $('.zoom-control').addClass('active');
        $('#idx_canvas_zoom_preset').show();

        document.addEventListener('mousedown', hideZoomPreset);
    };
    const hideZoomPreset = () => {
        $('.zoom-control').removeClass('active');
        $('#idx_canvas_zoom_preset').hide();
        document.removeEventListener('mousedown', hideZoomPreset);
    };

    const selectZoomPreset = (zoomVal: number) => {
        setZoomRatio(zoomVal);
        $('#idx_canvas_zoom').val(zoomVal);
        hideZoomPreset();
    };

    const checkVal = (event: React.FocusEvent<HTMLInputElement>) => {
        let zoomRatioVal = Number(event.currentTarget.value);
        console.log('checkVal before zoomRatioVal:', zoomRatioVal);

        // 최소값보다 작으면 최소값으로
        if (zoomRatioVal < canvasZoomPreset[0]) {
            zoomRatioVal = canvasZoomPreset[0];
            event.currentTarget.value = String(zoomRatioVal);
        }
        // 최대값보다 크면 최대값으로
        if (zoomRatioVal > canvasZoomPreset[canvasZoomPreset.length - 1]) {
            zoomRatioVal = canvasZoomPreset[canvasZoomPreset.length - 1];
            event.currentTarget.value = String(zoomRatioVal);
        }
        console.log('checkVal after zoomRatioVal:', zoomRatioVal);
    };

    const setFitZoom = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log('setFitCanvas');
        const workspaceObj = pages.getWorkspace();
        const workspaceWidth = $(workspaceObj).width() || 0;
        const workspaceHeight = $(workspaceObj).height() || 0;
        console.log('workspaceWidth :', workspaceWidth);
        console.log('workspaceHeight :', workspaceHeight);

        // 현재 상태의 워크스페이스의 min 값을 고려한 캔버스 가로/세로 사이즈 계산
        const availCanvasWidth = workspaceWidth - workSpaceMinSizeConst;
        const availCanvasHeight = workspaceHeight - workSpaceMinSizeConst;

        // 워크스페이스의 가로/세로 비율
        const workspaceAspectRatio = availCanvasWidth / availCanvasHeight;

        const pagesObj = pages.getPageObject();
        const pagesObjWidth = $(pagesObj).width() || 0;
        const pagesObjHeight = $(pagesObj).height() || 0;
        console.log('pagesObjWidth :', pagesObjWidth);
        console.log('pagesObjHeight :', pagesObjHeight);

        // 캔버스의 가로/세로 비율
        const canvasAspectRatio = pagesObjWidth / pagesObjHeight;

        let zoomRatio = 1;
        // 캔커스의 가로/세로 비율이 워크스페이스의 가로/세로 비율보다 크면 가로길이를 기준으로 계산
        if (workspaceAspectRatio < canvasAspectRatio) {
            zoomRatio = availCanvasWidth / pagesObjWidth;

            // 아니면 세로길이를 기준으로 계산
        } else {
            zoomRatio = availCanvasHeight / pagesObjHeight;
        }
        zoomRatio = Math.floor(Number(zoomRatio.toFixed(2)) * 100);
        console.log('zoomRatio : ', zoomRatio);

        setZoomRatio(zoomRatio);
        $('#idx_canvas_zoom').val(zoomRatio);

        hideZoomPreset();
    };

    return (
        <div className="zoom-control" onMouseDown={cancelBubble}>
            <div className="inputbox">
                <div>
                    <input
                        type="number"
                        max={Math.max(...canvasZoomPreset)}
                        min={Math.min(...canvasZoomPreset)}
                        id="idx_canvas_zoom"
                        title={LANGSET.HEAD.ZOOM}
                        defaultValue={100}
                        onChange={changeZoomRatio}
                        onBlur={checkVal}
                    />
                    <span>%</span>
                    <button
                        type="button"
                        onClick={showZoomPreset}
                        className="btn-zoom-dropdown"
                    ></button>
                </div>
                {/* <button type="button" onClick={setFitZoom} className="btn-zoom-set"></button> */}
            </div>
            <div
                className="dropdown"
                id="idx_canvas_zoom_preset"
                style={{ display: 'none' }}
            >
                {canvasZoomPreset.map(zoomVal => (
                    <div
                        className={
                            'list' +
                            (pageZoom * 100 === zoomVal ? ' active' : '')
                        }
                        key={`zoomval_${zoomVal}`}
                        onClick={() => selectZoomPreset(zoomVal)}
                    >
                        {zoomVal} %{' '}
                    </div>
                ))}

                <div className="list" key="zoomval_fit" onClick={setFitZoom}>
                    fit to screen
                </div>
            </div>
        </div>
    );
});

export default CanvasZoom;

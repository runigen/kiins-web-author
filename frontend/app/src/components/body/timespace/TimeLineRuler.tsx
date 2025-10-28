import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import $ from 'jquery';
import * as CommonEvent from '../../../event/CommonEvent';
import { allEventCancel, getTimeLineMagPixcel } from '../../../util/common';
import * as timeline from '../../../util/timeline';

let gPrevObjectId = '';
let gCurrObject: HTMLElement | null = null;
let gTimelineZoom = 1;
let gTimelineLimit = 30;
const TimeLineRuler = observer(() => {
    const { workInfo } = store;
    const objectList: any = workInfo.getObjectList();
    const currObject: any = workInfo.getObject();
    const updateKey: number = workInfo.getUpdateKey();
    const timelineZoom: number = workInfo.getTimelineZoom();
    const timelineLimit: number = workInfo.getTimelineLimit();

    const [timeTextList, setTimeTextList] = useState<number[]>([]);

    let mouseDown = false;
    let progressBtnMoveStartX = 0;
    let progressBtnObj: HTMLDivElement | null = null;
    let progressLineObj: HTMLDivElement | null = null;
    let rulerWrapperObj: HTMLDivElement | null = null;
    let progressLineOrgLeft = 0;

    useEffect(() => {
        progressBtnObj = document.getElementById(
            'idx_btn_head',
        ) as HTMLDivElement;
        progressLineObj = document.getElementById(
            'idx_progressline',
        ) as HTMLDivElement;
        rulerWrapperObj = document.getElementById(
            'idx_ruler_wrapper',
        ) as HTMLDivElement;
        addProgressBtnEvent();
        // refreshTimeTextList();
        // setTimeLineLimitWidth();
        return () => {
            removeProgressBtnEvent();
        };
    }, []);

    useEffect(() => {
        gCurrObject = currObject;
    }, [currObject, updateKey]);

    useEffect(() => {
        gTimelineZoom = timelineZoom;
        gTimelineLimit = timelineLimit;
        refreshTimeTextList(timelineZoom, timelineLimit);
    }, [timelineZoom, timelineLimit]);

    useEffect(() => {
        // 오브젝트 목록이 달라질때 사이즈를 다시 맞춰준다.
        timeline.setTimeLineLimitWidth();
    }, [objectList]);

    // const setTimeLineLimitWidth =(zoomVal: number = gTimelineZoom, limit: number = timelineDefaultLimit) => {
    //     // 초를 픽셀로 치환 (초 * 100) 하고 여유값 100 추가
    //     let resizeVal = (limit*100+100)*zoomVal;
    //     const trackBodyWidth = $('.timeline-body-tracks').width() || 0;
    //     if(resizeVal < trackBodyWidth+15) {
    //         resizeVal = trackBodyWidth+15;
    //     }
    //     $('.timeline-body-top-tracks').css('width', resizeVal);
    //     $('.timeline-body-tracks-container').css('width', resizeVal);
    // };

    const addProgressBtnEvent = () => {
        if (progressBtnObj)
            progressBtnObj.addEventListener('mousedown', progressBtnDownEvent);
        if (rulerWrapperObj)
            rulerWrapperObj.addEventListener(
                'mousedown',
                rulerWrapperDownEvent,
            );
    };
    const removeProgressBtnEvent = () => {
        if (progressBtnObj)
            progressBtnObj.removeEventListener(
                'mousedown',
                progressBtnDownEvent,
            );
    };
    const progressBtnDownEvent = (event: MouseEvent) => {
        console.log('progressBtnDown');

        allEventCancel(event);

        // 이전에 선택되어 있던 오브젝트가 있으면 아이디 저장하고 선택 해제
        if (gCurrObject) {
            gPrevObjectId = gCurrObject.id;
            console.log('gPrevObjectId : ', gPrevObjectId);
            // SquareEvent.unselectSquareObjcts(); // 진행바 선택시 오브젝트 모두 선택 해제
            // 셀렉터를 안보이게 (제거는 하지 않음)
            const selectorObj = CommonEvent.getObjectSelector();
            if (selectorObj) {
                $(selectorObj).hide();
            }
        } else {
            gPrevObjectId = '';
        }

        progressBtnMoveStartX = event.clientX;
        if (progressLineObj)
            progressLineOrgLeft = parseInt(
                progressLineObj.style.left.replace(/px/, ''),
                10,
            );

        mouseDown = true;

        // add event
        document.addEventListener('mousemove', progressBtnMoveEvent);
        document.addEventListener('mouseup', progressBtnUpEvent);
    };
    const progressBtnMoveEvent = (event: MouseEvent) => {
        if (mouseDown !== true) return;
        const moveX = event.clientX - progressBtnMoveStartX;
        let goX = progressLineOrgLeft + moveX;
        if (goX < 0) goX = 0;

        // 10 픽셀 단위로 이동 처리
        goX = getTimeLineMagPixcel(goX);

        //progressLineObj.style.left = goX + 'px';
        workInfo.setProgressbarPos(goX);
        //setPlayTimeView(convertTimeFormat(goX));

        //스크롤 될 때 타임라인 너비
        /*
        const timelineTrackEl :any = document.querySelector('.timeline-body-elements')
        const timelineTrack :any = document.querySelector('.timeline-body-tracks')
        const timelineTrackWidth :any = timelineTrackEl.scrollWidth
        timelineTrack.style.width = `${timelineTrackWidth}px`
        */
        //console.log('timelinetracktimelinetracktimelinetracktimelinetrack', timelineTrackWidth)

        // console.log('go x, go x', goX, timelineTrackWidth)
    };
    const progressBtnUpEvent = () => {
        mouseDown = false;
        // console.log('mouseup');

        // 이전에 선택되어 있던 오브젝트가 있으면 저장된 아이디를 이용해 오브젝트 다시 선택
        if (gPrevObjectId) {
            workInfo.setUpdateKey();
            CommonEvent.setObjectSelectorShape(gCurrObject);
            const selectorObj = CommonEvent.getObjectSelector();
            if (selectorObj) {
                $(selectorObj).show();
            }
        }

        document.removeEventListener('mousemove', progressBtnMoveEvent);
        document.removeEventListener('mouseup', progressBtnUpEvent);
    };
    const rulerWrapperDownEvent = (event: MouseEvent) => {
        console.log('rulerWrapperDownEvent');
        if (rulerWrapperObj === null) return;
        if (progressLineObj === null) return;

        const mouseDownX = event.clientX;
        console.log('mouseDownX : ', mouseDownX);
        const rulerWrapperLeft = rulerWrapperObj.getBoundingClientRect().left;
        console.log('rulerWrapperLeft : ', rulerWrapperLeft);

        const rulerLeftPoint = getTimeLineMagPixcel(
            mouseDownX - rulerWrapperLeft,
        );
        // 10 픽셀 단위로 이동 처리

        console.log('rulerLeftPoint : ', rulerLeftPoint);

        workInfo.setProgressbarPos(rulerLeftPoint);
        // 위 setProgressbarPos 로 인해 바가 이동할것이지만, state 에 의해 이동하므로 랜더링이 늦어 아래 progressBtnDownEvent 이벤트 전달시 현재위치가 안맞을 수 있어, 아래와 같이 직접 이동시킨다.
        $(progressLineObj).css('left', rulerLeftPoint);

        progressBtnDownEvent(event);
    };

    const refreshTimeTextList = (
        zoomVal: number = gTimelineZoom,
        limit: number = gTimelineLimit,
    ) => {
        timeline.setTimeLineLimitWidth(zoomVal, limit);

        console.log('refreshTimeTextList  zoomVal : ', zoomVal);

        const timelineTrack = document.querySelector(
            '.timeline-body-top-tracks',
        ) as HTMLDivElement;
        if (!timelineTrack) return;
        const timelineTrackWidth = $(timelineTrack).width() || 0;
        if (!timelineTrackWidth) return;

        const unitSpace = 100 * zoomVal;
        const unitCnt = Math.floor(timelineTrackWidth / unitSpace);

        const list = [];
        for (let i = 0; i <= unitCnt; i++) {
            list.push(i * unitSpace);
        }
        // console.log('refreshTimeTextList : ', list);
        setTimeTextList(list);
    };

    return (
        <div className="timeline-body-top-tracks">
            <div
                className="wrapper"
                id="idx_ruler_wrapper"
                onContextMenu={allEventCancel}
            >
                <div className="gradient-pattern"></div>
                <div className="line"></div>
                <div className="time-container"></div>
                <div className="second-container">
                    {timeTextList.map(
                        (leftVal: number, index: number) =>
                            (timelineZoom > 0.1 || !(index % 2)) && (
                                <span
                                    key={'leftVal' + leftVal}
                                    style={{ left: leftVal }}
                                >
                                    {index}
                                </span>
                            ),
                    )}
                </div>
                <div className="timeline-body-top-tracks-header">
                    <div
                        className="progressline"
                        id="idx_progressline"
                        style={{ left: 0 }}
                    >
                        <div className="btn-head" id="idx_btn_head"></div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TimeLineRuler;

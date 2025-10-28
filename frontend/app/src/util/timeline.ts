import $ from 'jquery';
import * as basicData from '../const/basicData';
import {IshapeInfo, IstyleInfo, IstretchCssInfo, IobjectSizeInfo, IpageSizeInfo, EundoStackAddType} from '../const/types';
import * as keyframe from './keyframe';
import * as transition from './transition';
import * as KeyEvent from '../event/KeyEvent';
import * as CommonEvent from '../event/CommonEvent';
import * as dialog from './dialog';
import * as common from './common';
import workInfo from '../store/workInfo';
import docData from '../store/docData';
import * as dostack from './dostack';

export const setTimelineZoom = (zoomRatioVal:number = 1) => {
    $('.timeline-body-tracks').addClass('zoom');
    if(zoomRatioVal >= 0.2 && zoomRatioVal < 0.5) {
        $('.timeline-body-tracks').removeClass('step2');
        $('.timeline-body-tracks').addClass('step1');
    } else if(zoomRatioVal >= 0.1 && zoomRatioVal < 0.2) {
        $('.timeline-body-tracks').removeClass('step1');    
        $('.timeline-body-tracks').addClass('step2');
    } else {
        $('.timeline-body-tracks').removeClass('step1');    
        $('.timeline-body-tracks').removeClass('step2');
    }
    document.documentElement.style.setProperty("--timeline-zoom", String(zoomRatioVal));
};

// timelineZoom, timelineLimit 값을 이용해 타임라인 div 영역 가로 사이즈 조절
export const setTimeLineLimitWidth =(zoomVal: number = workInfo.getTimelineZoom(), limit: number = workInfo.getTimelineLimit()) => {
    // 초를 픽셀로 치환 (초 * 100) 하고 여유값 100 추가 
    let resizeVal = (limit*100+100)*zoomVal;
    const trackBodyWidth = $('.timeline-body-tracks').width() || 0;
    if(resizeVal < trackBodyWidth+15) {
        resizeVal = trackBodyWidth+15;
    }
    $('.timeline-body-top-tracks').css('width', resizeVal);
    $('.timeline-body-tracks-container').css('width', resizeVal);
};

export const applyTimelineZoom = (zoomRatioVal: number) => {

    setTimelineZoom(zoomRatioVal);
    workInfo.setTimelineZoom(zoomRatioVal);

    const playTimeInfo = workInfo.getPlayTimeInfo();

    //타임라인 줌 조절 후 프로그래스바도 줌에맞게 위치 조정 (progressbar 위치를 style 로 위치만 변경)
    console.log('refreshTimeTextList  playTimeInfo.left : ', playTimeInfo.left);
    const rulerLeftPoint = common.getTimeLineMagPixcel(playTimeInfo.left * zoomRatioVal);
    $('#idx_progressline').css('left', rulerLeftPoint);
};

export const initTimelineZoomRatio = () => {
    $('#timeline_zoom_range').val(100);
    applyTimelineZoom(1);
};

export const resizeTimelineZoomRatio = (type: 'inc'|'dec') => {

    const currZoomVal = Number($('#timeline_zoom_range').val());
    let newZoomVal = currZoomVal;

    if(type === 'inc') {
        newZoomVal = currZoomVal + basicData.timelineZoomStep;
        if(newZoomVal > basicData.timelineZoomMax) {
            newZoomVal = basicData.timelineZoomMax;
        }
    } else {
        newZoomVal = currZoomVal - basicData.timelineZoomStep;
        if(newZoomVal < basicData.timelineZoomMin) {
            newZoomVal = basicData.timelineZoomMin;
        }
    }
    console.log('newZoomVal : ', newZoomVal);
    $('#timeline_zoom_range').val(newZoomVal);
    applyTimelineZoom(newZoomVal/100);
}


export const incTimelineLimit = (addVal: number) => {
    console.log('addTimelineLimit addVal : ', addVal);
    workInfo.incTimelineLimit(addVal);
    setTimeLineLimitWidth();
};
import React from 'react';
import $ from 'jquery';
// import * as KeyEvent from './KeyEvent';
// import workInfo from '../store/workInfo';
import * as common from '../util/common';

let resizeDown = false;
let moveStartY = 0;
let orgTimeLineHeight = 0;

export const addResizeTimeLineEvent = (
    event: React.MouseEvent<HTMLDivElement>,
) => {
    console.log('resizeTimelineContainer');
    common.allEventCancel(event);

    resizeDown = true;
    moveStartY = event.clientY;
    orgTimeLineHeight = Number($('.timeline-body-elements').height());

    window.addEventListener('mousemove', resizeTimelineContainerMove);
    window.addEventListener('mouseup', resizeTimelineContainerUp);

    addResizeCursor();
};
const addResizeCursor = () => {
    if (!$('.body-content').hasClass('cursor-resize-v')) {
        $('.body-content').addClass('cursor-resize-v');
    }
};
const removeResizeCursor = () => {
    if ($('.body-content').hasClass('cursor-resize-v')) {
        $('.body-content').removeClass('cursor-resize-v');
    }
};

export const resizeTimelineContainerMove = (event: any) => {
    if (resizeDown !== true) return;

    const moveY = event.clientY - moveStartY;
    resizeTimeLineContainer(moveY);
};
export const resizeTimelineContainerUp = () => {
    console.log('resizeTimelineContainerUp');

    window.removeEventListener('mousemove', resizeTimelineContainerMove);
    window.removeEventListener('mouseup', resizeTimelineContainerUp);

    removeResizeCursor();

    resizeDown = false;
    moveStartY = 0;
    orgTimeLineHeight = 0;
};
const resizeTimeLineContainer = (y: number) => {
    // const workSpaceHeight = $(".workspace").height();

    // 타임 라인 높이 설정
    let newTimeLineHeight = orgTimeLineHeight - y;
    if (newTimeLineHeight < 0) newTimeLineHeight = 0; // 0 보다 작으며 정지
    $('.timeline-body-elements').css('height', newTimeLineHeight);

    // 진행바 높이 설정 (진행바 헤더 부분 높이 추가)
    const progressBarBoxHeight =
        $('.timeline-body-top-tracks-header').height() || 0;
    const newProgressLineHeight = newTimeLineHeight + progressBarBoxHeight;
    $('.progressline').css('height', newProgressLineHeight);

    const headerHeight = $('.header').outerHeight() || 0;
    //    const resizeHandleHeight = $('.timeline-resize-handle').outerHeight() || 0;
    const timelineHeight = $('.timeline').outerHeight() || 0;
    const timelineBodyHeight = $('.timeline').outerHeight() || 0;

    // timeline-body-elements 가 0 인경우 timeline-body 숨긴다 (timeline-head 는 남겨둔다)
    let newWorkspaceHeightCssString: string;
    if (newTimeLineHeight === 0) {
        $('.timeline-body').hide();
        newWorkspaceHeightCssString =
            'calc(100vh - ' + (headerHeight + timelineBodyHeight) + 'px)';
    } else {
        $('.timeline-body').show();
        newWorkspaceHeightCssString =
            'calc(100vh - ' + (headerHeight + timelineHeight) + 'px)';
    }

    $('.workspace').css('height', newWorkspaceHeightCssString);
};

/**
 * 선긋기 템플릿 이벤트 설정
 * meoocat-player 에서도 이 소스를 사용하므로 jquery 사용 금지
 */
import * as pages from '../../util/pages';
import { allEventCancel } from '../../util/common';
import {
    // initResultDataList,
    getResultDataList,
    addResultDataList,
    // removeResultDataList,
    getLoadedPageNo,
} from '../../util/preview';
import { ETemplateType } from '../../const/types';

let mDown = false;
let mDownX = 0;
let mDownY = 0;
let mDownLineObj: any = null;
let mDownPointObj: any = null;
let connected = false;
export const setTemplateEvent = () => {
    const svgObj = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
    );
    svgObj.setAttributeNS(null, 'class', 'tpl-line');

    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;
    previewContainer.appendChild(svgObj);

    const tplPointList = previewContainer.querySelectorAll('.object.tpl-point');
    if (tplPointList === null || tplPointList.length === 0) return;

    tplPointList.forEach((element: any) => {
        if (element.getAttribute('tpl-object-type') === 'start-point') {
            element.addEventListener('mousedown', function (e: any) {
                setLineTemplateEvent_Down(e, element);
            });
            element.addEventListener('mouseenter', (e: any) => {
                setLineTemplateEvent_Enter(e, element);
            });
            element.addEventListener('mouseleave', (e: any) => {
                setLineTemplateEvent_Leave(e, element);
            });
        } else if (element.getAttribute('tpl-object-type') === 'end-point') {
            element.addEventListener('mousedown', function (e: any) {
                setLineTemplateEvent_Down(e, element);
            });
            element.addEventListener('mouseenter', (e: any) => {
                setLineTemplateEvent_Enter(e, element);
            });
            element.addEventListener('mouseleave', (e: any) => {
                setLineTemplateEvent_Leave(e, element);
            });
        }
    });

    drawDataLine();
    setConnectResult();
};

const setLineTemplateEvent_Leave = (e: any, elem: any) => {
    if (mDown !== true) return;
    if (mDownLineObj === null) return;
    if (mDownPointObj === null) return;

    // 같은 포인트에 연결 시도시 취소
    if (
        mDownPointObj.classList.contains('start') &&
        elem.classList.contains('start')
    )
        return;
    if (
        mDownPointObj.classList.contains('end') &&
        elem.classList.contains('end')
    )
        return;

    console.log('svg mouseleave');

    const startType = elem.classList.contains('end') ? 'q' : 'a';

    // 연결 취소 처리
    if (startType === 'q') {
        mDownPointObj.setAttribute('tpl-ano', '');
        elem.setAttribute('tpl-qno', '');
    } else {
        mDownPointObj.setAttribute('tpl-qno', '');
        elem.setAttribute('tpl-ano', '');
    }

    // 정답 선 색상 복원
    // mDownLineObj.classList.remove('correct');
    // mDownPointObj.classList.remove('correct');

    connected = false;
};
const setLineTemplateEvent_Enter = (e: any, elem: any) => {
    if (mDown !== true) return;
    if (mDownLineObj === null) return;
    if (mDownPointObj === null) return;

    // 같은 포인트에 연결 시도시 취소
    if (
        mDownPointObj.classList.contains('start') &&
        elem.classList.contains('start')
    )
        return;
    if (
        mDownPointObj.classList.contains('end') &&
        elem.classList.contains('end')
    )
        return;

    console.log('svg mouseenter');

    // 연결 선 고정 처리
    const moveX = elem.offsetLeft + (elem.offsetWidth || 0) / 2;
    const moveY = elem.offsetTop + (elem.offsetHeight || 0) / 2;
    mDownLineObj.setAttribute('x2', moveX);
    mDownLineObj.setAttribute('y2', moveY);

    const startType = elem.classList.contains('end') ? 'q' : 'a';

    // 이미 연결된 점이면 무시
    if (startType === 'q') {
        if (elem.getAttribute('tpl-qno')) {
            return;
        }

        // 연결처리
        mDownPointObj.setAttribute('tpl-ano', elem.getAttribute('tpl-ano'));
        elem.setAttribute('tpl-qno', mDownPointObj.getAttribute('tpl-qno'));

        // 정답 시 선 색상 변경
        // if (
        //     mDownPointObj.getAttribute('tpl-ano') ===
        //     mDownPointObj.getAttribute('tpl-cno')
        // ) {
        //     mDownLineObj.classList.add('correct');
        //     mDownPointObj.classList.add('correct');
        // } else {
        //     mDownLineObj.classList.remove('correct');
        //     mDownPointObj.classList.remove('correct');
        // }
    } else {
        if (elem.getAttribute('tpl-ano')) {
            return;
        }

        // 연결처리
        mDownPointObj.setAttribute('tpl-qno', elem.getAttribute('tpl-qno'));
        elem.setAttribute('tpl-ano', mDownPointObj.getAttribute('tpl-ano'));

        // 정답 시 선 색상 변경
        // if (elem.getAttribute('tpl-ano') === elem.getAttribute('tpl-cno')) {
        //     mDownLineObj.classList.add('correct');
        //     elem.classList.add('correct');
        // } else {
        //     mDownLineObj.classList.remove('correct');
        //     elem.classList.remove('correct');
        // }

        // mDownLineObj id update
        const lineId = 'lineQNo' + elem.getAttribute('tpl-qno');
        mDownLineObj.setAttribute('id', lineId);
    }

    connected = true;
};

const setLineTemplateEvent_Down = (e: any, elem: any) => {
    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;
    const svgObj = previewContainer.querySelector('svg.tpl-line');
    if (svgObj === null) return;

    const startType = elem.classList.contains('start') ? 'q' : 'a';

    // const lineId = startType === 'q' ? 'lineQNo'+elem.getAttribute('tpl-qno') : 'lineANo0';
    const lineId = elem.getAttribute('tpl-qno')
        ? 'lineQNo' + elem.getAttribute('tpl-qno')
        : 'lineANo000';
    const currLineObj = document.getElementById(lineId);
    if (currLineObj !== null) {
        // svgObj.removeChild(currLineObj);
        currLineObj.parentNode?.removeChild(currLineObj);

        // question -> answer 방향인경우
        if (startType === 'q') {
            // 현재 element 의 tpl-ano 값 제거
            elem.setAttribute('tpl-ano', '');

            // 현재 element와 같은 tpl-qno 이 세팅된 answer 객체를 찾아서 tpl-qno 를 지운다.
            const answerObj = previewContainer.querySelector(
                '.object.tpl-point.end[tpl-qno="' +
                    elem.getAttribute('tpl-qno') +
                    '"]',
            );
            if (answerObj !== null) {
                answerObj.setAttribute('tpl-qno', '');
            }

            // elem.classList.remove('correct');

            // answer -> question 방향인경우
        } else {
            // 현재 element 의 tpl-qno 값 제거
            elem.setAttribute('tpl-qno', '');

            // 현재 element와 같은 tpl-ano 이 세팅된 question 객체를 찾아서 tpl-ano 를 지운다.
            const questionObj = previewContainer.querySelector(
                '.object.tpl-point.start[tpl-ano="' +
                    elem.getAttribute('tpl-ano') +
                    '"]',
            );
            if (questionObj !== null) {
                questionObj.setAttribute('tpl-ano', '');
            }
        }
    }

    console.log('svg mousedown');
    mDown = true;
    mDownX = e.clientX;
    mDownY = e.clientY;

    const lineObj = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line',
    );
    const startX = elem.offsetLeft + (elem.offsetWidth || 0) / 2;
    const startY = elem.offsetTop + (elem.offsetHeight || 0) / 2;

    lineObj.setAttributeNS(null, 'x1', String(startX));
    lineObj.setAttributeNS(null, 'y1', String(startY));
    lineObj.setAttributeNS(null, 'x2', String(startX));
    lineObj.setAttributeNS(null, 'y2', String(startY));
    lineObj.setAttributeNS(null, 'id', lineId);
    svgObj.appendChild(lineObj);

    mDownLineObj = lineObj;
    mDownPointObj = elem;

    window.addEventListener('mousemove', setLineTemplateEvent_Move);
    window.addEventListener('mouseup', setLineTemplateEvent_Up);

    allEventCancel(e);
};
const setLineTemplateEvent_Move = (e: any) => {
    if (mDown !== true) return;
    if (mDownLineObj === null) return;
    if (mDownPointObj === null) return;
    if (connected === true) return;

    console.log('svg mousemove');

    const moveX = e.clientX - mDownX;
    const moveY = e.clientY - mDownY;

    mDownLineObj.setAttribute(
        'x2',
        Number(mDownLineObj.getAttribute('x1')) + moveX,
    );
    mDownLineObj.setAttribute(
        'y2',
        Number(mDownLineObj.getAttribute('y1')) + moveY,
    );
};
const setLineTemplateEvent_Up = () => {
    console.log('svg mouseup');
    if (mDown !== true) return;
    if (mDownLineObj === null) return;
    if (mDownPointObj === null) return;

    const startType = mDownPointObj.classList.contains('start') ? 'q' : 'a';

    if (startType === 'q') {
        if (
            mDownPointObj.getAttribute('tpl-ano') === null ||
            mDownPointObj.getAttribute('tpl-ano') === ''
        ) {
            mDownLineObj.parentNode.removeChild(mDownLineObj);
            mDownPointObj.classList.remove('correct');
        }
    } else {
        if (
            mDownPointObj.getAttribute('tpl-qno') === null ||
            mDownPointObj.getAttribute('tpl-qno') === ''
        ) {
            mDownLineObj.parentNode.removeChild(mDownLineObj);
            mDownPointObj.classList.remove('correct');
        }
    }

    mDown = false;
    mDownLineObj = null;
    mDownPointObj = null;
    connected = false;
    // mStartObjType = 'q';

    setConnectResult();

    window.removeEventListener('mousemove', setLineTemplateEvent_Move);
    window.removeEventListener('mouseup', setLineTemplateEvent_Up);
};
const setConnectResult = () => {
    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;
    const previewPageObj = pages.getPageObject(previewContainer);
    if (previewPageObj === null) return;

    const startPointList = previewContainer.querySelectorAll(
        '.object.tpl-point.start',
    );
    let lineResult: any = null;
    const qnoList: any[] = [];
    const anoList: any[] = [];
    const cnoList: any[] = [];
    let correctFlag = true;
    startPointList.forEach((startPoint: any) => {
        const qno = startPoint.getAttribute('tpl-qno');
        const ano = startPoint.getAttribute('tpl-ano');
        const cno = startPoint.getAttribute('tpl-cno');
        if (ano !== cno) {
            correctFlag = false;
        }
        qnoList.push(qno);
        anoList.push(ano);
        cnoList.push(cno);
    });
    lineResult = {
        key: previewPageObj.id,
        page: getLoadedPageNo(),
        type: ETemplateType.line,
        qno: qnoList,
        ano: anoList,
        cno: cnoList,
        correct: correctFlag,
    };
    addResultDataList(lineResult);
};

// 데이터를 이용해 선 긋기 (데이터가 있는 페이지 이전/다음 이동시)
const drawDataLine = () => {
    const lineResultDataList = getResultDataList();
    console.log('drawDataLine', lineResultDataList);

    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;
    const previewPageObj = pages.getPageObject(previewContainer);
    if (previewPageObj === null) return;
    const resultData = lineResultDataList.find(
        currData => currData.key === previewPageObj.id,
    );
    if (resultData === undefined) return;

    const startPointList = previewContainer.querySelectorAll(
        '.object.tpl-point.start',
    );
    const svgObj = previewContainer.querySelector('svg.tpl-line');
    if (svgObj === null) return;
    svgObj.innerHTML = '';

    startPointList.forEach((startPoint: any, index: number) => {
        const dataQno = resultData.qno[index];
        const dataAno = resultData.ano[index];
        // const dataCno = resultData.cno[index];
        if (dataAno === '') {
            return false;
        }

        // 데이터값으로 현재 question에 연결된 answer 찾기
        const endPoint = previewContainer.querySelector(
            '.object.tpl-point.end[tpl-ano="' + dataAno + '"]',
        ) as any;
        if (endPoint === null) return false;

        startPoint.setAttribute('tpl-ano', dataAno);
        endPoint.setAttribute('tpl-qno', dataQno);

        const lineObj = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line',
        );
        const lineId = 'lineQNo' + dataQno;

        const x1 = startPoint.offsetLeft + (startPoint.offsetWidth || 0) / 2;
        const y1 = startPoint.offsetTop + (startPoint.offsetHeight || 0) / 2;
        const x2 = endPoint.offsetLeft + (endPoint.offsetWidth || 0) / 2;
        const y2 = endPoint.offsetTop + (endPoint.offsetHeight || 0) / 2;

        // if (dataAno === dataCno) {
        //     lineObj.setAttributeNS(null, 'class', 'correct');
        // }
        lineObj.setAttributeNS(null, 'x1', String(x1));
        lineObj.setAttributeNS(null, 'y1', String(y1));
        lineObj.setAttributeNS(null, 'x2', String(x2));
        lineObj.setAttributeNS(null, 'y2', String(y2));
        lineObj.setAttributeNS(null, 'id', lineId);
        svgObj.appendChild(lineObj);
    });
};

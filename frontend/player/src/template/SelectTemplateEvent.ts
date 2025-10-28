/**
 * 사지선다 템플릿 이벤트 설정
 */
import {
    parseJsonData,
    getPreviewContainer,
    getPreviewPageObject,
} from '../util';
import { ETemplete_Object_Type, ETemplateType } from '../types';
import * as CommonEvent from './CommonEvent';

export const setTemplateEvent = () => {
    const svgObj = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
    );
    svgObj.setAttributeNS(null, 'class', 'tpl-line');
    svgObj.style.zIndex = '101';

    const previewContainer = getPreviewContainer();
    if (previewContainer === null) return;
    previewContainer.appendChild(svgObj);

    const tplPointList = previewContainer.querySelectorAll('.object');
    if (tplPointList === null || tplPointList.length === 0) return;

    tplPointList.forEach((element: any) => {
        if (
            element.getAttribute('tpl-object-type') ===
                ETemplete_Object_Type.endPoint ||
            element.getAttribute('tpl-object-type') ===
                ETemplete_Object_Type.answer
        ) {
            element.addEventListener('click', setLineTemplateEvent_Click);
        }
    });

    drawDataLine();
    setConnectResult();
};

const setLineTemplateEvent_Click = (e: MouseEvent) => {
    console.log('setLineTemplateEvent_Click');

    let selectPoint = e.currentTarget as HTMLDivElement;
    const aNo = selectPoint.getAttribute('tpl-ano');
    if (aNo === null) return;
    console.log('aNo : ', aNo);

    const previewContainer = getPreviewContainer();
    if (previewContainer === null) return;

    const multiSelect = parseJsonData(
        previewContainer
            .querySelector(
                `.object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
            )
            ?.getAttribute('tpl-multi-select'),
    ) as boolean | false;
    console.log('multiSelect : ', multiSelect);

    // 텍스트 박스를 클릭했으면 포인트 클릭한것으로 처리
    if (selectPoint.getAttribute('tpl-object-type') === 'answer') {
        selectPoint = previewContainer.querySelector(
            `.object[tpl-object-type="${ETemplete_Object_Type.endPoint}"][tpl-ano="${aNo}"]`,
        ) as HTMLDivElement;
    }

    const svgObj = previewContainer.querySelector('svg.tpl-line');
    if (svgObj === null) return;

    let addCircle = false;
    if (multiSelect !== true) {
        // $(svgObj).children('circle').remove();
        svgObj.innerHTML = '';
        addCircle = true;
    } else {
        const orgCircleObj = previewContainer.querySelector(
            `svg.tpl-line circle[select-ano="${aNo}"]`,
        );
        if (orgCircleObj !== null) {
            // $(orgCircleObj).remove();
            svgObj.removeChild(orgCircleObj);
            addCircle = false;
        } else {
            addCircle = true;
        }
    }

    if (addCircle === true) {
        const circleObj = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle',
        );
        circleObj.setAttributeNS(null, 'select-ano', `${aNo}`);
        circleObj.setAttributeNS(
            null,
            'cx',
            String(selectPoint.offsetLeft + selectPoint.offsetWidth / 2),
        );
        circleObj.setAttributeNS(
            null,
            'cy',
            String(selectPoint.offsetTop + selectPoint.offsetHeight / 2),
        );
        circleObj.setAttributeNS(
            null,
            'r',
            String(selectPoint.offsetWidth / 2 - 3),
        );
        circleObj.setAttributeNS(null, 'stroke', 'blue');
        circleObj.setAttributeNS(null, 'stroke-width', '5');
        circleObj.setAttributeNS(null, 'fill', 'transparent');
        svgObj.appendChild(circleObj);
    }

    setConnectResult();
};

const setConnectResult = () => {
    const previewContainer = getPreviewContainer();
    if (previewContainer === null) return;
    const previewPageObj = getPreviewPageObject();
    if (previewPageObj === null) return;

    const qnoList = [
        Number(
            previewContainer
                .querySelector(
                    `.object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
                )
                ?.getAttribute('tpl-qno'),
        ),
    ];
    const cnoList = parseJsonData(
        previewContainer
            .querySelector(
                `.object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
            )
            ?.getAttribute('tpl-cno'),
    );

    const selectObjList = previewContainer.querySelectorAll(
        `svg.tpl-line circle`,
    ) as NodeListOf<HTMLElement>;
    const anoList: number[] = [];
    selectObjList.forEach((element: any) => {
        anoList.push(Number(element.getAttribute('select-ano')));
    });

    // qnoList.push(qno);
    // anoList.push(ano);
    // cnoList.push(cno);
    anoList.sort();
    cnoList.sort();

    const correctFlag =
        JSON.stringify(anoList) === JSON.stringify(cnoList) ? true : false;

    const lineResult = {
        key: previewPageObj?.id,
        page: CommonEvent.getLoadedPageNo(),
        type: ETemplateType.line,
        qno: qnoList,
        ano: anoList,
        cno: cnoList,
        correct: correctFlag,
    };
    CommonEvent.addResultDataList(lineResult);
};

// 데이터를 이용해 선 긋기 (데이터가 있는 페이지 이전/다음 이동시)
const drawDataLine = () => {
    const lineResultDataList = CommonEvent.getResultDataList();
    console.log('drawDataLine', lineResultDataList);

    // const previewContainer = pages.getPreviewCanvasObject();
    // const previewPageObj = pages.getPageObject(previewContainer);
    const previewContainer = getPreviewContainer();
    if (previewContainer === null) return;
    const previewPageObj = getPreviewPageObject();
    if (previewPageObj === null) return;
    const resultData = lineResultDataList.find(
        currData => currData.key === previewPageObj.id,
    );
    if (resultData === undefined) return;

    const endPointList = previewContainer.querySelectorAll(
        '.object.tpl-point.end',
    );
    const svgObj = previewContainer.querySelector('svg.tpl-line');
    if (svgObj === null) return;
    svgObj.innerHTML = '';

    // const qNo = resultData.qno[0];
    const aNoList = resultData.ano;
    // const cNoList = resultData.cno;

    // 선택된 정답이 없으면 종료
    if (aNoList.length === '') {
        return;
    }

    previewContainer
        .querySelector(
            `.object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
        )
        ?.setAttribute('tpl-ano', aNoList[0]);

    endPointList.forEach((endPoint: any) => {
        const currAno = Number(endPoint.getAttribute('tpl-ano'));
        if (aNoList.indexOf(currAno) > -1) {
            const circleObj = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'circle',
            );
            circleObj.setAttributeNS(
                null,
                'cx',
                String(endPoint.offsetLeft + endPoint.offsetWidth / 2),
            );
            circleObj.setAttributeNS(
                null,
                'cy',
                String(endPoint.offsetTop + endPoint.offsetHeight / 2),
            );
            circleObj.setAttributeNS(
                null,
                'r',
                String(endPoint.offsetWidth / 2 - 3),
            );
            circleObj.setAttributeNS(null, 'select-ano', `${currAno}`);
            circleObj.setAttributeNS(null, 'stroke', 'blue');
            circleObj.setAttributeNS(null, 'stroke-width', '5');
            circleObj.setAttributeNS(null, 'fill', 'transparent');
            svgObj.appendChild(circleObj);
        }
    });
};

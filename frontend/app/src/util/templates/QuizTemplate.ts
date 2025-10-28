import $ from 'jquery';
import {
    // IshapeInfo,
    // IstyleInfo,
    // IstretchCssInfo,
    // IobjectSizeInfo,
    // IpageSizeInfo,
    EundoStackAddType,
    ETemplateType,
    EobjectType,
    ETemplete_Object_Type,
    ETemplate_Direction,
    ETextEditorToolsName,
    // IinteractionsInfo,
} from '../../const/types';
import * as objects from '../objects';
import * as pages from '../pages';
import { createTextBox } from '../texteditor';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import * as CommonEvent from '../../event/CommonEvent';
import { showToastMessage, hideToastMessage } from '../dialog';
import * as dostack from '../dostack';
// import * as common from '../common';
import {
    // getInteractionsName,
    // getUniqId,
    parseJsonData,
    // getInteractionIdHead,
} from '../common';
// import * as interactions from '../interactions';

/* interface */
interface ITemplate_User_Answer {
    no: number;
    text: string;
    noText: string;
}
interface ITemplate_User_QuestionSet {
    questionNo: number;
    questionText: string;
    questionType: 'select' | 'input';
    answerList: ITemplate_User_Answer[];
    correct?: number[];
    multiSelect?: boolean;
}
interface ITemplate_Preset {
    page: {
        width: number;
        height: number;
    };
    question: {
        question: {
            top: number;
            left: number;
            width: number;
            height: number;
            text: string;
            background: string;
            border: string;
            fontsize: number;
            margin: number;
        };
        item: {
            margin: number;
            left: number;
            width: number;
            height: number;
            background: string;
            border: string;
            fontsize: number;
        };
        point: {
            margin: number;
            width: number;
            height: number;
            background: string;
            fontsize: number;
        };
        inputbox: {
            margin: number;
            left: number;
            width: number;
            height: number;
            background: string;
            border: string;
            fontsize: number;
        };
    };
}

let QuestionDataSet: ITemplate_User_QuestionSet[] = [];
let TemplatePreset: ITemplate_Preset;
const TemplatePresetList: ITemplate_Preset[] = [
    {
        page: {
            width: 820,
            height: 1180,
        },
        question: {
            question: {
                top: 70,
                left: 75,
                width: 670,
                height: 35,
                text: 'TITLE',
                background: '',
                border: '0',
                fontsize: 20,
                margin: 15,
            },
            item: {
                margin: 5,
                left: 80,
                width: 600,
                height: 25,
                background: '',
                border: '0px solid #888888',
                fontsize: 15,
            },
            point: {
                margin: 20,
                width: 25,
                height: 25,
                background: '',
                fontsize: 15,
            },
            inputbox: {
                margin: 5,
                left: 80,
                width: 100,
                height: 25,
                background: '',
                border: '0px solid #888888',
                fontsize: 15,
            },
        },
    },
];
export const getDefaultTemplatePreset = (
    templateIndex = 0,
): ITemplate_Preset => {
    return TemplatePresetList[templateIndex];
};
export const getDefalultJsonData = (): ITemplate_User_QuestionSet[] => {
    return [
        {
            questionNo: 1,
            questionText: "What did Drake's  mom say to the soldier?",
            questionType: 'select', //'input'
            answerList: [
                {
                    no: 1,
                    noText: 'ⓐ',
                    text: 'A worm said, "Hello, little boy."',
                },
                { no: 2, noText: 'ⓑ', text: 'It started to rain.' },
                { no: 3, noText: 'ⓒ', text: 'A solder came to get Drake.' },
            ],
            correct: [1],
            multiSelect: false,
        },
        {
            questionNo: 2,
            questionText: "What did Drake's  mom say to the soldier2?",
            questionType: 'select', //'input'
            answerList: [
                {
                    no: 1,
                    noText: 'ⓐ',
                    text: 'A worm said, "Hello, little boy2."',
                },
                { no: 2, noText: 'ⓑ', text: 'It started to rain2.' },
                { no: 3, noText: 'ⓒ', text: 'A solder came to get Drake2.' },
            ],
            correct: [2],
            multiSelect: false,
        },
        {
            questionNo: 3,
            questionText: "Let's turn off our cellphones, or we'll be __ __",
            questionType: 'input',
            answerList: [
                {
                    no: 1,
                    noText: 'trouble',
                    text: '입력란1',
                },
                { no: 2, noText: 'in', text: '입력란2' },
            ],
        },
    ];
};
TemplatePreset = getDefaultTemplatePreset();

const setQuestionDataSet = (dataset: ITemplate_User_QuestionSet[] = []) => {
    return (QuestionDataSet =
        dataset.length > 0 ? dataset : getDefalultJsonData());
};

export const loadTemplateData = (
    dataset: ITemplate_User_QuestionSet[] = [],
) => {
    console.log('loadTemplateData Call');

    // 모든 셀렉션 해제
    CommonEvent.removeSelectors();

    // 문제 데이터 불러오기
    const questionDataList = setQuestionDataSet(dataset);

    try {
        setTempatePage(questionDataList);
    } catch (e) {
        console.log(e);
    }
};

// 현재 페이지에 적용
export const setTempatePage = (
    questionDataList: ITemplate_User_QuestionSet[],
) => {
    if (questionDataList.length === 0) return;

    // // 페이지 내용 비우기
    // pages.emptyCanvasContent();

    // // 페이지 생성
    // const canvasObj = pages.getCanvasObject();
    // const pageObj = pages.createPageObject();
    // canvasObj.appendChild(pageObj);

    // 데이터 세팅
    showToastMessage('템플릿을 불러오는 중입니다.', 10000, false);
    // let delayTime = 0;
    pages.setTempatePage(ETemplateType.quiz);

    questionDataList.map((questionData, index) => {
        makeBodyContentBox(questionData, index);
        if (index >= questionDataList.length - 1) {
            hideToastMessage();
            dostack.addUndoStack('', EundoStackAddType.all);
        }
    });
    applyTemplatePreset();

    setTimeout(() => {
        docData.setDocPageContent($('#idx_canvas_sheet').html());
        dostack.addUndoStack('', EundoStackAddType.all);
    }, 500);
};
// 객관식 선택 오브젝트 생성
const makeAnswerUnit = (
    answerList: ITemplate_User_Answer[],
    dataIndex = 0,
    questionType: string,
) => {
    answerList.map((answer: ITemplate_User_Answer) => {
        const questionNo = QuestionDataSet[dataIndex].questionNo;

        // 객관식
        if (questionType === 'select') {
            // 답 포인트 오브젝트 생성
            const pointObj = objects.createNewObject(
                EobjectType.square,
                `${questionNo}-${answer.no}. answer - checkpoint`,
            ) as HTMLDivElement;
            $(pointObj).attr('tpl-object-type', ETemplete_Object_Type.endPoint);
            $(pointObj).attr('tpl-question-type', questionType);
            $(pointObj).attr('tpl-ano', answer.no);
            $(pointObj).attr('tpl-qno', questionNo);
            $(pointObj).addClass('tpl-point');
            $(pointObj).addClass('end');

            const textBox2 = createTextBox(
                String(answer.noText),
                TemplatePreset.question.point.fontsize,
                ETextEditorToolsName.center,
                { top: 0, right: 0, bottom: 0, left: 0 },
            );
            pointObj.appendChild(textBox2);
            workInfo.addObjectList(pointObj);

            // 답 텍스트 오브젝트 생성
            const answerObj = objects.createNewObject(
                EobjectType.square,
                `${questionNo}-${answer.no}. answer - text`,
            ) as HTMLDivElement;
            $(answerObj).attr('tpl-object-type', ETemplete_Object_Type.answer);
            $(answerObj).attr('tpl-question-type', questionType);
            $(answerObj).attr('tpl-ano', answer.no);
            $(answerObj).attr('tpl-qno', questionNo);
            // 텍스트 박스 생성
            const textBox = createTextBox(
                answer.text,
                TemplatePreset.question.item.fontsize,
                ETextEditorToolsName.left,
                { top: 3, right: 3, bottom: 3, left: 0 },
            );
            answerObj.appendChild(textBox);
            workInfo.addObjectList(answerObj);

            // 주관식
        } else if (questionType === 'input') {
            const inputObj = objects.createNewObject(
                EobjectType.square,
                `${questionNo}-${answer.no}. answer - input`,
            ) as HTMLDivElement;
            $(inputObj).attr('tpl-object-type', ETemplete_Object_Type.answer);
            $(inputObj).attr('tpl-question-type', questionType);
            $(inputObj).attr('tpl-ano', answer.no);
            $(inputObj).attr('tpl-qno', questionNo);
            $(inputObj).attr('valid', answer.noText);
            objects.addInputBoxObject(inputObj, answer.text);
            workInfo.addObjectList(inputObj);
        }
    });
    // applyTemplatePreset(ETemplete_Object_Type.answer);
};

const makeQuestionBox = (
    questionInfo: ITemplate_User_QuestionSet,
    questionType: string,
) => {
    const questionObj = objects.createNewObject(
        EobjectType.square,
        `${questionInfo.questionNo}. question - text`,
    ) as HTMLDivElement;

    const textBox = createTextBox(
        questionInfo.questionNo + '. ' + questionInfo.questionText,
        TemplatePreset.question.question.fontsize,
        ETextEditorToolsName.left,
        { top: 3, right: 3, bottom: 3, left: 0 },
    );
    questionObj.appendChild(textBox);
    $(questionObj).attr('tpl-object-type', ETemplete_Object_Type.question);
    $(questionObj).attr('tpl-question-type', questionType);
    $(questionObj).attr('tpl-qno', questionInfo.questionNo);
    $(questionObj).attr('tpl-ano', JSON.stringify([]));
    $(questionObj).attr('tpl-cno', JSON.stringify(questionInfo.correct));
    $(questionObj).attr(
        'tpl-multi-select',
        questionInfo.multiSelect === undefined
            ? 'false'
            : JSON.stringify(questionInfo.multiSelect),
    );

    // 문제 텍스트 박스 생성
    // applyTemplatePreset(ETemplete_Object_Type.question);
    workInfo.addObjectList(questionObj);
};

const makeBodyContentBox = (
    questionDataInfo: ITemplate_User_QuestionSet,
    dataIndex = 0,
) => {
    const pageNo = docData.getCurrPage();

    console.log('makeBodyContentBox pageNo : ', pageNo);

    // const questionIndex = pageNo - 1;
    // const questionInfo = getTemplateQuestion()[dataIndex];
    const questionInfo = questionDataInfo;
    console.log('questionInfo : ', questionInfo);
    if (questionInfo === null) return;

    // 1. 페이지 설정
    // pages.setPageName('Page-' + (pageNo > 9 ? pageNo : '0' + pageNo));
    pages.setPageSize(
        {
            width: TemplatePreset.page.width,
            height: TemplatePreset.page.height,
        },
        false,
    );
    // pages.setTempatePage(ETemplateType.select);

    /**
     *  {
            title: 'TITLE',
            question: 'QUESTION',
            answerList: [
                { no: 1, text: 'Answer1' },
                { no: 2, text: 'Answer2' },
                { no: 3, text: 'Answer3' },
                { no: 4, text: 'Answer4' },
                // { no: 5, text: 'Answer5' },
            ],
            correct: 1,
        },
     */
    // 3. 문제 오브젝트 생성
    makeQuestionBox(questionInfo, questionInfo.questionType);

    // 4. 답변 오브젝트 생성
    makeAnswerUnit(
        questionDataInfo.answerList,
        dataIndex,
        questionInfo.questionType,
    );

    // 각 문제 답변 위치 조정
    // applyTemplatePreset(ETemplete_Object_Type.all);
    // pages.setTempatePage(ETemplateType.select);
};

// const getTemplateQuestion = () => {
//     if (QuestionDataSet.length === 0) {
//         QuestionDataSet = getDefalultJsonData();
//     }
//     console.log('getTemplateQuestion : ', QuestionDataSet);
//     return QuestionDataSet;
// };

export const showCorrectNo = () => {
    const currObjectList = workInfo.getObjectList();
    const answerObjList: HTMLDivElement[] = [];
    currObjectList.forEach(obj => {
        if ($(obj).attr('tpl-object-type') === 'answer') {
            answerObjList.push(obj as HTMLDivElement);
        }
    });

    if (answerObjList.length === 0) return;
    const canvasShadowObject = pages.getCanvasShadowObject();

    const qList = document.querySelectorAll(
        `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
    );
    console.log('qList : ', qList);

    qList.forEach(qObj => {
        const qNo = $(qObj).attr('tpl-qno');
        const cNoList = parseJsonData($(qObj).attr('tpl-cno')) as number[];
        const qType = $(qObj).attr('tpl-question-type');

        // 객관식
        if (qType === 'select') {
            const aList = document.querySelectorAll(
                `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.endPoint}"][tpl-qno="${qNo}"]`,
            );
            console.log('aList : ', aList);
            aList.forEach(aObj => {
                console.log(qNo + ' - ', $(aObj).attr('tpl-ano'));
                console.log('qType : ', qType);
                const aNo = Number($(aObj).attr('tpl-ano') || 0);

                if (cNoList.indexOf(aNo) > -1) {
                    const markObj = document.createElement('div');
                    markObj.setAttribute('class', `tpl-ans-mark ${qType}`);
                    canvasShadowObject.appendChild(markObj);
                    $(markObj).css({
                        left: $(aObj).css('left'),
                        top: $(aObj).css('top'),
                        width: $(aObj).css('width'),
                        height: $(aObj).css('height'),
                    });
                }
            });
        }

        // 주관식
        if (qType === 'input') {
            const aList = document.querySelectorAll(
                `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.answer}"][tpl-qno="${qNo}"]`,
            );
            console.log('aList : ', aList);
            aList.forEach(aObj => {
                console.log(qNo + ' - ', $(aObj).attr('tpl-ano'));
                console.log('qType : ', qType);
                const valid = $(aObj).attr('valid') || '';

                if (valid !== '') {
                    const markObj = document.createElement('div');
                    markObj.setAttribute('class', `tpl-ans-mark ${qType}`);
                    markObj.innerText = valid;
                    canvasShadowObject.appendChild(markObj);
                    $(markObj).css({
                        left: $(aObj).css('left'),
                        top: $(aObj).css('top'),
                        width: $(aObj).css('width'),
                        height: $(aObj).css('height'),
                    });
                }
            });
        }
    });

    // qList.each((index, qObj) => {
    //     const qNo = $(qObj).attr('tpl-qno');
    //     const cNo = parseJsonData($(qObj).attr('tpl-cno')) as number[];

    // });

    return;

    /*
    // svg 생성
    const orgSvgObj = canvasShadowObject.querySelector('svg');
    if (orgSvgObj) {
        $(canvasShadowObject).children('svg.tpl-line').remove();
    }

    const pageSize = pages.getPageSize();
    const svgObj = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
    );
    svgObj.setAttributeNS(null, 'class', 'tpl-line');
    $(svgObj).css({
        width: pageSize.width,
        height: pageSize.height,
    });
    //    svgObj.style.zIndex = '101';
    canvasShadowObject.appendChild(svgObj);

    const canvasObject = pages.getCanvasObject();
    const selectPointList = canvasObject.querySelectorAll(
        `.object.tpl-point.end`,
    ) as NodeListOf<HTMLDivElement>;
    console.log('selectPointList : ', selectPointList);
    selectPointList.forEach((selectPoint: HTMLDivElement, index) => {
        const currANo = Number(selectPoint.getAttribute('tpl-ano'));
        console.log('currANo : ', currANo);

        if (currANo && correctNoList.indexOf(currANo) > -1) {
            // svg circle 생성
            const lineObj = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'circle',
            );

            lineObj.setAttributeNS(
                null,
                'cx',
                String(selectPoint.offsetLeft + selectPoint.offsetWidth / 2),
            );
            lineObj.setAttributeNS(
                null,
                'cy',
                String(selectPoint.offsetTop + selectPoint.offsetHeight / 2),
            );
            lineObj.setAttributeNS(
                null,
                'r',
                String(selectPoint.offsetWidth / 2 - 3),
            );
            lineObj.setAttributeNS(null, 'stroke', 'blue');
            lineObj.setAttributeNS(null, 'stroke-width', '5');
            lineObj.setAttributeNS(null, 'fill', 'transparent');
            svgObj.appendChild(lineObj);
        }
    });
    */
};

export const setApplyDefaultTemplatePreset = (templateNo = 0) => {
    setTemplatePreset(null, templateNo);
    applyTemplatePreset();
};
export const setTemplatePreset = (
    presetData: ITemplate_Preset | null,
    templateNo = 0,
) => {
    if (presetData === null) {
        TemplatePreset = getDefaultTemplatePreset(templateNo);
    } else {
        TemplatePreset = presetData;
    }
};

const applyTemplatePreset = () => {
    //TemplatePreset
    console.log('applyTemplatePreset : ', TemplatePreset);

    const canvasObj = pages.getCanvasObject();
    // const currObjectList = workInfo.getObjectList();
    const questionInfoList = canvasObj.querySelectorAll(
        '#idx_canvas_sheet .object[tpl-object-type="question"], #idx_canvas_sheet .object[tpl-object-type="answer"]',
    ) as NodeListOf<HTMLDivElement>;
    console.log('questionInfoList : ', questionInfoList);

    const questionObjList: any[] = [];
    questionInfoList.forEach((questionInfo: any) => {
        const tplObjectType =
            questionInfo.getAttribute('tpl-object-type') || '';
        const questionNo = Number(questionInfo.getAttribute('tpl-qno') || 0);
        const answerNo =
            tplObjectType === 'question'
                ? 0
                : Number(questionInfo.getAttribute('tpl-ano') || 0);
        const questionType =
            questionInfo.getAttribute('tpl-question-type') || 'select';
        const questionObj: any = questionInfo;
        questionObj.tplObjectType = tplObjectType;
        questionObj.questionNo = questionNo;
        questionObj.answerNo = answerNo;
        questionObj.questionType = questionType;

        questionObjList.push(questionObj);
    });
    const sortedQuestionInfoList = Array.from(questionObjList).sort(
        (a: any, b: any) => {
            if (a.questionNo === b.questionNo) {
                return a.answerNo - b.answerNo;
            } else {
                return a.questionNo - b.questionNo;
            }
        },
    );
    console.log('sortedQuestionInfoList : ', sortedQuestionInfoList);

    let lastTop = 0;
    sortedQuestionInfoList.forEach((questionObj, index) => {
        const questionNo = Number(questionObj.questionNo);
        const questionType = questionObj.questionType;

        if (index === 0) {
            lastTop = TemplatePreset.question.question.top;
        }
        if (questionObj.tplObjectType === 'question') {
            if (index > 0) {
                lastTop += TemplatePreset.question.question.margin;
            }
            $(questionObj).css({
                top: lastTop,
                left: TemplatePreset.question.question.left,
                width: TemplatePreset.question.question.width,
                height: TemplatePreset.question.question.height,
                background: TemplatePreset.question.question.background,
                border: TemplatePreset.question.question.border,
            });
            lastTop += TemplatePreset.question.question.height;
        } else if (questionObj.tplObjectType === 'answer') {
            // end-point

            const answerNo = Number(questionObj.answerNo);

            if (questionType === 'select') {
                lastTop += TemplatePreset.question.item.margin;

                // question end point set
                $(
                    `#idx_canvas_sheet .object[tpl-object-type="end-point"][tpl-qno="${questionNo}"][tpl-ano="${answerNo}"]`,
                ).css({
                    top: lastTop,
                    left: TemplatePreset.question.item.left,
                    width: TemplatePreset.question.point.width,
                    height: TemplatePreset.question.point.height,
                    background: TemplatePreset.question.point.background,
                });
                // question string set
                $(questionObj).css({
                    top: lastTop,
                    left:
                        TemplatePreset.question.item.left +
                        TemplatePreset.question.point.width,
                    width: TemplatePreset.question.item.width,
                    height: TemplatePreset.question.item.height,
                    background: TemplatePreset.question.item.background,
                });
                lastTop += TemplatePreset.question.item.height;
            } else if (questionType === 'input') {
                lastTop += TemplatePreset.question.inputbox.margin;
                $(questionObj).css({
                    top: lastTop,
                    left: TemplatePreset.question.inputbox.left,
                    width: TemplatePreset.question.inputbox.width,
                    height: TemplatePreset.question.inputbox.height,
                    background: TemplatePreset.question.inputbox.background,
                });

                lastTop += TemplatePreset.question.inputbox.height;
            }
        }
    });
};

export const setApplyDirection = (
    direction: ETemplate_Direction = ETemplate_Direction.h,
) => {
    setApplyDefaultTemplatePreset(direction === ETemplate_Direction.h ? 0 : 1);
};

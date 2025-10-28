import $ from 'jquery';
import {
    IshapeInfo,
    IstyleInfo,
    IstretchCssInfo,
    IobjectSizeInfo,
    IpageSizeInfo,
    EundoStackAddType,
    ETemplateType,
    EobjectType,
    // ITemplate_Line_Question,
    // ITemplate_Line_Answer,
    // ITemplate_Line_correct,
    // ITemplate_Line_QuestionSet,
    // ITemplate_Line_QuestionDataSet,
    ETemplete_Object_Type,
    ETemplate_Direction,
} from '../../const/types';
import * as objects from '../objects';
import * as pages from '../pages';
import { createTextBox } from '../texteditor';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import * as CommonEvent from '../../event/CommonEvent';
import { sleep } from '../../util/common';
import { showToastMessage, hideToastMessage } from '../../util/dialog';
import * as dostack from '../../util/dostack';

/* interface */
interface ITemplate_Line_Question {
    no: number;
    text: string;
}
interface ITemplate_Line_Answer {
    no: number;
    text: string;
}
interface ITemplate_Line_correct {
    questionNo: number;
    answerNo: number;
}
interface ITemplate_Line_QuestionSet {
    title: string;
    questionList: ITemplate_Line_Question[];
    answerList: ITemplate_Line_Answer[];
    correctList: ITemplate_Line_correct[];
}
interface ITemplate_Preset {
    page: {
        width: number;
        height: number;
    };
    question: {
        title: {
            top: number;
            width: number;
            height: number;
            text: string;
            background: string;
            border: string;
            fontsize: number;
        };
        item: {
            margin: number;
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
            border: string;
            borderRadius: string;
        };
        layout: ETemplate_Direction;
    };
}

let direction: ETemplate_Direction = ETemplate_Direction.h;
let QuestionDataSet: ITemplate_Line_QuestionSet[] = [];
let TemplatePreset: ITemplate_Preset;
let TemplatePresetList: ITemplate_Preset[] = [
    // horizontal (0)
    {
        page: {
            width: 1280,
            height: 800,
        },
        question: {
            title: {
                top: 100,
                width: 400,
                height: 100,
                text: 'TITLE',
                background: '#f2f2f2',
                border: '1px solid #000000',
                fontsize: 50,
            },
            item: {
                margin: 50,
                width: 400,
                height: 100,
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 25,
            },
            point: {
                margin: 20,
                width: 15,
                height: 15,
                background: '#888888',
                border: '0px solid #888888',
                borderRadius: '50%',
            },
            layout: ETemplate_Direction.h,
        },
    },
    // vertical (1)
    {
        page: {
            width: 1280,
            height: 800,
        },
        question: {
            title: {
                top: 100,
                width: 400,
                height: 100,
                text: 'TITLE2',
                background: '#f2f2f2',
                border: '1px solid #000000',
                fontsize: 50,
            },
            item: {
                margin: 40,
                width: 200,
                height: 100,
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 25,
            },
            point: {
                margin: 20,
                width: 15,
                height: 15,
                background: '#888888',
                border: '0px solid #888888',
                borderRadius: '50%',
            },
            layout: ETemplate_Direction.v,
        },
    },
    // horizontal - wide (2)
    {
        page: {
            width: 1280,
            height: 800,
        },
        question: {
            title: {
                top: 100,
                width: 450,
                height: 100,
                text: 'TITLE2',
                background: '#f2f2f2',
                border: '1px solid #000000',
                fontsize: 50,
            },
            item: {
                margin: 40,
                width: 400,
                height: 80,
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 25,
            },
            point: {
                margin: 20,
                width: 15,
                height: 15,
                background: '#888888',
                border: '0px solid #888888',
                borderRadius: '50%',
            },
            layout: ETemplate_Direction.h,
        },
    },
];
export const getDefaultTemplatePreset = (
    templateIndex: number = 0,
): ITemplate_Preset => {
    return TemplatePresetList[templateIndex];
};
export const getDefalultJsonData = (): ITemplate_Line_QuestionSet[] => {
    return [
        {
            title: 'TITLE',
            questionList: [
                { no: 1, text: 'Question' },
                { no: 2, text: 'Question' },
                { no: 3, text: 'Question' },
                // { no: 4, text: 'Question' },
                // { no: 5, text: 'Question' },
            ],
            answerList: [
                { no: 1, text: 'Answer' },
                { no: 2, text: 'Answer' },
                { no: 3, text: 'Answer' },
                // { no: 4, text: 'Answer' },
                // { no: 5, text: 'Answer' },
            ],
            correctList: [
                { questionNo: 1, answerNo: 2 },
                { questionNo: 2, answerNo: 3 },
                { questionNo: 3, answerNo: 1 },
                // { questionNo: 4, answerNo: 4 },
                // { questionNo: 5, answerNo: 5 },
            ],
        },
    ];
};
TemplatePreset = getDefaultTemplatePreset();

const setQuestionDataSet = (dataset: ITemplate_Line_QuestionSet[] = []) => {
    return (QuestionDataSet =
        dataset.length > 0 ? dataset : getDefalultJsonData());
};

export const loadTemplateData = (
    dataset: ITemplate_Line_QuestionSet[] = [],
) => {
    console.log('loadTemplateData Call');

    // 모든 셀렉션 해제
    CommonEvent.removeSelectors();

    // 문제 데이터 불러오기
    const questionDataList = setQuestionDataSet(dataset);

    // 데이터 개수만큼 페이지 생성
    // const pageArray = Array.from({ length: 2 });
    // const pageArray = Array.from(
    //     { length: QuestionDataSet.questions.length },
    //     v => '',
    // );
    try {
        //        showToastMessage('템플릿을 불러오는 중입니다.', 10000, false);
        setTempatePage(questionDataList);
        //        hideToastMessage();
    } catch (e) {
        console.log(e);
    }
};

// 마지막페이지에 추가
// export const addDefaultPage = () => {
//     // 페이지 내용 비우기
//     pages.emptyCanvasContent();

//     // 페이지 생성
//     const canvasObj = pages.getCanvasObject();
//     const pageObj = pages.createPageObject();
//     canvasObj.appendChild(pageObj);

//     const lastPageNo = docData.getTotalPage();

//     // 데이터 세팅
//     makeBodyContentBox(lastPageNo + 1);

//     docData.appendDocContent($('#idx_canvas_sheet').html());

//     // 페이지 번호 세팅
//     docData.setCurrPage(lastPageNo + 1);
// };

// 현재 페이지에 적용
export const setTempatePage = async (
    questionDataList: ITemplate_Line_QuestionSet[],
) => {
    if (questionDataList.length === 0) return;

    // 페이지 내용 비우기
    pages.emptyCanvasContent();

    // 페이지 생성
    const canvasObj = pages.getCanvasObject();
    const pageObj = pages.createPageObject();
    canvasObj.appendChild(pageObj);

    // 데이터 세팅
    showToastMessage('템플릿을 불러오는 중입니다.', 10000, false);
    let delayTime = 0.1; // 초
    let index = 0;
    for (let questionData of questionDataList) {
        if (index > 0) {
            pages.addNewPage(ETemplateType.line);
        }
        pages.setTempatePage(ETemplateType.line);
        makeBodyContentBox(questionData);
        docData.setDocPageContent($('#idx_canvas_sheet').html());
        // 대기
        await sleep(delayTime * 1000);
        index++;
    }
    hideToastMessage();
    if (index > 1) {
        docData.setCurrPage(1);
    } else {
        dostack.addUndoStack('', EundoStackAddType.all);
    }
};
// export const setTempatePage = (
//     questionDataList: ITemplate_Line_QuestionSet[],
// ) => {
//     if (questionDataList.length === 0) return;

//     // 페이지 내용 비우기
//     pages.emptyCanvasContent();

//     // 페이지 생성
//     const canvasObj = pages.getCanvasObject();
//     const pageObj = pages.createPageObject();
//     canvasObj.appendChild(pageObj);

//     // 데이터 세팅
//     showToastMessage('템플릿을 불러오는 중입니다.', 10000, false);
//     let delayTime = 0;
//     questionDataList.map((questionData, index) => {
//         delayTime = index + 0.5;
//         setTimeout(() => {
//             if (index > 0) {
//                 pages.addNewPage(ETemplateType.line);
//             }
//             pages.setTempatePage(ETemplateType.line);
//             makeBodyContentBox(questionData);
//             docData.setDocContent($('#idx_canvas_sheet').html());
//             if (index >= questionDataList.length - 1) {
//                 setTimeout(() => {
//                     hideToastMessage();
//                     // 2개 이상의 페이지를 삽입한경우 1페이지로 이동
//                     if (questionDataList.length > 1) {
//                         docData.setCurrPage(1);

//                         // 1개 페이지만 삽입한경우 페이지 이동 없음
//                     } else {
//                         dostack.addUndoStack('', EundoStackAddType.all);
//                     }
//                 }, 500);
//             }
//         }, 500 * index);
//     });
// };
// 왼쪽 문제 오브젝트 생성
const makeQuestionUnit = (
    questionList: ITemplate_Line_Question[],
    correctList: ITemplate_Line_correct[],
) => {
    questionList.map((question: ITemplate_Line_Question, index: number) => {
        // 문제 오브젝트 생성
        const questionObj = objects.createNewObject(
            EobjectType.square,
            question.text,
        ) as HTMLDivElement;
        $(questionObj).attr('tpl-object-type', ETemplete_Object_Type.question);
        $(questionObj).attr('tpl-qNo', question.no);
        $(questionObj).attr('tpl-aNo', '');
        const correctInfo = correctList.find(
            (correct: ITemplate_Line_correct) =>
                correct.questionNo === question.no,
        );
        $(questionObj).attr('tpl-cNo', correctInfo ? correctInfo.answerNo : 0);
        // 문제 텍스트 박스 생성
        const textBox = createTextBox(
            question.text,
            TemplatePreset.question.item.fontsize,
        );
        questionObj.appendChild(textBox);
        workInfo.addObjectList(questionObj);

        // 문제옆 점 오브젝트 생성
        const pointObj = objects.createNewObject(
            EobjectType.square,
            `${question.text}-Point`,
        ) as HTMLDivElement;
        $(pointObj).attr('tpl-object-type', ETemplete_Object_Type.startPoint);
        $(pointObj).attr('tpl-qNo', question.no);
        $(pointObj).attr('tpl-aNo', '');
        $(pointObj).attr('tpl-cNo', correctInfo ? correctInfo.answerNo : 0);
        $(pointObj).addClass('tpl-point');
        $(pointObj).addClass('start');
        workInfo.addObjectList(pointObj);
    });
    applyTemplatePreset('question');
};
// 오른쪽 답 오브젝트 생성
const makeAnswerUnit = (answerList: ITemplate_Line_Answer[]) => {
    answerList.map((answer: ITemplate_Line_Answer, index: number) => {
        // 답 오브젝트 생성
        const answerObj = objects.createNewObject(
            EobjectType.square,
            answer.text,
        ) as HTMLDivElement;
        $(answerObj).attr('tpl-object-type', ETemplete_Object_Type.answer);
        $(answerObj).attr('tpl-aNo', answer.no);
        // 텍스트 박스 생성
        const textBox = createTextBox(
            answer.text,
            TemplatePreset.question.item.fontsize,
        );
        answerObj.appendChild(textBox);
        workInfo.addObjectList(answerObj);

        // 답옆 점 오브젝트 생성
        const pointObj = objects.createNewObject(
            EobjectType.square,
            `${answer.text}-Point`,
        ) as HTMLDivElement;
        $(pointObj).attr('tpl-object-type', ETemplete_Object_Type.endPoint);
        $(pointObj).attr('tpl-aNo', answer.no);
        $(pointObj).addClass('tpl-point');
        $(pointObj).addClass('end');
        workInfo.addObjectList(pointObj);
    });
    applyTemplatePreset('answer');
};

const makeTitleBox = (titleText: string) => {
    const titleObj = objects.createNewObject(
        EobjectType.square,
        titleText,
    ) as HTMLDivElement;

    // const textBox = createTextBox(
    //     pageNo > 9 ? `${titleText}-${pageNo}` : `${titleText}-0${pageNo}`,
    //     TemplatePreset.question.title.fontsize,
    // );
    const textBox = createTextBox(
        titleText,
        TemplatePreset.question.title.fontsize,
    );
    titleObj.appendChild(textBox);
    $(titleObj).attr('tpl-object-type', ETemplete_Object_Type.title);

    applyTemplatePreset('title');

    workInfo.addObjectList(titleObj);
};

const makeBodyContentBox = (
    questionDataInfo: ITemplate_Line_QuestionSet,
    dataIndex: number = 0,
) => {
    const pageNo = docData.getCurrPage();

    console.log('makeBodyContentBox pageNo : ', pageNo);

    // const questionIndex = pageNo - 1;
    // const questionInfo = getTemplateQuestion()[dataIndex];
    const questionInfo = questionDataInfo;
    console.log('questionInfo : ', questionInfo);
    if (questionInfo === null) return;

    // 1. 페이지 설정
    pages.setPageName('Page-' + (pageNo > 9 ? pageNo : '0' + pageNo));
    pages.setPageSize(
        {
            width: TemplatePreset.page.width,
            height: TemplatePreset.page.height,
        },
        false,
    );
    // pages.setTempatePage(ETemplateType.line);

    // 2. 타이틀 오브젝트 생성
    makeTitleBox(questionInfo.title);

    // 3. 왼쪽 문제 오브젝트 생성
    makeQuestionUnit(
        questionDataInfo.questionList,
        questionDataInfo.correctList,
    );

    // 4. 오른쪽 문제 오브젝트 생성
    makeAnswerUnit(questionDataInfo.answerList);

    // pages.setTempatePage(ETemplateType.line);
};

const getTemplateQuestion = () => {
    if (QuestionDataSet.length === 0) {
        QuestionDataSet = getDefalultJsonData();
    }
    console.log('getTemplateQuestion : ', QuestionDataSet);
    return QuestionDataSet;
};

export const showCorrectLine = () => {
    // console.log(questionObjList);
    // console.log(answerObjList);

    const currObjectList = workInfo.getObjectList();
    let questionObjList: HTMLDivElement[] = [];
    let answerObjList: HTMLDivElement[] = [];
    currObjectList.forEach((obj, index) => {
        if ($(obj).attr('tpl-object-type') === 'start-point') {
            questionObjList.push(obj as HTMLDivElement);
        } else if ($(obj).attr('tpl-object-type') === 'end-point') {
            answerObjList.push(obj as HTMLDivElement);
        }
    });
    if (questionObjList.length === 0 || answerObjList.length === 0) return;

    const canvasShadowObject = pages.getCanvasShadowObject();

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

    canvasShadowObject.appendChild(svgObj);

    questionObjList.map((startPoint: HTMLDivElement) => {
        // const startPoint = questionObj.find('.tpl-point.start');
        const endPoint: HTMLDivElement =
            (answerObjList.find(
                (answerObj: any) =>
                    $(answerObj).attr('tpl-ano') ===
                    $(startPoint).attr('tpl-cno'),
            ) as HTMLDivElement) || null;
        if (endPoint === null) return false;

        const lineObj = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line',
        );
        const lineId = startPoint.getAttribute('tpl-qno')
            ? 'lineQNo' + startPoint.getAttribute('tpl-qno')
            : 'lineANo000';

        const x1 = startPoint.offsetLeft + (startPoint.offsetWidth || 0) / 2;
        const y1 = startPoint.offsetTop + (startPoint.offsetHeight || 0) / 2;
        const x2 = endPoint.offsetLeft + (endPoint.offsetWidth || 0) / 2;
        const y2 = endPoint.offsetTop + (endPoint.offsetHeight || 0) / 2;

        // lineObj.setAttributeNS(null, 'class', 'correct');
        lineObj.setAttributeNS(null, 'x1', String(x1));
        lineObj.setAttributeNS(null, 'y1', String(y1));
        lineObj.setAttributeNS(null, 'x2', String(x2));
        lineObj.setAttributeNS(null, 'y2', String(y2));
        lineObj.setAttributeNS(null, 'id', lineId);
        svgObj.appendChild(lineObj);
    });
};

export const setApplyDefaultTemplatePreset = (templateNo: number = 0) => {
    setTemplatePreset(null, templateNo);
    applyTemplatePreset();
};
export const setTemplatePreset = (
    presetData: ITemplate_Preset | null,
    templateNo: number = 0,
) => {
    if (presetData === null) {
        TemplatePreset = getDefaultTemplatePreset(templateNo);
    } else {
        TemplatePreset = presetData;
    }
};

const applyTemplatePreset = (
    target: 'title' | 'question' | 'answer' | 'all' = 'all',
) => {
    //TemplatePreset
    console.log('applyTemplatePreset : ', TemplatePreset);

    const canvasObj = pages.getCanvasObject();
    // const currObjectList = workInfo.getObjectList();

    const questionCount = $(
        '#idx_canvas_sheet .object[tpl-object-type="question"]',
    ).length;
    console.log('questionCount : ', questionCount);

    // 타이틀 박스
    if (target === 'title' || target === 'all') {
        $('#idx_canvas_sheet .object[tpl-object-type="title"]').css({
            top: TemplatePreset.question.title.top,
            left:
                TemplatePreset.page.width / 2 -
                TemplatePreset.question.title.width / 2,
            width: TemplatePreset.question.title.width,
            height: TemplatePreset.question.title.height,
            background: TemplatePreset.question.title.background,
            border: TemplatePreset.question.title.border,
        });
    }

    // 문제 박스
    if (target === 'question' || target === 'all') {
        // 문제 텍스트 박스
        $('#idx_canvas_sheet .object[tpl-object-type="question"]').each(
            (index: number, questionObj: any) => {
                // horizontal
                if (TemplatePreset.question.layout === ETemplate_Direction.h) {
                    $(questionObj).css({
                        top:
                            TemplatePreset.question.title.top * 2 +
                            TemplatePreset.question.title.height +
                            ((canvasObj.offsetHeight -
                                TemplatePreset.question.title.top * 2 -
                                TemplatePreset.question.item.margin -
                                TemplatePreset.question.title.height) /
                                questionCount) *
                                index,
                        left: TemplatePreset.question.item.margin,
                        width: TemplatePreset.question.item.width,
                        height: TemplatePreset.question.item.height,
                        background: TemplatePreset.question.item.background,
                        border: TemplatePreset.question.item.border,
                    });

                    // vertical
                } else {
                    $(questionObj).css({
                        top:
                            TemplatePreset.question.title.top +
                            TemplatePreset.question.title.height +
                            TemplatePreset.question.title.top,

                        left:
                            (canvasObj.offsetWidth / questionCount -
                                TemplatePreset.question.item.width) /
                                2 +
                            (canvasObj.offsetWidth / questionCount) * index,
                        width: TemplatePreset.question.item.width,
                        height: TemplatePreset.question.item.height,
                        background: TemplatePreset.question.item.background,
                        border: TemplatePreset.question.item.border,
                    });
                }
            },
        );
        // 문제 점
        $('#idx_canvas_sheet .object[tpl-object-type="start-point"]').each(
            (index: number, questionPointObj: any) => {
                if (TemplatePreset.question.layout === ETemplate_Direction.h) {
                    $(questionPointObj).css({
                        top:
                            TemplatePreset.question.title.top * 2 +
                            TemplatePreset.question.title.height +
                            ((canvasObj.offsetHeight -
                                TemplatePreset.question.title.top * 2 -
                                TemplatePreset.question.item.margin -
                                TemplatePreset.question.title.height) /
                                questionCount) *
                                index +
                            TemplatePreset.question.item.height / 2 -
                            TemplatePreset.question.point.height / 2,
                        left:
                            TemplatePreset.question.item.margin +
                            TemplatePreset.question.item.width +
                            TemplatePreset.question.point.margin,
                        width: TemplatePreset.question.point.width,
                        height: TemplatePreset.question.point.height,
                        background: TemplatePreset.question.point.background,
                        border: TemplatePreset.question.point.border,
                        borderRadius:
                            TemplatePreset.question.point.borderRadius,
                    });
                } else {
                    $(questionPointObj).css({
                        top:
                            TemplatePreset.question.title.top +
                            TemplatePreset.question.title.height +
                            TemplatePreset.question.title.top +
                            TemplatePreset.question.item.height +
                            // TemplatePreset.question.item.height / 2,
                            TemplatePreset.question.point.margin,
                        left:
                            (canvasObj.offsetWidth / questionCount -
                                TemplatePreset.question.item.width) /
                                2 +
                            (canvasObj.offsetWidth / questionCount) * index +
                            TemplatePreset.question.item.width / 2 -
                            TemplatePreset.question.point.width / 2,
                        width: TemplatePreset.question.point.width,
                        height: TemplatePreset.question.point.height,
                        background: TemplatePreset.question.point.background,
                        border: TemplatePreset.question.point.border,
                        borderRadius:
                            TemplatePreset.question.point.borderRadius,
                    });
                }
            },
        );
    }

    // 답변 박스
    if (target === 'answer' || target === 'all') {
        // 답변 텍스트 박스
        $('#idx_canvas_sheet .object[tpl-object-type="answer"]').each(
            (index: number, answerObj: any) => {
                if (TemplatePreset.question.layout === ETemplate_Direction.h) {
                    $(answerObj).css({
                        top:
                            TemplatePreset.question.title.top * 2 +
                            TemplatePreset.question.title.height +
                            ((canvasObj.offsetHeight -
                                TemplatePreset.question.title.top * 2 -
                                TemplatePreset.question.item.margin -
                                TemplatePreset.question.title.height) /
                                questionCount) *
                                index,

                        left:
                            TemplatePreset.page.width -
                            TemplatePreset.question.item.margin -
                            TemplatePreset.question.item.width,
                        width: TemplatePreset.question.item.width,
                        height: TemplatePreset.question.item.height,
                        background: TemplatePreset.question.item.background,
                        border: TemplatePreset.question.item.border,
                    });
                } else {
                    $(answerObj).css({
                        top:
                            canvasObj.offsetHeight -
                            TemplatePreset.question.title.top -
                            TemplatePreset.question.item.height,

                        left:
                            (canvasObj.offsetWidth / questionCount -
                                TemplatePreset.question.item.width) /
                                2 +
                            (canvasObj.offsetWidth / questionCount) * index,
                        width: TemplatePreset.question.item.width,
                        height: TemplatePreset.question.item.height,
                        background: TemplatePreset.question.item.background,
                        border: TemplatePreset.question.item.border,
                    });
                }
            },
        );
        // 답변 점
        $('#idx_canvas_sheet .object[tpl-object-type="end-point"]').each(
            (index: number, answerPointObj: any) => {
                if (TemplatePreset.question.layout === ETemplate_Direction.h) {
                    $(answerPointObj).css({
                        top:
                            TemplatePreset.question.title.top * 2 +
                            TemplatePreset.question.title.height +
                            ((canvasObj.offsetHeight -
                                TemplatePreset.question.title.top * 2 -
                                TemplatePreset.question.item.margin -
                                TemplatePreset.question.title.height) /
                                questionCount) *
                                index +
                            TemplatePreset.question.item.height / 2 -
                            TemplatePreset.question.point.height / 2,

                        left:
                            TemplatePreset.page.width -
                            TemplatePreset.question.item.margin -
                            TemplatePreset.question.item.width -
                            TemplatePreset.question.point.margin -
                            TemplatePreset.question.point.width,
                        width: TemplatePreset.question.point.width,
                        height: TemplatePreset.question.point.height,
                        background: TemplatePreset.question.point.background,
                        border: TemplatePreset.question.point.border,
                        borderRadius:
                            TemplatePreset.question.point.borderRadius,
                    });
                } else {
                    $(answerPointObj).css({
                        top:
                            canvasObj.offsetHeight -
                            TemplatePreset.question.title.top -
                            TemplatePreset.question.item.height -
                            TemplatePreset.question.point.margin -
                            TemplatePreset.question.point.height,
                        // TemplatePreset.question.item.height / 2,

                        left:
                            (canvasObj.offsetWidth / questionCount -
                                TemplatePreset.question.item.width) /
                                2 +
                            (canvasObj.offsetWidth / questionCount) * index +
                            TemplatePreset.question.item.width / 2 -
                            TemplatePreset.question.point.width / 2,
                        width: TemplatePreset.question.point.width,
                        height: TemplatePreset.question.point.height,
                        background: TemplatePreset.question.point.background,
                        border: TemplatePreset.question.point.border,
                        borderRadius:
                            TemplatePreset.question.point.borderRadius,
                    });
                }
            },
        );
    }

    // dostack.addUndoStack('', EundoStackAddType.all);
};

export const setApplyDirection = (
    direction: ETemplate_Direction = ETemplate_Direction.h,
) => {
    setApplyDefaultTemplatePreset(direction === ETemplate_Direction.h ? 0 : 1);
};

export const addQuestionUnit = () => {
    let maxQuestionNo = 0;
    $('#idx_canvas_sheet .object[tpl-object-type="start-point"]').each(
        (index: number, questionPointObj: any) => {
            const questionNo = parseInt(
                questionPointObj.getAttribute('tpl-qno'),
            );
            if (maxQuestionNo < questionNo) {
                maxQuestionNo = questionNo;
            }
        },
    );
    console.log('maxQuestionNo', maxQuestionNo);
    const newQuestionNo = maxQuestionNo + 1;

    const newQuestionList = [{ no: newQuestionNo, text: 'Question' }];
    const newCorrectList = [
        { questionNo: newQuestionNo, answerNo: newQuestionNo },
    ];
    const newAnswerList = [{ no: newQuestionNo, text: 'Answer' }];
    makeQuestionUnit(newQuestionList, newCorrectList);
    makeAnswerUnit(newAnswerList);
    // applyTemplatePreset();
};

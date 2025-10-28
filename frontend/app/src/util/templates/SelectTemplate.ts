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
    ETemplete_Object_Type,
    ETemplate_Direction,
    ETextEditorToolsName,
    IinteractionsInfo,
} from '../../const/types';
import * as objects from '../objects';
import * as pages from '../pages';
import { createTextBox } from '../texteditor';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import * as CommonEvent from '../../event/CommonEvent';
import { showToastMessage, hideToastMessage } from '../../util/dialog';
import * as dostack from '../../util/dostack';
import {
    getInteractionsName,
    getUniqId,
    parseJsonData,
    getInteractionIdHead,
} from '../../util/common';
import * as interactions from '../../util/interactions';

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
    questionNo: number;
    questionText: string;
    answerList: ITemplate_Line_Answer[];
    correct: number[];
    multiSelect?: boolean;
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
        question: {
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
        image_box?: {
            width: number;
            height: number;
            background: string;
            border: string;
        };
        next_button?: {
            margin: number;
            width: number;
            height: number;
            background: string;
            border: string;
            fontsize: number;
        };
        layout: ETemplate_Direction;
    };
}

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
                border: '1px solid #888888',
                fontsize: 50,
            },
            question: {
                top: 250,
                width: 1000,
                height: 100,
                text: 'TITLE',
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 50,
            },
            item: {
                margin: 50,
                width: 150,
                height: 50,
                background: '',
                border: '0px solid #888888',
                fontsize: 18,
            },
            point: {
                margin: 20,
                width: 50,
                height: 50,
                background: '#f2f2f2',
                border: '5px solid white',
                borderRadius: '50%',
            },
            image_box: {
                width: 950,
                height: 150,
                background: '#f2f2f2',
                border: '0px solid #f2f2f2',
            },
            next_button: {
                margin: 50,
                width: 200,
                height: 70,
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 18,
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
                text: 'TITLE',
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 50,
            },
            question: {
                top: 250,
                width: 1000,
                height: 100,
                text: 'TITLE',
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 50,
            },
            item: {
                margin: 50,
                width: 150,
                height: 50,
                background: '',
                border: '0px solid #888888',
                fontsize: 18,
            },
            point: {
                margin: 20,
                width: 50,
                height: 50,
                background: '#f2f2f2',
                border: '5px solid white',
                borderRadius: '50%',
            },
            image_box: {
                width: 550,
                height: 280,
                background: '#f2f2f2',
                border: '0px solid #f2f2f2',
            },
            next_button: {
                margin: 50,
                width: 200,
                height: 70,
                background: '#f2f2f2',
                border: '1px solid #888888',
                fontsize: 18,
            },
            layout: ETemplate_Direction.v,
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
            questionNo: 1,
            questionText: 'QUESTION',
            answerList: [
                { no: 1, text: 'Answer1' },
                { no: 2, text: 'Answer2' },
                { no: 3, text: 'Answer3' },
                { no: 4, text: 'Answer4' },
                // { no: 5, text: 'Answer5' },
            ],
            correct: [3, 1],
            multiSelect: true,
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

    try {
        setTempatePage(questionDataList);
    } catch (e) {
        console.log(e);
    }
};

// 현재 페이지에 적용
export const setTempatePage = (
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
    let delayTime = 0;
    questionDataList.map((questionData, index) => {
        delayTime = index + 0.5;
        setTimeout(() => {
            if (index > 0) {
                pages.addNewPage(ETemplateType.select);
            }
            pages.setTempatePage(ETemplateType.select);
            makeBodyContentBox(questionData);
            docData.setDocPageContent($('#idx_canvas_sheet').html());
            if (index >= questionDataList.length - 1) {
                setTimeout(() => {
                    hideToastMessage();
                    // 2개 이상의 페이지를 삽입한경우 1페이지로 이동
                    if (questionDataList.length > 1) {
                        docData.setCurrPage(1);

                        // 1개 페이지만 삽입한경우 페이지 이동 없음
                    } else {
                        dostack.addUndoStack('', EundoStackAddType.all);
                    }
                }, 500);
            }
        }, 500 * index);
    });
};
// 왼쪽 문제 오브젝트 생성
// const makeQuestionUnit = (
//     questionList: ITemplate_Line_Question[],
//     correctList: ITemplate_Line_correct[],
// ) => {
//     questionList.map((question: ITemplate_Line_Question, index: number) => {
//         // 문제 오브젝트 생성
//         const questionObj = objects.createNewObject(
//             EobjectType.square,
//             question.text,
//         ) as HTMLDivElement;
//         $(questionObj).attr('tpl-object-type', ETemplete_Object_Type.question);
//         $(questionObj).attr('tpl-qNo', question.no);
//         $(questionObj).attr('tpl-aNo', '');
//         const correctInfo = correctList.find(
//             (correct: ITemplate_Line_correct) =>
//                 correct.questionNo === question.no,
//         );
//         $(questionObj).attr('tpl-cNo', correctInfo ? correctInfo.answerNo : 0);
//         // 문제 텍스트 박스 생성
//         const textBox = createTextBox(
//             question.text,
//             TemplatePreset.question.item.fontsize,
//         );
//         questionObj.appendChild(textBox);
//         workInfo.addObjectList(questionObj);
//     });
//     applyTemplatePreset(ETemplete_Object_Type.question);
// };
// 오른쪽 답 오브젝트 생성
const makeAnswerUnit = (answerList: ITemplate_Line_Answer[]) => {
    answerList.map((answer: ITemplate_Line_Answer, index: number) => {
        // 답 텍스트 오브젝트 생성
        const answerObj = objects.createNewObject(
            EobjectType.square,
            answer.text,
        ) as HTMLDivElement;
        $(answerObj).attr('tpl-object-type', ETemplete_Object_Type.answer);
        $(answerObj).attr('tpl-ano', answer.no);
        // 텍스트 박스 생성
        const textBox = createTextBox(
            answer.text,
            TemplatePreset.question.item.fontsize,
            ETextEditorToolsName.left,
        );
        answerObj.appendChild(textBox);
        workInfo.addObjectList(answerObj);

        // 답 포인트 오브젝트 생성
        const pointObj = objects.createNewObject(
            EobjectType.square,
            `${answer.text}-Point`,
        ) as HTMLDivElement;
        $(pointObj).attr('tpl-object-type', ETemplete_Object_Type.endPoint);
        $(pointObj).attr('tpl-ano', answer.no);
        $(pointObj).addClass('tpl-point');
        $(pointObj).addClass('end');

        const textBox2 = createTextBox(
            String(answer.no),
            TemplatePreset.question.item.fontsize,
        );
        pointObj.appendChild(textBox2);

        workInfo.addObjectList(pointObj);
    });
    applyTemplatePreset(ETemplete_Object_Type.answer);
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

    applyTemplatePreset(ETemplete_Object_Type.title);

    workInfo.addObjectList(titleObj);
};
const makeQuestionBox = (questionInfo: ITemplate_Line_QuestionSet) => {
    const questionObj = objects.createNewObject(
        EobjectType.square,
        'question-text',
    ) as HTMLDivElement;

    const textBox = createTextBox(
        questionInfo.questionText,
        TemplatePreset.question.question.fontsize,
    );
    questionObj.appendChild(textBox);
    $(questionObj).attr('tpl-object-type', ETemplete_Object_Type.question);
    $(questionObj).attr('tpl-qNo', questionInfo.questionNo);
    $(questionObj).attr('tpl-aNo', JSON.stringify([]));
    $(questionObj).attr('tpl-cNo', JSON.stringify(questionInfo.correct));
    $(questionObj).attr(
        'tpl-multi-select',
        questionInfo.multiSelect === undefined
            ? 'false'
            : JSON.stringify(questionInfo.multiSelect),
    );

    // 문제 텍스트 박스 생성

    applyTemplatePreset(ETemplete_Object_Type.question);

    workInfo.addObjectList(questionObj);
};
const makeImageBox = () => {
    const imageBoxObj = objects.createNewObject(
        EobjectType.square,
        'image_box',
    ) as HTMLDivElement;
    $(imageBoxObj).attr('tpl-object-type', ETemplete_Object_Type.image);
    applyTemplatePreset(ETemplete_Object_Type.image);
    workInfo.addObjectList(imageBoxObj);
};
const makeNextButton = () => {
    const nextButtonObj = objects.createNewObject(
        EobjectType.square,
        'Next',
    ) as HTMLDivElement;

    const textBox = createTextBox(
        'Next',
        TemplatePreset.question.next_button?.fontsize,
    );
    nextButtonObj.appendChild(textBox);
    $(nextButtonObj).attr('tpl-object-type', ETemplete_Object_Type.next);

    // add interaction
    const newInteractionsInfo: IinteractionsInfo = {
        id: getUniqId(getInteractionIdHead()),
        // name: getInteractionsName(),
        name: 'Interaction-Next',
        trigger: 'click',
        targetId: ['page'],
        action: 'next',
    };
    interactions.addInteractions(nextButtonObj, newInteractionsInfo);

    applyTemplatePreset(ETemplete_Object_Type.next);
    workInfo.addObjectList(nextButtonObj);
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
    // pages.setTempatePage(ETemplateType.select);

    // 2. 타이틀 오브젝트 생성
    makeTitleBox(questionInfo.title);

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
    makeQuestionBox(questionInfo);

    // 4. 답변 오브젝트 생성
    makeAnswerUnit(questionDataInfo.answerList);

    // 5. 이미지 박스 생성
    makeImageBox();

    // 6. 다음 버튼 생성
    makeNextButton();

    // pages.setTempatePage(ETemplateType.select);
};

const getTemplateQuestion = () => {
    if (QuestionDataSet.length === 0) {
        QuestionDataSet = getDefalultJsonData();
    }
    console.log('getTemplateQuestion : ', QuestionDataSet);
    return QuestionDataSet;
};

export const showCorrectNo = () => {

    const currObjectList = workInfo.getObjectList();
    let answerObjList: HTMLDivElement[] = [];
    currObjectList.forEach((obj, index) => {
        if ($(obj).attr('tpl-object-type') === 'answer') {
            answerObjList.push(obj as HTMLDivElement);
        }
    });

    if (answerObjList.length === 0) return;
    const canvasShadowObject = pages.getCanvasShadowObject();
    const correctNoList = parseJsonData(
        $(
            `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
        ).attr('tpl-cno'),
    ) as number[] | null;
    console.log('correctNoList : ', correctNoList);
    if (correctNoList === null || correctNoList.length === 0) return;

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

    // const objStyle = $(
    //     `#idx_canvas_sheet .object[tpl-object-type="end-point"][tpl-ano="${correctNo}"]`,
    // ).attr('style');
    // if (objStyle === undefined) return;

    // const correctObjShadow = document.createElement('div');
    // $(correctObjShadow).attr('style', objStyle);
    // $(correctObjShadow).addClass('object-selector square');
    // $(correctObjShadow).css({
    //     borderColor: 'blue',
    //     backgroundColor: '',
    // });
    // canvasShadowObject.appendChild(correctObjShadow);
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
    target:
        | ETemplete_Object_Type.title
        | ETemplete_Object_Type.question
        | ETemplete_Object_Type.answer
        | ETemplete_Object_Type.image
        | ETemplete_Object_Type.next
        | ETemplete_Object_Type.all = ETemplete_Object_Type.all,
) => {
    //TemplatePreset
    console.log('applyTemplatePreset : ', TemplatePreset);

    const canvasObj = pages.getCanvasObject();
    // const currObjectList = workInfo.getObjectList();

    const answerCount = $(
        '#idx_canvas_sheet .object[tpl-object-type="answer"]',
    ).length;
    console.log('answerCount : ', answerCount);

    // 타이틀 박스
    if (
        target === ETemplete_Object_Type.title ||
        target === ETemplete_Object_Type.all
    ) {
        $(
            `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.title}"]`,
        ).css({
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
    if (
        target === ETemplete_Object_Type.question ||
        target === ETemplete_Object_Type.all
    ) {
        $(
            `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
        ).css({
            top: TemplatePreset.question.question.top,
            left:
                TemplatePreset.page.width / 2 -
                TemplatePreset.question.question.width / 2,
            width: TemplatePreset.question.question.width,
            height: TemplatePreset.question.question.height,
            background: TemplatePreset.question.question.background,
            border: TemplatePreset.question.question.border,
        });
    }

    // 답변 박스
    if (
        target === ETemplete_Object_Type.answer ||
        target === ETemplete_Object_Type.all
    ) {
        // 답변 텍스트 박스
        $(
            `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.answer}"]`,
        ).each((index: number, answerObj: any) => {
            if (TemplatePreset.question.layout === ETemplate_Direction.h) {
                $(answerObj).css({
                    top:
                        TemplatePreset.question.question.top +
                        TemplatePreset.question.question.height +
                        TemplatePreset.question.item.margin,

                    left:
                        (TemplatePreset.page.width -
                            TemplatePreset.question.question.width) /
                            2 +
                        (TemplatePreset.question.question.width / answerCount -
                            TemplatePreset.question.item.width +
                            TemplatePreset.question.point.width) /
                            2 +
                        (TemplatePreset.question.question.width / answerCount) *
                            index,

                    width: TemplatePreset.question.item.width,
                    height: TemplatePreset.question.item.height,
                    background: TemplatePreset.question.item.background,
                    border: TemplatePreset.question.item.border,
                });
            } else {
                $(answerObj).css({
                    top:
                        // TemplatePreset.question.question.top +
                        // TemplatePreset.question.question.height +
                        // TemplatePreset.question.item.margin +
                        // (TemplatePreset.question.item.height +
                        //     TemplatePreset.question.item.margin / 2) *
                        //     index,
                        TemplatePreset.question.question.top +
                        TemplatePreset.question.question.height +
                        TemplatePreset.question.item.margin +
                        ((TemplatePreset.page.height -
                            TemplatePreset.question.question.top -
                            TemplatePreset.question.question.height -
                            TemplatePreset.question.item.margin -
                            120) /
                            answerCount) *
                            index,

                    left: TemplatePreset.page.width * 0.7,
                    width: TemplatePreset.question.item.width,
                    height: TemplatePreset.question.item.height,
                    background: TemplatePreset.question.item.background,
                    border: TemplatePreset.question.item.border,
                });
            }
        });

        // 답변 점 (번호)
        $('#idx_canvas_sheet .object[tpl-object-type="end-point"]').each(
            (index: number, answerPointObj: any) => {
                if (TemplatePreset.question.layout === ETemplate_Direction.h) {
                    $(answerPointObj).css({
                        top:
                            TemplatePreset.question.question.top +
                            TemplatePreset.question.question.height +
                            TemplatePreset.question.item.margin,

                        left:
                            (TemplatePreset.page.width -
                                TemplatePreset.question.question.width) /
                                2 +
                            (TemplatePreset.question.question.width /
                                answerCount -
                                TemplatePreset.question.item.width +
                                TemplatePreset.question.point.width) /
                                2 +
                            (TemplatePreset.question.question.width /
                                answerCount) *
                                index -
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
                            TemplatePreset.question.question.top +
                            TemplatePreset.question.question.height +
                            TemplatePreset.question.item.margin +
                            ((TemplatePreset.page.height -
                                TemplatePreset.question.question.top -
                                TemplatePreset.question.question.height -
                                TemplatePreset.question.item.margin -
                                120) /
                                answerCount) *
                                index,

                        left:
                            TemplatePreset.page.width * 0.7 -
                            TemplatePreset.question.point.width,
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

    // 이미지 박스
    if (
        TemplatePreset.question.image_box !== undefined &&
        (target === ETemplete_Object_Type.image ||
            target === ETemplete_Object_Type.all)
    ) {
        $(
            `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.image}"]`,
        ).css({
            top:
                TemplatePreset.question.layout === ETemplate_Direction.h
                    ? TemplatePreset.question.question.top +
                      TemplatePreset.question.question.height +
                      TemplatePreset.question.item.margin * 2 +
                      TemplatePreset.question.item.height
                    : TemplatePreset.question.question.top +
                      TemplatePreset.question.question.height +
                      TemplatePreset.question.item.margin,
            left:
                TemplatePreset.question.layout === ETemplate_Direction.h
                    ? TemplatePreset.page.width / 2 -
                      TemplatePreset.question.image_box.width / 2
                    : TemplatePreset.page.width / 2 -
                      TemplatePreset.question.question.width / 2,
            width: TemplatePreset.question.image_box.width,
            height: TemplatePreset.question.image_box.height,
            background: TemplatePreset.question.image_box.background,
            border: TemplatePreset.question.image_box.border,
        });
    }

    // next 버튼
    if (
        TemplatePreset.question.next_button !== undefined &&
        (target === ETemplete_Object_Type.next ||
            target === ETemplete_Object_Type.all)
    ) {
        $(
            `#idx_canvas_sheet .object[tpl-object-type="${ETemplete_Object_Type.next}"]`,
        ).css({
            top:
                canvasObj.offsetHeight -
                TemplatePreset.question.next_button.height -
                TemplatePreset.question.next_button.margin,
            left:
                canvasObj.offsetWidth -
                TemplatePreset.question.next_button.width -
                TemplatePreset.question.next_button.margin,
            width: TemplatePreset.question.next_button.width,
            height: TemplatePreset.question.next_button.height,
            background: TemplatePreset.question.next_button.background,
            border: TemplatePreset.question.next_button.border,
        });
    }

    // dostack.addUndoStack('', EundoStackAddType.all);
};

export const setApplyDirection = (
    direction: ETemplate_Direction = ETemplate_Direction.h,
) => {
    setApplyDefaultTemplatePreset(direction === ETemplate_Direction.h ? 0 : 1);
};

export const addAnswerUnit = () => {
    let maxAnswerNo = 0;
    $('#idx_canvas_sheet .object[tpl-object-type="end-point"]').each(
        (index: number, answerPointObj: any) => {
            const answerNo = parseInt(answerPointObj.getAttribute('tpl-ano'));
            if (maxAnswerNo < answerNo) {
                maxAnswerNo = answerNo;
            }
        },
    );
    console.log('maxAnswerNo', maxAnswerNo);
    const newAnswerNo = maxAnswerNo + 1;

    // const newQuestionList = [{ no: newAnswerNo, text: 'Question' }];
    // const newCorrectList = [{ questionNo: newAnswerNo, answerNo: newAnswerNo }];
    const newAnswerList = [{ no: newAnswerNo, text: 'Answer' }];
    // makeQuestionUnit(newQuestionList, newCorrectList);
    makeAnswerUnit(newAnswerList);
    // applyTemplatePreset();
};

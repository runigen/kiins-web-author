/**
 * 사지선다 템플릿 이벤트 설정
 * meoocat-player 에서도 이 소스를 사용하므로 jquery 사용 금지
 */
import * as pages from '../../util/pages';
import {
    cancelBubble,
    parseJsonData,
    getCurrentDateTime,
} from '../../util/common';
import { addResultDataList, getLoadedPageNo } from '../../util/preview';
import {
    ETemplete_Object_Type,
    IinteractionsInfo,
    ETemplateType,
} from '../../const/types';
import { execUserAction } from '../../util/preview';
import { getInteractionsInfo } from '../../util/interactions';

const bSelectAnswerTextClickEvent = false; // 객관식문제의 각 번호 클릭시에도 정답처리 되도록 클릭이벤트 부여 할것인지 여부
let inputCompleteCB: any = null;
export const setTemplateEvent = () => {
    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;

    inputCompleteCB = null;

    const checkPointList = previewContainer.querySelectorAll(
        '.object[tpl-object-type="end-point"][tpl-question-type="select"], .object[tpl-object-type="answer"]',
    );
    if (checkPointList.length === 0) return;

    checkPointList.forEach((element: any) => {
        //[tpl-question-type="select"]
        if (element.getAttribute('tpl-question-type') === 'select') {
            if (bSelectAnswerTextClickEvent) {
                element.addEventListener('click', setQuizTemplateEvent_Click);
            } else if (element.classList.contains('tpl-point')) {
                element.addEventListener('click', setQuizTemplateEvent_Click);
            }
        } else if (element.getAttribute('tpl-question-type') === 'input') {
            const inputForm = element.querySelector('input.input-box');
            if (inputForm === null) return;
            inputForm.addEventListener(
                'change',
                setQuizTemplateEvent_Form_Change,
            );
            // 키보드입력시 마다 처리
            // inputForm.addEventListener(
            //     'keyup',
            //     setQuizTemplateEvent_Form_Change,
            // );
        }
        if (bSelectAnswerTextClickEvent) {
            element.classList.add('pointer');
        }
    });

    // inputCompleteCB 설정
    const pageObj = pages.getPreviewPageObject();
    if (pageObj) {
        const pageInteractionList: IinteractionsInfo[] =
            getInteractionsInfo(pageObj);
        if (pageInteractionList.length > 0) {
            const quizInputEvent =
                pageInteractionList.find(
                    interaction => interaction.trigger === 'quizinput',
                ) || null;
            console.log('quizCompleteEvent : ', quizInputEvent);
            if (quizInputEvent) {
                inputCompleteCB = () => {
                    console.log('inputCompleteCB Call');
                    execUserAction(pageObj, quizInputEvent.action);
                };
            }
        }
    }

    setResult();
};

const setQuizTemplateEvent_Form_Change = (e: FocusEvent | KeyboardEvent) => {
    setResult();
    cancelBubble(e);
};
const setQuizTemplateEvent_Click = (e: MouseEvent) => {
    console.log('setLineTemplateEvent_Click');

    let selectPoint = e.currentTarget as HTMLDivElement;
    const qNo = selectPoint.getAttribute('tpl-qno') || '';
    const aNo = selectPoint.getAttribute('tpl-ano') || '';
    const qType = selectPoint.getAttribute('tpl-question-type') || '';
    if (qNo === '' || aNo === '' || qType !== 'select') return;

    console.log('aNo : ', aNo);

    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;

    const multiSelect = parseJsonData(
        previewContainer
            .querySelector(
                `.object[tpl-object-type="${ETemplete_Object_Type.question}"][tpl-qno="${qNo}"]`,
            )
            ?.getAttribute('tpl-multi-select'),
    ) as boolean | false;
    console.log('multiSelect : ', multiSelect);

    // 텍스트 박스를 클릭했으면 포인트 클릭한것으로 처리
    if (bSelectAnswerTextClickEvent) {
        if (selectPoint.getAttribute('tpl-object-type') === 'answer') {
            selectPoint = previewContainer.querySelector(
                `.object[tpl-object-type="end-point"][tpl-qno="${qNo}"][tpl-ano="${aNo}"]`,
            ) as HTMLDivElement;
        }
    }

    // const svgObj = previewContainer.querySelector('svg.tpl-line');
    // if (svgObj === null) return;

    let addSelectObj = true;
    if (multiSelect !== true) {
        // $(svgObj).children('circle').remove();

        const orgSelectObj = previewContainer.querySelectorAll(
            `div.tpl-ans-mark[tpl-qno="${qNo}"]`,
        );
        if (orgSelectObj.length > 0) {
            orgSelectObj.forEach((element: any) => {
                previewContainer.removeChild(element);
            });
        }
        // addSelectObj = true;
    } else {
        const orgSelectObj = previewContainer.querySelectorAll(
            `div.tpl-ans-mark[tpl-qno="${qNo}"][tpl-ano="${aNo}"]`,
        );
        if (orgSelectObj.length > 0) {
            orgSelectObj.forEach((element: any) => {
                previewContainer.removeChild(element);
            });
            addSelectObj = false;
        } else {
            addSelectObj = true;
        }
    }

    if (addSelectObj === true) {
        const selectObj = document.createElement('div');
        selectObj.setAttribute('class', 'tpl-ans-mark select');
        selectObj.setAttribute('tpl-ano', `${aNo}`);
        selectObj.setAttribute('tpl-qno', `${qNo}`);
        selectObj.setAttribute('select-ano', `${aNo}`);

        selectObj.style.left = selectPoint.style.left;
        selectObj.style.top = selectPoint.style.top;
        selectObj.style.width = selectPoint.style.width;
        selectObj.style.height = selectPoint.style.height;

        if (multiSelect === true) {
            selectObj.addEventListener('click', () => {
                previewContainer.removeChild(selectObj);
                cancelBubble(e);
            });
        }
        previewContainer.appendChild(selectObj);
    }
    setResult();
};

export const resetAnswers = () => {
    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;

    const qList = previewContainer.querySelectorAll(
        `.object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
    );
    qList.forEach((element: any) => {
        const qNo = element.getAttribute('tpl-qno') || '';
        const qType = element.getAttribute('tpl-question-type') || '';
        if (qNo === '' || qType === '') return;

        // select type
        const selectObjList = previewContainer.querySelectorAll(
            `div.tpl-ans-mark[tpl-qno="${qNo}"]`,
        );
        selectObjList.forEach((element: any) => {
            previewContainer.removeChild(element);
        });

        // input type
        const inputObjectList = previewContainer.querySelectorAll(
            `.object[tpl-object-type="answer"][tpl-qno="${qNo}"]`,
        );
        inputObjectList.forEach((element: any) => {
            const inputForm = element.querySelector('input.input-box');
            if (inputForm) {
                inputForm.value = '';
            }
        });
    });
    setResult();
};

let totalCnt = 0;
let inputCnt = 0;
let correctCnt = 0;
const setResult = () => {
    console.log('setResult start');

    const previewContainer = pages.getPreviewCanvasObject();
    if (previewContainer === null) return;
    const previewPageObj = pages.getPageObject(previewContainer);
    if (previewPageObj === null) return;
    const qResultList: {
        qNo: number;
        qType: string;
        qText: string;
        cNo: number[];
        cText: string[];
        aNo: number[];
        aText: string[];
        correct: boolean;
    }[] = [];
    const qList = previewContainer.querySelectorAll(
        `.object[tpl-object-type="${ETemplete_Object_Type.question}"]`,
    );
    let inputComplete = true;
    totalCnt = 0;
    inputCnt = 0;
    correctCnt = 0;
    qList.forEach((question: any) => {
        const qNo = Number(question.getAttribute('tpl-qno') || 0);
        const cNoList = parseJsonData(
            question.getAttribute('tpl-cno') || [],
        ) as number[];
        // const aNo = parseJsonData(
        //     element.getAttribute('tpl-ano') || [],
        // ) as number[];
        const qType = question.getAttribute('tpl-question-type') || '';
        const qText = question.innerText;
        cNoList.sort((a, b) => {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });

        const multiSelect =
            question.getAttribute('tpl-multi-select') === 'true' ? true : false;

        question.setAttribute('tpl-correct', 'false');

        // 정답 마킹정보 조회
        //tpl-ans-mark select
        const aNoList: number[] = [];
        let correct = true;
        const aTextList: string[] = [];
        const cTextList: string[] = [];

        // 객관식 문제
        if (qType === 'select') {
            question.setAttribute('tpl-cno', JSON.stringify(cNoList));
            question.setAttribute('tpl-ano', '[]');

            const selectList = previewContainer.querySelectorAll(
                `div.tpl-ans-mark.select[tpl-qno="${qNo}"]`,
            );
            selectList.forEach((answer: any) => {
                const aNo = Number(answer.getAttribute('tpl-ano') || 0);
                aNoList.push(aNo);

                const aText = previewContainer.querySelector(
                    `.object[tpl-object-type="${ETemplete_Object_Type.answer}"][tpl-qno="${qNo}"][tpl-ano="${aNo}"]`,
                ) as HTMLDivElement;
                if (aText !== null) {
                    aTextList.push(aNo + '. ' + aText.innerText);
                }
            });
            cNoList.forEach((cNo: number) => {
                const aText = previewContainer.querySelector(
                    `.object[tpl-object-type="${ETemplete_Object_Type.answer}"][tpl-qno="${qNo}"][tpl-ano="${cNo}"]`,
                ) as HTMLDivElement;
                if (aText !== null) {
                    cTextList.push(cNo + '. ' + aText.innerText);
                }
            });

            cNoList.sort((a, b) => {
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
            aNoList.sort((a, b) => {
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
            aTextList.sort((a, b) => {
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
            correct =
                JSON.stringify(aNoList) === JSON.stringify(cNoList)
                    ? true
                    : false;

            question.setAttribute('tpl-ano', JSON.stringify(aNoList));

            // 주관식 문제
        } else if (qType === 'input') {
            const inputContianerList = previewContainer.querySelectorAll(
                `.object.input-box[tpl-qno="${qNo}"]`,
            );

            // 답변 순서대로 정렬하기 위해 aNo를 추가하여 새 배열을 만든다.
            const inputObjList: any[] = [];
            inputContianerList.forEach((answer: any) => {
                let newElement: any = null;
                newElement = answer;
                newElement.aNo = Number(answer.getAttribute('tpl-ano') || 0);
                newElement.valid = answer.getAttribute('valid') || '';
                inputObjList.push(newElement);
            });

            // aNo로 정렬
            inputObjList.sort((a, b) => {
                if (a.aNo > b.aNo) return 1;
                if (a.aNo < b.aNo) return -1;
                return 0;
            });

            // 정렬된 순서대로 정답/답변 을 가져와서 cTextList, aTextList 에 추가한다.
            inputObjList.forEach((element: any) => {
                const inputForm = element.querySelector(
                    'input.input-box',
                ) as HTMLInputElement;
                const inputVal = inputForm.value;
                aTextList.push(inputVal.trim());
                // 정답을 입력했다면 aNoList에 aNo를 추가한다.
                if (inputVal.trim() !== '') {
                    aNoList.push(element.aNo);
                }
                cTextList.push(element.valid.trim());
            });
            // 정답과 입력한 답변을 비교하여 정답여부를 판단한다.
            correct =
                JSON.stringify(aTextList) === JSON.stringify(cTextList)
                    ? true
                    : false;

            question.setAttribute('tpl-ctext', JSON.stringify(cTextList));
            question.setAttribute('tpl-atext', JSON.stringify(aTextList));
        }

        const currqNoInfo = {
            qNo: qNo,
            qType: qType,
            qText: qText,
            cNo: cNoList,
            cText: cTextList,
            aNo: aNoList,
            aText: aTextList,
            multi: multiSelect,
            correct: correct,
        };
        question.setAttribute('tpl-correct', correct.toString());
        qResultList.push(currqNoInfo);

        // 주관식이 모두 입력됐는지 확인
        if (qType === 'input') {
            if (aNoList.length !== cTextList.length) {
                inputComplete = false;
            } else {
                inputCnt++;
            }
        }
        // 객관식문제는 답변이 하나라도 입력되었는지 확인
        if (qType === 'select') {
            if (aNoList.length === 0) {
                inputComplete = false;
            } else {
                inputCnt++;
            }
        }
        totalCnt++;
        if (correct) {
            correctCnt++;
        }
    });

    // qlist sort
    qResultList.sort((a, b) => {
        if (a.qNo > b.qNo) return 1;
        if (a.qNo < b.qNo) return -1;
        return 0;
    });

    console.log('qResultList : ', qResultList);

    console.log('----------------- inputComplete : ', inputComplete);
    console.log('inputComplete totalCnt : ', totalCnt);
    console.log('inputComplete inputCnt : ', inputCnt);
    console.log('inputComplete correctCnt : ', correctCnt);

    const pageResult = {
        key: previewPageObj.id,
        pageId: previewPageObj.id,
        pageNo: getLoadedPageNo(),
        pageName: previewPageObj.getAttribute('page-name') || '',
        type: ETemplateType.quiz,
        result: qResultList,
        totalCnt: totalCnt,
        inputCnt: inputCnt,
        correctCnt: correctCnt,
        regDate: getCurrentDateTime(),
        correct: correctCnt === totalCnt ? true : false,
    };
    console.log('pageResult : ', pageResult);
    addResultDataList(pageResult);

    // 입력 완료 콜백 실행
    try {
        if (typeof inputCompleteCB === 'function') {
            inputCompleteCB();
        }
    } catch (error) {
        console.error(error);
    }
};

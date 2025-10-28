import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../../store';
import $ from 'jquery';
import { EundoStackAddType } from '../../../../../const/types';
// import * as SelectTpl from '../../../../../util/templates/SelectTemplate';
import * as dostack from '../../../../../util/dostack';
// import { unselectSquareObjcts } from '../../../../../event/SquareEvent';
import { cancelBubble, parseJsonData } from '../../../../../util/common';

const QuizTemplate = observer(() => {
    const { workInfo } = store;
    const currObject = workInfo.getObject();
    const objectGroup = workInfo.getObjectGroup();
    const currObjectList = workInfo.getObjectList();
    // const pageUpdateKey = docData.getPageUpdateKey();
    // const updateKey = workInfo.getUpdateKey();
    const [currQNo, setCurrQNo] = useState<number>(1);
    const [currANo, setCurrANo] = useState<number>(1);
    // const [currCNoList, setCurrCNoList] = useState<number[]>([]);

    // 문제들
    // const [qObjectList, setQObjectList] = useState<HTMLDivElement[]>([]);

    // 객관식
    const [aObjectList, setAObjectList] = useState<HTMLDivElement[]>([]);

    // 주관식
    const [aObjectList2, setAObjectList2] = useState<HTMLDivElement[]>([]);

    // useEffect(() => {
    //     console.log('currObjectList updateKey : ', updateKey);
    //     let aList: HTMLDivElement[] = [];
    //     currObjectList.forEach((obj, index) => {
    //         if ($(obj).attr('tpl-object-type') === 'answer') {
    //             aList.push(obj as HTMLDivElement);
    //         }
    //     });
    //     setAObjectList([]);
    //     setAObjectList(aList);
    // }, [currObjectList]);

    useEffect(() => {
        if (
            $(currObject).attr('tpl-object-type') !== 'question' &&
            $(currObject).attr('tpl-object-type') !== 'answer' &&
            $(currObject).attr('tpl-object-type') !== 'end-point'
        )
            return;

        const qNo = $(currObject).attr('tpl-qno') || '';
        if (qNo === '') return;
        setCurrQNo(Number(qNo));

        if (
            $(currObject).attr('tpl-object-type') === 'answer' ||
            $(currObject).attr('tpl-object-type') === 'end-point'
        ) {
            const aNo = $(currObject).attr('tpl-ano') || '0';
            setCurrANo(Number(aNo));
        }

        if ($(currObject).attr('tpl-object-type') !== 'question') return;

        // const cNoList = parseJsonData($(currObject).attr('tpl-cno') || '[]');
        // setCurrCNoList(cNoList);

        const questionType = $(currObject).attr('tpl-question-type') || '';
        if (questionType === '') return;

        setAObjectList([]);
        setAObjectList2([]);
        const aList: HTMLDivElement[] = [];
        const qList: HTMLDivElement[] = [];
        currObjectList.forEach(obj => {
            if ($(obj).attr('tpl-qno') === qNo) {
                if ($(obj).attr('tpl-object-type') === 'answer') {
                    aList.push(obj as HTMLDivElement);
                }
                if ($(obj).attr('tpl-object-type') === 'question') {
                    qList.push(obj as HTMLDivElement);
                }
            }
        });
        if (questionType === 'select') {
            setAObjectList(aList);
        } else if (questionType === 'input') {
            setAObjectList2(aList);
        }
        // setQObjectList(qList);
    }, [currObject, currObjectList]);

    // useEffect(() => {
    //     console.log('qa qObjectList : ', qObjectList);
    //     console.log('qa aObjectList : ', aObjectList);
    // }, [qObjectList, aObjectList]);

    // const changeAnswer = (
    //     targetObject: any,
    //     event: React.ChangeEvent<HTMLSelectElement>,
    // ) => {
    //     const aNoVal = event.currentTarget.value;
    //     // $(targetObject).attr('tpl-cno', aNoVal);
    //     $(targetObject).attr('tpl-cno', JSON.stringify([Number(aNoVal)]));
    //     dostack.addUndoStack('', EundoStackAddType.all);
    // };
    // const setDefaultTemplatePreset = (
    //     tNo: number,
    //     event: React.MouseEvent<HTMLButtonElement>,
    // ) => {
    //     unselectSquareObjcts();
    //     SelectTpl.setApplyDefaultTemplatePreset(tNo);
    //     dostack.addUndoStack('', EundoStackAddType.all);
    // };

    const changeCorrectAnswer = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const multiSelect = parseJsonData(
            $(targetObject).attr('tpl-multi-select'),
        );

        let answerCheckList: NodeListOf<HTMLInputElement> | null = null;
        answerCheckList = document.querySelectorAll(
            'input[type=checkbox][name="correct-answer-check"]',
        ) as NodeListOf<HTMLInputElement>;
        console.log(answerCheckList);
        if (answerCheckList === null) return;

        let checkedList: number[] = [];
        answerCheckList.forEach(checkbox => {
            if (checkbox.checked) {
                checkedList.push(Number(checkbox.value));
            }
        });
        console.log(checkedList);

        if (multiSelect !== true) {
            checkedList = [Number(event.currentTarget.value)];
        }
        $(targetObject).attr('tpl-cno', JSON.stringify(checkedList));

        if (multiSelect !== true) {
            $(`input[type=checkbox][name="correct-answer-check"]`).prop(
                'checked',
                false,
            );
            checkedList.forEach(cNo => {
                $(
                    `input[type=checkbox][name="correct-answer-check"][value="${cNo}"]`,
                ).prop('checked', true);
            });
        }

        dostack.addUndoStack('', EundoStackAddType.all);
    };

    const changeMultiSelect = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        // 문제 오브젝트에 multi-select 설정값 세팅
        const checkObj = event.currentTarget;
        $(targetObject).attr(
            'tpl-multi-select',
            JSON.stringify(checkObj.checked),
        );

        const currCNoList = parseJsonData($(targetObject).attr('tpl-cno')) as
            | number[]
            | null;

        // 멀티인경우 체크된 값이 없으면 1 삽입
        if (checkObj.checked === true) {
            if (currCNoList === null || currCNoList.length === 0) {
                $(targetObject).attr('tpl-cno', JSON.stringify([1]));
            }

            // 멀티가 아닌경우 체크된 값이 2개 이상이면 1번째 값만 체크 (없으면 1삽입)
        } else {
            const newCNoList: number[] = [];
            if (currCNoList && currCNoList.length > 0) {
                newCNoList.push(currCNoList[0]);
            } else {
                newCNoList.push(1);
            }
            $(targetObject).attr('tpl-cno', JSON.stringify(newCNoList));

            $(`input[type=checkbox][name="correct-answer-check"]`).prop(
                'checked',
                false,
            );
            newCNoList.forEach(cNo => {
                $(
                    `input[type=checkbox][name="correct-answer-check"][value="${cNo}"]`,
                ).prop('checked', true);
            });
        }

        // workInfo.setObject(null);
        // refreshObjectSelector(targetObject);

        dostack.addUndoStack();
        // workInfo.setUpdateKey();
    };

    const changeQno = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const qNoVal = event.currentTarget.value;
        console.log('qNoVal : ', qNoVal);
        // $(targetObject).attr('tpl-qno', qNoVal);
        const objectGroup = workInfo.getObjectGroup();
        objectGroup.forEach(obj => {
            $(obj).attr('tpl-qno', qNoVal);
        });
        setCurrQNo(Number(qNoVal));
    };

    const changeAno = (event: React.ChangeEvent<HTMLInputElement>) => {
        const aNoVal = event.currentTarget.value;
        const objectGroup = workInfo.getObjectGroup();
        objectGroup.forEach(obj => {
            console.log('aNoVal : ', aNoVal);
            $(obj).attr('tpl-ano', aNoVal);
        });
        setCurrANo(Number(aNoVal));
    };

    return (
        <>
            {objectGroup.length > 0 &&
                ($(currObject).attr('tpl-object-type') === 'question' ||
                    $(currObject).attr('tpl-object-type') === 'answer' ||
                    $(currObject).attr('tpl-object-type') === 'end-point') && (
                    <>
                        <div className="box-questions">
                            <div className="no-question">
                                QNo.{' '}
                                <input
                                    type="number"
                                    className="input-number"
                                    step={1}
                                    min={1}
                                    max={1000}
                                    // defaultValue={$(currObject).attr('tpl-qno')}
                                    value={currQNo}
                                    onChange={e => changeQno(currObject, e)}
                                    onKeyDown={cancelBubble}
                                />
                            </div>

                            {($(currObject).attr('tpl-object-type') ===
                                'answer' ||
                                $(currObject).attr('tpl-object-type') ===
                                    'end-point') && (
                                <div className="no-question">
                                    ANo.{' '}
                                    <input
                                        type="number"
                                        className="input-number"
                                        step={1}
                                        min={1}
                                        max={1000}
                                        // defaultValue={$(currObject).attr(
                                        //     'tpl-ano',
                                        // )}
                                        value={currANo}
                                        onChange={changeAno}
                                        onKeyDown={cancelBubble}
                                    />
                                </div>
                            )}

                            {$(currObject).attr('tpl-object-type') ===
                                'question' && (
                                <>
                                    <div className="text-question">
                                        {$(currObject).text()}
                                    </div>
                                    {$(currObject).attr('tpl-question-type') ===
                                        'select' && (
                                        <div className="btn-toggle">
                                            <input
                                                type="checkbox"
                                                id="check_multiselect"
                                                hidden
                                                value="1"
                                                checked={parseJsonData(
                                                    $(currObject).attr(
                                                        'tpl-multi-select',
                                                    ),
                                                )}
                                                onChange={e =>
                                                    changeMultiSelect(
                                                        currObject,
                                                        e,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="check_multiselect"
                                                className="toggleSwitch"
                                            >
                                                <span className="toggleButton"></span>
                                            </label>
                                        </div>
                                    )}
                                    <div className="list-questions ui-checkbox-type01">
                                        <ul>
                                            {/* 객관식 */}
                                            {aObjectList.map((obj, index) => {
                                                return (
                                                    <li key={index}>
                                                        <input
                                                            type="checkbox"
                                                            name="correct-answer-check"
                                                            value={$(obj).attr(
                                                                'tpl-ano',
                                                            )}
                                                            id={`correct_check_${index}`}
                                                            checked={
                                                                parseJsonData(
                                                                    $(
                                                                        currObject,
                                                                    ).attr(
                                                                        'tpl-cno',
                                                                    ) || '[]',
                                                                ).indexOf(
                                                                    Number(
                                                                        $(
                                                                            obj,
                                                                        ).attr(
                                                                            'tpl-ano',
                                                                        ),
                                                                    ),
                                                                ) > -1
                                                                    ? true
                                                                    : false
                                                            }
                                                            onChange={e =>
                                                                changeCorrectAnswer(
                                                                    currObject,
                                                                    e,
                                                                )
                                                            }
                                                        />{' '}
                                                        <label
                                                            htmlFor={`correct_check_${index}`}
                                                        >
                                                            <span>
                                                                {$(obj).attr(
                                                                    'tpl-ano',
                                                                )}
                                                                .{' '}
                                                                {obj.innerText}
                                                            </span>
                                                        </label>
                                                    </li>
                                                );
                                            })}

                                            {/* 주관식 */}
                                            {aObjectList2.map((obj, index) => {
                                                return (
                                                    <li key={index}>
                                                        <span>
                                                            {$(obj).attr(
                                                                'tpl-ano',
                                                            )}
                                                            .{' '}
                                                            {$(obj).attr(
                                                                'valid',
                                                            )}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
        </>
    );
});

export default QuizTemplate;

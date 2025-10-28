import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../../store';
import $ from 'jquery';
import {
    EundoStackAddType,
    // ETemplate_Direction,
} from '../../../../../const/types';
// import * as SelectTpl from '../../../../../util/templates/SelectTemplate';
// import NumberForm from '../../../../../util/NumberForm';
import * as dostack from '../../../../../util/dostack';
// import {
//     unselectSquareObjcts,
//     // refreshObjectSelector,
// } from '../../../../../event/SquareEvent';
import { parseJsonData } from '../../../../../util/common';

const SelectTemplate = observer(() => {
    const { workInfo } = store;
    const currObject = workInfo.getObject();
    const currObjectGroup = workInfo.getObjectGroup();
    const currObjectList = workInfo.getObjectList();
    // const pageUpdateKey = docData.getPageUpdateKey();
    const updateKey = workInfo.getUpdateKey();

    const [aObjectList, setAObjectList] = useState<HTMLDivElement[]>([]);

    // const AddAnswer = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     console.log('AddQuestion');
    //     SelectTpl.addAnswerUnit();
    //     dostack.addUndoStack('', EundoStackAddType.all);
    // };

    useEffect(() => {
        console.log('currObjectList updateKey : ', updateKey);
        const aList: HTMLDivElement[] = [];
        currObjectList.forEach(obj => {
            if ($(obj).attr('tpl-object-type') === 'answer') {
                aList.push(obj as HTMLDivElement);
            }
        });
        setAObjectList([]);
        setAObjectList(aList);
    }, [currObjectList]);

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

    return (
        <>
            {currObjectGroup.length === 1 &&
                $(currObject).attr('tpl-object-type') === 'question' && (
                    <>
                        <div className="box-questions">
                            <div className="text-question">
                                {$(currObject).text()}
                            </div>
                            <div className="btn-toggle">
                                <input
                                    type="checkbox"
                                    id="check_multiselect"
                                    hidden
                                    value="1"
                                    checked={parseJsonData(
                                        $(currObject).attr('tpl-multi-select'),
                                    )}
                                    onChange={e =>
                                        changeMultiSelect(currObject, e)
                                    }
                                />
                                <label
                                    htmlFor="check_multiselect"
                                    className="toggleSwitch"
                                >
                                    <span className="toggleButton"></span>
                                </label>
                            </div>
                            <div className="list-questions ui-checkbox-type01">
                                <ul>
                                    {aObjectList.map((obj, index) => {
                                        return (
                                            <li key={index}>
                                                {/* <span>
                                                    {$(obj).attr('tpl-ano')}.{' '}
                                                    {obj.innerText}
                                                </span> */}
                                                <input
                                                    type="checkbox"
                                                    name="correct-answer-check"
                                                    value={$(obj).attr(
                                                        'tpl-ano',
                                                    )}
                                                    id={`correct_check_${index}`}
                                                    defaultChecked={
                                                        parseJsonData(
                                                            $(currObject).attr(
                                                                'tpl-cno',
                                                            ),
                                                        ).indexOf(
                                                            Number(
                                                                $(obj).attr(
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
                                                        {$(obj).attr('tpl-ano')}
                                                        . {obj.innerText}
                                                    </span>
                                                    {/* {$(obj).attr('tpl-ano')}.{' '}
                                                    {obj.innerText} */}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
        </>
    );
});

export default SelectTemplate;

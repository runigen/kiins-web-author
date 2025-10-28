import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import * as pages from '../../../../util/pages';
import { cancelBubble } from '../../../../util/common';
import { ETemplateType, EobjectType } from '../../../../const/types';
import LineTemplate from './templates/LineTemplate';
import SelectTemplate from './templates/SelectTemplate';
import ResultTemplate from './templates/ResultTemplate';
import QuizTemplate from './templates/QuizTemplate';
import * as templateUtil from '../../../../util/template';
import * as dostack from '../../../../util/dostack';
import * as objects from '../../../../util/objects';
import * as SelectTplUtil from '../../../../util/templates/SelectTemplate';
import * as LineTplUtil from '../../../../util/templates/LineTemplate';
import * as QuizTplUtil from '../../../../util/templates/QuizTemplate';
import { unselectSquareObjcts } from '../../../../event/SquareEvent';
import { showToastMessage } from '../../../../util/dialog';

const Template = observer(() => {
    const { docData, workInfo } = store;
    const templateMode = docData.getTemplateMode();
    const docContentsList = docData.getDocContentsList();
    // const currPageNo = docData.getCurrPage();
    // const currTotalPage = docData.getTotalPage();
    const currObject = workInfo.getObject();
    const objectGroup = workInfo.getObjectGroup();
    const currUpdateKey = workInfo.getUpdateKey();
    const [objectType, setObjectType] = useState<string>(EobjectType.none);
    const [isScore, setIsScore] = useState<boolean>(false);
    const [inputChecked, setInputChecked] = useState<boolean>(false);
    const [inputGuide, setInputGuide] = useState<string>('');
    const [inputValidStr, setInputValidStr] = useState<string>('');
    const [inputValidChecked, setInputValidChecked] = useState<boolean>(false);
    const [checkboxChecked, setCheckboxChecked] = useState<boolean>(false);

    useEffect(() => {
        console.log(
            'docContentsList : ',
            docContentsList.length,
            ', ',
            docContentsList,
        );
    }, [docContentsList]);

    useEffect(() => {
        setTemplateObjectBoxState(currObject);
    }, [currObject, currUpdateKey]);

    useEffect(() => {
        for (const obj of objectGroup) {
            const type = objects.getObjectType(obj);
            setObjectType(type);
            if (type === EobjectType.audio) {
                break;
            }
        }
    }, [objectGroup]);

    const setTemplateObjectBoxState = (obj: any) => {
        if (obj === null) return;

        console.log('setTemplateObjectBoxState call');

        // const currObjectType = objects.getObjectType(currObject);
        // setObjectType(currObjectType);
        // setInputChecked(currObject.classList.contains('input-box'));

        // 1. score box
        setIsScore(obj.classList.contains('total-score'));

        // 2. inputbox
        if (obj.classList.contains('input-box')) {
            setInputChecked(true);
            const inputForm = obj.querySelector(
                'input.input-box',
            ) as HTMLInputElement;
            if (inputForm) {
                setInputGuide(inputForm.getAttribute('placeholder') || '');
            }
            setInputValidStr(obj.getAttribute('valid') || '');
            setInputValidChecked(obj.getAttribute('valid-check') === 'true');
        } else {
            setInputChecked(false);
            setInputGuide('');
            setInputValidStr('');
            setInputValidChecked(false);
        }

        // 3. checkbox
        if (obj.classList.contains('check-box')) {
            setCheckboxChecked(true);
        } else {
            setCheckboxChecked(false);
        }
    };

    const attachTempateFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('attachTempateFile');
        templateUtil.attachTempateFile(event);
        event.target.value = '';
        cancelBubble(event);
    };

    // if (currObject || templateMode === ETemplateType.none) {
    //     return <></>;
    // }

    const setTotalScoreProperty = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (event.target.checked) {
            targetObject.classList.add('total-score');
            setIsScore(true);
        } else {
            targetObject.classList.remove('total-score');
            setIsScore(false);
        }
    };

    // 문항 추가
    const addItems = () => {
        unselectSquareObjcts();
        const currTemplateMode = docData.getTemplateMode();
        if (currTemplateMode === ETemplateType.select) {
            SelectTplUtil.addAnswerUnit();
        } else if (currTemplateMode === ETemplateType.line) {
            LineTplUtil.addQuestionUnit();
        } else {
            return;
        }
        dostack.addUndoStack();
    };
    const showCorrectAnswer = () => {
        if (
            $('.canvas-sheet-shadow svg.tpl-line').length > 0 ||
            $('.canvas-sheet-shadow div.tpl-ans-mark').length > 0
        ) {
            unselectSquareObjcts();
            return;
        }
        unselectSquareObjcts();

        const currTemplateMode = docData.getTemplateMode();

        if (currTemplateMode === ETemplateType.select) {
            SelectTplUtil.showCorrectNo();
        } else if (currTemplateMode === ETemplateType.line) {
            LineTplUtil.showCorrectLine();
        } else if (currTemplateMode === ETemplateType.quiz) {
            QuizTplUtil.showCorrectNo();
        }
    };

    const changeTemplateLayout = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        unselectSquareObjcts();
        const currTemplateMode = docData.getTemplateMode();
        const tNo = event.currentTarget.checked ? 1 : 0;
        if (currTemplateMode === ETemplateType.select) {
            SelectTplUtil.setApplyDefaultTemplatePreset(tNo);
        } else if (currTemplateMode === ETemplateType.line) {
            LineTplUtil.setApplyDefaultTemplatePreset(tNo);
        }
    };
    const setInputBox = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        // const objectGroup = workInfo.getObjectGroup();
        // if (event.target.checked) {
        //     objectGroup.forEach((obj: any) => {
        //         objects.addInputBoxObject(obj);
        //     });
        // } else {
        //     objectGroup.forEach((obj: any) => {
        //         objects.removeInputBoxObject(obj);
        //         $('#idx_valid_inputbox').val('');
        //     });
        // }
        if (event.target.checked) {
            objects.addInputBoxObject(targetObject);
            setInputChecked(true);
        } else {
            objects.removeInputBoxObject(targetObject);
            setInputChecked(false);
            // $('#idx_valid_inputbox').val('');
            // $('#idx_check_input_valid_check').prop('checked', false);

            const inputForm = targetObject.querySelector(
                'input.input-box',
            ) as HTMLInputElement;
            if (inputForm) {
                inputForm.removeAttribute('placeholder');
            }
            setInputGuide('');

            targetObject.removeAttribute('valid');
            setInputValidStr('');

            targetObject.removeAttribute('valid-check');
            setInputValidChecked(false);
        }
    };
    const setInputBoxValid = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if ($('#idx_check_inputbox').is(':checked')) {
            targetObject.setAttribute('valid', event.currentTarget.value);
            setInputValidStr(event.currentTarget.value);
        }
    };
    const setCheckBox = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (event.target.checked) {
            objects.addCheckBoxObject(targetObject);
            setCheckboxChecked(true);
        } else {
            objects.removeCheckBoxObject(targetObject);
            setCheckboxChecked(false);
        }
    };
    const setInputValidCheck = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (event.target.checked) {
            if (!$('#idx_check_inputbox').is(':checked')) {
                showToastMessage('set inputbox를 체크해 주세요.', 1);
                event.target.checked = false;
                return;
            }
            const valid = $('#idx_valid_inputbox').val();
            if (valid === '') {
                showToastMessage('valid 값을 입력해 주세요.', 1);
                event.target.checked = false;
                return;
            }
            targetObject.setAttribute('valid-check', 'true');
            setInputValidChecked(true);
        } else {
            targetObject.removeAttribute('valid-check');
            setInputValidChecked(false);
        }
    };

    // const setInputBoxPlaceHolder = (
    //     targetObject: any,
    //     event: React.KeyboardEvent<HTMLInputElement>,
    // ) => {
    //     const inputForm = targetObject.querySelector(
    //         'input.input-box',
    //     ) as HTMLInputElement;
    //     if (inputForm) {
    //         const val = event.currentTarget.value.trim();
    //         if (val === '') {
    //             inputForm.removeAttribute('placeholder');
    //         } else {
    //             inputForm.setAttribute('placeholder', val);
    //         }
    //     }
    // };
    const setInputBoxPlaceHolder = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const inputForm = targetObject.querySelector(
            'input.input-box',
        ) as HTMLInputElement;
        if (inputForm) {
            const val = event.currentTarget.value.trim();
            if (val === '') {
                inputForm.removeAttribute('placeholder');
            } else {
                inputForm.setAttribute('placeholder', val);
            }
            setInputGuide(val);
        }
    };

    if (
        (objectType === EobjectType.audio ||
            objectType === EobjectType.youtube) &&
        currObject
    ) {
        return <></>;
    }

    return (
        <>
            <article className="box-list">
                <div className="content-settings">
                    <div className="row">
                        <div className="list-title">settings</div>
                        <div className="btn-selectors">
                            {/* <button className="btn-upload-file">파일 업로드</button> */}

                            {templateMode !== ETemplateType.result && (
                                <>
                                    <input
                                        type="file"
                                        id="q-input-file"
                                        accept=".json"
                                        onChange={attachTempateFile}
                                    />
                                    <label htmlFor="q-input-file">File</label>
                                </>
                            )}

                            {(templateMode === ETemplateType.select ||
                                templateMode === ETemplateType.line ||
                                templateMode === ETemplateType.quiz) && (
                                <>
                                    <button
                                        className="btn-add-question"
                                        onClick={addItems}
                                    >
                                        문항 추가
                                    </button>
                                    <button
                                        className="btn-preview-answer"
                                        onClick={showCorrectAnswer}
                                    >
                                        답안 미리보기
                                    </button>
                                </>
                            )}
                        </div>
                        {(templateMode === ETemplateType.select ||
                            templateMode === ETemplateType.line) && (
                            <div className="btn-toggle">
                                <input
                                    type="checkbox"
                                    id="toggle_1"
                                    hidden
                                    onChange={changeTemplateLayout}
                                />
                                <label
                                    htmlFor="toggle_1"
                                    className="toggleSwitch"
                                >
                                    <span className="toggleButton"></span>
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="row">
                        {/* {currObject !== null && (
                            <div className="box-score">
                                <span>use score</span>
                                <div className="ui-checkbox-type01">
                                    <input
                                        type="checkbox"
                                        id="idx_check_totalscore"
                                        // defaultChecked={
                                        //     currObject.classList.contains(
                                        //         'total-score',
                                        //     )
                                        //         ? true
                                        //         : false
                                        // }
                                        checked={isScore}
                                        onChange={e =>
                                            setTotalScoreProperty(currObject, e)
                                        }
                                    />
                                    <label htmlFor="idx_check_totalscore"></label>
                                </div>
                            </div>
                        )} */}

                        {objectGroup.length === 1 &&
                            objects.getObjectType(currObject) ===
                                EobjectType.square && (
                                <>
                                    {/* 스코어 */}
                                    {checkboxChecked === false &&
                                        inputChecked === false && (
                                            <div className="box-score">
                                                <span>use score</span>
                                                <div className="ui-checkbox-type01">
                                                    <input
                                                        type="checkbox"
                                                        id="idx_check_totalscore"
                                                        // defaultChecked={
                                                        //     currObject.classList.contains(
                                                        //         'total-score',
                                                        //     )
                                                        //         ? true
                                                        //         : false
                                                        // }
                                                        checked={isScore}
                                                        onChange={e =>
                                                            setTotalScoreProperty(
                                                                currObject,
                                                                e,
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor="idx_check_totalscore"></label>
                                                </div>
                                            </div>
                                        )}

                                    {/* 텍스트 인풋박스 */}
                                    {checkboxChecked === false &&
                                        isScore === false && (
                                            <div className="box-input">
                                                <span>set inputbox</span>
                                                <div className="ui-checkbox-type01">
                                                    <input
                                                        type="checkbox"
                                                        id="idx_check_inputbox"
                                                        // defaultChecked={
                                                        //     currObject.classList.contains(
                                                        //         'input-box',
                                                        //     )
                                                        //         ? true
                                                        //         : false
                                                        // }
                                                        checked={
                                                            inputChecked ===
                                                            true
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={e =>
                                                            setInputBox(
                                                                currObject,
                                                                e,
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor="idx_check_inputbox"></label>
                                                </div>
                                                <span>guide :</span>
                                                <input
                                                    type="text"
                                                    id="idx_placeholder_inputbox"
                                                    autoComplete="off"
                                                    onChange={e =>
                                                        setInputBoxPlaceHolder(
                                                            currObject,
                                                            e,
                                                        )
                                                    }
                                                    // defaultValue={
                                                    //     currObject
                                                    //         .querySelector(
                                                    //             'input.input-box',
                                                    //         )
                                                    //         ?.getAttribute(
                                                    //             'placeholder',
                                                    //         ) || ''
                                                    // }
                                                    value={inputGuide}
                                                    onKeyDown={cancelBubble}
                                                />
                                                <span>valid :</span>
                                                <input
                                                    type="text"
                                                    id="idx_valid_inputbox"
                                                    autoComplete="off"
                                                    onChange={e =>
                                                        setInputBoxValid(
                                                            currObject,
                                                            e,
                                                        )
                                                    }
                                                    // defaultValue={
                                                    //     currObject.getAttribute(
                                                    //         'valid',
                                                    //     ) || ''
                                                    // }
                                                    value={inputValidStr}
                                                    onKeyDown={cancelBubble}
                                                />
                                                <span>valid check : </span>
                                                <div className="ui-checkbox-type01">
                                                    <input
                                                        type="checkbox"
                                                        id="idx_check_input_valid_check"
                                                        checked={
                                                            inputValidChecked ===
                                                            true
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={e =>
                                                            setInputValidCheck(
                                                                currObject,
                                                                e,
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor="idx_check_input_valid_check"></label>
                                                </div>
                                            </div>
                                        )}

                                    {/* 체크박스 */}
                                    {inputChecked === false &&
                                        isScore === false && (
                                            <div className="box-input">
                                                <span>set checkbox</span>
                                                <div className="ui-checkbox-type01">
                                                    <input
                                                        type="checkbox"
                                                        id="idx_check_checkbox"
                                                        // defaultChecked={
                                                        //     currObject.classList.contains(
                                                        //         'check-box',
                                                        //     )
                                                        //         ? true
                                                        //         : false
                                                        // }
                                                        checked={
                                                            checkboxChecked ===
                                                            true
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={e =>
                                                            setCheckBox(
                                                                currObject,
                                                                e,
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor="idx_check_checkbox"></label>
                                                </div>
                                            </div>
                                        )}
                                </>
                            )}

                        {templateMode === ETemplateType.select && (
                            <SelectTemplate />
                        )}
                        {templateMode === ETemplateType.line && (
                            <LineTemplate />
                        )}
                        {templateMode === ETemplateType.quiz && (
                            <QuizTemplate />
                        )}
                        {templateMode === ETemplateType.result && (
                            <ResultTemplate />
                        )}
                    </div>
                </div>
            </article>
        </>
    );
});

export default Template;

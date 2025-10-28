import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../../store';
import $ from 'jquery';
import { EundoStackAddType } from '../../../../../const/types';
// import * as LineTpl from '../../../../../util/templates/LineTemplate';
// import NumberForm from '../../../../../util/NumberForm';
import * as dostack from '../../../../../util/dostack';
// import { unselectSquareObjcts } from '../../../../../event/SquareEvent';

const LineTemplate = observer(() => {
    const { workInfo } = store;
    const currObject = workInfo.getObject();
    const currObjectGroup = workInfo.getObjectGroup();
    const currObjectList = workInfo.getObjectList();

    // const [qObjectList, setQObjectList] = useState<HTMLDivElement[]>([]);
    const [aObjectList, setAObjectList] = useState<HTMLDivElement[]>([]);

    // const AddQuestion = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     console.log('AddQuestion');
    //     LineTpl.addQuestionUnit();
    //     dostack.addUndoStack('', EundoStackAddType.all);
    // };

    useEffect(() => {
        const qList: HTMLDivElement[] = [];
        const aList: HTMLDivElement[] = [];
        currObjectList.forEach(obj => {
            if ($(obj).attr('tpl-object-type') === 'start-point') {
                qList.push(obj as HTMLDivElement);
            } else if ($(obj).attr('tpl-object-type') === 'end-point') {
                aList.push(obj as HTMLDivElement);
            }
        });
        // setQObjectList(qList);
        setAObjectList(aList);
    }, [currObjectList]);

    // useEffect(() => {
    //     console.log('qa qObjectList : ', qObjectList);
    //     console.log('qa aObjectList : ', aObjectList);
    // }, [qObjectList, aObjectList]);

    const changeAnswer = (
        targetObject: any,
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const aNoVal = event.currentTarget.value;
        const qNoVal = $(targetObject).attr('tpl-qno') || '';

        // $(targetObject).attr('tpl-cno', aNoVal);
        $('#idx_canvas_sheet .object[tpl-qno=' + qNoVal + ']').attr(
            'tpl-cno',
            aNoVal,
        );

        dostack.addUndoStack('', EundoStackAddType.all);
    };

    // const setDefaultTemplatePreset = (tNo: number) => {
    //     unselectSquareObjcts();
    //     LineTpl.setApplyDefaultTemplatePreset(tNo);
    //     dostack.addUndoStack('', EundoStackAddType.all);
    // };

    // const setTemplateLayout = (
    //     direction: ETemplate_Direction,
    //     event: React.MouseEvent<HTMLButtonElement>,
    // ) => {
    //     LineTpl.setApplyDirection(direction);
    // };

    return (
        <>
            {currObjectGroup.length === 1 &&
                ($(currObject).attr('tpl-object-type') === 'start-point' ||
                    $(currObject).attr('tpl-object-type') === 'question') && (
                    <div className="box-questions">
                        <div>Question {$(currObject).attr('tpl-qno')}</div>
                        <div>
                            <span> 정답 :-&gt; </span>
                            <select
                                onChange={e => changeAnswer(currObject, e)}
                                defaultValue={$(currObject).attr('tpl-cno')}
                            >
                                {aObjectList.map((obj, index) => {
                                    return (
                                        <option
                                            value={$(obj).attr('tpl-ano')}
                                            key={index}
                                        >
                                            {$(obj).attr('tpl-ano')} 번
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )}
        </>
    );
});

export default LineTemplate;

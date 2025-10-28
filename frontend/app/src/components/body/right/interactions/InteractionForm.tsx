import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
import {
    allEventCancel,
    cancelBubble,
    getInteractionsName,
    getUniqId,
    getInteractionIdHead,
} from '../../../../util/common';
import {
    interactionTriggerList,
    interactionActionList,
    // interactionPageActionList,
} from '../../../../const/basicData';
import {
    // EpreviewPlayStatus,
    IinteractionsInfo,
    IinteractionsInfoExt,
    IinteractionTriggerInfo,
    IinteractionActionInfo,
    EundoStackAddType,
    // EobjectType,
} from '../../../../const/types';
import * as interactions from '../../../../util/interactions';
import { showToastMessage } from '../../../../util/dialog';
import * as dostack from '../../../../util/dostack';
// import { action } from 'mobx';
import * as pages from '../../../../util/pages';
import docData from '../../../../store/docData';
import { getObjectType } from '../../../../util/objects';

let gTargetObject: any;
let gInteractionId = '';
interface IinteractionProps {
    refInteractionsInfo: IinteractionsInfoExt | null;
    formType: 'data' | 'empty';
}

export const emptyInteractionInfoExt = {
    id: '',
    name: '',
    trigger: '',
    targetId: [''],
    targetName: [''],
    action: '',
};

const InteractionForm = observer(
    ({ refInteractionsInfo, formType }: IinteractionProps) => {
        const { workInfo } = store;
        const currObject: any = workInfo.getObject();
        const objectList: any[] = workInfo.getObjectList();
        // const updateKey: number = workInfo.getUpdateKey();
        const currObjectGroup = workInfo.getObjectGroup();
        const logicActionList = docData.getLogicActionList();
        const [interactionsInfo, setInteractionsInfo] =
            useState<IinteractionsInfoExt | null>(null);
        const [disableName, setDisableName] = useState(true);
        const [interName, setInterName] = useState('');
        const [selectTriggerName, setSelectTriggerName] = useState<string>('');
        const [selectTargetList, setSelectTargetList] = useState<string[]>([]);

        useEffect(() => {
            // console.log('useEffect currObject : ', currObject);
            gTargetObject = currObject;
        }, [currObject]);

        // useEffect(() => {
        //     // console.log(objectList);
        // }, [objectList, updateKey]);

        useEffect(() => {
            console.log('refInteractionsInfo : ', refInteractionsInfo);
            setInteractionsInfo(refInteractionsInfo);

            if (refInteractionsInfo !== null) {
                // setSelectInterName(refInteractionsInfo.name);
                setSelectTriggerName(refInteractionsInfo.trigger);
                // setSelectActionName(refInteractionsInfo.action);
                setSelectTargetList(refInteractionsInfo.targetId);
            } else {
                // setSelectInterName('');
                setSelectTriggerName('');
                // setSelectActionName('');
                setSelectTargetList([]);
            }
        }, [refInteractionsInfo]);

        useEffect(() => {
            if (
                interactionsInfo &&
                interactionsInfo.id === '' &&
                formType === 'empty'
            ) {
                setInteractionsInfo({
                    ...interactionsInfo,
                    name: getInteractionsName(),
                    id: getUniqId(getInteractionIdHead()),
                });
                setDisableName(false);
            }
        }, [interactionsInfo, formType]);

        useEffect(() => {
            console.log('interactionsInfo : ', interactionsInfo);
            if (interactionsInfo) {
                setInterName(interactionsInfo.name);
            }
        }, [interactionsInfo]);

        useEffect(() => {
            if (disableName === false) {
                selectInteractionNameForm();
            }
        }, [disableName]);

        const showInteractionList = (e: React.MouseEvent<HTMLDivElement>) => {
            const currObj = e.currentTarget;
            if ($(currObj).hasClass('active')) {
                $(currObj).removeClass('active');
            } else {
                $(currObj).addClass('active');
            }
        };

        const addTargetIdForm = (
            interactionId: string,
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            console.log('addTargetIdForm Click');

            const parentElement = event.currentTarget.parentNode?.nextSibling;
            const selectContainer = document.createElement('div');
            selectContainer.className = 'dynamic-container';
            const uiSelect = document.createElement('div');
            uiSelect.className = 'ul-dropdown';
            const selectObj = document.createElement('select');
            selectObj.name = 'target_id';

            let optionObj = document.createElement('option');
            optionObj.value = '';
            optionObj.text = ' select target';
            selectObj.appendChild(optionObj);

            objectList.map((obj: any) => {
                optionObj = document.createElement('option');
                optionObj.value = obj.id;
                optionObj.text = obj.name;
                selectObj.appendChild(optionObj);
            });
            selectObj.onchange = () => {
                updateInteractionsInfo(interactionId);
            };

            selectContainer.appendChild(uiSelect);
            uiSelect.appendChild(selectObj);
            parentElement?.appendChild(selectContainer);

            //button 추가
            const buttonEle = document.createElement('button');
            buttonEle.className = 'btn-del-target';
            buttonEle.setAttribute('aria-label', 'Delete Target');
            buttonEle.onclick = (e: any) => {
                deleteTargetForm(interactionId, e);
            };

            selectContainer.appendChild(buttonEle);
        };

        const getCurrentInteractionName = (interactionId: string) => {
            const interactionName = String(
                $(
                    '#INTER_' + interactionId + ' input[name=interaction_name]',
                ).val() || '',
            );
            // setSelectInterName(interactionName);
            return interactionName;
        };
        const getCurrentTriggerName = (interactionId: string) => {
            const triggerName = String(
                $(
                    '#INTER_' + interactionId + ' select[name=trigger_name]',
                ).val() || '',
            );
            setSelectTriggerName(triggerName);
            return triggerName;
        };
        const getCurrentActionName = (interactionId: string) => {
            const actionName = String(
                $(
                    '#INTER_' + interactionId + ' select[name=action_name]',
                ).val() || '',
            );
            // setSelectActionName(actionName);
            return actionName;
        };
        const getCurrentTargetIdList = (interactionId: string) => {
            const targetIdList: string[] = [];
            $(
                '.box-list#INTER_' + interactionId + ' select[name=target_id',
            ).each((index: number, selectobj: any) => {
                if ($(selectobj).val() !== '') {
                    targetIdList.push(String($(selectobj).val()));
                }
            });
            setSelectTargetList(targetIdList);
            return targetIdList;
        };
        const updateInteractionsInfo = (interactionId: string) => {
            console.log('updateInteractionsInfo');
            // if (!gTargetObject) return;

            const interactionName = getCurrentInteractionName(interactionId);
            const triggerName = getCurrentTriggerName(interactionId);
            const actionName = getCurrentActionName(interactionId);
            const targetIdList = getCurrentTargetIdList(interactionId);
            console.log('interactionId : ', interactionId);

            // let targetIdList: string[] = [];
            // $('.box-list#INTER_' + interactionId + ' select[name=target_id').each(
            //     (index: number, selectobj: any) => {
            //         if ($(selectobj).val() !== '') {
            //             targetIdList.push(String($(selectobj).val()));
            //         }
            //     },
            // );
            // console.log('targetIdList : ', targetIdList);

            // target 에 page 가 있는경우 actionName 에는 page 액션만 가능하다.
            // if (targetIdList.length > 0 && targetIdList.indexOf('page') > -1) {
            //     if (
            //         actionName !== '' &&
            //         interactionPageActionList.filter(
            //             actions => actions.actionVal === actionName,
            //         ).length === 0
            //     ) {
            //         alert('page 가 있는경우 action 은 page 만 가능합니다.');
            //         $('#INTER_' + interactionId + ' select[name=action_name]').val(
            //             '',
            //         );
            //         return;
            //     }
            // }

            // 세 항목이 모두 입력된 경우 업데이트 진행한다.
            if (
                interactionName === '' ||
                triggerName === '' ||
                actionName === '' ||
                targetIdList.length === 0
            ) {
                console.log('내용이 모두 입력되면 저장됩니다.');
                return;
            }

            // targetIdList 값중 중복된 값이 있는지 확인
            const uniqTargetIdList = new Set(targetIdList);
            if (targetIdList.length !== uniqTargetIdList.size) {
                showToastMessage('Target에 중복이 있습니다.');
                return;
            }

            const newInteractionsInfo: IinteractionsInfo = {
                id: interactionId,
                name: interactionName,
                trigger: triggerName,
                targetId: targetIdList,
                action: actionName,
            };
            console.log('newInteractionsInfo : ', newInteractionsInfo);

            const objectGroup = workInfo.getObjectGroup();
            if (objectGroup.length > 0) {
                objectGroup.forEach((obj: any, index: number) => {
                    if (index > 0) {
                        newInteractionsInfo.name =
                            newInteractionsInfo.name + '-' + index;
                    }
                    interactions.addInteractions(obj, newInteractionsInfo);
                });
            } else {
                const pageObj = pages.getPageObject();
                if (pageObj) {
                    interactions.addInteractions(pageObj, newInteractionsInfo);
                }
            }

            // dostack.addUndoStack(gTargetObject.id, EundoStackAddType.interaction);
            dostack.addUndoStack('', EundoStackAddType.all);

            // if($('.box-list#INTER_' + interactionId).parent().attr('id') === 'idx_interaction_inputbox') {
            initializeForms(interactionId);
            // }

            // showToastMessage('저장되었습니다.');
        };

        const initializeForms = (interactionId: string) => {
            $('#INTER_' + interactionId + ' .dynamic-container').remove();
            hideInputbox();

            // 현재 설정하는 폼이 (+) 를 눌러 추가하는 추가폼인경우 폼 데이터를 초기화 한다.
            if (
                $('.box-list#INTER_' + interactionId)
                    .parent()
                    .attr('id') === 'idx_interaction_inputbox'
            ) {
                setInteractionsInfo(emptyInteractionInfoExt);
            }
        };

        const hideInputbox = () => {
            $('#idx_interaction_inputbox').hide();
            if ($('#idx_interaction_inputbox').hasClass('active')) {
                $('#idx_interaction_inputbox').removeClass('active');
            }
        };

        const deleteTargetForm = (
            interactionId: string,
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            console.log('interactionId: ', interactionId);
            console.log('formType: ', formType);

            const selectContainer = event.currentTarget.parentNode;
            if (selectContainer) {
                const parentContainer = selectContainer.parentNode;
                if (parentContainer) {
                    if (
                        parentContainer.childNodes &&
                        parentContainer.childNodes.length < 2
                    ) {
                        showToastMessage('1개는 유지');
                        return;
                    }
                }
            }

            // 추가하는 빈 폼인경우 폼만 삭제 (인터렉션 수정X)
            if (formType === 'empty') {
                const selectContainer = event.currentTarget
                    .parentNode as HTMLDivElement;
                if (selectContainer) {
                    // 선택한 폼컨테이너가 디폴트 폼이면
                    if (selectContainer.className === 'static_container') {
                        // 다음 폼컨테이너를 디폴트로 세팅
                        const nextContainer =
                            selectContainer.nextSibling as HTMLDivElement;
                        if (nextContainer) {
                            // 다음 폼의 값을 현재 폼에 세팅하고
                            const nextVal = String(
                                $(nextContainer)
                                    .children('.ul-dropdown')
                                    .children('select')
                                    .val(),
                            );
                            $(selectContainer)
                                .children('.ul-dropdown')
                                .children('select')
                                .val(nextVal);

                            // 다음 폼은 삭제
                            $(nextContainer).remove();

                            // 다음 폼컨테이너가 없으면 오류이므로 중단
                        } else {
                            showToastMessage('1개는 유지');
                            return;
                        }
                    } else {
                        // 선택한 폼 컨테이너 삭제
                        $(selectContainer).remove();
                    }
                }

                // 기존 인터렉션을 수정하는 폼인경우 인터렉션 수정 진행
            } else {
                const selectObj =
                    event.currentTarget.previousSibling?.firstChild;
                if (selectObj) {
                    const selectTargetId = String($(selectObj).val());
                    if (selectTargetId) {
                        interactions.removeTargetId(
                            gTargetObject,
                            interactionId,
                            selectTargetId,
                        );
                        // dostack.addUndoStack(gTargetObject.id, EundoStackAddType.interaction);
                        dostack.addUndoStack('', EundoStackAddType.all);
                        initializeForms(interactionId);
                    }
                }
            }
        };

        const deleteInteraction = (
            interactionId: string,
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            console.log('deleteInteraction');
            if (gTargetObject) {
                interactions.removeInteraction(gTargetObject, interactionId);
            } else {
                const pageObj = pages.getPageObject();
                if (pageObj) {
                    interactions.removeInteraction(pageObj, interactionId);
                }
            }
            // dostack.addUndoStack(gTargetObject.id, EundoStackAddType.interaction);
            dostack.addUndoStack('', EundoStackAddType.all);
            allEventCancel(event);
        };

        const inputInteractionName = (
            interactionId: string,
            event: React.KeyboardEvent<HTMLInputElement>,
        ) => {
            updateInteractionsInfo(interactionId);
            cancelBubble(event);
        };

        const editName = (
            interactionId: string,
            bDisable: boolean,
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            gInteractionId = interactionId;
            setDisableName(bDisable);
            cancelBubble(event);
        };

        const recoverDisableName = () => {
            setDisableName(true);
        };

        const selectInteractionNameForm = () => {
            if (gInteractionId === '') return;
            try {
                const inputObj = $(
                    '#INTER_' +
                        gInteractionId +
                        ' input[name=interaction_name]',
                );
                inputObj.trigger('focus');
                inputObj.trigger('select');
            } catch (e) {
                // e
            }
        };

        const changeInteractionName = (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => {
            setInterName(event.target.value);
        };

        if (interactionsInfo === null) {
            return <></>;
        }

        return (
            <div className="box-list" id={`INTER_${interactionsInfo.id}`}>
                <div
                    className={`list-title active`}
                    onClick={showInteractionList}
                >
                    <span className="title-name">name</span>
                    <input
                        type="text"
                        name="interaction_name"
                        value={interName}
                        onKeyDown={cancelBubble}
                        onClick={cancelBubble}
                        onKeyUp={e =>
                            inputInteractionName(interactionsInfo.id, e)
                        }
                        onBlur={recoverDisableName}
                        disabled={disableName}
                        onChange={changeInteractionName}
                    />
                    {/* <button className="btn-del">Delete</button> */}

                    {formType === 'data' ? (
                        <div className="btn-controls">
                            <button
                                type="button"
                                aria-label="Edit"
                                className="btn-edit"
                                onClick={e =>
                                    editName(interactionsInfo.id, false, e)
                                }
                            ></button>
                            <button
                                type="button"
                                aria-label="Delete"
                                className="btn-delete"
                                onClick={e =>
                                    deleteInteraction(interactionsInfo.id, e)
                                }
                            ></button>
                        </div>
                    ) : (
                        <button className="btn-del" onClick={hideInputbox}>
                            Delete
                        </button>
                    )}
                </div>
                <div className="list-content">
                    <div className="interactions-container">
                        <div className="left-box">
                            <strong>Trigger</strong>
                        </div>
                        <div className="right-box">
                            <div className="ul-dropdown">
                                <select
                                    name="trigger_name"
                                    onChange={() =>
                                        updateInteractionsInfo(
                                            interactionsInfo.id,
                                        )
                                    }
                                >
                                    {formType === 'empty' && (
                                        <option value="">select trigger</option>
                                    )}
                                    {interactionTriggerList.map(
                                        (
                                            currTriggerInfo: IinteractionTriggerInfo,
                                        ) => (
                                            <option
                                                key={`${interactionsInfo.id}_${currTriggerInfo.triggerVal}`}
                                                value={
                                                    currTriggerInfo.triggerVal
                                                }
                                                selected={
                                                    interactionsInfo.trigger ===
                                                    currTriggerInfo.triggerVal
                                                        ? true
                                                        : false
                                                }
                                                disabled={
                                                    currObjectGroup.length === 0
                                                        ? currTriggerInfo.triggerVal ===
                                                              'pageload' ||
                                                          currTriggerInfo.triggerVal ===
                                                              'keydown'
                                                            ? false
                                                            : true
                                                        : currTriggerInfo.triggerVal ===
                                                              'pageload' ||
                                                          currTriggerInfo.triggerVal ===
                                                              'keydown'
                                                        ? true
                                                        : false
                                                }
                                            >
                                                {currTriggerInfo.triggerName}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="interactions-container">
                        <div className="left-box">
                            <button
                                type="button"
                                aria-label="Add Target"
                                className="btn-add-target"
                                onClick={e =>
                                    addTargetIdForm(interactionsInfo.id, e)
                                }
                            ></button>
                            <strong>Target</strong>
                        </div>
                        <div className="right-box">
                            {interactionsInfo.targetId.map(
                                (targetid: string) => (
                                    <div
                                        className="static_container"
                                        key={`targetid_${interactionsInfo.id}_${targetid}`}
                                    >
                                        <div className="ul-dropdown">
                                            <select
                                                name="target_id"
                                                defaultValue={targetid}
                                                onChange={() =>
                                                    updateInteractionsInfo(
                                                        interactionsInfo.id,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    select target
                                                </option>
                                                <option
                                                    value="--------------"
                                                    disabled={true}
                                                >
                                                    ------ PAGE -----
                                                </option>
                                                {selectTriggerName !== '' && (
                                                    <option value="page">
                                                        [page]{' '}
                                                        {pages.getPageName()}
                                                    </option>
                                                )}
                                                <option
                                                    value="--------------"
                                                    disabled={true}
                                                >
                                                    ------ OBJECT -----
                                                </option>
                                                {selectTriggerName !== '' &&
                                                    objectList.map(
                                                        (obj: any) => (
                                                            <option
                                                                key={`objectid_${interactionsInfo.id}_${targetid}_${obj.id}`}
                                                                value={obj.id}
                                                            >
                                                                [
                                                                {getObjectType(
                                                                    obj,
                                                                )}
                                                                ] {obj.name}
                                                            </option>
                                                        ),
                                                    )}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Delete Target"
                                            className="btn-del-target"
                                            onClick={e =>
                                                deleteTargetForm(
                                                    interactionsInfo.id,
                                                    e,
                                                )
                                            }
                                        ></button>
                                        {/* {targetid !== '' &&
                                    <button type="button" aria-label='Delete Target' className='btn-del-target' onClick={(e)=>deleteTargetForm(interactionsInfo.id, e)}></button>
                                } */}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                    <div className="interactions-container">
                        <div className="left-box">
                            <strong>Action</strong>
                        </div>
                        <div className="right-box">
                            <div className="ul-dropdown">
                                <select
                                    name="action_name"
                                    // id={interactionsInfo.action}
                                    onChange={() =>
                                        updateInteractionsInfo(
                                            interactionsInfo.id,
                                        )
                                    }
                                >
                                    {formType === 'empty' && (
                                        <option value="">select action</option>
                                    )}
                                    {selectTargetList.length > 0 &&
                                        interactionActionList.map(
                                            (
                                                currActionInfo: IinteractionActionInfo,
                                            ) => (
                                                <option
                                                    key={`${interactionsInfo.id}_${currActionInfo.actionVal}`}
                                                    value={
                                                        currActionInfo.actionVal
                                                    }
                                                    selected={
                                                        interactionsInfo.action ===
                                                        currActionInfo.actionVal
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    {currActionInfo.actionName}
                                                </option>
                                            ),
                                        )}

                                    {logicActionList.length > 0 && (
                                        <option
                                            value="--------------"
                                            disabled={true}
                                        >
                                            ------USER ACTION-----
                                        </option>
                                    )}

                                    {logicActionList.length > 0 &&
                                        logicActionList.map(
                                            (currLogicData: any) => (
                                                <option
                                                    key={`${interactionsInfo.id}_${currLogicData.actionId}`}
                                                    value={
                                                        currLogicData.actionId
                                                    }
                                                    selected={
                                                        interactionsInfo.action ===
                                                        currLogicData.actionId
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    [User]{' '}
                                                    {currLogicData.actionName}
                                                </option>
                                            ),
                                        )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);
export default InteractionForm;

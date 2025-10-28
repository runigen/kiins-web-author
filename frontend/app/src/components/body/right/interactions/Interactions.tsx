import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import {
//     allEventCancel,
//     cancelBubble,
//     getInteractionsName,
//     getUniqId,
//     getInteractionIdHead,
// } from '../../../../util/common';
import {
    interactionTriggerList,
    // interactionActionList,
    // interactionPageActionList,
} from '../../../../const/basicData';
import {
    // EpreviewPlayStatus,
    IinteractionsInfo,
    IinteractionsInfoExt,
    // IinteractionTriggerInfo,
    // IinteractionActionInfo,
    // EundoStackAddType,
    EobjectType,
} from '../../../../const/types';
import * as interactions from '../../../../util/interactions';
import InteractionForm, { emptyInteractionInfoExt } from './InteractionForm';
// import { showToastMessage } from '../../../../util/dialog';
// import * as dostack from '../../../../util/dostack';
// import { action } from 'mobx';
import * as pages from '../../../../util/pages';
// import docData from '../../../../store/docData';
import * as objects from '../../../../util/objects';

// let gTargetObject: any;
// let gTriggerList: IinteractionTriggerInfo[] = [];
// const emptyInteractionInfoExt = {
//     id: '',
//     name: '',
//     trigger: '',
//     targetId: [''],
//     targetName: [''],
//     action: '',
// };

const Interactions = observer(() => {
    const { workInfo } = store;
    const currObject: any = workInfo.getObject();
    // const objectList: any[] = workInfo.getObjectList();
    const objectGroup: any[] = workInfo.getObjectGroup();
    // const updateKey: number = workInfo.getUpdateKey();
    const modifiedInteraction = workInfo.getModifiedInteraction();
    // const [objectName, setObjectName] = useState<string>('');
    // const [triggerName, setTriggerName] = useState<string>('');
    // const [targetId, setTargetId] = useState<string>('');
    // const [actionName, setActionName] = useState<string>('');
    const [objectType, setObjectType] = useState<string>('');

    const [interactionList, setInteractionList] = useState<
        IinteractionsInfoExt[]
    >([]);
    // const [triggerList, setTrggerList] = useState<IinteractionTriggerInfo[]>(
    //     [],
    // );
    // const [accor, setAccor] = useState<boolean>(true);
    // const [interactionName, setInteractionName] = useState<string>('');

    // useEffect(()=>{

    //     return () => {
    //         // initializeSelect();
    //     }

    // }, []);

    useEffect(() => {
        // console.log('useEffect currObject : ', currObject);
        // gTargetObject = currObject;
        if (currObject === null) {
            const pageObj = pages.getPageObject();
            refreshInteractionList(pageObj);
        } else {
            refreshInteractionList(currObject);
        }
    }, [currObject]);

    useEffect(() => {
        if (modifiedInteraction !== true) return;
        workInfo.setModifiedInteraction(false);
        if (currObject === null) {
            const pageObj = pages.getPageObject();
            refreshInteractionList(pageObj);
        } else {
            refreshInteractionList(currObject);
        }
    }, [currObject, modifiedInteraction]);

    // useEffect(() => {
    //     gTriggerList = triggerList;
    // }, [triggerList]);

    useEffect(() => {
        for (const obj of objectGroup) {
            const type = objects.getObjectType(obj);
            setObjectType(type);
            if (type === EobjectType.audio) {
                break;
            }
        }
    }, [objectGroup]);

    const refreshInteractionList = (selectObject: any) => {
        console.log('refreshInteractionList');
        const interactionsInfoList =
            interactions.getInteractionsInfo(selectObject);

        const newInteractionList: IinteractionsInfoExt[] = [];
        if (interactionsInfoList.length > 0) {
            interactionsInfoList.map((item: IinteractionsInfo) => {
                newInteractionList.push({
                    ...item,
                    targetName: item.targetId.map(
                        id => $('#' + id).attr('object-name') || '',
                    ),
                });
            });
        }
        setInteractionList(newInteractionList);

        const allTriggerList = [...interactionTriggerList];
        if (interactionsInfoList.length === 0) {
            // setTrggerList(allTriggerList);
        } else {
            const currTriggerList = interactionsInfoList.map(
                item => item.trigger,
            );
            console.log('currTriggerList: ', currTriggerList);
            const allowTriggerList = allTriggerList.filter(
                triggerInfo =>
                    !currTriggerList.includes(triggerInfo.triggerVal),
            );
            console.log('allowTriggerList: ', allowTriggerList);
            // setTrggerList(allowTriggerList);
        }
    };

    // const disableEvent = (bAction: boolean) => {
    //     $('#idx_trigger_name').prop('disabled', bAction);
    //     if(bAction === true) {
    //         $('#idx_trigger_name').attr('title', '대상오브젝트를 선택해주세요.');
    //     } else {
    //         $('#idx_trigger_name').removeAttr('title');
    //     }
    // };

    const showInputBox = () => {
        const currObjectGroup = workInfo.getObjectGroup();
        const folderSelected = workInfo.getFolderSelected();

        //if (currObjectGroup.length === 0 || folderSelected === true) {
        console.log(
            'showInputBox : ',
            currObjectGroup.length,
            ', ',
            folderSelected,
        );
        if (folderSelected === true) {
            $('#idx_interaction_inputbox').removeClass('active');
            $('#idx_interaction_inputbox').hide();
            return;
        }

        $('#idx_interaction_inputbox').show();
        if (!$('#idx_interaction_inputbox').hasClass('active')) {
            $('#idx_interaction_inputbox').addClass('active');
        }
    };

    return (
        <>
            {interactionList.length > 0 ? (
                interactionList.map(
                    (currInteractions: IinteractionsInfoExt, index: number) => (
                        <InteractionForm
                            key={index}
                            refInteractionsInfo={currInteractions}
                            formType="data"
                        />
                    ),
                )
            ) : (
                <InteractionForm refInteractionsInfo={null} formType="empty" />
            )}

            {/* {currObject !== null && ( */}
            <div id="idx_interaction_inputbox" style={{ display: 'none' }}>
                <InteractionForm
                    refInteractionsInfo={emptyInteractionInfoExt}
                    formType="empty"
                />
            </div>
            {/* )} */}

            <button
                type="button"
                className="btn-add-itrc"
                aria-label="Add"
                onClick={showInputBox}
                style={{
                    display: objectType === EobjectType.audio ? 'none' : '',
                }}
            ></button>
        </>
    );
});

export default Interactions;

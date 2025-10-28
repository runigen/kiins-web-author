import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import $ from 'jquery';
// import TimeLine from './TimeLine';
import TimeLineHeadButton from './TimeLineHeadButton';
import TimeLineRuler from './TimeLineRuler';
// import * as SquareEvent from '../../../event/SquareEvent';
import * as CommonEvent from '../../../event/CommonEvent';
// import * as SquareEvent from '../../../event/SquareEvent';
// import * as TimeLineResizeEvent from '../../../event/TimeLineSizeEvent';
import * as TimeLineEvent from '../../../event/TimeLineEvent';
import {
    // convertTimeFormat,
    // setPlayTimeView,
    allEventCancel,
    cancelBubble,
    getNewObjectOrderNo,
    // cancelBubble,
    // parseJsonData,
    numSort,
    sortObjectList,
    // getUniqId,
    // getFolderIdHead,
    // getFolderNameHead,
    setLastObjectOrderNo,
} from '../../../util/common';
// import {
//     getParentElement

// } from '../../../util/texteditor';

// import * as context from '../../../util/context';
import * as keyframe from '../../../util/keyframe';
import * as transition from '../../../util/transition';
import * as interactions from '../../../util/interactions';
import * as dostack from '../../../util/dostack';
// import * as timeline from '../../../util/timeline';
import * as objects from '../../../util/objects';
// import * as KeyEvent from '../../../event/KeyEvent';

import {
    // IinteractionsInfo,
    ItransitionInfo,
    // EworkStatus,
    EundoStackAddType,
    // EkeyName,
    EobjectType,
    EObjectFolderStatus,
    EObjectFolderView,
    EResouce_Filter_List_Type,
} from '../../../const/types';
// import { showToastMessage } from '../../../util/dialog';
import { timelineObjectGroupDepthIndent } from '../../../const/basicData';
import ObjectFilterList, {
    toggleShowResourcesFilter,
} from '../../popup/ObjectFilterList';

// let gPrevObjectId: string = '';
let gCurrObject: HTMLElement | null = null;
// let gTimelineZoom: number = 1;
// const pixelMag = true; // 타일라인 이동시 10 픽셀 단위로 달라붙게

const TimeSpace = observer(() => {
    const { workInfo } = store;
    const objectList: any = workInfo.getObjectList();
    const currObject: any = workInfo.getObject();
    const objectGroup: any = workInfo.getObjectGroup();
    // const updateKey: number = workInfo.getUpdateKey();
    const timelineZoom: number = workInfo.getTimelineZoom();
    const [elementList, setElementList] = useState<any[]>([]);
    const logicMode = workInfo.getLogicMode();
    const [allLock, setAllLock] = useState(false);
    const [allHide, setAllHide] = useState(false);

    const currKeyframeStep = workInfo.getCurrKeyframeStep();
    const currTransitionStep = workInfo.getCurrTransitionStep();
    const modifiedKeyFrame = workInfo.getModifiedKeyframe();
    const modifiedOrderNo = workInfo.getModifiedOrderNo();
    // const modifiedInteraction = workInfo.getModifiedInteraction();

    const [currFilterList, setCurrFilterList] = useState<
        EResouce_Filter_List_Type[]
    >([]);
    useEffect(() => {
        document.addEventListener('keydown', TimeLineEvent.setKeydownEvent);
        return () => {
            document.removeEventListener(
                'keydown',
                TimeLineEvent.setKeydownEvent,
            );
        };
    }, []);

    // object순서, 그룹정보, keyframe정보,
    useEffect(() => {
        console.log('objectList currObject modified 11: ', objectList.length);
        if (objectList.length) {
            const newList = objectList.map((item: any) => {
                // item.name = $(item).attr('object-name');
                item.name = objects.getObjectName(item);

                // item.type = $(item).attr('object-type');
                item.type = objects.getObjectType(item);
                item.orderNo =
                    objects.getObjectOrderNo(item) || getNewObjectOrderNo();

                item.folderStatus = objects.getObjectFolderStatus(item);
                item.folderView = objects.getObjectFolderView(item);
                // item.folderView2 = objects.getObjectFolderView2(item);
                // item.folderView3 = objects.getObjectFolderView3(item);

                console.log(
                    'item.name : ',
                    item.name,
                    ', item.orderNo :',
                    item.orderNo,
                    ', item.folderStatus :',
                    item.folderStatus,
                );

                item.folderInfo = objects.getObjectFolderInfo(item);
                if (item.folderInfo) {
                    item.folderDepth = item.folderInfo.split('/').length - 1;
                } else {
                    item.folderDepth = 0;
                }

                // --- transition data
                item.transitionInfo = transition.getTransitionInfo(item);

                // -- interaction data
                item.interactionsInfo = interactions.getInteractionsInfo(item);

                // -- keyframe data
                item.keyframeInfo = keyframe.getKeyFrameInfo(item);
                item.keyframeInfoData = [];
                if (item.keyframeInfo.length > 0) {
                    //item.keyframeInfo.map(keyframe => {
                    let moveTargetData = null;

                    //if (keyframe.frameData) {
                    //--- 키 프레임 애니메이션 범뉘 데이터 작성
                    const moveData = [];
                    if (item.keyframeInfo.length > 1) {
                        for (let i = 1; i < item.keyframeInfo.length; i++) {
                            moveData.push({
                                timeLeft: [
                                    item.keyframeInfo[i - 1].timeLeft,
                                    item.keyframeInfo[i].timeLeft,
                                ],
                                size: [
                                    item.keyframeInfo[i - 1].size,
                                    item.keyframeInfo[i].size,
                                ],
                                easing:
                                    typeof item.keyframeInfo[i].easing !==
                                    'undefined'
                                        ? item.keyframeInfo[i].easing
                                        : 'linear',
                            });
                        }
                        moveTargetData = moveData;
                    } else if (item.keyframeInfo.length === 1) {
                        moveData.push({
                            timeLeft: [
                                item.keyframeInfo[0].timeLeft,
                                item.keyframeInfo[0].timeLeft,
                            ],
                            size: [
                                item.keyframeInfo[0].size,
                                item.keyframeInfo[0].size,
                            ],
                        });
                        moveTargetData = moveData;
                    } else {
                        moveTargetData = null;
                    }

                    //item.keyframeInfoData.push(moveTargetData);
                    item.keyframeInfoData = moveTargetData;
                    //}
                    //});
                }

                // -- return
                return item;
            });

            // console.log('sort newList : ', newList);
            const sortEleemntList = sortObjectList(
                newList,
                'orderNo',
                'ASC',
                'n',
            );

            // orderNo 이 소수점이므로 자연수로 다시 설정 (위에서 소팅했으므로 순서대로 매긴다)
            if (modifiedOrderNo) {
                workInfo.setModifiedOrderNo(false);
                let lastOrderNo = 0;
                sortEleemntList.map((obj: any, index: number) => {
                    console.log(
                        'end newSortObjectList org : orderNo : ',
                        obj.orderNo,
                    );
                    obj.orderNo = index + 1;
                    objects.setObjectOrderNo(obj, index + 1);
                    lastOrderNo = index + 1;
                    console.log('end newSortObjectList orderNo : ', index + 1);
                });
                setLastObjectOrderNo(lastOrderNo);
            }

            // console.log('sort sortEleemntList : ', sortEleemntList);
            setElementList(sortEleemntList);

            workInfo.setElementDataList(sortEleemntList);
        } else {
            setElementList([]);
            workInfo.setElementDataList([]);
            setAllLock(false);
            setAllHide(false);
        }
        // }, [objectList, currObject, updateKey]);
    }, [objectList, modifiedOrderNo, modifiedKeyFrame]);

    // ***************************** 키프레임 정보 별도 저장 ******************************************
    useEffect(() => {
        if (modifiedKeyFrame !== true) return;
        workInfo.setModifiedKeyframe(false);

        console.log('useEffect elementList : => ');
        const keyframeRangeListVal: number[] = [];
        let keyframeRangeList = [];
        // let lKeyframeDataList = [];
        let maxRange = 0;
        const currObjectList = workInfo.getObjectList();
        if (currObjectList.length) {
            currObjectList.map((element: any) => {
                if (element.keyframeInfo) {
                    element.keyframeInfo.map((keyframe: any) => {
                        keyframeRangeListVal.push(keyframe.timeLeft);
                    });
                }
                if (element.transitionInfo) {
                    element.transitionInfo.map((transition: any) => {
                        if (transition.type === 'appear') {
                            keyframeRangeListVal.push(transition.start);
                        } else {
                            keyframeRangeListVal.push(transition.start);
                            keyframeRangeListVal.push(transition.end);
                        }
                    });
                }
            });

            if (keyframeRangeListVal.length > 0) {
                // 중복제거
                keyframeRangeList = [...new Set(keyframeRangeListVal)];
                // 숫자 순서로 정렬
                keyframeRangeList = numSort(keyframeRangeList);
                // 최대값 찾기
                maxRange = Math.max(...keyframeRangeList);
            }
        }

        workInfo.setTotalPlayRange(maxRange);
        workInfo.setKeyframeRangeList(keyframeRangeList);
    }, [modifiedKeyFrame]);

    useEffect(() => {
        // if (currObject) {
        //     workInfo.addObjectList(currObject);
        // }
        gCurrObject = currObject;
        if (gCurrObject === null) {
            TimeLineEvent.initSelectStep();
        }
    }, [currObject]);

    // useEffect(() => {
    //     gTimelineZoom = timelineZoom;
    // }, [timelineZoom]);

    const lockAllObject = (event: React.MouseEvent<HTMLButtonElement>) => {
        const lock = !$(event.currentTarget).hasClass('active');
        const currObjectList = workInfo.getObjectList();
        currObjectList.forEach(obj => {
            objects.lockObject(obj.id, lock);
        });
        CommonEvent.unselectObjects();
        setAllLock(lock);
        cancelBubble(event);
    };
    const lockObject = (
        event: React.MouseEvent<HTMLDivElement>,
        objectId: string,
    ) => {
        console.log('lockObject objectId : ', objectId);

        // 1. 대상 오브젝트 처리
        const btnObj = event.currentTarget;
        const bLock = !$(btnObj).hasClass('active');
        objects.lockObject(objectId, bLock);

        // 2. 전체처리 : 전체가 잠기면 잠금, 하나라도 풀리면 풀림으로 세팅
        const currObjectList = workInfo.getObjectList();
        const allLock =
            currObjectList.filter(obj => !objects.isLocked(obj.id)).length > 0
                ? false
                : true;

        CommonEvent.unselectObjects();
        setAllLock(allLock);
        cancelBubble(event);
    };
    const hideObject = (
        event: React.MouseEvent<HTMLDivElement>,
        objectId: string,
    ) => {
        console.log('hideObject objectId : ', objectId);

        // 1. 대상 오브젝트 처리
        // const btnObj = event.currentTarget;
        const bHide = !objects.isHide(objectId);
        objects.hideObject(objectId, bHide);

        // 2. 전체처리 : 전체가 잠기면 잠금, 하나라도 풀리면 풀림으로 세팅
        const currObjectList = workInfo.getObjectList();
        const allHide =
            currObjectList.filter(obj => !objects.isHide(obj.id)).length > 0
                ? false
                : true;

        CommonEvent.unselectObjects();
        setAllHide(allHide);
        cancelBubble(event);
    };
    const hideAllObject = (event: React.MouseEvent<HTMLButtonElement>) => {
        const hide = !$(event.currentTarget).hasClass('active');
        const currObjectList = workInfo.getObjectList();
        currObjectList.forEach(obj => {
            objects.hideObject(obj.id, hide);
        });
        CommonEvent.unselectObjects();
        setAllHide(hide);
        cancelBubble(event);
    };

    const addNewFolder = () => {
        const newFolderItem = objects.createNewObject(EobjectType.folder);

        // 선택된 오브젝트(첫번째)의 바로 앞에 위치
        const currObjectGroup = workInfo.getObjectGroup();
        const currObjectGroupSort = currObjectGroup.sort(
            (a, b) => a.orderNo - b.orderNo,
        );
        if (currObjectGroupSort.length > 0) {
            const firstObject = currObjectGroupSort[0];
            const firstObjectOrderNo = firstObject.orderNo;
            const firstObjectFolderInfo = firstObject.folderInfo;
            const newObjectOrderNo = firstObjectOrderNo - 0.1;

            // 선택된 첫번째 오브젝트가 폴더면 바로 다음에, 아니면 바로 이전에 위치
            // const newOrderNo = firstObject.type === EobjectType.folder ? firstObjectOrderNo+0.01 : firstObjectOrderNo-0.01;
            // const newOrderNo = firstObjectOrderNo-0.01;
            objects.setObjectOrderNo(newFolderItem, newObjectOrderNo);

            // -- 새로생성한 폴더의 폴더정보 생성 (선택된 첫번째 오브젝트의 같은 폴더에 위치)
            const newFolderInfo = firstObjectFolderInfo;
            if (firstObject.type === EobjectType.folder) {
                // newFolderInfo += '/' + firstObject.id;
            }
            if (newFolderInfo) {
                objects.setObjectFolderInfo(newFolderItem, newFolderInfo);
            }

            // 선택된 모든 오브젝트를 새로 생성한 폴더 아래로 이동
            let currNewObjectOrderNo = newObjectOrderNo;
            currObjectGroupSort.forEach(obj => {
                currNewObjectOrderNo += 0.01;

                // 선택된 오브젝트의 폴더정보 생성
                const currObjectType = obj.type;
                const currFolderInfo = objects.getObjectFolderInfo(obj);
                const currGroupChildObjectList = objects.getObjectSubList(obj);

                const currGroupFolderInfo =
                    newFolderInfo + '/' + newFolderItem.id + currFolderInfo;
                const currGroupFolderInfoArray = currGroupFolderInfo.split('/');
                const currGroupFolderInfoUniq = [
                    ...new Set(currGroupFolderInfoArray),
                ];
                const currGroupFolderInfoString =
                    currGroupFolderInfoUniq.join('/');

                objects.setObjectFolderInfo(obj, currGroupFolderInfoString);
                objects.setObjectOrderNo(obj, currNewObjectOrderNo);

                // 새폴더 아래로 이동한 오브젝트가 폴더인경우 자식도 연쇄 이동
                if (currObjectType === EobjectType.folder) {
                    currGroupChildObjectList.forEach(childObj => {
                        currNewObjectOrderNo += 0.001;

                        const childFolderInfo =
                            objects.getObjectFolderInfo(childObj);
                        const newChildFolderInfo =
                            newFolderInfo +
                            '/' +
                            newFolderItem.id +
                            childFolderInfo;
                        const newChildFolderInfoArray =
                            newChildFolderInfo.split('/');
                        const newChildFolderInfoUniq = [
                            ...new Set(newChildFolderInfoArray),
                        ];
                        const newChildFolderInfoString =
                            newChildFolderInfoUniq.join('/');
                        objects.setObjectFolderInfo(
                            childObj,
                            newChildFolderInfoString,
                        );
                        objects.setObjectOrderNo(
                            childObj,
                            currNewObjectOrderNo,
                        );
                    });
                }
            });
        }

        workInfo.addObjectList(newFolderItem);
        objects.updateObjectOrder();
        workInfo.setUpdateKey();
        dostack.addUndoStack('', EundoStackAddType.all);
    };

    const expandFolder = (
        currObject: any,
        currStatus: EObjectFolderStatus,
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        console.log('expandFolder currObject : ', currObject);

        const newStatus =
            currStatus === EObjectFolderStatus.expand
                ? EObjectFolderStatus.fold
                : EObjectFolderStatus.expand;
        objects.setObjectFolderStatus(currObject, newStatus);

        const subFolderInfo = currObject.folderInfo + '/' + currObject.id;

        const newFolderView =
            newStatus === EObjectFolderStatus.expand
                ? EObjectFolderView.show
                : EObjectFolderView.hide;
        // const newFolderViewDepth = newFolderView.split('/').length - 1;

        // 하위 오브젝트에 모두 적용
        const currObjectList = workInfo.getObjectList();
        // let prevObj: any = null;
        // let prevFolderStatus = EObjectFolderStatus.expand;
        currObjectList.forEach(obj => {
            // 하위 전체
            if (obj.folderInfo && obj.folderInfo.indexOf(subFolderInfo) === 0) {
                // 1. 최상위 닫으면 하위 모두 닫힘, 펼치면 하위 이하 단계 모두 펼쳐짐
                // objects.setObjectFolderStatus(obj, newStatus);
                // objects.setObjectFolderView(obj, newFolderView);
                // objects.setObjectFolderView2(obj, newFolderView);
                // objects.setObjectFolderView3(obj, newFolderView);

                // 2. 최상위 닫으면 하위 모두 닫힘, 펼치면 바로 하위만 펼쳐지고, 그 이하는 닫혀있음
                if (newFolderView === EObjectFolderView.hide) {
                    objects.setObjectFolderStatus(obj, newStatus);
                    objects.setObjectFolderView(obj, newFolderView);
                    // objects.setObjectFolderView2(obj, newFolderView);
                    // objects.setObjectFolderView3(obj, newFolderView);
                } else {
                    if (obj.folderInfo && obj.folderInfo === subFolderInfo) {
                        objects.setObjectFolderStatus(
                            obj,
                            EObjectFolderStatus.fold,
                        );
                        objects.setObjectFolderView(obj, newFolderView);
                        // objects.setObjectFolderView2(obj, newFolderView);
                        // objects.setObjectFolderView3(obj, newFolderView);
                    }
                }
            }

            // prevObj = obj;
            // prevFolderStatus = obj.folderStatus;
        });
        // 타임라인에 바로 적용 되도록 하기 위해 추가
        workInfo.setModifiedOrderNo();

        // workInfo.setUpdateKey();
        //        dostack.addUndoStack('', EundoStackAddType.all);
        cancelBubble(event);
    };

    const setResourceFilterList = (filterList: EResouce_Filter_List_Type[]) => {
        console.log('setResourceFilterList filterList : ', filterList);

        const newFilterList = [...filterList];

        // 폴더 타입은 항상 출력되도록 항목 추가
        newFilterList.push(EResouce_Filter_List_Type.folder);

        // shape 타입이 있으면 square 타입 추가
        const shapeFilter = newFilterList.find(
            filter => filter === EResouce_Filter_List_Type.shape,
        );
        if (shapeFilter) {
            newFilterList.push(EResouce_Filter_List_Type.square);
        } else {
            const squareFilter = newFilterList.find(
                filter => filter === EResouce_Filter_List_Type.square,
            );
            if (squareFilter) {
                newFilterList.splice(newFilterList.indexOf(squareFilter), 1);
            }
        }

        // setCurrFilterList(filterList);

        setElementList(currElementList => {
            const newElementList = [...currElementList];
            currElementList.map(element => {
                const currFilter = newFilterList.find(
                    filter => String(filter) === String(element.type),
                    // filter =>
                    //     String(filter) === String(element.type) ||
                    //     (filter === EResouce_Filter_List_Type.interacted &&
                    //         element.classList.contain('interactions')),
                );
                if (currFilter) {
                    element.filterView = 'filter-on';
                } else {
                    element.filterView = 'filter-off';
                }
            });
            return newElementList;
        });
    };

    return (
        <div className={`timeline ${logicMode === true ? 'hide' : ''}`}>
            <div
                className="timeline-resize-handle"
                onMouseDown={TimeLineEvent.addResizeEvent}
            ></div>
            <div className="body-middle-timeline">
                <div className="timeline-head">
                    <div className="timeline-head-layerbtns">
                        {/* 클릭시 .ui_layer_menu에  on 클래스추가 */}
                        <div className="ui_layer_menu">
                            <div className="label">
                                <span>timeline</span>
                            </div>
                            <ul>
                                <li className="active">timeline1</li>
                                <li>timeline2</li>
                                <li>timeline3</li>
                            </ul>
                        </div>
                        <button
                            type="button"
                            className="btn-layer-add"
                            title="add"
                        ></button>
                        <button
                            type="button"
                            className="btn-layer-del"
                            title="del"
                        ></button>
                        {/* <button type="button" className='btn-layer-edit' title='edit'></button> */}
                    </div>

                    <TimeLineHeadButton />
                </div>
                <div className="timeline-body">
                    <div className="timeline-layer-btns-top">
                        <div>
                            <button
                                type="button"
                                className="btn-layer-folder"
                                title="group"
                                onClick={addNewFolder}
                            ></button>
                            <button
                                type="button"
                                className="btn-layer-del"
                                title="del"
                                onClick={TimeLineEvent.checkAndDeleteObjects}
                            ></button>
                        </div>
                        <div>
                            <button
                                className="btn-filter"
                                onClick={e =>
                                    toggleShowResourcesFilter(e.currentTarget)
                                }
                                onMouseDown={cancelBubble}
                                title="리소스 타입으로 분류하기"
                            >
                                <ObjectFilterList
                                    filterInfo={{
                                        filterType: 'timeline',
                                        setResourceFilterListCB:
                                            setResourceFilterList,
                                    }}
                                />
                            </button>
                            <button
                                type="button"
                                className={
                                    'btn-layer-lock' +
                                    (allLock ? ' active' : '')
                                }
                                title="lock"
                                onClick={e => lockAllObject(e)}
                            ></button>
                            <button
                                type="button"
                                className={
                                    'btn-layer-see' + (allHide ? ' active' : '')
                                }
                                title="see"
                                onClick={e => hideAllObject(e)}
                            ></button>
                        </div>
                    </div>

                    <div className="timeline-body-elements">
                        <div className="timeline-body-elements-titles">
                            <div className="timeline-layer-btns">
                                {/* <div>
                                    <button
                                        type="button"
                                        className="btn-layer-folder"
                                        title="group"
                                        onClick={addNewFolder}
                                    ></button>
                                    <button
                                        type="button"
                                        className="btn-layer-del"
                                        title="del"
                                        onClick={
                                            TimeLineEvent.checkAndDeleteObjects
                                        }
                                    ></button>
                                </div>
                                <div>
                                    <button
                                        className="btn-filter"
                                        onClick={toggleShowResourcesFilter}
                                        onMouseDown={cancelBubble}
                                        title="리소스 타입으로 분류하기"
                                    >
                                        <ObjectFilterList
                                            filterInfo={{
                                                filterType: 'timeline',
                                                setResourceFilterListCB:
                                                    setResourceFilterList,
                                            }}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            'btn-layer-lock' +
                                            (allLock ? ' active' : '')
                                        }
                                        title="lock"
                                        onClick={e => lockAllObject(e)}
                                    ></button>
                                    <button
                                        type="button"
                                        className={
                                            'btn-layer-see' +
                                            (allHide ? ' active' : '')
                                        }
                                        title="see"
                                        onClick={e => hideAllObject(e)}
                                    ></button>
                                </div> */}
                            </div>
                            {/* <div className='timeline-body-elements-transition' style={{ display: 'none'}}>
                                    <span>transition</span>
                                </div>
                                <div className='timeline-body-elements-transition' style={{ display: 'none'}}>
                                    <span>transition</span>
                                </div> */}
                            {elementList.map((item: any) => (
                                <div
                                    key={'element_' + item.id}
                                    className={
                                        'timeline-body-elements-container' +
                                        ' ' +
                                        item.type +
                                        ' ' +
                                        item.folderView +
                                        ' ' +
                                        (item.filterView || 'filter-on')
                                    }
                                    onClick={e => {
                                        TimeLineEvent.selectCurrObject(
                                            item.id,
                                            e,
                                        );
                                    }}
                                    draggable={true}
                                    onDragStart={e =>
                                        TimeLineEvent.dragStartEvent(e, item.id)
                                    }
                                    onDragEnd={TimeLineEvent.dragEndEvent}
                                    onDrop={TimeLineEvent.dropEvent}
                                >
                                    <div
                                        className={'unit ' + item.type}
                                        {...{
                                            name: item.name,
                                            type: item.type,
                                        }}
                                        onDrop={TimeLineEvent.dropEvent}
                                    >
                                        <div
                                            className={
                                                'contents' +
                                                // currObject &&
                                                // currObject.id === item.id
                                                // ? ' current'
                                                // : ''
                                                (objectGroup.filter(
                                                    (obj: any) =>
                                                        obj.id === item.id,
                                                ).length > 0
                                                    ? ' current'
                                                    : '')
                                            }
                                            onDragEnd={
                                                TimeLineEvent.dragEndEvent
                                            }
                                            onDragEnter={e =>
                                                TimeLineEvent.dragEnterEvent(
                                                    e,
                                                    item.id,
                                                    'rear',
                                                )
                                            }
                                            // onDragLeave={(e)=>dragLeaveEvent(e)}
                                            onDrop={TimeLineEvent.dropEvent}
                                            // onDragOver={(e)=>dragOverEvent(e)}
                                        >
                                            <div
                                                className={'title'}
                                                onDragEnter={e =>
                                                    TimeLineEvent.dragEnterEvent(
                                                        e,
                                                        item.id,
                                                        'front',
                                                    )
                                                }
                                                onDrop={TimeLineEvent.dropEvent}
                                            >
                                                <div
                                                    className="title-text"
                                                    style={{
                                                        marginLeft:
                                                            item.folderDepth
                                                                ? item.folderDepth *
                                                                      timelineObjectGroupDepthIndent +
                                                                  'px'
                                                                : '',
                                                    }}
                                                    onDragEnter={e =>
                                                        TimeLineEvent.dragEnterEvent(
                                                            e,
                                                            item.id,
                                                            'inner',
                                                        )
                                                    }
                                                    onDrop={
                                                        TimeLineEvent.dropEvent
                                                    }
                                                >
                                                    {item.type ===
                                                        EobjectType.folder && (
                                                        <button
                                                            type="button"
                                                            onClick={e =>
                                                                expandFolder(
                                                                    item,
                                                                    item.folderStatus,
                                                                    e,
                                                                )
                                                            }
                                                        >
                                                            {item.folderStatus ===
                                                            EObjectFolderStatus.expand ? (
                                                                <span className="arrow on"></span>
                                                            ) : (
                                                                <span className="arrow"></span>
                                                            )}
                                                        </button>
                                                    )}
                                                    {item.name}
                                                    {/* - {item.orderNo} */}
                                                </div>
                                            </div>
                                            <div className="control-container">
                                                {item.type !==
                                                    EobjectType.folder && (
                                                    <div
                                                        title="interactions"
                                                        className={
                                                            'btn interaction' +
                                                            ($(item).hasClass(
                                                                'interactions',
                                                            )
                                                                ? ' active'
                                                                : '')
                                                        }
                                                    ></div>
                                                )}
                                                <div
                                                    title="lock"
                                                    className={
                                                        'btn lock' +
                                                        ($(item).hasClass(
                                                            'lock',
                                                        )
                                                            ? ' active'
                                                            : '')
                                                    }
                                                    onClick={e =>
                                                        lockObject(e, item.id)
                                                    }
                                                ></div>
                                                <div
                                                    title="hide"
                                                    className={
                                                        'btn hide' +
                                                        ($(item).hasClass(
                                                            'hide',
                                                        )
                                                            ? ' active'
                                                            : '')
                                                    }
                                                    onClick={e =>
                                                        hideObject(e, item.id)
                                                    }
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {Array.isArray(item.transitionInfo) &&
                                        item.transitionInfo.length > 0 && (
                                            // <div
                                            //     className={
                                            //         "transition-title" + (
                                            //             // currObject &&
                                            //             // currObject.id === item.id
                                            //             // ? ' current'
                                            //             // : ''
                                            //             objectGroup.filter((obj: any) => obj.id === item.id).length > 0 ? ' current' : ''
                                            //         )
                                            //     }
                                            //     key={'unit_transition_' + item.id}
                                            // >
                                            //     <div className="contents">
                                            //         Transition
                                            //     </div>
                                            // </div>
                                            <div
                                                key={
                                                    'unit_transition_' + item.id
                                                }
                                                className="timeline-body-elements-transition"
                                            >
                                                <span>transition</span>
                                            </div>
                                        )}

                                    {/* {Array.isArray(item.interactionsInfo) &&
                                            item.interactionsInfo.length > 0 && (
                                                <div
                                                    className={
                                                        "interactions-title" + (
                                                            // currObject &&
                                                            // currObject.id === item.id
                                                            // ? ' current'
                                                            // : ''
                                                            objectGroup.filter((obj: any) => obj.id === item.id).length > 0 ? ' current' : ''
                                                        )
                                                    }
                                                    key={'unit_interactions_' + item.id}
                                                >
                                                    <div className="contents">
                                                        Interactions
                                                    </div>
                                                </div>
                                            )
                                        } */}
                                </div>
                            ))}
                        </div>
                        <div className="timeline-body-tracks zoom">
                            <TimeLineRuler />

                            {/* <div className='timeline-body-tracks-transition'  style={{ display: 'none'}}>
                                    <div className='timeline-transition-box' style={{ left: '50px', width: '30px'}}>
                                        <div className='name-transition'>
                                            <span>appear</span>
                                        </div>
                                        <div className='dropdown-transitions'>
                                            <ul>
                                                <li className='active'>appear</li>
                                                <li>appear</li>
                                                <li>appear</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='timeline-transition-box' style={{ left: '200px', width: '100px'}}>
                                        <div className='name-transition'>
                                            <span>disappear</span>
                                        </div>
                                        <div className='dropdown-transitions'>
                                            <ul>
                                                <li className='active'>disappear</li>
                                                <li>disappeardisa</li>
                                                <li>disappear</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='timeline-transition-box' style={{ left: '350px', width: '250px'}}>
                                        <div className='name-transition'>
                                            <span>disappear</span>
                                        </div>
                                        <div className='dropdown-transitions'>
                                            <ul>
                                                <li className='active'>disappear</li>
                                                <li>disappeardisa</li>
                                                <li>disappear</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div> */}

                            {/* 선택될떄 active 추가 */}
                            {/* <div className='timeline-body-tracks-transition active' style={{display: ''}}>
                                    <div className='timeline-transition-box' style={{ left: '10px', width: '50px'}}>
                                        <div className='name-transition'>
                                            <span>appear</span>
                                        </div>
                                        <div className='dropdown-transitions'>
                                            <ul>
                                                <li className='active'>appear</li>
                                                <li>appear</li>
                                                <li>appear</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='timeline-transition-box' style={{ left: '150px', width: '100px'}}>
                                        <div className='name-transition'>
                                            <span>disappear</span>
                                        </div>
                                        <div className='dropdown-transitions'>
                                            <ul>
                                                <li className='active'>disappeardisappear</li>
                                                <li>disappear</li>
                                                <li>disappear</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div> */}

                            {elementList.map((item: any) => (
                                <div
                                    key={'tracks_' + item.id}
                                    className={
                                        'timeline-body-tracks-container ' +
                                        item.type +
                                        ' ' +
                                        item.folderView +
                                        ' ' +
                                        item.filterView
                                    }
                                    onClick={e => {
                                        TimeLineEvent.selectCurrObject(
                                            item.id,
                                            e,
                                        );
                                    }}
                                    onMouseDown={allEventCancel}
                                >
                                    <div
                                        key={'track_kframe_main_' + item.id}
                                        className={
                                            'unit kframe' +
                                            // currObject &&
                                            // currObject.id === item.id
                                            // ? ' current'
                                            // : ''
                                            (objectGroup.filter(
                                                (obj: any) =>
                                                    obj.id === item.id,
                                            ).length > 0
                                                ? ' current'
                                                : '')
                                        }
                                        {...{
                                            lineid: item.id,
                                        }}
                                    >
                                        {item.keyframeInfoData &&
                                            item.keyframeInfoData.map(
                                                (data: any, index2: number) => (
                                                    <div
                                                        key={
                                                            'track_kframe_' +
                                                            item.id +
                                                            '_' +
                                                            index2
                                                        }
                                                        className={
                                                            'frameline' +
                                                            // currObject && currObject.id === item.id && currKeyframeStep === index2 ? ' current' : ''
                                                            (objectGroup.filter(
                                                                (obj: any) =>
                                                                    obj.id ===
                                                                    item.id,
                                                            ).length > 0 &&
                                                            currKeyframeStep ===
                                                                index2
                                                                ? ' current'
                                                                : '')
                                                        }
                                                        style={{
                                                            left:
                                                                data
                                                                    .timeLeft[0] *
                                                                timelineZoom,
                                                            width:
                                                                data
                                                                    .timeLeft[1] *
                                                                    timelineZoom -
                                                                data
                                                                    .timeLeft[0] *
                                                                    timelineZoom,
                                                        }}
                                                        onMouseDown={e =>
                                                            TimeLineEvent.selectKeyframeStep(
                                                                item.id,
                                                                index2,
                                                                data
                                                                    .timeLeft[1],
                                                                e,
                                                            )
                                                        }
                                                        onContextMenu={e =>
                                                            TimeLineEvent.showFrameStepContext(
                                                                item.id,
                                                                index2,
                                                                data
                                                                    .timeLeft[1],
                                                                e,
                                                            )
                                                        }
                                                        onClick={e =>
                                                            allEventCancel(e)
                                                        }

                                                        // onMouseDown={e =>
                                                        //     allEventCancel(
                                                        //         e,
                                                        //     )
                                                        // }
                                                        // onMouseDown={e =>
                                                        //     addMouseDownEvent_KeyFrameStep_Move(
                                                        //         item.id,
                                                        //         index2,
                                                        //         e,
                                                        //     )
                                                        // }
                                                    >
                                                        {currObject &&
                                                            currObject.id ===
                                                                item.id &&
                                                            currKeyframeStep ===
                                                                index2 && (
                                                                <div className="active"></div>
                                                            )}
                                                        {data.easing !==
                                                            'linear' && (
                                                            <span className="easing-view">
                                                                {data.easing}
                                                            </span>
                                                        )}
                                                    </div>
                                                ),
                                            )}

                                        {item.keyframeInfo &&
                                            item.keyframeInfo.map(
                                                (
                                                    frame: any,
                                                    index2: number,
                                                ) => (
                                                    <div
                                                        key={
                                                            'sep_keyframe_' +
                                                            item.id +
                                                            '_' +
                                                            index2
                                                        }
                                                        className="separator keyframe"
                                                        onMouseDown={e =>
                                                            TimeLineEvent.addMouseDownEvent_KeyFrameStep_Resize(
                                                                item.id,
                                                                index2,
                                                                e,
                                                            )
                                                        }
                                                        style={{
                                                            left:
                                                                frame.timeLeft *
                                                                timelineZoom,
                                                        }}
                                                        onContextMenu={e =>
                                                            TimeLineEvent.showFrameStepContext(
                                                                item.id,
                                                                index2 - 1,
                                                                frame.timeLeft,
                                                                e,
                                                            )
                                                        }
                                                    ></div>
                                                ),
                                            )}
                                    </div>

                                    {Array.isArray(item.transitionInfo) &&
                                        item.transitionInfo.length > 0 && (
                                            <div
                                                className={
                                                    'timeline-body-tracks-transition' +
                                                    (objectGroup.filter(
                                                        (obj: any) =>
                                                            obj.id === item.id,
                                                    ).length > 0
                                                        ? ' active'
                                                        : '')
                                                }
                                            >
                                                {/* <div className={
                                                    "unit transition" + (
                                                        // currObject && 
                                                        // currObject.id === item.id
                                                        // ? ' current'
                                                        // : ''
                                                        objectGroup.filter((obj: any) => obj.id === item.id).length > 0 ? ' current' : ''
                                                    )
                                                }> */}
                                                {item.transitionInfo.map(
                                                    (
                                                        transition: ItransitionInfo,
                                                        index2: number,
                                                    ) => (
                                                        // <div
                                                        //     title={
                                                        //         transition.action
                                                        //     }
                                                        //     key={
                                                        //         'transitionline_' + item.id + '_' +
                                                        //         index2
                                                        //     }
                                                        //     className={
                                                        //         'transitionline ' +
                                                        //         transition.type +
                                                        //         ' ' +
                                                        //         transition.action
                                                        //     }
                                                        //     style={{
                                                        //         left: transition.start*timelineZoom,
                                                        //         width:
                                                        //             transition.type !==
                                                        //             'appear'
                                                        //                 ? transition.end*timelineZoom -
                                                        //                 transition.start*timelineZoom
                                                        //                 : '',
                                                        //     }}
                                                        //     onClick={e =>
                                                        //         selectTransitionStep(
                                                        //             item.id,
                                                        //             transition,
                                                        //             index2,
                                                        //             e,
                                                        //         )
                                                        //     }
                                                        //     onContextMenu={e =>
                                                        //         showTransitionStepContext(
                                                        //             item.id,
                                                        //             transition,
                                                        //             index2,
                                                        //             e,
                                                        //         )
                                                        //     }
                                                        //     onMouseDown={e =>
                                                        //         addMouseDownEvent_Transition_Move(
                                                        //             item.id,
                                                        //             transition,
                                                        //             index2,
                                                        //             e,
                                                        //         )
                                                        //     }
                                                        // >
                                                        <div
                                                            className="timeline-transition-box"
                                                            title={
                                                                transition.action
                                                            }
                                                            key={
                                                                'transitionline_' +
                                                                item.id +
                                                                '_' +
                                                                index2
                                                            }
                                                            style={{
                                                                left:
                                                                    transition.start *
                                                                    timelineZoom,
                                                                width:
                                                                    transition.type !==
                                                                    'appear'
                                                                        ? transition.end *
                                                                              timelineZoom -
                                                                          transition.start *
                                                                              timelineZoom
                                                                        : 30 *
                                                                          timelineZoom,
                                                            }}
                                                            onClick={e =>
                                                                TimeLineEvent.selectTransitionStep(
                                                                    item.id,
                                                                    transition,
                                                                    index2,
                                                                    e,
                                                                )
                                                            }
                                                            onContextMenu={e =>
                                                                TimeLineEvent.showTransitionStepContext(
                                                                    item.id,
                                                                    transition,
                                                                    index2,
                                                                    e,
                                                                )
                                                            }
                                                            onMouseDown={e =>
                                                                TimeLineEvent.addMouseDownEvent_Transition_Move(
                                                                    item.id,
                                                                    transition,
                                                                    index2,
                                                                    e,
                                                                )
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    'name-transition ' +
                                                                    transition.action
                                                                }
                                                            >
                                                                <span>
                                                                    {transition.type ===
                                                                    'fade'
                                                                        ? transition.type +
                                                                          transition.action
                                                                        : transition.action}
                                                                </span>

                                                                {objectGroup.filter(
                                                                    (
                                                                        obj: any,
                                                                    ) =>
                                                                        obj.id ===
                                                                        item.id,
                                                                ).length > 0 &&
                                                                    currTransitionStep ===
                                                                        index2 && (
                                                                        <div className="active"></div>
                                                                    )}
                                                            </div>
                                                            <div
                                                                className="dropdown-transitions"
                                                                style={{
                                                                    display:
                                                                        'none',
                                                                }}
                                                            >
                                                                <ul>
                                                                    <li className="active">
                                                                        appear
                                                                    </li>
                                                                    <li>
                                                                        appear
                                                                    </li>
                                                                    <li>
                                                                        appear
                                                                    </li>
                                                                </ul>
                                                            </div>

                                                            {transition.type ===
                                                                'fade' && (
                                                                <>
                                                                    <div
                                                                        className="separator start"
                                                                        onMouseDown={e =>
                                                                            TimeLineEvent.addMouseDownEvent_Transition_Resize(
                                                                                item.id,
                                                                                transition,
                                                                                'start',
                                                                                index2,
                                                                                e,
                                                                            )
                                                                        }
                                                                        onClick={e =>
                                                                            allEventCancel(
                                                                                e,
                                                                            )
                                                                        }
                                                                    ></div>
                                                                    <div
                                                                        className="separator end"
                                                                        onMouseDown={e =>
                                                                            TimeLineEvent.addMouseDownEvent_Transition_Resize(
                                                                                item.id,
                                                                                transition,
                                                                                'end',
                                                                                index2,
                                                                                e,
                                                                            )
                                                                        }
                                                                        onClick={e =>
                                                                            allEventCancel(
                                                                                e,
                                                                            )
                                                                        }
                                                                    ></div>
                                                                </>
                                                            )}

                                                            {/* {
                                                                    // currObject && 
                                                                    // currObject.id === item.id &&                                                                
                                                                    // currTransitionStep === index2 &&
                                                                    objectGroup.filter((obj: any) => obj.id === item.id).length > 0 && currTransitionStep === index2 &&
                                                                        <div className="active"></div>
                                                                } */}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {/* {Array.isArray(item.interactionsInfo) &&
                                            item.interactionsInfo.length > 0 && (
                                                <div className={
                                                    "unit interactions" + (
                                                        // currObject &&
                                                        // currObject.id === item.id
                                                        // ? ' current'
                                                        // : ''
                                                        objectGroup.filter((obj: any) => obj.id === item.id).length > 0 ? ' current' : ''                                                        
                                                    )
                                                }>
                                                    {item.interactionsInfo.map(
                                                        (interactions: IinteractionsInfo, index2: number) => (
                                                            <div className='view'>
                                                                <div className={'separator ' + interactions.trigger} title={interactions.trigger}></div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )} */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TimeSpace;

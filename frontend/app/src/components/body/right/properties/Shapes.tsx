import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import { cancelBubble } from '../../../../util/common';
// import { addKeyFrame } from '../../../../util/keyframe';
import * as objects from '../../../../util/objects';
import {
    EundoStackAddType,
    IshapeInfo,
    IpageSizeInfo,
    EobjectType,
    IPage_Dimension_Info,
} from '../../../../const/types';
import NumberForm from '../../../../util/NumberForm';
import * as basicData from '../../../../const/basicData';
import * as dostack from '../../../../util/dostack';
import * as keyframe from '../../../../util/keyframe';
import * as pages from '../../../../util/pages';
// import { addComma } from '../../../../util/common';

let gTargetObject: any = null;
let addUndoStackTimer: any = null;
const Shapes = observer(() => {
    const { userInfo, workInfo } = store;
    const [objectType, setObjectType] = useState<EobjectType>(EobjectType.none);
    const currObject: any = workInfo.getObject();
    const objectGroup = workInfo.getObjectGroup();
    const updateKey: number = workInfo.getUpdateKey();
    const whRatio: boolean = workInfo.getWhRatio();
    const folderSelected: boolean = workInfo.getFolderSelected();
    const LANGSET = userInfo.getLangSet();
    const [pageDimenstionInfo, setPageDimenstionInfo] =
        useState<IPage_Dimension_Info>(basicData.pageDimensionList[0]);

    useEffect(() => {
        console.log('pageDimenstionInfo: ', pageDimenstionInfo);
    }, [pageDimenstionInfo]);

    useEffect(() => {
        console.log('Shapes useEffect');

        gTargetObject = currObject;

        // const objType = ($(currObject).attr('object-type') ||
        //     '') as EobjectType;
        // setObjectType(objType);

        let sizeInfo: IshapeInfo = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
        };
        let pageSizeInfo: IpageSizeInfo = {
            width: basicData.defaultPageSizeInfo.width,
            height: basicData.defaultPageSizeInfo.height,
        };
        if (currObject !== null) {
            sizeInfo = objects.getObjectShapeInfo(gTargetObject);
            // console.log('sizeInfo: ', sizeInfo);
            // $('.content-shapes input',).each((index, item) => {
            //     $(item).removeAttr("disabled");
            // });
            updateObjectSizeForm(currObject, sizeInfo);
        } else {
            // $('.content-shapes input',).each((index, item) => {
            //     $(item).attr("disabled", 'disabled');
            // });
            pageSizeInfo = pages.getPageSize();
            updatePageSizeForm(pageSizeInfo);
        }
        // setObjectSize(sizeInfo);
    }, [currObject, updateKey]);

    useEffect(() => {
        for (const obj of objectGroup) {
            const type = objects.getObjectType(obj);
            setObjectType(type);
            if (type === EobjectType.audio) {
                break;
            }
        }
    }, [objectGroup]);

    const changeObjectSize = (elem: HTMLInputElement) => {
        if (gTargetObject === null) return;

        const objectGroup = workInfo.getObjectGroup();
        objectGroup.forEach((obj: any) => {
            // const targetObjSelector = document.getElementById(
            //     'SEL_' + obj.id,
            // );
            const targetObjSelector = objects.getObjectSelector(obj);
            if (targetObjSelector === null) return;

            const formObj = elem;
            const objVal = Number($(formObj).val());
            const ratioFlag = $('.btn-ratio').hasClass('active');
            const orgWidth = $(obj).width() || 0;
            const orgHeight = $(obj).height() || 0;
            const WHRatio = orgWidth && orgHeight ? orgHeight / orgWidth : 1;

            if (formObj.id === 'object_x') {
                obj.style.left = objVal + 'px';
                targetObjSelector.style.left = objVal + 'px';
            }
            if (formObj.id === 'object_y') {
                obj.style.top = objVal + 'px';
                targetObjSelector.style.top = objVal + 'px';
            }
            if (formObj.id === 'object_w') {
                obj.style.width = objVal + 'px';
                targetObjSelector.style.width = objVal + 'px';
                if (ratioFlag) {
                    // const newHeight =
                    //     objVal > orgWidth
                    //         ? Math.ceil(objVal * WHRatio)
                    //         : Math.floor(objVal * WHRatio);
                    const newHeight = Math.round(objVal * WHRatio * 100) / 100;
                    obj.style.height = newHeight + 'px';
                    targetObjSelector.style.height = newHeight + 'px';
                    $('#object_h').val(newHeight);
                }
            }
            if (formObj.id === 'object_h') {
                obj.style.height = objVal + 'px';
                targetObjSelector.style.height = objVal + 'px';
                if (ratioFlag) {
                    // const newWidth =
                    //     objVal > orgHeight
                    //         ? Math.ceil(objVal / WHRatio)
                    //         : Math.floor(objVal / WHRatio);
                    const newWidth = Math.round((objVal / WHRatio) * 100) / 100;
                    obj.style.width = newWidth + 'px';
                    targetObjSelector.style.width = newWidth + 'px';
                    $('#object_w').val(newWidth);
                }
            }
            if (formObj.id === 'object_r' || formObj.id === 'object_s') {
                const rotateVal = Number($('#object_r').val());
                const scaleVal = Number(
                    Number($('#object_s').val()) / 100,
                ).toFixed(2);
                $(obj).css({
                    transform:
                        'rotate(' + rotateVal + 'deg) scale(' + scaleVal + ')',
                });
                $(targetObjSelector).css({
                    transform:
                        'rotate(' + rotateVal + 'deg) scale(' + scaleVal + ')',
                });
            }
        });

        // undo stack 기록 타이머 (addUndoStackTimerDelay 시간 내에 다시 요청시에는 기록하지 않는다.)
        if (addUndoStackTimer) {
            clearTimeout(addUndoStackTimer);
            addUndoStackTimer = null;
        }
        const objectId = gTargetObject ? gTargetObject.id : '';
        addUndoStackTimer = setTimeout(
            id => {
                addUndoStackTimer = null;
                console.log('addUndoStackTimer objectId : ', id);
                if (id) {
                    // dostack.addUndoStack(id, EundoStackAddType.style);

                    // autoKeyframe 적용
                    const autoKeyframeStatus = workInfo.getAutoKeyframeStatus();
                    if (autoKeyframeStatus) {
                        keyframe.addKeyFrame();
                        // dostack.addUndoStack(id, EundoStackAddType.keyframe);
                    }
                    dostack.addUndoStack('', EundoStackAddType.all);
                }
            },
            basicData.addUndoStackTimerDelay * 1000,
            objectId,
        );
    };

    // const changeObjectScale = (elem: HTMLInputElement) => {
    //     console.log('changeObjectScale: ', $(elem).val());
    // };

    const updateObjectSizeForm = (targetObject: any, sizeInfo: IshapeInfo) => {
        console.log('updateObjectSizeForm sizeInfo: ', sizeInfo);

        $('#object_x').val(sizeInfo.left || 0);
        $('#object_y').val(sizeInfo.top || 0);
        $('#object_w').val(sizeInfo.width || 0);
        $('#object_h').val(sizeInfo.height || 0);
        $('#object_r').val(sizeInfo.rotate || 0);
        $('#object_s').val(((sizeInfo.scale || 0) * 100).toFixed(0));

        // -- sprite 적용된 객체는 사이즈 조절 불가 처리
        if ($(targetObject).hasClass('sprite')) {
            $('#object_w').addClass('disabled');
            $('#object_w').attr('disabled', 'true');
            $('#object_h').addClass('disabled');
            $('#object_h').attr('disabled', 'true');
        } else {
            $('#object_w').removeClass('disabled');
            $('#object_w').removeAttr('disabled');
            $('#object_h').removeClass('disabled');
            $('#object_h').removeAttr('disabled');
        }
    };

    // const downKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     cancelBubble(e);
    // };

    // <button className="btn-ratio"><span onClick={setShapeRatio}>Ratio</span></button>
    const setShapeRatio = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('setShapeRatio');

        const btnRatio = event.currentTarget;
        if (btnRatio) {
            if (btnRatio.classList.contains('active')) {
                workInfo.setWhRatio(false);
            } else {
                workInfo.setWhRatio(true);
            }
        }
    };

    const updatePageSizeForm = (sizeInfo: IpageSizeInfo) => {
        $('#page_w').val(sizeInfo.width);
        $('#page_h').val(sizeInfo.height);
        updatePageDimensionForm(sizeInfo);
    };
    const updatePageDimensionForm = (sizeInfo: IpageSizeInfo) => {
        const matchDimensionInfo = basicData.pageDimensionList.find(
            item =>
                (item.width === sizeInfo.width &&
                    item.height === sizeInfo.height) ||
                (item.height === sizeInfo.width &&
                    item.width === sizeInfo.height),
        );
        if (matchDimensionInfo) {
            setPageDimenstionInfo({
                name: matchDimensionInfo.name,
                width: sizeInfo.width,
                height: sizeInfo.height,
            });
        } else {
            setPageDimenstionInfo({
                name: 'Custom',
                width: sizeInfo.width,
                height: sizeInfo.height,
            });
        }
    };

    const changePageSize = () => {
        //        const formObj = elem;
        //        const objVal = Number($(elem).val());

        const widthVal = Number($('#page_w').val());
        const heightVal = Number($('#page_h').val());

        if (widthVal && heightVal) {
            pages.setPageSize({
                width: widthVal,
                height: heightVal,
            });
        }
        updatePageDimensionForm({
            width: widthVal,
            height: heightVal,
        });
    };

    const changePageDimension = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const selectVal = event.currentTarget.value;
        // setPageDimenstionInfo] =
        const selectInfo = basicData.pageDimensionList.find(
            item => item.name === selectVal,
        );
        if (selectInfo) {
            // 기존 사이즈 측정하여 세로/가로 방향에 맞게 변경
            const widthVal = Number($('#page_w').val());
            const heightVal = Number($('#page_h').val());
            const orgRotateMode =
                widthVal > heightVal ? 'landscape' : 'portrait';
            const newRotateMode =
                selectInfo.width > selectInfo.height ? 'landscape' : 'portrait';

            const modWidthVal =
                orgRotateMode === newRotateMode
                    ? selectInfo.width
                    : selectInfo.height;
            const modHeightVal =
                orgRotateMode === newRotateMode
                    ? selectInfo.height
                    : selectInfo.width;

            pages.setPageSize({
                width: modWidthVal,
                height: modHeightVal,
            });
            updatePageSizeForm({
                width: modWidthVal,
                height: modHeightVal,
            });
        }
    };

    const rotatePage = () => {
        const widthVal = Number($('#page_w').val());
        const heightVal = Number($('#page_h').val());
        pages.setPageSize({
            width: heightVal,
            height: widthVal,
        });
        updatePageSizeForm({
            width: heightVal,
            height: widthVal,
        });
    };

    if (folderSelected) {
        return <></>;
    }

    return (
        <article className="box-list">
            <div className="list-title">{LANGSET.PROPERTY.TRANSFORM}</div>
            <div className="list-content">
                {currObject === null ? (
                    <div className="content-shapes">
                        <div className="box-left">
                            <div>
                                <label htmlFor="page_w">w</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: '페이지 너비',
                                        id: 'page_w',
                                        type: 'number',
                                        unit: '',
                                        min: 0,
                                        max: 10000,
                                        default:
                                            basicData.defaultPageSizeInfo.width,
                                        changeEvt: changePageSize,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="box-left">
                            <div>
                                <label htmlFor="page_h">h</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: '페이지 높이',
                                        id: 'page_h',
                                        type: 'number',
                                        unit: '',
                                        min: 0,
                                        max: 10000,
                                        default:
                                            basicData.defaultPageSizeInfo
                                                .height,
                                        changeEvt: changePageSize,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="box-right-add">
                            <div>
                                <select
                                    className="page-dimension"
                                    value={pageDimenstionInfo.name}
                                    title={pageDimenstionInfo.name}
                                    onChange={changePageDimension}
                                >
                                    {basicData.pageDimensionList.map(
                                        (item, index) => {
                                            return (
                                                <option
                                                    key={index}
                                                    value={item.name}
                                                    disabled={
                                                        item.width === 0 &&
                                                        item.height === 0
                                                            ? true
                                                            : false
                                                    }
                                                >
                                                    {item.name}
                                                </option>
                                            );
                                        },
                                    )}
                                </select>
                            </div>
                            <div
                                className={`device-rotate ${
                                    pageDimenstionInfo.width <
                                    pageDimenstionInfo.height
                                        ? 'portrait'
                                        : ''
                                }`}
                                onClick={rotatePage}
                                title="Rotate Page"
                            ></div>
                        </div>
                    </div>
                ) : (
                    <div className="content-shapes">
                        <div className="box-left">
                            <div>
                                <label htmlFor="object_x">x</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: 'X 좌표',
                                        id: 'object_x',
                                        type: 'number',
                                        unit: '',
                                        min: -10000,
                                        max: 10000,
                                        default: 0,
                                        changeEvt: changeObjectSize,
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="object_y">y</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: 'Y 좌표',
                                        id: 'object_y',
                                        type: 'number',
                                        unit: '',
                                        min: -10000,
                                        max: 10000,
                                        default: 0,
                                        changeEvt: changeObjectSize,
                                    }}
                                />
                            </div>
                        </div>

                        <div
                            className="box-center"
                            style={{
                                display:
                                    objectType === EobjectType.audio
                                        ? 'none'
                                        : '',
                            }}
                        >
                            <button
                                className={`btn-ratio${
                                    whRatio === true ? ' active' : ''
                                }`}
                                onClick={setShapeRatio}
                            >
                                <span>Ratio</span>
                            </button>
                            <div>
                                <label htmlFor="object_w">w</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: '너비',
                                        id: 'object_w',
                                        type: 'number',
                                        unit: '',
                                        min: 0,
                                        max: 10000,
                                        default: 0,
                                        changeEvt: changeObjectSize,
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="object_h">h</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: '높이',
                                        id: 'object_h',
                                        type: 'number',
                                        unit: '',
                                        min: 0,
                                        max: 10000,
                                        default: 0,
                                        changeEvt: changeObjectSize,
                                    }}
                                />
                            </div>
                        </div>

                        <div
                            className="box-right"
                            style={{
                                display:
                                    objectType === EobjectType.audio
                                        ? 'none'
                                        : '',
                            }}
                        >
                            <div>
                                <label htmlFor="object_r">r</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: '회전',
                                        id: 'object_r',
                                        type: 'number',
                                        unit: '°',
                                        min: -360,
                                        max: 360,
                                        default: 0,
                                        changeEvt: changeObjectSize,
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="object_s">s</label>{' '}
                                <NumberForm
                                    inputInfo={{
                                        title: '스케일',
                                        id: 'object_s',
                                        type: 'number',
                                        unit: '%',
                                        min: 10,
                                        max: 1000,
                                        default: 100,
                                        changeEvt: changeObjectSize,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
});

export default Shapes;

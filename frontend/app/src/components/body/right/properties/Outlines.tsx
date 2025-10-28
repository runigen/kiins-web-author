import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import * as dialog from '../../../../util/dialog';
import * as objects from '../../../../util/objects';
import * as common from '../../../../util/common';
import NumberForm from '../../../../util/NumberForm';
import ColorPicker from '../../../../util/ColorPicker';
import * as basicData from '../../../../const/basicData';
import {
    EundoStackAddType,
    IborderStyleInfo,
    EobjectType,
} from '../../../../const/types';
import * as dostack from '../../../../util/dostack';

// let gTargetObject: any = null;
let addUndoStackTimer: any = null;
const Outlines = observer(() => {
    const { workInfo, userInfo } = store;
    const currObject = workInfo.getObject();
    const currObjectGroup = workInfo.getObjectGroup();
    const currUpdateKey = workInfo.getUpdateKey();
    const folderSelected: boolean = workInfo.getFolderSelected();
    const LANGSET = userInfo.getLangSet();
    const [bOpacityUiShow, setBOpacityUiShow] = useState<boolean>(false);
    const [objectType, setObjectType] = useState<string>(EobjectType.none);

    useEffect(() => {
        // gTargetObject = currObject;
        //console.log( targetObject);
        if (currObject !== null) {
            $('.content-outline .color-selector').removeClass('disabled');
            // const currObjectType = objects.getObjectType(currObject);
            // setObjectType(currObjectType);
        } else {
            $('.content-outline .color-selector').addClass('disabled');
            // setObjectType(EobjectType.none);
        }
        setObjectStyleToForms(currObject);
    }, [currObject, currUpdateKey]);

    useEffect(() => {
        for (const obj of currObjectGroup) {
            const type = objects.getObjectType(obj);
            setObjectType(type);
            if (type === EobjectType.audio) {
                break;
            }
        }
    }, [currObjectGroup]);

    const selectColorFunc = (colorCode: string) => {
        $('#idx_border_color_selector').css('background', 'unset');
        $('#idx_border_color_selector').css('background-color', colorCode);
        $('#idx_border_color_selector').attr('curr-color', colorCode);
        setBorderStyleFromInputForm('color');
    };

    const initializeForms = (styleInfo: any = null) => {
        if (styleInfo === null) {
            $('#idx_object_border_style').val(
                basicData.borderStyleList[0].value,
            );
            $('#idx_object_border_width').val(0);
            $('#object_border_opacity_range').val(100);
            $('#object_border_opacity').val(100);
            $('#idx_border_color_selector').css('background', '');
            $('#idx_border_color_selector').css('background-color', '');
            $('#idx_border_color_selector').attr('curr-color', '');

            // border-radius
            $('#idx_object_edge_radius').val(0);
            $('#idx_object_edge_radius_unit').val('px');
        } else {
            $('#idx_object_border_style').val(styleInfo.borderStyle);
            $('#idx_object_border_width').val(styleInfo.borderWidth);

            $('#idx_border_color_selector').css('background', 'unset');
            $('#idx_border_color_selector').attr(
                'curr-color',
                styleInfo.borderColor,
            );

            const colorInfo = common.cssRgbToColorArray(styleInfo.borderColor);
            let borderOpacity = 100;
            if (colorInfo) {
                if (colorInfo.length === 4) {
                    borderOpacity = Number((colorInfo[3] * 100).toFixed(0));
                }
                const colorCode = common.rgbToHex(
                    colorInfo[0],
                    colorInfo[1],
                    colorInfo[2],
                );
                $('#idx_border_color_selector').css(
                    'background-color',
                    colorCode,
                );
            }
            $('#object_border_opacity_range').val(borderOpacity);
            $('#object_border_opacity').val(borderOpacity);

            // border-radius
            const edgeRadius = Number(
                styleInfo.edgeRadius.replace(/[^0-9]/g, ''),
            );
            const edgeRadiusUnit = styleInfo.edgeRadius.replace(/[0-9]/g, '');
            console.log('edgeRadius: ', edgeRadius);
            console.log('edgeRadiusUnit: ', edgeRadiusUnit);

            $('#idx_object_edge_radius').val(edgeRadius);
            $('#idx_object_edge_radius_unit').val(edgeRadiusUnit);
        }
    };

    const setObjectStyleToForms = (targetObject: any) => {
        if (targetObject) {
            const orgObjectBorderStyleinfo =
                objects.getObjectBorderStyleinfo(targetObject);
            console.log('orgObjectBorderStyleinfo: ', orgObjectBorderStyleinfo);
            initializeForms(orgObjectBorderStyleinfo);
        } else {
            initializeForms();
        }
    };

    const onOpacity = (elem: HTMLInputElement) => {
        const opacityVal = Number(elem.value);
        $('#object_border_opacity').val(opacityVal);
        $('#object_border_opacity_range').val(opacityVal);
        console.log('opacityVal: ', opacityVal);
        setBorderStyleFromInputForm('opacity');
    };

    const setBorderStyleFromInputForm = (target: string) => {
        const currStyle = String($('#idx_object_border_style').val());
        const currWidth = Number($('#idx_object_border_width').val());
        const currColor = String(
            $('#idx_border_color_selector').attr('curr-color'),
        );
        const currOpacity = Number($('#object_border_opacity_range').val());

        const objectGroup = workInfo.getObjectGroup();
        //if(gTargetObject) {

        objectGroup.forEach((obj: any) => {
            // let orgObjectStyleInfo = objects.getObjectStyleInfo(obj);
            const newStyleInfo: IborderStyleInfo = {
                borderWidth: currWidth,
                borderStyle: currStyle,
                borderColor: currColor,
                borderOpacity: currOpacity / 100,
            };
            objects.setObjectBorderStyleinfo(obj, newStyleInfo);

            // undo stack 기록 타이머 (addUndoStackTimerDelay 시간 내에 다시 요청시에는 기록하지 않는다.)
            // if (target === 'opacity' || target === 'width') {
            //     if (addUndoStackTimer) {
            //         clearTimeout(addUndoStackTimer);
            //         addUndoStackTimer = null;
            //     }
            //     const objectId = obj ? obj.id : '';
            //     addUndoStackTimer = setTimeout(
            //         id => {
            //             addUndoStackTimer = null;
            //             console.log('addUndoStackTimer objectId : ', id);
            //             if (id) {
            //                 // dostack.addUndoStack(id, EundoStackAddType.style);
            //                 dostack.addUndoStack('', EundoStackAddType.all);
            //             }
            //         },
            //         basicData.addUndoStackTimerDelay * 1000,
            //         objectId,
            //     );
            // } else if (target === 'style') {
            //     dostack.addUndoStack('', EundoStackAddType.all);
            // } else {
            //     // color 변경시 ColorPicker 컴포넌트에서 자체적으로 addUndoStack 수행하므로 여기선 안한다.
            // }
        });

        // undo stack 기록 타이머 (addUndoStackTimerDelay 시간 내에 다시 요청시에는 기록하지 않는다.)
        if (target === 'opacity' || target === 'width' || target === 'style') {
            if (addUndoStackTimer) {
                clearTimeout(addUndoStackTimer);
                addUndoStackTimer = null;
            }
            addUndoStackTimer = setTimeout(() => {
                addUndoStackTimer = null;
                dostack.addUndoStack();
            }, basicData.addUndoStackTimerDelay * 1000);
        } else {
            // color 변경시 ColorPicker 컴포넌트에서 자체적으로 addUndoStack 수행하므로 여기선 안한다.
        }
    };

    const changeBorderStyle = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('changeBorderStyle: ', event.currentTarget.value);
        setBorderStyleFromInputForm('style');
    };

    const changeBorderWidth = (elem: HTMLInputElement) => {
        console.log('border-width : ', elem.value);
        setBorderStyleFromInputForm('width');
    };

    const showOpacityLayer = (e: React.MouseEvent<HTMLButtonElement>) => {
        const opacityLayer = e.currentTarget.nextSibling as HTMLDivElement;
        if (opacityLayer && opacityLayer.classList.contains('ui-opacity')) {
            if (opacityLayer.classList.contains('active')) {
                setBOpacityUiShow(false);
            } else {
                setBOpacityUiShow(true);
            }
        }
        document.addEventListener('mousedown', hideOpacityLayer);
        common.cancelBubble(e);
    };
    const hideOpacityLayer = () => {
        setBOpacityUiShow(false);
        document.removeEventListener('mousedown', hideOpacityLayer);
    };
    const decOpacity = () => {
        const opacityRangeObj = document.getElementById(
            'object_border_opacity',
        ) as HTMLInputElement;
        if (opacityRangeObj) {
            opacityRangeObj.value = String(Number(opacityRangeObj.value) - 1);
            onOpacity(opacityRangeObj);
        }
    };
    const encOpacity = () => {
        console.log('encOpacity');
        const opacityRangeObj = document.getElementById(
            'object_border_opacity',
        ) as HTMLInputElement;
        if (opacityRangeObj) {
            opacityRangeObj.value = String(Number(opacityRangeObj.value) + 1);
            onOpacity(opacityRangeObj);
        }
    };

    const changeEdgeRadiusUnit = (
        elem: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const radiusUnit = String(elem.currentTarget.value);
        const radius = Number($('#idx_object_edge_radius').val());
        console.log('radiusUnit : ', radiusUnit);
        console.log('radius : ', radius);
        applyEdgeRadius(radius, radiusUnit);
    };
    const changeEdgeRadius = (elem: HTMLInputElement) => {
        const radiusUnit = String($('#idx_object_edge_radius_unit').val());
        const radius = Number(elem.value);
        console.log('radiusUnit : ', radiusUnit);
        console.log('radius : ', radius);
        applyEdgeRadius(radius, radiusUnit);
    };
    const applyEdgeRadius = (radius: number, unit: string) => {
        const objectGroup = workInfo.getObjectGroup();
        objectGroup.forEach((obj: any) => {
            objects.setObjectEdgeRadius(obj, radius, unit);
        });

        // addUndoStackTimerDelay 시간 내에 다시 요청시에는 기록하지 않는다.
        if (addUndoStackTimer) {
            clearTimeout(addUndoStackTimer);
            addUndoStackTimer = null;
        }
        addUndoStackTimer = setTimeout(() => {
            addUndoStackTimer = null;
            dostack.addUndoStack();
        }, basicData.addUndoStackTimerDelay * 1000);
    };

    if (currObject === null || folderSelected) {
        return <></>;
    }

    if (objectType === EobjectType.audio) {
        return <></>;
    }

    return (
        <>
            <article className="box-list">
                <div className="content-outline">
                    <div className="list-title">{LANGSET.PROPERTY.OUTLINE}</div>
                    <div className="list-content">
                        <div className="ul-dropdown">
                            <select
                                id="idx_object_border_style"
                                onChange={changeBorderStyle}
                            >
                                {basicData.borderStyleList.map(styleInfo => (
                                    <option
                                        key={`key_borderstyle_${styleInfo.value}`}
                                        value={styleInfo.value}
                                    >
                                        {styleInfo.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <NumberForm
                            inputInfo={{
                                id: 'idx_object_border_width',
                                type: 'number',
                                unit: '',
                                min: 0,
                                max: 99,
                                default: 0,
                                changeEvt: changeBorderWidth,
                            }}
                        />

                        <div className="btn-selectors">
                            <ColorPicker
                                inputInfo={{
                                    id: 'idx_border_color_selector',
                                    changeEvt: selectColorFunc,
                                }}
                            />
                            <div className="obj-opacity">
                                <button
                                    className="btn-obj-opacity"
                                    onClick={showOpacityLayer}
                                >
                                    Opacity
                                </button>
                                <div
                                    className="ui-opacity"
                                    style={{
                                        display: bOpacityUiShow
                                            ? 'flex'
                                            : 'none',
                                    }}
                                    onMouseDown={common.cancelBubble}
                                >
                                    <button
                                        className="btn-opacity-minus"
                                        onClick={decOpacity}
                                    >
                                        Minus
                                    </button>
                                    <input
                                        type="range"
                                        id="object_border_opacity_range"
                                        onChange={e =>
                                            onOpacity(e.currentTarget)
                                        }
                                        defaultValue="100"
                                    />
                                    <button
                                        className="btn-opacity-plus"
                                        onClick={encOpacity}
                                    >
                                        Plus
                                    </button>
                                    <NumberForm
                                        inputInfo={{
                                            id: 'object_border_opacity',
                                            type: 'number',
                                            unit: '%',
                                            min: 0,
                                            max: 100,
                                            default: 100,
                                            changeEvt: onOpacity,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* <div className='row'>
                            
                            <div className='ui-opacity'>
                                <button className='btn-opacity-minus'>Minus</button>
                                <input type="range" id="object_border_opacity_range" onChange={(e)=>onOpacity(e.currentTarget)} defaultValue='100' />               
                                <button className='btn-opacity-plus'>Plus</button>
                                <NumberForm inputInfo={{
                                    id: 'object_border_opacity',
                                    type: 'number',
                                    unit: '%',
                                    min: 0,
                                    max: 100,
                                    default: 100,
                                    changeEvt: onOpacity,
                                }} />
                            </div>
                        </div> */}
                    </div>
                </div>

                <div className="content-outline edge">
                    <div className="list-title">{LANGSET.PROPERTY.RADIUS}</div>
                    <div className="list-content">
                        <NumberForm
                            inputInfo={{
                                id: 'idx_object_edge_radius',
                                type: 'number',
                                unit: '',
                                min: 0,
                                max: 99,
                                default: 0,
                                changeEvt: changeEdgeRadius,
                            }}
                        />
                        <div
                            className="ul-dropdown"
                            style={{ marginLeft: '10px' }}
                        >
                            <select
                                id="idx_object_edge_radius_unit"
                                onChange={changeEdgeRadiusUnit}
                            >
                                <option value="px">px</option>
                                <option value="%">%</option>
                            </select>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
});

export default Outlines;

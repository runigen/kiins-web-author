import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import $ from 'jquery';
// import * as dialog from '../../../../util/dialog';
import * as basicData from '../../../../const/basicData';
// import * as SquareEvent from '../../../../event/SquareEvent';
import * as objects from '../../../../util/objects';
import * as pages from '../../../../util/pages';
import { EundoStackAddType } from '../../../../const/types';
import * as FileEvent from '../../../../event/FileEvent';
import * as ImageEvent from '../../../../event/ImageEvent';
import {
    EimageAddType,
    EobjectType,
    IstretchInfo,
    IobjectBgInfo,
    IstretchCssInfo,
} from '../../../../const/types';
import { allEventCancel, cancelBubble } from '../../../../util/common';
import Sprite from './Sprite';
import * as sprite from '../../../../util/sprite';
// import * as common from '../../../../util/common';
import NumberForm from '../../../../util/NumberForm';
import ColorPicker from '../../../../util/ColorPicker';
import * as dostack from '../../../../util/dostack';
import * as keyframe from '../../../../util/keyframe';

let gTargetObject: any = null;
let animationTl: any = null;
let addUndoStackTimer: any = null;
const Styles = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const currObject = workInfo.getObject();
    const currObjectGroup = workInfo.getObjectGroup();
    const currUpdateKey = workInfo.getUpdateKey();
    // const pageObject = docData.getPageObject();
    const pageUpdateKey = docData.getPageUpdateKey();
    const LANGSET = userInfo.getLangSet();
    const folderSelected: boolean = workInfo.getFolderSelected();

    const [objectType, setObjectType] = useState<EobjectType>(EobjectType.none);
    const [objectBgInfo, setObjectBgInfo] = useState<IobjectBgInfo | null>(
        null,
    );
    // const [uiOpacity, setUiOpacity] = useState<number>(100)
    const [currMenu, setCurrMenu] = useState('ui-tab-conts');
    // const [dropdownbox, setDropdownbox] = useState<boolean>(false);
    // const [selectedText, setSelectedText] = useState<string>('Stretch')
    const [bOpacityUiShow, setBOpacityUiShow] = useState<boolean>(false);

    const showMenu = (menu: string) => {
        setCurrMenu(menu);
    };

    useEffect(() => {
        return () => {
            initialize();
        };
    }, []);

    useEffect(() => {
        console.log('object modified -----------------------');
        gTargetObject = currObject;
        if (currObject !== null) {
            setCurrObjectStyles(currObject);
            // const currObjectType = objects.getObjectType(currObject);
            // setObjectType(currObjectType);
        } else {
            setCurrObjectStyles(currObject);
            setObjectType(EobjectType.page);
        }
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

    useEffect(() => {
        console.log('pageObject modified -----------------------');
        setCurrObjectStyles(null);
    }, [pageUpdateKey]);

    useEffect(() => {
        // console.log('objectBgInfo : ', objectBgInfo)
    }, [objectBgInfo]);

    const initialize = () => {
        if (animationTl !== null) {
            animationTl.clear();
            animationTl = null;
        }
        setObjectBgInfo(null);
        setObjectType(EobjectType.none);
    };

    const selectColorFunc = (colorCode: string) => {
        showMenu('tab-fill');
        setNewBackGroundColor(colorCode);
    };

    const setNewBackGroundColor = (colorCode: string) => {
        const objectGroup = workInfo.getObjectGroup();
        if (objectGroup.length > 0) {
            objectGroup.forEach((obj: any) => {
                objects.setObjectBackColor(obj, colorCode, false);
            });
        } else {
            pages.setPageBackColor(colorCode, false);
        }
        // if(gTargetObject) {
        //     objects.setObjectBackColor(gTargetObject, colorCode, false);
        // } else {
        //     pages.setPageBackColor(colorCode, false);
        // }
        $('#idx_background_color_selector').css('background', 'unset');
        $('#idx_background_color_selector').css('background-color', colorCode);
    };

    const setCurrObjectStyles = async (targetObject: any) => {
        if (targetObject !== null) {
            const objectType = objects.getObjectType(targetObject);
            if (objectType === 'square' || objectType === 'image') {
                const objectStyleInfo =
                    objects.getObjectStyleInfo(targetObject);
                // console.log("objectStyleInfo : ", objectStyleInfo);
                objects.setStyleInfoToButton(objectStyleInfo);

                if (
                    objectStyleInfo.backgroundImage !== '' &&
                    objectStyleInfo.backgroundImage !== 'none'
                ) {
                    let currStrechInfo =
                        basicData.bgStretchList.find(
                            item =>
                                item.css.bgSize ===
                                    objectStyleInfo.backgroundSize &&
                                item.css.bgRepeat ===
                                    objectStyleInfo.backgroundRepeat,
                        ) || null;
                    if (!currStrechInfo) {
                        currStrechInfo = basicData.defaultBgStretchList;
                    }

                    const imageSizeInfo: any = await ImageEvent.getOrgImageSize(
                        objectStyleInfo.backgroundImage,
                    ).catch((err: any) => {
                        console.log(err);
                        return null;
                    });
                    if (imageSizeInfo === null) {
                        setObjectBgInfo(null);
                        return;
                    }
                    setObjectBgInfo({
                        url: objectStyleInfo.backgroundImage,
                        width: imageSizeInfo.width,
                        height: imageSizeInfo.height,
                        stretchName: currStrechInfo.stretchName,
                    });
                } else {
                    setObjectBgInfo(null);
                }

                //setUiOpacity(objectStyleInfo.opacity*100);
            }
        } else {
            // objects.setStyleInfoToButton(null);
            const pageStyleInfo = pages.getPageStyleInfo();
            // console.log('pageStyleInfo: ', pageStyleInfo)

            if (pageStyleInfo.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                $('#idx_background_color_selector').css('background', 'unset');
                $('#idx_background_color_selector').attr(
                    'curr-color',
                    pageStyleInfo.backgroundColor,
                );
            } else {
                $('#idx_background_color_selector').css('background', '');
                $('#idx_background_color_selector').attr('curr-color', '');
            }
            $('#idx_background_color_selector').css(
                'background-color',
                pageStyleInfo.backgroundColor,
            );

            const pageOpacity = pageStyleInfo.opacity * 100;
            $('#object_opacity').val(pageOpacity);
            $('#object_opacity_range').val(pageOpacity);

            if (
                pageStyleInfo.backgroundImage !== '' &&
                pageStyleInfo.backgroundImage !== 'none'
            ) {
                let currStrechInfo =
                    basicData.bgStretchList.find(
                        item =>
                            item.css.bgSize === pageStyleInfo.backgroundSize &&
                            item.css.bgRepeat ===
                                pageStyleInfo.backgroundRepeat,
                    ) || null;
                if (!currStrechInfo) {
                    currStrechInfo = basicData.defaultBgStretchList;
                }

                const imageSizeInfo: any = await ImageEvent.getOrgImageSize(
                    pageStyleInfo.backgroundImage,
                ).catch((err: any) => {
                    console.log(err);
                    return null;
                });
                if (imageSizeInfo === null) {
                    setObjectBgInfo(null);
                    return;
                }
                setObjectBgInfo({
                    url: pageStyleInfo.backgroundImage,
                    width: imageSizeInfo.width,
                    height: imageSizeInfo.height,
                    stretchName: currStrechInfo.stretchName,
                });
            } else {
                setObjectBgInfo(null);
            }

            // setObjectBgInfo(null);
            //setUiOpacity(100);
        }
    };

    const changeObjectBgSrc = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (event.target.files) {
            if (targetObject) {
                FileEvent.executeUpload(event, EimageAddType.replace);
            } else {
                FileEvent.executeUpload(event, EimageAddType.page);
            }
            // workInfo.setUpdateKey();
        } else {
            console.log('image select error');
        }
        allEventCancel(event);
        event.target.value = '';
    };

    const showSpritePopup = () => {
        workInfo.setUpdateKey();
        sprite.showSpritePopup();
    };

    const onOpacity = (elem: HTMLInputElement) => {
        const opacityVal = Number(elem.value);
        //setUiOpacity(parseInt(opacityVal));
        $('#object_opacity').val(opacityVal);
        $('#object_opacity_range').val(opacityVal);
        // console.log('opacityVal: ', opacityVal);

        // if (gTargetObject) {
        //     objects.setOpacityToObject(gTargetObject, opacityVal / 100);
        // } else {
        //     pages.setOpacityToPage(opacityVal / 100);
        // }
        const objectGroup = workInfo.getObjectGroup();
        if (objectGroup.length > 0) {
            objectGroup.forEach((obj: any) => {
                objects.setOpacityToObject(obj, opacityVal / 100);
            });
        } else {
            pages.setOpacityToPage(opacityVal / 100);
        }

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
                if (id !== '') {
                    // dostack.addUndoStack(id, EundoStackAddType.style);

                    // autoKeyframe 적용
                    const autoKeyframeStatus = workInfo.getAutoKeyframeStatus();
                    if (autoKeyframeStatus) {
                        keyframe.addKeyFrame();
                        // dostack.addUndoStack(id, EundoStackAddType.keyframe);
                    }
                } else {
                    // dostack.addUndoStack('', EundoStackAddType.page);
                }
                dostack.addUndoStack('', EundoStackAddType.all);
            },
            basicData.addUndoStackTimerDelay * 1000,
            objectId,
        );
    };

    const removeBgColor = () => {
        const objectGroup = workInfo.getObjectGroup();
        if (objectGroup.length > 0) {
            objectGroup.forEach((obj: any) => {
                objects.setObjectBackColor(obj, '');
            });
        } else {
            pages.setPageBackColor('');
        }
        // if(targetObject) {
        //     objects.setObjectBackColor(targetObject, '');
        // } else {
        //     pages.setPageBackColor('');
        // }
        $('#idx_background_color_selector').css('background', '');
        $('#idx_background_color_selector').css('background-color', '');
        $('#object_opacity').val(100);
        $('#object_opacity_range').val(100);

        // 선택된 값으로 objectBgInfo값(state) 업데이트
        setObjectBgInfo(null);
    };

    const changeStretch = (
        targetObject: any,
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const stretchVal = String($(event.currentTarget).val());
        const stretchInfo =
            basicData.bgStretchList.find(
                item => item.stretchName === stretchVal,
            ) || null;
        if (stretchInfo) {
            const newStretchInfo: IstretchCssInfo = {
                bgSize: stretchInfo.css.bgSize,
                bgRepeat: stretchInfo.css.bgRepeat,
                bgPosition: stretchInfo.css.bgPosition,
            };
            // if(targetObject) {
            //     objects.setBgStretchInfo(targetObject, newStretchInfo);
            // dostack.addUndoStack(targetObject.id, EundoStackAddType.style);
            const objectGroup = workInfo.getObjectGroup();
            if (objectGroup.length > 0) {
                objectGroup.forEach((obj: any) => {
                    objects.setBgStretchInfo(obj, newStretchInfo);
                });
            } else {
                pages.setPageBgStretchInfo(newStretchInfo);
            }

            dostack.addUndoStack('', EundoStackAddType.all);

            // 선택된 값으로 objectBgInfo값(state) 업데이트
            setObjectBgInfo(objectBgInfo =>
                objectBgInfo
                    ? { ...objectBgInfo, stretchName: stretchInfo.stretchName }
                    : null,
            );
        }
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
        cancelBubble(e);
    };
    const hideOpacityLayer = () => {
        setBOpacityUiShow(false);
        document.removeEventListener('mousedown', hideOpacityLayer);
    };
    const decOpacity = () => {
        const opacityRangeObj = document.getElementById(
            'object_opacity',
        ) as HTMLInputElement;
        if (opacityRangeObj) {
            opacityRangeObj.value = String(Number(opacityRangeObj.value) - 1);
            onOpacity(opacityRangeObj);
        }
    };
    const encOpacity = () => {
        console.log('encOpacity');
        const opacityRangeObj = document.getElementById(
            'object_opacity',
        ) as HTMLInputElement;
        if (opacityRangeObj) {
            opacityRangeObj.value = String(Number(opacityRangeObj.value) + 1);
            onOpacity(opacityRangeObj);
        }
    };

    if (folderSelected) {
        return <></>;
    }

    if (objectType === EobjectType.audio) {
        return <></>;
    }

    return (
        <>
            <article className="box-list">
                <div className="content-styles">
                    <div className="list-title">{LANGSET.PROPERTY.FILL}</div>
                    <div className="btn-selectors">
                        <button
                            className="color-selector"
                            id=""
                            onClick={removeBgColor}
                            title="배경 제거"
                        >
                            None
                        </button>

                        {/* <button className="color-selector" id="idx_background_color_selector" onClick={ (e) => {
                            showBgColorPicker(e)
                            showMenu('tab-fill')
                        } } onMouseDown={cancelBubble}
                        ></button> */}

                        <ColorPicker
                            inputInfo={{
                                id: 'idx_background_color_selector',
                                changeEvt: selectColorFunc,
                            }}
                        />

                        {/* <button className="color-selector" id="" onClick={()=>showMenu('tab-gradient')}>Gradient</button> */}

                        {objectType !== 'image' && (
                            <>
                                <button
                                    className="color-selector"
                                    id=""
                                    onClick={() => showMenu('tab-img')}
                                    title="배경 이미지"
                                >
                                    <label htmlFor="square-bg-input-file"></label>
                                </button>
                            </>
                        )}
                        <div className="obj-opacity">
                            <button
                                className="btn-obj-opacity"
                                onClick={showOpacityLayer}
                                title="배경 투명도"
                            >
                                Opacity
                            </button>
                            <div
                                className="ui-opacity"
                                style={{
                                    display: bOpacityUiShow ? 'flex' : 'none',
                                }}
                                onMouseDown={cancelBubble}
                            >
                                <button
                                    className="btn-opacity-minus"
                                    onClick={decOpacity}
                                >
                                    Minus
                                </button>
                                <input
                                    type="range"
                                    id="object_opacity_range"
                                    onChange={e => onOpacity(e.currentTarget)}
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
                                        id: 'object_opacity',
                                        type: 'number',
                                        unit: '%',
                                        min: 0,
                                        max: 100,
                                        default: 100,
                                        changeEvt: onOpacity,
                                    }}
                                />
                                {/* <input type="range" id="object_border_opacity_range" onChange={(e)=>onOpacity(e.currentTarget)} defaultValue='100' />               
                                <NumberForm inputInfo={{
                                    id: 'object_border_opacity',
                                    type: 'number',
                                    unit: '%',
                                    min: 0,
                                    max: 100,
                                    default: 100,
                                    changeEvt: onOpacity,
                                }} /> */}
                                {/* <label htmlFor="object_opacity">opacity</label>
                                <input
                                    type="range"
                                    id="object_opacity_range"
                                    onChange={e => onOpacity(e.currentTarget)}
                                    defaultValue="100"
                                /> */}
                                {/* <NumberForm
                                    inputInfo={{
                                        id: 'object_opacity',
                                        type: 'number',
                                        unit: '%',
                                        min: 0,
                                        max: 100,
                                        default: 100,
                                        changeEvt: onOpacity,
                                    }}
                                /> */}
                                {/* <div className="inputbox">
                                    <input type="number" name="" id="object_opacity" min="0" max="100" defaultValue='100' />
                                    <span>%</span>
                                </div>
                                <div className="btn-adjust">
                                    <button aria-label='up' onClick={()=>onIncrease(currObject)}></button>
                                    <button aria-label='down' onClick={()=>onDecrease(currObject)}></button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <div className="list-content">
                        {
                            <>
                                <div className="ui-tabs">
                                    <div
                                        className={
                                            'tab-conts none' +
                                            (currMenu === 'tab-none'
                                                ? ' active'
                                                : '')
                                        }
                                    ></div>
                                    <div
                                        className={
                                            'tab-conts fill' +
                                            (currMenu === 'tab-fill'
                                                ? ' active'
                                                : '')
                                        }
                                    ></div>
                                    <div
                                        className={
                                            'tab-conts gradient' +
                                            (currMenu === 'tab-gradient'
                                                ? ' active'
                                                : '')
                                        }
                                    >
                                        gradient
                                    </div>
                                    <div
                                        className={
                                            'tab-conts img' +
                                            (currMenu === 'tab-img' ||
                                            objectBgInfo
                                                ? ' active'
                                                : '')
                                        }
                                    >
                                        {objectType !== 'image' && (
                                            <>
                                                <div className="inputFile">
                                                    <input
                                                        type="file"
                                                        id="square-bg-input-file"
                                                        accept="image/gif, image/jpeg, image/png"
                                                        onChange={e =>
                                                            changeObjectBgSrc(
                                                                currObject,
                                                                e,
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor="square-bg-input-file">
                                                        File
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            objectBgInfo
                                                                ? objectBgInfo.url
                                                                : ''
                                                        }
                                                        readOnly
                                                    />
                                                </div>

                                                {objectBgInfo && (
                                                    <>
                                                        <div className="ul-dropdown">
                                                            <select
                                                                value={
                                                                    objectBgInfo.stretchName
                                                                }
                                                                id="object_bg_stretch"
                                                                onChange={e =>
                                                                    changeStretch(
                                                                        currObject,
                                                                        e,
                                                                    )
                                                                }
                                                            >
                                                                {basicData.bgStretchList.map(
                                                                    (
                                                                        stretchInfo: IstretchInfo,
                                                                        index: number,
                                                                    ) => (
                                                                        <option
                                                                            key={`key_${index}`}
                                                                            value={
                                                                                stretchInfo.stretchName
                                                                            }
                                                                        >
                                                                            {
                                                                                stretchInfo.stretchName
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                            {/* <div className='selected' onClick={onDropdown}>{selectedText}</div>
                                                        {
                                                            dropdownbox && 
                                                            <ul>
                                                                <li onClick={onDropdown}>Stretch1</li>
                                                                <li onClick={onDropdown} className='active'>Stretch2</li>
                                                                <li onClick={onDropdown}>Stretch3</li>
                                                            </ul>
                                                        } */}
                                                        </div>

                                                        {objectType ===
                                                            'square' &&
                                                            currObjectGroup.length ===
                                                                1 && (
                                                                <div id="idx_create_splite_image_box">
                                                                    <button
                                                                        className="btn-default-action"
                                                                        onClick={
                                                                            showSpritePopup
                                                                        }
                                                                    >
                                                                        {
                                                                            LANGSET
                                                                                .PROPERTY
                                                                                .CREATE_SPRITE
                                                                        }
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        }
                        {/* <div>
                            <div className="title-sub">fill</div>
                            <div className="color-selector" id="idx_background_color_selector" onClick={showBgColorPicker}></div>
                        </div>
                        <div>
                            <div className="title-sub">outline</div>
                            <div className="color-selector" id="idx_border_color_selector" onClick={showBdColorPicker}></div>
                        </div> 
                        
                        <div className="head-tab">
                            <button className={currMenu === 'section-properties' ? ' active' : ''} onClick={()=>showMenu('section-properties')}>Properties</button>
                            <button className={currMenu === 'section-interactions' ? ' active' : ''} onClick={()=>showMenu('section-interactions')}>Interactions</button>
                        </div>
                        <section className={'section-properties' + (currMenu === 'section-properties' ? ' active' : '')}>
                            <Properties />
                        </section>
                        <section className={'section-interactions' + (currMenu === 'section-interactions' ? ' active' : '')}>
                            <Interactions />
                        </section>

                        {objectType === 'square' && 
                            <div>
                                <div>
                                    <button type="button" className="frm-edit-image">배경이미지
                                        <input type="file" className="frm-edit-image" accept="image/gif, image/jpeg, image/png" onChange={(e)=>changeObjectBgSrc(e)} />
                                    </button>
                                </div>
                                <div>
                                    경로 : {objectBgInfo && objectBgInfo.url}
                                </div>

                                {objectBgInfo && 
                                    <div id='idx_create_splite_image_box'>
                                        <span onClick={showSpritePopup}>create sprite</span>
                                    </div>
                                }
                            </div>
                        }
                        
                        */}
                    </div>
                </div>
            </article>

            {/* sprite popup */}
            {objectType === 'square' && objectBgInfo && (
                <Sprite objectBgInfo={objectBgInfo} />
            )}
        </>
    );
});

export default Styles;

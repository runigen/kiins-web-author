import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import * as DataStore from '../../../../store/DataStore';
import $ from 'jquery';
import {
    // dynamicTextEditorTools,
    TextEditorToolsTopMargin,
} from '../../../../const/basicData';
import {
    EundoStackAddType,
    ETextEditorToolsType,
} from '../../../../const/types';
import { allEventCancel, rgbToHex } from '../../../../util/common';
import * as dostack from '../../../../util/dostack';
import * as texteditor from '../../../../util/texteditor';
import ButtonTool from './ButtonTool';
import ComboTool from './ComboTool';
import DropDownTool from './DropDownTool';
import DropDownInputTool from './DropDownInputTool';
import ColorTool, {
    getLastSelectColor,
    initLastSelectColor,
} from './ColorTool';
import Separator from './Separator';

let gTargetObject: any = null;
const TextTools = observer(() => {
    const { workInfo } = store;
    const currObject = workInfo.getObject();
    const currUpdateKey = workInfo.getUpdateKey();
    const currDteStatus = workInfo.getDteStatus();
    const dynamicTextEditorTools = texteditor.getDynamicTextEditorTools();

    let bMoveDown = false;
    let mMoveStartX = 0;
    let mMoveStartY = 0;

    useEffect(() => {
        // addContainerMouseDownEvent();
    }, []);

    useEffect(() => {
        console.log('currDteStatus : ', currDteStatus);
        showTools(currDteStatus);
    }, [currDteStatus]);

    useEffect(() => {
        gTargetObject = currObject;
    }, [currObject, currUpdateKey]);

    // const addContainerMouseDownEvent = () => {
    //     const container = document.getElementById('idx_dynamic_text_tools_container') as HTMLDivElement;
    //     if(container) {
    //         container.addEventListener('mousedown', editToolbarTitleMouseDownEvent);
    //     }
    // };

    const showTools = (bShow = true) => {
        const container = document.getElementById(
            'idx_dynamic_text_tools_container',
        ) as HTMLDivElement;
        if (container === null) return;

        texteditor.closeAllCtlBoxList();

        if (bShow) {
            $(container).addClass('active');
            setTextEditorToolbarPosition(gTargetObject);
        } else {
            const lastSelectColor = getLastSelectColor();
            console.log('lastSelectColor : ', lastSelectColor);
            DataStore.addColorHistory(
                rgbToHex(
                    lastSelectColor.r,
                    lastSelectColor.g,
                    lastSelectColor.b,
                ),
            );
            initLastSelectColor();

            $(container).removeClass('active');

            if (gTargetObject) {
                dostack.addUndoStack(
                    gTargetObject.id,
                    EundoStackAddType.textbox,
                );
            }
        }
    };

    const setTextEditorToolbarPosition = (currObject: any) => {
        console.log('setTextEditorToolbarPosition currObject : ', currObject);
        if (currObject) {
            const objectMargin =
                ($('.dynamic-text-tools-container').outerHeight() || 0) +
                TextEditorToolsTopMargin; // 오브젝트 위로 떨어질 간격
            console.log(
                'objectMargin : ',
                $('.dynamic-text-tools-container').outerHeight(),
                objectMargin,
            );

            const canvasZoom = workInfo.getPageZoom();
            const leftPos =
                parseInt($(currObject).css('left'), 10) * canvasZoom;
            const topPos =
                parseInt($(currObject).css('top'), 10) * canvasZoom -
                objectMargin;
            console.log('leftPos : ', leftPos);
            console.log('topPos : ', topPos);

            const canvasContainerLeft =
                $('#idx_canvas_container').offset()?.left || 0;
            const canvasContainerTop =
                $('#idx_canvas_container').offset()?.top || 0;

            console.log('canvasContainerLeft : ', canvasContainerLeft);
            console.log('canvasContainerTop : ', canvasContainerTop);

            const headerHeight = $('.container .header').height() || 0;
            console.log('headerHeight : ', headerHeight);

            const workspaceScollTop = $('.workspace').scrollTop() || 0;
            const workspaceScollLeft = $('.workspace').scrollLeft() || 0;

            const documentsWidth =
                $('.container .body-wrapper .documents').width() || 0;

            const convasViewLeft = canvasContainerLeft - documentsWidth;
            const canvasViewTop = canvasContainerTop - headerHeight;

            console.log('convasViewLeft : ', convasViewLeft);
            console.log('canvasViewTop : ', canvasViewTop);

            const toolbarContainerTopPos =
                topPos + canvasViewTop + workspaceScollTop;
            // const toolbarContainerLeftPos = leftPos + convasViewLeft;
            const toolbarContainerLeftPos =
                leftPos + convasViewLeft + workspaceScollLeft;

            $('.dynamic-text-tools-container').css({
                left: toolbarContainerLeftPos > 0 ? toolbarContainerLeftPos : 0,
                top: toolbarContainerTopPos > 0 ? toolbarContainerTopPos : 0,
            });
        }
    };

    // toolbar container drag
    const editToolbarTitleMouseDownEvent = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        bMoveDown = true;
        mMoveStartX = event.clientX;
        mMoveStartY = event.clientY;

        console.log('down : ', mMoveStartX, mMoveStartY);

        window.addEventListener('mousemove', editToolbarTitleMouseMoveEvent);
        window.addEventListener('mouseup', editToolbarTitleMouseUpEvent);

        allEventCancel(event);
    };
    const editToolbarTitleMouseMoveEvent = (event: MouseEvent) => {
        if (bMoveDown !== true) return;

        const mMoveX = event.clientX - mMoveStartX;
        const mMoveY = event.clientY - mMoveStartY;
        console.log(mMoveX, mMoveY);

        const currLeft = parseInt(
            $('#idx_dynamic_text_tools_container')
                .css('left')
                .replace(/px/, ''),
            10,
        );
        const currTop = parseInt(
            $('#idx_dynamic_text_tools_container').css('top').replace(/px/, ''),
            10,
        );

        $('#idx_dynamic_text_tools_container').css({
            left: currLeft + mMoveX,
            top: currTop + mMoveY,
        });

        mMoveStartX += mMoveX;
        mMoveStartY += mMoveY;
    };
    const editToolbarTitleMouseUpEvent = () => {
        bMoveDown = false;
        mMoveStartX = 0;
        mMoveStartY = 0;
        window.removeEventListener('mousemove', editToolbarTitleMouseMoveEvent);
        window.removeEventListener('mouseup', editToolbarTitleMouseUpEvent);
    };

    return (
        <>
            <div
                className="dynamic-text-tools-container"
                id="idx_dynamic_text_tools_container"
                onMouseDown={editToolbarTitleMouseDownEvent}
                onClick={texteditor.closeAllCtlBoxList}
            >
                {/* <div className="toolbar-title" ></div>             */}

                {dynamicTextEditorTools.map((toolsList, index: number) => (
                    <div
                        key={'toolsList' + index}
                        className="toolbar-list"
                        onMouseDown={allEventCancel}
                    >
                        <div className="toolbar-content">
                            {toolsList.map((toolsInfo, index2: number) =>
                                toolsInfo.type ===
                                ETextEditorToolsType.button ? (
                                    <ButtonTool
                                        key={'toolsInfo' + index2}
                                        refToolsInfo={toolsInfo}
                                    />
                                ) : toolsInfo.type ===
                                  ETextEditorToolsType.combobox ? (
                                    <ComboTool
                                        key={'toolsInfo' + index2}
                                        refToolsInfo={toolsInfo}
                                    />
                                ) : toolsInfo.type ===
                                  ETextEditorToolsType.dropdown ? (
                                    <DropDownTool
                                        key={'toolsInfo' + index2}
                                        refToolsInfo={toolsInfo}
                                    />
                                ) : toolsInfo.type ===
                                  ETextEditorToolsType.dropdowninput ? (
                                    <DropDownInputTool
                                        key={'toolsInfo' + index2}
                                        refToolsInfo={toolsInfo}
                                    />
                                ) : toolsInfo.type ===
                                  ETextEditorToolsType.color ? (
                                    <ColorTool
                                        key={'toolsInfo' + index2}
                                        refToolsInfo={toolsInfo}
                                    />
                                ) : toolsInfo.type ===
                                  ETextEditorToolsType.separator ? (
                                    <Separator key={'toolsInfo' + index2} />
                                ) : (
                                    <></>
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
});

export default TextTools;

import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import $ from 'jquery';
import {
    EkeyName,
    IdefaultObjectStyleInfo,
    EworkStatus,
    EundoStackAddType,
    EobjectType,
} from '../../../const/types';
import { defaultObjectStyleInfo } from '../../../const/basicData';
import * as KeyEvent from '../../../event/KeyEvent';
import * as SquareEvent from '../../../event/SquareEvent';
import * as objects from '../../../util/objects';
import * as pages from '../../../util/pages';
import * as dostack from '../../../util/dostack';

let newStyleInfo: IdefaultObjectStyleInfo = {
    ...defaultObjectStyleInfo,
};
let newFolderInfo = '';
let newObjectOrderNo = 0;
let bMouseDown = false;
let drawStartX = 0;
let drawStartY = 0;
let drawEndX = 0;
let drawEndY = 0;
let canvasTop = 0;
let canvasLeft = 0;
let squareObject: any = null;

const BtnSquare = observer(() => {
    const { userInfo, workInfo } = store;
    const pageZoomRatio = workInfo.getPageZoom();
    // const [mode, setMode] = useState(false);
    const editStatus = workInfo.getStatus();
    const LANGSET = userInfo.getLangSet();

    const minWidth = 10;
    const minHeight = 10;
    const defaultWidth = 100;
    const defaultHeight = 100;

    useEffect(() => {
        window.addEventListener('keydown', setEscKeyEvent);
        return () => {
            window.removeEventListener('keydown', setEscKeyEvent);
        };
    }, []);

    useEffect(() => {
        // console.log('mode : ', mode);
        if (editStatus === EworkStatus.draw) {
            SquareEvent.unselectSquareObjcts();
            if (!$('.body-middle-workspace').hasClass('cursorCross')) {
                $('.body-middle-workspace').addClass('cursorCross');
            }
            addAllMouseEvent();
            // workInfo.setStatus(EworkStatus.draw);
        } else {
            if ($('.body-middle-workspace').hasClass('cursorCross')) {
                $('.body-middle-workspace').removeClass('cursorCross');
            }
            removeAllMouseEvent();
            // workInfo.setStatus(EworkStatus.none);
        }
    }, [editStatus]);

    const setEscKeyEvent = useCallback((event: any) => {
        const workStatus = workInfo.getStatus();
        if (workStatus !== EworkStatus.draw) return;
        const currKeyCode = KeyEvent.getKeyCode(event);
        if (currKeyCode === EkeyName.ESC) {
            workInfo.setStatus(EworkStatus.none);
        }
    }, []);
    const setInputMode = () => {
        // setMode(bSet);
        workInfo.setStatus(EworkStatus.draw);
    };

    const addAllMouseEvent = () => {
        console.log('event start~~~');
        // addMouseDownEvent();

        const workSpaceObj: any = document.getElementById(
            'idx_body_middle_workspace',
        );
        workSpaceObj.addEventListener('mousedown', addMouseDownEvent);
        workSpaceObj.addEventListener('mousemove', addMouseDragEvent);
        workSpaceObj.addEventListener('mouseup', addMouseUpEvent);
    };
    const addMouseDownEvent = useCallback(
        (event: MouseEvent) => {
            console.log('down');
            console.log(event.clientX);
            console.log(event.clientY);

            drawStartX = 0;
            drawStartY = 0;
            drawEndX = 0;
            drawEndY = 0;

            const canvasObj = pages.getCanvasObject() as HTMLDivElement;

            canvasTop = Math.ceil(canvasObj.getBoundingClientRect().top);
            canvasLeft = Math.ceil(canvasObj.getBoundingClientRect().left);

            const mouseX = event.clientX;
            const mouseY = event.clientY;

            drawStartX = mouseX - canvasLeft;
            drawStartY = mouseY - canvasTop;

            squareObject = objects.createNewObject(EobjectType.square);

            $(squareObject).css({
                left:
                    pageZoomRatio === 1
                        ? drawStartX
                        : Math.ceil(drawStartX / pageZoomRatio),
                top:
                    pageZoomRatio === 1
                        ? drawStartY
                        : Math.ceil(drawStartY / pageZoomRatio),
                width: 1,
                height: 1,
            });

            applyCurrStyle(squareObject);

            //        canvasObj.appendChild(squareObject);
            console.log(drawStartX, drawStartY);

            bMouseDown = true;
        },
        [pageZoomRatio],
    );

    const addMouseDragEvent = useCallback(
        (event: MouseEvent) => {
            if (bMouseDown !== true) return;
            console.log('drag..');

            drawEndX = event.clientX - canvasLeft - drawStartX;
            drawEndY = event.clientY - canvasTop - drawStartY;
            if (pageZoomRatio !== 1) {
                drawEndX = drawEndX / pageZoomRatio;
                drawEndY = drawEndY / pageZoomRatio;
            }

            draw();
        },
        [pageZoomRatio],
    );

    const addMouseUpEvent = useCallback(() => {
        console.log('up');
        bMouseDown = false;

        // drawEndX = event.clientX - canvasLeft - drawStartX;
        // drawEndY = event.clientY - canvasTop - drawStartY;

        // if(pageZoomRatio !== 1) {
        //     drawEndX = drawEndX/pageZoomRatio;
        //     drawEndY = drawEndY/pageZoomRatio;
        // }

        draw(true);
    }, []);

    const removeAllMouseEvent = () => {
        console.log('event end~~~');
        const workSpaceObj: HTMLDivElement = document.getElementById(
            'idx_body_middle_workspace',
        ) as HTMLDivElement;
        if (workSpaceObj) {
            workSpaceObj.removeEventListener('mousedown', addMouseDownEvent);
            workSpaceObj.removeEventListener('mousemove', addMouseDragEvent);
            workSpaceObj.removeEventListener('mouseup', addMouseUpEvent);
        }
    };
    const draw = (bFinish = false) => {
        if (bFinish === true) {
            if (drawEndX < minWidth) {
                drawEndX = defaultWidth;
            }
            if (drawEndY < minHeight) {
                drawEndY = defaultHeight;
            }
        }

        $(squareObject).css({
            width: Math.ceil(drawEndX),
            height: Math.ceil(drawEndY),
        });

        // applyCurrStyle(squareObject);

        if (bFinish === true) {
            // workInfo.addObjectList(squareObject);
            console.log('upupup');
            //console.log(squareObject);
            SquareEvent.selectSquareObjct(squareObject);
            SquareEvent.addSelectorEvent();
            initDrawEnvs();
            //setTimeout(() => {
            //});

            // dostack.addUndoStack(squareObject.id, EundoStackAddType.add);
            dostack.addUndoStack('', EundoStackAddType.all);
        }
    };

    const initDrawEnvs = () => {
        workInfo.setStatus(EworkStatus.none);
        bMouseDown = false;

        drawStartX = 0;
        drawStartY = 0;
        drawEndX = 0;
        drawEndY = 0;

        newStyleInfo = {
            ...defaultObjectStyleInfo,
        };
        newFolderInfo = '';
        newObjectOrderNo = 0;
    };

    const setCurrStyle = () => {
        const currObject = workInfo.getObject();
        if (currObject && currObject.type !== EobjectType.folder) {
            const styleInfo = objects.getObjectStyleInfo(currObject);
            const borderInfo = objects.getObjectBorderStyleinfo(currObject);
            newStyleInfo = {
                backgroundColor: styleInfo.backgroundColor,
                opacity: styleInfo.opacity,
                borderStyle: borderInfo.borderStyle,
                borderWidth: borderInfo.borderWidth,
                borderColor: borderInfo.borderColor,
            };
        } else {
            newStyleInfo = {
                ...defaultObjectStyleInfo,
            };
        }

        if (currObject) {
            const currObjectFolderInfo =
                objects.getObjectFolderInfo(currObject);
            const currObjectOrderNo = objects.getObjectOrderNo(currObject);
            newFolderInfo = currObjectFolderInfo;
            if (currObject.type === EobjectType.folder) {
                newFolderInfo += '/' + currObject.id;
            }
            newObjectOrderNo = currObjectOrderNo + 0.01;
        }
    };
    const applyCurrStyle = (targetObject: any) => {
        $(targetObject).css({
            backgroundColor: newStyleInfo.backgroundColor,
            opacity: newStyleInfo.opacity,
            borderStyle: newStyleInfo.borderStyle,
            borderWidth: newStyleInfo.borderWidth,
            borderColor: newStyleInfo.borderColor,
        });
        if (newFolderInfo !== '') {
            objects.setObjectFolderInfo(targetObject, newFolderInfo);
        }
        if (newObjectOrderNo !== 0) {
            objects.setObjectOrderNo(targetObject, newObjectOrderNo);
        }
    };

    return (
        <>
            <li
                className={`nav-object ${
                    editStatus === EworkStatus.draw ? 'active' : ''
                } `}
                aria-label="도형"
                title={LANGSET.HEAD.SHAPES}
                onClick={setInputMode}
                onMouseDown={setCurrStyle}
            ></li>
        </>
    );
});

export default BtnSquare;

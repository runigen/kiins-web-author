import React from 'react';
import { observer } from 'mobx-react';
import { ETemplateType } from '../../const/types';
import $ from 'jquery';
import { cancelBubble } from '../../util/common';
// import * as preview from '../../util/preview';
// import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import userInfo from '../../store/userInfo';
import * as logiceditor from '../../util/logiceditor';
import { basicConfirmDialog, hideDialog } from '../../util/dialog';
import { getParentElement } from '../../util/texteditor';
import * as dostackLogic from '../../util/dostackLogic';

const ActionList = observer(() => {
    // const objectList = workInfo.getObjectList();
    const templateMode = docData.getTemplateMode();
    const LANGSET = userInfo.getLangSet();

    // useEffect(() => {
    //     console.log('useEffect');
    //     return () => {};
    // }, []);

    const dragstart_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('dragstart_handler');
        event.dataTransfer.dropEffect = 'copy';
        event.dataTransfer.setData('text/plain', event.currentTarget.id);
        event.currentTarget.classList.add('dragging');
    };
    const dragend_handler = (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.remove('dragging');
    };

    const action_unit_dragstart_handler = (
        event: React.DragEvent<HTMLDivElement>,
    ) => {
        console.log('action_unit_dragstart_handler');
        event.dataTransfer.dropEffect = 'copy';
        event.dataTransfer.setData('text/plain', event.currentTarget.id);

        // unit을 캔버스에 드래그시 커넥터를 숨긴다.(커넥터가 노출되면 드래그시 커넥터 영역에 드래그가 되어서 동작에 방해가 된다.)
        const logicCanvasObj = logiceditor.getCanvasObject();
        if (logicCanvasObj) {
            logicCanvasObj.classList.add('hide-all-connectors');

            // 드래그가 끝나면 커넥터를 다시 노출한다.
            event.currentTarget.addEventListener('dragend', () => {
                if (logicCanvasObj) {
                    logicCanvasObj.classList.remove('hide-all-connectors');
                }
            });
        }

        cancelBubble(event);
    };

    const clearCanvas = () => {
        basicConfirmDialog('확인', '전체를 삭제 하시겠습니까?', [
            () => {
                logiceditor.clearCanvas();
            },
            () => {
                hideDialog();
            },
        ]);
    };
    const trash_dragover_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('trash_dragover_handler');
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('over');
    };
    // action_unit 을 삭제할때.
    const trash_drop_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('trash_drop_handler');
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        console.log('trash_drop_handler id : ', data);
        const dragObj = document.getElementById(data) as HTMLDivElement;
        if (dragObj) {
            const objectType = dragObj.getAttribute('object-type');
            if (objectType === null) return;

            // let newObject = null;
            // 오브젝트 메뉴에서 끌어온경우
            if (
                objectType === 'action' ||
                objectType === 'action_unit' ||
                objectType === 'object' ||
                objectType === 'trigger'
            ) {
                // action_unit 인경우 부모 액션컨테이너의 연결선을 업데이트 한다.
                if (objectType === 'action_unit') {
                    if (dragObj.parentNode) {
                        const actionContainer =
                            (getParentElement(
                                dragObj,
                                'div',
                                'action-container',
                                false,
                            ) as HTMLDivElement) || null;
                        dragObj.parentNode.removeChild(dragObj);
                        if (actionContainer) {
                            setTimeout(() => {
                                logiceditor.drawSvgPathFromObj(actionContainer);
                                dostackLogic.add();
                            }, 0);
                        }
                    }
                } else {
                    logiceditor.removeObjectFromCanvas(dragObj);
                    // setTimeout(() => {
                    dostackLogic.add();
                    // }, 600);
                }
            }

            // if (newObject) {
            //     event.currentTarget.appendChild(newObject);
            // }
        }
        $('.logic-canvas-clear').removeClass('over');
        cancelBubble(event);
    };
    const trash_dragend_handler = (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.remove('over');
    };

    // 일반 object 를 삭제할때 (action_unit 이 아닌경우)
    // const trash_mouseup_handler = (event: React.MouseEvent<HTMLDivElement>) => {
    //     logiceditor.removeActiveObjects();
    //     cancelBubble(event);
    // };

    const incZoom = () => {
        logiceditor.changeLogicCanvasZoom(0.1);
    };
    const decZoom = () => {
        logiceditor.changeLogicCanvasZoom(-0.1);
    };
    const initZoom = () => {
        logiceditor.changeLogicCanvasZoom();
    };
    const setRightMenu = (
        type: 'action' | 'condition',
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        $('.logic-right-header-title').removeClass('active');
        $(event.currentTarget).addClass('active');
        $('.logic-right-body').removeClass('active');
        $(`.logic-right-body.${type}`).addClass('active');
    };

    return (
        <div className="logic-right">
            <div
                className="logic-canvas-zoombtn-container"
                style={{ display: 'none' }}
            >
                <div className="btn inc" onMouseDown={incZoom}></div>
                <div className="btn dec" onMouseDown={decZoom}></div>
                <div className="display" onClick={initZoom}>
                    100%
                </div>
            </div>

            <div
                id="idx_logic_canvas_clear"
                className="logic-canvas-clear"
                onClick={clearCanvas}
                onDragOver={trash_dragover_handler}
                onDragLeave={trash_dragend_handler}
                onDrop={trash_drop_handler}
                // onMouseUp={trash_mouseup_handler}
            ></div>

            <div className="logic-right-header">
                <div
                    className="logic-right-header-title action active"
                    onClick={e => setRightMenu('action', e)}
                >
                    {LANGSET.ROGIC.ACTIONS.TITLE}
                </div>
                <div
                    className="logic-right-header-title condition"
                    onClick={e => setRightMenu('condition', e)}
                >
                    {LANGSET.ROGIC.CONDITIONS.TITLE}
                </div>
            </div>
            <div className="logic-right-body action active">
                {/* <div
                    className="logic-action-container"
                    draggable
                    {...{
                        'object-type': 'm_action',
                    }}
                    id="idx_logic_action_container"
                    onDragStart={dragstart_handler}
                    onDragEnd={dragend_handler}
                >
                    <div className="logic-action-title draggable">
                        Container
                    </div>
                    <div className="logic-action-body"></div>
                </div> */}

                {/* container */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.TITLE} {LANGSET.ROGIC.CONTAINER}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit container"
                            draggable
                            {...{
                                'object-type': 'm_action',
                            }}
                            id="idx_logic_action_container"
                            onDragStart={dragstart_handler}
                            onDragEnd={dragend_handler}
                        >
                            &nbsp;
                        </div>
                    </div>
                </div>

                {/* transform */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.TRANSFORM}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_x"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change x',
                                actions: 'x',
                            }}
                        >
                            x
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_y"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change y',
                                actions: 'y',
                            }}
                        >
                            y
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_width"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change width',
                                actions: 'width',
                            }}
                        >
                            width
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_height"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change height',
                                actions: 'height',
                            }}
                        >
                            height
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_rotate"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change rotate',
                                actions: 'rotate',
                            }}
                        >
                            rotate
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_rotatex"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change rotateX',
                                actions: 'rotateX',
                            }}
                        >
                            rotate - x
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_rotatey"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change rotateY',
                                actions: 'rotateY',
                            }}
                        >
                            rotate - y
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_opacity"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change opacity',
                                actions: 'opacity',
                            }}
                        >
                            opacity
                        </div>
                        <div
                            className="logic-action-unit transform"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_transform_radius"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'transform',
                                'action-name': 'change border radius',
                                actions: 'borderRadius',
                            }}
                        >
                            border - radius
                        </div>
                    </div>
                </div>

                {/* appear */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.APPEAR}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit appear"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_appear_appear"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'appear',
                                'action-name': 'appear',
                                actions: 'appear',
                            }}
                        >
                            appear
                        </div>
                        <div
                            className="logic-action-unit appear"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_appear_disappear"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'appear',
                                'action-name': 'disappear',
                                actions: 'disappear',
                            }}
                        >
                            disappear
                        </div>
                        <div
                            className="logic-action-unit appear"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_appear_toggle"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'appear',
                                'action-name': 'appear-toggle',
                                actions: 'appear-toggle',
                            }}
                        >
                            toggle
                        </div>
                    </div>
                </div>

                {/* fade */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.FADE}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit fade"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_fade_in"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'fade',
                                'action-name': 'fade in',
                                actions: 'in',
                            }}
                        >
                            fade in
                        </div>
                        <div
                            className="logic-action-unit fade"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_fade_out"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'fade',
                                'action-name': 'fade out',
                                actions: 'out',
                            }}
                        >
                            fade out
                        </div>
                    </div>
                </div>

                {/* page move */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.PAGE}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit page_move"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_page_move_prev"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'page_move',
                                'action-name': 'prev page',
                                actions: 'prev',
                            }}
                        >
                            prev page
                        </div>
                        <div
                            className="logic-action-unit page_move"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_page_move_next"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'page_move',
                                'action-name': 'next page',
                                actions: 'next',
                            }}
                        >
                            next page
                        </div>
                        <div
                            className="logic-action-unit page_move"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_page_go_to_page"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'page_move',
                                'action-name': 'go to page',
                                actions: 'go_to_page',
                            }}
                        >
                            go to page
                        </div>
                        <div
                            className="logic-action-unit page_move"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_page_open_link"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'page_move',
                                'action-name': 'open link',
                                actions: 'open_link',
                            }}
                        >
                            open link
                        </div>
                    </div>
                </div>

                {/* anime play */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.ANIMATION}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit anime"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_anime_play"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'anime',
                                'action-name': 'animation play',
                                actions: 'play',
                            }}
                        >
                            play
                        </div>
                        <div
                            className="logic-action-unit anime"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_anime_pause"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'anime',
                                'action-name': 'anime pause',
                                actions: 'pause',
                            }}
                        >
                            pause
                        </div>
                        <div
                            className="logic-action-unit anime"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_anime_resume"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'anime',
                                'action-name': 'anime resume',
                                actions: 'resume',
                            }}
                        >
                            resume
                        </div>
                        <div
                            className="logic-action-unit anime"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_anime_restart"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'anime',
                                'action-name': 'anime restart',
                                actions: 'restart',
                            }}
                        >
                            restart
                        </div>
                    </div>
                </div>
                {/* score */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.SCORE}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit score"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_scoreset"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'score',
                                'action-name': 'score set',
                                actions: 'scoreset',
                            }}
                        >
                            score set
                        </div>
                    </div>
                </div>
                {/* Timer */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.TIMER}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit timer"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_delay"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'timer',
                                'action-name': 'delay',
                                actions: 'delay',
                            }}
                        >
                            delay
                        </div>
                    </div>
                </div>

                {/* audio play */}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.AUDIO}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit audio"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_audio_play"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'audio',
                                'action-name': 'audio play',
                                actions: 'play',
                            }}
                        >
                            play
                        </div>
                        <div
                            className="logic-action-unit audio"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_audio_stop"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'audio',
                                'action-name': 'audio stop',
                                actions: 'stop',
                            }}
                        >
                            stop
                        </div>
                        <div
                            className="logic-action-unit audio"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_audio_stop_all"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'audio',
                                'action-name': 'all stop',
                                actions: 'stop_all',
                            }}
                        >
                            stop all
                        </div>
                    </div>
                </div>
                {/* quiz */}
                {(templateMode === ETemplateType.quiz ||
                    templateMode === ETemplateType.result) && (
                    <div className="logic-action-container">
                        <div className="logic-action-title">
                            {LANGSET.ROGIC.ACTIONS.QUIZ}
                        </div>
                        <div className="logic-action-body">
                            <div
                                className="logic-action-unit quiz"
                                draggable
                                onDragStart={action_unit_dragstart_handler}
                                id="idx_logic_action_quiz_reset_answer"
                                {...{
                                    'object-type': 'm_action_unit',
                                    'action-type': 'quiz',
                                    'action-name': 'reset quiz answer',
                                    actions: 'reset_answer',
                                }}
                            >
                                reset answer
                            </div>
                            <div
                                className="logic-action-unit quiz"
                                draggable
                                onDragStart={action_unit_dragstart_handler}
                                id="idx_logic_action_quiz_save_result"
                                {...{
                                    'object-type': 'm_action_unit',
                                    'action-type': 'quiz',
                                    'action-name': 'save quiz result',
                                    actions: 'save_result',
                                }}
                            >
                                save result
                            </div>
                        </div>
                    </div>
                )}
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.ACTIONS.DATA}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit data-form-store"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_data_form_store"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'data',
                                'action-name': 'form data store',
                                actions: 'form_store',
                            }}
                        >
                            form data store
                        </div>
                        <div
                            className="logic-action-unit data-form-load"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_data_form_load"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'data',
                                'action-name': 'form data load',
                                actions: 'form_load',
                            }}
                        >
                            form data load
                        </div>
                        <div
                            className="logic-action-unit set-data"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_set_data"
                            {...{
                                'object-type': 'm_action_unit',
                                'action-type': 'data',
                                'action-name': 'set data',
                                actions: 'set_data',
                            }}
                        >
                            set data
                        </div>
                    </div>
                </div>
            </div>

            <div className="logic-right-body condition">
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.CONDITIONS.TITLE}{' '}
                        {LANGSET.ROGIC.CONTAINER}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit condition container"
                            draggable
                            {...{
                                'object-type': 'm_condition',
                            }}
                            id="idx_logic_condition_container"
                            onDragStart={dragstart_handler}
                            onDragEnd={dragend_handler}
                        >
                            &nbsp;
                        </div>
                    </div>
                </div>
                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.CONDITIONS.FORM_CHECK}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit condition checked"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_condition_checked"
                            {...{
                                'object-type': 'm_condition_unit',
                                'action-type': 'condition',
                                'action-name': 'checked',
                                actions: 'checked',
                            }}
                        >
                            checked
                        </div>
                        <div
                            className="logic-action-unit condition input_valid"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_condition_input_valid"
                            {...{
                                'object-type': 'm_condition_unit',
                                'action-type': 'condition',
                                'action-name': 'input valid',
                                actions: 'input_valid',
                            }}
                        >
                            input valid
                        </div>
                    </div>
                </div>
                {(templateMode === ETemplateType.quiz ||
                    templateMode === ETemplateType.result) && (
                    <div className="logic-action-container">
                        <div className="logic-action-title">
                            {LANGSET.ROGIC.CONDITIONS.QUIZ}
                        </div>
                        <div className="logic-action-body">
                            <div
                                className="logic-action-unit condition quizinputcomplete"
                                draggable
                                onDragStart={action_unit_dragstart_handler}
                                id="idx_logic_action_condition_quizinputcomplete"
                                {...{
                                    'object-type': 'm_condition_unit',
                                    'action-type': 'condition',
                                    'action-name': 'quiz input complete',
                                    actions: 'quizinputcomplete',
                                }}
                            >
                                input complete
                            </div>
                            <div
                                className="logic-action-unit condition quizcorrectcnt"
                                draggable
                                onDragStart={action_unit_dragstart_handler}
                                id="idx_logic_action_condition_quizcorrectcnt"
                                {...{
                                    'object-type': 'm_condition_unit',
                                    'action-type': 'condition',
                                    'action-name': 'quiz correct count',
                                    actions: 'quizcorrectcnt',
                                }}
                            >
                                correct count
                            </div>
                            <div
                                className="logic-action-unit condition correct_answer"
                                draggable
                                onDragStart={action_unit_dragstart_handler}
                                id="idx_logic_action_condition_correct_answer"
                                {...{
                                    'object-type': 'm_condition_unit',
                                    'action-type': 'condition',
                                    'action-name': 'quiz correct answer',
                                    actions: 'correct_answer',
                                }}
                            >
                                correct answer
                            </div>
                        </div>
                    </div>
                )}

                <div className="logic-action-container">
                    <div className="logic-action-title">
                        {LANGSET.ROGIC.CONDITIONS.MISCELLANEOUS}
                    </div>
                    <div className="logic-action-body">
                        <div
                            className="logic-action-unit condition score"
                            draggable
                            onDragStart={action_unit_dragstart_handler}
                            id="idx_logic_action_condition_score"
                            {...{
                                'object-type': 'm_condition_unit',
                                'action-type': 'condition',
                                'action-name': 'score',
                                actions: 'score',
                            }}
                        >
                            score
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ActionList;

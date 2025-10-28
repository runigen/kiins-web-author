import React, { Suspense, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { EpreviewPlayStatus, ETemplateType } from '../../const/types';
import { interactionTriggerList, quizTriggerList } from '../../const/basicData';
import $ from 'jquery';
import { allEventCancel } from '../../util/common';
import * as preview from '../../util/preview';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import * as logiceditor from '../../util/logiceditor';
import * as dostackLogic from '../../util/dostackLogic';

const TriggerList = observer(() => {
    const objectList = workInfo.getObjectList();
    const templateMode = docData.getTemplateMode();

    useEffect(() => {
        console.log('TriggerList useEffect');
        addWindowEvent();
        triggerContainerSizeCheck();
        return () => {
            removeWindowEvent();
        };
    }, []);

    const addWindowEvent = () => {
        window.addEventListener('resize', triggerContainerSizeCheck);
    };
    const removeWindowEvent = () => {
        window.removeEventListener('resize', triggerContainerSizeCheck);
    };

    const triggerContainerSizeCheck = () => {
        console.log('triggerContainerSizeCheck');
        const scrollLeft = $('.trigger-unit-list').scrollLeft() || 0;
        if (scrollLeft > 0) {
            $('.trigger-unit-list-move.left').addClass('active');
        } else {
            $('.trigger-unit-list-move.left').removeClass('active');
            $('.trigger-unit-list').scrollLeft(0);
        }
        const scrollWidth = $('.trigger-unit-list')[0].scrollWidth || 0;
        const clientWidth = $('.trigger-unit-list')[0].clientWidth || 0;
        if (scrollLeft + clientWidth < scrollWidth) {
            $('.trigger-unit-list-move.right').addClass('active');
        } else {
            $('.trigger-unit-list-move.right').removeClass('active');
        }
    };

    const dragstart_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('dragstart_handler');
        event.dataTransfer.dropEffect = 'copy';
        event.dataTransfer.setData('text/plain', event.currentTarget.id);
    };
    // const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    //     console.log('onDrop');
    // };
    // const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    //     console.log('onDragEnd');
    // };
    const save = (event: React.MouseEvent<HTMLDivElement>) => {
        logiceditor.saveLogicContent();
    };

    // const undo = (event: React.MouseEvent<HTMLDivElement>) => {
    //     if (event.currentTarget.classList.contains('disabled')) {
    //         return;
    //     }
    //     dostackLogic.undo();
    // };
    // const redo = (event: React.MouseEvent<HTMLDivElement>) => {
    //     if (event.currentTarget.classList.contains('disabled')) {
    //         return;
    //     }
    //     dostackLogic.redo();
    // };
    const addInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
        logiceditor.addInteraction();
    };

    const moveLeft = () => {
        $('.trigger-unit-list').animate(
            {
                scrollLeft: '-=380px',
            },
            'fast',
            () => {
                triggerContainerSizeCheck();
            },
        );
    };
    const moveRight = () => {
        $('.trigger-unit-list').animate(
            {
                scrollLeft: '+=380px',
            },
            'fast',
            () => {
                triggerContainerSizeCheck();
            },
        );
    };

    return (
        <div className="trigger-list">
            {/* <div
                className="btn-undo-redo undo disabled"
                aria-label="실행취소"
                onClick={undo}
                title="실행취소"
            ></div>
            <div
                className="btn-undo-redo redo disabled"
                aria-label="재실행"
                onClick={redo}
                title="재실행"
            ></div> */}

            <div className="interaction-unit" onClick={addInteraction}>
                interaction
            </div>

            <div
                className="trigger-unit-list-move left"
                onClick={moveLeft}
            ></div>
            <div className="trigger-unit-list" onClick={addInteraction}>
                {interactionTriggerList.map((trigger, index) => {
                    return (
                        <div
                            className="trigger-unit"
                            key={index}
                            {...{
                                'object-type': 'm_trigger',
                                'trigger-name': trigger.triggerName,
                                'trigger-val': trigger.triggerVal,
                            }}
                            id={`idx_logic_trigger_${trigger.triggerVal}`}
                            draggable
                            onDragStart={dragstart_handler}
                            title={trigger.triggerName}
                        >
                            {trigger.triggerName}
                        </div>
                    );
                })}
                {templateMode === ETemplateType.quiz &&
                    quizTriggerList.map((trigger, index) => {
                        return (
                            <div
                                className="trigger-unit quiz"
                                key={index}
                                {...{
                                    'object-type': 'm_trigger',
                                    'trigger-name': trigger.triggerName,
                                    'trigger-val': trigger.triggerVal,
                                }}
                                id={`idx_logic_trigger_${trigger.triggerVal}`}
                                draggable
                                onDragStart={dragstart_handler}
                            >
                                {trigger.triggerName}
                            </div>
                        );
                    })}
            </div>
            <div
                className="trigger-unit-list-move right"
                onClick={moveRight}
            ></div>
        </div>
    );
});

export default TriggerList;

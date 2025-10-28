import React, { Suspense, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import {
    EpreviewPlayStatus,
    EResouce_Filter_List_Type,
} from '../../const/types';
import $ from 'jquery';
import { cancelBubble } from '../../util/common';
import * as preview from '../../util/preview';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';
import ObjectFilterList, {
    toggleShowResourcesFilter,
} from '../../components/popup/ObjectFilterList';

const ObjectList = observer(() => {
    const objectList = workInfo.getObjectList();
    const pageObj = docData.getPageObject();
    // const currPage = docData.getCurrPage();
    // const [bShowResourceFilter, setBShowResourceFilter] = useState(false);
    const [currFilterList, setCurrFilterList] = useState<
        EResouce_Filter_List_Type[]
    >([]);

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

    const setResourceFilterList = (filterList: EResouce_Filter_List_Type[]) => {
        console.log('setResourceFilterList filterList : ', filterList);
        setCurrFilterList(filterList);
    };

    return (
        <div className="logic-left">
            {/* <div className="logic-left-header">objects</div> */}
            <div className="logic-left-body">
                <div className="logic-left-body-header">
                    <button
                        className="btn-filter"
                        onClick={e =>
                            toggleShowResourcesFilter(e.currentTarget)
                        }
                        onMouseDown={cancelBubble}
                        title="리소스 타입으로 분류하기"
                    >
                        {/* {bShowResourceFilter === true && ( */}
                        <ObjectFilterList
                            filterInfo={{
                                filterType: 'logic-object',
                                setResourceFilterListCB: setResourceFilterList,
                            }}
                        />
                        {/* )} */}
                    </button>
                </div>

                <div className="logic-left-body-list">
                    {pageObj && (
                        <div
                            className={
                                'logic-object-unit ' +
                                $(pageObj).attr('object-type')
                            }
                            {...{
                                'object-id': pageObj.id,
                                'object-type': 'm_object',
                                'object-name': $(pageObj).attr('page-name'),
                                title: $(pageObj).attr('page-name'),
                            }}
                            id={`idx_logic_object_${pageObj.id}`}
                            draggable
                            onDragStart={dragstart_handler}
                            title={$(pageObj).attr('page-name')}
                        >
                            {/* {'Page-' + (currPage > 9 ? currPage : '0' + currPage)} */}
                            {$(pageObj).attr('page-name')}
                        </div>
                    )}

                    <hr />

                    {objectList.map((object, index) => {
                        return (
                            <div
                                className={
                                    'logic-object-unit ' +
                                    $(object).attr('object-type') +
                                    ($(object).hasClass('check-box')
                                        ? ' check-box'
                                        : '') +
                                    ($(object).hasClass('input-box')
                                        ? ' input-box'
                                        : '')
                                }
                                key={index}
                                {...{
                                    'object-id': object.id,
                                    'object-type': 'm_object',
                                    'object-name': object.name,
                                    title: object.name,
                                }}
                                id={`idx_logic_object_${object.id}`}
                                draggable
                                onDragStart={dragstart_handler}
                                title={object.name}
                                style={{
                                    display: currFilterList.includes(
                                        $(object).attr('object-type') ===
                                            'square'
                                            ? EResouce_Filter_List_Type.shape
                                            : ($(object).attr(
                                                  'object-type',
                                              ) as EResouce_Filter_List_Type),
                                    )
                                        ? 'block'
                                        : 'none',
                                }}
                            >
                                {object.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default ObjectList;

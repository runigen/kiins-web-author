import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import * as objects from '../../../util/objects';
import { EorderObjectListType } from '../../../const/types';
import { getBodyMiddleWorkspace } from '../../../util/pages';
import { cancelBubble } from '../../../util/common';

const BtnOrder = observer(() => {
    const { workInfo, userInfo } = store;
    const LANGSET = userInfo.getLangSet();
    const [showPositionMenu, setPositionMenu] = useState(false);
    const currObject = workInfo.getObject();
    const [orderTypeList, setOrderTypeList] = useState<any[]>([]);
    const [currOrderType, setCurrOrderType] = useState<EorderObjectListType>(
        EorderObjectListType.front,
    );

    useEffect(() => {
        setOrderTypeList(Object.values(EorderObjectListType));
    }, []);

    const orderObject = (
        orderType: EorderObjectListType,
        e: React.MouseEvent<HTMLLIElement>,
    ) => {
        const targetObject = workInfo.getObject();
        if (targetObject) {
            objects.orderObject(targetObject, orderType);
            // document
            //     .querySelector('.nav-position.hasLayer')
            //     ?.classList.add(String(orderType));

            // const orderList = Object.values(EorderObjectListType);
            // for (let i = 0; i < orderList.length; i++) {
            //     if (orderList[i] !== orderType) {
            //         document
            //             .querySelector('.nav-position.hasLayer')
            //             ?.classList.remove(String(orderList[i]));
            //     }
            // }
            setCurrOrderType(orderType);
        }
        hideAlignSubList();
        cancelBubble(e);
    };

    const showAlignMenu = (e: React.MouseEvent<HTMLLIElement>) => {
        if (e.currentTarget.classList.contains('disabled')) return;

        // const subListObj = e.currentTarget.firstChild as HTMLElement;
        if (e.currentTarget.classList.contains('active')) {
            hideAlignSubList();
        } else {
            showAlignSubList();
        }
        cancelBubble(e);
    };
    const showAlignSubList = () => {
        document.querySelector('.nav-position')?.classList.add('active');
        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.addEventListener('mousedown', hideAlignSubList);
        }
    };
    const hideAlignSubList = () => {
        document.querySelector('.nav-position')?.classList.remove('active');
        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.removeEventListener('mousedown', hideAlignSubList);
        }
    };

    return (
        <>
            <li
                className={`nav-position hasLayer ${currOrderType} ${
                    currObject ? '' : 'disabled'
                }`}
                aria-label="포지션"
                onClick={showAlignMenu}
                title={LANGSET.HEAD.POSITION.title}
            >
                <div className="layer_menu layer_menu_position">
                    <ul>
                        {orderTypeList.map(
                            (orderType: EorderObjectListType, index) => {
                                return (
                                    <li
                                        key={orderType}
                                        className={orderType}
                                        aria-label={orderType}
                                        onClick={e => orderObject(orderType, e)}
                                        title={LANGSET.HEAD.POSITION[orderType]}
                                    ></li>
                                );
                            },
                        )}
                    </ul>
                </div>
            </li>
        </>
    );
});

export default BtnOrder;

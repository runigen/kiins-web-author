import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import * as objects from '../../../util/objects';
import { EalignObjectListType, EundoStackAddType } from '../../../const/types';
import { getBodyMiddleWorkspace } from '../../../util/pages';
import { cancelBubble } from '../../../util/common';
import * as dostack from '../../../util/dostack';

const BtnAlign = observer(() => {
    const { workInfo, userInfo } = store;
    const LANGSET = userInfo.getLangSet();
    // const [showPositionMenu, setPositionMenu] = useState(false);
    const currObjectGroup = workInfo.getObjectGroup();
    const [alignTypeList, setAlignTypeList] = useState<any[]>([]);
    const [currAlignType, setCurrAlignType] = useState<EalignObjectListType>(
        EalignObjectListType.top,
    );

    useEffect(() => {
        setAlignTypeList(Object.values(EalignObjectListType));
    }, []);

    // const orderObject = (
    //     alignType: EalignObjectListType,
    //     e: React.MouseEvent<HTMLLIElement>,
    // ) => {
    //     const targetObject = workInfo.getObject();
    //     if (targetObject) {
    //         objects.alignObject(alignType);
    //         // document
    //         //     .querySelector('.nav-position.hasLayer')
    //         //     ?.classList.add(String(orderType));

    //         // const orderList = Object.values(EorderObjectListType);
    //         // for (let i = 0; i < orderList.length; i++) {
    //         //     if (orderList[i] !== orderType) {
    //         //         document
    //         //             .querySelector('.nav-position.hasLayer')
    //         //             ?.classList.remove(String(orderList[i]));
    //         //     }
    //         // }
    //         setCurrAlignType(alignType);
    //     }
    //     hideAlignSubList();
    //     cancelBubble(e);
    // };

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
        document.querySelector('.nav-align')?.classList.add('active');
        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.addEventListener('mousedown', hideAlignSubList);
        }
    };
    const hideAlignSubList = () => {
        document.querySelector('.nav-align')?.classList.remove('active');
        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.removeEventListener('mousedown', hideAlignSubList);
        }
    };

    const alignObjectGroup = (
        alignType: EalignObjectListType,
        e: React.MouseEvent<HTMLLIElement>,
    ) => {
        if (e.currentTarget.classList.contains('disabled')) return;
        const targetObjectGroup = workInfo.getObjectGroup();
        if (targetObjectGroup.length > 0) {
            objects.alignSelectedObject(alignType);
            setCurrAlignType(alignType);
            dostack.addUndoStack('', EundoStackAddType.all);
        }
        hideAlignSubList();
        cancelBubble(e);
    };

    return (
        <>
            <li
                // className={`nav-align hasLayer  ${currAlignType} ${
                //     currObjectGroup.length > 1 ? '' : 'disabled'
                // }`}
                className={`nav-align hasLayer  ${currAlignType} ${
                    currObjectGroup.length > 0 ? '' : 'disabled'
                }`}
                aria-label="정렬"
                onClick={showAlignMenu}
                title={LANGSET.HEAD.ALIGN.title}
            >
                <div className="layer_menu layer_menu_align">
                    <ul>
                        {alignTypeList.map(
                            (alignType: EalignObjectListType) => {
                                return (
                                    <li
                                        key={alignType}
                                        className={`${alignType} ${
                                            currObjectGroup.length < 3 &&
                                            (alignType ===
                                                EalignObjectListType.hsplit ||
                                                alignType ===
                                                    EalignObjectListType.vsplit)
                                                ? 'disabled'
                                                : ''
                                        }`}
                                        aria-label={`정렬 ${alignType}`}
                                        onClick={e =>
                                            alignObjectGroup(alignType, e)
                                        }
                                        title={LANGSET.HEAD.ALIGN[alignType]}
                                    ></li>
                                );
                            },
                        )}
                        ;
                    </ul>
                </div>
            </li>
        </>
    );
});

export default BtnAlign;

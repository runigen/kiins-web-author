import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import { EundoStackAddType, EkeyName } from '../../../../const/types';
import { getKeyCode } from '../../../../event/KeyEvent';
import { cancelBubble } from '../../../../util/common';
import * as pages from '../../../../util/pages';
import * as objects from '../../../../util/objects';
import * as dostack from '../../../../util/dostack';

// let gTargetObject: HTMLElement | null = null;
const Informations = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const currObject: any = workInfo.getObject();
    const updateKey: number = workInfo.getUpdateKey();
    const docNo: string = docData.getDocNo();
    // const currPage: number = docData.getCurrPage();
    const LANGSET = userInfo.getLangSet();
    const [objName, setObjName] = useState('');

    useEffect(() => {
        // gTargetObject = currObject;
        if (currObject) {
            const objName: string = objects.getObjectName(currObject);
            setObjName(objName);
        } else {
            if (docNo) {
                const pgName: string = pages.getPageName();
                setObjName(pgName);
                // setObjName(
                //     'Page-' + (currPage > 9 ? currPage : '0' + currPage),
                // );
            }
        }
    }, [currObject, updateKey, docNo]);

    const changeObjectName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const objName: string = event.currentTarget.value;
        setObjName(objName);
    };
    const applyObjectName = (
        targetObject: any,
        // event:
        //     | React.FocusEvent<HTMLInputElement>
        //     | React.KeyboardEvent<HTMLInputElement>,
    ) => {
        // const objName: string = event.currentTarget.value;
        if (targetObject) {
            const objName = objects.getObjectName(targetObject);
            setObjName(objName);
            //            objects.setObjectName(targetObject, objName);
        } else {
            const objName = pages.getPageName();
            setObjName(objName);
            //          pages.setPageName(objName);
        }
        //      dostack.addUndoStack('', EundoStackAddType.all);
        // showToastMessage('이름이 변경되었습니다.', 1);
    };
    const applyObjectNameByEnter = (
        targetObject: any,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        const keyCode = getKeyCode(event);
        if (keyCode === EkeyName.ENTER) {
            //            event.currentTarget.blur();
            const objName: string = event.currentTarget.value;
            if (targetObject) {
                objects.setObjectName(targetObject, objName);
            } else {
                pages.setPageName(objName);
            }

            // 타임라인에 바로 적용 되도록 하기 위해 추가
            workInfo.setModifiedKeyframe();

            dostack.addUndoStack('', EundoStackAddType.all);
            event.currentTarget.blur();
            // showToastMessage('이름이 변경되었습니다.', 1);
        }
        cancelBubble(event);
    };
    const focusForm = (event: React.FocusEvent<HTMLInputElement>) => {
        event.currentTarget.select();
    };

    return (
        <article className="box-list">
            <div className="list-content">
                <div className="content-default">
                    <label htmlFor="idx_object_name">
                        {LANGSET.PROPERTY.NAME}
                    </label>
                    <input
                        type="text"
                        autoComplete="off"
                        className="frm-name information"
                        name=""
                        value={objName}
                        id="idx_object_name"
                        onChange={changeObjectName}
                        onBlur={() => applyObjectName(currObject)}
                        onKeyDown={e => applyObjectNameByEnter(currObject, e)}
                        // disabled={currObject ? false : true}
                        onFocus={focusForm}
                    />
                </div>
            </div>
        </article>
    );
});

export default Informations;

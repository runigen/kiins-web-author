import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import $ from 'jquery';
// import KeyEvent.keyName, {getKeyCode} from '../../../const/keycode';
// import { EkeyName, EworkStatus } from '../../../const/types';
// import * as KeyEvent from '../../../event/KeyEvent';
// import * as CommonEvent from '../../../event/CommonEvent';
// import * as SquareEvent from '../../../event/SquareEvent';
import * as WorkSpaceEvent from '../../../event/WorkSpaceEvent';
// import { hideDropDown, hideDialog } from '../../../util/dialog';
// import { allEventCancel, cancelBubble } from '../../../util/common';
import { checkFolderObjectSelected } from '../../../util/objects';
import Canvas from './Canvas';

const Workspace = observer(() => {
    const { workInfo } = store;
    const objectGroup = workInfo.getObjectGroup();
    // const currObject = workInfo.getObject();
    const logicMode = workInfo.getLogicMode();

    useEffect(() => {
        // console.log('objectGroup : ', objectGroup.length, objectGroup);

        // 선택된 오브젝트가 2개이상인경우 rotate 버튼 제거
        if (objectGroup.length > 1) {
            $('.object-selector .object-indicator.p9').hide();
        } else if (objectGroup.length === 1) {
            $('.object-selector .object-indicator.p9').css('display', '');
        }
        const bSelected = checkFolderObjectSelected();
        workInfo.setFolderSelected(bSelected);
    }, [objectGroup]);

    useEffect(() => {
        WorkSpaceEvent.addWorkSpaceEvent();

        return () => {
            WorkSpaceEvent.removeWorkSpaceEvent();
        };
    }, []);

    return (
        <div
            className={`workspace ${logicMode === true ? 'hide' : ''}`}
            id="idx_workspace"
        >
            <div
                className="body-middle-workspace"
                id="idx_body_middle_workspace"
            >
                <Canvas />
            </div>
        </div>
    );
});

export default Workspace;

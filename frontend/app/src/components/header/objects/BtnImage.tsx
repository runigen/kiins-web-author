import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import * as FileEvent from '../../../event/FileEvent';
import * as SquareEvent from '../../../event/SquareEvent';

const BtnImage = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const LANGSET = userInfo.getLangSet();

    const attachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            FileEvent.executeUpload(event);
        } else {
            console.log('eeeeeeeeeee');
        }
        event.target.value = '';
    };

    return (
        <>
            <li
                className="nav-imgfile"
                aria-label="이미지"
                title={LANGSET.HEAD.IMAGE}
            >
                <input
                    type="file"
                    multiple
                    accept="image/gif, image/jpeg, image/png"
                    onChange={e => attachFile(e)}
                    onMouseDown={SquareEvent.unselectSquareObjcts}
                ></input>
            </li>
        </>
    );
});

export default BtnImage;

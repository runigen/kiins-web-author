import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import * as FileEvent from '../../../event/FileEvent';
import * as SquareEvent from '../../../event/SquareEvent';

const BtnAudio = () => {
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
                className="nav-audiofile"
                aria-label="오디오"
                title={LANGSET.HEAD.AUDIO}
            >
                <input
                    type="file"
                    multiple
                    accept="audio/mp3, audio/wav, audio/ogg"
                    onChange={e => attachFile(e)}
                    onMouseDown={SquareEvent.unselectSquareObjcts}
                ></input>
            </li>
        </>
    );
};

export default BtnAudio;

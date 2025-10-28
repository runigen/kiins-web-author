import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import * as FileEvent from '../../../event/FileEvent';
import { unselectObjects } from '../../../event/CommonEvent';
import {
    selectSquareObjct,
    addSelectorEvent,
} from '../../../event/SquareEvent';
import * as objects from '../../../util/objects';
import { getPageSize } from '../../../util/pages';
import { EobjectType } from '../../../const/types';
import { showToastMessage } from '../../../util/dialog';

const BtnYoutube = observer(() => {
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

    const insertYoutubeContainer = () => {
        // showToastMessage('준비중입니다.');
        // return;

        if (workInfo.getObject()) {
            unselectObjects();
        }

        // youtube object 생성
        const youtubeObject = objects.createNewObject(
            EobjectType.youtube,
            'youtube',
        );

        // 화면의 중앙에 youtube object를 위치시킨다.
        const pageSizeInfo = getPageSize();
        youtubeObject.style.left = `${
            (pageSizeInfo.width - youtubeObject.offsetWidth) / 2
        }px`;
        youtubeObject.style.top = `${
            (pageSizeInfo.height - youtubeObject.offsetHeight) / 2
        }px`;

        // 생성한 오브젝트 선택
        selectSquareObjct(youtubeObject);
        addSelectorEvent();
    };

    return (
        <>
            <li
                className={`nav-youtube`}
                aria-label={LANGSET.HEAD.YOUTUBE}
                title={LANGSET.HEAD.YOUTUBE}
                onClick={insertYoutubeContainer}
            ></li>
        </>
    );
});

export default BtnYoutube;

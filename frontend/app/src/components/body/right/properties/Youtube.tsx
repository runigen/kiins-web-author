import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import { EobjectType, EkeyName } from '../../../../const/types';
// import $ from 'jquery';
// import {
//     allEventCancel,
//     getUniqId,
//     getInteractionIdHead,
//     getInteractionsName,
// } from '../../../../util/common';
import { showToastMessage } from '../../../../util/dialog';
import * as objects from '../../../../util/objects';
import * as common from '../../../../util/common';
import { getKeyCode } from '../../../../event/KeyEvent';

const Youtube = observer(() => {
    const { workInfo } = store;
    const [objectType, setObjectType] = useState<string>('');
    const [resourceUrl, setResourceUrl] = useState<string>('');
    const currObject: HTMLDivElement | null = workInfo.getObject();
    const objectGroup = workInfo.getObjectGroup();
    // const updateKey = workInfo.getUpdateKey();
    // 오디오 + 오브젝트 선택하여 한번 처리로 클릭+오디오재생 인터렉션 추가하기 위한 변수
    const [bAutoplay, setBAutoplay] = useState<boolean>(false);
    const [bAudioMute, setBAudioMute] = useState<boolean>(false);

    useEffect(() => {
        if (currObject === null) {
            return;
        }
        const url = currObject.getAttribute('resource-url');
        if (url !== null) {
            setResourceUrl(url);
        }
        const autoPlay = currObject.getAttribute('autoplay');
        if (autoPlay !== null && autoPlay === 'true') {
            // $('#youtube-playback-click').prop('checked', true);
            setBAutoplay(true);
        } else {
            // $('#youtube-playback-auto').prop('checked', true);
            setBAutoplay(false);
        }

        const audioMute = currObject.getAttribute('mute');
        if (audioMute !== null && audioMute === 'true') {
            setBAudioMute(true);
        } else {
            setBAudioMute(false);
        }
    }, [currObject]);

    useEffect(() => {
        if (objectGroup.length !== 1) {
            setObjectType(EobjectType.page);
        }
        const type = objects.getObjectType(objectGroup[0]);
        setObjectType(type);
    }, [objectGroup]);

    const changeUrl = (
        targetObject: any,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const url = event.currentTarget.value.trim();
        setResourceUrl(url);
        common.cancelBubble(event);
    };

    const changePlayback = (
        targetObject: any,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        console.log('changePlayback changed');

        const radioObj = e.currentTarget;
        console.log('radioObj id: ', radioObj.id);

        if (radioObj.id === 'youtube-playback-auto') {
            targetObject.setAttribute('autoplay', 'true');
            setBAutoplay(true);
        } else {
            targetObject.removeAttribute('autoplay');
            setBAutoplay(false);
        }
    };

    const changeAudioMute = (
        targetObject: any,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const checkObj = e.currentTarget;
        console.log('checkObj id: ', checkObj.id);
        if (checkObj.checked === true) {
            targetObject.setAttribute('mute', 'true');
            setBAudioMute(true);
        } else {
            targetObject.removeAttribute('mute');
            setBAudioMute(false);
        }
    };

    const setKeydownEvent = (
        targetObject: any,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        const keyCode = getKeyCode(e);
        if (keyCode === EkeyName.ENTER) {
            const url = e.currentTarget.value.trim();
            setResourceUrl(url);
            const result = objects.setYoutubeUrl(targetObject, url);
            if (result === false) {
                showToastMessage('유효하지 않은 URL입니다.');
                setResourceUrl('');
            } else {
                setResourceUrl(url);
            }
            e.currentTarget.blur();
        }
        common.cancelBubble(e);
    };

    if (objectType !== EobjectType.youtube) {
        return <></>;
    }

    return (
        <>
            <article className="box-list">
                {/* <div className="list-title">youtube</div> */}
                <div className="list-content">
                    <div className="content-file youtube">
                        <div className="inputFile">
                            <span className="label">url</span>
                            <input
                                type="text"
                                className="frm-name"
                                name=""
                                id="idx_object_audio_src"
                                value={resourceUrl}
                                autoComplete="off"
                                onChange={e => changeUrl(currObject, e)}
                                onKeyDown={e => setKeydownEvent(currObject, e)}
                                onFocus={e => e.currentTarget.select()}
                            />
                        </div>
                    </div>
                </div>
            </article>
            {resourceUrl !== '' && (
                <>
                    <article className="box-list">
                        <div className="list-title">playback</div>
                        <div className="list-content youtube">
                            <input
                                type="radio"
                                name="youtube-playback"
                                id="youtube-playback-click"
                                onChange={e => changePlayback(currObject, e)}
                                checked={!bAutoplay}
                            />
                            <label htmlFor="youtube-playback-click">
                                click
                            </label>
                        </div>
                        <div className="list-content youtube">
                            <input
                                type="radio"
                                name="youtube-playback"
                                id="youtube-playback-auto"
                                onChange={e => changePlayback(currObject, e)}
                                checked={bAutoplay}
                            />
                            <label htmlFor="youtube-playback-auto">auto</label>
                        </div>
                    </article>
                    <article className="box-list">
                        <div className="list-content">
                            <div className="content-file youtube">
                                <div className="inputFile">
                                    <span className="label mute">
                                        audio mute
                                    </span>
                                    <input
                                        type="checkbox"
                                        id="idx_object_audio_mute"
                                        onChange={e =>
                                            changeAudioMute(currObject, e)
                                        }
                                        checked={bAudioMute}
                                    ></input>
                                    <label htmlFor="idx_object_audio_mute"></label>
                                </div>
                            </div>
                        </div>
                    </article>
                </>
            )}
        </>
    );
});

export default Youtube;

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import { EimageAddType, EobjectType } from '../../../../const/types';
import $ from 'jquery';
import {
    allEventCancel,
    getUniqId,
    getInteractionIdHead,
} from '../../../../util/common';
import * as FileEvent from '../../../../event/FileEvent';
import * as SquareEvent from '../../../../event/SquareEvent';
import { showToastMessage } from '../../../../util/dialog';
import { addInteractions } from '../../../../util/interactions';

const Audio = observer(() => {
    const { workInfo } = store;
    // const [objectType, setObjectType] = useState<string>('');
    const [resourceUrl, setObjectResourceUrl] = useState<string>('');
    const currObject: HTMLDivElement | null = workInfo.getObject();
    const objectGroup = workInfo.getObjectGroup();
    const updateKey = workInfo.getUpdateKey();

    const [isAudio, setIsAudio] = useState<boolean>(false);
    const [audioName, setAudioName] = useState<string>('');

    // 오디오 + 오브젝트 선택하여 한번 처리로 클릭+오디오재생 인터렉션 추가하기 위한 변수
    const [availInteraction, setAvailInteraction] = useState<boolean>(false);

    useEffect(() => {
        updateObjectAudioInfoForm(currObject);
        stopAudio();
    }, [currObject, updateKey]);

    useEffect(() => {
        let audioCnt = 0;
        let objectCnt = 0;
        let currAudioName = '';
        objectGroup.forEach(item => {
            const objType: string | null = item.getAttribute('object-type');
            if (objType === EobjectType.audio) {
                audioCnt++;
                currAudioName = item.getAttribute('object-name') || '';
            } else {
                objectCnt++;
            }
        });

        // 오디오 설정을 열 것인지 (오디오파일이 1개만 선택되어야 열 수 있다.)
        if (audioCnt === 1) {
            setIsAudio(true);
            setAudioName(currAudioName);
        } else {
            setIsAudio(false);
            setAudioName('');
        }

        // 오디오+오브젝트 인터렉션 설정을 열 것인지 (오디오1+오브젝트1개이상 선택되어야 열 수 있다.)
        if (objectGroup.length < 2) {
            setAvailInteraction(false);
        } else {
            if (audioCnt === 1 && objectCnt >= 1) {
                setAvailInteraction(true);
            } else {
                setAvailInteraction(false);
            }
        }
    }, [objectGroup]);

    const updateObjectAudioInfoForm = (targetObject: HTMLDivElement | null) => {
        // if (targetObject !== null) {
        //     const objType: string | null =
        //         targetObject.getAttribute('object-type');
        //     setObjectType(objType ? objType : '');
        //     const resourceUrl = targetObject.getAttribute('resource-url') || '';
        //     setObjectResourceUrl(resourceUrl);
        //     const resourceFileName = resourceUrl.split('/').pop() || '';
        //     $('#idx_object_audio_src').val(resourceFileName);
        // } else {
        //     setObjectType('');
        //     setObjectResourceUrl('');
        //     $('#idx_object_audio_src').val('');
        // }
        if (targetObject !== null) {
            const objType: string | null =
                targetObject.getAttribute('object-type');
            if (objType === EobjectType.audio) {
                const resourceUrl =
                    targetObject.getAttribute('resource-url') || '';
                setObjectResourceUrl(resourceUrl);
                const currObjectName =
                    targetObject.getAttribute('object-name') || '';
                setAudioName(currObjectName);
            }
        } else {
            setObjectResourceUrl('');
            setAudioName('');
        }
    };

    const attachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            FileEvent.executeUpload(event, EimageAddType.replace);
        } else {
            console.log('eeeeeeeeeee');
        }
        event.target.value = '';
    };

    const downKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
        allEventCancel(e);
    };

    // if(objectType !== 'image') {
    //     return (
    //         <></>
    //     );
    // }

    const stopAudio = () => {
        const audioPlayer = document.getElementById(
            'idx_prop_audio_resource_player',
        ) as HTMLAudioElement;
        if (audioPlayer === null) return;
        audioPlayer.pause();

        //prop-audio-resource-player
        const controlBox = document.querySelector(
            '.prop-audio-resource-player',
        );
        if (controlBox === null) return;
        if (controlBox.classList.contains('playing')) {
            audioPlayer.pause();
            controlBox.classList.remove('playing');
            controlBox.classList.add('paused');
        }
    };

    const playAudio = (
        url: string,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        const audioPlayer = document.getElementById(
            'idx_prop_audio_resource_player',
        ) as HTMLAudioElement;
        if (audioPlayer === null) return;

        $('.prop-audio-resource-player-progress').css('transition', ``);

        const controlBox = event.currentTarget;
        if (controlBox === null) return;

        if (controlBox.classList.contains('playing')) {
            audioPlayer.pause();
            controlBox.classList.remove('playing');
            controlBox.classList.add('paused');
        } else {
            $('.prop-audio-resource-player').removeClass('playing');
            $('.prop-audio-resource-player').addClass('paused');

            audioPlayer.src = url;
            audioPlayer.play().then(() => {
                const duration = Math.floor(audioPlayer.duration * 100) / 100;
                console.log('duration', duration);
                $('.prop-audio-resource-player-progress').css(
                    'transition',
                    `all ${duration}s linear`,
                );
                controlBox.classList.remove('paused');
                controlBox.classList.add('playing');
            });
            audioPlayer.addEventListener('ended', () => {
                $('.prop-audio-resource-player-progress').css('transition', ``);
                controlBox.classList.remove('playing');
                controlBox.classList.add('paused');
            });

            //
        }
    };

    const setClickInteraction = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectObjectList = workInfo.getObjectGroup();
        if (selectObjectList.length < 2) {
            showToastMessage(
                '오디오와 인터렉션을 설정할 오브젝트를 2개 이상 선택해주세요.',
            );
            return;
        }
        let audioObj: any = null;
        const otherObjectList: any[] = [];
        selectObjectList.forEach(item => {
            const objType: string | null = item.getAttribute('object-type');
            if (objType === EobjectType.audio) {
                audioObj = item;
            } else {
                otherObjectList.push(item);
            }
        });
        if (audioObj === null || otherObjectList.length === 0) {
            showToastMessage(
                '오디오와 인터렉션을 설정할 오브젝트를 2개 이상 선택해주세요.',
            );
            return;
        }

        const obj = e.currentTarget;
        $(obj).hide();

        const audioName = audioObj.getAttribute('object-name') || '';
        for (const item of otherObjectList) {
            const interactionId = getUniqId(getInteractionIdHead());
            //const interactionName = getInteractionsName();
            const interactionName = `${audioName} : play`;
            addInteractions(item, {
                id: interactionId,
                name: interactionName,
                trigger: 'click',
                targetId: [audioObj.id],
                action: 'play',
            });
        }

        // setTimeout(() => {
        //     $(obj).show();
        //     showToastMessage('인터렉션을 설정하였습니다.');
        // }, 500);
    };

    return (
        <article
            className="box-list"
            style={{ display: isAudio === true ? 'block' : 'none' }}
        >
            <div className="list-title">audio</div>
            <div className="list-content">
                <div className="content-file audio">
                    <div className="inputFile">
                        <span className="label">file</span>
                        <input
                            type="file"
                            id="audio-obj-input-file"
                            accept="audio/mp3, audio/wav, audio/ogg"
                            onChange={e => attachFile(e)}
                            onMouseDown={() =>
                                SquareEvent.unselectSquareObjcts()
                            }
                        />
                        <label htmlFor="audio-obj-input-file">File</label>
                        <input
                            type="text"
                            className="frm-name"
                            name=""
                            id="idx_object_audio_src"
                            onKeyDown={downKeyEvent}
                            readOnly
                            value={audioName}
                        />
                        <div className="btn-audio-play">
                            <div
                                className="prop-audio-resource-player paused"
                                onClick={e => playAudio(resourceUrl, e)}
                            >
                                <div className="prop-audio-resource-player-progress"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {availInteraction === true && (
                <div className="list-content">
                    <button
                        className="btn-add-audio-int"
                        onClick={setClickInteraction}
                    >
                        set click-play
                    </button>
                </div>
            )}

            <audio id="idx_prop_audio_resource_player" controls={false}></audio>
        </article>
    );
});

export default Audio;

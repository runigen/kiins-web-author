import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
    IfileInfo,
    EimageAddType,
    EresViewType,
    EResouce_Filter_List_Type,
} from '../../../../const/types';
import docData from '../../../../store/docData';
import workInfo from '../../../../store/workInfo';
import $ from 'jquery';
import * as FileEvent from '../../../../event/FileEvent';
import * as DataStore from '../../../../store/DataStore';
import {
    sortObjectList,
    getAllDocumentEmbedResouces,
    cancelBubble,
    sleep,
    secondsToTime,
} from '../../../../util/common';
import { showToastMessage, basicConfirmDialog } from '../../../../util/dialog';
import ObjectFilterList, {
    toggleShowResourcesFilter,
} from '../../../popup/ObjectFilterList';

const Resources = observer(() => {
    const [resourceList, setResourceList] = useState<IfileInfo[]>([]);
    const fileUpdateKey = docData.getFileUpdateKey();
    const docNo = docData.getDocNo();
    const modifyObjectKey = workInfo.getModifyObjectKey();
    const [viewType, setViewType] = useState<EresViewType>(
        DataStore.getResViewType(),
    );
    // const [bShowResourceFilter, setBShowResourceFilter] = useState(false);
    const [currFilterList, setCurrFilterList] = useState<
        EResouce_Filter_List_Type[]
    >([]);

    // [서버리소스 업데이트] 최초 문서 열릴때 한번
    useEffect(() => {
        if (docNo !== '') {
            updateServerResourceList();
        }
    }, [docNo]);

    useEffect(() => {
        DataStore.setResViewType(viewType);
    }, [viewType]);

    // [서버리소스 업데이트] 서버에 파일 변경시
    useEffect(() => {
        console.log('fileUpdateKey : ', fileUpdateKey);
        if (fileUpdateKey > 0) {
            updateServerResourceList();
        }
    }, [fileUpdateKey]);

    // [로컬리소스 업데이트] 화면의 오브젝트 구조 변경시
    useEffect(() => {
        console.log('modifyObjectKey : ', modifyObjectKey);
        if (modifyObjectKey > 0) {
            updateLocalResourceList();
        }
    }, [modifyObjectKey]);

    // useEffect(() => {
    //     const targetContainer = document.querySelector(
    //         '.section-resources .btn-filter .object-filter-container',
    //     ) as HTMLDivElement;
    //     if (targetContainer) {
    //         if (bShowResourceFilter) {
    //             targetContainer.classList.add('active');
    //             targetContainer.classList.add('resource');
    //         } else {
    //             targetContainer.classList.remove('active');
    //             targetContainer.classList.remove('resource');
    //         }
    //     }
    // }, [bShowResourceFilter]);

    // useEffect(() => {
    //     //currFilterList
    //     console.log('useEffect currFilterList : ', currFilterList);

    //     const itemList = document.querySelectorAll(
    //         '.resource-container .resource-item',
    //     ) as NodeListOf<HTMLDivElement>;

    //     currFilterList.forEach(filter => {
    //         itemList.forEach((item: HTMLDivElement) => {
    //             item.classList.contains(filter)
    //                 ? item.classList.remove('hide')
    //                 : item.classList.add('hide');
    //         });
    //     });
    // }, [currFilterList]);

    const changeViewType = (e: React.MouseEvent<HTMLButtonElement>) => {
        // let changeType: EresViewType = EresViewType.icon;
        // if (e.currentTarget.classList.contains('list')) {
        //     e.currentTarget.classList.remove('list');
        //     e.currentTarget.classList.add('icon');
        //     changeType = EresViewType.list;
        // } else {
        //     e.currentTarget.classList.remove('icon');
        //     e.currentTarget.classList.add('list');
        // }

        // if (changeType === EresViewType.icon) {
        //     document
        //         .querySelector('.resource-container')
        //         ?.classList.remove('list');
        //     document
        //         .querySelector('.resource-container')
        //         ?.classList.add('icon');
        // } else {
        //     document
        //         .querySelector('.resource-container')
        //         ?.classList.remove('icon');
        //     document
        //         .querySelector('.resource-container')
        //         ?.classList.add('list');
        // }
        const changeType = e.currentTarget.classList.contains('list')
            ? EresViewType.list
            : EresViewType.icon;

        setViewType(changeType);
        hideAllControlBoxes();

        // setViewType(changeType);
    };

    const updateServerResourceList = async () => {
        await sleep(100);

        console.log('updateResourceList');
        const newResourceList = await DataStore.getResourceList(
            docData.getDocNo(),
        );
        console.log('newResourceList : ', newResourceList);

        // 이름 정렬
        const ascResourceList = sortObjectList(
            newResourceList,
            'orgFileName',
        ) as IfileInfo[];
        // 타입 정렬 (mimeType)
        const ascResourceList2 = sortObjectList(
            ascResourceList,
            'mimeType',
            'desc',
        ) as IfileInfo[];

        // 리소스 경로 재설정
        // ascResourceList2.forEach(fileInfo => {
        //     fileInfo.url = `docs/${docNo}/res/${fileInfo.fileName}.${fileInfo.fileExt}`;
        // });

        // used 체크
        setUsedResourceList(ascResourceList2, false);
    };
    const updateLocalResourceList = async () => {
        await sleep(100);
        setUsedResourceList(null, true);
    };
    const setUsedResourceList = async (
        fileInfoList: IfileInfo[] | null = null,
        bCurrPage = false,
    ) => {
        console.log('setUsedResourceList : bCurrPage : ', bCurrPage);
        const embedResources = getAllDocumentEmbedResouces();
        console.log('embedResources : ', embedResources);

        // fileInfoList 가 넘어오지 않으면 state(resourceList) 바로 업데이트
        if (fileInfoList === null) {
            setResourceList(list => {
                for (let i = 0; i < list.length; i++) {
                    // if (embedResources.includes(list[i].fileId)) {
                    if (embedResources.indexOf(list[i].fileId) > -1) {
                        list[i].isUsed = true;
                    } else {
                        list[i].isUsed = false;
                    }
                }
                return [...list];
            });

            // fileInfoList가 넘어오면 넘어온 리스트를 사용하여 state(resourceList) 업데이트
        } else {
            const newResourceList = fileInfoList.map(fileInfo => {
                // if (embedResources.includes(fileInfo.url)) {
                if (embedResources.indexOf(fileInfo.fileId) > -1) {
                    fileInfo.isUsed = true;
                } else {
                    fileInfo.isUsed = false;
                }
                return fileInfo;
            });
            setResourceList(newResourceList);
        }
    };

    const showUnuseResources = () => {
        const resourceContainer = document.querySelector(
            '.resource-container',
        ) as HTMLDivElement;

        // 이미 체크폼이 활성화 되어 있으면 숨김
        if (resourceContainer.classList.contains('checkform')) {
            hideAllControlBoxes();
            return;
        }

        resourceContainer.classList.add('checkform');

        const checkboxList = document.querySelectorAll(
            '.resource-container.checkform input[type="checkbox"]',
        ) as NodeListOf<HTMLInputElement>;
        for (const checkObj of checkboxList) {
            if (checkObj.getAttribute('used') === 'true') {
                checkObj.checked = false;
            } else {
                checkObj.checked = true;
            }
        }
    };
    const deleteResources = async () => {
        const resourceContainer = document.querySelector(
            '.resource-container',
        ) as HTMLDivElement;
        if (!resourceContainer.classList.contains('checkform')) {
            resourceContainer.classList.add('checkform');
            return;
        }
        const checkboxList = document.querySelectorAll(
            '.resource-container.checkform input[type="checkbox"]:checked',
        ) as NodeListOf<HTMLInputElement>;

        const deleteFileIdList: string[] = [];
        for (const checkObj of checkboxList) {
            deleteFileIdList.push(checkObj.value);
        }
        if (deleteFileIdList.length === 0) {
            showToastMessage('삭제할 파일을 선택해주세요.');
            return;
        }

        basicConfirmDialog(
            '리소스 삭제',
            '삭제된 리소스는 복구할 수 없습니다.|선택한 리소스를 모두 삭제하시겠습니까?',
            [
                async () => {
                    const rst = await DataStore.deleteResourceFile(
                        deleteFileIdList,
                    );
                    if (rst !== true) {
                        showToastMessage(
                            '리소스 삭제에 실패했습니다. 다시 시도해주세요.',
                        );
                    }
                },
            ],
        );
    };

    // checkbox 체크값을 모두 해제하고, checkbox가 보이지 않도록 함
    const hideAllControlBoxes = () => {
        const checkboxList = document.querySelectorAll(
            '.resource-container.checkform input[type="checkbox"]:checked',
        ) as NodeListOf<HTMLInputElement>;
        for (const checkObj of checkboxList) {
            checkObj.checked = false;
        }
        const resourceContainer = document.querySelector(
            '.resource-container',
        ) as HTMLDivElement;
        if (resourceContainer.classList.contains('checkform')) {
            resourceContainer.classList.remove('checkform');
        }

        // setBShowResourceFilter(false);
        // showResourceFilter(false);
    };

    const attachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            FileEvent.executeUpload(event, EimageAddType.none);
        } else {
            console.log('no file');
        }
        event.target.value = '';
    };

    const dragstart_handler = (event: React.DragEvent<HTMLDivElement>) => {
        console.log('dragstart_handler');
        event.dataTransfer.dropEffect = 'copy';
        event.dataTransfer.setData('text/plain', event.currentTarget.id);
    };

    const playAudio = (
        url: string,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        const audioPlayer = document.getElementById(
            'idx_audio_resource_player',
        ) as HTMLAudioElement;
        if (audioPlayer === null) return;

        $('.audio-resource-player-progress').css('transition', ``);

        const controlBox = event.currentTarget;
        if (controlBox === null) return;

        //audio-runningtime
        const runTimeObj = controlBox.querySelector(
            '.audio-runningtime',
        ) as HTMLDivElement;

        if (controlBox.classList.contains('playing')) {
            audioPlayer.pause();
            controlBox.classList.remove('playing');
            controlBox.classList.add('paused');
        } else {
            $('.audio-resource-player').removeClass('playing');
            $('.audio-resource-player').addClass('paused');

            audioPlayer.src = url;
            audioPlayer.play().then(() => {
                console.log('audioPlayer.duration', audioPlayer.duration);
                let duration = audioPlayer.duration;
                if (duration === Infinity) {
                    duration = 0;
                }
                // const duration = Math.floor(audioPlayer.duration);
                duration = Math.floor(duration * 100) / 100;
                console.log('duration', duration);
                $('.audio-resource-player-progress').css(
                    'transition',
                    `all ${duration}s linear`,
                );
                controlBox.classList.remove('paused');
                controlBox.classList.add('playing');
                if (runTimeObj) {
                    runTimeObj.innerHTML = secondsToTime(duration);
                }
            });
            audioPlayer.addEventListener('ended', () => {
                $('.audio-resource-player-progress').css('transition', ``);
                controlBox.classList.remove('playing');
                controlBox.classList.add('paused');
            });
        }
    };

    // const toggleShowResourcesFilter = (
    //     e: React.MouseEvent<HTMLButtonElement>,
    // ) => {

    //     toggleShowResourcesFilter
    //     // const targetContainer = document.querySelector(
    //     //     '.section-resources .btn-filter .object-filter-container',
    //     // ) as HTMLDivElement;
    //     // if (targetContainer) {
    //     //     if (targetContainer.classList.contains('active')) {
    //     //         showResourceFilter(false, targetContainer);
    //     //     } else {
    //     //         showResourceFilter(true, targetContainer);
    //     //     }
    //     // }
    // };
    // const showResourceFilter = (
    //     bShow = true,
    //     container: HTMLDivElement | null = null,
    // ) => {
    //     // const targetContainer =
    //     //     container === null
    //     //         ? (document.querySelector(
    //     //               '.section-resources .btn-filter .object-filter-container',
    //     //           ) as HTMLDivElement)
    //     //         : container;
    //     // if (targetContainer) {
    //     //     if (bShow) {
    //     //         targetContainer.classList.add('active');
    //     //     } else {
    //     //         targetContainer.classList.remove('active');
    //     //     }
    //     // }
    // };
    const setResourceFilterList = (filterList: EResouce_Filter_List_Type[]) => {
        console.log('setResourceFilterList filterList : ', filterList);
        setCurrFilterList(filterList);
    };

    return (
        <div className="resource-box" onMouseDown={hideAllControlBoxes}>
            <div className="resource-btns" onMouseDown={hideAllControlBoxes}>
                <div className="left-btns">
                    <input
                        type="file"
                        multiple
                        id="resource-input-file"
                        accept="image/gif, image/jpeg, image/png, image/bmp, audio/mp3, audio/wav, audio/ogg, video/3g2, video/3gp, video/3gp2, video/avi, video/m4v, video/mpe, video/mpg, video/wmv, application/pdf"
                        onChange={e => attachFile(e)}
                    />
                    <label htmlFor="resource-input-file">File</label>
                    <button
                        className={`btn-del`}
                        title="삭제"
                        onClick={deleteResources}
                        onMouseDown={cancelBubble}
                    >
                        Delete
                    </button>
                </div>
                <div className="right-btns">
                    <button
                        className="btn-unuse"
                        onClick={showUnuseResources}
                        onMouseDown={cancelBubble}
                        title="사용하지 않는 리소스 선택하기"
                    ></button>
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
                                filterType: 'resource',
                                setResourceFilterListCB: setResourceFilterList,
                            }}
                        />
                        {/* )} */}
                    </button>
                    <button
                        className={`btn-view-type ${
                            viewType === EresViewType.list
                                ? EresViewType.icon
                                : EresViewType.list
                        }`}
                        onClick={changeViewType}
                        onMouseDown={cancelBubble}
                    ></button>
                </div>
            </div>
            <div
                className={`resource-container ${viewType}`}
                onMouseDown={cancelBubble}
            >
                {resourceList.map(resource => {
                    return (
                        <div
                            className={`resource-item ${
                                resource.mimeType.split('/')[0]
                            }`}
                            key={resource.fileId}
                            {...{ fileid: resource.fileId }}
                            onMouseDown={cancelBubble}
                            style={{
                                display: currFilterList.includes(
                                    resource.mimeType
                                        .toLowerCase()
                                        .split(
                                            '/',
                                        )[0] as EResouce_Filter_List_Type,
                                )
                                    ? ''
                                    : 'none',
                            }}
                        >
                            <label htmlFor={`check_${resource.fileId}`}>
                                <input
                                    type="checkbox"
                                    id={`check_${resource.fileId}`}
                                    value={`${resource.fileId}`}
                                    {...{ used: String(resource.isUsed) }}
                                />
                                <span></span>
                            </label>
                            <div
                                className={`icon${
                                    resource.isUsed ? ' used' : ''
                                }${
                                    resource.mimeType
                                        .toLowerCase()
                                        .indexOf('audio') === 0
                                        ? ' audio'
                                        : ''
                                }${
                                    resource.mimeType
                                        .toLowerCase()
                                        .indexOf('text') === 0
                                        ? ' text'
                                        : ''
                                }`}
                                id={`res_${resource.fileId}`}
                                {...{ fileinfo: JSON.stringify(resource) }}
                                style={{
                                    backgroundImage:
                                        resource.mimeType
                                            .toLowerCase()
                                            .indexOf('audio') === 0 ||
                                        resource.mimeType
                                            .toLowerCase()
                                            .indexOf('text') === 0
                                            ? ``
                                            : `url(${resource.url})`,
                                }}
                                draggable={true}
                                onDragStart={dragstart_handler}
                            >
                                {resource.mimeType
                                    .toLowerCase()
                                    .indexOf('audio') === 0 && (
                                    <div
                                        className="audio-resource-player paused"
                                        onClick={e =>
                                            playAudio(resource.url, e)
                                        }
                                    >
                                        <span className="audio-runningtime">
                                            {/* 00:00:00 */}
                                        </span>
                                        <div className="audio-resource-player-progress"></div>
                                    </div>
                                )}
                            </div>
                            <div className="filename">
                                {resource.orgFileName}
                            </div>
                        </div>
                    );
                })}
            </div>
            <audio id="idx_audio_resource_player" controls={false}></audio>
        </div>
    );
});

export default Resources;

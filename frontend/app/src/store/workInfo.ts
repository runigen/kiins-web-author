import { observable } from 'mobx';
import {
    IplayTimeInfo,
    IworkInfo,
    EpreviewPlayStatus,
    EworkStatus,
} from '../const/types';

const workInfo = observable({
    dataset: {
        viewMode: false,
        status: '',
        object: null,
        objectGroup: [],
        objectList: [],
        updateKey: 0,
        playing: false,
        totalPlayTime: 0, // 위 위치 까지 이동할 시간 (ms)
        totalPlayRange: 0, // 이동 후 마지막 위치 (px)
        keyframeRangeList: [],
        keyframeDataList: [],
        // transitionRangeList: [],
        progressbarPos: 0,
        elementDataList: [],

        currKeyframeTarget: '',
        currKeyframeTimeLeft: 0,
        currKeyframeStep: -1,
        playTimeInfo: {
            left: 0,
            min: '00',
            sec: '00',
            ms: '00',
        },
        currTransitionStep: -1,
        previewPlayStatus: EpreviewPlayStatus.stop,
        undoStackCount: 0,
        undoStackIndex: -1,
        pageZoom: 1,
        timelineZoom: 1,
        timelineLimit: 30, // 설정된 타임라인 최대 범위 (sec)
        dteStatus: false, // dynamic text editor 보임/숨김 상태
        autoKeyframeStatus: false, // autokeyframe status
        whRatio: false,
        folderSelected: false,
        logicMode: false,
        previewPageNo: 1,
        modifyObjectKey: 0,
        listMode: false,
        configMode: false,
        showSpecialChars: false,
        showPdfTextList: false,
        pdfTextUrl: '',
        bModifiedKeyFrame: false,
        bModifiedOrderNo: false,
        bModifiedInteraction: false,
    } as IworkInfo,

    setListMode(mode = true) {
        this.dataset.listMode = mode;
    },
    getListMode() {
        return this.dataset.listMode;
    },
    setViewMode(mode = true) {
        this.dataset.viewMode = mode;
    },
    getViewMode() {
        return this.dataset.viewMode;
    },
    setLogicMode(mode = true) {
        this.dataset.logicMode = mode;
    },
    getLogicMode() {
        return this.dataset.logicMode;
    },
    setConfigMode(mode = true) {
        this.dataset.configMode = mode;
    },
    getConfigMode() {
        return this.dataset.configMode;
    },
    setShowSpecialChars(mode = true) {
        this.dataset.showSpecialChars = mode;
    },
    getShowSpecialChars() {
        return this.dataset.showSpecialChars;
    },
    setShowPdfTextList(mode = true, url = '') {
        this.dataset.showPdfTextList = mode;
        if (url !== '') {
            this.setPdfTextUrl(url);
        }
    },
    getShowPdfTextList() {
        return this.dataset.showPdfTextList;
    },
    setPdfTextUrl(url = '') {
        this.dataset.pdfTextUrl = url;
    },
    getPdfTextUrl() {
        return this.dataset.pdfTextUrl;
    },
    setList(data: IworkInfo) {
        this.dataset = data;
    },
    getList() {
        return this.dataset;
    },
    setStatus(val: EworkStatus) {
        this.setList({
            ...this.dataset,
            status: val,
        });
    },
    getStatus() {
        return this.dataset.status;
    },
    setObject(obj: any) {
        this.setList({
            ...this.dataset,
            object: obj,
        });
    },
    getObject() {
        return this.dataset.object;
    },

    getObjectGroup() {
        return this.dataset.objectGroup;
    },
    setObjectGroup(objGroup: any[] = []) {
        this.setList({
            ...this.dataset,
            objectGroup: objGroup,
        });
    },
    addObjectGroup(obj: any = null) {
        if (obj) {
            let duple = false;
            const newList = this.dataset.objectGroup.map((item: any) => {
                if (item.id === obj.id) {
                    duple = true;
                    return false;
                }
                return item;
            });
            // 중복이 아닌 오브젝트만 삽입
            if (!duple) {
                newList.push(obj);
                this.setObjectGroup(newList);
            }
        }
    },
    removeObjectGroup(obj: any = null) {
        if (obj) {
            this.setObjectGroup(
                this.dataset.objectGroup.filter(
                    (item: any) => item.id !== obj.id,
                ),
            );
        }
    },
    emptyObjectGroup() {
        if (this.dataset.objectGroup.length > 0) {
            this.setObjectGroup();
        }
    },
    setObjectList(objList: any[] = []) {
        this.setList({
            ...this.dataset,
            objectList: objList,
        });
    },
    getObjectList() {
        return this.dataset.objectList;
    },
    addObjectList(obj: any = null) {
        if (obj) {
            let duple = false;
            const newList = this.dataset.objectList.map((item: any) => {
                if (item.id === obj.id) {
                    duple = true;
                    return obj;
                } else {
                    return item;
                }
            });
            if (newList.length === 0 || !duple) {
                newList.push(obj);
            }
            this.setObjectList(newList);
        }
    },
    removeObjectList(obj: any) {
        this.setObjectList(
            this.dataset.objectList.filter((item: any) => item.id !== obj.id),
        );
    },
    emptyObjectList() {
        this.setObjectList();
    },
    setUpdateKey(key: number | null = null) {
        if (key === null) {
            key = new Date().getTime();
        }
        this.setList({
            ...this.dataset,
            updateKey: key,
        });
    },
    getUpdateKey() {
        return this.dataset.updateKey;
    },

    setPlaying(bPlay: boolean) {
        this.setList({
            ...this.dataset,
            playing: bPlay,
        });
    },
    // setTotalPlayTime(playTime) {
    //     this.setList({
    //         ...this.dataset,
    //         totalPlayTime : playTime
    //     })
    // },
    // getTotalPlayTime() {
    //     return this.dataset.totalPlayTime;
    // },
    setTotalPlayRange(playRange: number) {
        this.setList({
            ...this.dataset,
            totalPlayRange: playRange,
        });
    },
    getTotalPlayRange() {
        return this.dataset.totalPlayRange;
    },
    setKeyframeRangeList(list: number[]) {
        this.setList({
            ...this.dataset,
            keyframeRangeList: list,
        });
    },
    getKeyframeRangeList() {
        return this.dataset.keyframeRangeList;
    },
    setKeyframeDataList(list: any[]) {
        this.setList({
            ...this.dataset,
            keyframeDataList: list,
        });
    },
    getKeyframeDataList() {
        return this.dataset.keyframeDataList;
    },
    // setTransitionRangeList(list) {
    //     this.setList({
    //         ...this.dataset,
    //         transitionRangeList : list
    //     });
    // },
    // getTransitionRangeList() {
    //     return this.dataset.transitionRangeList;
    // },
    setProgressbarPos(pos: number) {
        this.setList({
            ...this.dataset,
            progressbarPos: pos,
        });
    },
    getProgressbarPos() {
        return this.dataset.progressbarPos;
    },
    setElementDataList(list: any[]) {
        this.setList({
            ...this.dataset,
            elementDataList: list,
        });
    },
    getElementDataList() {
        return this.dataset.elementDataList;
    },

    setCurrKeyframeTarget(target: string) {
        this.setList({
            ...this.dataset,
            currKeyframeTarget: target,
        });
    },
    getCurrKeyframeTarget() {
        return this.dataset.currKeyframeTarget;
    },
    setCurrKeyframeTimeLeft(timeLeft: number | undefined = undefined) {
        this.setList({
            ...this.dataset,
            currKeyframeTimeLeft: timeLeft === undefined ? 0 : timeLeft,
        });
    },
    getCurrKeyframeTimeLeft() {
        return this.dataset.currKeyframeTimeLeft;
    },

    setCurrKeyframeStep(step: number | undefined = undefined) {
        this.setList({
            ...this.dataset,
            currKeyframeStep: step === undefined ? -1 : step,
        });
    },
    getCurrKeyframeStep() {
        return this.dataset.currKeyframeStep;
    },
    setPlayTimeInfo(timeInfo: IplayTimeInfo) {
        this.setList({
            ...this.dataset,
            playTimeInfo: { ...timeInfo },
        });
    },
    getPlayTimeInfo() {
        return this.dataset.playTimeInfo;
    },
    setCurrTransitionStep(step: number | undefined = undefined) {
        this.setList({
            ...this.dataset,
            currTransitionStep: step === undefined ? -1 : step,
        });
    },
    getCurrTransitionStep() {
        return this.dataset.currTransitionStep;
    },
    setPreviewPlayStatus(bStatus: EpreviewPlayStatus) {
        this.setList({
            ...this.dataset,
            previewPlayStatus: bStatus,
        });
    },
    getPreviewPlayStatus() {
        return this.dataset.previewPlayStatus;
    },
    setUndoStackCount(count: number) {
        this.setList({
            ...this.dataset,
            undoStackCount: count,
        });
    },
    getUndoStackCount() {
        return this.dataset.undoStackCount;
    },
    setUndoStackIndex(index: number) {
        this.setList({
            ...this.dataset,
            undoStackIndex: index,
        });
    },
    getUndoStackIndex() {
        return this.dataset.undoStackIndex;
    },
    setPageZoom(zoomVal: number) {
        this.setList({
            ...this.dataset,
            pageZoom: zoomVal,
        });
    },
    getPageZoom() {
        return this.dataset.pageZoom;
    },
    setTimelineZoom(zoomVal: number) {
        this.setList({
            ...this.dataset,
            timelineZoom: zoomVal,
        });
    },
    getTimelineZoom() {
        return this.dataset.timelineZoom;
    },
    setTimelineLimit(limitVal: number) {
        this.setList({
            ...this.dataset,
            timelineLimit: limitVal,
        });
    },
    incTimelineLimit(incVal: number) {
        this.setList({
            ...this.dataset,
            timelineLimit: this.getTimelineLimit() + incVal,
        });
    },
    getTimelineLimit() {
        return this.dataset.timelineLimit;
    },
    getDteStatus() {
        return this.dataset.dteStatus;
    },
    setDteStatus(status: boolean) {
        this.setList({
            ...this.dataset,
            dteStatus: status,
        });
    },
    getAutoKeyframeStatus() {
        return this.dataset.autoKeyframeStatus;
    },
    setAutoKeyframeStatus(status: boolean) {
        this.setList({
            ...this.dataset,
            autoKeyframeStatus: status,
        });
    },
    getWhRatio() {
        return this.dataset.whRatio;
    },
    setWhRatio(status: boolean) {
        this.setList({
            ...this.dataset,
            whRatio: status,
        });
    },
    getFolderSelected() {
        return this.dataset.folderSelected;
    },
    setFolderSelected(bSelected: boolean) {
        this.setList({
            ...this.dataset,
            folderSelected: bSelected,
        });
    },

    getPreviewPageNo() {
        return this.dataset.previewPageNo;
    },
    setPreviewPageNo(pageNo: number) {
        this.setList({
            ...this.dataset,
            previewPageNo: pageNo,
        });
    },
    getModifyObjectKey() {
        return this.dataset.modifyObjectKey;
    },
    setModifyObjectKey() {
        this.setList({
            ...this.dataset,
            modifyObjectKey: this.dataset.modifyObjectKey + 1,
        });
    },
    getModifiedKeyframe() {
        return this.dataset.bModifiedKeyFrame;
    },
    setModifiedKeyframe(bModified = true) {
        this.setList({
            ...this.dataset,
            bModifiedKeyFrame: bModified,
        });
    },
    getModifiedOrderNo() {
        return this.dataset.bModifiedOrderNo;
    },
    setModifiedOrderNo(bModified = true) {
        this.setList({
            ...this.dataset,
            bModifiedOrderNo: bModified,
        });
    },
    getModifiedInteraction() {
        return this.dataset.bModifiedInteraction;
    },
    setModifiedInteraction(bModified = true) {
        this.setList({
            ...this.dataset,
            bModifiedInteraction: bModified,
        });
    },
});

export default workInfo;

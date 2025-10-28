import { observable } from 'mobx';
import {
    IdocData,
    ETemplateType,
    IDocContents,
    IdocListInfo,
} from '../const/types';

const docData = observable({
    dataset: {
        docNo: '',
        docName: '',
        folderId: 0,
        folderPath: [],
        pageObject: null,
        currPage: 0,
        totalPage: 0,
        pageUpdateKey: 0,
        templateMode: ETemplateType.none,
        docContentList: [],
        docUpdateKey: 0,
        modified: false,
        fileUpdateKey: 0,
    } as IdocData,
    setData(data: IdocData) {
        this.dataset = data;
    },
    getData() {
        return this.dataset;
    },
    setPageUpdateKey() {
        this.setData({
            ...this.dataset,
            pageUpdateKey: new Date().getTime(),
        });
    },
    getPageUpdateKey() {
        return this.dataset.pageUpdateKey;
    },
    setDocUpdateKey() {
        this.setData({
            ...this.dataset,
            docUpdateKey: new Date().getTime(),
        });
    },
    getDocUpdateKey() {
        return this.dataset.docUpdateKey;
    },
    setFileUpdateKey() {
        this.setData({
            ...this.dataset,
            fileUpdateKey: this.dataset.fileUpdateKey + 1,
        });
    },
    getFileUpdateKey() {
        return this.dataset.fileUpdateKey;
    },
    getDocNo() {
        return this.dataset.docNo;
    },
    setDocNo(no: string) {
        this.setData({
            ...this.dataset,
            docNo: no,
        });
    },
    getDocName() {
        return this.dataset.docName;
    },
    setDocName(name: string) {
        this.setData({
            ...this.dataset,
            docName: name,
        });
    },
    getFolderId() {
        return this.dataset.folderId;
    },
    setFolderId(id: number) {
        this.setData({
            ...this.dataset,
            folderId: id,
        });
    },
    getFolderPath() {
        return this.dataset.folderPath;
    },
    setFolderPath(path: IdocListInfo[]) {
        this.setData({
            ...this.dataset,
            folderPath: path,
        });
    },
    getPageObject() {
        return this.dataset.pageObject;
    },
    setPageObject(pageObj: HTMLDivElement) {
        this.setData({
            ...this.dataset,
            pageObject: pageObj,
        });
        // this.setPageUpdateKey();
    },
    setCurrPage(pageNo: number) {
        if (pageNo < 1) pageNo = 1;
        if (pageNo > this.dataset.totalPage) pageNo = this.dataset.totalPage;
        this.setData({
            ...this.dataset,
            currPage: pageNo,
        });
    },
    getCurrPage() {
        return this.dataset.currPage;
    },
    setTotalPage(pageCount: number) {
        this.setData({
            ...this.dataset,
            totalPage: pageCount,
        });
    },
    getTotalPage() {
        return this.dataset.totalPage;
    },
    getTemplateMode() {
        return this.dataset.templateMode;
    },
    setTemplateMode(mode: ETemplateType) {
        this.setData({
            ...this.dataset,
            templateMode: mode,
        });
    },
    getDocContentsList() {
        return this.dataset.docContentList;
    },
    setDocContentList(list: IDocContents[]) {
        this.setData({
            ...this.dataset,
            docContentList: list,
            totalPage: list.length,
        });
    },
    getLogicContent(pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        return this.dataset.docContentList[pageNo - 1].logicContent;
    },
    // setLogicContentList(pageNo: number = -1, list: string[]) {
    //     if (pageNo === -1) {
    //         pageNo = this.getCurrPage();
    //     }
    //     this.dataset.docContentList[pageNo - 1].logicContentList = list;
    //     // this.setData({
    //     //     ...this.dataset,
    //     //     docContentList: this.dataset.docContentList.map((item, index) => {
    //     //         if (index === pageNo - 1) {
    //     //             return {
    //     //                 ...item,

    //     //             }
    //     //         }
    //     //     }),

    //     //     logicContentList: list,
    //     // });
    // },
    setLogicContent(content: string, pageNo = -1) {
        // let list = this.getLogicContent();
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        // if(list.length === 0) {
        //     list.push(content);
        // } else {
        //     list[pageNo - 1] = content;
        // }
        // this.setLogicContentList(pageNo, list);
        this.dataset.docContentList[pageNo - 1].logicContent = content;
    },
    getLogicActionList(pageNo = -1) {
        // return this.dataset.logicActionList;
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        if (
            pageNo > 0 &&
            this.dataset.docContentList[pageNo - 1] !== undefined
        ) {
            return this.dataset.docContentList[pageNo - 1].logicActionList;
        } else {
            return [];
        }
    },
    setLogicActionList(list: any[] = [], pageNo = -1) {
        // this.setData({
        //     ...this.dataset,
        //     logicActionList: list,
        // });
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        this.dataset.docContentList[pageNo - 1].logicActionList = list;
    },
    setDocPageContent(content: string, pageNo = -1) {
        // let list = this.getDocContentsList();
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        // list[pageNo - 1].docContentList = content;
        // this.setDocContentList(list);
        this.dataset.docContentList[pageNo - 1].docPageContent = content;
    },
    setDocPageThumbnail(thumbnailStr: string, pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        this.dataset.docContentList[pageNo - 1].docPageThumbnail = thumbnailStr;
    },
    getDocPageThumnail(pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        return this.dataset.docContentList[pageNo - 1].docPageThumbnail;
    },
    setDocPageName(name: string, pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        this.dataset.docContentList[pageNo - 1].docPageName = name;
    },
    setDocPageTplType(type: ETemplateType, pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        this.dataset.docContentList[pageNo - 1].docPageTplType = type;
    },
    setDocPageId(id: string, pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.getCurrPage();
        }
        this.dataset.docContentList[pageNo - 1].docPageId = id;
    },
    getDocContent(pageNo = -1) {
        if (pageNo === -1) {
            pageNo = this.dataset.currPage;
        }
        return this.dataset.docContentList[pageNo - 1];
    },
    // 현재 페이지 바로 다음에 새 페이지 삽입
    addDocContent(content: IDocContents, currPageNo = 1) {
        this.dataset.docContentList.splice(currPageNo, 0, content);
        this.setTotalPage(this.dataset.docContentList.length);
    },
    // 현재 페이지 제거
    removeDocContent(removePageNo = 1) {
        this.dataset.docContentList.splice(removePageNo - 1, 1);
        // this.dataset.logicContentList.splice(removePageNo - 1, 1);
        this.setTotalPage(this.dataset.docContentList.length);
    },
    // 마지막에 새 페이지 삽입
    appendDocContent(content: IDocContents) {
        this.dataset.docContentList.push(content);
        this.setTotalPage(this.dataset.docContentList.length);
    },
    // 처음에 새 페이지 삽입
    prependDocContent(content: IDocContents) {
        this.dataset.docContentList.unshift(content);
        this.setTotalPage(this.dataset.docContentList.length);
    },
    // n번째 페이지를 m번째 페이지로 이동
    moveDocContent(n: number, m: number) {
        const content = this.dataset.docContentList[n];
        this.dataset.docContentList.splice(n, 1);
        this.dataset.docContentList.splice(m, 0, content);
    },

    setModified(bModified: boolean) {
        this.dataset.modified = bModified;
    },
    getModified() {
        return this.dataset.modified;
    },
});

export default docData;

import {
    IdocInfo,
    IdocListInfo,
    IfolderInfo,
    IfileInfo,
    // IDoc_Resource_Response,
    ILogic_Data_FormData_Info,
    ILogic_Data_Page_Data_Info,
    ILogic_Data_FormData_StoreInfo,
    EuserLang,
    EresViewType,
} from '../const/types';
import {
    colorHistoryCnt,
    userColorCnt,
    fontHistoryCnt,
    specialCharsHistoryCnt,
} from '../const/basicData';
import axios from 'axios';
import MD5 from 'crypto-js/md5';
import {
    showToastMessage,
    // hideToastMessage,
    showLoading,
    hideLoading,
} from '../util/dialog';
// import workInfo from '../store/workInfo';
import docData from '../store/docData';
import { getCurrentDateTime, getEnvLang, parseJsonData } from '../util/common';

const KEY_USER_COLOR_LIST = 'UCL';
const KEY_COLOR_HISTORY_LIST = 'CHL';
const KEY_FONT_HISTORY_LIST = 'FHL';
const KEY_SPECIALCHARS_HISTORY_LIST = 'SCHL';
const KEY_FORM_DATA = 'MCDFD';
const KEY_QUIZ_CHAR = 'MCDQ';
const KEY_USER_LANG = 'MCDL';
const KEY_RES_VIEW_TYPE = 'MCDRVT';
const KEY_DOC_CONTENT_CHK = 'MCDCC';
const KEY_DOC_CONTENT = 'MCDC';

const docReadUrl = process.env.REACT_APP_DOC_READ_URL || '';
const docCreateUrl = process.env.REACT_APP_DOC_CREATE_URL || '';
const docListUrl = process.env.REACT_APP_DOC_LIST_URL || '';
const docDeleteUrl = process.env.REACT_APP_DOC_DELETE_URL || '';
const docSaveAsUrl = process.env.REACT_APP_DOC_SAVE_AS_URL || '';
const docUpdateFolderUrl = process.env.REACT_APP_DOC_UPDATE_FOLDER_URL || '';
const folderCreateUrl = process.env.REACT_APP_FOLDER_CREATE_URL || '';
const folderDeleteUrl = process.env.REACT_APP_FOLDER_DELETE_URL || '';
const folderUpdateUrl = process.env.REACT_APP_FOLDER_UPDATE_URL || '';
const folderReadUrl = process.env.REACT_APP_FOLDER_READ_URL || '';
const resourceFileListUrl = process.env.REACT_APP_RESOURCE_LIST_URL || '';
const resourceDeleteUrl = process.env.REACT_APP_RESOURCE_DELETE_URL || '';
// const fileUploadUrl = process.env.REACT_APP_FILEUPLOAD_URL || '';
// const fileExportAllUrl = process.env.REACT_APP_FILEEXPORTALL_URL || '';

const instance = axios.create({
    baseURL: '',
    timeout: 10000,
    // headers: {'X-Custom-Header': 'foobar'}
});
instance.defaults.validateStatus = function (status) {
    // return status >= 200 && status < 300; // default
    return status == 200 || status == 500;
};
instance.interceptors.request.use(
    function (config) {
        showLoading(10, true);
        return config;
    },
    function (error) {
        console.log(error);
        hideLoading();
        showToastMessage(error.message);
        return Promise.reject(error);
    },
);
instance.interceptors.response.use(
    function (response) {
        hideLoading();
        if (response.status === 500) {
            // const msg = response.data.message || response.statusText;
            const msg =
                response.data.message ||
                '서버 연결 오류 입니다. 잠시후 다시 시도해 주세요.';
            showToastMessage(msg, -1);
            return Promise.reject(response.data);
            // throw new Error(response.data.message);
        }
        return response;
    },
    function (error) {
        console.log(error);
        hideLoading();
        showToastMessage(
            '서버 데이터 요청 오류 입니다. 잠시후 다시 시도해 주세요.',
            -1,
        );
        return Promise.reject(error);
    },
);

/** local storage */
export const getObjectLocalStoreData = (keyName: string) => {
    const data = window.localStorage.getItem(keyName);
    if (data !== null && data !== '') {
        let retData = null;
        try {
            retData = JSON.parse(data);
        } catch (e) {
            retData = null;
        }
        return retData;
    } else {
        return null;
    }
};
export const setObjectLocalStoreData = (keyName: string, value: any) => {
    if (value !== null && value !== '') {
        window.localStorage.setItem(keyName, JSON.stringify(value));
    } else {
        window.localStorage.setItem(keyName, '');
    }
};

/* user color list */
export const getUserColorList = (): string[] => {
    return getObjectLocalStoreData(KEY_USER_COLOR_LIST) || [];
};
export const addUserColor = (colorCode: string) => {
    let newColorList: string[] = [];
    const orgColorList = getUserColorList();
    if (orgColorList.length) {
        newColorList = orgColorList.filter(
            (color: string) => color !== colorCode,
        );
    }
    newColorList.unshift(colorCode);
    // 최신 18개만 세팅
    newColorList = newColorList.slice(0, userColorCnt);
    setObjectLocalStoreData(KEY_USER_COLOR_LIST, newColorList);
};
export const removeUserColor = (colorCode: string) => {
    let newColorList: string[] = [];
    const orgColorList = getUserColorList();
    if (orgColorList.length) {
        newColorList = orgColorList.filter(
            (color: string) => color !== colorCode,
        );
    }
    setObjectLocalStoreData(KEY_USER_COLOR_LIST, newColorList);
};
export const emptyUserColorList = () => {
    window.localStorage.removeItem(KEY_USER_COLOR_LIST);
};

/* color history list */
export const getColorHistoryList = (): string[] => {
    const listData = window.localStorage.getItem(KEY_COLOR_HISTORY_LIST);
    if (listData) {
        return parseJsonData(listData.toLocaleUpperCase()) || [];
    } else {
        return [];
    }
};
export const addColorHistory = (colorCode: string) => {
    colorCode = colorCode.toLocaleUpperCase();
    let newColorList: string[] = [];
    const orgColorList = getColorHistoryList();
    if (orgColorList.length) {
        newColorList = orgColorList.filter(
            (color: string) => color !== colorCode,
        );
    }
    newColorList.unshift(colorCode);
    // 최신 18개만 세팅
    newColorList = newColorList.slice(0, colorHistoryCnt);
    setObjectLocalStoreData(KEY_COLOR_HISTORY_LIST, newColorList);
};
export const emptyColorHistoryList = () => {
    window.localStorage.removeItem(KEY_COLOR_HISTORY_LIST);
};
export const getUserId = () => {
    return window.localStorage.getItem('userId') || '';
};
export const setUserId = (userId: string) => {
    window.localStorage.setItem('userId', userId);
};
export const getFolderId = () => {
    return window.localStorage.getItem('folderId') || '';
};
export const setFolderId = (folderId: string) => {
    window.localStorage.setItem('folderId', folderId);
};

/** server api request */
/* document load / save */
export const getDocument = async (docNo: string) => {
    return await instance({
        url: `${docReadUrl}/${docNo}`,
        method: 'get',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data as IdocInfo;
            // }
            // return null;
        })
        .catch(e => {
            console.log('getDocument error : ', e);
            return null;
        });
};
export const setDocument = async (docInfo: IdocInfo): Promise<boolean> => {
    console.log('DataStore.setDocument : ', docInfo);
    if (docInfo.folderId === undefined) {
        docInfo.folderId = 0;
    }

    // 변경된 컨텐츠인지 확인
    const bNew = checkNewDocContent(docInfo);

    // 변경내역이 있다면
    if (bNew) {
        console.log('DataStore.setDocument : 변경사항 있음 -> 저장 시작 ');

        // 서버에 저장
        return await instance({
            url: `${docCreateUrl}`,
            data: docInfo,
            method: 'post',
        })
            .then(() => {
                setNewDocChkSum(docInfo);
                return true;
            })
            .catch(() => {
                return false;
            });
    }

    // 변경내역이 없다면 서버에 저장하지 않고 성공(true) 리턴
    else {
        console.log('DataStore.setDocument : 변경사항 없음 -> 저장 안함');

        return new Promise(resolve => {
            setTimeout(() => {
                hideLoading();
                resolve(true);
            }, 100);
        });
    }
};

// docInfo 필드명 순서 정렬(비교시 항상 같은 순서로 비교하기 위함)
const getSortedDocInfo = (docInfo: IdocInfo) => {
    return {
        no: docInfo.no,
        userId: docInfo.userId,
        name: docInfo.name,
        folderId: docInfo.folderId,
        docContentList: docInfo.docContentList,
    } as IdocInfo;
};
// 저장할 문서의 변경내역이 있는지 확인
const checkNewDocContent = (docInfo: IdocInfo) => {
    const prevDocChkSum = localStorage.getItem(KEY_DOC_CONTENT_CHK);
    console.log('prevDocChkSum : ', prevDocChkSum);
    if (prevDocChkSum) {
        const currDocChkSum = MD5(
            JSON.stringify(getSortedDocInfo(docInfo)),
        ).toString();
        console.log('currDocChkSum : ', currDocChkSum);
        return prevDocChkSum !== currDocChkSum;
    } else {
        console.log('currDocChkSum : ');
        return true;
    }
};
// 문서 변경내역 저장
export const setNewDocChkSum = (docInfo: IdocInfo) => {
    localStorage.setItem(
        KEY_DOC_CONTENT_CHK,
        MD5(JSON.stringify(getSortedDocInfo(docInfo))).toString(),
    );
    localStorage.setItem(
        KEY_DOC_CONTENT,
        JSON.stringify(getSortedDocInfo(docInfo)),
    );
};

export const getDocumentList = async (folderId: number) => {
    return await instance({
        url: `${docListUrl}`,
        data: {
            userId: getUserId(),
            folderId: folderId,
        },
        method: 'post',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data as IdocListInfo[];
            // }
            // return [] as IdocListInfo[];
        })
        .catch(() => {
            return [] as IdocListInfo[];
        });
};
export const deleteDocument = async (docNo: string) => {
    return await instance({
        url: `${docDeleteUrl}/${docNo}`,
        method: 'delete',
    })
        .then(() => {
            // if (res.data.code === 200) {
            return true;
            // }
            // return false;
        })
        .catch(() => {
            return false;
        });
};
export const setSaveAsDocument = async (docNo: string, docName: string) => {
    console.log('setAsDocument => docNo : ', docNo, ', docName: ', docName);
    return await instance({
        url: `${docSaveAsUrl}`,
        data: {
            no: docNo,
            name: docName,
        },
        method: 'post',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data.no as string;
            // }
            // return '';
        })
        .catch(() => {
            return '';
        });
};
// 복사하여 다른 아이디계정으로 문서 저장
export const setSendToDocument = async (
    docNo: string,
    docName: string,
    userId: string,
) => {
    console.log('setAsDocument => docNo : ', docNo, ', docName: ', docName);
    return await instance({
        url: `${docSaveAsUrl}`,
        data: {
            no: docNo,
            name: docName,
            userId: userId,
            folderId: 0,
        },
        method: 'post',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data.no as string;
            // }
            // return '';
        })
        .catch(() => {
            return '';
        });
};
export const setDocumentBeacon = (docInfo: IdocInfo) => {
    try {
        console.log('setDocumentBeacon : docInfo : ', docInfo);
        const blob = new Blob([JSON.stringify(docInfo)], {
            type: 'application/json',
        });
        window.navigator.sendBeacon(docCreateUrl, blob);
    } catch (e) {
        console.log('setDocumentBeacon error : ', e);
    }
};
export const createFolder = async (folderId: number, folderName: string) => {
    console.log(
        'createFolder => folderId: ',
        folderId,
        ', folderName : ',
        folderName,
    );
    return await instance({
        url: `${folderCreateUrl}`,
        data: {
            userId: getUserId(),
            name: folderName,
            upperId: folderId,
        },
        method: 'post',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data.folderId as number;
            // }
            // return 0;
        })
        .catch(() => {
            return 0;
        });
};
export const deleteFolder = async (folderId: number) => {
    console.log('deleteFolder => folderId: ', folderId);
    return await instance({
        url: `${folderDeleteUrl}/${folderId}`,
        method: 'delete',
    })
        .then(() => {
            // if (res.data.code === 200) {
            return true;
            // }
            // return false;
        })
        .catch(() => {
            return false;
        });
};
export const modifyFolderName = async (
    folderId: number,
    folderName: string,
    parentFolderId: number,
) => {
    console.log(
        'modifyFolderName => folderId: ',
        folderId,
        ', folderName : ',
        folderName,
    );
    return await instance({
        url: `${folderUpdateUrl}`,
        data: {
            folderId: folderId,
            upperId: parentFolderId,
            name: folderName,
            userId: getUserId(),
        },
        method: 'put',
    })
        .then(() => {
            // if (res.data.code === 200) {
            return true;
            // }
            // return false;
        })
        .catch(() => {
            return false;
        });
};
export const moveFolderToFolder = async (
    folderId: number,
    folderName: string,
    parentFolderId: number,
) => {
    console.log(
        'moveFolderToFolder => folderId: ',
        folderId,
        ', parentFolderId : ',
        parentFolderId,
    );
    return await instance({
        url: `${folderUpdateUrl}`,
        data: {
            folderId: folderId,
            upperId: parentFolderId,
            name: folderName,
            userId: getUserId(),
        },
        method: 'put',
    })
        .then(() => {
            // if (res.data.code === 200) {
            return true;
            // }
            // return false;
        })
        .catch(() => {
            return false;
        });
};
export const moveDocToFolder = async (docNo: string, folderId: number) => {
    console.log('moveDocToFolder => docNo: ', docNo, ', folderId : ', folderId);
    return await instance({
        url: `${docUpdateFolderUrl}`,
        data: {
            no: docNo,
            folderId: folderId,
        },
        method: 'put',
    })
        .then(() => {
            // if (res.data.code === 200) {
            return true;
            // }
            // return false;
        })
        .catch(() => {
            return false;
        });
};

export const getResourceList = async (docNo: string) => {
    return await instance({
        url: `${resourceFileListUrl}`,
        data: {
            no: docNo,
        },
        method: 'post',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data as IfileInfo[];
            // }
            // return [] as IfileInfo[];
        })
        .catch(() => {
            return [] as IfileInfo[];
        });
};
export const deleteResourceFile = async (fileIdList: string[] = []) => {
    return await instance({
        url: `${resourceDeleteUrl}`,
        data: { documentId: docData.getDocNo(), fileIds: fileIdList },
        method: 'delete',
    })
        .then(() => {
            // if (res.data.code === 200) {
            docData.setFileUpdateKey();
            return true;
            // }
            // return false;
        })
        .catch(() => {
            return false;
        });
};
export const getFolderInfo = async (folderId: number) => {
    return await instance({
        url: `${folderReadUrl}/${folderId}`,
        method: 'get',
    })
        .then(res => {
            // if (res.data.code === 200) {
            return res.data.data as IfolderInfo;
            // }
            // return null;
        })
        .catch(() => {
            return null;
        });
};
export const saveQuizResult = async (quizResult: any[]) => {
    showLoading(10, true);
    return new Promise(resolve => {
        setTimeout(() => {
            const Char = KEY_QUIZ_CHAR;
            const quizNumList: number[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    if (key.indexOf(Char) > -1) {
                        const currNum = Number(key.substring(Char.length));
                        quizNumList.push(currNum);
                    }
                }
            }
            if (quizNumList.length === 0) {
                quizNumList.push(0);
            }
            const newNum = Math.max(...quizNumList) + 1;
            let newNumString = '';
            if (newNum < 10) {
                newNumString = '00' + newNum;
            } else if (newNum < 100) {
                newNumString = '0' + newNum;
            } else {
                newNumString = String(newNum);
            }
            const newKey = Char + newNumString;
            const content = {
                regdate: getCurrentDateTime(),
                userId: getUserId(),
                quizResult: quizResult,
            };
            setObjectLocalStoreData(newKey, content);
            hideLoading();
            resolve({
                code: 200,
                data: {
                    quizResult: quizResult,
                },
            });
        }, 500);
    });
};
export const emptyQuizDataList = async () => {
    showLoading(10, true);
    return new Promise(resolve => {
        setTimeout(() => {
            const Char = KEY_QUIZ_CHAR;
            const storageDataLength = localStorage.length;
            for (let i = storageDataLength - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key) {
                    if (key.indexOf(Char) === 0) {
                        localStorage.removeItem(key);
                    }
                }
            }
            hideLoading();
            resolve({
                code: 200,
                data: {
                    quizResult: [],
                },
            });
        }, 500);
    });
};
export const getQuizResult = async (): Promise<any[]> => {
    showLoading(10, true);
    return new Promise(resolve => {
        setTimeout(() => {
            const Char = KEY_QUIZ_CHAR;
            const quizResult: any[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    if (key.indexOf(Char) === 0) {
                        quizResult.push({
                            attemptKey: key,
                            ...getObjectLocalStoreData(key),
                        });
                    }
                }
            }

            // asc sort
            quizResult.sort((a, b) => {
                if (a.regdate < b.regdate) {
                    return -1;
                } else if (a.regdate > b.regdate) {
                    return 1;
                } else {
                    return 0;
                }
            });

            hideLoading();
            resolve(quizResult);
        }, 500);
    });
};
export const setFormData = (data: ILogic_Data_FormData_StoreInfo) => {
    let newAllFormDataList: ILogic_Data_Page_Data_Info[] = [];
    const currPageData = getPageFormData(data.pageId);
    const newFormData: ILogic_Data_FormData_Info = {
        objId: data.objId,
        formValue: data.formValue,
        isChecked: data.isChecked,
        formType: data.formType,
    };
    if (currPageData) {
        const currPageFormDataList = (currPageData.formData ||
            []) as ILogic_Data_FormData_Info[];
        const newPageFormDataList = currPageFormDataList.filter(
            item => item.objId !== data.objId,
        );
        newPageFormDataList.push(newFormData);
        currPageData.formData = newPageFormDataList;

        const allFormDataList = getAllFormData();
        newAllFormDataList = allFormDataList.filter(
            item => item.pageId !== data.pageId,
        );
        newAllFormDataList.push(currPageData);
    } else {
        const newPageData = {
            pageId: data.pageId,
            formData: [newFormData],
        };
        newAllFormDataList = getAllFormData();
        newAllFormDataList.push(newPageData);
    }
    setObjectLocalStoreData(KEY_FORM_DATA, newAllFormDataList);
};
export const getFormData = (pageId: string, objId: string) => {
    const pageFormData = getPageFormData(pageId);
    if (pageFormData) {
        const formDataList = pageFormData.formData || [];
        const formData =
            formDataList.find((item: any) => item.objId === objId) || null;
        if (formData) {
            return formData;
        }
        return null;
    }
    return null;
};
export const getAllFormData = () => {
    return (getObjectLocalStoreData(KEY_FORM_DATA) ||
        []) as ILogic_Data_Page_Data_Info[];
};
export const getPageFormData = (pageId: string) => {
    const allFormDataList = getAllFormData();
    return allFormDataList.find(item => item.pageId === pageId) || null;
};
export const clearAllFormData = () => {
    window.localStorage.removeItem(KEY_FORM_DATA);
};
export const clearPageFormData = (pageId: string) => {
    const allFormDataList = getAllFormData();
    const newAllFormDataList = allFormDataList.filter(
        item => item.pageId !== pageId,
    );
    setObjectLocalStoreData(KEY_FORM_DATA, newAllFormDataList);
};
//KEY_USER_LANG
export const getUserLang = () => {
    return (window.localStorage.getItem(KEY_USER_LANG) ||
        getEnvLang()) as EuserLang;
};
export const setUserLang = (lang: EuserLang) => {
    window.localStorage.setItem(KEY_USER_LANG, lang);
};
//KEY_RES_VIEW_TYPE
export const getResViewType = () => {
    return (window.localStorage.getItem(KEY_RES_VIEW_TYPE) ||
        EresViewType.icon) as EresViewType;
};
export const setResViewType = (viewType: EresViewType) => {
    window.localStorage.setItem(KEY_RES_VIEW_TYPE, viewType);
};
//KEY_FONT_HISTORY_LIST
/* font history list */
export const getFontHistoryList = (): string[] => {
    return getObjectLocalStoreData(KEY_FONT_HISTORY_LIST) || [];
};
export const addFontHistory = (fontName: string) => {
    let newFontList: string[] = [];
    const orgFontList = getFontHistoryList();
    if (orgFontList.length) {
        newFontList = orgFontList.filter((font: string) => font !== fontName);
    }
    newFontList.unshift(fontName);
    // 최신 fontHistoryCnt개만 세팅
    newFontList = newFontList.slice(0, fontHistoryCnt);
    setObjectLocalStoreData(KEY_FONT_HISTORY_LIST, newFontList);
};
export const emptyFontHistoryList = () => {
    window.localStorage.removeItem(KEY_FONT_HISTORY_LIST);
};

//KEY_SPECIALCHARS_HISTORY_LIST
export const getSpecialCharsHistoryList = (): {
    category: number;
    list: string[];
} => {
    const dataObj = getObjectLocalStoreData(KEY_SPECIALCHARS_HISTORY_LIST) || {
        list: [],
        category: 0,
    };
    const list = dataObj.list;
    const newList = list.slice(0, specialCharsHistoryCnt);
    return {
        ...dataObj,
        list: newList,
    };
};
export const addSpecialCharsHistory = (char = '') => {
    char = char.trim();
    if (!char) return;
    let newList: string[] = [];
    const orgDataObj = getSpecialCharsHistoryList();
    if (orgDataObj.list.length) {
        newList = orgDataObj.list.filter((str: string) => str !== char);
    }
    newList.unshift(char);
    // 최신 specialCharsHistoryCnt 개만 세팅
    newList = newList.slice(0, specialCharsHistoryCnt);
    const newDataObj = {
        ...orgDataObj,
        list: newList,
    };
    setObjectLocalStoreData(KEY_SPECIALCHARS_HISTORY_LIST, newDataObj);
};
export const setSpecialCharsCategoryHistory = (category = 0) => {
    const orgDataObj = getSpecialCharsHistoryList();
    const newDataObj = {
        ...orgDataObj,
        category,
    };
    setObjectLocalStoreData(KEY_SPECIALCHARS_HISTORY_LIST, newDataObj);
};
export const emptySpecialCharsHistoryList = () => {
    window.localStorage.removeItem(KEY_SPECIALCHARS_HISTORY_LIST);
};
export const getPdfTextInfo = async (textUrl: string) => {
    return await instance({
        url: `${textUrl}`,
        method: 'get',
    })
        .then(res => {
            console.log('res', res);
            return res.data;
        })
        .catch(() => {
            return null;
        });
};

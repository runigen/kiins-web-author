import { showLoading, hideLoading, getCurrentDateTime } from '../util';
import {
    ILogic_Data_FormData_Info,
    ILogic_Data_Page_Data_Info,
    ILogic_Data_FormData_StoreInfo,
} from '../types';

const KEY_FORM_DATA = 'MCDFD';
const KEY_QUIZ_CHAR = 'MCDQ';

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
export const getUserId = () => {
    return window.localStorage.getItem('userId') || '';
};
export const setUserId = (userId: string) => {
    window.localStorage.setItem('userId', userId);
};
export const saveQuizResult = async (quizResult: any[]) => {
    showLoading(10, true);
    return new Promise(resolve => {
        setTimeout(() => {
            // key : MCQ001
            const Char = 'MCDQ';
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
        }, 1000);
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

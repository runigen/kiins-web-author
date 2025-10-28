import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../../store';
// import $ from 'jquery';
import { ETemplateType } from '../../../../../const/types';
// import * as LineTpl from '../../../../../util/templates/LineTemplate';
// import NumberForm from '../../../../../util/NumberForm';
// import * as dostack from '../../../../../util/dostack';
import * as objects from '../../../../../util/objects';
// import { cancelBubble, parseJsonData } from '../../../../../util/common';
import { showToastMessage } from '../../../../../util/dialog';

const ResultTemplate = observer(() => {
    const { docData, workInfo } = store;
    const currObject = workInfo.getObject();
    // const currObjectGroup = workInfo.getObjectGroup();
    // const currObjectList = workInfo.getObjectList();
    const docContentList = docData.getDocContentsList();
    const [qPageObjectList, setQPageObjectList] = useState<
        { pageId: string; pageName: string }[]
    >([]);
    const [qPageList, setQPageList] = useState<
        { pageId: string; pageName: string }[]
    >([]);
    const [resultFieldList, setResultFieldList] = useState<string[]>([]);
    const [objResultFieldList, setObjResultFieldList] = useState<string[]>([]);
    const [resultTplType, setResultTplType] = useState<string>('');
    const [resultTplTypeList, setResultTplTypeList] = useState<string[]>([]);

    const constResultFieldList = [
        'attempt',
        'date',
        'score',
        'rate',
        'correct',
        'total',
    ];
    const constResultTplTypeList = ['table', 'chart'];

    useEffect(() => {
        console.log('currObject useEffect  Called : ');
        if (currObject) {
            const list = objects.getResultQPageList(currObject);
            setQPageObjectList(list);

            const fieldList = objects.getObjResultFieldList(currObject);
            setObjResultFieldList(fieldList);
        } else {
            setQPageObjectList([]);
            setResultFieldList([]);
            setObjResultFieldList([]);
            setResultTplTypeList([]);
            setResultTplType('');
        }
    }, [currObject]);

    useEffect(() => {
        console.log('qPageObjectList : ', qPageObjectList);
        const newObject = workInfo.getObject();
        if (newObject) {
            const qPageObjectIdList = qPageObjectList.map(item => item.pageId);
            objects.setResultQPageList(newObject, qPageObjectIdList);

            if (qPageObjectList.length > 0) {
                setResultTplTypeList(constResultTplTypeList);
                const tplType = objects.getObjResultTplType(newObject);
                setResultTplType(tplType);
            } else {
                setResultFieldList([]);
                setObjResultFieldList([]);
                setResultTplTypeList([]);
                setResultTplType('');
            }
        }
    }, [qPageObjectList]);

    useEffect(() => {
        console.log('objResultFieldList : ', objResultFieldList);
        const newObject = workInfo.getObject();
        if (newObject) {
            objects.setObjResultFieldList(newObject, objResultFieldList);
            // const objResultTplType = objects.getObjResultTplType(newObject);

            // if (objResultFieldList.length) {
            //     objects.setResultTableChartFlag(
            //         newObject,
            //         objResultTplType,
            //         true,
            //     );
            // } else {
            //     objects.setResultTableChartFlag(
            //         newObject,
            //         objResultTplType,
            //         false,
            //     );
            // }
        }
    }, [objResultFieldList]);

    useEffect(() => {
        console.log('qPageObjectList : ', qPageObjectList);
        const newObject = workInfo.getObject();
        if (newObject) {
            objects.setObjResultTplType(newObject, resultTplType);
            if (resultTplType === '') {
                setResultFieldList([]);
                setObjResultFieldList([]);
                objects.setResultTableFlag(newObject, false);
            } else {
                setResultFieldList(constResultFieldList);
                if (resultTplType === 'table') {
                    objects.setResultTableFlag(newObject, true);
                } else {
                    objects.setResultChartFlag(newObject, true);
                }
            }
        }
    }, [resultTplType]);

    useEffect(() => {
        if (docContentList.length === 0) {
            setQPageList([]);
        } else {
            const newQPageList: any[] = [];
            for (const item of docContentList) {
                if (
                    item.docPageTplType === ETemplateType.quiz ||
                    item.docPageTplType === ETemplateType.select ||
                    item.docPageTplType === ETemplateType.line
                ) {
                    newQPageList.push({
                        pageId: item.docPageId,
                        pageName: item.docPageName,
                    });
                }
            }
            setQPageList(newQPageList);
        }
    }, [docContentList]);

    const addQuestionPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newObject = workInfo.getObject();
        if (!newObject) {
            showToastMessage('오브젝트를 선택해주세요.');
            event.currentTarget.value = '';
            return;
        }

        const targetPageId = event.currentTarget.value;
        const targetPageName =
            event.currentTarget.options[event.currentTarget.selectedIndex].text;
        if (targetPageId === '') {
            showToastMessage('Please select a page.');
            return;
        }
        setQPageObjectList(pageInfo => {
            const isExist = pageInfo.some(item => item.pageId === targetPageId);
            if (isExist) {
                showToastMessage('이미 추가된 페이지입니다.');
                console.log('duplicate page');
                return pageInfo;
            } else {
                const currInfo = [
                    ...pageInfo,
                    { pageId: targetPageId, pageName: targetPageName },
                ];
                return currInfo;
            }
        });
        event.currentTarget.value = '';
    };
    const delPage = (pageId: string) => {
        setQPageObjectList(pageInfo => {
            return pageInfo.filter(item => item.pageId !== pageId);
        });
    };

    const addResultField = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newObject = workInfo.getObject();
        if (!newObject) {
            showToastMessage('오브젝트를 선택해주세요.');
            event.currentTarget.value = '';
            return;
        }

        const targetFieldName = event.currentTarget.value;
        if (targetFieldName === '') {
            showToastMessage('Please select a page.');
            return;
        }
        setObjResultFieldList(resultFields => {
            const isExist = resultFields.some(
                field => field === targetFieldName,
            );
            if (isExist) {
                showToastMessage('이미 추가된 페이지입니다.');
                console.log('duplicate page');
                return resultFields;
            } else {
                const currInfo = [...resultFields, targetFieldName];
                return currInfo;
            }
        });
        event.currentTarget.value = '';
    };

    const delField = (fieldName: string) => {
        setObjResultFieldList(resultFields => {
            return resultFields.filter(field => field !== fieldName);
        });
    };

    const changeResultTplType = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const tplType = event.currentTarget.value;
        setResultTplType(tplType);
    };

    return (
        <>
            <div className="box-input">
                <span>target question page :</span>
                <select
                    name="idx_result_tpl_q_page_select"
                    id="idx_result_tpl_q_page_select"
                    onChange={addQuestionPage}
                >
                    <option value="">select page</option>
                    {qPageList.map(item => {
                        return (
                            <option key={item.pageId} value={item.pageId}>
                                {item.pageName}
                            </option>
                        );
                    })}
                </select>
                <div className="q-page-list">
                    {qPageObjectList.map(item => {
                        return (
                            <div
                                className="q-page-item"
                                key={item.pageId}
                                {...{
                                    'tpl-page-id': item.pageId,
                                    'tpl-page-name': item.pageName,
                                }}
                            >
                                {item.pageName}
                                <button
                                    className="btn-del"
                                    onClick={() => delPage(item.pageId)}
                                ></button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="box-input">
                <span>result type :</span>
                <select
                    name="idx_result_tpl_type_select"
                    id="idx_result_tpl_type_select"
                    onChange={changeResultTplType}
                    defaultValue={resultTplType}
                    key={resultTplType}
                >
                    <option value="">none</option>
                    {resultTplTypeList.map(item => {
                        return (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="box-input">
                <span>data field :</span>
                <select
                    name="idx_result_tpl_field_select"
                    id="idx_result_tpl_field_select"
                    onChange={addResultField}
                >
                    <option value="">select field</option>
                    {resultFieldList.map(item => {
                        return (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        );
                    })}
                </select>
                <div className="q-page-list">
                    {objResultFieldList.map(item => {
                        return (
                            <div
                                className="q-page-item"
                                key={item}
                                {...{
                                    'tpl-field-name': item,
                                }}
                            >
                                {item}
                                <button
                                    className="btn-del"
                                    onClick={() => delField(item)}
                                ></button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
});

export default ResultTemplate;

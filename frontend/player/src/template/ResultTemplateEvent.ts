import * as CommonEvent from './CommonEvent';
import {
    getPreviewContainer,
    getResultQPageList,
    getObjResultTplType,
    getObjResultFieldList,
} from '../util';
import * as DataStore from '../store/DataStore';
import ApexCharts from 'apexcharts';

const dataLimitSize = 10;
export const setTemplateEvent = async (previewIdChar = '') => {
    console.log('setTemplateEvent');
    console.log('resultDataList', CommonEvent.getResultDataList());
    const resultDataList = CommonEvent.getResultDataList();

    /**
     * 1페이지에 1문제만 있는 선긋기, 객관식 유형 (line, select)
     */
    const totalCount = resultDataList.length;
    const correctCount =
        totalCount > 0 ? resultDataList.filter(item => item.correct).length : 0;

    const previewContainer = getPreviewContainer();
    if (previewContainer === null) return;
    const textboxList = previewContainer.querySelectorAll('.object .textbox');
    textboxList.forEach((textbox: any) => {
        const exp = /#CORRECT#/g;
        const innerContent = textbox.innerHTML;
        if (exp.test(innerContent)) {
            const newContent = innerContent.replace(exp, correctCount);
            textbox.innerHTML = newContent;
        }

        const exp2 = /#TOTAL#/g;
        const innerContent2 = textbox.innerHTML;
        if (exp2.test(innerContent2)) {
            const newContent2 = innerContent2.replace(exp2, totalCount);
            textbox.innerHTML = newContent2;
        }
    });

    /**
     * 1페이지에 2문제 이상 있는 객관식, 주관식 유형 (quiz)
     */
    // table
    const storedQuizResult = await DataStore.getQuizResult();
    console.log('storedQuizResult', storedQuizResult);
    const resultTableObjList = previewContainer.querySelectorAll(
        '.object.result-table, .object.result-chart',
    ) as NodeListOf<HTMLDivElement>;

    resultTableObjList.forEach((resultTableObj: HTMLDivElement) => {
        const printDataList: any[] = [];

        const qPageInfoList = getResultQPageList(resultTableObj);
        const resultType = getObjResultTplType(resultTableObj);
        const resultFieldList = getObjResultFieldList(resultTableObj);
        console.log('resultFieldList: ', resultFieldList);
        console.log('resultType: ', resultType);
        console.log('qPageInfoList', qPageInfoList);
        for (const qPageInfo of qPageInfoList) {
            console.log('qPageInfo', qPageInfo);
            const pageId = previewIdChar + qPageInfo.pageId;
            console.log('pageId', pageId);

            for (const quizResultLine of storedQuizResult) {
                console.log('quizResultLine', quizResultLine);
                const targetResult = quizResultLine.quizResult.find(
                    (item: any) => item.pageId === pageId,
                );
                console.log('targetResult', targetResult);
                if (targetResult === undefined) continue;

                const { correctCnt, totalCnt, regDate } = targetResult;
                const attemptKey = quizResultLine.attemptKey;
                const printData = {
                    regDate,
                    correctCnt,
                    totalCnt,
                    attemptKey,
                };
                if (printDataList[attemptKey] === undefined) {
                    printDataList[attemptKey] = printData;
                } else {
                    const sumTotalCnt =
                        printDataList[attemptKey].totalCnt + totalCnt;
                    const sumCorrectCnt =
                        printDataList[attemptKey].correctCnt + correctCnt;
                    printDataList[attemptKey] = {
                        regDate:
                            printDataList[attemptKey].regDate > regDate
                                ? printDataList[attemptKey].regDate
                                : regDate,
                        correctCnt: sumCorrectCnt,
                        totalCnt: sumTotalCnt,
                        attemptKey: attemptKey,
                    };
                }
                // printDataList.push(printData);
            }
        }

        console.log('printDataList', printDataList);

        const printViewList: any[] = [];
        let cnt = 0;
        for (const key in printDataList) {
            const currData = printDataList[key];
            console.log('printDataList printData', currData);
            cnt++;
            const rate = Math.ceil(
                Math.round((currData.correctCnt / currData.totalCnt) * 100),
            );
            printViewList.push({
                ...currData,
                attempt: cnt,
                rate: rate,
                correct: currData.correctCnt,
                total: currData.totalCnt,
                score: currData.correctCnt + '/' + currData.totalCnt,
                date:
                    currData.regDate.substring(0, 4) +
                    '.' +
                    currData.regDate.substring(4, 6) +
                    '.' +
                    currData.regDate.substring(6, 8),
            });
        }

        printViewList.sort((a, b) => {
            return a.attemptKey - b.attemptKey;
        });
        printViewList.sort((a, b) => {
            return a.regDate - b.regDate;
        });
        console.log('printData printViewList', printViewList);
        console.log('printData printViewList len', printViewList.length);

        //dataLimitSize 제한 (과거 데이터는 제거), + attempt 재정렬
        if (printViewList.length > dataLimitSize) {
            printViewList.splice(0, printViewList.length - dataLimitSize);
            printViewList.map(
                (item: any, index: number) => (item.attempt = index + 1),
            );
        }

        if (printViewList.length) {
            // table 그리기
            if (resultType === 'table') {
                const tableObj = document.createElement('table');
                tableObj.classList.add('result-table');

                const theadObj = document.createElement('thead');
                const tbodyObj = document.createElement('tbody');
                const trObj = document.createElement('tr');

                // header
                resultFieldList.forEach((resultField: any) => {
                    const thObj = document.createElement('th');
                    thObj.innerHTML = resultField;
                    trObj.appendChild(thObj);
                });
                theadObj.appendChild(trObj);

                // body
                for (const printData of printViewList) {
                    console.log(printData.totalCnt);
                    const trObj = document.createElement('tr');

                    resultFieldList.forEach((resultField: string) => {
                        const tdObj = document.createElement('td');
                        let tdText = String(printData[resultField]);
                        if (resultField === 'rate') {
                            tdText = tdText + '%';
                        } else if (resultField === 'score') {
                            tdText = `<span class="correct-cnt">${printData.correctCnt}</span> / <span class="total-cnt">${printData.totalCnt}</span>`;
                        } else if (resultField === 'correct') {
                            tdText = printData.correctCnt;
                        } else if (resultField === 'total') {
                            tdText = printData.totalCnt;
                        }
                        tdObj.innerHTML = tdText;
                        trObj.appendChild(tdObj);
                    });
                    tbodyObj.appendChild(trObj);
                }

                tableObj.appendChild(theadObj);
                tableObj.appendChild(tbodyObj);
                resultTableObj.appendChild(tableObj);

                // chart 그리기
            } else {
                console.log('draw chart');

                if (resultFieldList.length < 2) return;

                const xList = printViewList.map(
                    item => item[resultFieldList[0]],
                );
                const yList = printViewList.map(
                    item => item[resultFieldList[1]],
                );

                const options = {
                    chart: {
                        type: 'line',
                        // dropShadow: {
                        //     enabled: true,
                        //     color: '#000',
                        //     top: 18,
                        //     left: 7,
                        //     blur: 10,
                        //     opacity: 0.2,
                        // },
                        toolbar: {
                            show: false,
                        },
                    },
                    series: [
                        {
                            name: 'Rate',
                            data: yList,
                        },
                    ],
                    xaxis: {
                        type: 'category',
                        categories: xList,
                        title: {
                            text: 'Attempt',
                        },
                        min: 0,
                        max: 10,
                    },
                    yaxis: {
                        // title: {
                        //     text: 'Rate',
                        // },
                        title: {
                            text: 'Rate',
                            rotate: 0,
                            offsetX: 0,
                            offsetY: 0,
                            style: {
                                color: undefined,
                                fontSize: '12px',
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                fontWeight: 600,
                                cssClass: 'apexcharts-yaxis-title',
                            },
                        },
                        min: 0,
                        max: 100,
                        forceNiceScale: false,
                        labels: {
                            show: true,
                        },
                    },
                    stroke: {
                        width: 2,
                    },

                    colors: ['#70ad47'],

                    // stroke: {
                    //     curve: 'smooth',
                    // },
                    // dataLabels: {
                    //     enabled: true,
                    //     background: {
                    //         enabled: true,
                    //         foreColor: '#fff',
                    //         padding: 4,
                    //         borderRadius: 2,
                    //         borderWidth: 1,
                    //         borderColor: '#fff',
                    //         opacity: 0.9,
                    //         dropShadow: {
                    //             enabled: false,
                    //             top: 1,
                    //             left: 1,
                    //             blur: 1,
                    //             color: '#000',
                    //             opacity: 0.45,
                    //         },
                    //     },
                    // },
                    // title: {
                    //     text: 'Average High & Low Temperature',
                    //     align: 'left'
                    //   },
                    grid: {
                        borderColor: '#e7e7e7',
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5,
                        },
                        // padding: {
                        //     top: 50,
                        //     right: 50,
                        //     bottom: 50,
                        //     left: 50,
                        // },
                    },
                    markers: {
                        size: [10, 10],
                        colors: '#70ad47',
                        strokeColors: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 0.9,
                        strokeDashArray: 0,
                        fillOpacity: 1,
                        discrete: [],
                        shape: 'circle',
                        radius: 2,
                        offsetX: 0,
                        offsetY: 0,
                        onClick: undefined,
                        onDblClick: undefined,
                        showNullDataPoints: true,
                        hover: {
                            size: undefined,
                            sizeOffset: 3,
                        },
                    },
                };

                const chart = new ApexCharts(resultTableObj, options);
                chart.render();
            }
        }
    });
};

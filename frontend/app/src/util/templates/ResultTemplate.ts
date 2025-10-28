import $ from 'jquery';
import {
    IshapeInfo,
    IstyleInfo,
    IstretchCssInfo,
    IobjectSizeInfo,
    IpageSizeInfo,
    EundoStackAddType,
    ETemplateType,
    EobjectType,
    ETemplete_Object_Type,
} from '../../const/types';
import { createTextBox } from '../texteditor';
import * as objects from '../objects';
import * as pages from '../pages';
import * as CommonEvent from '../../event/CommonEvent';
import { showToastMessage, hideToastMessage } from '../../util/dialog';
import workInfo from '../../store/workInfo';
import docData from '../../store/docData';

const templatePreset = {
    page: {
        width: 1280,
        height: 800,
    },
    title: {
        text: '결 과',
        top: 100,
        width: 400,
        height: 100,
        background: '#f2f2f2',
        border: '1px solid #000000',
        fontsize: 50,
    },
    correct_item: {
        text: '#CORRECT#',
        margin: 20,
        width: 200,
        height: 70,
        background: '',
        border: '0px solid #888888',
        fontsize: 25,
    },
    total_item: {
        text: '#TOTAL#',
        margin: 20,
        width: 200,
        height: 70,
        background: '',
        border: '0px solid #888888',
        fontsize: 25,
    },
};

export const loadTemplateData = () => {
    console.log('loadTemplateData');

    // 모든 셀렉션 해제
    CommonEvent.removeSelectors();

    try {
        showToastMessage('템플릿을 불러오는 중입니다.', 10000, false);
        setTempatePage();
        hideToastMessage();
    } catch (e) {
        console.log(e);
    }
};

export const setTempatePage = () => {
    // 페이지 내용 비우기
    // pages.emptyCanvasContent();

    // // 페이지 생성
    // const canvasObj = pages.getCanvasObject();
    // const pageObj = pages.createPageObject();
    // canvasObj.appendChild(pageObj);

    // const currPageNo = docData.getCurrPage();
    // pages.setPageName('Page-' + (currPageNo > 9 ? currPageNo : '0' + currPageNo));
    // pages.setPageSize(
    //     {
    //         width: templatePreset.page.width,
    //         height: templatePreset.page.height,
    //     },
    //     false,
    // );
    pages.setTempatePage(ETemplateType.result);

    // 데이터 세팅
    makeBodyContentBox();
    docData.setDocPageContent($('#idx_canvas_sheet').html());
};

const makeBodyContentBox = () => {
    console.log('makeBodyContentBox');
    // const questionIndex = pageNo - 1;

    // pages.setPageName('Page-' + (pageNo > 9 ? pageNo : '0' + pageNo));
    // pages.setPageSize(
    //     {
    //         width: templatePreset.page.width,
    //         height: templatePreset.page.height,
    //     },
    //     false,
    // );
    // pages.setTempatePage(ETemplateType.result);

    // 1. 페이지 사이즈 세팅
    const pageObj = pages.getPageObject();
    templatePreset.page.width = pageObj.offsetWidth;

    // 2. 타이틀 오브젝트 생성
    makeTitleBox(templatePreset.title.text);

    // 3. 결과 오브젝트 생성
    makeResultBox();
};
const makeTitleBox = (titleText: string) => {
    const titleObj = objects.createNewObject(
        EobjectType.square,
        titleText,
    ) as HTMLDivElement;
    const textBox = createTextBox(titleText, templatePreset.title.fontsize);

    titleObj.appendChild(textBox);

    $(titleObj).css({
        top: templatePreset.title.top,
        left: templatePreset.page.width / 2 - templatePreset.title.width / 2,
        width: templatePreset.title.width,
        height: templatePreset.title.height,
        background: templatePreset.title.background,
        border: templatePreset.title.border,
    });
    workInfo.addObjectList(titleObj);
};
const makeResultBox = () => {
    // 1. correct item
    const correctObj = objects.createNewObject(
        EobjectType.square,
        'correct',
    ) as HTMLDivElement;
    $(correctObj).attr('tpl-object-type', ETemplete_Object_Type.result);
    $(correctObj).css({
        top:
            templatePreset.title.top +
            templatePreset.title.height +
            templatePreset.title.top +
            templatePreset.correct_item.height +
            templatePreset.correct_item.margin,
        left:
            templatePreset.page.width / 2 -
            templatePreset.correct_item.width -
            templatePreset.correct_item.margin,
        width: templatePreset.correct_item.width,
        height: templatePreset.correct_item.height,
        background: templatePreset.correct_item.background,
        border: templatePreset.correct_item.border,
    });
    const textBox1 = createTextBox(
        templatePreset.correct_item.text,
        templatePreset.correct_item.fontsize,
    );
    correctObj.appendChild(textBox1);
    workInfo.addObjectList(correctObj);

    // 2. separator item
    const separatorObj = objects.createNewObject(
        EobjectType.square,
        'separator',
    ) as HTMLDivElement;
    $(separatorObj).attr('tpl-object-type', ETemplete_Object_Type.result);
    $(separatorObj).css({
        top:
            templatePreset.title.top +
            templatePreset.title.height +
            templatePreset.title.top +
            templatePreset.correct_item.height +
            templatePreset.correct_item.margin,
        left:
            templatePreset.page.width / 2 - templatePreset.correct_item.margin,
        width: templatePreset.correct_item.margin * 2,
        height: templatePreset.correct_item.height,
    });
    const textBox2 = createTextBox('/', templatePreset.correct_item.fontsize);
    separatorObj.appendChild(textBox2);
    workInfo.addObjectList(separatorObj);

    // 3. total item
    const totalObj = objects.createNewObject(
        EobjectType.square,
        'total',
    ) as HTMLDivElement;
    $(totalObj).attr('tpl-object-type', ETemplete_Object_Type.result);
    $(totalObj).css({
        top:
            templatePreset.title.top +
            templatePreset.title.height +
            templatePreset.title.top +
            templatePreset.total_item.height +
            templatePreset.total_item.margin,
        left: templatePreset.page.width / 2 + templatePreset.total_item.margin,
        width: templatePreset.total_item.width,
        height: templatePreset.total_item.height,
        background: templatePreset.total_item.background,
        border: templatePreset.total_item.border,
    });
    const textBox3 = createTextBox(
        templatePreset.total_item.text,
        templatePreset.total_item.fontsize,
    );
    totalObj.appendChild(textBox3);
    workInfo.addObjectList(totalObj);
};

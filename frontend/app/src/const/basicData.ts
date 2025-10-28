import {
    IlistDialogItems,
    IinteractionTriggerInfo,
    IinteractionActionInfo,
    // EpreviewPlayStatus,
    IstretchInfo,
    IborderListInfo,
    IdefaultObjectStyleInfo,
    // IorderObjectListInfo,
    IpageSizeInfo,
    // ITextEditorToolsInfo,
    // ETextEditorToolsType,
    // ETextEditorToolsName,
    // ETextEditorToolsUnit,
    ELogic_Action_Transform_Operator_Type,
    ELogic_Normal_Actions_Type,
    ELogic_Action_Transform_Size_Type,
    ELogic_Action_Data_Field_Type,
    IPage_Dimension_Info,
} from './types';
export const timelineMoveMagnetic = true; // 타일라인 룰러 프로그래스바 이동시 10 픽셀 단위로 달라붙게
export const undoStackLimit = 10; // undo 기록 단계 수
export const addUndoStackTimerDelay = 0.7; // 변경이벤트가 연속으로 발생할때 몇초간 이벤트가 정지하면 undo stack 에 기록할 것인지 설정 ()
export const workSpaceMinSizeConst = 50; // 캔버스 대비 워크스페이스의 크기 추가값(워크스페이스의 가로/세로길이를 이 값만큼 캔버스보다 크게 설정)
export const canvasZoomPreset: number[] = [25, 33, 50, 100, 150, 200, 300, 400];
export const logicCanvasZoomPreset: number[] = [
    30, 50, 100, 150, 200, 300, 400,
];
export const canvasZoomStep = 10; // 마우스 스크롤시 변화할 값
export const timelineZoomMin = 10;
export const timelineZoomMax = 300;
export const timelineZoomStep = 10;
export const timelineDefaultLimit = 30; // 타임라인 범위 디폴트값 (sec)
export const timelineObjectGroupDepthIndent = 20; // 타임라인에 표기되는 오브젝트 그룹의 1뎁스당 들여쓰기 단위
export const objectMultiSelectorMinSize = 10; // 오브젝트 멀티셀렉터의 최소 크기
export const autoSaveTimerDelay = 60 * 1; // 자동저장 타이머 딜레이 (초)
export const colorPreset: string[][] = [
    [
        '#000000',
        '#434343',
        '#666666',
        '#999999',
        '#b7b7b7',
        '#cccccc',
        '#d9d9d9',
        '#efefef',
        '#f3f3f3',
        '#ffffff',
    ],
    [
        '#891f0d',
        '#e73b1e',
        '#ef9f2c',
        '#fefe41',
        '#79f938',
        '#7bfafe',
        '#5b85e4',
        '#1010f9',
        '#8c26fa',
        '#e83ffb',
    ],
    [
        '#debab0',
        '#edcecd',
        '#f8e6cf',
        '#fcf2ce',
        '#dce9d4',
        '#d3dfe3',
        '#cdd9f6',
        '#d3e1f2',
        '#d8d2e8',
        '#e5d2dc',
    ],
    [
        '#cf846e',
        '#dd9e9a',
        '#f1cda0',
        '#fae69f',
        '#bdd5aa',
        '#a9c3c8',
        '#abc1f1',
        '#a8c4e6',
        '#b2a8d4',
        '#cda9bd',
    ],
    [
        '#bb4e2e',
        '#cf6f69',
        '#eab572',
        '#f8da71',
        '#9ec281',
        '#81a3ae',
        '#799de7',
        '#7da6d9',
        '#8b7dc0',
        '#b77f9f',
    ],
    [
        '#972f10',
        '#b92d15',
        '#d89645',
        '#e8c447',
        '#79a655',
        '#557f8d',
        '#4e77d4',
        '#5283c3',
        '#6350a4',
        '#9a5478',
    ],
    [
        '#792b14',
        '#8a200d',
        '#a7651d',
        '#b79224',
        '#4f782d',
        '#284e5b',
        '#2c55c8',
        '#285291',
        '#321f72',
        '#692547',
    ],
    [
        '#521805',
        '#5c1206',
        '#6f4311',
        '#796115',
        '#314d19',
        '#19333c',
        '#294484',
        '#193661',
        '#1e144b',
        '#451730',
    ],
];
export const presetColors = [
    '#D0021B',
    '#F5A623',
    '#F8E71C',
    '#8B572A',
    '#7ED321',
    '#417507',
    '#BD10E0',
    '#9013FE',
    '#4A90E2',
    '#50E3C2',
    '#B8E986',
    '#000000',
    '#4A4A4A',
    '#9B9B9B',
    '#F2F2F2',
    '#FFFFFF',
]; // react-color 라이브러리 용
export const colorHistoryCnt = 16;
export const userColorCnt = 18;
export const fontHistoryCnt = 5;
export const specialCharsHistoryCnt = 12;
export const listDialogItems: IlistDialogItems[] = [
    {
        listType: 'easing',
        listName: 'Easing Curve',
        listData: [
            { id: 'linear', name: 'Linear' },
            { id: 'inquad', name: 'InQuad' },
            { id: 'outquad', name: 'OutQuad' },
            { id: 'inoutquad', name: 'InOutQuad' },
            { id: 'incubic', name: 'InCublic' },
            { id: 'outcubic', name: 'OutCublic' },
            { id: 'inoutcubic', name: 'InOutCublic' },
            { id: 'insine', name: 'InSine' },
            { id: 'outsine', name: 'OutSine' },
            { id: 'inoutsine', name: 'InOutSine' },
            { id: 'inquart', name: 'InQuart' },
            { id: 'outquart', name: 'OutQuart' },
            { id: 'inoutquart', name: 'InOutQuart' },
            { id: 'inquint', name: 'InQuint' },
            { id: 'outquint', name: 'OutQuint' },
            { id: 'inoutquint', name: 'InOutQuint' },
            { id: 'inexpo', name: 'InExpo' },
            { id: 'outexpo', name: 'OutExpo' },
            { id: 'inoutexpo', name: 'InOutExpo' },
            { id: 'incirc', name: 'InCirc' },
            { id: 'outcirc', name: 'OutCirc' },
            { id: 'inoutcirc', name: 'InOutCirc' },
            { id: 'inelastic', name: 'InElastic' },
            { id: 'outelastic', name: 'OutElastic' },
            { id: 'inoutelastic', name: 'InOutElastic' },
            { id: 'inback', name: 'InBack' },
            { id: 'outback', name: 'OutBack' },
            { id: 'inoutback', name: 'InOutBack' },
            { id: 'step', name: 'Step' },
        ],
    },
    {
        listType: 'transition',
        listName: 'Transition',
        listData: [
            { id: 'appear_appear', name: 'Appear' },
            { id: 'appear_disappear', name: 'Disappear' },
            { id: 'fade_in', name: 'FadeIn' },
            { id: 'fade_out', name: 'FadeOut' },
        ],
    },
];
export const interactionTriggerList: IinteractionTriggerInfo[] = [
    { triggerName: 'mouse click', triggerVal: 'click' },
    { triggerName: 'mouse double click', triggerVal: 'dblclick' },
    { triggerName: 'mouse enter', triggerVal: 'mouseenter' },
    { triggerName: 'mouse leave', triggerVal: 'mouseleave' },
    { triggerName: 'complete', triggerVal: 'complete' },
    { triggerName: 'object collision', triggerVal: 'collision' },
    { triggerName: 'pageload', triggerVal: 'pageload' },
    { triggerName: 'keydown', triggerVal: 'keydown' },
    { triggerName: 'input change', triggerVal: 'change' },
];
export const quizTriggerList: IinteractionTriggerInfo[] = [
    { triggerName: 'quiz input', triggerVal: 'quizinput' },
];

export const interactionPageActionList: IinteractionActionInfo[] = [
    // { actionName: 'Increase Score', actionVal: 'increasescore' },
    // { actionName: 'Decrease Score', actionVal: 'decreasescore' },
    // { actionName: 'Reset Score', actionVal: 'resetscore' },
    { actionName: 'NextPage', actionVal: 'next' },
    { actionName: 'PrevPage', actionVal: 'prev' },
];
export const interactionActionList: IinteractionActionInfo[] = [
    { actionName: 'Play', actionVal: ELogic_Normal_Actions_Type.play },
    { actionName: 'Pause', actionVal: ELogic_Normal_Actions_Type.pause },
    { actionName: 'Restart', actionVal: ELogic_Normal_Actions_Type.restart },
    { actionName: 'Appear', actionVal: ELogic_Normal_Actions_Type.appear },
    {
        actionName: 'Disappear',
        actionVal: ELogic_Normal_Actions_Type.disappear,
    },
    ...interactionPageActionList,
];
export const spriteBgInfo: IstretchInfo = {
    stretchName: 'sprite',
    css: { bgSize: 'auto', bgRepeat: 'no-repeat', bgPosition: 'initial' },
};
export const bgStretchList: IstretchInfo[] = [
    {
        stretchName: 'stretch',
        css: {
            bgSize: '100% 100%',
            bgRepeat: 'no-repeat',
            bgPosition: 'center',
        },
    },
    {
        stretchName: 'center',
        css: { bgSize: 'auto', bgRepeat: 'no-repeat', bgPosition: 'center' },
    },
    {
        stretchName: 'fit',
        css: { bgSize: 'contain', bgRepeat: 'no-repeat', bgPosition: 'center' },
    },
    {
        stretchName: 'tile',
        css: { bgSize: 'auto', bgRepeat: 'repeat', bgPosition: 'initial' },
    },
    {
        stretchName: 'fill',
        css: { bgSize: 'cover', bgRepeat: 'no-repeat', bgPosition: 'center' },
    },
];
export const defaultBgStretchList: IstretchInfo = bgStretchList[0];
export const borderStyleList: IborderListInfo[] = [
    { name: 'none', value: 'none' },
    { name: 'solid', value: 'solid' },
    { name: 'dot', value: 'dotted' },
    { name: 'dash', value: 'dashed' },
];
export const defaultObjectStyleInfo: IdefaultObjectStyleInfo = {
    backgroundColor: '#f2f2f2',
    opacity: 1,
    borderStyle: 'none',
    borderWidth: 0,
    borderColor: 'rgb(0,0,0)',
};
export const defaultPageSizeInfo: IpageSizeInfo = {
    width: 1280,
    height: 800,
};
export const defaultPageBgColor = '#ffffff';

/** texteditor */
export const TextEditorToolsTopMargin = 10;
// export const dynamicTextEditorTools: ITextEditorToolsInfo[][] = [
//     [
//         {
//             type: ETextEditorToolsType.combobox,
//             execName: ETextEditorToolsName.fontfamily,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.dropdowninput,
//             execName: ETextEditorToolsName.fontsize,
//             unit: ETextEditorToolsUnit.pixcel,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.separator,
//             execName: ETextEditorToolsName.none,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.color,
//             execName: ETextEditorToolsName.forecolor,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.color,
//             execName: ETextEditorToolsName.backcolor,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.bold,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.italic,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.underline,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.strikethrough,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.superscript,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.subscript,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//     ],

//     [
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.left,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.center,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.right,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.justify,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.separator,
//             execName: ETextEditorToolsName.none,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.top,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.middle,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.bottom,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.separator,
//             execName: ETextEditorToolsName.none,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.indent,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.outdent,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.dropdown,
//             execName: ETextEditorToolsName.lineheight,
//             unit: ETextEditorToolsUnit.percent,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.insertunorderedlist,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.button,
//             execName: ETextEditorToolsName.insertorderedlist,
//             unit: ETextEditorToolsUnit.none,
//             title: '',
//         },
//         {
//             type: ETextEditorToolsType.dropdown,
//             execName: ETextEditorToolsName.padding,
//             unit: ETextEditorToolsUnit.pixcel,
//             title: '',
//         },
//     ],
// ];
export const fontSizeList: number[] = [
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 25, 27, 30, 35, 40, 45, 50,
    60, 70, 80, 90, 100,
];
export const fontSizeRange = {
    min: 10,
    max: 400,
};
export const letterSpacingList: number[] = [
    -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 70, 100,
];
export const letterSpacingRange = {
    min: -10,
    max: 100,
};
export const fontFamilyList: string[] = [
    'Roboto',
    'Roboto Mono',
    'Roboto Slab',
    'Noto Sans',
    'Noto Sans KR',
    'Noto Serif',
    'Noto Serif KR',
    'Nanum Gothic',
    'Nanum Myeongjo',
    'Open Sans',
    'Dancing Script',
    'Anton',
    'Lobster',
    // 'sans-serif',
    // '궁서체',
];
export const lineHeightList: number[] = [
    100, 120, 140, 160, 180, 200, 250, 300, 350, 400,
];
export const inoutdentPx = '20px';
export const paddingList: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 50, 100,
];
export const transformOperatorList: ELogic_Action_Transform_Operator_Type[] = [
    ELogic_Action_Transform_Operator_Type.equal,
    ELogic_Action_Transform_Operator_Type.minus,
    ELogic_Action_Transform_Operator_Type.plus,
];
export const transformSizeTypeList: ELogic_Action_Transform_Size_Type[] = [
    ELogic_Action_Transform_Size_Type.fix,
    ELogic_Action_Transform_Size_Type.rand,
];
export const dataFieldTypeList: ELogic_Action_Data_Field_Type[] = [
    ELogic_Action_Data_Field_Type.allcheckboxCnt,
    ELogic_Action_Data_Field_Type.checkedCnt,
];
export const pageDimensionList: IPage_Dimension_Info[] = [
    {
        name: '---- PC ----',
        width: 0,
        height: 0,
    },
    {
        name: 'VGA',
        width: 640,
        height: 480,
    },
    {
        name: 'WVGA',
        width: 800,
        height: 480,
    },
    {
        name: 'SVGA',
        width: 800,
        height: 600,
    },
    {
        name: 'XGA',
        width: 1024,
        height: 768,
    },
    {
        name: 'WXGA',
        width: 1280,
        height: 800,
    },
    {
        name: 'HD',
        width: 1366,
        height: 768,
    },
    {
        name: 'WXGA+',
        width: 1440,
        height: 900,
    },
    {
        name: 'HD+',
        width: 1600,
        height: 900,
    },
    {
        name: 'FHD',
        width: 1920,
        height: 1080,
    },
    {
        name: 'WUXGA',
        width: 1920,
        height: 1200,
    },
    {
        name: 'QHD',
        width: 2560,
        height: 1440,
    },
    {
        name: 'WQXGA',
        width: 2560,
        height: 1600,
    },
    {
        name: 'UWQHD',
        width: 3440,
        height: 1440,
    },
    {
        name: 'UWQHD+',
        width: 3840,
        height: 1600,
    },
    {
        name: 'UHD',
        width: 3840,
        height: 2160,
    },
    {
        name: '---- MOBILE ----',
        width: 0,
        height: 0,
    },
    {
        name: 'IPad Pro',
        width: 1024,
        height: 1366,
    },
    {
        name: 'IPad Air',
        width: 820,
        height: 1180,
    },
    {
        name: 'IPad Mini',
        width: 768,
        height: 1024,
    },
    {
        name: 'Galaxy Tab 10',
        width: 800,
        height: 1280,
    },
    {
        name: 'Galaxy Tab 7',
        width: 600,
        height: 1024,
    },
    {
        name: 'Nexus 9',
        width: 768,
        height: 1024,
    },
    {
        name: 'Custom',
        width: 0,
        height: 0,
    },
];

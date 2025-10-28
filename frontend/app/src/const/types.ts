import { TLANG } from '../const/lang/en';

/* mobx store types */
export interface IDocContents {
    docPageContent: string;
    docPageId: string;
    docPageName: string;
    docPageThumbnail: string;
    docPageTplType: ETemplateType;
    logicContent: string;
    logicActionList: any[];
}
//1. docData
export interface IdocData {
    docNo: string;
    docName: string;
    folderId: number;
    folderPath: any[];
    pageObject: HTMLDivElement | null;
    currPage: number;
    totalPage: number;
    pageUpdateKey: number;
    templateMode: ETemplateType;
    docContentList: IDocContents[];
    docUpdateKey: number;
    modified: boolean;
    fileUpdateKey: number;
}
export enum EuserLang {
    ko = 'ko',
    en = 'en',
}
export interface IuserInfo {
    name: string;
    id: string;
    lang: EuserLang;
    langSet: TLANG;
}
export enum EpreviewPlayStatus {
    play = 'play',
    pause = 'pause',
    resume = 'resume',
    stop = 'stop',
    restart = 'restart',
    disable = 'disable',
}
export enum EworkStatus {
    none = '',
    draw = 'draw',
    selectObject = 'selectObject',
    selectTimeline = 'selectTimeline',
    selectKeyframe = 'selectKeyframe',
    selectTransition = 'selectTransition',
    timeInput = 'timeInput',
}
export interface IworkInfo {
    viewMode: boolean;
    status: EworkStatus;
    object: any;
    objectGroup: any[];
    objectList: any[];
    updateKey: number;
    playing: boolean;
    totalPlayTime: number;
    totalPlayRange: number;
    keyframeRangeList: number[];
    keyframeDataList: any[];
    progressbarPos: number;
    elementDataList: any[];
    currKeyframeTarget: string;
    currKeyframeTimeLeft: number;
    currKeyframeStep: number;
    playTimeInfo: IplayTimeInfo;
    currTransitionStep: number;
    previewPlayStatus: EpreviewPlayStatus;
    undoStackCount: number;
    undoStackIndex: number;
    pageZoom: number;
    timelineZoom: number;
    timelineLimit: number;
    dteStatus: boolean;
    autoKeyframeStatus: boolean;
    whRatio: boolean;
    folderSelected: boolean;
    logicMode: boolean;
    previewPageNo: number;
    modifyObjectKey: number;
    listMode: boolean;
    configMode: boolean;
    showSpecialChars: boolean;
    showPdfTextList: boolean;
    pdfTextUrl: string;
    bModifiedKeyFrame: boolean;
    bModifiedOrderNo: boolean;
    bModifiedInteraction: boolean;
}

/* object shape types */
export interface IdefaultObjectStyleInfo {
    backgroundColor: string;
    opacity: number;
    borderStyle: string;
    borderWidth: number;
    borderColor: string;
}

export interface IshapeInfo {
    top: number;
    left: number;
    width: number;
    height: number;
    rotate: number;
    scale: number;
    opacity: number;
    borderRadius?: string;
}
/* object style types */
export interface IstyleInfo {
    backgroundColor: string;
    backgroundImage: string;
    backgroundSize: string;
    backgroundRepeat: string;
    opacity: number;
}
export interface IborderStyleInfo {
    borderStyle: string;
    borderWidth: number;
    borderColor: string;
    borderOpacity: number;
}
/* object type */
export enum EobjectType {
    none = '',
    square = 'square',
    image = 'image',
    page = 'page',
    folder = 'folder',
    audio = 'audio',
    youtube = 'youtube',
}
/* object bg info */
export interface IobjectBgInfo {
    url: string;
    width: number;
    height: number;
    stretchName: string;
}
export interface IobjectSizeInfo {
    width: number;
    height: number;
}

/* file types */
export interface IfileInfo {
    documentId: string;
    url: string;
    mimeType: string;
    fileExt: string;
    fileName: string;
    fileId: string;
    fileSize: number;
    orgFileName: string;
    regDate: string;
    isUsed?: boolean;
}
export interface IimageSizeInfo {
    width: number;
    height: number;
}
export enum EimageAddType {
    add = 'add',
    replace = 'replace',
    page = 'page',
    none = 'none',
}

/* keyboard event types */
export enum EkeyName {
    ENTER = 'enter',
    ESC = 'escape',
    DEL = 'delete',
    BS = 'backspace',
    RIGHT = 'arrowright',
    LEFT = 'arrowleft',
    UP = 'arrowup',
    DOWN = 'arrowdown',
    META = 'meta',
    CONTROL = 'control',
    SPACE = '32',
}

/* keyframe types*/
export interface IsizeInfo {
    top: number;
    left: number;
    width: number;
    height: number;
    rotate: number;
    scale: number;
    opacity: number;
    borderRadius?: string;
}
export interface IignoreInfo {
    x: boolean;
    y: boolean;
}
export interface IkeyframeInfo {
    timeLeft: number;
    size: IsizeInfo;
    easing?: string;
    ignore: IignoreInfo;
}
export interface IkeyFrameStepMoveInfo {
    currIndex: number;
    currTimeLeft: number;
    prevTimeLeft: number;
    nextTimeLeft: number;
}

/* transition types */
export interface ItransitionInfo {
    type: string;
    action: string;
    start: number;
    end: number;
}

/* dialog types */
export enum EdialogNo {
    colorDropDownDialog = 1,
    listDialog,
    docSaveDialog,
    docListDialog,
    nonameDialog = 997,
    basicConfirmDialog,
    basicAlertDialog,
    folderDeleteDialog,
}
export interface IlistDialogData {
    id: string;
    name: string;
}
export interface IlistDialogItems {
    listType: string;
    listName: string;
    listData: IlistDialogData[];
}

/* util types*/
export interface ItimeObj {
    min: number;
    sec: number;
    ms: number;
}
export interface IplayTimeInfo {
    left: number;
    min: string;
    sec: string;
    ms: string;
}

/* interaction types */
export interface IinteractionTriggerInfo {
    triggerName: string;
    triggerVal: string;
}
export interface IinteractionActionInfo {
    actionName: string;
    actionVal: string;
}
export interface IinteractionsInfo {
    id: string;
    name: string;
    trigger: string;
    targetId: string[];
    action: string;
}
/* targetName 추가됨 */
export interface IinteractionsInfoExt {
    id: string;
    name: string;
    trigger: string;
    targetId: string[];
    targetName: string[];
    action: string;
}
/* animation types */
export interface IanimationInfo {
    repeat: number;
}

/* sprite types */
export interface IspriteInfo {
    totalSize: number;
    rows: number;
    cols: number;
    duration: number;
    repeat: number;
}

/* stretch info */
export interface IstretchCssInfo {
    bgSize: string;
    bgRepeat: string;
    bgPosition: string;
}
export interface IstretchInfo {
    stretchName: string;
    css: IstretchCssInfo;
}
export interface InumberFormInputInfo {
    title?: string;
    id: string;
    type: string;
    unit: string;
    min: number;
    max: number;
    increment?: number;
    default: number;
    changeEvt: any;
}
export interface IborderListInfo {
    name: string;
    value: string;
}
export interface IorderObjectListInfo {
    name: string;
    value: string;
}
export enum EorderObjectListType {
    front = 'front',
    forward = 'forward',
    backward = 'backward',
    back = 'back',
}
export enum EalignObjectListType {
    top = 'top',
    middle = 'middle',
    bottom = 'bottom',
    left = 'left',
    center = 'center',
    right = 'right',
    vsplit = 'vsplit',
    hsplit = 'hsplit',
}
export interface IpageSizeInfo {
    width: number;
    height: number;
}
export interface IcolorPickCbFunc {
    (colorCode: string): any;
}
export interface IcolorPickerInfo {
    id: string;
    changeEvt: IcolorPickCbFunc;
}
export interface IdocInfo {
    no: string;
    name: string;
    userId: string;
    folderId?: number;
    docContentList: IDocContents[];
    regdate?: string;
    moddate?: string;
    isExport?: 'Y' | 'N';
}
export interface IdocListInfo {
    isFolder: 'Y' | 'N';
    isExport: 'Y' | 'N';
    exportDate: string | null;
    modDate: string;
    name: string;
    cnt: number;
    regDate: string;
    id: string;
    upperId: number;
    userId: string;
}
export interface IfolderInfo {
    folderId: number;
    upperId: number;
    name: string;
    userId: string;
    regDate: string;
    modDate: string;
}
export interface IBasicCbFunc {
    (): any;
}

/** undoredo */
export enum EundoStackAddType {
    load = 'load',
    add = 'add',
    del = 'del',
    style = 'style',
    keyframe = 'keyframe-info',
    interaction = 'interactions-info',
    transition = 'transition-info',
    sprite = 'sprite-info',
    animation = 'animation-info',
    page = 'page',
    textbox = 'textbox',
    all = 'all',
}
export interface IundoStackInfo {
    type: EundoStackAddType;
    objectId: string;
    objectIndex: number;
    content: string;
}

/** texteditor */

export enum ETextEditorToolsType {
    button = 'button',
    combobox = 'combobox',
    dropdown = 'dropdown',
    dropdowninput = 'dropdowninput',
    color = 'color',
    // spacialchars = 'spacialchars',
    separator = 'separator',
}
export enum ETextEditorToolsName {
    none = 'none',
    bold = 'bold',
    italic = 'italic',
    underline = 'underline',
    strikethrough = 'strikethrough',
    superscript = 'superscript',
    subscript = 'subscript',
    fontsize = 'fontsize',
    letterspacing = 'letterspacing',
    fontfamily = 'fontfamily',
    fontname = 'fontname',
    lineheight = 'lineheight',
    left = 'left',
    center = 'center',
    right = 'right',
    justify = 'justify',
    forecolor = 'forecolor',
    backcolor = 'backcolor',
    indent = 'indent',
    outdent = 'outdent',
    insertunorderedlist = 'insertunorderedlist',
    insertorderedlist = 'insertorderedlist',
    top = 'top',
    middle = 'middle',
    bottom = 'bottom',
    padding = 'padding',
    spacialchars = 'spacialchars',
    textshadow = 'textshadow',
    textoutline = 'textoutline',
}
export enum ETextEditorToolsUnit {
    none = '',
    pixcel = 'px',
    percent = '%',
}
export interface ITextEditorToolsInfo {
    type: ETextEditorToolsType;
    execName: ETextEditorToolsName;
    unit: ETextEditorToolsUnit;
    title: string;
}
export interface ITextToolsProps {
    refToolsInfo: ITextEditorToolsInfo;
}
export enum EObjectFolderStatus {
    none = 'none',
    fold = 'fold',
    expand = 'expand',
}
export enum EObjectFolderView {
    show = 'show',
    hide = 'hide',
}
export enum ETemplateType {
    none = '',
    line = 'line', // 선긋기
    select = 'select', // 선택(예.사지선다)
    quiz = 'quiz', // 퀴즈 탭플릿 (객/주관식 혼용)
    result = 'result', // 결과 페이지
}
// export interface ITemplate_Line_Question {
//     no: number;
//     text: string;
// }
// export interface ITemplate_Line_Answer {
//     no: number;
//     text: string;
// }
// export interface ITemplate_Line_correct {
//     questionNo: number;
//     answerNo: number;
// }
// export interface ITemplate_Line_QuestionSet {
//     title: string;
//     questionList: ITemplate_Line_Question[];
//     answerList: ITemplate_Line_Answer[];
//     correctList: ITemplate_Line_correct[];
// }
// export interface ITemplate_Line_QuestionDataSet {
//     questions: ITemplate_Line_QuestionSet;
// }
export enum ETemplete_Object_Type {
    none = '',
    all = 'all',
    title = 'title',
    question = 'question',
    answer = 'answer',
    startPoint = 'start-point',
    endPoint = 'end-point',
    input = 'input',
    result = 'result',
    image = 'image',
    next = 'next',
}
export enum ETemplate_Direction {
    h = 'horizontal',
    v = 'vertical',
}

/** logic editor */
export enum ELogic_Connect_Pos {
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
    none = '',
}
export enum ELogic_Connect_Type {
    out = 'out',
    in = 'in',
    none = '',
}
export enum ELogic_Object_Type {
    none = '',
    interaction = 'interaction',
    object = 'object',
    trigger = 'trigger',
    action = 'action',
    audio = 'audio',
    actionUnit = 'action_unit',
    condition = 'condition',
    conditionUnit = 'condition_unit',
}
export interface ILogic_Conneted_Info {
    id: string;
    pos: ELogic_Connect_Pos;
    objectType: ELogic_Object_Type;
    refObjId?: string;
    actions?: string;
}
export enum ELogic_Action_Type {
    none = '',
    transform = 'transform',
    appear = 'appear',
    fade = 'fade',
    page_move = 'page_move',
    anime = 'anime',
    score = 'score',
    timer = 'timer',
    condition = 'condition',
    audio = 'audio',
    quiz = 'quiz',
    data = 'data',
}
export interface ILogic_Action_List_Info {
    actionName: string;
    actionId: string;
    actionsList: ILogic_Transform_Actions_Info[];
    outActionList: ILogic_Conneted_Info[];
    inActionList: ILogic_Conneted_Info[];
}
export enum ELogic_Action_Transform_Operator_Type {
    equal = '=',
    plus = '+',
    minus = '-',
}
export enum ELogic_Transform_Actions_Type {
    none = '',
    x = 'x',
    y = 'y',
    width = 'width',
    height = 'height',
    rotate = 'rotate',
    rotateX = 'rotateX',
    rotateY = 'rotateY',
    opacity = 'opacity',
    borderRadius = 'borderRadius',
}
export enum ELogic_Action_Transform_Size_Type {
    fix = 'fix',
    rand = 'rand',
}
export interface ILogic_Transform_Actions_Info {
    operator: ELogic_Action_Transform_Operator_Type;
    sizeType: ELogic_Action_Transform_Size_Type;
    size: number | string;
    easing: string;
    duration: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Transform_Actions_Type;
}
// export interface ILogic_Actions_InOut_Action_Info {
//     id: string;
//     pos: ELogic_Connect_Pos;
//     objectType: ELogic_Object_Type;
//     refObjId: string;
// }
export enum ELogic_Normal_Actions_Type {
    none = '',
    appear = 'appear',
    disappear = 'disappear',
    appearToggle = 'appear-toggle',
    in = 'in',
    out = 'out',
    next = 'next',
    prev = 'prev',
    goToPage = 'go_to_page',
    openLink = 'open_link',
    play = 'play',
    pause = 'pause',
    stop = 'stop',
    stopAll = 'stop_all',
    resume = 'resume',
    restart = 'restart',
    scoreset = 'scoreset',
    delay = 'delay',
    reset_answer = 'reset_answer',
    save_result = 'save_result',
    form_store = 'form_store',
    form_load = 'form_load',
    set_data = 'set_data',
}
export interface ILogic_Normal_Actions_Info {
    operator: ELogic_Action_Transform_Operator_Type;
    sizeType: ELogic_Action_Transform_Size_Type;
    size: number;
    easing: string;
    duration: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Normal_Actions_Type;
    inputtext?: string;
}

export interface IundoStackLogicInfo {
    content: string;
}

export enum ELogic_Action_Condition_Type {
    over = '>',
    over_equal = '>=',
    under = '<',
    under_equal = '<=',
    equal = '=',
    not_equal = '!=',
}
export enum ELogic_Actions_Out_Condition_Type {
    yes = 'yes',
    no = 'no',
}
export enum ELogic_Condition_Actions_Type {
    score = 'score',
    checked = 'checked',
    quizinputcomplete = 'quizinputcomplete',
    quizcorrectcnt = 'quizcorrectcnt',
    input_valid = 'input_valid',
    correct_answer = 'correct_answer',
}
export interface ILogic_Condition_Info {
    operator?: ELogic_Action_Transform_Operator_Type;
    sizeType?: ELogic_Action_Transform_Size_Type;
    size: number;
    easing?: string;
    duration?: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Condition_Actions_Type;
    condition: ELogic_Action_Condition_Type;
}
export interface IDoc_Resource_Response {
    code: number;
    message: string;
    data: IfileInfo[];
}
export interface ILogic_Audio_Actions_Info {
    operator?: ELogic_Action_Transform_Operator_Type;
    sizeType?: ELogic_Action_Transform_Size_Type;
    size?: number;
    easing?: string;
    duration?: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Normal_Actions_Type;
}
export interface ILogic_Quiz_Actions_Info {
    operator?: ELogic_Action_Transform_Operator_Type;
    sizeType?: ELogic_Action_Transform_Size_Type;
    size?: number;
    easing?: string;
    duration?: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Normal_Actions_Type;
}
export interface ILogic_Data_Actions_Info {
    operator?: ELogic_Action_Transform_Operator_Type;
    sizeType?: ELogic_Action_Transform_Size_Type;
    size?: number;
    easing?: string;
    duration?: number;
    dataField?: ELogic_Action_Data_Field_Type;
    actionType: ELogic_Action_Type;
    actions: ELogic_Normal_Actions_Type;
}
export interface ILogic_Data_FormData_Info {
    objId: string;
    formValue: string;
    isChecked: boolean;
    formType: string;
}
export interface ILogic_Data_Page_Data_Info {
    pageId: string;
    formData: ILogic_Data_FormData_Info[];
}
export interface ILogic_Data_FormData_StoreInfo
    extends ILogic_Data_FormData_Info {
    pageId: string;
}
export enum ELogic_Action_Data_Field_Type {
    allcheckboxCnt = 'allcheckboxCnt',
    checkedCnt = 'checkedCnt',
}
export enum EresViewType {
    list = 'list',
    icon = 'icon',
}
export interface IPage_Dimension_Info {
    name: string;
    width: number;
    height: number;
}
export enum EResouce_Filter_List_Type {
    shape = 'shape',
    square = 'square',
    image = 'image',
    movie = 'video',
    audio = 'audio',
    text = 'text',
    interacted = 'interacted',
    page = 'page',
    none = '',
    folder = 'folder',
    youtube = 'youtube',
}
export interface IResouceFilterProps {
    refFilterInfo: EResouce_Filter_List_Type;
}
export interface ISpecialChars_Info {
    name: string;
    content: string[];
}

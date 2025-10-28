export enum EobjectType {
    none = '',
    square = 'square',
    image = 'image',
    page = 'page',
    folder = 'folder',
    audio = 'audio',
}
interface IsizeInfo {
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
export interface ItransitionInfo {
    type: string;
    action: string;
    start: number;
    end: number;
}
export interface IinteractionsInfo {
    id: string;
    name: string;
    trigger: string;
    targetId: string[];
    action: string;
}
export interface IspriteInfo {
    totalSize: number;
    rows: number;
    cols: number;
    duration: number;
    repeat: number;
}
export interface IanimationInfo {
    repeat: number;
}
export enum ETemplateType {
    none = '',
    line = 'line', // 선긋기
    select = 'select', // 선택(예.사지선다)
    quiz = 'quiz', // 퀴즈
    result = 'result', // 결과 페이지
}
export interface ITemplate_Line_Question {
    no: number;
    text: string;
}
export interface ITemplate_Line_Answer {
    no: number;
    text: string;
}
export interface ITemplate_Line_correct {
    questionNo: number;
    answerNo: number;
}
export interface ITemplate_Line_QuestionSet {
    questionList: ITemplate_Line_Question[];
    answerList: ITemplate_Line_Answer[];
    correctList: ITemplate_Line_correct[];
}
export interface ITemplate_Line_QuestionDataSet {
    title: string;
    questions: ITemplate_Line_QuestionSet[];
}
export enum ETemplete_Object_Type {
    none = '',
    all = 'all',
    title = 'title',
    question = 'question',
    answer = 'answer',
    startPoint = 'start-point',
    endPoint = 'end-point',
    result = 'result',
    image = 'image',
    next = 'next',
}
export enum ETemplate_Direction {
    h = 'horizontal',
    v = 'vertical',
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

/* logic */
export enum ELogic_Action_Transform_Operator_Type {
    equal = '=',
    plus = '+',
    minus = '-',
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
export enum ELogic_Connect_Pos {
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
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
export enum ELogic_Action_Transform_Size_Type {
    fix = 'fix',
    rand = 'rand',
}
export interface ILogic_Transform_Actions_Info {
    operator: ELogic_Action_Transform_Operator_Type;
    sizeType: ELogic_Action_Transform_Size_Type;
    size: number;
    easing: string;
    duration: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Transform_Actions_Type;
}
export interface ILogic_Conneted_Info {
    id: string;
    pos: ELogic_Connect_Pos;
    objectType: ELogic_Object_Type;
    refObjId?: string;
    actions?: string;
}
export interface ILogic_Action_List_Info {
    actionName: string;
    actionId: string;
    actionsList: ILogic_Transform_Actions_Info[];
    outActionList: ILogic_Conneted_Info[];
    inActionList: ILogic_Conneted_Info[];
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
export interface ILogic_Condition_Info {
    condition: ELogic_Action_Condition_Type;
    size: number;
    actionType: ELogic_Action_Type;
    actions: ELogic_Condition_Actions_Type;
    duration?: number;
    easing?: string;
    sizeType?: ELogic_Action_Transform_Size_Type;
    operator?: ELogic_Action_Transform_Operator_Type;
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

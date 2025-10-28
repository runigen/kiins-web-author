// import $ from 'jquery';
// import * as basicData from '../const/basicData';
import {
    IshapeInfo,
    IstyleInfo,
    IstretchCssInfo,
    IobjectSizeInfo,
    IpageSizeInfo,
    EundoStackAddType,
    ETemplateType,
    EobjectType,
    // ITemplate_Line_Question,
    // ITemplate_Line_Answer,
    // ITemplate_Line_correct,
    // ITemplate_Line_QuestionSet,
    ETemplete_Object_Type,
} from '../const/types';
// import * as keyframe from './keyframe';
// import * as transition from './transition';
// import * as KeyEvent from '../event/KeyEvent';
// import * as CommonEvent from '../event/CommonEvent';
// import * as dialog from './dialog';
// import * as common from './common';
// import workInfo from '../store/workInfo';
// import docData from '../store/docData';
import * as dostack from './dostack';
// import * as documents from './documents';
// import * as pages from './pages';
// import * as objects from './objects';
import * as LineTemplate from './templates/LineTemplate';
import * as ResultTemplate from './templates/ResultTemplate';
import * as SelectTemplate from './templates/SelectTemplate';
import * as QuizTemplate from './templates/QuizTemplate';
import { parseJsonData, cancelBubble } from './common';

export const attachTempateFile = (
    event: React.ChangeEvent<HTMLInputElement>,
) => {
    if (event.target.files) {
        const file = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = () => {
            if (fileReader.result !== '') {
                console.log('fileReader.result OK');
                const jsonData = parseJsonData(String(fileReader.result));
                console.log('jsonData : ', jsonData);
                setTemplate(jsonData.templateType, jsonData.questions);
            }
        };
        fileReader.readAsText(file);
    } else {
        console.log('file error');
    }
};

export const setTemplate = (type: ETemplateType, questions: any[] = []) => {
    if (type === ETemplateType.line) {
        LineTemplate.loadTemplateData(questions);
    } else if (type === ETemplateType.select) {
        SelectTemplate.loadTemplateData(questions);
    } else if (type === ETemplateType.quiz) {
        QuizTemplate.loadTemplateData(questions);
    } else if (type === ETemplateType.result) {
        ResultTemplate.loadTemplateData();
    }
    // dostack.addUndoStack('', EundoStackAddType.all);
};

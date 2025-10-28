import React from 'react';
import { ETextEditorToolsName, ITextToolsProps } from '../../../../const/types';
import { allEventCancel, cancelBubble } from '../../../../util/common';
import * as texteditor from '../../../../util/texteditor';
import workInfo from '../../../../store/workInfo';

import TextEffect, { showTextEffectTools } from './TextEffect';

const ButtonTool = ({ refToolsInfo }: ITextToolsProps) => {
    const execTool = (
        execName: ETextEditorToolsName,
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        console.log('ButtonTool : execName : ', execName);

        if (
            execName === ETextEditorToolsName.left ||
            execName === ETextEditorToolsName.center ||
            execName === ETextEditorToolsName.right ||
            execName === ETextEditorToolsName.justify
        ) {
            texteditor.setTextAlign(execName);
        } else if (
            execName === ETextEditorToolsName.indent ||
            execName === ETextEditorToolsName.outdent
        ) {
            texteditor.setInOutdent(execName);
        } else if (
            execName === ETextEditorToolsName.insertorderedlist ||
            execName === ETextEditorToolsName.insertunorderedlist
        ) {
            texteditor.execBasicCommand(execName, execName);
        } else if (
            execName === ETextEditorToolsName.top ||
            execName === ETextEditorToolsName.middle ||
            execName === ETextEditorToolsName.bottom
        ) {
            texteditor.setTextBoxValign(execName);
        } else if (execName === ETextEditorToolsName.spacialchars) {
            texteditor.closeAllCtlBoxList();
            workInfo.setShowSpecialChars();
        } else if (
            execName === ETextEditorToolsName.textshadow ||
            execName === ETextEditorToolsName.textoutline
        ) {
            showTextEffectTools(execName);
        } else {
            texteditor.execBasicCommand(execName);
        }

        cancelBubble(e);
    };

    // const showTextEffect = (execName: ETextEditorToolsName) => {
    //     showTextEffectTools(execName);
    // };

    return (
        <div
            className={`toolbar btn ${refToolsInfo.execName}`}
            onClick={e => execTool(refToolsInfo.execName, e)}
            onMouseDown={allEventCancel}
            id={texteditor.getToolbarId(refToolsInfo.execName)}
            title={refToolsInfo.title}
        >
            {(refToolsInfo.execName === ETextEditorToolsName.textshadow ||
                refToolsInfo.execName === ETextEditorToolsName.textoutline) && (
                <TextEffect textEffectInfo={{ name: refToolsInfo.execName }} />
            )}
        </div>
    );
};
export default ButtonTool;

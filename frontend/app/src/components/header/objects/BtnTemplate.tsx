import React, { useCallback, useEffect, useState } from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import store from '../../../store';
import { cancelBubble } from '../../../util/common';
import { ETemplateType } from '../../../const/types';
import * as template from '../../../util/template';
import { getBodyMiddleWorkspace } from '../../../util/pages';

const BtnTemplate = observer(() => {
    const { userInfo, docData, workInfo } = store;
    const { search } = useLocation();
    const docNo = docData.getDocNo();
    const LANGSET = userInfo.getLangSet();

    const showTemplateList = (e: React.MouseEvent<HTMLLIElement>) => {
        console.log('showTemplateList');
        //setSublistActive(sublistActive => sublistActive === 'active' ? '' : 'active');
        if (e.currentTarget.classList.contains('active')) {
            hideTemplateSubList();
        } else {
            showTemplateSubList();
        }
        cancelBubble(e);
    };
    const showTemplateSubList = () => {
        console.log('showSubList');
        document.querySelector('.nav-template-list')?.classList.add('active');

        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.addEventListener('mousedown', hideTemplateSubList);
        }
    };
    const hideTemplateSubList = () => {
        console.log('hideSubList');
        document
            .querySelector('.nav-template-list')
            ?.classList.remove('active');
        const workSpaceObj = getBodyMiddleWorkspace();
        if (workSpaceObj) {
            workSpaceObj.removeEventListener('mousedown', hideTemplateSubList);
        }
    };
    const setTemplate = (
        e: React.MouseEvent<HTMLLIElement>,
        type: ETemplateType,
    ) => {
        console.log('setTemplate type :', type);
        template.setTemplate(type);
        cancelBubble(e);
        hideTemplateSubList();
    };

    return (
        <>
            <li
                className={`nav-template-list hasLayer`}
                aria-label="Template List"
                onClick={showTemplateList}
                title={LANGSET.HEAD.TEMPLATE}
            >
                <div className="layer_menu layer_menu_template">
                    <ul>
                        <li
                            className="line"
                            onClick={e => setTemplate(e, ETemplateType.line)}
                            title={LANGSET.HEAD.TEMPLATE_LINE}
                        ></li>
                        <li
                            className="select"
                            onClick={e => setTemplate(e, ETemplateType.select)}
                            title={LANGSET.HEAD.TEMPLATE_SELECT}
                        ></li>
                        <li
                            className="quiz"
                            onClick={e => setTemplate(e, ETemplateType.quiz)}
                            title={LANGSET.HEAD.TEMPLATE_QUIZ}
                        ></li>
                        <li
                            className="result"
                            onClick={e => setTemplate(e, ETemplateType.result)}
                            title={LANGSET.HEAD.TEMPLATE_RESULT}
                        ></li>
                    </ul>
                </div>
            </li>
        </>
    );
});

export default BtnTemplate;

import React, { useEffect, useState } from 'react';
import store from '../../../store';
import { observer } from 'mobx-react';
import Properties from './properties/Properties';
import Interactions from './interactions/Interactions';
import Resources from './resources/Resources';

import $ from 'jquery';
// import * as dialog from '../../../util/dialog';
// import { allEventCancel } from '../../../util/common';

const Right = observer(() => {
    const { workInfo, userInfo } = store;
    const currObject: any = workInfo.getObject();
    const updateKey: number = workInfo.getUpdateKey();
    const [currMenu, setCurrMenu] = useState('section-properties');
    const LANGSET = userInfo.getLangSet();

    // -- 객체 선택 안되어 있을때 input 일괄 비활성 처리
    useEffect(() => {
        // if(currObject !== null) {
        //     $(".list-content input").each((index, item) => {
        //         $(item).removeAttr("disabled");
        //     });
        // } else {
        //     $(".list-content input").each((index, item) => {
        //         $(item).attr("disabled", 'true');
        //     });
        // }
    }, [currObject, updateKey]);

    const showMenu = (menu: string) => {
        setCurrMenu(menu);
    };

    return (
        <>
            <div className="head-tab">
                <button
                    className={
                        currMenu === 'section-properties' ? ' active' : ''
                    }
                    onClick={() => showMenu('section-properties')}
                >
                    {LANGSET.PROPERTY.TITLE}
                </button>
                <button
                    className={
                        currMenu === 'section-interactions' ? ' active' : ''
                    }
                    onClick={() => showMenu('section-interactions')}
                >
                    {LANGSET.INTERACTION.TITLE}
                </button>
                <button
                    className={
                        currMenu === 'section-resources' ? ' active' : ''
                    }
                    onClick={() => showMenu('section-resources')}
                >
                    {LANGSET.RESOURCE.TITLE}
                </button>
            </div>
            <section
                className={
                    'section-properties' +
                    (currMenu === 'section-properties' ? ' active' : '')
                }
            >
                <Properties />
            </section>
            <section
                className={
                    'section-interactions' +
                    (currMenu === 'section-interactions' ? ' active' : '')
                }
            >
                <Interactions />
            </section>
            <section
                className={
                    'section-resources' +
                    (currMenu === 'section-resources' ? ' active' : '')
                }
            >
                <Resources />
            </section>
        </>
    );
});

export default Right;

import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../store';
import { unselectSquareObjcts } from '../../../event/SquareEvent';

const BtnLogic = observer(() => {
    const { workInfo } = store;

    const showLogic = () => {
        unselectSquareObjcts();
        workInfo.setLogicMode(true);
    };

    return (
        <>
            <li
                className="nav-logicEditor"
                aria-label="로직에디터"
                title="로직에디터"
                onClick={showLogic}
            >
                <div></div>
            </li>
        </>
    );
});

export default BtnLogic;

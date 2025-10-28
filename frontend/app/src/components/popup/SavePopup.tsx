import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import $ from 'jquery';

const SavePopup = observer(() => {
    const { userInfo, docData, workInfo } = store;

    const setSave = (event: React.MouseEvent<HTMLLIElement>) => {};

    return (
        <>
            <div className="dialog-save">
                <div>
                    <p>제목을 입력해주세요.</p>
                    <input type="text" id="" />
                </div>
                <div>
                    <button type="button">OK</button>
                    <button type="button">Cancel</button>
                </div>
            </div>
        </>
    );
});

export default SavePopup;

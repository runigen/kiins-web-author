import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import store from '../../../store';
import { unselectObjects } from '../../../event/CommonEvent';
import $ from 'jquery';

const BtnPreview = () => {
    const navigate = useNavigate();

    const { userInfo, docData, workInfo } = store;
    const userList = userInfo.getList();
    const pageData = docData.getData();
    const goPreview = () => {
        // navigate('/preview', {replace: true});
        workInfo.setViewMode();
    };

    return (
        <>
            <li
                className={'nav-preview'}
                onClick={goPreview}
                aria-label="미리보기"
            ></li>
        </>
    );
};

export default BtnPreview;

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import * as DataStore from '../../store/DataStore';
// import $ from 'jquery';
import {
    cancelBubble,
    checkUserId,
    getUserIdErrorMsg,
} from '../../util/common';
import { EuserLang } from '../../const/types';
import { showToastMessage } from '../../util/dialog';
const versionInfo = process.env.REACT_APP_VERSION || '';

const UserConfig = observer(() => {
    const { userInfo, workInfo } = store;
    const [userId, setUserId] = useState('');
    const [userLangList, setUserLangList] = useState<EuserLang[]>([]);
    // const userLang = userInfo.getLang();
    const [userLang, setUserLang] = useState<EuserLang>(userInfo.getLang());
    const LANGSET = userInfo.getLangSet();

    useEffect(() => {
        setUserId(DataStore.getUserId());
        setUserLangList(Object.values(EuserLang));
        focusButton();
    }, []);

    const focusButton = () => {
        setTimeout(() => {
            const firstButton = document.querySelectorAll(
                '.user-config-container .common-popup-foot button',
            )[0] as HTMLButtonElement;
            if (firstButton) firstButton.focus();
        }, 500);
    };
    const closePop = () => {
        if (DataStore.getUserId() === '') {
            showToastMessage('사용자 아이디를 입력해주세요.', 1);
            return;
        }
        workInfo.setConfigMode(false);
    };

    const getInputUserId = () => {
        const textForm = document.getElementById(
            'idx_user_id',
        ) as HTMLInputElement;
        return textForm.value.trim();
    };

    const applyConfig = async () => {
        // userid
        const userId = getInputUserId();
        if (!checkUserId(userId)) {
            showToastMessage(getUserIdErrorMsg(), 1);
            return;
        }
        DataStore.setUserId(userId);

        // user lang
        const langSelectForm = document.getElementById(
            'idx_user_lang',
        ) as HTMLSelectElement;
        const userLang = langSelectForm.value as EuserLang;
        userInfo.setLang(userLang);

        let resetCnt = 0;
        // reset user color history
        const resetColorHistory = document.getElementById(
            'idx_user_history_color',
        ) as HTMLInputElement;
        if (resetColorHistory.checked) {
            DataStore.emptyColorHistoryList();
            resetCnt++;
        }

        // reset user font history
        const resetFontHistory = document.getElementById(
            'idx_user_history_font',
        ) as HTMLInputElement;
        if (resetFontHistory.checked) {
            DataStore.emptyFontHistoryList();
            resetCnt++;
        }

        // reset form data
        const resetFormData = document.getElementById(
            'idx_user_form_data',
        ) as HTMLInputElement;
        if (resetFormData.checked) {
            DataStore.clearAllFormData();
            resetCnt++;
        }

        // reset quiz data
        const resetQuizData = document.getElementById(
            'idx_user_quiz_data',
        ) as HTMLInputElement;
        if (resetQuizData.checked) {
            await DataStore.emptyQuizDataList();
            resetCnt++;
        }

        // reset specialchars data
        const resetSpecialCharsData = document.getElementById(
            'idx_user_special_chars',
        ) as HTMLInputElement;
        if (resetSpecialCharsData.checked) {
            DataStore.emptySpecialCharsHistoryList();
            resetCnt++;
        }

        if (resetCnt > 0) {
            showToastMessage('선택항목의 설정이 초기화 되었습니다.', 1);
        }

        // close
        workInfo.setConfigMode(false);
    };

    const changeUserLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserLang(e.currentTarget.value as EuserLang);
    };

    return (
        <>
            <div className="common-popup-container-dim" onClick={closePop}>
                <div className="user-config-container" onClick={cancelBubble}>
                    <button className="btn-close" onClick={closePop}></button>
                    <div className="user-config-list">
                        <span>{LANGSET.USER_CONFIG.USERID} </span>
                        <input
                            type="text"
                            id="idx_user_id"
                            defaultValue={userId}
                            onFocus={e => {
                                e.currentTarget.select();
                            }}
                        />
                    </div>
                    <div className="user-config-list">
                        <span>{LANGSET.USER_CONFIG.LANG} </span>
                        <select
                            id="idx_user_lang"
                            onChange={changeUserLang}
                            value={userLang}
                        >
                            {userLangList.map(lang => {
                                return (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="user-config-list">
                        <span>{LANGSET.USER_CONFIG.RESET} </span>
                        <div className="user-config-check-list">
                            <label htmlFor="idx_user_history_color">
                                <input
                                    type="checkbox"
                                    id="idx_user_history_color"
                                />
                                <span></span>
                                <span className="text">
                                    {LANGSET.USER_CONFIG.COLOR_HISTORY}
                                </span>
                            </label>
                            <label htmlFor="idx_user_history_font">
                                <input
                                    type="checkbox"
                                    id="idx_user_history_font"
                                />
                                <span></span>
                                <span className="text">
                                    {LANGSET.USER_CONFIG.FONT_HISTORY}
                                </span>
                            </label>
                            <label htmlFor="idx_user_special_chars">
                                <input
                                    type="checkbox"
                                    id="idx_user_special_chars"
                                />
                                <span></span>
                                <span className="text">
                                    {LANGSET.USER_CONFIG.SPECIALCHARS_HISTORY}
                                </span>
                            </label>

                            <label htmlFor="idx_user_quiz_data">
                                <input
                                    type="checkbox"
                                    id="idx_user_quiz_data"
                                />
                                <span></span>
                                <span className="text">
                                    {LANGSET.USER_CONFIG.QUIZ_DATA}
                                </span>
                            </label>
                            <label htmlFor="idx_user_form_data">
                                <input
                                    type="checkbox"
                                    id="idx_user_form_data"
                                />
                                <span></span>
                                <span className="text">
                                    {LANGSET.USER_CONFIG.FORM_DATA}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="user-config-list version">
                        v{versionInfo}
                    </div>

                    <div className="common-popup-foot">
                        <button
                            type="button"
                            className="btn-default-action"
                            onClick={applyConfig}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
});

export default UserConfig;

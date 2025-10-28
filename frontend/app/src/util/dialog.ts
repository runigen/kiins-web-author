// import React from 'react';
import $ from 'jquery';
import {
    EkeyName,
    EdialogNo,
    IcolorPickCbFunc,
    IBasicCbFunc,
    // EuserLang,
} from '../const/types';
import * as basicData from '../const/basicData';
import * as common from './common';
// import * as keyframe from './keyframe';
import * as KeyEvent from '../event/KeyEvent';
// import * as ImageEvent from '../event/ImageEvent';
import * as DataStore from '../store/DataStore';
// import * as colorjoe from 'colorjoe';
// import userInfo from '../store/userInfo';

const dialogIdHead = 'DIALOG_';
const dropdownIdHead = 'DROPDOWN_';
const dialogCss = 'dialog-popup';
const dropdownCss = 'dialog-dropdown';
const dropdownFade = true;
const toastObjId = 'TOAST_MSG';
// const loadingObjId: string = 'LOADING';

// let popupTitleMouseDown: boolean = false;
// let popupStartX: number = 0;
// let popupStartY: number = 0;

// type TlistData = {
//     id: string;
//     name: string;
// }
// type TlistDialogItems = {
//     listType: string;
//     listName: string;
//     listData: TlistData[]
// }

// const listDialogItems: TlistDialogItems[] = [
//     {
//         listType: 'easing',
//         listName: 'Easing Curve',
//         listData: [
//             {id: 'linear', name: 'Linear'},
//             {id: 'inquad', name: 'InQuad'},
//             {id: 'outquad', name: 'OutQuad'},
//         ]
//     },
//     {
//         listType: 'transition',
//         listName: 'Transition',
//         listData: [
//             {id: 'appear_appear', name: 'Appear'},
//             {id: 'appear_disappear', name: 'Disappear'},
//             {id: 'fade_in', name: 'FadeIn'},
//             {id: 'fade_out', name: 'FadeOut'},
//         ]
//     },
// ];

export const showDialog = (
    dialogNo: number,
    title: string,
    content: any,
    btnList: any[],
    btnClose = true,
    onloadCB: any | undefined = undefined,
) => {
    console.log('========= showDialog ============');

    if (dialogNo === null) {
        dialogNo = EdialogNo.nonameDialog;
    }

    let dialogElem = document.getElementById(dialogIdHead + dialogNo);
    if (dialogElem) {
        hideDialog();
        // return;
    }

    // dim 생성
    const dialogDim = document.createElement('div');
    dialogDim.id = 'idx_dialog_dim';
    dialogDim.className = 'dialog-dim';
    document.body.appendChild(dialogDim);
    $(dialogDim).show();

    // -- dialog container
    dialogElem = document.createElement('div');
    dialogElem.id = dialogIdHead + dialogNo;
    dialogElem.className = dialogCss;

    // -- dialog title
    if (title) {
        const titleContainer = document.createElement('div');
        titleContainer.className = 'container-title';

        const titleText = document.createElement('h1');
        titleText.innerText = title;
        titleContainer.appendChild(titleText);

        if (btnClose) {
            const titleClose = document.createElement('button');
            titleClose.className = 'btn-close-modal';
            titleClose.onclick = () => {
                hideDialog();
            };
            titleContainer.appendChild(titleClose);
        }

        dialogElem.appendChild(titleContainer);
    }

    // -- dialog body content
    const bodyElem = document.createElement('div');
    bodyElem.className = 'container-body';

    if (typeof content === 'string') {
        content = document.createTextNode(content);
    }

    bodyElem.appendChild(content);
    dialogElem.appendChild(bodyElem);

    // -- dialog foot
    if (btnList.length > 0) {
        const footContainer = document.createElement('div');
        footContainer.className = 'container-footer';

        btnList.forEach(btnItem => {
            const btnElem = document.createElement('button');
            btnElem.type = 'button';
            if (typeof btnItem.css === 'string') {
                btnElem.className = btnItem.css;
            } else {
                btnElem.className = 'btn-default-action';
            }
            btnElem.innerText = btnItem.text;
            btnElem.onclick = () => {
                btnItem.func();
            };
            footContainer.appendChild(btnElem);
        });
        dialogElem.appendChild(footContainer);
    }

    // append to body
    document.body.appendChild(dialogElem);

    $(dialogElem).show();

    //-----------------------------------------------  다이알로그 박스 클릭 시 부모앨리먼트로 이벤트 전파 방지
    dialogElem.addEventListener('click', e => {
        common.cancelBubble(e);
    });
    dialogElem.addEventListener('mousedown', e => {
        common.cancelBubble(e);
    });

    if (btnClose) {
        window.addEventListener('keydown', setKeyDownEvent);
    }

    if (onloadCB !== undefined) {
        setTimeout(() => {
            onloadCB();
        }, 0);
    }
    // document.addEventListener("mousemove", evtPopupMouseMove);
    // document.addEventListener("mouseup", evtPopupMouseUp);
    // if(titleElem)
    //     titleElem.addEventListener("mousedown", evtPopupMouseDown);
};

const setKeyDownEvent = (event: any) => {
    const currKeyCode = KeyEvent.getKeyCode(event);
    if (currKeyCode === EkeyName.ESC) {
        hideDialog();
        common.allEventCancel(event);
    }
};
// const evtPopupMouseDown = (event) => {
//     popupTitleMouseDown = true;
//     popupStartX = event.clientX;
//     popupStartY = event.clientY;
// }
// const evtPopupMouseMove = (event) => {
//     if(popupTitleMouseDown !== true) {
//         return;
//     }
//     let moveX = event.clientX - popupStartX;
//     let moveY = event.clientY - popupStartY;
// }
// const evtPopupMouseUp = (e) => {
//     popupTitleMouseDown = false;
//     popupStartX = 0;
//     popupStartY = 0;
// }

export const hideDialog = (dialogNo: number | null = null) => {
    console.log('hideDialog start dialogNo :', dialogNo);

    try {
        // popup 제거
        if (dialogNo === null) {
            $('.' + dialogCss).each((index: number, elem: HTMLElement) => {
                if (!$(elem).hasClass('dialog-sprite')) {
                    // dialog-sprite 는 제외하고 닫기
                    $(elem).remove();
                }
            });
        } else {
            const dialogElem: any = document.getElementById(
                dialogIdHead + dialogNo,
            );
            if (dialogElem) {
                dialogElem.parentNode.removeChild(dialogElem);
            }
        }

        // dim 제거
        $('.dialog-dim').each((index: number, elem: HTMLElement) => {
            if (!$(elem).hasClass('dialog-sprite')) {
                $(elem).remove();
            }
        });

        window.removeEventListener('keydown', setKeyDownEvent);
    } catch (e) {
        console.log(e);
    }
};

/*
btnList = [
    {
        text: "ok",
        css : "btn-ok",
        func : function() {

        }
    },
    {
        text: "cancel",
        css : "btn-cancel",
        func : function() {

        }
    }    
]
*/
export const showDropdown = (
    parentElem: any,
    dialogNo: number,
    title: string,
    content: any,
    btnList: any[] = [],
) => {
    console.log('========= showDropdown ============');

    let dialogElem = document.getElementById(dropdownIdHead + dialogNo);
    if (dialogElem) {
        hideDropDown();
        return;
    }

    // -- dialog container
    dialogElem = document.createElement('div');
    dialogElem.id = dropdownIdHead + dialogNo;
    dialogElem.className = dropdownCss;

    // -- dialog title
    if (title !== '') {
        const titleElem = document.createElement('div');
        titleElem.className = 'dialog-dropdown-title';
        titleElem.innerText = title;
        dialogElem.appendChild(titleElem);
    }

    // -- dialog body content
    const bodyElem = document.createElement('div');
    bodyElem.className = 'dialog-dropdown-body';
    bodyElem.appendChild(content);
    dialogElem.appendChild(bodyElem);

    // -- dialog foot buttons area
    if (btnList.length > 0) {
        const footContainer = document.createElement('div');
        footContainer.className = 'dialog-dropdown-foot';

        btnList.forEach(btnItem => {
            const btnElem = document.createElement('button');
            btnElem.type = 'button';
            if (typeof btnItem.css === 'string') {
                btnElem.className = btnItem.css;
            } else {
                btnElem.className = 'btn-dialog-foot';
            }
            btnElem.innerText = btnItem.text;
            btnElem.onclick = () => {
                btnItem.func();
            };
            footContainer.appendChild(btnElem);
        });
        dialogElem.appendChild(footContainer);
    }
    parentElem.appendChild(dialogElem);

    if (parentElem.classList.contains('color-selector')) {
        dialogElem.classList.add('dropdown_colorpicker');
    }

    // ------------- 위치 보정 (화면에서 넘어가지 않도록)
    /*
    const docHeight = $(window).height();
    const docWidth = $(window).width();
    const dialogWidth = $(dialogElem).outerWidth();
    const dialogHeight = $(dialogElem).outerHeight();
    const dialogTop = $(dialogElem).offset().top;
    const dialogLeft = $(dialogElem).offset().left;
    const parentWidth = $(parentElem).outerWidth();
    const parentHeight = $(parentElem).outerHeight();
    
    console.log("docHeight : ", docHeight);
    console.log("docWidth : ", docWidth);
    console.log("dialogWidth : ", dialogWidth);
    console.log("dialogHeight : ", dialogHeight);
    console.log("dialogTop : ", dialogTop);
    console.log("dialogLeft : ", dialogLeft);
    console.log("parentWidth : ", parentWidth);
    console.log("parentHeight : ", parentHeight);

    //--- 다이알로그 위치 설정 (부모 바로 아래 출력)
    let newDialogPosTop = parentHeight;
    //let newDialogPosLeft = $(parentElem).outerWidth() - $(dialogElem).outerWidth();
    let newDialogPosLeft = 0;

    // -- 임시로 설정
    $(dialogElem).css('top',newDialogPosTop);
    $(dialogElem).css('left',newDialogPosLeft);

    // top 보정
    if(docHeight < (dialogTop+dialogHeight)) {
        newDialogPosTop = -dialogHeight;
        console.log("newDialogPosTop 2 : ", newDialogPosTop);
        $(dialogElem).css('top',newDialogPosTop);
    }
    // left 보정
    if(docWidth < (dialogLeft+dialogWidth)) {
        newDialogPosLeft = parentWidth-dialogWidth;
        console.log("newDialogPosLeft 2 : ", newDialogPosLeft);

        $(dialogElem).css('left',newDialogPosLeft);
    }
    */

    if (dropdownFade) {
        $(dialogElem).fadeIn();
    } else {
        $(dialogElem).show();
    }

    //-----------------------------------------------  다이알로그 박스 클릭 시 부모앨리먼트로 이벤트 전파 방지
    dialogElem.addEventListener('mousedown', e => {
        common.cancelBubble(e);
    });
    dialogElem.addEventListener('click', e => {
        common.cancelBubble(e);
    });
};
export const hideDropDown = (dialogNo = null) => {
    if (dialogNo === null) {
        $('.' + dropdownCss).remove();
    } else {
        const dialogElem: any = document.getElementById(
            dropdownIdHead + dialogNo,
        );
        if (dialogElem) {
            dialogElem.parentNode.removeChild(dialogElem);
        }
    }
};

let toastTimer: any = null;
export const showToastMessage = (text: string, sec = 2, bFade = true) => {
    console.log('bFade : ', bFade);

    let toastObj = document.getElementById(toastObjId);
    if (toastObj === null) {
        toastObj = document.createElement('div');
        toastObj.id = toastObjId;
        toastObj.className = 'toast-message active';
        // toastObj.innerHTML = '<p>' + text + '</p>';
        const textList = text.split('|');
        for (let i = 0; i < textList.length; i++) {
            const pElem = document.createElement('p');
            pElem.innerText = textList[i];
            toastObj.appendChild(pElem);
        }

        const btnClose = document.createElement('button');
        btnClose.type = 'button';
        btnClose.className = 'btn-close';
        btnClose.onclick = () => {
            hideToastMessage();
        };
        toastObj.appendChild(btnClose);

        document.body.appendChild(toastObj);

        if (sec > 0) {
            toastTimer = setTimeout(() => {
                hideToastMessage();
            }, sec * 1000 + 300);
        }
        // if (bFade) {
        //     toastObj.style.display = 'none';
        //     $(toastObj).fadeIn('fast', 'swing', () => {
        //         toastTimer = setTimeout(() => {
        //             hideToastMessage();
        //         }, sec * 1000);
        //     });
        // } else {
        //     toastObj.style.display = 'block';
        //     toastTimer = setTimeout(() => {
        //         hideToastMessage();
        //     }, sec * 1000);
        // }
    } else {
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = null;

        $(toastObj).children('p').remove();

        const textList = text.split('|');
        for (let i = 0; i < textList.length; i++) {
            const pElem = document.createElement('p');
            pElem.innerText = textList[i];
            toastObj.appendChild(pElem);
        }
        $(toastObj).addClass('active');
        // if (bFade) {
        // toastObj.style.opacity = String(1);

        if (sec > 0) {
            toastTimer = setTimeout(() => {
                hideToastMessage();
            }, sec * 1000 + 300);
        }
        // }
    }
};
export const hideToastMessage = () => {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = null;
    if ($('.toast-message')) {
        // $('.toast-message').fadeOut('fast', 'swing', () => {
        if ($('.toast-message')) {
            // $('.toast-message').remove();
            $('.toast-message').removeClass('active');
            setTimeout(() => {
                $('.toast-message p').remove();
            }, 300);
        }
        // });
    }
};

/* 각 팝업 다이알로그 정의 */
export const basicConfirmDialog = (
    title: string,
    text: string,
    funcList: any[] = [],
) => {
    const contentNode = document.createElement('div');
    contentNode.className = 'container-body';

    const textList = text.split('|');
    for (let i = 0; i < textList.length; i++) {
        const pElem = document.createElement('p');
        pElem.innerText = textList[i];
        contentNode.appendChild(pElem);
    }

    showDialog(
        EdialogNo.basicConfirmDialog,
        title,
        contentNode,
        [
            {
                text: 'OK',
                func: function () {
                    hideDialog(EdialogNo.basicConfirmDialog);
                    if (typeof funcList[0] !== 'undefined') {
                        funcList[0]();
                    }
                },
            },
            {
                text: 'Cancel',
                css: 'btn-default-action cancel',
                func: function () {
                    hideDialog(EdialogNo.basicConfirmDialog);
                    if (typeof funcList[1] !== 'undefined') {
                        funcList[1]();
                    }
                },
            },
        ],
        true,
        () => {
            // 첫번째 버튼에 포커스
            const btnList = document.querySelectorAll(
                `#${dialogIdHead}${EdialogNo.basicConfirmDialog} .container-footer button.btn-default-action`,
            ) as NodeListOf<HTMLButtonElement>;
            if (btnList.length > 0) {
                btnList[0].focus();
            }
        },
    );
};
export const basicAlertDialog = (
    text: string,
    cbFunc: IBasicCbFunc | null = null,
) => {
    const contentNode = document.createElement('div');
    contentNode.innerText = text;
    contentNode.className = 'container-body';

    const pElem = document.createElement('p');
    pElem.innerText = text;
    contentNode.appendChild(pElem);

    const title = '';
    showDialog(EdialogNo.basicAlertDialog, title, contentNode, [
        {
            text: 'OK',
            func: function () {
                if (cbFunc !== null) {
                    cbFunc();
                }
                hideDialog();
            },
        },
    ]);
};

export const UserConfigDialog = (execFunc: any) => {
    const userId = DataStore.getUserId();

    const contentNode = document.createElement('div');
    contentNode.className = 'popup-user-config';

    const spanNode = document.createElement('span');
    spanNode.innerText = '아이디 : ';

    const textForm = document.createElement('input');
    textForm.type = 'text';
    textForm.id = 'idx_user_id';
    textForm.value = userId;
    textForm.onkeydown = (event: any) => {
        common.cancelBubble(event);
        const keyCode = KeyEvent.getKeyCode(event);
        if (keyCode === EkeyName.ENTER) {
            if (typeof execFunc !== 'undefined') {
                execFunc(textForm);
            }
        }
        // if(keyCode === EkeyName.ESC) {
        //     hideDialog();
        // }
    };

    contentNode.appendChild(spanNode);
    contentNode.appendChild(textForm);

    /*
    const contentNode2 = document.createElement('div');
    contentNode2.className = 'popup-user-config';

    const spanNode2 = document.createElement('span');
    spanNode2.innerText = '언어셋 : ';
    contentNode2.appendChild(spanNode2);

    const langSelectForm = document.createElement('select');
    langSelectForm.id = 'idx_user_lang';
    const userLangList = Object.values(EuserLang);
    console.log('userLangList', userLangList);
    for (let i = 0; i < userLangList.length; i++) {
        const optionElem = document.createElement('option');
        optionElem.value = userLangList[i];
        optionElem.innerText = userLangList[i];
        if (userLangList[i] === userInfo.getLang()) {
            optionElem.selected = true;
        }
        langSelectForm.appendChild(optionElem);
    }
    langSelectForm.onchange = (event: any) => {
        const selLang = event.target.value;
        console.log('selLang', selLang);
        userInfo.setLang(selLang);
    };

    contentNode2.appendChild(langSelectForm);
    */

    const contentNodeContainer = document.createElement('div');
    contentNodeContainer.appendChild(contentNode);
    // contentNodeContainer.appendChild(contentNode2);

    setTimeout(() => {
        textForm.focus();
        textForm.select();
    }, 500);

    showDialog(
        EdialogNo.docSaveDialog,
        'User ID',
        contentNodeContainer,
        [
            {
                text: 'OK',
                func: function () {
                    //                    hideDialog();
                    if (typeof execFunc !== 'undefined') {
                        execFunc(textForm);
                    }
                },
            },
        ],
        false,
    );
};

export const docSubjectDialog = (
    funcList: any[] = [],
    title = 'Save',
    subjectText = '',
) => {
    const contentNode = document.createElement('div');
    contentNode.className = 'container-body';
    contentNode.style.textAlign = 'center';

    const pNode = document.createElement('p');
    pNode.innerText = '문서 제목을 입력해 주세요.';

    const textForm = document.createElement('input');
    textForm.type = 'text';
    textForm.id = 'idx_doc_name';
    textForm.style.marginTop = '5px';
    textForm.style.width = '90%';
    if (subjectText !== '') {
        textForm.value = subjectText;
    }
    textForm.onkeydown = (event: any) => {
        common.cancelBubble(event);
        const keyCode = KeyEvent.getKeyCode(event);
        if (keyCode === EkeyName.ENTER) {
            if (typeof funcList[0] !== 'undefined') {
                funcList[0](textForm);
            }
        }
        // if(keyCode === EkeyName.ESC) {
        //     hideDialog();
        // }
    };

    contentNode.appendChild(pNode);
    contentNode.appendChild(textForm);

    setTimeout(() => {
        textForm.focus();
        if (subjectText !== '') {
            textForm.select();
        }
    }, 500);

    showDialog(EdialogNo.docSaveDialog, title, contentNode, [
        {
            text: 'OK',
            func: function () {
                //                    hideDialog();
                if (typeof funcList[0] !== 'undefined') {
                    funcList[0](textForm);
                }
            },
        },
        {
            text: 'Cancel',
            css: 'btn-default-action cancel',
            func: function () {
                //                  hideDialog();
                if (typeof funcList[1] !== 'undefined') {
                    funcList[1](textForm);
                }
            },
        },
    ]);
};

export const docSendToDialog = (
    funcList: any[] = [],
    title = 'Send To',
    subjectText = '',
) => {
    const userId = DataStore.getUserId();

    const contentNode = document.createElement('div');
    contentNode.className = 'popup-send-to-config';

    const spanNode = document.createElement('span');
    spanNode.innerText = '아이디 : ';

    const textForm = document.createElement('input');
    textForm.type = 'text';
    textForm.id = 'idx_user_id';
    textForm.value = userId;
    textForm.autocomplete = 'off';
    // textForm.onkeydown = (event: any) => {
    //     common.cancelBubble(event);
    //     const keyCode = KeyEvent.getKeyCode(event);
    //     if (keyCode === EkeyName.ENTER) {
    //         if (typeof funcList[0] !== 'undefined') {
    //             funcList[0](textForm);
    //         }
    //     }
    // };
    contentNode.appendChild(spanNode);
    contentNode.appendChild(textForm);

    const contentNode2 = document.createElement('div');
    contentNode2.className = 'popup-send-to-config';

    const spanNode2 = document.createElement('span');
    spanNode2.innerText = '제목 : ';

    const textForm2 = document.createElement('input');
    textForm2.type = 'text';
    textForm2.id = 'idx_doc_name';
    textForm2.autocomplete = 'off';
    // textForm2.style.marginTop = '5px';
    // textForm2.style.width = '90%';
    if (subjectText !== '') {
        textForm2.value = subjectText;
    }
    contentNode2.appendChild(spanNode2);
    contentNode2.appendChild(textForm2);

    textForm.onkeydown = (event: any) => {
        common.cancelBubble(event);
        const keyCode = KeyEvent.getKeyCode(event);
        if (keyCode === EkeyName.ENTER) {
            if (typeof funcList[0] !== 'undefined') {
                funcList[0](textForm, textForm2);
            }
        }
    };
    textForm2.onkeydown = (event: any) => {
        common.cancelBubble(event);
        const keyCode = KeyEvent.getKeyCode(event);
        if (keyCode === EkeyName.ENTER) {
            if (typeof funcList[0] !== 'undefined') {
                funcList[0](textForm, textForm2);
            }
        }
    };

    const contentNodeContainer = document.createDocumentFragment();
    contentNodeContainer.appendChild(contentNode);
    contentNodeContainer.appendChild(contentNode2);

    setTimeout(() => {
        textForm.focus();
        if (subjectText !== '') {
            textForm.select();
        }
    }, 500);

    showDialog(EdialogNo.docSaveDialog, title, contentNodeContainer, [
        {
            text: 'OK',
            func: function () {
                //                    hideDialog();
                if (typeof funcList[0] !== 'undefined') {
                    funcList[0](textForm, textForm2);
                }
            },
        },
        {
            text: 'Cancel',
            css: 'btn-default-action cancel',
            func: function () {
                //                  hideDialog();
                if (typeof funcList[1] !== 'undefined') {
                    funcList[1](textForm, textForm2);
                }
            },
        },
    ]);
};

export const showFolderDeleteDialog = (btnList: any[] = []) => {
    // const contentNode = document.createElement("div");
    // contentNode.className = "container-body";
    const pElem = document.createElement('p');
    pElem.innerText =
        'Delete the group and it`s contents or delete only the group?';
    // contentNode.appendChild(pElem);

    showDialog(EdialogNo.folderDeleteDialog, 'Warning', pElem, btnList);
};

export const showColorPickerDropDown = (
    e: any,
    title: string,
    callback: IcolorPickCbFunc,
) => {
    const parentElem = e.target;
    const dialogNo = EdialogNo.colorDropDownDialog;

    const content = document.createElement('div');
    content.className = 'color-picker-dropdown-contaniner';

    // const presetList = basicData.colorPreset.slice();

    // 1. 컬러 프리셋
    const presetContainer = document.createElement('div');
    presetContainer.className = 'color-pick-container';

    const presetResult = setColorListView(presetContainer, 'preset', callback);
    if (presetResult) {
        content.appendChild(presetContainer);
    }

    // 2. 히스토리 컬리셋
    const historyColorListContainer = document.createElement('div');
    historyColorListContainer.className = 'color-picker-ctrl-btns';

    const historyResult = setColorListView(
        historyColorListContainer,
        'history',
        callback,
    );
    if (historyResult) {
        content.appendChild(historyColorListContainer);
    }

    // 3. 사용자 컬리셋
    const userColorListContainer = document.createElement('div');
    userColorListContainer.className = 'color-picker-ctrl-btns';

    const button_add = document.createElement('button');
    button_add.className = 'btn-add';
    button_add.onclick = () => {
        const selectColorCode = String(
            $('.color-pick-container .color-pick-item-selector.select').attr(
                'color_code',
            ) || '',
        );
        if (selectColorCode) {
            console.log('selectColorCode : ', selectColorCode);

            const userColorList = DataStore.getUserColorList();
            const matchColor =
                userColorList.find(
                    (colorCode: string) => colorCode == selectColorCode,
                ) || null;
            if (!matchColor) {
                DataStore.addUserColor(selectColorCode);
                // 추가 후 목록 새로불러옴
                const userResult = setColorListView(
                    userColorListContainer,
                    'user',
                    callback,
                );
                console.log('userResult : ', userResult);
            } else {
                showToastMessage('이미 추가되어 있는 색생입니다.');
            }
        }
    };

    const button_del = document.createElement('button');
    button_del.className = 'btn-del';
    button_del.onclick = () => {
        const selectColorCode = String(
            $('.color-picker-ctrl-btns .color-pick-item-selector.select').attr(
                'color_code',
            ) || '',
        );
        if (selectColorCode) {
            DataStore.removeUserColor(selectColorCode);
            // 삭제 후 목록 새로불러옴
            const userResult = setColorListView(
                userColorListContainer,
                'user',
                callback,
            );
            console.log('userResult : ', userResult);
        }
    };

    userColorListContainer.appendChild(button_del);
    userColorListContainer.appendChild(button_add);

    // 로컬스토리지의 사용자 컬러셋 불러와서 userColorListContainer 에 추가
    const userResult = setColorListView(
        userColorListContainer,
        'user',
        callback,
    );
    console.log('userResult : ', userResult);

    content.appendChild(userColorListContainer);

    // 4. 상세 컬러피커
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.className = 'color-picker-ctrl-btns';
    const colorpickerResult = setColorPickerView(
        colorPickerContainer,
        callback,
    );
    console.log('colorpickerResult : ', colorpickerResult);

    content.appendChild(colorPickerContainer);

    // 4. 드롭다운 출력
    const btnList: any[] = [];
    showDropdown(parentElem, dialogNo, title, content, btnList);
};

// 컬러피커의 사용자정의 컬러셋 리스트 생성하여 parentNode 자식으로 추가
const setColorListView = (
    parentNode: HTMLDivElement,
    setType: 'preset' | 'user' | 'history',
    callback: IcolorPickCbFunc,
): boolean => {
    $(parentNode).children('.color-pick-item').remove();

    let userColorList: string[] = [];
    if (setType === 'history') {
        userColorList = DataStore.getColorHistoryList();
    } else if (setType === 'user') {
        userColorList = DataStore.getUserColorList();
    } else {
        basicData.colorPreset.map((colors: string[]) => {
            userColorList.push(...colors);
        });
    }
    console.log('userColorList : ', userColorList);
    if (userColorList.length === 0) return false;

    userColorList.map((colorCode: string) => {
        const pickItem = document.createElement('div');
        pickItem.className = 'color-pick-item';
        pickItem.style.backgroundColor = colorCode;
        pickItem.title = colorCode;
        pickItem.setAttribute('color_code', colorCode);
        if (colorCode) {
            pickItem.onmouseenter = function () {
                const pickSelector = document.createElement('div');
                pickSelector.className = 'color-pick-item-selector on';
                $(pickSelector).css('borderColor', colorCode);
                $(this).append(pickSelector);
            };
            pickItem.onmouseleave = function () {
                $(this).children('.color-pick-item-selector.on').remove();
            };
            pickItem.ondblclick = function () {
                callback(colorCode);
                DataStore.addColorHistory(colorCode);
                hideDropDown();
            };
            pickItem.onclick = function () {
                $('.color-pick-item-selector.select').remove();
                const pickSelector = document.createElement('div');
                pickSelector.className = 'color-pick-item-selector select';
                pickSelector.setAttribute('color_code', colorCode);
                pickSelector.ondblclick = () => {
                    callback(colorCode);
                    DataStore.addColorHistory(colorCode);
                    hideDropDown();
                };
                $(this).append(pickSelector);
            };
        }
        parentNode.appendChild(pickItem);
        return true;
    });

    return true;
};

const setColorPickerView = (
    parentNode: HTMLDivElement,
    callback: IcolorPickCbFunc,
): boolean => {
    console.log('callback : ', callback);

    const container = document.createElement('div');
    container.className = 'colorpicker-container';

    const pickerBox = document.createElement('div');
    pickerBox.className = 'colorpicker-box';

    const pickerBg = document.createElement('div');
    pickerBg.className = 'colorpicker-bg';
    //    pickerBg.innerHTML = '<input type="color" />';

    const pickerLine = document.createElement('div');
    pickerLine.className = 'colorpicker-line';

    pickerBox.appendChild(pickerBg);
    pickerBox.appendChild(pickerLine);

    const pickerProps = document.createElement('div');
    pickerProps.className = 'colorpicker-props';

    container.appendChild(pickerBox);
    container.appendChild(pickerProps);

    parentNode.appendChild(container);
    return true;
};

export const showListItemDialog = (
    listTypeVal: string,
    defaultItem: string,
    func: any,
    event: any,
) => {
    const items = basicData.listDialogItems.find(
        item => item.listType === listTypeVal,
    );
    if (typeof items === 'undefined') return;

    const listContainer = document.createElement('ul');
    listContainer.className = 'list-dialog-container';

    items.listData.map(item => {
        const list = document.createElement('li');
        if (defaultItem === item.id) {
            $(list).addClass('active');
        }
        list.onclick = () => {
            console.log(item.id);
            hideDropDown();
            if (typeof func !== 'undefined') {
                func(item.id);
            }
        };

        const listImg = document.createElement('i');
        listImg.className = `ic-${item.id}`;

        const listText = document.createElement('span');
        listText.innerText = item.name;

        list.appendChild(listImg);
        list.appendChild(listText);

        listContainer.appendChild(list);

        return true;
    });

    // showDialog(basicData.dialogNo.listDialog, items.listName, listContainer);
    // parentNode.appendChild(listContainer);

    const parentElem = event.target;
    const dialogNo = EdialogNo.colorDropDownDialog;
    const btnList: any[] = [];
    showDropdown(parentElem, dialogNo, items.listName, listContainer, btnList);

    // dialog close
    const closebtn = document.createElement('a');
    closebtn.className = 'dialog-close';
    closebtn.innerText = '닫기';

    const titleElement = parentElem.querySelector('.dialog-dropdown-title');
    titleElement.appendChild(closebtn);

    closebtn.addEventListener('click', () => {
        hideDropDown();
    });
};

let loadingTimer: any = null;
export const showLoading = (maxSec = 10, transparent = false) => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = null;

    let loadingDim = document.querySelector('.loading-dim') as HTMLDivElement;
    if (loadingDim === null) {
        loadingDim = document.createElement('div');
        loadingDim.className = 'loading-dim';
        document.body.appendChild(loadingDim);
    }
    if (transparent) {
        loadingDim.className = 'loading-dim trans active';
    } else {
        loadingDim.className = 'loading-dim active';
    }
    // loadingDim.style.display = 'block';

    let loadingObj = document.querySelector('.loading') as HTMLDivElement;
    if (loadingObj === null) {
        loadingObj = document.createElement('div');
        loadingObj.className = 'loading';
        loadingDim.appendChild(loadingObj);
    }

    loadingTimer = setTimeout(() => {
        hideLoading();
    }, maxSec * 1000);
};
export const hideLoading = () => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = null;
    const loadingDim = document.querySelector('.loading-dim') as HTMLDivElement;
    if (loadingDim && loadingDim.classList.contains('active')) {
        loadingDim.classList.remove('active');
        // loadingDim.style.display = '';
        // loadingDim.className = 'loading-dim';
    }
};

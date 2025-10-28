import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../../../store';
import { EimageAddType, EobjectType } from '../../../../const/types';
import $ from 'jquery';
import { allEventCancel } from '../../../../util/common';
import * as FileEvent from '../../../../event/FileEvent';
import { getOrgImageSize } from '../../../../event/ImageEvent';
import { refreshObjectSelector } from '../../../../event/SquareEvent';
import * as objects from '../../../../util/objects';

const Images = observer(() => {
    const { workInfo, userInfo } = store;
    const [objectType, setObjectType] = useState<string>('');
    const currObject: HTMLImageElement | null = workInfo.getObject();
    const objectGroup = workInfo.getObjectGroup();
    const updateKey = workInfo.getUpdateKey();
    const LANGSET = userInfo.getLangSet();

    useEffect(() => {
        updateObjectImageInfoForm(currObject);
    }, [currObject, updateKey]);

    useEffect(() => {
        for (const obj of objectGroup) {
            const type = objects.getObjectType(obj);
            setObjectType(type);
            if (type === EobjectType.audio) {
                break;
            }
        }
    }, [objectGroup]);

    const updateObjectImageInfoForm = (
        targetObject: HTMLImageElement | null,
    ) => {
        if (targetObject !== null) {
            // const objType: string | null =
            //     targetObject.getAttribute('object-type');
            // setObjectType(objType ? objType : '');
            $('#idx_object_src').val(targetObject.src);
            $('.properties-list-content-informations input').each(
                (index, item) => {
                    $(item).removeAttr('disabled');
                },
            );
        } else {
            // setObjectType('');
            $('#idx_object_src').val('');
            $('.properties-list-content-informations input').each(
                (index, item) => {
                    $(item).attr('disabled', 'disabled');
                },
            );
        }
    };

    const changeObjectSrc = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            FileEvent.executeUpload(event, EimageAddType.replace);
            // workInfo.setUpdateKey();
        } else {
            console.log('eeeeeeeeeee');
        }
        allEventCancel(event);
        event.target.value = '';
    };

    const downKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
        allEventCancel(e);
    };

    const setOrgSize = (imageObj: HTMLImageElement) => {
        const imageSrc = imageObj.src;
        getOrgImageSize(imageSrc)
            .then((res: any) => {
                $(imageObj).css({
                    width: res.width,
                    height: res.height,
                });
                refreshObjectSelector(imageObj);
                workInfo.setUpdateKey();
            })
            .catch(err => {
                console.log(err);
            });
    };

    if (currObject === null || objectType === EobjectType.audio) {
        return <></>;
    }

    return (
        <article
            className="box-list"
            style={{ display: objectType === 'image' ? 'block' : 'none' }}
        >
            <div className="list-title">{LANGSET.PROPERTY.IMAGE.TITLE}</div>
            <div className="list-content">
                <div className="content-file">
                    {/* <input type="text" className="frm-name" name="" id="idx_object_src" onKeyDown={downKeyEvent}/>
                        <button type="button" className="frm-edit-image">Edit
                            <input type="file" accept="image/gif, image/jpeg, image/png" onChange={(e)=>changeObjectSrc(e)}></input>
                        </button> */}

                    <div className="inputFile">
                        <input
                            type="text"
                            className="frm-name"
                            name=""
                            id="idx_object_src"
                            onKeyDown={downKeyEvent}
                            readOnly
                        />
                        <input
                            type="file"
                            id="img-obj-input-file"
                            accept="image/gif, image/jpeg, image/png"
                            onChange={e => changeObjectSrc(e)}
                        />
                        <label htmlFor="img-obj-input-file">File</label>
                        {currObject !== null && (
                            <button
                                className="reset"
                                onClick={() => setOrgSize(currObject)}
                            >
                                {LANGSET.PROPERTY.IMAGE.ORG_SIZE}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
});

export default Images;

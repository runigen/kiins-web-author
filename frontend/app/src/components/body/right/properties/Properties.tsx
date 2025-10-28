import React from 'react';
// import { observer } from 'mobx-react';
import Informations from './Informations';
import Shapes from './Shapes';
import Styles from './Styles';
import Outlines from './Outlines';
import Images from './Images';
import Animations from './Animations';
import Template from './Template';
import Audio from './Audio';
import Youtube from './Youtube';

const Properties = () => {
    // useEffect(() => {
    //     document.addEventListener("mousedown", closePropertyDropDown);
    //     return () => {
    //         document.removeEventListener("mousedown", closePropertyDropDown);
    //     }
    // }, []);

    // const closePropertyDropDown = (event) => {
    //     dialog.hideDropDown();
    //     allEventCancel(event);
    // }

    return (
        <>
            <Informations />
            <Shapes />
            <Styles />
            <Outlines />
            <Images />
            <Audio />
            <Animations />
            <Template />
            <Youtube />
        </>
    );
};

export default Properties;

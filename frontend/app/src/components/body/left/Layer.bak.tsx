import React, { useState } from 'react'
import { observer } from 'mobx-react';
import store from '../../../store';

const Layer = observer(() => {

    const { userInfo, docData } = store;
    const userList = userInfo.getList();
    const pageData = docData.getData();


    console.log("pageData:" , pageData);

    return (
        <>
            layer
            
        </>
    )
});

export default Layer;
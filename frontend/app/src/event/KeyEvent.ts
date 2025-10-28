// import React, { useState } from 'react';

export const getKeyCode = (event: any) => {
    console.log('============ getKeyCode Call ===============');

    if (event) {
        console.log('ctrlKey : ', event.ctrlKey);
        console.log('altKey : ', event.altKey);
        console.log('shiftKey : ', event.shiftKey);
        console.log('metaKey : ', event.metaKey);
    }
    const eventKey = String(event.key).trim();
    if (
        typeof eventKey !== 'undefined' &&
        eventKey !== null &&
        eventKey !== ''
    ) {
        console.log(
            'event.key:[' + eventKey + '], (type:' + typeof eventKey + ')',
        );
        return eventKey.toLowerCase();
    } else if (typeof event.keyCode !== 'undefined') {
        console.log('event.keyCode:', event.keyCode);
        return String(event.keyCode).toLowerCase();
    }
    // console.log("event key none");
    return null;
};

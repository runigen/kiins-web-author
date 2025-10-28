import React from 'react';
import { allEventCancel } from '../../../../util/common';

// 4. separator
const Separator = () => {
    return (
        <div className={`toolbar separator`} onMouseDown={allEventCancel}></div>
    );
};
export default Separator;

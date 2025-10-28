import React, { useState } from 'react';
import { observer } from 'mobx-react';
import Pages from './Pages';
import Layer from './Layer.bak';
import Objects from '../../header/objects';

const Left = () => {
    const [topMenu, setTopMenu] = useState('page');

    const showTopMenu = (menu: string) => {
        setTopMenu(menu);
    };

    return (
        <>
            <div className="body-left">
                <div className="body-left-page-layer-container">
                    <div className="body-left-top">
                        <div
                            className={
                                'body-left-top-menu' +
                                (topMenu === 'page' ? ' active' : '')
                            }
                            onClick={() => showTopMenu('page')}
                        >
                            page
                        </div>
                        <div
                            className={
                                'body-left-top-menu' +
                                (topMenu === 'layer' ? ' active' : '')
                            }
                            onClick={() => showTopMenu('layer')}
                        >
                            layer
                        </div>
                    </div>
                    <div className="body-left-content">
                        <div
                            className={
                                'body-left-page' +
                                (topMenu === 'page' ? ' active' : '')
                            }
                        >
                            <Pages />
                        </div>

                        <div
                            className={
                                'body-left-layer' +
                                (topMenu === 'layer' ? ' active' : '')
                            }
                        >
                            <Layer />
                        </div>
                    </div>
                </div>
                <div className="body-left-objects-container">
                    <div className="objects-top-space">object</div>
                    <div className="objects-contents">
                        <Objects />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Left;

import css from '!!raw-loader!!sass-loader!./styles.scss';
import fonts from '!!raw-loader!!sass-loader!./fonts.scss';
import * as CommonEvent from './template/CommonEvent';
import * as util from './util';

console.log(
    '%cMEEOOCAT',
    'font-size:50px; color: orange; font-family: Arial; font-weight: bolder;',
);
console.log(
    '%cDynamic Web Contents Maker!',
    'font-size:24px; color: black; font-family: Arial; font-weight: bolder;',
);
if (process.env.NODE_ENV === 'production') {
    // console.log = () => {}
    // console.debug = () => {}
    // console.dir = () => {}
}
declare global {
    interface Window {
        globalContent: any;
        meeoocatPlayer: any;
    }
}

const meeoocatPlayer = {
    loadContent: (
        contentId: string,
        docPath: string,
        docNo: string,
        callback: any = undefined,
    ) => {
        try {
            const targetContainer = document.getElementById(contentId);
            if (targetContainer === null) return;
            meeoocatPlayer.loadDoc(docPath, docNo, () => {
                const container = document.createElement('div');
                container.id = 'idx_meeoocat_view_container';
                container.className = 'meeoocat-view-container';
                targetContainer.appendChild(container);

                const ctlContainer = document.createElement('div');
                ctlContainer.id = 'idx_meeoocat_view_container_ctl';
                ctlContainer.className = 'meeoocat-view-container-ctl';
                targetContainer.appendChild(ctlContainer);

                meeoocatPlayer.loadCss();

                CommonEvent.setCanvasContents();

                if (typeof callback === 'function') {
                    callback();
                }
            });
        } catch (e) {
            console.log(e);
        }
    },
    loadDoc: (docPath: string, docNo: string, callback: any) => {
        try {
            console.log('_______loadDoc_____');
            docPath = docPath.replace(/\/+$/g, '');
            const currTime = new Date().getTime();
            const docUrl = `${docPath}/${docNo}/${docNo}.js?_t=${currTime}`;
            // const resUrl = `${docPath}/${docNo}/res/`;
            // const orgResUrl = `docs/${docNo}/res/`;
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.onload = () => {
                console.log('_______onload_____');
                if (
                    window.globalContent === undefined ||
                    window.globalContent.docContentList === undefined ||
                    Array.isArray(window.globalContent.docContentList) !== true
                ) {
                    return;
                }

                // replaceDocImagePathAll
                console.log('docPath : ', docPath);
                const pathExp = /^\.\./;
                if (pathExp.test(docPath) === true) {
                    let newContent = JSON.stringify(window.globalContent);
                    newContent = util.replaceDocImagePathAll(docNo, newContent);
                    window.globalContent = JSON.parse(newContent);
                    console.log('newContent : ', newContent);
                }
                console.log('not match');

                CommonEvent.setTotalPage(
                    window.globalContent.docContentList.length,
                );
                if (typeof callback === 'function') {
                    callback();
                }
            };

            script.onerror = () => {
                console.log(`file not loaded : ${docUrl}`);
                alert('문서파일을 찾을 수 없습니다.(' + docUrl + ')');
            };
            script.src = docUrl;
            document.getElementsByTagName('head')[0].appendChild(script);

            // // google font
            // const link1 = document.createElement('link');
            // link1.rel = 'preconnect';
            // link1.href = 'https://fonts.googleapis.com';
            // const link2 = document.createElement('link');
            // link2.rel = 'preconnect';
            // link2.href = 'https://fonts.gstatic.com';
            // link2.crossOrigin = 'true';
            // const link3 = document.createElement('link');
            // link3.href =
            //     'https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap';
            // link3.rel = 'stylesheet';
            // document.getElementsByTagName('head')[0].appendChild(link1);
            // document.getElementsByTagName('head')[0].appendChild(link2);
            // document.getElementsByTagName('head')[0].appendChild(link3);
        } catch (e) {
            console.log(e);
        }
    },

    loadCss: () => {
        try {
            const cssNode = document.createElement('style');
            cssNode.innerHTML = css;
            document.getElementsByTagName('head')[0].appendChild(cssNode);

            const fontsNode = document.createElement('style');
            fontsNode.innerHTML = fonts;
            document.getElementsByTagName('head')[0].appendChild(fontsNode);
        } catch (e) {
            console.log(e);
        }
    },

    play: () => {
        CommonEvent.play();
    },
    pause: () => {
        CommonEvent.pause();
    },
    resume: () => {
        CommonEvent.resume();
    },
    restart: () => {
        CommonEvent.restart();
    },
    goNextPage: () => {
        CommonEvent.goNextPage();
    },
    goPrevPage: () => {
        CommonEvent.goPrevPage();
    },
};
window.meeoocatPlayer = meeoocatPlayer;

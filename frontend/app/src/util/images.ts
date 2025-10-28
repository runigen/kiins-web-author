import docData from '../store/docData';
import * as htmlToImage from 'html-to-image';
import * as pages from './pages';

export const makeCurrentPageThumbnail = async () => {

    const pageObj = pages.getCanvasObject();
    htmlToImage.toPng(pageObj).then(dataUrl =>  {
        var img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img);
    })
  .catch(function (error) {
    console.error('oops, something went wrong!', error);
  });




}

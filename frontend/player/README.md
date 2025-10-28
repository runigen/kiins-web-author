# meeoocat-player

#### 웹페이지 삽입용 js 라이브러리 (애니메이션에 anime.js 라이브러리 사용)
#### 빌드 후 빌드된 meeoocat-player.js 파일 사용

## local test
```bash
npm start
```


## build
```bash
npm run build
```


## 사용 예제 (mycontent 영역에 삽입)

```html
...
<div id="mycontent"></div>
<script src="meeoocat-player.js"></script>
<script>
    // param (id, 문서파일경로, 문서번호, 로딩완료후 자동으로 동작할 함수)
    meeoocatPlayer.loadContent('mycontent', 'docs', 'MCD182aa2ab067', function() {
        // meeoocatPlayer.play(); // 자동실행
    });
</script>
...
```

## 플레이 컨트롤 
```html
// play, resume
meeoocatPlayer.play();

// pause 
meeoocatPlayer.pause();

// restart
meeoocatPlayer.restart();
```
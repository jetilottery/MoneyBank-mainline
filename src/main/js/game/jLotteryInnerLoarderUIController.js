define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'skbJet/component/resourceLoader/resourceLib'
], function(msgBus, SKBeInstant, config, resLib){

var loadDiv = document.createElement('div');
var progressBarDiv = document.createElement('div');
var progressDiv = document.createElement('div');
var loadingBarButton = document.createElement('div');
var gameLogoDiv = document.createElement('div');
var orientation = 'landscape';
var gce;
var scaleRate = 1;

function applyStyle(elem, styleData){
    for(var s in styleData){
        if(typeof styleData[s] === 'number'){
            elem.style[s] = styleData[s]+'px';
        }else{
            elem.style[s] = styleData[s];
        }
    }
}

function setBgImageFromResLib(elem, imgName){
    if(resLib&&resLib.splash&&resLib.splash[imgName]){
        var bgImgUrl = resLib.splash[imgName].src;
        if(bgImgUrl){
            elem.style.backgroundImage = 'url('+bgImgUrl+')';
        }
    }
}

function updateSize(winW, winH){
    gce.style.width = winW + 'px';
    gce.style.height = winH + 'px';
}
function onWindowResized(){
    var gameHeight = 0, gameWidth = 0;
    if(SKBeInstant.config.assetPack === 'desktop'){
        gameHeight = SKBeInstant.config.revealHeightToUse;
        gameWidth = SKBeInstant.config.revealWidthToUse;
    }else{
        var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
        gameWidth = targetDiv.clientWidth;
        gameHeight = targetDiv.clientHeight;
        var parentElem = targetDiv.parentElement;
        if(parentElem !== document.body){
            var parentWidth = parentElem.clientWidth;
            var parentHeight = parentElem.clientHeight;
            gameWidth = gameWidth > parentWidth ? parentWidth : gameWidth;
            gameHeight = gameHeight > parentHeight ? parentHeight : gameHeight;
        }
    }
    if(gameHeight>gameWidth){
        orientation = 'portrait';
    }else{
        orientation = 'landscape';
    }
    
    setBgImageFromResLib(gce, orientation+'Loading');
     updateSize(gameWidth, gameHeight);
    
    var pdd = config.predefinedStyle[orientation];
    if(gameWidth / pdd.loadDiv.width > gameHeight / pdd.loadDiv.height){
        scaleRate = gameHeight / pdd.loadDiv.height;
    }else{
        scaleRate = gameWidth / pdd.loadDiv.width;
    }
    
    applyStyle(loadDiv, pdd.loadDiv);
    applyStyle(progressBarDiv, pdd.progressBarDiv);
    applyStyle(gameLogoDiv, pdd.gameLogoDiv);

    loadDiv.style.transform = 'scale('+ scaleRate + ',' + scaleRate +')';
    loadDiv.style.webkitTransform = 'scale('+ scaleRate + ',' + scaleRate +')';
    loadDiv.style.marginTop = -pdd.loadDiv.height/2 + "px";
    loadDiv.style.marginLeft = -pdd.loadDiv.width/2 + "px";		
}

function onSplashLoadDone(){
    if(SKBeInstant.isSKB()){
        return;
    }
    setBgImageFromResLib(gce, orientation+'Loading');
    setBgImageFromResLib(progressBarDiv, 'loadingBarBack');
    setBgImageFromResLib(progressDiv, 'loadingBarFront');
    setBgImageFromResLib(loadingBarButton, 'loadingBarCircle');
    setBgImageFromResLib(gameLogoDiv, 'logoLoader');
}

function initUI(){
    var gameHeight = 0, gameWidth = 0;
    gce = SKBeInstant.getGameContainerElem();

    if (SKBeInstant.config.screenEnvironment === 'device') {
        gameWidth = document.getElementById(SKBeInstant.config.targetDivId).clientWidth;
        gameHeight = document.getElementById(SKBeInstant.config.targetDivId).clientHeight;            
    } else {
        gameHeight = SKBeInstant.config.revealHeightToUse;
        gameWidth = SKBeInstant.config.revealWidthToUse;
    }

    if(gameHeight>gameWidth){
        orientation = 'portrait';
    }

    loadDiv.appendChild(gameLogoDiv);
    loadDiv.appendChild(progressBarDiv);
    
    progressBarDiv.appendChild(progressDiv);
    progressBarDiv.appendChild(loadingBarButton);

    var pdd = config.predefinedStyle[orientation];
    applyStyle(loadDiv, pdd.loadDiv);
    applyStyle(progressBarDiv, pdd.progressBarDiv);
    applyStyle(progressDiv, pdd.progressDiv);
    applyStyle(loadingBarButton, pdd.loadingBarButton);
    applyStyle(gameLogoDiv, pdd.gameLogoDiv);
    
    if(SKBeInstant.config.assetPack !== 'desktop'){
        window.addEventListener('resize', onWindowResized);
    }
    onWindowResized();
    
    
    gce.style.backgroundSize = '100% 100%';
    gce.style.backgroundPosition = 'center';
    if(config.backgroundStyle){
        if(config.backgroundStyle.splashSize){
            gce.style.backgroundSize = config.backgroundStyle.splashSize;
        }
    }
    
    gce.style.position = "relative";

    gce.appendChild(loadDiv);
}

function clearDivFormatting() {
    var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
    targetDiv.innerHTML = "";
    targetDiv.style.background = '';
    targetDiv.style.backgroundSize = '';
    targetDiv.style.webkitUserSelect = '';
    targetDiv.style.webkitTapHighlightColor = '';
}

function onStartAssetLoading(){
    if(SKBeInstant.isSKB()){
        return;
    }
    clearDivFormatting();
    initUI();
}

function updateLoadingProgress(data){
    if(SKBeInstant.isSKB()){
        return;
    }
    var _progressBarWidth = parseInt((progressBarDiv.style.width), 10) - parseInt((loadingBarButton.style.width), 10);
    var posX =_progressBarWidth - parseInt((progressDiv.style.left), 10)* 4;
    progressDiv.style.width = (data.current / data.items) * 100 + "%";
    loadingBarButton.style.left = posX * (data.current / data.items) + "px";
}

function onAssetsLoadedAndGameReady(){
    if (SKBeInstant.config.assetPack !== 'desktop' && !SKBeInstant.isSKB()) {
        window.removeEventListener('resize', onWindowResized);
    }
}

msgBus.subscribe('jLottery.startAssetLoading', onStartAssetLoading);
msgBus.subscribe('jLotteryGame.updateLoadingProgress', updateLoadingProgress);
msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
msgBus.subscribe('loadController.jLotteryEnvSplashLoadDone', onSplashLoadDone);
return {};
});
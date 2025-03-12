define([
	'skbJet/component/resourceLoader/resourceLib',
	'skbJet/componentCRDC/splash/splashLoadController',
	'skbJet/componentCRDC/splash/splashUIController'
], function(resLib, splashLoadController, splashUIController){

	var logoDiv;
	var logoDivWidth = 562;
	var logoDivHeight = 224;
	var logoDivTop = 336;
	var logoDivLeft = 176;

	var progressCircleDiv;
	var progressCircleDivWidth = 20;
	var progressCircleDivHeight = 20;
	var progressCircleDivTop = -5;
	var progressCircleDivLeft = 0;

	var showCopyRight = false;
	var loadDiv;
	var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
	if(softId){
        if(softId[1].split('-')[2].charAt(0) !== '0'){
            showCopyRight = true;
        }                
    }

	function checkScreenMode(){
		var winW = Math.floor(Number(window.innerWidth));
		var winH = Math.floor(Number(window.innerHeight));
		return winW>=winH ? "landScape" : "portrait";
	}

	function updateLayoutRelatedByScreenMode(){
		if (checkScreenMode() === 'landScape'){
			document.getElementById('loadDiv').style.backgroundImage = 'url('+resLib.splash.landscapeLoading.src+')';
			logoDivTop = 0;
			logoDivLeft = 195;
            logoDivWidth = 450;
            logoDivHeight = 550;
		}else{
			document.getElementById('loadDiv').style.backgroundImage = 'url('+resLib.splash.portraitLoading.src+')';
			logoDivTop = 150;
			logoDivLeft = 0;
            logoDivWidth = 500;
            logoDivHeight = 600;
			//document.getElementById('progressBarDiv').style.top = 490 + 'px';
		}
	}

	function onLoadDone(){
		
        loadDiv = document.getElementById("loadDiv");
		document.getElementById('loadDiv').style.backgroundSize = 'cover';
		document.getElementById('progressBarDiv').style.backgroundImage = 'url('+resLib.splash.loadingBarBack.src+')';
		document.getElementById('progressDiv').style.backgroundImage = 'url('+resLib.splash.loadingBarFront.src+')';
		if(showCopyRight){
            var copyRightDiv = document.getElementById('copyRightDiv');
            copyRightDiv.innerHTML = resLib.i18n.splash.splashScreen.footer.shortVersion;
            copyRightDiv.style.color = '#FFFFFF';
        }
		logoDiv = document.createElement('div');
		logoDiv.id = 'logoDiv';
		document.getElementById('loadDiv').appendChild(logoDiv);
		logoDiv.style.position = 'absolute';
		logoDiv.style.backgroundSize = 'contain';
		logoDiv.style.backgroundRepeat = 'no-repeat';
		logoDiv.style.backgroundImage = 'url('+resLib.splash.logoLoader.src+')';
		logoDiv.style.width = logoDivWidth + 'px';
		logoDiv.style.height = logoDivHeight + 'px';
		logoDiv.style.top = logoDivTop + 'px';
		logoDiv.style.left = logoDivLeft + 'px';

		progressCircleDiv = document.createElement('div');
		progressCircleDiv.id = 'progressCircleDiv';
		document.getElementById('progressBarDiv').appendChild(progressCircleDiv);
		progressCircleDiv.style.position = 'absolute';
		progressCircleDiv.style.backgroundSize = 'cover';
		progressCircleDiv.style.backgroundRepeat = 'no-repeat';
		progressCircleDiv.style.backgroundImage = 'url('+resLib.splash.loadingBarCircle.src+')';
		progressCircleDiv.style.width = progressCircleDivWidth + 'px';
		progressCircleDiv.style.height = progressCircleDivHeight + 'px';
		progressCircleDiv.style.top = progressCircleDivTop + 'px';
		progressCircleDiv.style.left = progressCircleDivLeft + 'px';
		updateLayoutRelatedByScreenMode();

		splashUIController.onSplashLoadDone('IW');

		window.addEventListener('resize', onWindowResized);
		onWindowResized();
		window.addEventListener('message', onMessage, false);
		window.postMessage('splashLoaded', window.location.origin);
	}

	function onWindowResized(){
		updateLayoutRelatedByScreenMode();
		logoDiv.style.width = splashUIController.scale(logoDivWidth);
        logoDiv.style.height = splashUIController.scale(logoDivHeight);
        logoDiv.style.top = splashUIController.scale(logoDivTop);
        logoDiv.style.left = (loadDiv.offsetWidth - logoDiv.offsetWidth) / 2 + "px";
	
		progressCircleDiv.style.width = splashUIController.scale(progressCircleDivWidth);
		progressCircleDiv.style.height = splashUIController.scale(progressCircleDivHeight);
		progressCircleDiv.style.top = splashUIController.scale(progressCircleDivTop);
		progressCircleDiv.style.left = splashUIController.scale(progressCircleDivLeft);
	}

	function onMessage(e){
		var percentLoadedStr = e.data.loaded || null;
		if (percentLoadedStr !== null) {
			var _progressBarWidth = parseInt((document.getElementById('progressBarDiv').style.width), 10);
			var _progressCircleWidth = parseInt((document.getElementById('progressCircleDiv').style.width), 10);
			var posX =_progressBarWidth - _progressCircleWidth;
			progressCircleDiv.style.left = posX * (percentLoadedStr/100) + 'px';
		}
	}

	function init(){
		splashUIController.init({ layoutType: 'IW'});
		splashLoadController.load(onLoadDone);
	}
	init();
	return {};
});
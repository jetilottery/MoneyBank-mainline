/**
 * @module game/playAnimationController
 * @description 
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'skbJet/component/gladPixiRenderer/Sprite',
    'com/pixijs/pixi',
    'game/configController'
], function (msgBus, audio, gr, SKBeInstant, gameUtils, sp, PIXI, config) {
    var symbolsNum = 12;
    var prizeDetailArray = []; //To record all symbol to show detail
    var prizeTable = {}; //To record ticket prize table
    var revealedNum = 0;
    var winMoney = {};
    var tutorialIsShown = false;
    var playResult;
    var winChannel=0;
    var symbolChannel = 0;
    var autoSymbolChannel = 0;
    var revealAll = false;
    var playAnimationName= {};
    var clickedNum = 0;
    var goldBarIndex = 0;
    var sequence = 0;
    var prizeValue = 0;

    var recordingCurrentWinValue = 0;

    var outcome = null;
    var remainingSymbols = [];
    var recordSymbolsArr = [];
    var matchThree = 3;
    var highLevelPrizes = ['A', 'B'];
    var middleLevelPrizes = ['C', 'D', 'E'];
    var lowLevePrizes = ['F', 'G', 'H'];
    var goldNum = 0;
    var goldWinNumArr = ['UpArrow', 'UpArrow'];
    var goldWinOriginalArr = ['UpArrow', 'UpArrow'];
    var prizeObj;
    var prizeAmount, goldBarNum;
    var goldAmountValue = 0;
    var nearSymbolLists = [];
    var animationIsPlaying = false;
    var resetAllFlag = false;
    var isWinBoxError = false;

    var playSymbolRayTimer = null;
    var tmpGoldNum = 1;
    var previousTotalGoldNum = 0;
    var currentTotalGoldNum = 0;
    var goldWinIndex = 0;

    var targetPositionX, targetPositionY;
    var toTargetX, toTargetY;
    var gameCanPlay = false;
    var isRevealAll = false;
    var interval = null;
    var goldFlyInstance = null;
    var originalPositionX = null;
    var originalPositionY = null;
    var frames = [];
    function resetAll() {
        resetAllFlag = true;
        stopGoldBarMovement();
        revealedNum = 0;
        prizeDetailArray = [];
        prizeTable = {};
        winMoney = {};
        isWinBoxError = false;
        tutorialIsShown = false;
        winChannel=0;
        symbolChannel = 0;
        autoSymbolChannel = 0;
        revealAll = false;
        playAnimationName = {};
        clickedNum = 0;
        remainingSymbols = [];
        recordSymbolsArr = [];
        nearSymbolLists = [];
        isRevealAll = false;
        animationIsPlaying = false;
        sequence = 0;
        tmpGoldNum = 1;
        previousTotalGoldNum = 0;
        currentTotalGoldNum = 0;
        goldWinIndex = 0;
        goldFlyInstance = null;
        originalPositionX = null;
        originalPositionY = null;
        toTargetX = null;
        toTargetY = null;
        isRevealAll = false;
        interval = null;
        goldWinNumArr = ['UpArrow', 'UpArrow'];
        goldWinOriginalArr = ['UpArrow', 'UpArrow'];
        goldAmountValue = 0;
        playSymbolRayTimer = null;
        recordingCurrentWinValue = 0;
        gameCanPlay = false;
        disableHandOver4Symbols();
        for (var i = 0; i < symbolsNum; i++) {
            gr.lib['_Symbol_' + i].reveal = false;
            gr.lib['_Symbol' + i].setImage('symbolAnim0000');
            gr.lib['_Symbol' + i].updateCurrentStyle({'_opacity': 1});
            gr.lib['_Symbol' + i].show(true);
            gr.lib['_moneyText' + i].show(false);
            gr.lib['_symbol_dim'+i].show(false);
            gr.lib['_symbolLight' + i].show(false);
            gr.lib['_goldenFly_' + i].show(false);
            gr.lib['_goldenSparkle_' + i].show(false);
            gr.lib['_goldenFly_' + i].off('click');
            gr.lib['_symbolIdle' + i].show(false);
            gameUtils.setTextStyle(gr.lib['_moneyText'+ i], {stroke:"#ffffff", strokeThickness:0, fill:"#e98f0e"});
        }

        for (var j = 0; j < symbolsNum - 4; j++){
            gr.animMap['_moneyItem' + j + 'Anim'].updateStyleToTime(0);
            gr.lib['_moneyItem' + j].setImage('moneyItem');
        }

        for (var k = 0; k < 5; k++){
            gr.lib['_dashBarItem' + k].setImage('dashBarItem' + k + '_0001');
        }

        gr.lib._MoneyIdle.show(false);
        gr.lib._prizeAmountAnim.show(false);

        resetScale();
    }

    function enableHandOver4Symbols(){
        for (var i = 0; i < symbolsNum; i++){
            gr.lib['_Symbol' + i].pixiContainer.$sprite.interactive = true;
            gr.lib['_Symbol' + i].pixiContainer.$sprite.cursor = 'pointer';
        }
    }

    function disableHandOver4Symbols(){
        for (var i = 0; i < symbolsNum; i++){
            gr.lib['_Symbol' + i].pixiContainer.$sprite.interactive = false;
            gr.lib['_Symbol' + i].pixiContainer.$sprite.cursor = 'default';
        }
    }

    function resetScale(){
        gr.animMap._crossBarAnim01.updateStyleToTime(0);
        gr.lib._scaleRight.setImage('rightScale');
        gr.lib._count.pixiContainer.removeChildren();
    }
	
	function ifWinBoxError(currentWin, prizeValue, gameComplete){
		return gameComplete ? currentWin !== prizeValue : currentWin > prizeValue;
    }
    
    function winBoxErrorReaction(){
        gr.lib._BG_dim.show(true);
        gr.lib._buttonInfo.show(false);
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        //gr.lib._winBoxError.show(true);
        msgBus.publish('winboxError',{errorCode:"29000"});
        msgBus.publish('tutorialIsShown');
        msgBus.publish('onDisableUI');
    }

    function setComplete() {
        function setSymbolAnimComplete(symbol) {
            symbol.onComplete = function () {
                var recordObj = {};
                var symbolIndex = symbol.gameIndex;
                var prizeDetail = prizeDetailArray[sequence];
                sequence++;
                gr.lib['_moneyText' + symbolIndex].setText(SKBeInstant.formatCurrency(prizeDetail.win).formattedAmount);
                gr.lib['_moneyText' + symbolIndex].show(true);
                gr.lib['_symbol_dim' + symbolIndex].show(true);

                recordObj.symbolLocation = symbol.gameIndex;
                recordObj.winAmount = prizeDetail.win;
                recordSymbolsArr.push(recordObj);

                goldNum = Number(prizeDetail.goldBarNum);

                checkMatchThree(recordSymbolsArr, prizeDetail.win);
                
                playGoldShowupAnim(goldNum, symbolIndex);

                goldBarIndex = symbolIndex;
                revealedNum++;

                if (goldNum <=0 ){
                    animationIsPlaying = false;
                    enableReamingSymbols();
                    if (isRevealAll && !isWinBoxError){
                        startRevealAllFlow();
                    }
					if(checkAllRevealed()){
                        if(recordingCurrentWinValue !== prizeValue){
                            winBoxErrorReaction();
                            return;
                        }
						msgBus.publish('allRevealed');
                    }
                    if(!isWinBoxError){
                        playSymbolRayAnim();
                    }
                }
            };

        }

        function setGoldShowupAnimComplete(symbol){
            symbol.onComplete = function(){
                symbol.show(false);
                if (goldNum > 0){
                    updateTargetPosition();
                    createGoldenFlyInstance();
                    caculateRotation();
                    gr.getTicker().add(goldBarMovement);
                }
            };
        }

        function setGoldFlyAnimComplete(symbol){
            symbol.onComplete = function(){
                
            };
        }

        for (var i = 0; i < symbolsNum; i++) {
            setSymbolAnimComplete(gr.lib['_Symbol' + i]);  
            setGoldShowupAnimComplete(gr.lib['_goldenSparkle_' + i]);
            setGoldFlyAnimComplete(gr.lib['_goldenFly_' + i]);
        }

        gr.lib._MoneyIdle.onComplete = function(){
            if (gr.lib._MoneyIdle){
                gr.lib._MoneyIdle.stopPlay();
                gr.lib._MoneyIdle.show(false);
            }
        };
    }

    var symbolRayAnimTimer = null;
    function playSymbolIdleAnim(sprite){
        if (sprite){
            sprite.stopPlay();
            sprite.show(true);
            sprite.gotoAndPlay('symbolRayAnim', 0.8);
            sprite.onComplete = function(){
                sprite.stopPlay();
                symbolRayAnimTimer = gr.getTimer().setTimeout(function(){
                    gr.getTimer().clearTimeout(symbolRayAnimTimer);
                    sprite.gotoAndPlay('symbolRayAnimAgainst', 0.8);
                    sprite.onComplete = function(){
                        sprite.show(false);
                        sprite.stopPlay();
                    };
                }, 800);
            };
        }
    }

    function stopSymbolIdleAnim(){
       for (var i = 0; i < symbolsNum; i++){
           gr.lib['_symbolIdle' + i].stopPlay();
           gr.lib['_symbolIdle' + i].show(false);
        }
    }

    function playSymbolRayAnim(){
        if (!isRevealAll && clickedNum < (symbolsNum - 4)){
                playSymbolRayTimer = gr.getTimer().setInterval(function(){
                playSymbolIdleAnim(gr.lib['_symbolIdle' + gameUtils.obtainRandomElementOfArray(remainingSymbols)]);
            } ,3000);
        }
    }
    
    function stopPlaySymbolRayAnim(){
        stopSymbolIdleAnim();
        gr.getTimer().clearInterval(playSymbolRayTimer);
    }

    /**
     * Play GoldBars showup animations.
     * @goldNum {Number} GoldBars Amount (1 or 2)
     * @symbolIndex {String} Current interact symbol location
     */
    function playGoldShowupAnim(goldNum, symbolIndex){
        if (goldNum > 0){
            var animName = null;
            gr.lib['_goldenSparkle_' + symbolIndex].show(true);
            switch(Number(goldNum)){
                case 1:
                    animName = 'goldSparkleAnim';
                    audio.play(config.audio.RevealSingle.name, config.audio.RevealSingle.channel);
                    break;

                case 2:
                    animName = 'twoGoldSparkleAnim';
                    audio.play(config.audio.RevealDouble.name, config.audio.RevealDouble.channel);
                    break;
            }
            gr.lib['_goldenSparkle_' + symbolIndex].gotoAndPlay(animName, 0.3);
            playAnimationName['_goldenSparkle_' + symbolIndex] = gr.lib['_goldenSparkle_' + symbolIndex];
            playMoneyScatterAnim();
            if (nearSymbolLists.indexOf(symbolIndex.toString()) > -1) {
                gr.getTimer().setTimeout(function(){
                    if (resetAllFlag){
                        return;
                    }
                    audio.play(config.audio.FlameThrowShort.name, config.audio.FlameThrowShort.channel);
                }, 1800);
            }else{
                gr.getTimer().setTimeout(function(){
                    if (resetAllFlag){
                        return;
                    }
                    audio.play(config.audio.FlameThrowLong.name, config.audio.FlameThrowLong.channel);
                }, 1800);
            }
        }
    }
    
    function playScaleAnims(goldNum){
        currentTotalGoldNum += goldNum;
        if (currentTotalGoldNum - previousTotalGoldNum > 0){
            updateRightScaleGoldImage(tmpGoldNum);
            gr.animMap['_crossBarAnim0' + (Number(previousTotalGoldNum) + 1)].play();
            gr.lib['_dashBarItem' + (4 - Number(previousTotalGoldNum))].gotoAndPlay('dashBarItem' + (4 - Number(previousTotalGoldNum)), 0.3);
            tmpGoldNum++;
            gr.animMap['_crossBarAnim0' + (Number(previousTotalGoldNum) + 1)]._onComplete = function(){
                updateLeftRelatedAnims();
                if (currentTotalGoldNum - previousTotalGoldNum === 2){
                    gr.lib['_dashBarItem' + (4 - Number(currentTotalGoldNum - 1))].gotoAndPlay('dashBarItem' + (4 - Number(currentTotalGoldNum - 1)), 0.3);
                    updateRightScaleGoldImage(tmpGoldNum);
                    tmpGoldNum++;
                    gr.animMap['_crossBarAnim0' + currentTotalGoldNum].play();
                    gr.animMap['_crossBarAnim0' + currentTotalGoldNum]._onComplete = function(){
                    updateLeftRelatedAnims();
                    animationIsPlaying = false;
                    enableReamingSymbols();
                    previousTotalGoldNum += goldNum;
                    if (isRevealAll && !isWinBoxError){
                        startRevealAllFlow();
                    }
					if(checkAllRevealed()){
                        if(recordingCurrentWinValue !== prizeValue){
                            winBoxErrorReaction();
                            return;
                        }
						msgBus.publish('allRevealed');
                    }
                    if(!isWinBoxError){
                        playSymbolRayAnim();
                    }
                };
                }else{
                    animationIsPlaying = false;
                    enableReamingSymbols();
                    previousTotalGoldNum += goldNum;
                    if (isRevealAll && !isWinBoxError){
                        startRevealAllFlow();
                    }
					if(checkAllRevealed()){
                        if(recordingCurrentWinValue !== prizeValue){
                            winBoxErrorReaction();
                            return;
                        }
						msgBus.publish('allRevealed');
					}
                    if(!isWinBoxError){
                        playSymbolRayAnim();
                    }
                }
            };
        }
    }
    
    function checkAllRevealed(){
		return revealedNum === (symbolsNum - 4);
    }

    function updateRightScaleGoldImage(goldNum){
        gr.lib._scaleRight.setImage('scaleRightGoldNumImage0' + goldNum);
    }

    function updateLeftRelatedAnims(){
        updateLeftScaleWinNum();
    }

    function updateLeftScaleWinNum(){
        gr.lib._count.pixiContainer.removeChildren();
        if (goldWinNumArr[goldWinIndex] === "UpArrow"){
        /*    var winNumSp = PIXI.Sprite.fromFrame('UpArrow');
            gr.lib._count.pixiContainer.addChild(winNumSp);
            winNumSp.setTransform((gr.lib._count._currentStyle._width - winNumSp.width) / 2, (gr.lib._count._currentStyle._height - winNumSp.height) / 2);*/
            goldWinIndex++;
        }else{
            updateWinMeterValue(Number(goldWinOriginalArr[goldWinIndex]));
            var winNumContainer = new PIXI.Container();
            winNumContainer.pivot.set(0.5, 0.5);
            var goldWinNumStrArr = String(goldWinNumArr[goldWinIndex]).split("");
            var winNumSP = null;
            var xValue = 0;
            for (var i = 0; i < goldWinNumStrArr.length; i++){
             if (goldWinNumStrArr[i] === '.'){
                 winNumSP = PIXI.Sprite.fromFrame('decimal');
             }else{
                 winNumSP = PIXI.Sprite.fromFrame('winNum' + goldWinNumStrArr[i]); 
             }
             winNumSP.setTransform(xValue);
             xValue += winNumSP.width;
             winNumContainer.addChild(winNumSP);
            }
            if (winNumContainer.width > gr.lib._count.pixiContainer.$sprite._width){
                for(var s = 1; (s > 0.1) && (winNumContainer.width >= gr.lib._count.pixiContainer.$sprite._width); s -= 0.1){
                    winNumContainer.scale.set(s);
                }
                winNumContainer.position.set(((gr.lib._count.pixiContainer.$sprite._width - (winNumContainer.width)) / 2) , (gr.lib._count.pixiContainer.$sprite._height - winNumContainer.height) / 2);
            }else{
                winNumContainer.setTransform(((gr.lib._count._currentStyle._width - (winNumContainer.width)) / 2) , (gr.lib._count._currentStyle._height - winNumContainer.height) / 2);
            }
            gr.lib._count.pixiContainer.addChild(winNumContainer);
            playPrizeAmountAnim();
            goldWinIndex++;
        } 
    }

    function playPrizeAmountAnim(){
        if (gr.lib._prizeAmountAnim){
            gr.lib._prizeAmountAnim.show(true);
            gr.lib._prizeAmountAnim.gotoAndPlay('prizeAmountAnim', 0.2);
            gr.lib._prizeAmountAnim.onComplete = function(){
                gr.lib._prizeAmountAnim.show(false);
                gr.lib._prizeAmountAnim.stopPlay();
            };
        }

        gr.animMap._countAnim.play();
    }

    function updateTargetPosition(){
        targetPositionX = gr.lib._targetPosition._currentStyle._left;
        targetPositionY = gr.lib._targetPosition._currentStyle._top;
    }
	
    function goldBarMovement(){
        toTargetX = targetPositionX - gr.lib._goldFlyContainer.pixiContainer.x;
        toTargetY = targetPositionY - gr.lib._goldFlyContainer.pixiContainer.y;

        var toTargetLength = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
        toTargetX = toTargetX / toTargetLength;
        toTargetY = toTargetY / toTargetLength;
        if (goldFlyInstance.alpha < 1){
            goldFlyInstance.alpha += 0.05;
        }
        gr.lib._goldFlyContainer.pixiContainer.x += toTargetX * 12;
        gr.lib._goldFlyContainer.pixiContainer.y += toTargetY * 12;

        if (SKBeInstant.getGameOrientation() === "landscape"){
            if (gr.lib._goldFlyContainer.pixiContainer.x <= targetPositionX){
                audio.play(config.audio.FlameLand.name, config.audio.FlameLand.channel);
                gr.getTicker().remove(goldBarMovement);
                gr.lib._goldFlyContainer.pixiContainer.removeChild(goldFlyInstance);
                goldFlyInstance.stop();
                playScaleAnims(goldNum);
                goldFlyInstance.alpha = 0;
            }
        }else{
            if (gr.lib._goldFlyContainer.pixiContainer.y <= targetPositionY){
                audio.play(config.audio.FlameLand.name, config.audio.FlameLand.channel);
                gr.getTicker().remove(goldBarMovement);
                gr.lib._goldFlyContainer.pixiContainer.removeChild(goldFlyInstance);
                goldFlyInstance.stop();
                playScaleAnims(goldNum);
                goldFlyInstance.alpha = 0;
            }
        }
        
    }

    function stopGoldBarMovement(){
        gr.getTicker().remove(goldBarMovement);
        audio.stopChannel(config.audio.FlameLand.channel);
        audio.stopChannel(config.audio.FlameThrowLong.channel);
        audio.stopChannel(config.audio.FlameThrowShort.channel);
        if (goldFlyInstance){
            gr.lib._goldFlyContainer.pixiContainer.removeChild(goldFlyInstance);
            goldFlyInstance.stop();
        }
    }

    function createGoldenFlyInstance(){
        
            if (!goldFlyInstance){
                for (var i = 0; i < sp.getSpriteSheetAnimationFrameArray('goldFlyAnim').length; i++){
                    frames.push(PIXI.Texture.fromFrame(sp.getSpriteSheetAnimationFrameArray('goldFlyAnim')[i] + '.png'));
                }
                goldFlyInstance = new PIXI.extras.AnimatedSprite(frames);
                goldFlyInstance.alpha = 0;
                goldFlyInstance.animationSpeed = 0.7;
                
            }
            gr.lib._goldFlyContainer.pixiContainer.addChild(goldFlyInstance);
            goldFlyInstance.play();
            
            if (SKBeInstant.getGameOrientation() === "landscape"){
                gr.lib._goldFlyContainer.pixiContainer.pivot.x = 12;
                gr.lib._goldFlyContainer.pixiContainer.pivot.y = gr.lib._goldFlyContainer.pixiContainer.height / 2;
                originalPositionX = gr.lib['_goldenFly_' + goldBarIndex]._currentStyle._left;
                originalPositionY = gr.lib['_goldenFly_' + goldBarIndex]._currentStyle._top + gr.lib._goldFlyContainer.pixiContainer.height / 2;
            }else{
                originalPositionX = gr.lib['_goldenFly_' + goldBarIndex]._currentStyle._left;
                originalPositionY = gr.lib['_goldenFly_' + goldBarIndex]._currentStyle._top;
            }

    }

    function caculateRotation(){
        toTargetX = targetPositionX - originalPositionX;
        toTargetY = targetPositionY - originalPositionY;
        var toTargetLength = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
        toTargetX = toTargetX / toTargetLength;
        toTargetY = toTargetY / toTargetLength;
        var radian = ((Math.atan2(toTargetY, toTargetX) * 180 / Math.PI) - 180) * Math.PI / 180;
        gr.lib._goldFlyContainer.pixiContainer.setTransform(originalPositionX, originalPositionY, 1, 1, radian, 0, 0, 12, gr.lib._goldFlyContainer.pixiContainer.height / 2);
    }

    
    /**
     * @function checkMatchThree
     * @description 
     */
    function checkMatchThree(recordSymbolsArr, currentWinAmount){
        var winAmountArr = [];
        for (var index = 0; index < recordSymbolsArr.length; index++){
            winAmountArr.push(recordSymbolsArr[index].winAmount);
        }
        var count = winAmountArr.filter(function(value){
            return value === currentWinAmount;
        }).length;
        if (count === 2){
            for (var j = 0; j < recordSymbolsArr.length; j++){
                    if(recordSymbolsArr[j].winAmount === currentWinAmount){
                        playAnticipationAnim(recordSymbolsArr[j].symbolLocation);
                    }
            } 
        }else if (count === matchThree){
                audio.play(config.audio.Match.name, config.audio.Match.channel);
                playMoneyScatterAnim();
                playRichManSmileAnim();
                for (var i = 0; i < recordSymbolsArr.length; i++){
                    if(recordSymbolsArr[i].winAmount === currentWinAmount){
                        playSymbolHighLight(recordSymbolsArr[i].symbolLocation);
                    }
                }   
                updateWinMeterValue(currentWinAmount); 
            }
        
    }

    function updateWinMeterValue(value){
        recordingCurrentWinValue += value;
		if(ifWinBoxError(recordingCurrentWinValue, prizeValue, false)){
            isWinBoxError = true;
            stopAllGladAnimAndClearComplete();
            stopSpriteAnimation();
            setComplete();      
            //resetAll();
            winBoxErrorReaction();
			return;
		}
        gr.lib._winsValue.setText(SKBeInstant.formatCurrency(Number(recordingCurrentWinValue)).formattedAmount);
        gameUtils.fixMeter(gr);
    }

    function playMoneyScatterAnim(){
        if (gr.lib._MoneyIdle){
            gr.lib._MoneyIdle.show(true);
            gr.lib._MoneyIdle.gotoAndPlay('moneyIdleAnim', 0.3);
        }
    }
        
    function generateGoldPrizeArr(currentPrice){
        var prizes = [];
        var prices = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        var goldPrizes = [];
        for (var i = 0; i < prices.length; i++){
            if (prices[i].price === currentPrice){
                prizes = prices[i].prizeTable;
            }
        }

        for (var j = 0; j < prizes.length; j++){
            if(prizes[j].description === 'I1'){
                goldPrizes.push(prizes[j].prize);
            }else if(prizes[j].description === 'I2'){
                goldPrizes.push(prizes[j].prize);
            }else if(prizes[j].description === 'I3'){
                goldPrizes.push(prizes[j].prize);
            }
        }
        return goldPrizes;
    }

    function updateDashBoardWinValue(goldPrizeArr){
        var scaleValue = 1;
        for (var k = 0; k < goldPrizeArr.length; k++){
            gr.lib['_dashBarValue' + k].pixiContainer.$text.transform.scale.set(scaleValue);
        }

        for (var i = 0; i < goldPrizeArr.length; i++){
            gr.lib['_dashBarValue' + i].autoFontFitText = true;
            gr.lib['_dashBarValue' + i].setText(SKBeInstant.formatCurrency(goldPrizeArr[i]).formattedAmount);
            if (gr.lib['_dashBarValue' + i].pixiContainer.$text.transform.scale._x < scaleValue){
                scaleValue = gr.lib['_dashBarValue' + i].pixiContainer.$text.transform.scale._x;
            }
        }

        for (var j = 0; j < goldPrizeArr.length; j++){
            gr.lib['_dashBarValue' + j].pixiContainer.$text.transform.scale.set(scaleValue);
        }
    }

    function onStartUserInteraction(data) {
        enableHandOver4Symbols();
        gameCanPlay = true;
        if (SKBeInstant.getGameOrientation() === "landscape"){
            nearSymbolLists = ['0', '1', '4', '5', '8', '9'];
        }else{
            nearSymbolLists = ['0', '1', '2', '3'];
        }

        if (data.scenario) {
            outcome = data.scenario.split(',');
            playResult = data.playResult;
			prizeValue = data.prizeValue;
        } else {
            return;
        }

        for (var i = 0; i < data.prizeTable.length; i++) {
            prizeTable[data.prizeTable[i].description] = Number(data.prizeTable[i].prize);
        }

        
        for (var i = 0; i < outcome.length; i++) {
            prizeObj = {};
            prizeAmount = outcome[i].charAt(0);
            goldBarNum = Number(outcome[i].substr(1));
            prizeObj.win = prizeTable[prizeAmount];
            prizeObj.prizeStr = SKBeInstant.formatCurrency(prizeTable[prizeAmount]).formattedAmount;
            prizeObj.goldBarNum = goldBarNum;
            prizeObj.level = prizeAmount;
            prizeDetailArray.push(prizeObj);
        }

        for (var j = 3; j >=1; j--){
            goldWinOriginalArr.push(Number(prizeTable["I" + j]));
            goldAmountValue += Number(prizeTable["I" + j]) * Number(SKBeInstant.getDenomamount());
            goldWinNumArr.push(goldAmountValue);
        }

        for (var i = 0; i < symbolsNum; i++) {
            gr.lib['_Symbol_' + i].on('click', gr.lib['_Symbol_' + i].revealFun);
        }

        playSymbolRayAnim();
    }

    function stopSpriteAnimation(){
        for(var key in playAnimationName){
            playAnimationName[key].onComplete = null;
            playAnimationName[key].stopPlay();        
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        stopAllGladAnimAndClearComplete();
        stopSpriteAnimation();
        setComplete();        
        resetAll();
        for (var i = 0; i < symbolsNum; i++) {
            gr.lib['_Symbol_' + i].gameIndex = i;
            gr.lib['_Symbol' + i].gameIndex = i;
            setSymbolRevealFun(gr.lib['_Symbol_' + i]);
            gr.lib['_moneyText'+i].autoFontFitText = true;
            remainingSymbols.push(i);
        }
    }

    function setSymbolRevealFun(symbol) {
        symbol.revealFun = function () {
            if (!gameCanPlay){
                return;
            }
            animationIsPlaying = true;
            stopPlaySymbolRayAnim();
            resetAllFlag = false;
            
            gr.lib['_moneyItem' + clickedNum].setImage('moneyItemGray');
            gr.animMap['_moneyItem' + clickedNum + 'Anim'].play();
            clickedNum++;
            
            if(revealAll){
                autoSymbolChannel++;
            }else{
                symbolChannel++;
            }
            symbol.off('click');

            var index = symbol.gameIndex;
            removeClickedSymbols(index);

            gr.lib['_Symbol' + index].pixiContainer.$sprite.cursor = 'default';

            for (var i = 0; i < remainingSymbols.length; i++){
                gr.lib['_Symbol_' + remainingSymbols[i]].off('click');
            }

            if(clickedNum === (symbolsNum - 4)){
                gr.lib._buttonInfo.show(false);
                stopPlaySymbolRayAnim();
                msgBus.publish('disableButton');
                DimAndOffReamingSymbols(remainingSymbols);
            }

            playSymbolAnimsByPrizeLevel(prizeDetailArray[sequence].level, index);
            playAnimationName['_Symbol' + index] = gr.lib['_Symbol' + index ];
            symbol.reveal = true;
        };
    }
    
    function startRevealAllFlow(){
        if (SKBeInstant.config.customBehaviorParams){
        }
        interval = 1000;
        disableSymbolInteraction();
        disableHandOver4Symbols();
        gr.getTimer().setTimeout(function(){
            if(remainingSymbols.length > 4){
                gr.lib['_Symbol_' + remainingSymbols[Math.floor(Math.random()*remainingSymbols.length)]].revealFun();
            }
        } ,interval);
    }

    function disableSymbolInteraction(){
        for (var i = 0; i < symbolsNum; i++){
            gr.lib['_Symbol_' + i].off('click');
        }
    }

    function enableReamingSymbols(){
        for (var i = 0; i < remainingSymbols.length; i++){
            gr.lib['_Symbol_' + remainingSymbols[i]].on('click', gr.lib['_Symbol_' + remainingSymbols[i]].revealFun);
        }
        if(clickedNum === (symbolsNum - 4)){
            msgBus.publish('disableButton');
            DimAndOffReamingSymbols(remainingSymbols);
        }
    }

    // Need Optimization
    function playSymbolAnimsByPrizeLevel(levelStr, symbolIndex){
        if (highLevelPrizes.indexOf(levelStr) > -1){
            gr.lib['_Symbol' + symbolIndex ].gotoAndPlay('symbolLargeAnim', 0.4);
            audio.play(config.audio.CounterHi.name, config.audio.CounterHi.channel);
        }else if(middleLevelPrizes.indexOf(levelStr) > -1){
            gr.lib['_Symbol' + symbolIndex ].gotoAndPlay('symbolMiddleAnim', 0.4);
            audio.play(config.audio.CounterMed.name, config.audio.CounterMed.channel);
        }else if (lowLevePrizes.indexOf(levelStr) > -1){
            gr.lib['_Symbol' + symbolIndex ].gotoAndPlay('symbolLowAnim', 0.4);
            audio.play(config.audio.CounterLow.name, config.audio.CounterLow.channel);
        }
    }

    function removeClickedSymbols(symbolIndex){
        for (var i = 0; i < remainingSymbols.length; i++){
            if (remainingSymbols[i] === symbolIndex){
                remainingSymbols.splice(i, 1);
            }
        }
    }

    function DimAndOffReamingSymbols(arr){
        for (var i = 0; i < arr.length; i++){
            gr.lib['_symbol_dim' + remainingSymbols[i]].show(true);
            gr.lib['_Symbol_' + remainingSymbols[i]].off('click');
            gr.lib['_Symbol' + remainingSymbols[i]].pixiContainer.$sprite.cursor = 'default';
        }
    }

    function cloneSymbolHighLight(){
        for (var i = 1; i < symbolsNum; i++) {
            gr.animMap._symbolLightAnim0.clone(['_symbolLight' + i], '_symbolLightAnim' + i);
        }
    }

    function cloneMoneyItemAnim(){
        for (var i = 0; i < 8; i++){
            gr.animMap._moneyItem0Anim.clone(['_moneyItem' + i], '_moneyItem' + i + 'Anim');
        }
    }

    function playRichManIdleAnim(){
        gr.lib._BGpanel.gotoAndPlay('richMan', 0.2, Infinity);
    }

    function playRichManSmileAnim(){
        gr.lib._BGpanel.stopPlay();
        gr.lib._BGpanel.gotoAndPlay('richManSmile', 0.2);
        gr.lib._BGpanel.onComplete = function(){
            gr.lib._BGpanel.stopPlay();
            playRichManIdleAnim();
        };
    }

    function playSymbolHighLight(symbolIndex){
        if (gr.animMap['_symbolLightAnim' + symbolIndex].isPlaying){
            gr.animMap['_symbolLightAnim' + symbolIndex].stop();
        }
        gr.animMap['_symbolLightAnim' + symbolIndex].stop();
        gr.lib['_symbol_dim' + symbolIndex].show(false);
        gr.lib['_symbolLight' + symbolIndex].show(true);
        gr.animMap['_symbolLightAnim' + symbolIndex].play(Infinity);
        gameUtils.setTextStyle(gr.lib['_moneyText' + symbolIndex], {stroke:"#ffffff", strokeThickness:0, fill:"#ff6600"});
    }

    function playAnticipationAnim(symbolIndex){
        gr.lib['_symbol_dim' + symbolIndex].show(false);
        gr.lib['_symbolLight' + symbolIndex].show(true);
        gr.animMap['_symbolLightAnim' + symbolIndex].play();
        gr.animMap['_symbolLightAnim' + symbolIndex]._onComplete = function(){
            gr.lib['_symbol_dim' + symbolIndex].show(true);
            gr.lib['_symbolLight' + symbolIndex].show(false);
        };
    }

    function onGameParametersUpdated() {
        initTutorialData();
        cloneSymbolHighLight();
        cloneMoneyItemAnim();
        playRichManIdleAnim();
        setComplete();
        resetAll();
        for (var i = 0; i < symbolsNum; i++) {
            gr.lib['_Symbol_' + i].gameIndex = i;
            gr.lib['_Symbol' + i].gameIndex = i;
            setSymbolRevealFun(gr.lib['_Symbol_' + i]);
            gr.lib['_moneyText'+i].autoFontFitText = true;
            remainingSymbols.push(i);
        }                
    }

    function initTutorialData(){
        if (gr.lib._tutorial00MoneyText01){
            gr.lib._tutorial00MoneyText01.setText('200');
        }

        if (gr.lib._tutorial01MoneyText01){
            gr.lib._tutorial01MoneyText01.setText('200');
        }
        if (gr.lib._tutorial01MoneyText02){
            gr.lib._tutorial01MoneyText02.setText('200');
        }
        if (gr.lib._tutorial01MoneyText03){
            gr.lib._tutorial01MoneyText03.setText('200');
        }

        if (gr.lib._tutorialDashBarValue0){
            gr.lib._tutorialDashBarValue0.setText('1000');
        }
        if (gr.lib._tutorialDashBarValue1){
            gr.lib._tutorialDashBarValue1.setText('100');
        }
        if (gr.lib._tutorialDashBarValue2){
            gr.lib._tutorialDashBarValue2.setText('10');
        }
        if (gr.lib._tutorial02MoneyText01){
            gr.lib._tutorial02MoneyText01.setText('10');
        }
    }

    function stopAllGladAnim() {
        for (var p in gr.animMap) {
            gr.animMap[p].stop();
        }
    }

    function stopAllGladAnimAndClearComplete() {
        for (var p in gr.animMap) {
            gr.animMap[p]._onComplete = null;
            gr.animMap[p].stop();
        }
    }
    
    function onPlayerWantsPlayAgain() {
        stopAllGladAnim();
        setComplete();
        resetAll();
        for (var i = 0; i < symbolsNum; i++) {
            gr.lib['_Symbol_' + i].gameIndex = i;
            gr.lib['_Symbol' + i].gameIndex = i;
            setSymbolRevealFun(gr.lib['_Symbol_' + i]);
            gr.lib['_moneyText'+i].autoFontFitText = true;
            remainingSymbols.push(i);
        }  
    }
    
    function onStartReveallAll(){
        isRevealAll = true;
        stopPlaySymbolRayAnim();
        if (!animationIsPlaying){
            startRevealAllFlow();
        }
    }
    
    function onTutorialIsShown(){
        tutorialIsShown = true;
    }
    
    function onTutorialIsHide(){
        tutorialIsShown = false;
    }

    function onTicketCostChanged(data){
        updateDashBoardWinValue(generateGoldPrizeArr(data));
    }

    function onInitialize(){}

    function onEnterResultScreenState(){
        playCofferAnim();
    }

    function playCofferAnim(){
        var animName = (playResult === 'WIN')?'winPlaqueAnim':'noWinPlaqueAnim';
        gr.lib['_'+animName].gotoAndPlay(animName, 0.2);
    }

    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('startReveallAll', onStartReveallAll);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);

    return {};
});
define([
    'skbJet/component/gladPixiRenderer/Sprite',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController'
], function (Sprite, msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    
    var plusButton, minusButton;
    var _currentPrizePoint, prizePointList;
    var ticketIcon, ticketIconObj = null;
    var boughtTicket = false;
    var MTMReinitial = false;
    
    function registerControl() {
        var formattedPrizeList = [];
        var strPrizeList = [];
        for (var i = 0; i < prizePointList.length; i++) {
            formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
            strPrizeList.push(prizePointList[i] + '');
        }
        var priceText, stakeText;
        if(SKBeInstant.isWLA()){
            priceText = loader.i18n.MenuCommand.WLA.price;
            stakeText = loader.i18n.MenuCommand.WLA.stake;
        }else{
            priceText = loader.i18n.MenuCommand.Commercial.price;
            stakeText = loader.i18n.MenuCommand.Commercial.stake;            
        }
        
        msgBus.publish("jLotteryGame.registerControl", [{
                name: 'price',
                text: priceText,
                type: 'list',
                enabled: 1,
                valueText: formattedPrizeList,
                values: strPrizeList,
                value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
            }]);
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'stake',
            text: stakeText,
            type: 'stake',
            enabled: 0,
            valueText: '0',
            value: 0
        }]);
    }
    
    function gameControlChanged(value) {
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'stake',
            event: 'change',
            params: [SKBeInstant.formatCurrency(value).amount/100, SKBeInstant.formatCurrency(value).formattedAmount]
        });
        
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'price',
            event: 'change',
            params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
        });
    }
    
    function onConsoleControlChanged(data){
        if (data.option === 'price') {
            setTicketCostValue(Number(data.value));
            
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: 'stake',
                event: 'change',
                params: [SKBeInstant.formatCurrency(data.value).amount/100, SKBeInstant.formatCurrency(data.value).formattedAmount]
            });
        }
    }

    function onGameParametersUpdated() {
        if(config.style.ticketCostText){
            gameUtils.setTextStyle(gr.lib._ticketCostText,config.style.ticketCostText);
        }
        if (config.textAutoFit.ticketCostText){
            gr.lib._ticketCostText.autoFontFitText = config.textAutoFit.ticketCostText.isAutoFit;
        }
        gr.lib._ticketCostText.setText(loader.i18n.Game.wager);
        if (config.style.ticketCostValue) {
            gameUtils.setTextStyle(gr.lib._ticketCostValue, config.style.ticketCostValue);
        }
        if (config.textAutoFit.ticketCostValue){
            gr.lib._ticketCostValue.autoFontFitText = config.textAutoFit.ticketCostValue.isAutoFit;
        }
        
        prizePointList = [];
        ticketIcon = {};

        var style = {
            "_id": "_dfgbka",
            "_name": "_ticketCostLevelIcon_",
            "_SPRITES": [],
            "_style": {
                "_width": "30",
                "_height": "6",
                "_left": "196",
                "_background": {
                    "_imagePlate": "_ticketCostLevelIconOff"
                },
                "_top": "86",
                "_transform": {
                    "_scale": {
                        "_x": "1",
                        "_y": "1.5"
                    }
                }
            }
        };
		
        if (config.style.ticketCostLevelIcon) {
            for (var key in config.style.ticketCostLevelIcon) {
                if (style._style[key]) {
                    style._style[key] = config.style.ticketCostLevelIcon[key];
                }
            }
        }
		
        var length = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length;
        var width = Number(style._style._width) * Number(style._style._transform._scale._x);
        var space = 4;
        var left = (gr.lib._ticketCost._currentStyle._width - (length * width + (length - 1) * space)) / 2;
        for (var i = 0; i < length; i++) {
            var spData = JSON.parse(JSON.stringify(style));
            spData._id = style._id + i;
            spData._name = spData._name + i;
            spData._style._left = left + (width + space) * i;
            var sprite = new Sprite(spData);
            gr.lib._ticketCost.pixiContainer.addChild(sprite.pixiContainer);

            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizePointList.push(price);
            ticketIcon[price] = "_ticketCostLevelIcon_" + i;
		}
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};       
		var arrowPlusType = {'scaleXWhenClick': -0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        if(config.gameParam.arrowPlusSpecial){
            arrowPlusType = scaleType;
        }
        plusButton = new gladButton(gr.lib._ticketCostPlus, config.gladButtonImgName.ticketCostPlus, arrowPlusType);       
        minusButton = new gladButton(gr.lib._ticketCostMinus, config.gladButtonImgName.ticketCostMinus, scaleType);        
        registerControl();
        if(prizePointList.length <= 1){
        	for (var key in ticketIcon){
                gr.lib[ticketIcon[key]].show(false);
            }
            plusButton.show(false);
            minusButton.show(false);
        }else{
            plusButton.show(true);
            minusButton.show(true);

            plusButton.click(increaseTicketCost);
            minusButton.click(decreaseTicketCost);
        }
		if(SKBeInstant.config.gameType !== 'ticketReady'){
			setDefaultPricePoint();
		}
        gameUtils.fixMeter(gr);
    }

    function setTicketCostValue(prizePoint) {
        var index = prizePointList.indexOf(prizePoint);
        if (index < 0) {
            msgBus.publish('error', 'Invalide prize point ' + prizePoint);
            return;
        }
        
        plusButton.enable(true);
        minusButton.enable(true);        
        
        if (index === 0) {
            minusButton.enable(false);
        } 
        
        if (index === (prizePointList.length - 1)) {
            plusButton.enable(false);
        } 
        
        var valueString = SKBeInstant.formatCurrency(prizePoint).formattedAmount;

        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._ticketCostValue.setText(valueString);
        }else{
            gr.lib._ticketCostValue.setText(loader.i18n.Game.demo +  valueString);
        }         
      
        if (ticketIconObj) {
            ticketIconObj.setImage('ticketCostLevelIconOff');
        }
        ticketIconObj = gr.lib[ticketIcon[prizePoint]];
        ticketIconObj.setImage('ticketCostLevelIconOn');
        
        _currentPrizePoint = prizePoint;
        msgBus.publish('ticketCostChanged', prizePoint);
    }
    
    function setTicketCostValueWithNotify(prizePoint){
        setTicketCostValue(prizePoint);
        gameControlChanged(prizePoint);
    }

    function increaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index++;
        setTicketCostValueWithNotify(prizePointList[index]);
        if(index === prizePointList.length-1){
            if(config.audio && config.audio.ButtonBetMax){
                audio.play(config.audio.ButtonBetMax.name, config.audio.ButtonBetMax.channel);
            }
        }else{
            if (config.audio && config.audio.ButtonBetUp) {
                audio.play(config.audio.ButtonBetUp.name, config.audio.ButtonBetUp.channel);
            }
        }       
    }

    function decreaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index--;
        setTicketCostValueWithNotify(prizePointList[index]);
        if (config.audio && config.audio.ButtonBetDown) {
            audio.play(config.audio.ButtonBetDown.name, config.audio.ButtonBetDown.channel);
        }
    }

    function setDefaultPricePoint() {
        setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
    }

    function onInitialize() {
        gr.lib._ticketCost.show(false);
    }

    function onReInitialize() {
        if(MTMReinitial){
            enableConsole();
            setTicketCostValueWithNotify(_currentPrizePoint);
            boughtTicket = false;
            gr.lib._ticketCost.show(false);
            MTMReinitial = false;
        }else{
            onReset();
        }

    }
    
    function onReset(){
        enableConsole();
        if(_currentPrizePoint){
            setTicketCostValueWithNotify(_currentPrizePoint);
        }else{
            setDefaultPricePoint();
        }
        boughtTicket = false;
        gr.lib._ticketCost.show(true);
    }

    function onStartUserInteraction(data) {
        disableConsole();
        boughtTicket = true;
        gr.lib._ticketCost.show(false);
        if (data.price) {
            _currentPrizePoint = data.price;
            setTicketCostValueWithNotify(_currentPrizePoint);
        } 
        msgBus.publish('ticketCostChanged', _currentPrizePoint);
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[1]}
        });
    } 
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[0]}
        });
    }

    function onPlayerWantsPlayAgain(){
        boughtTicket = false;
        enableConsole();
        setTicketCostValueWithNotify(_currentPrizePoint);        
        gr.lib._ticketCost.show(true);
    }
    
    function onTutorialIsShown(){
        if(!boughtTicket){
            gr.lib._ticketCost.show(false);
        }
    }
    function onTutorialIsHide(){
        if(!boughtTicket){
            gr.lib._ticketCost.show(true);
        }
    }
    function onDisableUI(){
        plusButton.enable(false);
        minusButton.enable(false);
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }

    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    
    return {};
});
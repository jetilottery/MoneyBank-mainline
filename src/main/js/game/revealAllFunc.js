/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant'
], function (msgBus, SKBeInstant) {

    var interval;
    
    function revealAll() {
        msgBus.publish('startReveallAll');
        msgBus.publish('disableUI');
    }

    function onGameParametersUpdated() {
        if(SKBeInstant.config.customBehavior){
           interval = SKBeInstant.config.customBehavior.symbolRevealInterval || 500;
        }else{
            interval = 500;
        }       
    }
        
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {
        revealAll:revealAll
    };
});
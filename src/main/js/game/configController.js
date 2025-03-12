/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define([],
    function (){
    var style = {};
    var predefinedStyle = null;
    var winMaxValuePortrait = true;
    var winUpToTextFieldSpace = 10;
    var textAutoFit = {
        "autoPlayText":{
            "isAutoFit": true
        },
        "autoPlayMTMText":{
            "isAutoFit": true
        },
        "buyText":{
            "isAutoFit": true
        },
        "tryText":{
            "isAutoFit": true
        },
        "warningExitText":{
            "isAutoFit": true
        },
        "warningContinueText":{
            "isAutoFit": true
        },
       
        "errorExitText":{
            "isAutoFit": true
        },
        "errorTitle":{
            "isAutoFit": true
        },
        "errorText":{
            "isAutoFit": false
        },
        "warningText":{
            "isAutoFit": true
        },
        "exitText":{
            "isAutoFit": true
        },
        "playAgainText":{
            "isAutoFit": true
        },
        "playAgainMTMText":{
            "isAutoFit": true
        },
        "MTMText":{
            "isAutoFit": true
        }, 
        "win_Text":{
            "isAutoFit": true
        },
        "win_Try_Text":{
            "isAutoFit": true
        }, 
        "win_Value":{
            "isAutoFit": true
        },
        "closeWinText":{
            "isAutoFit": true
        }, 
        "nonWin_Text":{
            "isAutoFit": true
        },
        "closeNonWinText":{
            "isAutoFit": true
        }, 
        "win_Value_color":{
            "isAutoFit": true
        },
        "ticketCostText":{
            "isAutoFit": true
        },
        "ticketCostValue":{
            "isAutoFit": true
        }, 
        "tutorialTitleText":{
            "isAutoFit": true
        }, 
        "closeTutorialText":{
            "isAutoFit": true
        },
        "winUpToText":{
            "isAutoFit": true
        },
        "winUpToValue":{
            "isAutoFit": true
        }, 
        "MTMText":{
            "isAutoFit": true
        },
        "versionText":{
            "isAutoFit": true
        },
        "winBoxErrorText": {
            "isAutoFit": true
        },
        "winBoxErrorExitText": {
            "isAutoFit": true
        }
    };
    var audio = {
        "gameInit":{
            "name":"GameInit",
            "channel":"0"
        },
        "gameLoop":{
            "name":"BaseMusicLoop",
            "channel":"0"
        },
        "gameWin":{
            "name":"BaseMusicLoopTermWin",
            "channel":"0"
        },
        "gameNoWin":{
            "name":"BaseMusicLoopTerm",
            "channel":"0"
        },
        "ButtonGeneric":{
            "name":"ButtonGeneric",
            "channel":"2"
        },
        "PaytableOpen":{
            "name":"HelpPageOpen",
            "channel":"2"
        },
        "PaytableClose":{
            "name":"HelpPageClose",
            "channel":"2"
        },
        "ButtonBetMax":{
            "name":"ButtonBetMax",
            "channel":"6"
        },
        "ButtonBetUp":{
            "name":"ButtonBetUp",
            "channel":"2"
        },
        "ButtonBetDown":{
            "name":"ButtonBetDown",
            "channel":"6"
        },
        "CounterHi":{
            "name":"CounterHi",
            "channel":"3"
        },
        "CounterLow":{
            "name":"CounterLow",
            "channel":"3"
        },
        "CounterMed":{
            "name":"CounterMed",
            "channel":"3"
        },
        "FlameThrowLong":{
            "name":"FlameThrowLong",
            "channel":"4"
        },
        "FlameThrowShort":{
            "name":"FlameThrowShort",
            "channel":"6"
        },
        "RevealDouble":{
            "name":"RevealDouble",
            "channel":"1"
        },
        "RevealSingle":{
            "name":"RevealSingle",
            "channel":"7"
        },
        "FlameLand":{
            "name":"FlameLand",
            "channel":"5"
        },
        "Match":{
            "name":"Match",
            "channel":"2"
        }
    };

    var gladButtonImgName = {
        //audioController
        "buttonAudioOn":"buttonAudioOn",
        "buttonAudioOff":"buttonAudioOff",        
        //buyAndTryController
        "buttonTry":"buttonCommon",
        "buttonBuy":"buttonCommon",
        //errorWarningController
        "warningContinueButton":"buttonCommon",
        "warningExitButton":"buttonCommon",
        "errorExitButton":"buttonCommon",
        //exitAndHomeController
        "buttonExit":"buttonCommon",
        "buttonHome":"buttonHome",
        //playAgainController
        "buttonPlayAgain":"buttonCommon",
        "buttonPlayAgainMTM":"buttonCommon",
        //playWithMoneyController
        "buttonMTM":"buttonCommon",
        //resultController
        "buttonWinClose":"buttonClose",
        "buttonNonWinClose":"buttonClose",
        //ticketCostController
        "ticketCostPlus":"ticketCostPlus",
        "ticketCostMinus":"ticketCostMinus",
        //tutorialController
        "iconOff":"tutorialPageIconOff",
        "iconOn":"tutorialPageIconOn",
        //revealAllController
        "buttonAutoPlay":"buttonCommon",
        "buttonAutoPlayMTM":"buttonCommon",

    };
    var gameParam = {
        //tutorialController
        "pageNum":3
    };

    var predefinedStyle =  {
		landscape:{
			loadDiv:{
				width:960,
				height:600,
				position:'absolute',
				top: '50%',
				left: '50%',
				overflow: 'hidden'
			},
			progressBarDiv:{
				left: 280,
				bottom: 50,
				width: 416,
				height: 14,
				padding:0,
				position:'absolute',
				backgroundSize: 'cover',
				backgroundRepeat:'no-repeat'
			},
			progressDiv:{
				height: '100%',
				width:"0%",
				left:"0%",
				position:'absolute',
				backgroundSize:'cover',
				backgroundRepeat:'no-repeat'
			},
			loadingBarButton:{
				top: -4,
				left: 0,
				width:20,
				height:20,
				padding:0,
				position:'absolute',
				backgroundSize:'cover',
				backgroundRepeat:'no-repeat'
			},
			gameLogoDiv:{
				top: 0,
				left: 185,
				width: 584,
				height: 654,
				position: 'absolute',
				backgroundSize: 'cover'
			}
		},
		portrait:{
			loadDiv:{
				width:600,
				height:960,
				position:'absolute',
				left: "50%",
				top: "50%",
				overflow: 'hidden'
			},
			progressBarDiv:{
				top: 750,
				left: 93,
				width: 416,
				height: 14,
				padding: 0,
				position:'absolute'
			},
			progressDiv:{
				top: 0,
				left: 0,
				height:14,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			loadingBarButton:{
				top: -4,
				left: "0%",
				width:20,
				height:20,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			gameLogoDiv:{
				top: 0,
				left: 8,
				width: 584,
				height: 654,
				position: 'absolute',
				backgroundSize: 'cover'
			}
		}
	};
   
    return {
        winMaxValuePortrait: winMaxValuePortrait,
        winUpToTextFieldSpace: winUpToTextFieldSpace,
        textAutoFit: textAutoFit,
        audio: audio,
        gladButtonImgName: gladButtonImgName,
        gameParam: gameParam,
        style: style,
        predefinedStyle: predefinedStyle
    };
});

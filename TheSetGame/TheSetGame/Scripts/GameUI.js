$(function () {    
    setupUIElements();

    if (mobile === true) {
        $('#title').hide();
    }
    
    $('#playerDialog').dialog('open');    
});

var playerManager = {
    playerOne: null,
    playerTwo: null,
    numberOfPlayers: 0,
    playerOneScore: 0,
    playerTwoScore: 0,
    selectedPlayer: 1,

    updatePlayerDisplay: function () {
        $('#playerOneScore').text(playerManager.playerOne + "--Score: " + playerManager.playerOneScore);
        $('#playerTwoScore').text(playerManager.playerTwo + "--Score: " + playerManager.playerTwoScore);
    },

    addScoreToSelectedPlayer: function () {
        if (playerManager.selectedPlayer === 1)
            playerManager.playerOneScore += 1;
        else
            playerManager.playerTwoScore += 1;

        playerManager.updatePlayerDisplay();
    },

    resetPlayerDisplay: function () {
        playerManager.playerOneScore = 0;
        playerManager.playerTwoScore = 0;
        playerManager.updatePlayerDisplay();
    },

    getWinner: function(){
        if (playerManager.playerOneScore > playerManager.playerTwoScore)
            return playerManager.playerOne;
        else
            return playerManager.playerTwo;
    },

    isItATie: function () {
        if (playerManager.playerOneScore === playerManager.playerTwoScore)
            return true;
        else
            return false;
    }
};


var boardManager = {
    selectedSets: 0,
    selectedCardCount: 0,
    selectedCardsIndex: [],
    gameStartTime: null,
    timerHandle: null,
    hintSelectCount: 0,

    startNewGame: function () {
        var result = false;
        do {
            result = boardManager.initGame();
        } while (result === false);
    },
    
    initGame: function () {
        boardManager.selectedCardCount = 0;
        boardManager.selectedSets = 0;
        boardManager.gameStartTime = new Date();
        playerManager.resetPlayerDisplay();

        gameBoard.init(); //initializes deck and initially fills board        
        var result = gameBoard.prepareBoardForDisplay(); //checks for set in the board
        
        if (result === gameState.notSetAvailable) {
            boardManager.resetBoardTable();
            return false;
        }
        else {
            boardManager.displayBoard();
            boardManager.startTimer();
            return true;
        }
    },

    displayBoard: function () {
        $('#selectedSets').text(boardManager.selectedSets.toString());
        $('#cardsInDeck').text(gameEngine.deck.length.toString());
        $('#setsAvailable').text(gameBoard.numberOfSets.toString());
        boardManager.resetBoardTable();

        var cardIndex = -1;
        $('#boardTable td').each(function () {
            //var cardIndex = $(this).attr('cardIndex');     
            cardIndex += 1;
            var card = gameBoard.board[cardIndex];                       
            if (card !== null) {             
                //need to change this line with the picture                
                var img = "<img src='" + imgPath + card.id + ".jpg' />";
                $(this).html(img);
                $(this).attr('isEmpty', '0');
            }            
        });

        setTimeout(boardManager.loadNextImages, 500);
    },

    loadNextImages: function () {
        $el = $('#picEagerLoading');
        $el.html('');

        if (gameEngine.deck.length > 2) {
            var index = gameEngine.deck.length - 1;
            
            for (var i = 0; i < 3; i++, index--) {
                var img = "<img src='" + imgPath + gameEngine.deck[index].id + ".jpg' />";
                $el.append(img);                
            }
        }


    },

    processSelectedCards: function () {
        boardManager.loadSelectedCardsIndex();        

        var c1 = gameBoard.board[boardManager.selectedCardsIndex[0]];
        var c2 = gameBoard.board[boardManager.selectedCardsIndex[1]];
        var c3 = gameBoard.board[boardManager.selectedCardsIndex[2]];
        var result = gameEngine.checkSet(c1, c2, c3);

        if (result === false) {
            boardManager.selectedCardCount = 2;
            $('.last-card-selected').removeClass('selected-border')
                .removeClass('last-card-selected')
                .addClass('normal-border');

            var msg = gameEngine.getMessage();
            $('#invalidSetDialog').html(msg);
            $('#invalidSetDialog').dialog('open');
            return;
        }        
        
        //remove the cards from the board
        gameBoard.board[boardManager.selectedCardsIndex[0]] = null;
        gameBoard.board[boardManager.selectedCardsIndex[1]] = null;
        gameBoard.board[boardManager.selectedCardsIndex[2]] = null;

        //load new cards on board and check game state
        var result = gameBoard.prepareBoardForDisplay();

        boardManager.selectedSets += 1;
        boardManager.selectedCardCount = 0;
        boardManager.hintSelectCount = 0;
        playerManager.addScoreToSelectedPlayer();
        boardManager.displayBoard(); //update the board with what we have

        if (result === gameState.ok) return true;
        else if (result === gameState.win) {
            clearInterval(boardManager.timerHandle);
            var winnerMsg;

            if (playerManager.numberOfPlayers > 1) {
                if (playerManager.isItATie() === true) {
                    winnerMsg = "Game is a tie!!!<br /> Do you want to play again?"
                }
                else {
                    var winner = playerManager.getWinner();
                    winnerMsg = "Congratulations " + winner + " you won!!!<br /> Do you want to play again?"
                }
            }
            else {
                winnerMsg = "Congratulations you won!!!<br /> Do you want to play again?"
            }

            $('#winGameDialog').empty().html(winnerMsg);
            $('#winGameDialog').dialog('open');            
        }
        else $('#noSetsAvailableDialog').dialog('open');

        return false;       
    },
   
    loadSelectedCardsIndex: function () {
        boardManager.selectedCardsIndex = [];
        $('.selected-border').each(function () {
            var cardIndex = $(this).attr('cardIndex');
            boardManager.selectedCardsIndex.push(cardIndex);
        });

        if (boardManager.selectedCardsIndex.length < 3) {
            alert('hi');
        }
    },

    resetBoardTable: function () {
        $('#boardTable td').each(function () {
            $(this).empty();
            $(this).attr('isEmpty', '1');           
            $(this).removeClass('selected-border')
                    .removeClass('last-card-selected')
                    .addClass('normal-border');            
        });
    },

    startTimer: function () {
        boardManager.timerHandle = setInterval(function () {
            var currTime = new Date();
            var timeDiff = currTime - boardManager.gameStartTime;
            // strip the miliseconds
            var timeDiff = timeDiff / 1000;            
            var seconds = Math.floor(timeDiff % 60);            
            timeDiff /= 60;            
            var minutes = Math.floor(timeDiff % 60);

            $('#playTime').text(minutes + " m : " + seconds + " s");
        }, 1000);
    }
};


function setupUIElements() {
    $('#cancelGameButton').button();
    $('#hintButton').button();
    $('#cancelGameDialog').dialog({
        autoOpen: false,
        hide: "explode",
        show: "fade",
        minWidth: 200,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {
            Yes: function () {
                var href = $('#cancelGameButton').attr('refUrl');
                document.location = href;
            },
            No: function () {
                $(this).dialog('close');
            }
        }
    }).parent().find('.ui-dialog-titlebar ').remove();

    $('#winGameDialog').dialog({
        autoOpen: false,
        hide: "fade",
        show: "fade",
        minWidth: 200,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {
            Yes: function () {                
                boardManager.startNewGame();
                $(this).dialog('close');
            },
            No: function () {
                var href = $('#cancelGameButton').attr('refUrl');
                document.location = href;
            }
        }
    }).parent().find('.ui-dialog-titlebar ').remove();
    
    $('#noSetsAvailableDialog').dialog({
        autoOpen: false,
        hide: "fade",
        show: "fade",
        minWidth: 200,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {
            Yes: function () {
                boardManager.startNewGame();
                $(this).dialog('close');
            },
            No: function () {
                var href = $('#cancelGameButton').attr('refUrl');
                document.location = href;
            }
        }
    }).parent().find('.ui-dialog-titlebar ').remove();
        
    $('#invalidSetDialog').dialog({
        autoOpen: false,
        hide: "fade",
        show: "fade",
        minWidth: 200,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {
            OK: function () {                
                $(this).dialog('close');                
            }            
        }
    }).parent().find('.ui-dialog-titlebar ').remove();

    $('#hintDialog').dialog({
        autoOpen: false,        
        minWidth: 430,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {            
            OK: function () {
                $(this).dialog('close');
            }
        }
    }).parent().find('.ui-dialog-titlebar ').remove();

    $('#playerDialog').dialog({
        minWidth:380,
        autoOpen: false,        
        modal: true,
        draggable: false,
        resizable: false        
    }).parent().find('.ui-dialog-titlebar ').remove();
    $('#onePlayerButton').button();
    $('#twoPlayerButton').button();
    $('#playerSubmit').button();
    $('#cancelPlayer').button();

    //SETUP THE EVENT HANDLERS
    $('#cancelGameButton').click(function () {
        $('#cancelGameDialog').dialog('open');
    });

    $('#boardTable').on('click', 'td', function () {        
        var el = $(this);
        var isEmpty = el.attr('isEmpty');
        if (isEmpty === '1') return;

        var isSelected = el.hasClass('selected-border');        
        if (isSelected === true) {
            el.removeClass('selected-border').addClass('normal-border');
            boardManager.selectedCardCount -= 1;
        }
        else {
            if (boardManager.selectedCardCount > 2) {
                return;
            }

            $(this).removeClass('normal-border').addClass('selected-border');
            boardManager.selectedCardCount += 1;

            if (boardManager.selectedCardCount === 3) {
                $(this).addClass('last-card-selected');
                boardManager.processSelectedCards();
            }
        }
    });

    $('#hintButton').click(function () {
        boardManager.hintSelectCount += 1;
        $el = $('#hintDialog');
        $el.empty();
       
        if (boardManager.hintSelectCount < 2) {
            var img1 = "<img class='normal-border hintCard' src='" + imgPath + gameBoard.idsOfCardsInSet[0] + ".jpg' />";
            $el.append(img1);
            var img2 = "<img class='normal-border hintCard' src='" + imgPath + gameBoard.idsOfCardsInSet[1] + ".jpg' />";
            $el.append(img2);
        }
        else {
            var img1 = "<img class='normal-border hintCard' src='" + imgPath + gameBoard.idsOfCardsInSet[0] + ".jpg' />";
            $el.append(img1);
            var img2 = "<img class='normal-border hintCard' src='" + imgPath + gameBoard.idsOfCardsInSet[1] + ".jpg' />";
            $el.append(img2);
            var img3 = "<img class='normal-border hintCard' src='" + imgPath + gameBoard.idsOfCardsInSet[2] + ".jpg' />";
            $el.append(img3);            
        }

        $el.dialog('open');
    });

    $('#twoPlayerButton').click(function () {
        $('#playerButtons').hide();
        $('#playerInput').show();
        $('#playerSubmit').button('disable');
    });

    $('#cancelPlayer').click(function () {        
        $('#playerInput').hide();
        $('#playerButtons').show();
    });

    $('.userNameInput').keyup(canPlayerSubmitButtonBeEnabled);    
    $('#playerSubmit').mouseover(canPlayerSubmitButtonBeEnabled);

    $('#playerSubmit').click(function(){
        $('#playerDialog').dialog('close');
        playerManager.numberOfPlayers = 2;
       
        $('#twoPlayersDiv').show();
        $('#onePlayerDiv').hide();

        playerManager.playerOne = $('#playerOneInput').val();
        playerManager.playerTwo = $('#playerTwoInput').val();
        playerManager.updatePlayerDisplay();

        boardManager.startNewGame();
    });

    $('#onePlayerButton').click(function () {
        $('#playerDialog').dialog('close');
        playerManager.numberOfPlayers = 1;

        $('#onePlayerDiv').show();
        $('#twoPlayersDiv').hide();

        boardManager.startNewGame();
    });

    $('#playerOneScore').click(function () {
        playerManager.selectedPlayer = 1;
        $(this).addClass('ui-state-active').removeClass('ui-state-default');
        $('#playerTwoScore').addClass('ui-state-default').removeClass('ui-state-active');
    });

    $('#playerTwoScore').click(function () {
        playerManager.selectedPlayer = 2;
        $(this).addClass('ui-state-active').removeClass('ui-state-default');
        $('#playerOneScore').addClass('ui-state-default').removeClass('ui-state-active');
    });

};

function canPlayerSubmitButtonBeEnabled() {
    var enableButton = true;
    $('.userNameInput').each(function () {
        if ($(this).val().length > 0 && enableButton === true)
            enableButton = true;
        else
            enableButton = false;
    });

    if (enableButton === true) $('#playerSubmit').button('enable');
    else $('#playerSubmit').button('disable');    

    return enableButton;
};
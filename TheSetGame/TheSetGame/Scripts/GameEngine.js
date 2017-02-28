var gameEngine = {};
gameEngine.deck = [];
gameEngine.checkSetIndex = 0;
gameEngine.checkSetMessages = [true, "Selected cards do not form a set due to <b>Symbol</b>",
                                     "Selected cards do not form a set due to <b>Color</b>",
                                     "Selected cards do not form a set due to <b>Fill</b>",
                                     "Selected cards do not form a set due to <b>Count</b>"];

gameEngine.getMessage = function () {
    return gameEngine.checkSetMessages[gameEngine.checkSetIndex];
};

gameEngine.initDeck = function () {
    gameEngine.deck = [];
    var id = 0;
    for (var i = 1; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            for (var k = 1; k < 4; k++) {
                for (var n = 1; n < 4; n++) {
                    id = id + 1;
                    var card = new CardClass(id, i, j, k, n);                    
                    gameEngine.deck.push(card);
                }
            }
        }
    }
    gameEngine.deck.shuffle();
}

gameEngine.checkSum = function (n1, n2, n3) {
    var s = n1 + n2 + n3;
    if (s === 3 || s === 6 || s === 9) return true;
    else return false;
}


gameEngine.checkSet = function (c1, c2, c3) {
    if (gameEngine.checkSum(c1.first, c2.first, c3.first) === false) {
        gameEngine.checkSetIndex = 1; 
        return false;
    }
    else if (gameEngine.checkSum(c1.second, c2.second, c3.second) === false) {
        gameEngine.checkSetIndex = 2;
        return false;
    }
    else if (gameEngine.checkSum(c1.third, c2.third, c3.third) === false) {
        gameEngine.checkSetIndex = 3;
        return false;
    }
    else if (gameEngine.checkSum(c1.fourth, c2.fourth, c3.fourth) === false) {
        gameEngine.checkSetIndex = 4;
        return false;
    }
    else {
        gameBoard.idsOfCardsInSet = [];
        gameBoard.idsOfCardsInSet.push(c1.id);
        gameBoard.idsOfCardsInSet.push(c2.id);
        gameBoard.idsOfCardsInSet.push(c3.id);
        gameEngine.checkSetIndex = 0;
        return true;
    }
}

gameEngine.setInCards = function (cards, f1, f2) {

    if (cards.length == 3) return gameEngine.checkSet(cards.pop(), cards.pop(), cards.pop());

    var matrix = gameEngine.getMatrixArray(cards, f1, f2);
    var nextFeature = gameEngine.getNextFeature(f2);
   
    var retArray = [];
    //get sets accross
    for (var i = 0; i < 7; i = i + 3) {
        retArray = [];
        for (var j = 0; j < 3; j++) {
            retArray = retArray.concat(matrix[i + j]);
        }       
        if(retArray.length > 2 && gameEngine.setInCards(retArray, f2, nextFeature) === true) return true;
    }

    //get vertical sets
    for (var i = 0; i < 3; i++) {
        retArray = [];
        for (var j = 0; j < 7; j = j + 3) {
            retArray = retArray.concat(matrix[i + j]);
        }
        if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;
    }

    //get diagonals....there may way which would not include a bunch of ifs
    retArray = matrix[0].concat(matrix[4], matrix[8]);  
    if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;
        
    retArray = matrix[0].concat(matrix[5], matrix[7]);   
    if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;
    
    retArray = matrix[1].concat(matrix[3], matrix[8]);   
    if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;

    retArray = matrix[1].concat(matrix[5], matrix[6]); 
    if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;

    retArray = matrix[2].concat(matrix[3], matrix[7]);  
    if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;

    retArray = matrix[2].concat(matrix[4], matrix[6]);  
    if (retArray.length > 2 && gameEngine.setInCards(retArray, f1, nextFeature) === true) return true;

    return false;
}

gameEngine.getNextFeature= function(feature)
{
    if (feature === "second") return "third";
    else if (feature === "third") return "fourth";
    else if (feature === "fourth") return "Extra";
    else throw new Error("Wrong number of features requested");
}

gameEngine.getMatrixArray = function(cards, f1, f2){
    var matrixArray = new Array(9);
    for (var j = 0; j < 9; j++) {
        matrixArray[j] = [];
    }

    var length = cards.length;
    for (var i = 0; i < length; i++) {
        var card = cards.pop();        
        if (card[f1] === 1) {
            if (card[f2] === 1) matrixArray[0].push(card);
            else if (card[f2] === 2) matrixArray[1].push(card);
            else if (card[f2] === 3) matrixArray[2].push(card);
        }
        else if (card[f1] === 2) {
            if (card[f2] === 1) matrixArray[3].push(card);
            else if (card[f2] === 2) matrixArray[4].push(card);
            else if (card[f2] === 3) matrixArray[5].push(card);
        }
        else {
            if (card[f2] === 1) matrixArray[6].push(card);
            if (card[f2] === 2) matrixArray[7].push(card);
            if (card[f2] === 3) matrixArray[8].push(card);
        }
    }

    return matrixArray;
}

function CardClass(id, f1, f2, f3, f4) {
    this.id = id;
    this.first = f1;
    this.second = f2;
    this.third = f3;
    this.fourth = f4;
}

Array.prototype.shuffle = function () {
    var i = this.length, j, temp;
    if (i == 0) return;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
};


//***********************************************************************
//BOARD LOGIC
//************************************************************************
var gameBoard = {};
gameBoard.board = [];
gameBoard.idsOfCardsInSet = [];
gameBoard.indexOfCardsInSet = [];
gameBoard.numberOfSets = 0;

gameBoard.init = function () {
    gameBoard.board = [];
    gameEngine.initDeck();

    for (var j = 0; j < 12; j++) {
        gameBoard.board[j] = gameEngine.deck.pop();
    }

    for (var i = 12; i < 15; i++) {
        gameBoard.board[i] = null;
    }
};

gameBoard.prepareBoardForDisplay = function () {
    var nullCount = 0;
    var emptyIndex = [];
    var result = false;    
    gameBoard.idsOfCardsInSet = [];
    gameBoard.indexOfCardsInSet = [];

    if (gameEngine.deck.length < 3) {
        result = gameBoard.boardHasSet();
        if (result === true) return gameState.ok;
        else return gameState.win;
    }

    //check if total cards is less than 12 
    // if yes add to 12 if deck has cards
    for (var i = 14; i > -1; i = i-1) {
        if (gameBoard.board[i] === null) {
            nullCount += 1;
            emptyIndex.push(i);
        }
    }    
    
    if (nullCount > 3) {
        nullCount -= 3;

        for (var j = 0; j < 3; j++) {
            var index = emptyIndex.pop();
            gameBoard.board[index] = gameEngine.deck.pop();
        }       
    }

    //if we now have a set return
    result = gameBoard.boardHasSet();
    if (result === true) return gameState.ok;

    //if we did not find a set in the board and no more cards are left in the deck then win
    if (gameEngine.deck.length === 0) return gameState.win;

    for (var j = 0; j < 3; j++) {
        var index = emptyIndex.pop();
        gameBoard.board[index] = gameEngine.deck.pop();
    }

    result = gameBoard.boardHasSet();
    if (result === true) return gameState.ok;
    else return gameState.notSetAvailable; //we were not able to fill board and have a set present
};

gameBoard.loadIndexOfCardsInSet = function () {
    gameBoard.indexOfCardsInSet = [];

    if (gameBoard.idsOfCardsInSet.length > 2) {
        var f = gameBoard.idsOfCardsInSet[0];
        var e = gameBoard.idsOfCardsInSet[1];
        var k = gameBoard.idsOfCardsInSet[2];
        var found = 0;

        for (var i = 0; i < 15; i++) {
            if (gameBoard.board[i] === null) continue;
            if (gameBoard.board[i].id === f || gameBoard.board[i].id === e || gameBoard.board[i].id === k) {
                gameBoard.indexOfCardsInSet.push(i);
                if (found === 2) { return; }
                found = found + 1;
            }
        }
    }
};

gameBoard.boardHasSet = function(){    
    var chkBoard = [];
    gameBoard.numberOfSets = 0;
    var returnResult = false;
    var retainBoard = [];
    //copy the board by filtering out null slots
    for (var i = 0; i < 15; i++) {
        if (gameBoard.board[i] !== null) {
            retainBoard.push(gameBoard.board[i]);
        }
    }
        
    var result = false;

    do {
        chkBoard = retainBoard.slice();
        result = gameEngine.setInCards(chkBoard, "first", "second");        

        if (result === true) {
            returnResult = true;
            gameBoard.numberOfSets += 1;
            retainBoard = gameBoard.filterCardsInSet(retainBoard);
        }        
    } while (result === true);

    if (returnResult === true) {
        gameBoard.loadIndexOfCardsInSet();
        var msg = gameBoard.indexOfCardsInSet[0] + ":";
        msg += gameBoard.indexOfCardsInSet[1] + ":";
        msg += gameBoard.indexOfCardsInSet[2] ;
        log(msg + " Number of sets: " + gameBoard.numberOfSets);
    }    

    return returnResult;
};

gameBoard.filterCardsInSet = function (board) {
    var retBoard = [];
    var f = gameBoard.idsOfCardsInSet[0];
    var e = gameBoard.idsOfCardsInSet[1];
    var k = gameBoard.idsOfCardsInSet[2];    

    for (var i = 0; i < 15; i++) {
        if (board[i] === null || board[i] === undefined) continue;
        if (board[i].id === f || board[i].id === e || board[i].id === k) {
            continue;
        }
        else {
            retBoard.push(board[i]);
        }
    }
    return retBoard;
};

function log(msg){
    if(window.console && window.console.log)
    {
        console.log(msg);
    }
}


var gameState = {
    win: 0,
    notSetAvailable: 1,
    ok: 2
};
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

/*global variable to save state of progress bars*/
var trueBarAdd = 0
var falseBarAdd = 0

function onDrop (source, target) {
    if (checkMove(source,target)==true){
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })
        // illegal move
        if (move === null) return 'snapback'
        if(moves.length>0){
            computerMove()
        } else {
            pgn_strings_random_index += 1
            if(pgn_strings_random_index == pgn_strings_random.length){
                pgn_strings_random = shuffleArray(pgn_strings)
                pgn_strings_random_index = 0
                trueBarAdd += 100/pgn_strings_random_length
                $('#trueBar').css("width",trueBarAdd+"%")
                setTimeout(() => {
                    /*reset progress bar state*/
                    $('#falseBar').css("width","0%")
                    $('#trueBar').css("width","0%")
                    trueBarAdd = 0
                    falseBarAdd = 0
                }, "1000");
            } else {
                trueBarAdd += 100/pgn_strings_random_length
                $('#trueBar').css("width",trueBarAdd+"%")
            }
            runPgn(pgn_strings_random_index)
        }
    } else if(checkMove(source,target)==false) {
        pgn_strings_random_index += 1
        if(pgn_strings_random_index == pgn_strings_random.length){
            pgn_strings_random = shuffleArray(pgn_strings)
            pgn_strings_random_index = 0
            falseBarAdd += 100/pgn_strings_random_length
            $('#falseBar').css("width",falseBarAdd+"%")
            setTimeout(() => {
                /*reset progress bar state*/
                $('#falseBar').css("width","0%")
                $('#trueBar').css("width","0%")
                trueBarAdd = 0
                falseBarAdd = 0
            }, "1000");
        } else {
            falseBarAdd += 100/pgn_strings_random_length
            $('#falseBar').css("width",falseBarAdd+"%")
        }
        runPgn(pgn_strings_random_index)
        return 'snapback'
    }
}

function checkMove(source,target){
    var source_sol = moves[0].from
    var target_sol = moves[0].to
    if (source_sol == source && target_sol == target){
        console.log("good move")
        /*delete move from array*/
        moves.shift()
        return true
    } else if(source==target){
        console.log("piece not moved")
    } else {
        console.log("wrong move")
        return false
    }
}

function computerMove(){
    var source = moves[0].from
    //console.log(source)
    var target = moves[0].to
    //console.log(target)
    var move_string = source + '-' + target
    //console.log(move_string)
    board.move(move_string)
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
    moves.shift()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    board.position(game.fen())
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('myBoard',config)
//$(window).resize(board.resize)


/*-----------------------------------------------------------------*/

/*reset board if new file is selected via file manager dialog*/
function resetTraining(){
    $('#start').removeClass("d-none")
    $('#progress').addClass("d-none")
    board = Chessboard('myBoard', config)
}

var parse = PgnParser.parse
var split = PgnParser.split
var parseGames = (string) => parse(string,{startRule:"games"});
var splitGames = (string) => split(string, {startRule:"games"});
var pgn_strings = [];
var pgn_strings_random = [];
var pgn_strings_random_length = 0;

/*read input file if start button is pressed and build random array with single game pgn as elements*/
function startTraining(){
    $('#start').addClass("d-none")
    $('#progress').removeClass("d-none")
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0]
    var reader = new FileReader()
    reader.addEventListener('load', function() {
        //run code if FileReader can get input because user selected pgn file
        //get pgn file as string to work with pgn-parser libary from github
        var pgn = reader.result;
        //use pgn-parser to split games
        var games = splitGames(pgn)
        //save every game pgn string in array pgn_strings
        pgn_strings = []
        for(var i=0;i<games.length;i++){
            var singleGame = games[i].all
            pgn_strings.push(singleGame)
        }
        pgn_strings_random = shuffleArray(pgn_strings)
        pgn_strings_random_length = pgn_strings_random.length
        //start with first random puzzle
        runPgn(pgn_strings_random_index)
    });
    reader.readAsText(file);
}


function startTraining_multipleFiles(){
    /*from chatGPT and not working*/
    $('#start').addClass("d-none")
    $('#progress').removeClass("d-none")
    var fileInput = document.getElementById('fileInput');
    var files = fileInput.files
    var fileNumber = files.length 
    pgn_strings = []
    var pgn_strings_random = []
    var pgn_strings_random_length = 0
    var pgn_strings_random_index = 0

    for(var i=0;i<fileNumber;i++){
        var reader = new FileReader()
        reader.onload = (function(index) {
            return function() {
                var pgn = reader.result;
                console.log(pgn)
                var games = splitGames(pgn)
                for(var j=0;j<games.length;j++){
                    var singleGame = games[j].all
                    pgn_strings.push(singleGame)
                }
                if(index===fileNumber-1){
                    console.log("ich war hier")
                    pgn_strings_random = shuffleArray(pgn_strings)
                    pgn_strings_random_length = pgn_strings_random.length
                    /*start with first random puzzle*/
                    runPgn(pgn_strings_random_index)
                }
            };
        })(i);
        reader.readAsText(files[i]);
    }
}

/*fetch function if file should be directly read from github server*/

//fetch("pgn/test4.pgn")
//.then(response => response.text())
//.then(pgn => {
//[>array with all games in pgn file<]
//var games = splitGames(pgn)
//[>save every game pgn string in array pgn_strings<]
//pgn_strings = []
//for(var i=0;i<games.length;i++){
//var singleGame = games[i].all
//pgn_strings.push(singleGame)
//}
//pgn_strings_random = shuffleArray(pgn_strings)
//runPgn(pgn_strings_random_index)
//});

var pgn_strings_random_index = 0
var moves;
var starting_pos;

/*insert single puzzle from random games array*/
function runPgn(index){
    pgnString = pgn_strings_random[index]
    game.load_pgn(pgnString)
    moves = game.history({verbose:true})
    starting_pos = game.header().FEN
    game.load(starting_pos)
    board.position(starting_pos)
    if(game.turn()=='w'){
        board.orientation('black')
    } else {
        board.orientation('white')
    }
    setTimeout(computerMove, 1000);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

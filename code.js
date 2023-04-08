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

function onDrop (source, target) {
    if (checkMove(source,target)==true){
        var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })
        // illegal move
        if (move === null) return 'snapback'
        if(moves_extended.length>0){
            computerMove()
        }
    } else {
        return 'snapback'
        /*jumb back to starting position*/
    }
}

function checkMove(source,target){
    var source_sol = moves_extended[0].from
    var target_sol = moves_extended[0].to
    if (source_sol == source && target_sol == target){
        console.log("good move")
        /*delete move from array*/
        moves_extended.shift()
        return true
    } else {
        console.log("wrong move")
        return false
    }
}

function computerMove(){
    var source = moves_extended[0].from
    console.log(source)
    var target = moves_extended[0].to
    console.log(target)
    var move_string = source + '-' + target
    console.log(move_string)
    board.move(move_string)
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })
    moves_extended.shift()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    board.position(game.fen())
}

//updateStatus()

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('myBoard', config)


/*-----------------------------------------------------------------*/

//pgn-parser

var parse = PgnParser.parse
var parseGames = (string) => parse(string,{startRule:"games"});
var splitGames = (string) => split(string, {startRule:"games"});

fetch("pgn/test.pgn")
    .then(response => response.text())
    .then(pgn => {
        var test = parseGames(pgn)
        console.log(test)
        console.log(test.moves)
        console.log(test.moves[0].notation.notation)
});

/*chess.js*/

/*load pgn in game instance and extract next moves and starting postion fen*/
var moves;
var moves_extended;
var starting_pos;
//fetch("pgn/test.pgn")
    //.then(response => response.text())
    //.then(pgn =>{
        //game.load_pgn(pgn)
        //moves = game.history()
        //moves_extended = game.history({verbose:true})
        //starting_pos = game.header().FEN
        //game.load(starting_pos)
        //board.position(starting_pos)
    //});










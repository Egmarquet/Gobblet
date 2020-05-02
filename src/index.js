import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import Konva from 'konva';
import { Stage, Layer, Circle, Line, Arrow} from 'react-konva';

const BoardManager = {

  produceGobblet(player, color, size){
    var gobblet = {player: player, color: color, size: size}
    return gobblet
  },

  getInitialBoardState(){
    const emptyBoard = [
        [ [],[],[],[] ],
        [ [],[],[],[] ],
        [ [],[],[],[] ],
        [ [],[],[],[] ]]
    return emptyBoard
  },

  sanitizeCoordinates(coord){
    if (coord <= 0){
      return 0
    }
    else if (coord >= 3){
      return 3
    }
    else{
      return coord
    }
  },

  getGobblet(board, x, y){
    x = this.sanitizeCoordinates(x)
    y = this.sanitizeCoordinates(y)
    if (board[x][y].length > 0){
      return board[x][y][board[x][y].length-1]
    }
    return null
  },

  pushGobblet(board, x, y, gobblet){
    var boardStateCopy = Array.from(board)
    boardStateCopy[x][y].push(gobblet)
    return boardStateCopy
  },

  popGobblet(board, x, y){
    var boardStateCopy = Array.from(board)
    var gobblet = boardStateCopy[x][y].pop()
    return [boardStateCopy, gobblet]
  },

  moveIsValid(board, x1, y1, x2, y2){
    const g1 = this.getGobblet(board, x1, y1)
    const g2 = this.getGobblet(board, x2, y2)
    if (g1 === null){
        return false
    }
    else if (g2 === null){
      return true
    }
    else{
      if (g1.size > g2.size){
        return true
      }
    }
    return false
  },

  move(board, x1, y1, x2, y2){
    if (this.moveIsValid(board, x1, y1, x2, y2)){
      var [board, gobblet] = this.popGobblet(board, x1, y1)
      board = this.pushGobblet(board, x2, y2, gobblet)
      return board
    }
    else{
      return board
    }
  }
}

const PlayerMat = {

}

function Board( {width, height, color, boardState} ){

  const coords = [
    [1,1, width-1,1, width-1,height-1, 1,height-1, 1,1],
    [width/4,0, width/4,height],
    [width/2,0, width/2,height],
    [3*width/4,0, 3*width/4,height],
    [0,height/4, width,height/4],
    [0,height/2, width,height/2],
    [0,3*height/4, width,3*height/4],
  ]

  const squareToCenterCoord = (x, y) => {
    return [width/8 + x*width/4, height/8 + y*height/4]
  }

  const renderGobblets = boardState.map( ( row, i ) => { return (
    row.map( (square, j) => {
      if(square.length > 0){
        var gobblet = square[square.length-1]
        return(
          <Circle
            x = {squareToCenterCoord(i,j)[0]}
            y = {squareToCenterCoord(i,j)[1]}
            fill = {gobblet.color}
            stroke = {"black"}
            strokeWidth = {1}
            radius = {gobblet.size}
          />
        )
      }
      return(null)
    })
  )})

  const borders = coords.map( (p, index) => {
    return(
      <Line
        points = {p}
        stroke = {color}
        strokeWidth = {1}
        key = {index}
      />
    )
  });

  return(
    <Layer>
      {borders}
      {renderGobblets}
    </Layer>
  );
}

/*
  Player states:
    0: Waiting for move
    1: Placing gobblet
    2: Opponients move
*/
function Game(){
  const width = 500;
  const height = 500;

  // Enums
  const gameStates = {WAIT:0, PLACE:1, OPPTURN: 2}
  const GOBBLETSIZE = {SMALL:10, MEDIUM:30, LARGE:50}

  //Overall gamestate tracking
  const boardManager = BoardManager
  const [boardState, setBoardState] = useState(boardManager.getInitialBoardState())
  const [playerState, setPlayerState] = useState(gameStates.WAIT)

  // Mouse tracking
  const [mousePosition, setMousePosition] = useState([0,0])
  const [mousedOverSquare, setMousedOverSquare] = useState([0,0])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState([0,0])

  const mouseTracker = (e) => {
    var x = parseInt(e.evt.offsetX,10)
    var y = parseInt(e.evt.offsetY,10)
    // bounding the mouse to play area
    if (x < 0){
      x = 0
    }
    if (x > width){
      x = width
    }
    if (y < 0){
      y = 0
    }
    if (y > height){
      y = height
    }
    setMousePosition([x, y])
    setMousedOverSquare([Math.floor(mousePosition[0]/(width/4)), Math.floor(mousePosition[1]/(height/4))])
  }

  const squareToCenterCoord = (x, y) => {
    return [width/8 + x*width/4, height/8 + y*height/4]
  }

  // Main game interaction logic
  const handleDrag = (e) => {
    if (!isDragging){
      var x = Math.floor(mousePosition[0]/(width/4))
      var y = Math.floor(mousePosition[1]/(height/4))
      // If valid moveable gobblet exists at that position
      if (boardManager.getGobblet(boardState, x, y) != null){
        setSelectedSquare([x, y])
        setIsDragging(true)
      }
    }
  }

  const handleRelease = (e) => {
    if (boardManager.moveIsValid(boardState, selectedSquare[0], selectedSquare[1], mousedOverSquare[0], mousedOverSquare[1])){
      setBoardState(boardManager.move(boardState,selectedSquare[0], selectedSquare[1], mousedOverSquare[0], mousedOverSquare[1]))
    }
    setSelectedSquare([0,0])
    setIsDragging(false)
  }

  // ------------------------------------- //
  // Testing logic
  // ------------------------------------- //

  const randomGenGobblets = () => {
    var boardStateCopy = Array.from(boardManager.getInitialBoardState());
    const sizes = [10, 30, 50]
    for (var i = 0; i<7; i++){
      var size = Math.floor(Math.random()*3)
      var x = Math.floor(Math.random()*4)
      var y = Math.floor(Math.random()*4)
      var gobblet = boardManager.produceGobblet(0, "#3287a8", sizes[size])
      boardStateCopy = boardManager.pushGobblet(boardStateCopy, x, y, gobblet)
    }
    setBoardState(boardStateCopy)
  }

  const placementArrow = () => {
    if (isDragging){
      const refGobblet = boardManager.getGobblet(boardState,selectedSquare[0],selectedSquare[1])
      if (refGobblet ){
        if (boardManager.moveIsValid(boardState, selectedSquare[0], selectedSquare[1], mousedOverSquare[0], mousedOverSquare[1])){
          return(
            <Layer>
              <Circle
                x = {squareToCenterCoord(mousedOverSquare[0],mousedOverSquare[1])[0]}
                y = {squareToCenterCoord(mousedOverSquare[0],mousedOverSquare[1])[1]}
                radius = {refGobblet.size}
                fill = {refGobblet.color}
                dash = {[5,1]}
                stroke = {"black"}
                opacity = {0.5}
              />
              <Arrow
                stroke = {"black"}
                points = {[
                  squareToCenterCoord(selectedSquare[0],selectedSquare[1])[0],
                  squareToCenterCoord(selectedSquare[0],selectedSquare[1])[1],
                  mousePosition[0],
                  mousePosition[1]
                ]}
                strokeWidth = {1}
              />
            </Layer>
          )
        }
        else{
          return(
            <Layer>
              <Arrow
                stroke = {"black"}
                points = {[
                  squareToCenterCoord(selectedSquare[0],selectedSquare[1])[0],
                  squareToCenterCoord(selectedSquare[0],selectedSquare[1])[1],
                  mousePosition[0],
                  mousePosition[1]
                ]}
                strokeWidth = {1}
              />
            </Layer>
          )
        }
      }
    }

    return null
  }

  return(
    <div>
      <Stage
        width={width}
        height={height}
        onMouseDown = {(e) => {handleDrag(e)}}
        onMouseMove = {(e) => {mouseTracker(e)}}
        onMouseUp = {(e) => {handleRelease()}}
      >
        <Board
          width = {width}
          height = {height}
          color = {"#3287a8"}
          boardState = {boardState}
        />
        {placementArrow()}
      </Stage>
      <button onClick={randomGenGobblets}>Random gobblets</button>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

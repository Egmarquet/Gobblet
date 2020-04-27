import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import Konva from 'konva';
import { Stage, Layer, Group, Circle, Line} from 'react-konva';

function BoardState(){

  const produceGobblet = (player, color, size) => {
    var gobblet = {player: player, color: color, size:size}
    return gobblet
  }

  const getInitialBoardState = () => {
    const emptyBoard = [
        [ [],[],[],[] ],
        [ [],[],[],[] ],
        [ [],[],[],[] ],
        [ [],[],[],[] ]]
        
    return emptyBoard
  }

  getGobblet(board, x, y){
    if (board[x][y].length > 0){
      return board[x][y][board[x][y].length-1]
    }
    return null
  }

  pushGobblet(board, x, y, gobblet){
    var boardStateCopy = Array.from(board)
    boardStateCopy[x][y].push(gobblet)
    return boardStateCopy
  }

  popGobblet(board, x, y){
    var boardStateCopy = Array.from(board)
    var gobblet = boardStateCopy[x][y].pop()
    return [boardStateCopy, gobblet]
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

  const gobblets = boardState.map( ( row, i ) => { return (
    row.map( (square, j) => {
      if(square.length > 0){
        return(square[square.length-1])
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
    </Layer>
  );
}

function Arrow({x1, y1, x2, y2, selectedGobblet, x2Center, y2Center}){
  return(
    <Line
      points = {[x1, y1, x2, y2]}
      stroke = {"black"}
    />
  )
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
  const offsetX = 0;
  const offsetY = 0;
  const emptyBoard = [
      [ [],[],[],[] ],
      [ [],[],[],[] ],
      [ [],[],[],[] ],
      [ [],[],[],[] ]]

  // Enums
  const gameStates = {WAIT:0, PLACE:1, OPPTURN: 2}
  const GOBBLETSIZE = {SMALL:10, MEDIUM:30, LARGE:50}
  const board = new BoardState(emptyBoard)

  //Overall gamestate tracking
  const [boardState, setBoardState] = useState(board.getState())
  const [playerState, setPlayerState] = useState(gameStates.WAIT)

  // Mouse tracking
  const [mousePosition, setMousePosition] = useState([0,0])
  const [mousedOverSquare, setMousedOverSquare] = useState([0,0])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState([0,0])
  const [selectedGobblet, setSelectedGobblet] = useState(null)

  const mouseTracker = (e) => {
    const x = parseInt(e.evt.offsetX,10)
    const y = parseInt(e.evt.offsetY,10)
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
    const square = [Math.floor(mousePosition[0]/(width/4)), Math.floor(mousePosition[1]/(height/4))]
    if (!isDragging){
      var coordX = Math.floor(mousePosition[0]/(width/4))
      var coordY = Math.floor(mousePosition[1]/(height/4))

      // If valid moveable gobblet exists at that position
      if (boardState[coordX][coordY].length > 0){
        setSelectedSquare([coordX, coordY])
        setIsDragging(true)
      }
    }
  }

  const handleRelease = (e) => {
    setSelectedSquare([0,0])
    setIsDragging(false)
  }

  // ------------------------------------- //
  // Testing logic
  // ------------------------------------- //

  const randomGenGobblets = () => {
    for (var i = 0; i<5; i++){
      var size = Math.floor(Math.random()*3)
      var x = Math.floor(Math.random()*4)
      var y = Math.floor(Math.random()*4)
      var gobblet = board.produceGobblet(0, "#3287a8", 50)

      board.pushGobblet(x, y, setBoardState)
    }
  }

  /*
  const ghostGobblet = () => {
    if (isDragging && !squareIsOccupied(mousedOverSquare[0], mousedOverSquare[1])){
      const refGobblet = getGobblet(selectedSquare[0],selectedSquare[1])
      if (refGobblet){
        return(
          <Circle
            x = {squareToCenterCoord(mousedOverSquare[0],mousedOverSquare[1])[0]}
            y = {squareToCenterCoord(mousedOverSquare[0],mousedOverSquare[1])[1]}
            radius = {refGobblet.props.radius}
            fill = {refGobblet.props.fill}
            dash = {[5,1]}
            stroke = {"black"}
            opacity = {0.5}
          />
        )
      }
    }

    return null
  }
  */

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

        <Layer>
          {isDragging
            ?
            <Arrow
              x1= {squareToCenterCoord(selectedSquare[0],selectedSquare[1])[0]}
              y1= {squareToCenterCoord(selectedSquare[0],selectedSquare[1])[1]}
              x2= {mousePosition[0]}
              y2= {mousePosition[1]}
            />
            : null
          }
        </Layer>
      </Stage>

      <button onClick={randomGenGobblets}>Random gobblets</button>
    </div>
  );
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

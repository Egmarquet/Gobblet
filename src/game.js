import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import Konva from 'konva';
import { Stage, Layer, Rect, Circle, Line, Arrow} from 'react-konva';
import GameManager from './game-manager.js'

const Board = ({height, width, padding, gameState, gm}) => {
  const renderBoards = () => {
    return(
      Object.keys(gameState).map(function(key, index) {
        return(
          <Rect
            x = {gameState[key].dimensions[0]}
            y = {gameState[key].dimensions[1]}
            width = {gameState[key].dimensions[2]}
            height = {gameState[key].dimensions[3]}
            stroke = {"black"}
            strokeWidth = {1}
          />
        )
      })
    )
  }

  const renderCells = () => {
    const buffer = []
    Object.keys(gameState).map(function(key, index) {
      for(var x = 0; x < gameState[key].state.length; x++){
        for(var y = 0; y < gameState[key].state[x].length; y++){
          var cellDimensions = gm.getCellBounds(gameState, key, x, y)
          buffer.push(
            <Rect
              x = {cellDimensions[0]}
              y = {cellDimensions[1]}
              width = {cellDimensions[2]}
              height = {cellDimensions[3]}
              stroke = {"black"}
              strokeWidth = {1}
            />
          )
        }
      }
    })
    return buffer

  }

  const renderGobblets = () => {
    const buffer = []
    Object.keys(gameState).map(function(key, index) {
      for(var x = 0; x < gameState[key].state.length; x++){
        for(var y = 0; y < gameState[key].state[x].length; y++){
          var gobblet = gm.getGobblet(gameState, key, x, y)
          if (gobblet != null){
            var cellCenter = gm.getCellCenter(gameState, key, x, y)
            buffer.push(
              <Circle
                x = {cellCenter[0]}
                y = {cellCenter[1]}
                radius = {gobblet.size}
                stroke = {"black"}
                strokeWidth = {1}
                fill = {gobblet.color}
              />
            )
          }
        }
      }
    })
    return buffer
  }

  return(
    <Layer>
      {renderBoards()}
      {renderCells()}
      {renderGobblets()}
    </Layer>
  )
}

function Game(){
  /*
  The height represents the height of the board. The board area is hxh
  The entire width of the stage 1.5*height + padding (few pixels)

  Coorner coordinates for boxes:
    p1: (padding, padding + h/8) size: (h/4, 3*h/4)
    p2: (padding*3 + h/4 + h, padding + h/8), size: size: (h/4, 3*h/4)
    board: (padding*2 + h/4, padding), size: (h*h)
  gameboard:
  */
  const height = 300
  const width = 1.5*height
  const padding = 6
  const p1Coord = [padding, padding + (height/8), height/4, 3*height/4]
  const p2Coord = [(padding*3) + (height/4) + height, padding + (height/8), height/4, 3*height/4]
  const boardCoord = [(padding*2) + (height/4), padding, height, height]
  const gobbletSizes = [height*0.02, height*0.06, height*0.1]

  //Overall gamestate tracking
  const gameManager = GameManager
  const [gameState, setGameState] = useState(gameManager.getInitialGameState(p1Coord,p2Coord,boardCoord,"red","blue",gobbletSizes))
  // Mouse tracking
  const [mousePosition, setMousePosition] = useState([0,0])
  const [mousedOverCell, setMousedOverCell] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)

  const mouseTracker = (e) => {
    const stage = e.target.getStage()
    const x = stage.getPointerPosition().x
    const y = stage.getPointerPosition().y
    setMousePosition([x,y])
    setMousedOverCell(gameManager.mouseToCell(gameState, x, y))
  }

  const handleDrag = () => {
    if (!isDragging && mousedOverCell !== null){
      setSelectedCell(Array.from(mousedOverCell))
      setIsDragging(true)
    }
  }

  const handleRelease = () => {
    if (selectedCell !== null && mousedOverCell !== null){
      if (gameManager.moveIsLegal(gameState, selectedCell[0], mousedOverCell[0], selectedCell[1], selectedCell[2], mousedOverCell[1], mousedOverCell[2])){
        const gameStateCopy = gameManager.moveGobblet(gameState, selectedCell[0], mousedOverCell[0], selectedCell[1], selectedCell[2], mousedOverCell[1], mousedOverCell[2])
        setGameState(gameStateCopy)
      }
    }
    setSelectedCell(null)
    setIsDragging(false)

  }

  const trackingArrow = () => {
    if (isDragging && selectedCell !== null && mousedOverCell !== null){
      var center = gameManager.getCellCenter( gameState, selectedCell[0], selectedCell[1], selectedCell[2] )
      var refGobblet = gameManager.getGobblet( gameState, selectedCell[0], selectedCell[1], selectedCell[2] )
      if (refGobblet !== null){
        if (gameManager.moveIsLegal(gameState, selectedCell[0], mousedOverCell[0], selectedCell[1], selectedCell[2], mousedOverCell[1], mousedOverCell[2])){
          var targetCenter = gameManager.getCellCenter( gameState, mousedOverCell[0], mousedOverCell[1], mousedOverCell[2] )
          return(
            <Layer>
              <Circle
                x = {targetCenter[0]}
                y = {targetCenter[1]}
                radius = {refGobblet.size}
                fill = {refGobblet.color}
                dash = {[5,1]}
                stroke = {"black"}
                opacity = {0.5}
              />
              <Arrow
                stroke = {"black"}
                strokeWidth = {1}
                points = {[center[0], center[1], mousePosition[0], mousePosition[1]]}
              />
            </Layer>
          )
        }
        else{
          return(
            <Layer>
              <Arrow
                stroke = {"black"}
                strokeWidth = {1}
                points = {[center[0], center[1], mousePosition[0], mousePosition[1]]}
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
        width={width + 4*padding}
        height={height + 2*padding}
        onMouseMove = {(e) => {mouseTracker(e)}}
        onMouseDown = {(e) => {handleDrag(e)}}
        onMouseUp = {(e) => {handleRelease(e)}}
      >
        <Board
          height = {height}
          width = {width}
          padding = {padding}
          gameState = {gameState}
          gm = {gameManager}
        />
        {trackingArrow()}
      </Stage>
      <button onClick={() => {setGameState(gameManager.getInitialGameState(p1Coord,p2Coord,boardCoord,"red","blue",gobbletSizes))} }> Reset! </button>

    </div>
  )
}

export default Game
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

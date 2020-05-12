import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import Konva from 'konva';
import { Stage, Layer, Rect, Circle, Line, Arrow} from 'react-konva';
import Board from './board.js'

function Game({ height, padding, gameManager, gameState, makeMove, player, isPlayersTurn, setWinner}){

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
  /*
    Determining which player can move:
      playerTurn === true

    Determining
  */
  const handleDrag = () => {
    if (!isDragging && mousedOverCell !== null && isPlayersTurn){
      var gobblet = gameManager.getGobblet(gameState, mousedOverCell[0], mousedOverCell[1], mousedOverCell[2])
      if (gobblet && gobblet.player === player){
        setSelectedCell(Array.from(mousedOverCell))
        setIsDragging(true)
      }
    }
  }

  const handleRelease = () => {
    if (selectedCell !== null && mousedOverCell !== null && isPlayersTurn){
      if (gameManager.moveIsLegal(gameState, selectedCell[0], mousedOverCell[0], selectedCell[1], selectedCell[2], mousedOverCell[1], mousedOverCell[2])){
        makeMove([selectedCell[0], selectedCell[1], selectedCell[2], mousedOverCell[0], mousedOverCell[1], mousedOverCell[2]])

        // Checking for winners
        if(selectedCell[0] === "board"){
          var wonPlayer = gameManager.isWon(gameState, selectedCell[1], selectedCell[2])
          if(wonPlayer){
            setWinner(wonPlayer)
          }
        }
        if(mousedOverCell[0] === "board"){
          var wonPlayer = gameManager.isWon(gameState, mousedOverCell[1], mousedOverCell[2])
          if(wonPlayer){
            setWinner(wonPlayer)
          }
        }
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
        width={1.5*height + 4*padding}
        height={height + 2*padding}
        onMouseMove = {(e) => {mouseTracker(e)}}
        onMouseDown = {(e) => {handleDrag(e)}}
        onMouseUp = {(e) => {handleRelease(e)}}
      >
        <Board
          gameState = {gameState}
          gameManager = {gameManager}
          isPlayersTurn = {isPlayersTurn}
        />
        {trackingArrow()}
      </Stage>
    </div>
  )
}

export default Game
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

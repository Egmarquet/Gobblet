import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import Konva from 'konva';
import {Layer, Rect, Circle} from 'react-konva';

const Colors = {
  active: "black",
  inactive: "#c4c8cf"
}

const Board = ({height, width, padding, gameState, playerState, gm}) => {
  const renderBoards = () => {
    return(
      Object.keys(gameState).map(function(key, index) {
        if (key === "p1" || key === "p2"){
          return(
            <Rect
              x = {gameState[key].dimensions[0]}
              y = {gameState[key].dimensions[1]}
              width = {gameState[key].dimensions[2]}
              height = {gameState[key].dimensions[3]}
              stroke = {playerState ? Colors.active : Colors.inactive}
              strokeWidth = {1}
            />
          )
        }
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
              stroke = {playerState ? Colors.active : Colors.inactive}
              strokeWidth = {1}
              cornerRadius = {cellDimensions[2]/5}
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

export default Board

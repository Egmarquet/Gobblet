const GameManager = {

  produceGobblet: function(player, color, size){
    var gobblet = {player: player, color: color, size: size}
    return gobblet
  },

  getInitialGameState: function( height, padding ){
    const width = 1.5*height
    const p1Coord = [padding, padding + (height/8), height/4, 3*height/4]
    const p2Coord = [(padding*3) + (height/4) + height, padding + (height/8), height/4, 3*height/4]
    const boardCoord = [(padding*2) + (height/4), padding, height, height]
    const gobbletSizes = [height*0.02, height*0.06, height*0.1]

    const initGameState = {
      board:
      {
        state:[
          [ [],[],[],[] ],
          [ [],[],[],[] ],
          [ [],[],[],[] ],
          [ [],[],[],[] ]],
        dimensions: boardCoord
      },

      p1:
      {
        state: [ [ [], [], [] ] ],
        dimensions: p1Coord
      },

      p2:
      {
        state: [ [ [], [], [] ] ],
        dimensions: p2Coord
      }
    }

    for (var i = 0; i < 3; i++){
      for (var j = 0; j < 3; j++){
        initGameState["p1"].state[0][i].push(this.produceGobblet("p1", "red", gobbletSizes[j]))
        initGameState["p2"].state[0][i].push(this.produceGobblet("p2", "blue", gobbletSizes[j]))
      }
    }

    return initGameState
  },

  getGobblet: function( gameState, name, cellX, cellY ){
    if (this.cellIsOccupied(gameState, name, cellX, cellY)){
      return gameState[name].state[cellX][cellY][gameState[name].state[cellX][cellY].length-1]
    }
    return null
  },

  pushGobblet: function( gameState, name, cellX, cellY, gobblet ){
    var gameStateCopy = {...gameState}
    gameStateCopy[name].state[cellX][cellY].push(gobblet)
    return gameStateCopy
  },

  popGobblet: function( gameState, name, cellX, cellY ){
    var gameStateCopy = {...gameState}
    var gobblet = gameStateCopy[name].state[cellX][cellY].pop()
    return [gameStateCopy, gobblet]
  },

  moveGobblet: function( gameState, name1, name2, x1, y1, x2, y2 ){
    console.log("moving")
    var [gameStateCopy, gobblet] = this.popGobblet(gameState, name1, x1, y1)
    gameStateCopy = this.pushGobblet(gameStateCopy, name2, x2, y2, gobblet)
    return gameStateCopy
  },

  moveIsLegal: function( gameState, name1, name2, x1, y1, x2, y2 ){
    /*
    Legal moves:
    1. From player mat to empty square on board, unless 3.
    2. From emptry square on board to any empty square on board, or square with a smaller gobblet
    3. If an enemy player has a row of 3 gobblets, a capture is possible

    3 currently not implemented
    */
    var gobblet1 = this.getGobblet(gameState, name1, x1, y1)
    var gobblet2 = this.getGobblet(gameState, name2, x2, y2)

    if (gobblet1 && name2 === "board"){
      if (gobblet2 === null){
        return true
      }
      else if (gobblet1.size > gobblet2.size){
        return true
      }
    }
    return false
  },

  cellIsOccupied: function( gameState, name, cellX, cellY ){
    return gameState[name].state[cellX][cellY].length !== 0
  },

  mouseToCell: function( gameState, mouseX, mouseY ){
    for (var name in gameState){
      var x = gameState[name].dimensions[0]
      var y = gameState[name].dimensions[1]
      var width = gameState[name].dimensions[2]
      var height = gameState[name].dimensions[3]
      var noCellsX = gameState[name].state.length
      var noCellsY = gameState[name].state[0].length

      if (  mouseX > x &&
            mouseX < x + width &&
            mouseY < y + height &&
            mouseY > y
      )
      {
          return [name, Math.floor((mouseX-x)/(width/noCellsX)), Math.floor((mouseY-y)/(height/noCellsY))]
      }
    }
    return null

  },

  getCellBounds: function( gameState, name, cellX, cellY ){
    var x = gameState[name].dimensions[0]
    var y = gameState[name].dimensions[1]
    var width = gameState[name].dimensions[2]
    var height = gameState[name].dimensions[3]
    var noCellsX = gameState[name].state.length
    var noCellsY = gameState[name].state[0].length
    return [x + width*cellX/noCellsX, y + height*cellY/noCellsY, width/noCellsX, height/noCellsY]
  },

  getCellCenter: function( gameState, name, cellX, cellY ){
    var x = gameState[name].dimensions[0]
    var y = gameState[name].dimensions[1]
    var width = gameState[name].dimensions[2]
    var height = gameState[name].dimensions[3]
    var noCellsX = gameState[name].state.length
    var noCellsY = gameState[name].state[0].length
    return [x + (width*cellX/noCellsX) + width/(2*noCellsX), y + (height*cellY/noCellsY) + height/(2*noCellsY)]
  },

  rowIsWon: function ( gameState, row ){
    var winner = this.getGobblet( gameState, "board", row, 0 )
    if (winner === null){
      return null
    }
    else{
      for (var col = 0; col < 4; col++){
        var gobblet = this.getGobblet( gameState, "board", row, col )
        if (gobblet === null){
          return null
        }
        else if (gobblet.player !== winner.player){
          return null
        }
      }
    }
    return winner
  },

  colIsWon: function (gameState, col){
    var winner = this.getGobblet( gameState, "board", 0, col )
    if (winner === null){
      return null
    }
    else{
      for (var row = 0; row < 4; row++){
        var gobblet = this.getGobblet( gameState, "board", row, col )
        if (gobblet === null){
          return null
        }
        else if (gobblet.player !== winner.player){
          return null
        }
      }
    }
    return winner
  },

  isWon: function(gameState, row, col){
    var rowWin = this.rowIsWon(gameState, row)
    var colWin = this.colIsWon(gameState, col)
    if (rowWin !== null || colWin !== null){
      return true
    }
    return false
  }
}

export default GameManager

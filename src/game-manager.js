const GameManager = {

  produceGobblet: function(player, color, size){
    var gobblet = {player: player, color: color, size: size}
    return gobblet
  },

  pushRandomGobblets: function( p1Dimensions, p2Dimensions, boardDimensions ){
      var gameStateCopy = this.getInitialGameState(p1Dimensions, p2Dimensions, boardDimensions)
      const sizes = [10, 30, 50]

      for (var i = 0; i<7; i++){
        var size = Math.floor(Math.random()*3)
        var l = Math.floor(Math.random()*3)
        var x = Math.floor(Math.random()*4)
        var y = Math.floor(Math.random()*4)
        var gobblet = this.produceGobblet(0, "#3287a8", sizes[size])
        gameStateCopy = this.pushGobblet(gameStateCopy, "board", x, y, gobblet)
      }
      return gameStateCopy
  },

  getInitialGameState: function( p1Dimensions, p2Dimensions, boardDimensions, p1_color, p2_color, gobbletSizes ){
    const initGameState = {
      board:
      {
        state:[
          [ [],[],[],[] ],
          [ [],[],[],[] ],
          [ [],[],[],[] ],
          [ [],[],[],[] ]],
        dimensions: boardDimensions
      },

      p1:
      {
        state: [ [ [], [], [] ] ],
        dimensions: p1Dimensions
      },

      p2:
      {
        state: [ [ [], [], [] ] ],
        dimensions: p2Dimensions
      }
    }

    for (var i = 0; i < 3; i++){
      for (var j = 0; j < 3; j++){
        initGameState["p1"].state[0][i].push(this.produceGobblet("p1", p1_color, gobbletSizes[j]))
        initGameState["p2"].state[0][i].push(this.produceGobblet("p2", p2_color, gobbletSizes[j]))
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
    var [gameStateCopy, gobblet] = this.popGobblet(gameState, name1, x1, y1)
    gameStateCopy = this.pushGobblet(gameStateCopy, name2, x2, y2, gobblet)
    return gameStateCopy
  },

  moveIsLegal: function( gameState, name1, name2, x1, y1, x2, y2 ){
    /*
    Legal moves:
    1. From player mat to empty square on board, unless 3.
    2. From emptry square on board to any empty square on board, or square with a smaller gobblet
    3. If an enemy player has a row of 3 gobblets
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
  }
}

export default GameManager

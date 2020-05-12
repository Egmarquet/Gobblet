import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import Game from './game.js'
import GameManager from './game-manager.js'
import io from 'socket.io-client';

const socket = io('https://gobblet.herokuapp.com/', {autoConnect: false, 'force new connection': true})
const gameManager = GameManager

const Main = () => {
  // Game Sizes
  const [height, setHeight] = useState(300)
  const [padding, setPadding] = useState(5)

  // Tracking lobby state
  const connected = useRef(false)
  const [sID, setSID] = useState(null)
  const [roomID, setRoomID] = useState(null)
  const [status, setStatus] = useState(null)
  const [joinLobbyField, setJoinLobbyField] = useState("")

  //Tracking gamestates
  const [player, setPlayer] = useState(null)
  const [isPlayersTurn, setIsPlayersTurn] = useState(false)
  const [gameState, setGameState] = useState(gameManager.getInitialGameState(height, padding))
  const currentTurn = useRef(0)

  const makeMove = (move) => {
    const payload =  {move: move, sender: player, roomID:roomID, turn: currentTurn.current+1}
    makeNewMove(payload)
    socket.emit("make_move", payload)
  }

  const makeNewMove = (data) => {
    //Only u pdate on new move
    if (data.turn === currentTurn.current+1){
      currentTurn.current = currentTurn.current+1
      const move = data.move
      const boardStateCopy = gameManager.moveGobblet(gameState, move[0], move[3], move[1], move[2], move[4], move[5])
      setGameState(boardStateCopy)
      if (data.sender === player){
        setIsPlayersTurn(false)
      }
      else{
        setIsPlayersTurn(true)
      }
    }
  }

  const setWinner = (winner) => {
    if (winner) {
      disconnect(winner)
    }
  }
  // ------------------------------------------------- //
  // Lobby state connectivity
  // ------------------------------------------------- //
  useEffect( () => {
    if (connected){
      socket.on("connection_accepted", (data) => {
        setSID(data)
      })
      socket.on("get_move", (data) => {
        if (player && data.sender !== player && status === "active"){
          makeNewMove(data)
        }
      })
      // Main setting for getting gamestate updates
      socket.on("lobby_status", (data) => {
        setStatus(data.status)
        setRoomID(data.roomID)
        if (data.p1ID === sID){
          setPlayer("p1")
        }
        else if (data.p2ID === sID){
          setPlayer("p2")
        }

        if (status === "waiting" && data.status === "active" && player === "p1"){
          setIsPlayersTurn(true)
        }

        else if(data.status === "dne"){
          disconnect("dne")
        }

        else if(data.status === "disconnected"){
          disconnect("disconnected")
        }

        else if (data.status === "full"){
          disconnect("full")
        }
      })
    }
  })

  const connect = () =>  {
    setStatus("connecting")
    connected.current = true
    socket.connect()
  }

  const disconnect = (status) => {
    // REsetting socket stuff
    socket.disconnect()
    socket.removeAllListeners()
    connected.current = false
    setSID(null)
    setRoomID(null)
    setStatus(status)

    // Resetting game state
    setPlayer(null)
    setIsPlayersTurn(false)
    currentTurn.current = 0
    setGameState(gameManager.getInitialGameState(height, padding))
  }

  const createLobby = () => {
    connect()
    socket.emit("create_lobby")
  }

  const joinLobby = () => {
    connect()
    socket.emit("join_lobby", {roomID: joinLobbyField})
  }

  return(
    <div>
      <div>
        <Game
          height = {height}
          padding = {padding}
          gameManager = {gameManager}
          gameState = {gameState}
          makeMove = {makeMove}
          player = {player}
          isPlayersTurn = {isPlayersTurn}
          setWinner = {setWinner}
        />
      </div>
      <button onClick={(e) => createLobby()}> Create lobby </button>
      <div>
        {"status: "+ status}
      </div>

      <div>
        {"room id: "+ roomID}
      </div>

      <div>
        {"sid: " +sID}
      </div>

      <div>
        {"player: " +player}
      </div>
      <div>
        {"turn: " + currentTurn.current}
      </div>


      <div>
        <button onClick={(e) => joinLobby()}>Join</button>
        <input value={joinLobbyField} onChange={(e) => {setJoinLobbyField(e.target.value)}}/>
      </div>
      <div><button onClick={(e) => disconnect(null)}>disconnect</button></div>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);

import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import GameManager from './game-manager.js'
import Game from './game.js'
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {autoConnect: false})

const Main = () => {

  const [sID, setSID] = useState(null)
  const [roomID, setRoomID] = useState(null)
  const [joinLobbyField, setJoinLobbyField] = useState("")

  const [player, setPlayer] = useState(null)
  const [lobbyID, setLobbyID] = useState("")

  useEffect( () => {
    socketListener()
  })

  const socketListener = () => {

    socket.on("connection_accepted", (data) => {
      setSID(data)
    })

    socket.on("new_lobby", (data) => {
      setLobbyID(data.roomID)
    })

    socket.on("retrieve_all_users", (data) => {
      console.log(data)
    })

    socket.on("lobby_status", (data)=>{
      console.log("in lobby:", data)
    })
  }

  const get_all_users = () => {
    socket.emit('get_all_users')
  }

  const createLobby = () => {
    socket.emit("create_lobby")
  }

  const joinLobby = (roomID, color) => {
    socket.emit("join_lobby", {roomid: roomID, color: color})
  }

  return(
    <div>
      <Game/>
      <span> sid: {sID} </span>
      <button onClick={(e) => get_all_users()}> Get all users </button>
      <button onClick={(e) => createLobby()}> Create lobby </button>
      <button> Join lobby </button>
      <input value={joinLobbyField} onChange={(e) => {setJoinLobbyField(e.target.value)}}/>
      {"lobby id: "+ lobbyID}
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);

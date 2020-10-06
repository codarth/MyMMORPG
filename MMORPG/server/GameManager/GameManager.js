import PlayerModel from './PlayerModel';

export default class GameManager {
  constructor(io) {
    this.io = io;
    this.spawners = {};
    this.chests = {};
    this.monsters = {};
    this.players = {};

    this.playerLocations = [[50, 50], [100, 100]];
    this.chestLocations = {};
    this.monsterLocations = {};
  }

  setup() {
    this.parseMapDate();
    this.setupEventListeners();
    this.setupSpawner();
  }

  parseMapDate() { }

  setupEventListeners() {
    this.io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        delete this.players[socket.id];
        this.io.emit('disconnect', socket.id);
      });

      socket.on('newPlayer', () => {
        this.spawnPlayer(socket.id);

        socket.emit('currentPlayers', this.players);
        socket.emit('currentMonsters', this.monsters);
        socket.emit('currentChests', this.chests);

        socket.broadcast.emit('spawnPlayer', this.players[socket.id]);
      });

      console.log('player connected');
      console.log(socket.id);
    });
  }

  setupSpawner() {

  }

  spawnPlayer(playerId) {
    const player = new PlayerModel(playerId, this.playerLocations);
    this.players[playerId] = player;
  }
}
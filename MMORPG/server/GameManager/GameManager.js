import PlayerModel from './PlayerModel';
import * as levelData from '../public/assets/level/large_level.json';


export default class GameManager {
  constructor(io) {
    this.io = io;
    this.spawners = {};
    this.chests = {};
    this.monsters = {};
    this.players = {};

    this.playerLocations = [];
    this.chestLocations = {};
    this.monsterLocations = {};
  }

  setup() {
    this.parseMapDate();
    this.setupEventListeners();
    this.setupSpawner();
  }

  parseMapDate() {
    this.levelData = levelData;
    this.levelData.layers.forEach((layer) => {
      if(layer.name === 'player_locations' ) {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x, obj.y]);
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
          }else {
            this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach((obj) => {
          if (this.chestLocations[obj.properties.spawner]) {
            this.chestLocations[obj.properties.spawner].push([obj.x, obj.y]);
          }else {
            this.chestLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      }
    });
   }

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

      socket.on('playerMovement', (playerData) => {
          if (this.players[socket.id]) {
            this.players[socket.id].x = playerData.x;
            this.players[socket.id].y = playerData.y;
            this.players[socket.id].flipX = playerData.flipX;
            this.players[socket.id].playerAttacking = playerData.playerAttacking;
            this.players[socket.id].currentDirection = playerData.currentDirection;

            this.io.emit('playerMoved', this.players[socket.id]);
        }
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

import jwt from 'jsonwebtoken';
import PlayerModel from './PlayerModel';
import * as levelData from '../public/assets/level/large_level.json';
import Spawner from './Spawner';
import { SpawnerType } from './utils';
import ChatModel from '../models/ChatModel';

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
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
  }

  parseMapData() {
    this.levelData = levelData;
    this.levelData.layers.forEach((layer) => {
      if (layer.name === 'player_locations') {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x, obj.y]);
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach((obj) => {
          if (this.chestLocations[obj.properties.spawner]) {
            this.chestLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
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

      socket.on('newPlayer', (token, frame) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const { name } = decoded.user;

          this.spawnPlayer(socket.id, name, frame);

          socket.emit('currentPlayers', this.players);
          socket.emit('currentMonsters', this.monsters);
          socket.emit('currentChests', this.chests);

          socket.broadcast.emit('spawnPlayer', this.players[socket.id]);
        } catch (error) {
          console.log(error.message);
          socket.emit('invalidToken');
        }
      });

      socket.on('sendMessage', async (message, token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const { name, email } = decoded.user;

          await ChatModel.create({ email, message });

          this.io.emit('newMessage', {
            message,
            name,
            frame: this.players[socket.id].frame,
          });
        } catch (error) {
          console.log(error.message);
          socket.emit('invalidToken');
        }
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

      socket.on('pickupChest', (chestId) => {
        if (this.chests[chestId]) {
          const { gold } = this.chests[chestId];
          this.players[socket.id].updateGold(gold);
          socket.emit('updateScore', this.players[socket.id].gold);
          this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
        }
      });

      socket.on('monsterAttacked', (monsterId) => {
        if (this.monsters[monsterId]) {
          const { gold, attack } = this.monsters[monsterId];

          this.monsters[monsterId].loseHealth();
          if (this.monsters[monsterId].health <= 0) {
            this.players[socket.id].updateGold(gold);
            socket.emit('updateScore', this.players[socket.id].gold);

            this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
            this.io.emit('monsterRemoved', monsterId);

            this.players[socket.id].updateHealth(3);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);
          } else {
            this.players[socket.id].updateHealth(-attack);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);

            this.io.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);

            if (this.players[socket.id].health <= 0) {
              this.players[socket.id].updateGold(parseInt(-this.players[socket.id].gold / 2, 10));
              socket.emit('updateScore', this.players[socket.id].gold);

              this.players[socket.id].respawn(this.players);
              this.io.emit('respawnPlayer', this.players[socket.id]);
            }
          }
        }
      });

      socket.on('attackedPlayer', (attackedPlayerId) => {
        if (this.players[attackedPlayerId]) {
          const { gold } = this.players[attackedPlayerId];

          this.players[attackedPlayerId].updateHealth(-1);

          if (this.players[attackedPlayerId].health <= 0) {
            this.players[socket.id].updateGold(gold);

            this.players[attackedPlayerId].respawn(this.players);
            this.io.emit('respawnPlayer', this.players[attackedPlayerId]);

            socket.emit('updateScore', this.players[socket.id].gold);
            this.players[attackedPlayerId].updateGold(-gold);
            this.io.to(`${attackedPlayerId}`).emit('updateScore', this.players[attackedPlayerId].gold);

            this.players[socket.id].updateHealth(2);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);
          } else {
            this.io.emit('updatePlayerHealth', attackedPlayerId, this.players[attackedPlayerId].health);
          }
        }
      });

      // player connected to our game
      console.log('player connected to our game');
      console.log(socket.id);
    });
  }

  setupSpawners() {
    const config = {
      spawnInterval: 3000,
      limit: 3,
      spawnerType: SpawnerType.CHEST,
      id: '',
    };
    let spawner;

    Object.keys(this.chestLocations).forEach((key) => {
      config.id = `chest-${key}`;

      spawner = new Spawner(
        config,
        this.chestLocations[key],
        this.addChest.bind(this),
        this.deleteChest.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });

    Object.keys(this.monsterLocations).forEach((key) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        this.monsterLocations[key],
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });
  }

  spawnPlayer(playerId, name, frame) {
    const player = new PlayerModel(playerId, this.playerLocations, this.players, name, frame);
    this.players[playerId] = player;
  }

  addChest(chestId, chest) {
    this.chests[chestId] = chest;
    this.io.emit('chestSpawned', chest);
  }

  deleteChest(chestId) {
    delete this.chests[chestId];
    this.io.emit('chestRemoved', chestId);
  }

  addMonster(monsterId, monster) {
    this.monsters[monsterId] = monster;
    this.io.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId) {
    delete this.monsters[monsterId];
    this.io.emit('monsterRemoved', monsterId);
  }

  moveMonsters() {
    this.io.emit('monsterMovement', this.monsters);
  }
}

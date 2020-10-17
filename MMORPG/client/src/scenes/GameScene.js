import * as Phaser from 'phaser';
import PlayerContainer from '../classes/Player/PlayerContainer';
import Chest from '../classes/Chest';
import Monster from '../classes/Monster';
import GameMap from '../classes/GameMap';
import { getCookie } from '../utils/utils';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('Ui');

    this.socket = this.sys.game.globals.socket;

    this.listenForSocketEvents();
  }

  listenForSocketEvents() {
    this.socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((id) => {
        if (players[id].id === this.socket.id) {
          this.createPlayer(players[id], true);
          this.addCollisions();
        } else {
          this.createPlayer(players[id], false);
        }
      });
    });

    this.socket.on('currentMonsters', (monsters) => {
      Object.keys(monsters).forEach((id) => {
        this.spawnMonster(monsters[id]);
      });
    });

    this.socket.on('currentChests', (chests) => {
      Object.keys(chests).forEach((id) => {
        this.spawnChest(chests[id]);
      });
    });

    this.socket.on('spawnPlayer', (player) => {
      this.createPlayer(player, false);
    });

    this.socket.on('playerMoved', (player) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (player.id === otherPlayer.id) {
          otherPlayer.flipX = player.flipX;
          otherPlayer.setPosition(player.x, player.y);
          otherPlayer.updateHealthBar();
          otherPlayer.updateFlipX();
          otherPlayer.playerAttacking = player.playerAttacking;
          otherPlayer.currentDirection = player.currentDirection;
          if (player.playerAttacking) {
            otherPlayer.attack();
          }
        }
      });
    });

    this.socket.on('chestSpawned', (chest) => {
      this.spawnChest(chest);
    });

    this.socket.on('monsterSpawned', (monster) => {
      this.spawnMonster(monster);
    });

    this.socket.on('chestRemoved', (chestId) => {
      this.chests.getChildren().forEach((chest) => {
        if (chest.id === chestId) {
          chest.makeInactive();
        }
      });
    });

    this.socket.on('monsterRemoved', (monsterId) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.makeInactive();
          this.monsterDeathAudio.play();
        }
      });
    });

    this.socket.on('monsterMovement', (monsters) => {
      this.monsters.getChildren().forEach((monster) => {
        Object.keys(monsters).forEach((monsterId) => {
          if (monster.id === monsterId) {
            this.physics.moveToObject(monster, monsters[monsterId], 40);
          }
        });
      });
    });

    this.socket.on('updateScore', (goldAmount) => {
      this.events.emit('updateScore', goldAmount);
    });

    this.socket.on('updateMonsterHealth', (monsterId, health) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.updateHealth(health);
        }
      });
    });

    this.socket.on('updatePlayerHealth', (playerId, health) => {
      if (this.player.id === playerId) {
        if (health < this.player.health) {
          this.playerDamageAudio.play();
        }
        this.player.updateHealth(health);
      } else {
        this.otherPlayers.getChildren().forEach((player) => {
          if (player.id === playerId) {
            player.updateHealth(health);
          }
        });
      }
    });

    this.socket.on('respawnPlayer', (playerObject) => {
      if (this.player.id === playerObject.id) {
        this.playerDeathAudio.play();
        this.player.respawn(playerObject);
      } else {
        this.otherPlayers.getChildren().forEach((player) => {
          if (player.id === playerObject.id) {
            player.respawn(playerObject);
          }
        });
      }
    });

    this.socket.on('disconnect', (playerId) => {
      this.otherPlayers.getChildren().forEach((player) => {
        if (playerId === player.id) {
          player.cleanUp();
        }
      });
    });

    this.socket.on('invalidToken', () => {
      window.alert('Token is no longer valid. Please login again');
      window.location.reload();
    });
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();

    this.socket.emit('newPlayer', getCookie('jwt'));
  }

  update() {
    if (this.player) {
      this.player.update(this.cursors);
    }

    if (this.player) {
      const {
        x, y, flipX, playerAttacking, currentDirection,
      } = this.player;
      if (this.player.oldPosition && (x !== this.player.oldPosition.x
        || y !== this.player.oldPosition.y
        || flipX !== this.player.oldPosition.flipX
        || playerAttacking !== this.player.oldPosition.playerAttacking)) {
        this.socket.emit('playerMovement', {
          x, y, flipX, playerAttacking, currentDirection,
        });
      }

      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y,
        flipX: this.player.flipX,
        playerAttacking: this.player.playerAttacking,
      };
    }
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 1 });
    this.monsterDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 1 });
    this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.5 });
    this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 1 });
    this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 1 });
  }

  createPlayer(playerObject, mainPlayer) {
    const newPlayerObject = new PlayerContainer(
      this,
      playerObject.x * 2,
      playerObject.y * 2,
      'characters',
      0,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
      mainPlayer,
    );

    if (!mainPlayer) {
      this.otherPlayers.add(newPlayerObject);
    } else {
      this.player = newPlayerObject;
    }
  }

  createGroups() {
    this.chests = this.physics.add.group();
    this.monsters = this.physics.add.group();
    this.monsters.runChildUpdate = true;
    this.otherPlayers = this.physics.add.group();
    this.otherPlayers.runChildUpdate = true;
  }

  spawnChest(chestObject) {
    let chest = this.chests.getFirstDead();
    if (!chest) {
      chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
      this.chests.add(chest);
    } else {
      chest.coins = chestObject.gold;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x * 2, chestObject.y * 2);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject) {
    let monster = this.monsters.getFirstDead();
    if (!monster) {
      monster = new Monster(
        this,
        monsterObject.x,
        monsterObject.y,
        'monsters',
        monsterObject.frame,
        monsterObject.id,
        monsterObject.health,
        monsterObject.maxHealth,
      );
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture('monsters', monsterObject.frame);
      monster.setPosition(monsterObject.x, monsterObject.y);
      monster.makeActive();
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addCollisions() {
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    this.physics.add.collider(this.otherPlayers, this.player, this.pvpCollider, false, this);
    this.physics.add.overlap(this.player.weapon, this.otherPlayers,
      this.weaponOverlapEnemy, false, this);
  }

  pvpCollider(player, otherPlayer) {
    this.player.body.setVelocity(0);
    otherPlayer.body.setVelocity(0);
  }

  weaponOverlapEnemy(player, enemyPlayer) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.socket.emit('attackedPlayer', enemyPlayer.id);
    }
  }

  collectChest(player, chest) {
    this.goldPickupAudio.play();
    this.socket.emit('pickupChest', chest.id);
  }

  enemyOverlap(weapon, enemy) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.socket.emit('monsterAttacked', enemy.id);
    }
  }

  createMap() {
    this.gameMap = new GameMap(this, 'map', 'background', 'background', 'blocked');
  }
}

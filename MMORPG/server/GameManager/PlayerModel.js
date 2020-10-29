export default class PlayerModel {
  constructor(playerId, spawnLocations, players, name, frame) {
    this.id = playerId;
    this.health = 10;
    this.maxHealth = 10;
    this.gold = 0;
    this.playerAttacking = false;
    this.flipX = true;
    this.spawnLocations = spawnLocations;
    this.playerName = name;
    this.frame = frame;

    const location = this.generateLocation(players);
    [this.x, this.y] = location;
  }

  updateGold(gold) {
    this.gold += gold;
  }

  updateHealth(health) {
    this.health += health;
    if (this.health > 10) this.health = this.maxHealth;
  }

  respawn(players) {
    this.health = this.maxHealth;
    const location = this.generateLocation(players);
    this.x = location[0] * 2;
    this.y = location[1] * 2;
  }

  generateLocation(players) {
    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    const invalidLocation = Object.keys(players).some((key) => {
      if (players[key].x === location[0] && players[key].y === location[1]) {
        return true;
      }
      return false;
    });
    if (invalidLocation) return this.generateLocation(players);
    return location;
  }
}

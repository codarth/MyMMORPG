import v4 from 'uuid/v4';

export default class ItemModel {
  constructor(x, y, spawnerId, name, frame, attackValue, defenceValue, healthValue) {
    this.id = `${spawnerId}-${v4()}`;
    this.spawnerId = spawnerId;
    this.x = x;
    this.y = y;
    this.name = name;
    this.frame = frame;
    this.attackBonus = attackValue;
    this.defenceBonus = defenceValue;
    this.healthBonus = healthValue;
  }
}

export default class GameMap {
  constructor(scene, key, tileSetName, bgLayerName, blockedLayerName) {
    this.scene = scene;
    this.key = key;
    this.tileSetName = tileSetName;
    this.bgLayerName = bgLayerName;
    this.blockedLayerName = blockedLayerName;

    this.createMap();
  }

  createMap() {
    this.tileMap = this.scene.make.tilemap({ key: this.key });
    this.tiles = this.tileMap.addTilesetImage(this.tileSetName, this.tileSetName, 32, 32, 1, 2);
    this.backgroundLayer = this.tileMap.createStaticLayer(this.bgLayerName, this.tiles, 0, 0);
    this.backgroundLayer.setScale(2);

    this.blockedLayer = this.tileMap.createStaticLayer(this.blockedLayerName, this.tiles, 0, 0);
    this.blockedLayer.setScale(2);
    this.blockedLayer.setCollisionByExclusion([-1]);

    this.scene.physics.world.bounds.width = this.tileMap.widthInPixels * 2;
    this.scene.physics.world.bounds.height = this.tileMap.heightInPixels * 2;

    this.scene.cameras.main.setBounds(
      0,
      0,
      this.tileMap.widthInPixels * 2,
      this.tileMap.heightInPixels * 2,
    );
  }
}

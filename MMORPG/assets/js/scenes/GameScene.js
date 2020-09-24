class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');        
    }

    init(){
        this.scene.launch('Ui');
        this.score = 0;
    }

    create(){
        this.createMap();
        this.createAudio();
        this.createPlayer();
        this.createChest();
        this.createInput();
        this.addCollisions();
    }
    
    update() {
        this.player.update(this.cursors);
    }
    
    createAudio(){
        this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 1});            
    }
    
    createPlayer(){
        this.player = new Player(this, 224, 224, 'characters', 0);
    }
    
    createChest(){
        this.chests = this.physics.add.group();

        this.chestPositions = [[100, 100], [200, 200], [300, 300], [400, 400], [500, 500]];

        this.maxChests = 3;
        for(let i = 0; i < this.maxChests; i++){
            this.spawnChest();            
        }
    }

    spawnChest(){
        const location = this.chestPositions[Math.floor(Math.random() * this.chestPositions.length)];

        let chest = this.chests.getFirstDead();
        if(!chest){
            const chest = new Chest(this, location[0], location[1], 'items', 0);
            this.chests.add(chest);
        } else {
            chest.setPosition(location[0], location[1]);
            chest.makeActive();
        }
    }
    
    createInput(){
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    addCollisions(){
        this.physics.add.collider(this.player, this.map.blockedLayer);
        this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    }

    collectChest(player, chest){
        this.goldPickupAudio.play();
        this.score += chest.coins;
        this.events.emit('updateScore', this.score);
        chest.makeInactive();      
        
        this.time.delayedCall(1000, this.spawnChest, [], this);
    }

    createMap(){
        this.map = new Map(this, 'map', 'background', 'background', 'blocked');
    }
}
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 0,
            },
        },
    },
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('button1', 'assets/images/ui/blue_button01.png');
    this.load.spritesheet('items', 'assets/images/items.png', { frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('characters', 'assets/images/characters.png', { frameWidth: 32, frameHeight: 32});
}

function create() {
    var button = this.add.image(100, 100, 'button1'); // No animation on image
    button.setOrigin(0.5, 0.5);

    this.add.sprite(300,100,'button1'); // Animation available on sprite

    this.add.image(300, 300, 'items', 4);
    
    this.physics.add.image(500, 100, 'button1');

    this.player = this.physics.add.image(32, 32, 'characters', 0);
    this.player.setScale(2);

    this.cursors = this.input.keyboard.createCursorKeys();

}

function update() {
    this.player.setVelocity(0);
    
    if(this.cursors.left.isDown){
       this.player.setVelocityX(-160);
    } else if(this.cursors.right.isDown){
        this.player.setVelocityX(160);
    }

    if(this.cursors.up.isDown){
        this.player.setVelocityY(-160);
    } else if(this.cursors.down.isDown){
        this.player.setVelocityY(160);
    }
}
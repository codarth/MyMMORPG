import 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: () => {
            console.log('test');
        },
        create,
    },
};

const game = new Phaser.Game(config);

function create(){
    this.add.text(100,200,'hello 1 ');
}
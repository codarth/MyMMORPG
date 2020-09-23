class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');        
    }

    create(){
        // Create title text
        this.TitleText = this.add.text(this.scale.width/2, this.scale.height/2, 'MMORPG', { fontSize: '64px', fill: '#fff'});
        this.TitleText.setOrigin(0.5);

        
        this.startGameButton = new UiButton(this, this.scale.width/2, this.scale.height * 0.65, 'button2', 'button1', 'Start', this.startScene.bind(this, 'Game'));
    }

    startScene(targetScene) {
        this.scene.start(targetScene);
    }
}
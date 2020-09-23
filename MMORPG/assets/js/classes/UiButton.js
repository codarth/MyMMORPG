class UiButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, key, hoverKey, text, targetCallBack) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.key = key;
        this.hoverKey = hoverKey;
        this.text = text;
        this.targetCallBack = targetCallBack;

        this.createButton();
        this.scene.add.existing(this);
    }

    createButton() {
        this.button = this.scene.add.image(0, 0, this.key);
        this.button.setInteractive();
        this.button.setScale(1.4);
        
        this.buttontext = this.scene.add.text(0, 0, this.text, { fontSize: '26px', fill: '#fff'});
        Phaser.Display.Align.In.Center(this.buttontext, this.button);
        
        this.add(this.button);
        this.add(this.buttontext);

        this.button.on('pointerdown', () => {
            this.button.setTexture(this.key);
            this.targetCallBack();
        });
        this.button.on('pointerover', () => {
            this.button.setTexture(this.hoverKey);
        });
        this.button.on('pointerout', () => {
            this.button.setTexture(this.key);
        });
    }
}




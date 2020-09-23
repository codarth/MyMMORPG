class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame){
        super(scene, x, y, key, frame);
        this.scene = scene;
        this.velocity = 160;

        // Enable Physics
        this.scene.physics.world.enable(this);
        // Set immovable if another object collides with player
        this.setImmovable(false);
        // Scale player
        this.setScale(2);
        // Collide with world bounds
        this.setCollideWorldBounds(true);
        // Add player to existing scene
        this.scene.add.existing(this);
    }

    update(cursors){
        this.body.setVelocity(0);
    
        if(cursors.left.isDown){
           this.body.setVelocityX(-this.velocity);
        } else if(cursors.right.isDown){
            this.body.setVelocityX(this.velocity);
        }
    
        if(cursors.up.isDown){
            this.body.setVelocityY(-this.velocity);
        } else if(cursors.down.isDown){
            this.body.setVelocityY(this.velocity);
        }
    }
}
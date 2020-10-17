import * as Phaser from 'phaser';
import { getParam } from '../utils/utils';
import UiButton from '../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // Create title text
    this.TitleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'MMORPG', { fontSize: '64px', fill: '#fff' });
    this.TitleText.setOrigin(0.5);

    this.loginButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65,
      'button2',
      'button1',
      'Login',
      this.startScene.bind(this, 'Login'),
    );
    this.signUpButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.8,
      'button2',
      'button1',
      'Sign Up',
      this.startScene.bind(this, 'SignUp'),
    );

    const resetPasswordSceneCheck = getParam('scene');
    if (resetPasswordSceneCheck && resetPasswordSceneCheck === 'resetPassword') {
      this.startScene('ResetPassword');
    }
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
}

import * as Phaser from 'phaser';
import { getParam } from '../utils/utils';
import UiButton from '../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // Create title text
    this.TitleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'MMORPG', { fontSize: '128px', fill: '#fff' });
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
      this.scale.removeListener('resize', this.resize);
      this.startScene('ResetPassword');
    }

    this.scale.on('resize', this.resize, this);
    this.resize({ height: this.scale.height, width: this.scale.width });
  }

  startScene(targetScene) {
    this.scale.removeListener('resize', this.resize);
    this.scene.start(targetScene);
  }

  resize(gameSize) {
    const { width, height } = gameSize;

    this.cameras.resize(width, height);

    if (width < 1000) {
      this.TitleText.setFontSize('64px');
    } else {
      this.TitleText.setFontSize('128px');
    }

    if (height < 700) {
      this.TitleText.setPosition(width / 2, height * 0.4);
      this.loginButton.setPosition(width / 2, height * 0.55);
      this.signUpButton.setPosition(width / 2, height * 0.7);
      this.loginButton.setScale(0.7);
      this.signUpButton.setScale(0.7);
    } else {
      this.TitleText.setPosition(width / 2, height / 2);
      this.loginButton.setPosition(width / 2, height * 0.65);
      this.signUpButton.setPosition(width / 2, height * 0.75);
      this.loginButton.setScale(1);
      this.signUpButton.setScale(1);
    }
  }
}

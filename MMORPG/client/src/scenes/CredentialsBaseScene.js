import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import {
  createDiv, createLabel, createInputField, createBrElement,
} from '../utils/utils';

export default class SignUpScene extends Phaser.Scene {
  createUi(btn1Text, btn1Target, btn2Text, btn2Target, btn3Text, btn3Target) {
    // Create title text
    this.TitleText = this.add.text(this.scale.width / 2, this.scale.height / 8, 'Uncle Toady\'s MMORPG', { fontSize: '64px', fill: '#fff' });
    this.TitleText.setOrigin(0.5);

    this.button1 = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.60,
      'button2',
      'button1',
      btn1Text,
      btn1Target,
    );

    this.ForgotPasswordButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.75,
      'button2',
      'button1',
      btn2Text,
      btn2Target,
    );

    if (btn3Target && btn3Text) {
      this.BackButton = new UiButton(
        this,
        this.scale.width / 2,
        this.scale.height * 0.90,
        'button2',
        'button1',
        btn3Text,
        btn3Target,
      );
    }
    this.createInput();
  }

  createInput() {
    this.div = createDiv('input-div');
    this.emailLabel = createLabel('login', 'Email:', 'form-label');
    this.emailInput = createInputField('text', 'login', 'login', 'login-input', 'Email Address');
    this.passwordLabel = createLabel('password', 'Password:', 'form-label');
    this.passwordInput = createInputField('password', 'password', 'password', 'login-input');

    this.div.append(this.emailLabel);
    this.div.append(createBrElement());
    this.div.append(this.emailInput);
    this.div.append(createBrElement());
    this.div.append(createBrElement());
    this.div.append(this.passwordLabel);
    this.div.append(createBrElement());
    this.div.append(this.passwordInput);

    document.body.appendChild(this.div);
  }

  startScene(targetScene) {
    window.history.pushState({}, document.title, '/');
    this.div.parentNode.removeChild(this.div);
    this.scene.start(targetScene);
  }
}

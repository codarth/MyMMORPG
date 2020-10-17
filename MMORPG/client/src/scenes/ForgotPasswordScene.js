import CredentialsBaseScene from './CredentialsBaseScene';
import { postData } from '../utils/utils';

export default class ForgotPasswordScene extends CredentialsBaseScene {
  constructor() {
    super('ForgotPassword');
  }

  create() {
    this.createUi(
      'Reset Password', this.resetPassword.bind(this),
      'Back', this.startScene.bind(this, 'Login'),
    );

    this.passwordInput.parentNode.removeChild(this.passwordInput);
    this.passwordLabel.parentNode.removeChild(this.passwordLabel);
  }

  resetPassword() {
    const loginValue = this.emailInput.value;

    if (loginValue) {
      postData(`${SERVER_URL}/forgotpassword`, { email: loginValue }).then((response) => {
        console.log(response.message);
        window.alert('If an account was found, a password reset was sent to the email.');
      }).catch((error) => {
        console.log(error.message);
        window.alert('If an account was found, a password reset was sent to the email.');
      });
    } else {
      window.alert('Please complete all fields.');
    }
  }
}

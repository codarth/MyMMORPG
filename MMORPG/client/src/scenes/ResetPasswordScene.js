import CredentialsBaseScene from './CredentialsBaseScene';
import {
  postData, createLabel, createInputField, createBrElement, getParam,
} from '../utils/utils';

export default class ResetPasswordScene extends CredentialsBaseScene {
  constructor() {
    super('ResetPassword');
  }

  create() {
    this.createUi(
      'Update Password', this.updatePassword.bind(this),
      'Back', this.startScene.bind(this, 'Title'),
    );

    this.createVerifiedPasswordInput();
  }

  createVerifiedPasswordInput() {
    this.verifiedPasswordLabel = createLabel('verifiedPassword', 'Verify Password:', 'form-label');
    this.verifiedPasswordInput = createInputField('password', 'verifiedPassword', 'verifyPassword', 'login-input', 'Verify Password');

    this.div.append(createBrElement());
    this.div.append(createBrElement());
    this.div.append(this.verifiedPasswordLabel);
    this.div.append(createBrElement());
    this.div.append(this.verifiedPasswordInput);
  }

  updatePassword() {
    const token = getParam('token');
    const loginValue = this.emailInput.value;
    const passwordValue = this.passwordInput.value;
    const verifiedPasswordValue = this.verifiedPasswordInput.value;

    if (loginValue
        && passwordValue && verifiedPasswordValue
        && passwordValue === verifiedPasswordValue) {
      postData(`${SERVER_URL}/resetpassword`, {
        token, email: loginValue, password: passwordValue, verifiedpassword: verifiedPasswordValue,
      }).then((response) => {
        console.log(response.message);
        if (response.status === 200) {
          this.startScene('Title');
        } else {
          window.alert(response.message);
        }
      }).catch((error) => {
        console.log(error.message);
        window.alert('We encountered an error.');
      });
    } else {
      window.alert('Passwords must match.');
    }
  }
}

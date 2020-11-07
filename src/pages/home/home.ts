import { Component } from '@angular/core';
import { NavController, IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { CredenciaisDTO } from '../../models/credenciais.dto';
import { AuthService } from '../../services/auth.service';
import { AuthProvider, AuthOptions } from '../../services/auth.types';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  creds: CredenciaisDTO = {
    email: "",
    senha: ""
  };

  configs = {
    isSignIn: true,
    action: 'Login',
    actionChange: 'Create accouunt'
  };

  private nameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  authProviders: AuthProvider;
  authOptions: AuthOptions;
  formGroup: FormGroup;

  private loading: any;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public auth: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private fb: FormBuilder) {
    this.createForm();

  }

  private createForm(): void {
    this.formGroup = this.fb.group({
      email: ['', Validators.required, Validators.email],
      senha: ['', Validators.required, Validators.minLength(6)]
    });
  }

  get email(): FormControl {
    return <FormControl>this.formGroup.get("email");
  }
  get senha(): FormControl {
    return <FormControl>this.formGroup.get("senha");
  }

  ionViewWillEnter() {
    this.menu.swipeEnable(false);
  }

  ionViewDidLeave() {
    this.menu.swipeEnable(true);
  }

  ionViewDidEnter() {
    this.auth.refreshToken()
      .subscribe(response => {
        this.auth.successfulLogin(response.headers.get('Authorization'));
        this.navCtrl.setRoot('CategoriasPage');
      },
        error => { });
  }



  login() {
    this.auth.authenticate(this.creds)
      .subscribe(response => {
        this.auth.successfulLogin(response.headers.get('Authorization'));
        this.navCtrl.setRoot('CategoriasPage');
      },
        error => { });
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }

  changeAction(): void {
    this.configs.isSignIn = !this.configs.isSignIn;
    const { isSignIn } = this.configs;
    this.configs.action = isSignIn ? 'Login' : 'Sign Up';
    this.configs.actionChange = isSignIn ? 'Create account' : 'Already have an account';
    !isSignIn
      ? this.formGroup.addControl('name', this.nameControl)
      : this.formGroup.removeControl('name');
  }

  async onSubmit(provider: AuthProvider): Promise<void> {
    try {
      const credentials = await this.auth.autenticar({
        isSignIn: this.configs.isSignIn,
        cliente: this.formGroup.value,
        provider
      });
      console.log('Autenticado: ', credentials);
    } catch (e) {
      console.log('Auth: error: ', e);
    }

  }
}

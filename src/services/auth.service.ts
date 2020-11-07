import { Injectable } from "@angular/core";
import { CredenciaisDTO } from "../models/credenciais.dto";
import { API_CONFIG } from "../configs/api.config";
import { LocalUser } from "../models/localUser";
import { StorageService } from "./storage.service";
import { JwtHelper } from 'angular2-jwt';
import { HttpClient } from "@angular/common/http";
import { CartService } from "./domain/cart.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from "firebase/app";
import { Cliente, AuthProvider, AuthOptions } from "./auth.types";
import { Observable } from "rxjs";
import { map } from "rxjs/operators/map";


@Injectable()
export class AuthService {

    jwtHelper: JwtHelper = new JwtHelper();
    authState$: Observable<firebase.User>;

    constructor(
        public http: HttpClient, 
        public storage: StorageService,
        public cartService: CartService,
        private fireAuth: AngularFireAuth) {
            this.authState$ = fireAuth.authState;
    }

    authenticate(creds : CredenciaisDTO) {
        return this.http.post(
            `${API_CONFIG.baseUrl}/login`, 
            creds,
            {
                observe: 'response',
                responseType: 'text'
            });
    }

    refreshToken() {
        return this.http.post(
            `${API_CONFIG.baseUrl}/auth/refresh_token`, 
            {},
            {
                observe: 'response',
                responseType: 'text'
            });
    }

    successfulLogin(authorizationValue : string) {
        let tok = authorizationValue.substring(7);
        let user : LocalUser = {
            token: tok,
            email: this.jwtHelper.decodeToken(tok).sub
        };
        this.storage.setLocalUser(user);
        this.cartService.createOrClearCart();
    }

    logout() {
        this.storage.setLocalUser(null);
    }


    private signInWithEmail({email, senha}: Cliente): Promise<auth.UserCredential>{
        return this.fireAuth.signInWithEmailAndPassword(email, senha);
    }
    private signUpWithEmail({email, senha, name}: Cliente ): Promise<auth.UserCredential>{
        return this.fireAuth
        .createUserWithEmailAndPassword(email, senha)
        .then(credentials => 
            credentials.user
            .updateProfile({displayName: name, photoURL: null})
            .then(() => credentials)
            );
    }


    //Login com redes sociais
    private signInPopUp(provider: AuthProvider): Promise<auth.UserCredential>{
        let signInProvider = null;
        switch (provider) {
            case AuthProvider.Facebook:
                signInProvider = new auth.FacebookAuthProvider(); 
            break;
            case AuthProvider.Google:
                signInProvider = new auth.GoogleAuthProvider();
            break;
            case AuthProvider.Twitter:
                signInProvider = new auth.TwitterAuthProvider();
            break;
        }
        return this.fireAuth.signInWithPopup(signInProvider);
    }

    autenticar ({isSignIn, provider, cliente}: AuthOptions): Promise<auth.UserCredential>{
        let operation: Promise<auth.UserCredential>;
        if (provider != AuthProvider.Email){
            operation = this.signInPopUp(provider);
        } else {
            operation = isSignIn ? this.signInWithEmail(cliente): this.signUpWithEmail(cliente);
        }
        return operation;
    }

   //redes sociais 
    logOut (): Promise<void>{
        return this.fireAuth.signOut();

    }

    get isAuthenticated(): Observable<boolean>{
        return this.authState$.pipe(map(user => user != null));
    }
}
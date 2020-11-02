import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageService } from '../../services/storage.service';
import { ClienteDTO } from '../../models/cliente.dto';
import { API_CONFIG } from '../../configs/api.config';
import { ClienteService } from '../../services/domain/cliente.service';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  cliente: ClienteDTO;

  constructor(public navCtrl: NavController, public navParams: NavParams,     public storage: StorageService,
    public clienteService: ClienteService) {
  }

  ionViewDidLoad() {
    let localUser = this.storage.getLocalUser();
    if (localUser && localUser.email){
      this.clienteService.findByEmail(localUser.email)
        .subscribe(response => {
          this.cliente = response;
          console.log("URL das imagens: ", `${API_CONFIG.bucketClientes}`);
          console.log("info cliente: ", "/cp$" , this.cliente.id, ".jpg");
          this.getImageIfExists();
        },
        error => {});

    }
  }

  getImageIfExists() {
    this.clienteService.getImageFromBucket(this.cliente.id)
    .subscribe(response => {
     
      this.cliente.imageUrl = `${API_CONFIG.bucketClientes}/cp${this.cliente.id}.jpg`;
    },
    error => {});
  }

}

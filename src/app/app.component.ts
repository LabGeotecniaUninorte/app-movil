import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Observable } from 'rxjs/Observable';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { FormViewerPage } from '../pages/form-viewer/form-viewer';
import { Categoria } from '../models/categoria';
import { CategoriasProvider } from '../providers/fire/categorias';
import { FormListPage } from '../pages/form-list/form-list';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{ title: string, component: any }>;
  categorias: Categoria[] = new Array<Categoria>();

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public cp: CategoriasProvider,
    private alertCtrl: AlertController,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#363636');

      // load categories in the sidebar
      this.loadCategorias();

      // this.splashScreen.hide();
    });
  }

  openPage(categoria) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    //this.nav.setRoot(page.component);

    // use categoria ID in the page and send it to the form-list component
    this.nav.setRoot(FormListPage, { categoria: categoria });

  }

  /* 
    TODO: analizar estado de conexion antes de listar catergorias
    En caso de no haber conexion, mostrar modal de conexion
    Crear nuevo modal que informe que, aunque haya conexion, no se encontraron categorias
  */

  loadCategorias() {
    let categoriasObservable = this.cp.fetch();
    categoriasObservable.subscribe(
      data => {
        data.forEach(categoria => {
          if (categoria.payload.doc.data()['active']) {
            this.categorias.push({
              id: categoria.payload.doc.id, ...categoria.payload.doc.data()
            })
          }
        });
        this.splashScreen.hide();
      },
      error => {
        this.showReloadAlert();
      }
    );
  }

  showReloadAlert() {
    let alert = this.alertCtrl.create({
      title: 'Problemas de conexión',
      message: 'Tenemos problemas para conectar con el servidor. ¿desea reintentar?',
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          handler: () => {
            this.platform.exitApp();
          }
        },
        {
          text: 'Reintentar',
          handler: () => {
            this.splashScreen.show();
            this.loadCategorias();
          }
        }
      ]
    });
    alert.present();
  }
}

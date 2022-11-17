import { BrowserModule } from '@angular/platform-browser';
import { NgModule  } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { SectionComponent } from './pages/section/section.component';
import { FormsModule } from '@angular/forms';


import { environment } from '../environments/environment';

import { HttpClientModule } from '@angular/common/http';

import { RouterModule } from '@angular/router';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { PerfilComponent } from './perfil/perfil.component';
import { DireccionesComponent } from './perfil/direcciones/direcciones.component';

import { AgmCoreModule } from '@agm/core';
import { RestauranteComponent } from './restaurante/restaurante.component';
import { OpcionesAgregarComponent } from './restaurante/opciones-agregar/opciones-agregar.component';
import { PedidoComponent } from './perfil/pedido/pedido.component';
import { ProductosComponent } from './restaurante/productos/productos.component';
import { OutComponent } from './perfil/out/out.component';
import { CarniceriaComponent } from './carniceria/carniceria.component';
import { AgregarComponent } from './carniceria/agregar/agregar.component';
import { TerminoscondicionesComponent } from './pages/terminoscondiciones/terminoscondiciones.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { PagoonlineComponent } from './pages/pagoonline/pagoonline.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SectionComponent,
    PerfilComponent,
    DireccionesComponent,
    RestauranteComponent,
    OpcionesAgregarComponent,
    PedidoComponent,
    ProductosComponent,
    OutComponent,
    CarniceriaComponent,
    AgregarComponent,
    TerminoscondicionesComponent,
    PrivacidadComponent,
    PagoonlineComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFirestoreModule,
    AngularFireMessagingModule,

    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyArFoR674RvS12WQ0EEY-LRXSdsdjAkTkQ',
      libraries: ['places']
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

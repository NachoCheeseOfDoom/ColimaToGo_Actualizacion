import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilComponent } from './perfil/perfil.component';
import { SectionComponent } from './pages/section/section.component';
import { DireccionesComponent } from './perfil/direcciones/direcciones.component';
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


const routes: Routes = [
  { path: 'perfil', component:  PerfilComponent},
  { path: 'paiment/:idCarrito', component:  PagoonlineComponent},
  { path: 'terminos&condiciones', component:  TerminoscondicionesComponent},
  { path: 'aviso', component:  PrivacidadComponent},
  { path: 'perfil/direcciones', component:  DireccionesComponent},
  { path: 'perfil/:idPedido', component:  PedidoComponent},
  { path: 'restaurante2/:nombre', component:  RestauranteComponent},
  { path: 'restaurante/:nombre', component:  ProductosComponent},
  { path: 'r/:nombre', component:  ProductosComponent},
  { path: 'carniceria/:nombreCarniceria', component:  CarniceriaComponent},
  { path: 'carniceria/:nombreCarniceria/:idProducto', component:  AgregarComponent},
  { path: 'out', component:  OutComponent},
  { path: 'payment/:idCarrito', component:  PagoonlineComponent},
  { path: 'restaurante/:nombre/:idProducto', component:  OpcionesAgregarComponent},
  { path: 'r/:nombre/:idProducto', component:  OpcionesAgregarComponent},
  { path: '', component:  SectionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

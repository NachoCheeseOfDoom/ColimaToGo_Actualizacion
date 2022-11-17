import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore'
import { IUsuario, IRestaurantes, Icarrito, IproductosCarrito, IDirecciones, Icoordenadas, IFormaPago, IPropina, IOpcionesEnvio } from '../interfaces/interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(
    private bdFB: AngularFirestore,
    private http: HttpClient
  ) { }

  registraNuevoCliente(datosUsuario: IUsuario) {
    return this.bdFB.collection('clientes').doc(datosUsuario.Uid).set(datosUsuario);
  }

  getRestaurantes() {
    let C = this.bdFB.collection<IRestaurantes>('restaurantes', ref =>
      ref.where("estado", "==", true).orderBy("nunID"));
    let datosUsuario = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IRestaurantes;
        })
      })
    );
    return datosUsuario;
  }

  getConfiguracionToGo(datos: any) {
    let C = this.bdFB.collection<any>('configuracionToGo', ref =>
      ref.where("id", "==", datos.id));
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as any;
        })
      })
    );
    return regresa;
  }

  getCarrito(uID: string) {
    let C = this.bdFB.collection<Icarrito>('carrito', ref =>
      ref.where("uID", "==", uID));
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as Icarrito;
        })
      })
    );
    return regresa;
  }

  getDatosCliente(uID: string) {
    let C = this.bdFB.collection<IUsuario>('clientes', ref =>
      ref.where("Uid", "==", uID));
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IUsuario;
        })
      })
    );
    return regresa;
  }

  getProductosCarrito(idCarrito: string) {
    let C = this.bdFB.collection<IproductosCarrito>(`carrito/${idCarrito}/prodcutos`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IproductosCarrito;
        })
      })
    );
    return regresa;
  }

  getMensajeEspecial(idRestaruante: string) {
    let C = this.bdFB.collection<IproductosCarrito>(`restaurantes/${idRestaruante}/mensajeEspecial`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IproductosCarrito;
        })
      })
    );
    return regresa;
  }

  getContactoRestaurante(idRestaruante: string) {
    let C = this.bdFB.collection<IproductosCarrito>(`restaurantes/${idRestaruante}/infoEmpresa`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IproductosCarrito;
        })
      })
    );
    return regresa;
  }


  getCarros() {
    let C = this.bdFB.collection<Icarrito>('carrito');
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as Icarrito;
        })
      })
    );
    return regresa;
  }

  addCarrito(d: Icarrito) {
    if (!d.id) {
      d.id = this.bdFB.createId();
    }
    return this.bdFB.collection('carrito').doc(d.id).set(d);
  }

  addProductoCarrito(idCarro: string, d: any) {
    if (!d.id) {
      d.id = this.bdFB.createId();
    }
    this.bdFB.collection(`carrito/${idCarro}/prodcutos`).doc(d.id).set(d);
    return 1;
  }

  addProductoAPI(d: any) {
    d.idCarritoProducto = this.bdFB.createId();
    d = JSON.stringify(d);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      })
    };
    const respuestaAPI = `${environment.urlAPI}/addProductoCarrito`;
    return this.http.post(respuestaAPI, d, httpOptions);
  }

  quitarProductoCarrito(idCarro: string, idProducto: string) {
    this.bdFB.collection(`carrito/${idCarro}/prodcutos`).doc(idProducto).delete();
    const respuestaAPI = `${environment.urlAPI}/quitarProductoCarritoCliente/${idProducto}`;
    return this.http.get(respuestaAPI);
  }

  eliminarCarrito(idCarrito: string) {
    this.bdFB.collection(`carrito`).doc(idCarrito).delete();
  }

  getDetallesRestaurante(nombre: string) {
    let C = this.bdFB.collection<IRestaurantes>('restaurantes', ref =>
      ref.where("nombre", "==", nombre));
    let datosUsuario = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IRestaurantes;
        })
      })
    );
    return datosUsuario;
  }

  getDetallesRestauranteCorto(nombre: string) {
    let C = this.bdFB.collection<IRestaurantes>('restaurantes', ref =>
      ref.where("corto", "==", nombre));
    let datosUsuario = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IRestaurantes;
        })
      })
    );
    return datosUsuario;
  }
  getDetallesRestauranteID(nombre: string) {
    let C = this.bdFB.collection<IRestaurantes>('restaurantes', ref =>
      ref.where("idR", "==", nombre));
    let datosUsuario = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IRestaurantes;
        })
      })
    );
    return datosUsuario;
  }

  getPedidosCliente(uID: string) {
    let C = this.bdFB.collection('pedidos', ref =>
      ref.where("idCliente", "==", uID));
    let datosUsuario = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data();
        })
      })
    );
    return datosUsuario;
  }

  getPedidoID(uID: string) {
    let C = this.bdFB.collection('pedidos', ref =>
      ref.where("idPedido", "==", uID));
    let datosUsuario = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data();
        })
      })
    );
    return datosUsuario;
  }

  getMenuRestaurante(idRestaurante: string) {
    const respuestaAPI = `${environment.urlAPI}/getMenuRestaurante/${idRestaurante}`;
    return this.http.get(respuestaAPI);
  }
  getMenuCategoriaCarniceria(idRestaurante: string) {
    const respuestaAPI = `${environment.urlAPI}/menuCategoriaCarniceria/${idRestaurante}`;
    return this.http.get(respuestaAPI);
  }

  getMenuCategoriaRestaurante(idRestaurante: string) {
    const respuestaAPI = `${environment.urlAPI}/menuCategoriaRestaurante/${idRestaurante}`;
    return this.http.get(respuestaAPI);
  }

  getCategoriasRestaurante(idRestaurante: string) {
    const respuestaAPI = `${environment.urlAPI}/categoriaRGET/${idRestaurante}`;
    return this.http.get(respuestaAPI);
  }

  getDetallesProducto(idProducto) {
    const respuestaAPI = `${environment.urlAPI}/getDetallesProductoMenu/${idProducto}`;
    return this.http.get(respuestaAPI);
  }

  getPropina() {
    let C = this.bdFB.collection<IPropina>('propina');
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IPropina;
        })
      })
    );
    return regresa;
  }


  // creando Pedido
  crearPedido(datos: any) {
    console.log(datos);

    let d = JSON.stringify(datos);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      })
    };
    const respuestaAPI = `${environment.urlAPI}/crearPedidoCliente`;
    return this.http.post(respuestaAPI, d, httpOptions);
  }

  crearPedidoFB(d: any) {
    this.bdFB.collection(`pedidos`).doc(d.idPedido).set(d);
  }



  ///Direcciones

  getDirecionesUsuario(uID: string) {
    let C = this.bdFB.collection<IDirecciones>(`clientes/${uID}/direcciones`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IDirecciones;
        })
      })
    );
    return regresa;
  }
  addDireccionUsuario(uID: string, d: IDirecciones) {
    if (!d.id) {
      d.id = this.bdFB.createId();
    }
    return this.bdFB.collection(`clientes/${uID}/direcciones`).doc(d.id).set(d);
  }

  getUbicacionNegocio(idRestaurante: string) {
    let C = this.bdFB.collection<Icoordenadas>(`restaurantes/${idRestaurante}/direccion`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as Icoordenadas;
        })
      })
    );
    return regresa;
  }

  getDirecionesUsuarioPredeterminada(uID: string) {
    let C = this.bdFB.collection<IDirecciones>(`clientes/${uID}/direcciones`, 
    ref => ref.where("predeterminada", "==", true));
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IDirecciones;
        })
      })
    );
    return regresa;
  }

  getCostoEnvio(idRestaurante: string, distancia: number) {
    const respuestaAPI = `${environment.urlAPI}/getCobrarEnvio/${idRestaurante}/${distancia}`;
    return this.http.get(respuestaAPI);
  }

  getDetallesPedido(idPedido: string) {
    const respuestaAPI = `${environment.urlAPI}/getDetallesPedido/${idPedido}`;
    return this.http.get(respuestaAPI);
  }

  getFormasPago() {
    let C = this.bdFB.collection<IFormaPago>(`formasPago`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IFormaPago;
        })
      })
    );
    return regresa;
  }
  getFormasPagoRestaurante(idRestaurante: string) {
    let C = this.bdFB.collection<IFormaPago>(`restaurantes/${idRestaurante}/formasPago`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IFormaPago;
        })
      })
    );
    return regresa;
  }

  getOpcionEnvio() {
    let C = this.bdFB.collection<IOpcionesEnvio>(`tipoPedido`);
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as IOpcionesEnvio;
        })
      })
    );
    return regresa;
  }

  eliminaDireccion(uID: string, idDireccion) {
    return this.bdFB.collection(`clientes/${uID}/direcciones`).doc(idDireccion).delete();
  }

  actualizacionWEB() {
    let C = this.bdFB.collection(`actualizacion`, ref => ref.where("panel", "==", 'Publico'));
    let regresa = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data();
        })
      })
    );
    return regresa;
  }

  getTipoPedido(idRestaurante: string, tiempoTraslado: number, idCarrito: string) {
    const respuestaAPI = `${environment.urlAPI}/getHorariosPedido/${idRestaurante}/${tiempoTraslado}/${idCarrito}`;
    return this.http.get(respuestaAPI);
  }

  iniciarCobro(id: string) {
    const respuestaAPI = `${environment.urlAPI}/iniciarProcesoPago/${id}`;
    return this.http.get(respuestaAPI);
  }

  getHorarioNavidadChepe(idRestaurante: string, idCarrito: string) {
    const respuestaAPI = `${environment.urlAPI}/getNavidadChepe/${idRestaurante}/${idCarrito}`;
    return this.http.get(respuestaAPI);
  }

  getDatosPedidos(idPEdido: string) {
    let C = this.bdFB.collection<any>('pedidos', ref =>
      ref.where("idPedido", "==", idPEdido));
    let respuesta = C.snapshotChanges().pipe(
      map(r => {
        return r.map(a => {
          return a.payload.doc.data() as any;
        })
      })
    );
    return respuesta;
  }

  cobrarEnLinea(idCarrito: any, cobrar: any) {
    const respuestaAPI = `${environment.urlAPI}/iniciarProcesoPago/${idCarrito}/${cobrar}`;
    return this.http.get(respuestaAPI);
  }

  validarPagoEnLinea(idCarrito: string) {
    const respuestaAPI = `${environment.urlAPI}/estadoPagoAPICarrito/${idCarrito}`;
    return this.http.get(respuestaAPI);
  }

  registrarNuevoClienteAPI(datos: any) {
    let d = JSON.stringify(datos);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      })
    };
    const respuestaAPI = `${environment.urlAPI}/addNuevoClienteBD`;
    return this.http.post(respuestaAPI, d, httpOptions);
  }

  registrarCarritoCliente(datos: any) {
    let d = JSON.stringify(datos);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      })
    };
    const respuestaAPI = `${environment.urlAPI}/registrarCarritoCliente`;
    return this.http.post(respuestaAPI, d, httpOptions);
  }

}

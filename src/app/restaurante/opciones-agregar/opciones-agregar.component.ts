import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IRestaurantes, IDetallesProductoMenu, IproductosCarrito, IaddTemporal, Iopciones, IUsuarioNuevo, IUsuario } from '../../interfaces/interfaces';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { isNumber } from 'util';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-opciones-agregar',
  templateUrl: './opciones-agregar.component.html',
  styleUrls: ['./opciones-agregar.component.css']
})
export class OpcionesAgregarComponent implements OnInit {


  banVerLogin: boolean;
  banderaLoginRegistro: boolean;
  usuarioN: IUsuarioNuevo;
  numTelefono = /^[0-9]{10}$/;





  nombreRestaurante: string;
  idProducto: string;
  detalleRestaurante: IRestaurantes;
  cantidad: number;
  dProducto: IDetallesProductoMenu;

  tipoDispositivo: boolean;

  productoAdd: IproductosCarrito;

  opcionesAdd: IaddTemporal[] = [];

  notas: string;

  loguado = true;

  constructor(
    private parametros: ActivatedRoute,
    private bd: DatabaseService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.queES();
    this.notas = '';
    this.dProducto = {
      info: null,
      detalles: null,
    }
    this.cantidad = 1;
    this.parametros.params.subscribe(p => {
      this.nombreRestaurante = p.nombre;
      this.idProducto = p.idProducto;
      this.bd.getDetallesRestaurante(this.nombreRestaurante).subscribe((r: IRestaurantes[]) => {
        this.detalleRestaurante = r[0];
        console.warn(r.length);
        this.bd.getDetallesProducto(this.idProducto).subscribe((resp: IDetallesProductoMenu) => {
          this.dProducto = resp;
        })
      });
    });
  }

  verLogin() {
    this.banVerLogin = !this.banVerLogin;
  }


  entrarFB() {
    this.auth.loginFaceBook().then(
      () => {
        window.location.reload();
      });
  }

  entrarconGoogle() {
    this.auth.loginGoogle().then(
      () => {
        window.location.reload();
      });
  }
  entrarCorreo() {
    this.auth.signInWithEmail(this.usuarioN.correo, this.usuarioN.contrasena)
      .then(
        () => {
          window.location.reload();
        },
        err => {
          let a = this.usuarioN;
          this.banVerLogin = false;
          let E = err.code;
          let txt = '';
          if (E === "auth/invalid-email") {
            txt = 'La dirección de correo electrónico no es valida';
          }
          if (E === 'auth/wrong-password') {
            txt = 'La contraseña no es válida o el usuario no tiene una contraseña.';
          }
          if (E === 'auth/user-not-found') {
            txt = 'La dirección de correo electrónico no se encuentra registrada';
          }
          Swal.fire({
            title: 'Error!',
            text: txt,
            icon: 'error',
            confirmButtonText: 'OK'
          }).then((result) => {
            this.banVerLogin = true;

          });
        }
      );

  }
  recuperarcuenta() {
    this.auth.resetPassword(this.usuarioN.correo).then(
      () => {
        this.banVerLogin = false;
        Swal.fire({
          text: 'Revisa tu correo electrónico, enviamos las instrucciones para recuperar tu cuenta ',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          this.banVerLogin = true;
        });
      },
      err => {
        this.banVerLogin = false;
        let E = err.code;
        let txt = '';
        if (E === "auth/invalid-email") {
          txt = 'La dirección de correo electrónico no es valida';
        }
        if (E === 'auth/wrong-password') {
          txt = 'La contraseña no es válida o el usuario no tiene una contraseña.';
        }
        if (E === 'auth/user-not-found') {
          txt = 'La dirección de correo electrónico no se encuentra registrada';
        }
        Swal.fire({
          title: 'Error!',
          text: txt,
          icon: 'error',
          confirmButtonText: 'OK'
        }).then((result) => {
          this.banVerLogin = true;
        });
      }
    );
  }
  mensajeError(txt: string) {
    Swal.fire({
      title: 'Error!',
      text: txt,
      icon: 'error',
      confirmButtonText: 'OK'
    }).then((result) => {
      this.banVerLogin = true;
    });
  }
  registrarCorreo() {
    let nombrePropio = /^[A-Za-z Ññáéíóú]{3,100}$/;
    if (!nombrePropio.test(this.usuarioN.nombre)) {
      this.mensajeError('Ingresa tu nombre completo');
      this.banVerLogin = false;
    } else {
      if (!this.numTelefono.test(this.usuarioN.telefono)) {
        this.mensajeError('Ingresa un número de teléfono valido ');
        this.banVerLogin = false;
      } else {
        this.auth.signUpWithEmail(this.usuarioN.correo, this.usuarioN.contrasena)
          .then(
            () => {
              this.auth.currentUser().subscribe(ath => {
                if (ath.uid) {
                  let D: IUsuario = {
                    Uid: ath.uid,
                    correo: this.usuarioN.correo,
                    nombre: '',
                    telefono: '',
                    direccion: '',
                    photoURL: ath.photoURL,
                  }
                  D.nombre = ath.displayName;
                  if (this.usuarioN.telefono != "") {
                    D.telefono = this.usuarioN.telefono;
                  }
                  if (!D.nombre) {
                    D.nombre = this.usuarioN.nombre;
                  }
                  if (D.correo == "") {
                    D.correo = ath.email;
                  }
                  D.providerData = ath.providerData[0].providerId;

                  this.bd.getDatosCliente(ath.uid).subscribe((d: IUsuario[]) => {
                    if (d.length == 0) {
                      this.bd.registraNuevoCliente(D).then(r => {
                        window.location.reload();
                      });
                    } else {
                      window.location.reload();
                    }

                  });
                }
              });
              //window.location.reload();
            },
            err => {
              this.banVerLogin = false;
              let E = err.code;
              let txt = '';
              if (E === "auth/invalid-email") {
                txt = 'La dirección de correo electrónico no es valida';
              }
              if (E === 'auth/weak-password') {
                txt = 'La contraseña debe tener 6 caracteres o más';
              }
              if (E === 'auth/email-already-in-use') {
                txt = 'La dirección de correo electrónico ya está en uso por otra cuenta.';
              }

              Swal.fire({
                title: 'Error!',
                text: txt,
                icon: 'error',
                confirmButtonText: 'OK'
              }).then((result) => {
                this.banVerLogin = true;
              });
            }
          );
      }
    }
  }


  queES() {
    var isMobile = {
      Android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
    };
    this.tipoDispositivo = false;
    if (isMobile.any()) {
      this.tipoDispositivo = true;
    }
  }

  cambiarCantidad(op: number) {
    if (op === 1) {
      if (this.cantidad > 0) {
        this.cantidad--;
      }
    }
    if (op === 2) {
      this.cantidad++;
    }
  }

  agregarCarrito() {
    this.auth.currentUser().pipe(first()).subscribe(ath => {
      if (ath) {
        this.loguado = true;
        for (const iterator of this.dProducto.detalles) {
          if ((iterator.obligatorio === '1') && (!this.opcionesAdd.find(x => x.idCatalogo === iterator.id))) {
            this.mesjError('Debes seleccionar al menos una opción de ' + iterator.nombre);
            return;
          }
          let contador = this.opcionesAdd.filter(x => x.idCatalogo === iterator.id);
          if (contador.length > parseInt(iterator.cantidad)) {
            let txtE = 'Para ' + iterator.nombre + ' solo puedes seleccionar máximo ' + iterator.cantidad + ' opciones';
            if (parseInt(iterator.cantidad) == 1) {
              txtE = 'Para ' + iterator.nombre + ' solo puedes seleccionar máximo ' + iterator.cantidad + ' opción';
            }
            this.mesjError(txtE);
            return;
          }
        }
        this.bd.getCarrito(ath.uid).pipe(first()).subscribe(c => {
          let d = null;
          console.log(this.detalleRestaurante);
          if (c.length == 0) {
            d = {
              uID: ath.uid,
              idRestaurante: this.detalleRestaurante.idR,
              nombreRestaurante: this.detalleRestaurante.nombre,
              estadoCarrito: '1',
              envioMinimo: this.detalleRestaurante.envioMinimo,
              productos: null,
            };
            this.bd.addCarrito(d).then(a => {
              this.bd.getCarrito(ath.uid).pipe(first()).subscribe(c => {
                let textAdicional = '';
                let suma = 0;
                for (const catalogos of this.dProducto.detalles) {
                  let tempOciones = '';
                  let contador = 0;
                  for (const opcion of catalogos.opciones) {
                    if (this.opcionesAdd.find(x => x.idOpcion === opcion.id)) {
                      if (contador > 0) {
                        tempOciones = tempOciones + ', ';
                      }
                      if (opcion.precio != "0") {

                        suma = Number(suma + Number(opcion.precio));
                        tempOciones = tempOciones + opcion.nombre;
                      } else {
                        tempOciones = tempOciones + opcion.nombre;
                      }

                      contador++;
                    }
                  }
                  if (contador > 0) {
                    if (textAdicional != '') {
                      textAdicional = textAdicional + ', ';
                    }
                    textAdicional = textAdicional + catalogos.nombre + ': ' + ' ' + tempOciones;
                  }
                }
                if ((!isNumber(this.cantidad)) || (this.cantidad <= 0)) {
                  this.mesjError('Selecciona una cantidad válida para poder agregar');
                  return;
                }
                suma += Number(this.dProducto.info.precioProducto) * this.cantidad;
                let G: IproductosCarrito = {
                  idProducto: this.dProducto.info.idProducto,
                  nombreProducto: this.dProducto.info.nombreProducto,
                  textExtras: textAdicional,
                  logo: this.dProducto.info.urlImagen,
                  cantidad: this.cantidad,
                  notas: this.notas,
                  costo: suma.toString(),
                  extras: this.opcionesAdd,
                }
                let datosAPI = {
                  carrito: c[0],
                  idCarrito: c[0].id,
                  idProducto: this.dProducto.info.idProducto,
                  cantidad: this.cantidad,
                  notas: this.notas,
                  costo: suma.toString(),
                  extras: this.opcionesAdd,
                }
                this.bd.addProductoAPI(datosAPI).subscribe((rAPI: any) => {

                  G.id = rAPI.id;
                  this.bd.addProductoCarrito(c[0].id, G);
                  this.router.navigate(['/restaurante', this.detalleRestaurante.nombre]);
                });

              });
            });

          } else {
            this.bd.getProductosCarrito(c[0].id).pipe(first()).subscribe((numProductos: any[]) => {
              let canProCarrito = numProductos.length;
              if (c[0].idRestaurante !== this.detalleRestaurante.idR) {
                if (canProCarrito > 0) {
                  this.mesjError('Tienes un pedido pendiente con "' + c[0].nombreRestaurante
                    + '", debes terminarlo o cancelarlo antes de realizar uno nuevo con  "' + this.detalleRestaurante.nombre + '"');
                  return;
                } else {
                  c[0].idRestaurante = this.detalleRestaurante.idR;
                  c[0].nombreRestaurante = this.detalleRestaurante.nombre;
                  c[0].envioMinimo = this.detalleRestaurante.envioMinimo;
                  this.bd.addCarrito(c[0]).then(a => { });
                }
              }
              let textAdicional = '';
              let suma = 0;
              for (const catalogos of this.dProducto.detalles) {
                let tempOciones = '';
                let contador = 0;
                for (const opcion of catalogos.opciones) {
                  if (this.opcionesAdd.find(x => x.idOpcion === opcion.id)) {
                    if (contador > 0) {
                      tempOciones = tempOciones + ', ';
                    }
                    if (opcion.precio != "0") {
                      suma = Number(suma + Number(opcion.precio));
                      tempOciones = tempOciones + opcion.nombre;
                    } else {
                      tempOciones = tempOciones + opcion.nombre;
                    }

                    contador++;
                  }
                }
                if (contador > 0) {
                  if (textAdicional != '') {
                    textAdicional = textAdicional + ', ';
                  }
                  textAdicional = textAdicional + catalogos.nombre + ': ' + ' ' + tempOciones;
                }
              }
              if ((!isNumber(this.cantidad)) || (this.cantidad <= 0)) {
                this.mesjError('Selecciona una cantidad válida para poder agregar');
                return;
              }
              suma += Number(this.dProducto.info.precioProducto) * this.cantidad;

              let G: IproductosCarrito = {
                idProducto: this.dProducto.info.idProducto,
                nombreProducto: this.dProducto.info.nombreProducto,
                textExtras: textAdicional,
                logo: this.dProducto.info.urlImagen,
                cantidad: this.cantidad,
                costo: suma.toString(),
                notas: this.notas,
                extras: this.opcionesAdd,
              }
              let datosAPI = {
                carrito: c[0],
                idCarrito: c[0].id,
                idProducto: this.dProducto.info.idProducto,
                cantidad: this.cantidad,
                notas: this.notas,
                costo: suma.toString(),
                extras: this.opcionesAdd,
              }
              this.bd.addProductoAPI(datosAPI).subscribe((rAPI: any) => {
                console.log(rAPI);
                G.id = rAPI.id;
                this.bd.addProductoCarrito(c[0].id, G);
                this.router.navigate(['/restaurante', this.detalleRestaurante.nombre]);
              });
            });
          }
        })
      } else {
        /*  Swal.fire({
            title: 'Error!',
            text: 'Para poder agregar ' + this.dProducto.info.nombreProducto + ' debes ingresar a tu cuenta',
            icon: 'error',
            confirmButtonText: 'OK'
          }).then((result) => {
            */
        this.banderaLoginRegistro = true;
        this.banVerLogin = true;

        this.usuarioN = {
          nombre: '',
          correo: '',
          contrasena: '',
          contrasenaConfimarcion: '',
          telefono: '',
        };
        // });
      }
    })
  }

  mesjError(txt: string) {
    Swal.fire({
      title: 'Error!',
      text: txt,
      icon: 'error',
      confirmButtonText: 'OK'
    }).then((result) => {

    });
  }

  agregarTemporal(idCatalogo: string, idOpcion: string) {
    let catalgoT = this.dProducto.detalles.find(c => c.id === idCatalogo);
    if (catalgoT.cantidad === '1E') {
      if (this.opcionesAdd.find(x => x.idCatalogo === idCatalogo)) {
        let t = this.opcionesAdd.find(x => x.idCatalogo === idCatalogo);
        t.idOpcion = idOpcion;
      } else {
        this.opcionesAdd.push({
          idProducto: this.dProducto.info.idProducto,
          idCatalogo: idCatalogo,
          idOpcion: idOpcion,
        });
      }
    } else {
      if (this.opcionesAdd.find(x => x.idOpcion === idOpcion)) {
        this.opcionesAdd = this.opcionesAdd.filter(x => x.idOpcion !== idOpcion);
      } else {
        this.opcionesAdd.push({
          idProducto: this.dProducto.info.idProducto,
          idCatalogo: idCatalogo,
          idOpcion: idOpcion,
        });
      }
    }


  }

  salir() {
    this.auth.logout();
  }


}

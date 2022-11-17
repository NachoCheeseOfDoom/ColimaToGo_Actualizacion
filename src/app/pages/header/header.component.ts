import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { IUsuarioNuevo, IUsuario, IproductosCarrito, IRestaurantes, Icoordenadas, Icarrito, IFormaPago, IPropina, IOpcionesEnvio, IdiasEntrega, IopcionEnvioSeleccionada } from '../../interfaces/interfaces';

import Swal from "sweetalert2";
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { pipe } from 'rxjs';
import { ucs2 } from 'punycode';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild('clicPerfil') clicPerfil: ElementRef;
  @ViewChild('btnOcoltarCarro') btnOcoltarCarro: ElementRef;

  txtMSJ: string;

  datosHeader: any;

  banVerLogin: boolean;
  actualizaWEB: string = "NO";
  banVerCarrito: boolean;
  usuarioN: IUsuarioNuevo;
  usuario: IUsuario;
  idRestaurante: string;
  referencia: string;
  distanciaKM: number;
  addNumTelefono: string;
  costoEnvioTXT: string;
  formaPagoElegida: string;
  banderaLoginRegistro: boolean;
  banVerConfirmacionCompra: boolean;
  listaFormaPago: IFormaPago[] = [];

  numTelefono = /^[0-9]{10}$/;

  propinaSeleccionada: number;

  carritoCliente: Icarrito;

  duracioMT: number;

  costoEnvio: number;
  ubicacionRestaurante: Icoordenadas;
  ubicacionEntrega: Icoordenadas;
  idCarritoActual: string;
  estaAutenticado: boolean;
  productosCarrito: IproductosCarrito[] = [];
  cantidadCarrito: number;
  totalPagar: number;

  contactoEmpresa: any[] = [];

  costoMinimo: number;
  granTotal = 0;
  opcionEnvioSeleccionada: IopcionEnvioSeleccionada;

  horasEntrega: string[] = [];
  fechasEntrega: IdiasEntrega[] = [];

  listaPropina: IPropina[] = [];
  listaIOpcionesEnvio: IOpcionesEnvio[] = [];

  seleccionOpcionEnvio: string;


  map: any;
  origin = { lat: 4.658383846282959, lng: -74.09394073486328 };

  destination = { lat: 4.676802158355713, lng: -74.04825592041016 };

  directionsService: any;
  directionsDisplay: any;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private auth: AuthService,
    private bd: DatabaseService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.banVerConfirmacionCompra = false;
    this.costoMinimo = 0;
    this.duracioMT = 0;
    this.opcionEnvioSeleccionada = {
      idTipo: "",
      fecha: "",
      hora: "",
    };
    this.distanciaKM = 0;
    this.banderaLoginRegistro = true;
    this.bd.actualizacionWEB().subscribe((Actu: any) => {
      if (this.actualizaWEB != "NO") {
        window.location.reload(true);
      }
      if (Actu[0].estado != environment.appVersion) {
        window.location.reload(true);
      }
      this.actualizaWEB = Actu[0].estado;
    });
    let B = {
      id: 'header',
    }
    this.bd.getConfiguracionToGo(B).subscribe((r: any) => {
      this.datosHeader = r[0];
    });
    this.costoEnvio = 0;
    this.idCarritoActual = null;

    this.cantidadCarrito = 0;
    this.totalPagar = 0;
    this.banVerLogin = false;
    this.banVerCarrito = false;
    this.estaAutenticado = false;
    this.limpiarNuevo();
    this.logueado();
    this.usuarioN = {
      nombre: '',
      correo: '',
      contrasena: '',
      contrasenaConfimarcion: '',
      telefono: '',
    };
  }

  mandarAPI() {
    let a = "A08";
    this.bd.iniciarCobro(a).subscribe((r: any) => {
      console.log(r);
      console.warn(r.respuesta.payment_method);

    });
  }

  mensajeError2(txt: string) {
    Swal.fire({
      title: 'Error!',
      text: txt,
      icon: 'error',
      confirmButtonText: 'OK'
    }).then((result) => { });
  }

  limpiarNuevo() {
    this.fechasEntrega = [];
    this.listaIOpcionesEnvio[0] = {
      idTipo: '',
      nombreTipo: '',
    }
    this.seleccionOpcionEnvio = "1";
    this.opcionesEnvioV1();



    this.bd.getPropina().subscribe((x: IPropina[]) => {
      this.listaPropina = x;
      this.listaPropina.unshift({
        id: '0',
        propina: 0
      });
      this.propinaSeleccionada = 0;
    });
  }

  verLogin() {
    this.limpiarNuevo();
    this.banVerLogin = !this.banVerLogin;
  }

  cambiarPropina() {
    this.carritoCliente.propina = this.propinaSeleccionada;
    this.bd.addCarrito(this.carritoCliente);
  }

  verCarrito() {
    this.banVerCarrito = true;
    this.logueado();

  }
  ocultarCarro() {
    this.banVerCarrito = false;
  }

  opcionesEnvioV1() {
    this.bd.getContactoRestaurante(this.idRestaurante).subscribe((r: any[]) => {
      this.contactoEmpresa = r;
    });
    this.bd.getFormasPagoRestaurante(this.idRestaurante).subscribe((r: IFormaPago[]) => {
      if (r.length == 0) {
        this.bd.getFormasPago().subscribe((i: IFormaPago[]) => {
          this.listaFormaPago = i;
          this.formaPagoElegida = i[0].forma;
        });
      } else {
        this.listaFormaPago = r;
        this.formaPagoElegida = r[0].forma;
      }
    });
  }

  logueado() {
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
        console.log(D);
        /* 
          this.bd.registrarNuevoClienteAPI(D).subscribe(r => {
           console.log(r);
         });
         */


        this.bd.getDatosCliente(ath.uid).subscribe((d: IUsuario[]) => {
          if (d.length == 0) {
            this.bd.registraNuevoCliente(D);
          } else {
            this.usuario = d[0];
          }
          //this.bd.getCarrito(ath.uid).pipe(first()).subscribe(r => {
          this.bd.getCarrito(ath.uid).subscribe(r => {
            if (r.length > 0) {
              this.carritoCliente = r[0];
              this.idCarritoActual = r[0].id;
              this.idRestaurante = r[0].idRestaurante;
              this.opcionesEnvioV1();
              if (!this.carritoCliente.envioMinimo) {
                this.bd.getDetallesRestaurante(this.carritoCliente.nombreRestaurante).pipe(first()).subscribe((r: IRestaurantes[]) => {
                  this.carritoCliente.envioMinimo = r[0].envioMinimo;
                });
              }
              this.costoMinimo = Number(this.carritoCliente.envioMinimo);
              this.bd.getProductosCarrito(r[0].id).subscribe((t: IproductosCarrito[]) => {
                this.bd.getTipoPedido(this.idRestaurante, this.distanciaKM, this.carritoCliente.id).subscribe((i: IOpcionesEnvio[]) => {
                  this.listaIOpcionesEnvio = i;
                  this.seleccionOpcionEnvio = "2";
                  if (this.carritoCliente.tipoPedidoid) {
                    this.seleccionOpcionEnvio = this.carritoCliente.tipoPedidoid;
                  }
                  let bO = this.listaIOpcionesEnvio.find(bO => bO.idTipo === "3");
                  bO.nombreTipo = "Recoger en " + this.carritoCliente.nombreRestaurante;
                  if (this.carritoCliente.propina) {
                    this.propinaSeleccionada = this.carritoCliente.propina;
                  } else {
                    this.propinaSeleccionada = 0;
                    this.carritoCliente.propina = 0;
                  }
                  this.bd.addCarrito(this.carritoCliente);

                  this.bd.getUbicacionNegocio(r[0].idRestaurante).subscribe(uR => {
                    this.ubicacionRestaurante = uR[0];
                    this.origin = {
                      lat: Number(this.ubicacionRestaurante.lat),
                      lng: Number(this.ubicacionRestaurante.lng)
                    }
                    this.bd.getDirecionesUsuarioPredeterminada(r[0].uID).subscribe(uC => {
                      if (uC.length > 0) {
                        this.ubicacionEntrega = {
                          lat: uC[0].latitud,
                          lng: uC[0].longitud,
                        }
                        this.referencia = uC[0].referencia;
                        this.destination = {
                          lat: Number(this.ubicacionEntrega.lat),
                          lng: Number(this.ubicacionEntrega.lng),
                        }
                      } else {
                        this.ubicacionEntrega = {
                          lat: 'E01',
                          lng: 'E01',
                        }
                      }
                      this.calcularCostoEnvio()
                    });
                  });
                  this.productosCarrito = t;
                  this.cantidadCarrito = 0;
                  this.totalPagar = 0;
                  for (const iterator of this.productosCarrito) {
                    this.cantidadCarrito += iterator.cantidad;
                    this.totalPagar += Number(iterator.costo);
                  }
                  this.cobros();
                });
              });
            }
          });

          this.banVerLogin = false;
          this.estaAutenticado = true;
        });
      } else {
        this.estaAutenticado = false;
      }
    })
  }

  entrarconGoogle() {
    this.auth.loginGoogle().then(
      () => {
        this.logueado();
      });
  }
  entrarFB() {
    this.auth.loginFaceBook().then(
      () => {
        this.logueado();
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
              this.logueado();
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

  quitarElemento(idElemento: string) {
    this.bd.quitarProductoCarrito(this.idCarritoActual, idElemento).subscribe((rf) => {
      if (this.productosCarrito.length == 1) {
        this.bd.eliminarCarrito(this.idCarritoActual);
      }
    });
  }

  calcularCostoEnvio() {
    if (this.seleccionOpcionEnvio != "3") {
      this.mapsAPILoader.load().then(() => {
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer();
        const mapEle: HTMLElement = document.getElementById('map58');
        // create map
        this.map = new google.maps.Map(mapEle, {
          center: this.origin,
          zoom: 12
        });
        this.directionsDisplay.setMap(this.map);

        google.maps.event.addListenerOnce(this.map, 'idle', () => {
          mapEle.classList.add('show-map');
          this.calculateRoute2();
        });
      });
    } else {
      this.costoEnvioTXT = "";
      this.costoEnvio = 0;
      this.cobros();
    }

  }
  calculateRoute2() {
    this.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
        this.distanciaKM = response.routes[0].legs[0].distance.value / 1000;
        this.duracioMT = response.routes[0].legs[0].duration.value / 60;
        if (this.seleccionOpcionEnvio != "3") {
          this.bd.getCostoEnvio(this.idRestaurante, this.distanciaKM).subscribe((cE: any) => {
            if (cE.costo != "E01") {
              this.costoEnvioTXT = "";
              this.costoEnvio = cE.costo;
              this.cobros();
            } else {
              this.costoEnvioTXT = "E01";
            }
          });
        } else {
          this.costoEnvioTXT = "";
          this.costoEnvio = 0;
          this.ubicacionEntrega.lat = "";
          this.ubicacionEntrega.lng = "";
          this.cobros();
        }
      } else {
        // alert('Could not display directions due to: ' + status);
      }
    });
  }

  cobros() {
    this.fechasEntrega = [];
    this.granTotal = Number(this.costoEnvio) + Number(this.totalPagar) + Number(this.totalPagar * (this.propinaSeleccionada / 100));
    if (this.seleccionOpcionEnvio != "1") {
      if (this.listaIOpcionesEnvio.find(bO => bO.idTipo === this.seleccionOpcionEnvio)) {
        this.fechasEntrega = this.listaIOpcionesEnvio.find(bO => bO.idTipo === this.seleccionOpcionEnvio).horariosEntrega;
        this.opcionEnvioSeleccionada.idTipo = this.seleccionOpcionEnvio;
        this.opcionEnvioSeleccionada.fecha = this.fechasEntrega[0].fecha;
      }
      this.buscarHorarios();
    }
  }


  buscarHorarios() {
    this.horasEntrega = [];
    if (this.fechasEntrega.find(bF => bF.fecha === this.opcionEnvioSeleccionada.fecha)) {
      this.horasEntrega = this.fechasEntrega.find(bF => bF.fecha === this.opcionEnvioSeleccionada.fecha).horasEntrega;
      //this.horasEntrega="Lo antes posible";
      this.opcionEnvioSeleccionada.hora = this.horasEntrega[0];
    }
    //console.log(this.distanciaKM);

    //this.horasEntrega=
  }
  vntCobrar() {
    this.banVerConfirmacionCompra = true;
    if ((!this.carritoCliente.tipoPedidoid) || (this.carritoCliente.tipoPedidoid === undefined)) {
      this.carritoCliente.tipoPedidoid = "1";
    }
    if ((!this.carritoCliente.tipoPedido) || (this.carritoCliente.tipoPedido === undefined)) {
      this.carritoCliente.tipoPedido = "A mi domicilio";
    }
    if ((!this.carritoCliente.horaEntrega) || (this.carritoCliente.horaEntrega === undefined)) {
      this.carritoCliente.horaEntrega = "";
    }
    console.warn(this.carritoCliente);
    this.txtMSJ = '';
    let fechaAyuda = this.fechasEntrega.find(a => a.fecha === this.opcionEnvioSeleccionada.fecha).diaTXT;
    if (this.carritoCliente.tipoPedidoid == '2') {
      this.txtMSJ = "" + this.carritoCliente.tipoPedido;
    } else {
      this.txtMSJ = "Pedido para  " + this.carritoCliente.tipoPedido;
    }
    if (this.opcionEnvioSeleccionada.hora === 'Lo antes posible') {
      this.txtMSJ = this.txtMSJ + "  " + fechaAyuda + ", " + this.opcionEnvioSeleccionada.hora;
    } else {
      this.txtMSJ = this.txtMSJ + "  " + fechaAyuda + ", a las " + this.opcionEnvioSeleccionada.hora + " Hrs."
    }
  }

  ordenarV2(idFormaPago: number) {
    let b = this.listaFormaPago.find(gf => gf.id == idFormaPago);
    this.formaPagoElegida = b.forma;

    if (idFormaPago == 3) {
      console.warn(this.idCarritoActual);
      this.bd.registrarNuevoClienteAPI(this.usuario).subscribe((rU: any) => {
        console.log(rU);
        if (rU.estado == 'OK') {
          this.bd.cobrarEnLinea(this.idCarritoActual, this.granTotal).subscribe((r: any) => {
            console.log(r);
            if (r.estado == 'OK') {
              for (const pCarro of this.productosCarrito) {
                this.quitarElemento(pCarro.id);
              }
              this.bd.eliminarCarrito(this.idCarritoActual);
              Swal.close();

              this.ocultarCarro();
              window.location.href = r.url;
            }
            if (r.estado == 'E02') {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: r.msj
              });
            }
            if (r.estado == 'E00') {
              let D = {
                idRestaurante: this.carritoCliente.idRestaurante,
                uID: this.carritoCliente.uID,
                idCarrito: this.carritoCliente.id,
                propina: this.propinaSeleccionada,
              };
              this.bd.registrarCarritoCliente(D).subscribe((rR: any) => {
                console.log(rR);
                this.ordenarV2(idFormaPago);
              });
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: rU.msj
          });
        }
      });

    } else {
      //this.ordenar();
    }
    this.banVerConfirmacionCompra = false;
  }

  ordenar(idFormaPago: number) {
    this.banVerConfirmacionCompra = false;
    console.warn(this.usuario);
    if (this.opcionEnvioSeleccionada.hora === "Lo antes posible") {
      this.seleccionOpcionEnvio = "1";
    }
    if (this.seleccionOpcionEnvio != "1") {
      this.carritoCliente.horaEntrega = '' + this.opcionEnvioSeleccionada.fecha + ' ' + this.opcionEnvioSeleccionada.hora + ' Hrs.';
    }
    if ((this.seleccionOpcionEnvio != "1") && ((this.carritoCliente.horaEntrega == "") || (this.carritoCliente.horaEntrega === undefined))) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingresa la hora de entrega por favor!'
      });
    } else {
      if ((this.seleccionOpcionEnvio != "3") && (this.distanciaKM == 0)) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ingresa la hora de entrega por favor!'
        });
      } else {

       

        //Validacion Navidad Chepe
        //  this.bd.getHorarioNavidadChepe(this.carritoCliente.idRestaurante, this.carritoCliente.id).subscribe((rS1: any) => {
        let pasa = 0;

        if ((this.carritoCliente.idRestaurante == "NqufQezu7E0qD1MXkPYB")
          && (this.opcionEnvioSeleccionada.idTipo == "2")
          && (this.opcionEnvioSeleccionada.fecha == "2020-12-31")) {
          this.bd.getMensajeEspecial(this.carritoCliente.idRestaurante).subscribe((r: any) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: r[0].msj,
            });
          });

          pasa = 1;
        }





        if (pasa == 0) {
          Swal.fire({
            title: 'Procesando pedido.'
          });
          if (this.seleccionOpcionEnvio != '1') {
            this.carritoCliente.datosOpcionEntrega = {
              idTipoPedido: this.seleccionOpcionEnvio,
              fecha: this.opcionEnvioSeleccionada.fecha,
              hora: this.opcionEnvioSeleccionada.hora,
              minutosEntrega: this.duracioMT.toString(),
            }
          } else {
            this.carritoCliente.datosOpcionEntrega = {
              idTipoPedido: this.seleccionOpcionEnvio,
              fecha: '',
              hora: '',
              minutosEntrega: '',
            }
          }
          let b = this.listaFormaPago.find(gf => gf.id == idFormaPago);
          this.formaPagoElegida = b.forma;
          let idFP = this.listaFormaPago.find(gf => gf.forma == this.formaPagoElegida).id;

          let datosAPI = {
            pedido: this.carritoCliente,
            productos: this.productosCarrito,
            direccionEntrega: {
              lat: this.destination.lat,
              lng: this.destination.lng,
              direccion: this.usuario.direccion,
              referencia: this.referencia,
              distancia: this.distanciaKM,
              costo: this.totalPagar,
              costoEnveio: this.costoEnvio,
              formaPago: idFP,
              propina: this.propinaSeleccionada,
              entregar: ''
            },
            tipo: 1,
          }
          if ((!this.carritoCliente.tipoPedidoid) || (this.carritoCliente.tipoPedidoid === undefined)) {
            this.carritoCliente.tipoPedidoid = "1";
          }
          if ((!this.carritoCliente.tipoPedido) || (this.carritoCliente.tipoPedido === undefined)) {
            this.carritoCliente.tipoPedido = "A mi domicilio";
          }
          if ((!this.carritoCliente.horaEntrega) || (this.carritoCliente.horaEntrega === undefined)) {
            this.carritoCliente.horaEntrega = "";
          }
          this.txtMSJ = '';
          let fechaAyuda = this.fechasEntrega.find(a => a.fecha === this.opcionEnvioSeleccionada.fecha).diaTXT;
          if (this.carritoCliente.tipoPedidoid == '2') {
            this.txtMSJ = "" + this.carritoCliente.tipoPedido;
          } else {
            this.txtMSJ = "Pedido para  " + this.carritoCliente.tipoPedido;
          }
          if (this.opcionEnvioSeleccionada.hora === 'Lo antes posible') {
            this.txtMSJ = this.txtMSJ + "  " + fechaAyuda + ", " + this.opcionEnvioSeleccionada.hora;
          } else {
            this.txtMSJ = this.txtMSJ + "  " + fechaAyuda + ", a las " + this.opcionEnvioSeleccionada.hora + " Hrs."
          }

          if ((this.usuario.nombre == '') || (this.usuario.nombre == null)) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Para poder continuar con tu pedido registra tu nombre completo!'
            });
            this.clicPerfil.nativeElement.click();
            this.btnOcoltarCarro.nativeElement.click();
          } else {
            if ((this.usuario.telefono == '') || (this.usuario.telefono == null)) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Para poder continuar con tu pedido debes registrar tu número telefónico!'
              });
              this.clicPerfil.nativeElement.click();
              this.btnOcoltarCarro.nativeElement.click();
            } else {
              Swal.fire({
                title: "Confirma tu pedido ",
                text: this.txtMSJ,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si",
                cancelButtonText: "No"
              }).then(result => {
                if (result.value) {
                  this.cantidadCarrito = 0;
                  Swal.fire({
                    title: 'Por favor espera un momento, estamos enviando tu pedido a ' + this.carritoCliente.nombreRestaurante
                  });
                  Swal.showLoading();

                  this.bd.crearPedido(datosAPI).subscribe((resp: any) => {
                    if (resp.estado === "OK") {
                      let nP = {
                        idPedido: this.carritoCliente.id,
                        idRestaurante: this.carritoCliente.idRestaurante,
                        idCliente: this.carritoCliente.uID,
                        estado: 1,
                        fecha: resp.fecha,
                        costo: this.totalPagar,
                        costoEnveio: this.costoEnvio,
                        propina: this.propinaSeleccionada,
                        nombreRestaurante: this.carritoCliente.nombreRestaurante,
                        estadoTXT: 'Nuevo',
                        formaPago: this.formaPagoElegida,
                        tipoPedidoID: this.carritoCliente.tipoPedidoid,
                        tipoPedido: this.carritoCliente.tipoPedido,
                        horaEntrega: this.carritoCliente.horaEntrega,
                        statusPago: 'charge_pending'
                      }
                      this.bd.crearPedidoFB(nP);

                      if (idFormaPago == 3) {
                        this.ordenarV2(idFormaPago);
                      } else {
                        for (const pCarro of this.productosCarrito) {
                          this.quitarElemento(pCarro.id);
                        }
                        this.bd.eliminarCarrito(this.idCarritoActual);
                        Swal.close();

                        this.ocultarCarro();
                        this.router.navigate(['/perfil', this.idCarritoActual]);
                      }
                      this.carritoCliente = null;
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: this.carritoCliente.nombreRestaurante,
                        text: resp.msj
                      })
                    }
                  });
                }
              });
            }
          }
        }
        /// });
      }
    }
  }


  actualizarInfoCliente() {
    if (!this.numTelefono.test(this.addNumTelefono)) {
      this.mensajeError2('Ingresa un número de teléfono valido');
    } else {
      this.usuario.telefono = this.addNumTelefono;
      this.bd.registraNuevoCliente(this.usuario);
    }
  }




  cambiarOpcionEnvio() {
    this.opcionEnvioSeleccionada.idTipo = this.seleccionOpcionEnvio;
    this.carritoCliente.tipoPedidoid = this.seleccionOpcionEnvio;
    this.carritoCliente.tipoPedido = this.listaIOpcionesEnvio.find(j => j.idTipo === this.seleccionOpcionEnvio).nombreTipo;
    this.bd.addCarrito(this.carritoCliente);
    if (this.seleccionOpcionEnvio == "3") {
      this.costoEnvioTXT = "E01";
    }
    this.calcularCostoEnvio();
  }
  entrarCorreo() {
    this.auth.signInWithEmail(this.usuarioN.correo, this.usuarioN.contrasena)
      .then(
        () => {
          this.logueado();
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
            this.usuario = a;
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

  registrarClic() {

  }



}

import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { IDirecciones, IUsuario } from '../../interfaces/interfaces';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  Toast: any;

  verDireccion: IDirecciones;
  listaDireccionesUsuario: IDirecciones[] = [];

  compoenenteDireccion: any;
  private geoCoder;

  directionsService: any;
  directionsDisplay: any;
  map: any;
  // parque simon bolivar
  origin = { lat: 4.658383846282959, lng: -74.09394073486328 };
  // Parque la 93
  destination = { lat: 4.676802158355713, lng: -74.04825592041016 };

  @ViewChild('search')
  public searchElementRef: ElementRef;
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private bd: DatabaseService,
    private auth: AuthService,
    private router: Router,
  ) { }




  ngOnInit() {
    this.verDireccion = {
      direccionAPI: '',
      latitud: '',
      longitud: '',
      calle: '',
      colonia: '',
      estado: '',
      referencia: '',
      municipio: '',
      predeterminada: false
    };
    this.Toast = Swal.mixin({
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      timer: 3000
    });
    this.getDirecciones();
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer();
      var cityBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(19.231299, -103.676180));
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        bounds: cityBounds,
        types: ["address"],
        componentRestrictions: { country: 'mx' }
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
          this.getAddress(this.latitude, this.longitude);
        });
      });
    });
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 16;
        this.getAddress(this.latitude, this.longitude);
      });
    } else {

    }
  }


  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 16;
          this.address = results[0].formatted_address;
          this.compoenenteDireccion = results[0];
          this.verDireccion.direccionAPI = results[0].formatted_address;
          this.verDireccion.latitud = latitude;
          this.verDireccion.longitud = longitude;
          let a = this.address.split(',');
          this.verDireccion.calle = a[0];
          this.verDireccion.colonia = a[1];
          this.verDireccion.municipio = a[2];
          this.verDireccion.predeterminada = true;
          this.guardarDireccionNuevo();
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'No se encontraron resultados',
            icon: 'error',
            confirmButtonText: 'OK'
          }).then((result) => {

          });
        }
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Geocoder failed due to: ' + status,
          icon: 'error',
          confirmButtonText: 'OK'
        }).then((result) => {

        });

      }

    });
  }

  getDirecciones() {
    this.auth.currentUser().subscribe(ath => {
      if (ath.uid) {
        this.bd.getDirecionesUsuario(ath.uid).subscribe((r: IDirecciones[]) => {
          this.listaDireccionesUsuario = r;
        })
      }
    });
  }

  verDireccionM(idDireccion: string) {
    let b = this.listaDireccionesUsuario.find(x => x.id === idDireccion);
    this.verDireccion = b;
    this.latitude = Number(b.latitud);
    this.longitude = Number(b.longitud);
    // this.getAddress(b.latitud, b.longitud);
  }

  hacerPredeterminada
    (idDireccion: string) {
    let b = this.listaDireccionesUsuario.find(x => x.id === idDireccion);
    this.verDireccion = b;
    this.guardarDireccion();
  }

  eliminarDireccion(idDireccion) {
    let b = this.listaDireccionesUsuario.find(x => x.id === idDireccion);
    if (b.predeterminada) {
      Swal.fire({
        title: 'Error!',
        text: 'No se puede eliminar la dirección predeterminada',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    Swal.fire({
      title: "Eliminar",
      text: "¿Se eliminará la dirección esta seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    }).then(result => {
      if (result.value) {
        this.auth.currentUser().subscribe(ath => {
          if (ath.uid) {
            this.bd.eliminaDireccion(ath.uid, b.id);
            this.Toast.fire({
              title: '',
              text: 'Dirección eliminada',
              icon: 'success',
            })
          }
        });
      }
    });
  }

  guardarDireccionNuevo() {
    if ((this.verDireccion.latitud == '') || (this.verDireccion.latitud == '0')) {
      Swal.fire({
        title: 'Error!',
        text: 'Debes permitir uso de tu ubicación para poder registrar tu dirección o mover el marcador a donde quieres recibir tu pedido',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    this.auth.currentUser().subscribe(ath => {
      if (ath.uid) {
        this.bd.getDatosCliente(ath.uid).subscribe((d: IUsuario[]) => {
          if (d[0].direccion === "") {
            d[0].direccion = this.verDireccion.calle;
            this.bd.registraNuevoCliente(d[0]);
            this.bd.addDireccionUsuario(ath.uid, this.verDireccion).then(() => {
              this.Toast.fire({
                title: '',
                text: 'Dirección guardada',
                icon: 'success',
              });
              this.router.navigate(['/perfil/']);
            });
          }
        });
      }
    });
  }
  guardarDireccion() {

    if ((this.verDireccion.latitud == '') || (this.verDireccion.latitud == '0')) {
      Swal.fire({
        title: 'Error!',
        text: 'Debes permitir uso de tu ubicación para poder registrar tu dirección o mover el marcador a donde quieres recibir tu pedido ',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    this.auth.currentUser().subscribe(ath => {
      if (ath.uid) {
        this.bd.getDatosCliente(ath.uid).subscribe((d: IUsuario[]) => {
          if (this.listaDireccionesUsuario.find(x => x.predeterminada)) {
            let pd = this.listaDireccionesUsuario.find(x => x.predeterminada);
            pd.predeterminada = false;
            this.bd.addDireccionUsuario(ath.uid, pd).then(() => {
              if (this.listaDireccionesUsuario.find(x => x.calle === this.verDireccion.calle)) {
                this.verDireccion.id = this.listaDireccionesUsuario.find(x => x.calle === this.verDireccion.calle).id;
                this.verDireccion.predeterminada = true;
              }
              d[0].direccion = this.verDireccion.calle;
              if ((this.verDireccion.colonia != "") && (d[0].direccion != "")) {
                d[0].direccion = d[0].direccion + ", " + this.verDireccion.colonia;
              }
              if ((this.verDireccion.municipio != "") && (d[0].direccion != "")) {
                d[0].direccion = d[0].direccion + ", " + this.verDireccion.municipio;
              }
              if ((this.verDireccion.referencia != "") && (d[0].direccion != "")) {
                d[0].direccion = d[0].direccion + ", " + this.verDireccion.referencia;
              }
              this.bd.registraNuevoCliente(d[0]);
              this.bd.addDireccionUsuario(ath.uid, this.verDireccion).then(() => {
                this.Toast.fire({
                  title: '',
                  text: 'Dirección guardada',
                  icon: 'success',
                });
                this.router.navigate(['/perfil/']);
              });
            });
          } else {
            if (this.listaDireccionesUsuario.find(x => x.calle === this.verDireccion.calle)) {
              this.verDireccion.id = this.listaDireccionesUsuario.find(x => x.calle === this.verDireccion.calle).id;
            }
            d[0].direccion = this.verDireccion.calle;
            if ((this.verDireccion.colonia != "") && (d[0].direccion != "")) {
              d[0].direccion = d[0].direccion + ", " + this.verDireccion.colonia;
            }
            if ((this.verDireccion.municipio != "") && (d[0].direccion != "")) {
              d[0].direccion = d[0].direccion + ", " + this.verDireccion.municipio;
            }
            if ((this.verDireccion.referencia != "") && (d[0].direccion != "")) {
              d[0].direccion = d[0].direccion + ", " + this.verDireccion.referencia;
            }
            this.bd.addDireccionUsuario(ath.uid, this.verDireccion).then(() => {
              this.Toast.fire({
                title: '',
                text: 'Dirección guardada',
                icon: 'success',
              });
              this.router.navigate(['/perfil/']);
            });
          }

        });
      }
    });
  }

  calculateRoute() {


    // create a new map by passing HTMLElement
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

  }
  calculateRoute2() {
    this.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
        console.log(response);

        // Obtenemos la distancia como valor numerico en metros 

      } else {
        alert('Could not display directions due to: ' + status);
      }
    });
  }

}


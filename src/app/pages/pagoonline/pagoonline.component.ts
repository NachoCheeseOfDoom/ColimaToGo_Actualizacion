import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-pagoonline',
  templateUrl: './pagoonline.component.html',
  styleUrls: ['./pagoonline.component.css']
})
export class PagoonlineComponent implements OnInit {
  idCarrito: string;
  datosPago: {
    serializableData: string,
    error_message: string,
    url: string,
    idPedido: string,
    cobrar: number
  };
  constructor(
    private parametros: ActivatedRoute,
    private bd: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.datosPago = {
      serializableData: '',
      error_message: '',
      url: '',
      idPedido: '',
      cobrar: 0
    }
    this.parametros.params.subscribe(p => {
      this.idCarrito = p.idCarrito;
      Swal.fire({
        title: 'Por favor espera un momento, estamos validando tu pago'
      });
      Swal.showLoading();
      this.bd.validarPagoEnLinea(this.idCarrito).subscribe((r: any) => {
        console.log(r);
        this.datosPago = {
          serializableData: r.serializableData,
          error_message: r.error_message,
          url: r.url,
          idPedido: this.idCarrito,
          cobrar: 0
        }
        this.bd.getDatosPedidos(this.idCarrito).pipe(first()).subscribe((rFb: any) => {
          console.warn(rFb);
          this.datosPago.cobrar = rFb[0].costo;
          rFb[0].statusPago = r.serializableData;
          this.bd.crearPedidoFB(rFb[0]);
        });
        Swal.close();
      });
    });
  }

  cobrarDeNuevo() {
    this.bd.cobrarEnLinea(this.datosPago.idPedido, this.datosPago.cobrar).subscribe((r: any) => {
      console.log(r);
      if (r.estado == 'OK') {
        window.location.href = r.url;
      }
    });
  }

}

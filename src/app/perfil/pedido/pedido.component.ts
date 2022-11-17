import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { first } from 'rxjs/operators';



@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  idPedido: string;
  datosPedido: any;
  gTotal: number;
  porcentajePropina: string;
  calcularPropina: number;
  detallesRestaurante: any;
  fechaEntrega: string;
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
      this.idPedido = p.idPedido;
      this.cargarDatosPedido()
    });
  }

  cargarDatosPedido() {
    this.bd.getPedidoID(this.idPedido).subscribe((dPGB: any[]) => {
      if (dPGB[0].horaEntrega) {
        this.fechaEntrega = dPGB[0].horaEntrega.substring(0, 15);
      }
      this.bd.getDetallesPedido(this.idPedido).subscribe((r: any) => {

        this.datosPedido = r;
        this.porcentajePropina = Number(dPGB[0].propina).toString();
        this.calcularPropina = Number(this.datosPedido.informacion.costo * (Number(dPGB[0].propina / 100)));


        this.gTotal = Number(this.datosPedido.informacion.costo) + Number(this.datosPedido.informacion.costoenvio) + Number(this.calcularPropina);
        console.log(r);
        this.bd.getDetallesRestauranteID(r.informacion.idRestaurante).subscribe(dR => {
          this.detallesRestaurante = dR[0];
          this.bd.validarPagoEnLinea(this.idPedido).subscribe((r: any) => {
            console.log(r);
            if (r.ok == 1) {
              this.datosPago = {
                serializableData: r.serializableData,
                error_message: r.error_message,
                url: r.url,
                idPedido: this.idPedido,
                cobrar: 0
              }
              this.bd.getDatosPedidos(this.idPedido).pipe(first()).subscribe((rFb: any) => {
                this.datosPago.cobrar = rFb[0].costo;
                rFb[0].statusPago = r.serializableData;
                this.bd.crearPedidoFB(rFb[0]);
              });
            }
          });
        });
      })
    });
  }

  cobrarDeNuevo() {
    this.bd.cobrarEnLinea(this.datosPago.idPedido, this.gTotal).subscribe((r: any) => {
      // console.log(r);
      if (r.estado == 'OK') {
        window.location.href = r.url;
      }
    });
  }
}

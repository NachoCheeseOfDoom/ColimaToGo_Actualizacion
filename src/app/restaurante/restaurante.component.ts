import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { IRestaurantes, IMenuRestaurante, ICategorias } from '../interfaces/interfaces';

@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  nombreRestaurante: string;
  detalleRestaurante: IRestaurantes;

  menu: IMenuRestaurante[] = [];
  categorias: ICategorias[] = [];
  constructor(
    private parametros: ActivatedRoute,
    private bd: DatabaseService
  ) { }

  ngOnInit(): void {
    alert();
    this.parametros.params.subscribe(p => {
      this.nombreRestaurante = p.nombre;     
        this.bd.getDetallesRestaurante(this.nombreRestaurante).subscribe((r: IRestaurantes[]) => {
          console.warn(r.length);
          this.detalleRestaurante = r[0];
          this.getCategorias();
          this.getMenu();
        });
    });
  }

  getCategorias() {
    this.bd.getCategoriasRestaurante(this.detalleRestaurante.idR).subscribe((r: ICategorias[]) => {
      this.categorias = r;
      console.log(r);

    });
  }


  getMenu() {
    this.bd.getMenuRestaurante(this.detalleRestaurante.idR).subscribe((r: IMenuRestaurante[]) => {
      this.menu = r;
      console.warn(r);

    });
  }

  filtrarCategorias(idCategoria: string) {

  }

}

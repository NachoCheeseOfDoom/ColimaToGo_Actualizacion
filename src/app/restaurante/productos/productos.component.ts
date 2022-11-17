import { Component, OnInit } from '@angular/core';
import { IRestaurantes, IMenuRestaurante, ICategorias, ICategoriaMenu } from '../../interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  nombreRestaurante: string;
  detalleRestaurante: IRestaurantes;
  tipoDispositivo: boolean;

  idCategoriaVer: number;

  categoriasMenu: ICategoriaMenu[] = [];
  verCategoriasMenu: ICategoriaMenu[] = [];

  menu: IMenuRestaurante[] = [];
  categorias: ICategorias[] = [];
  contactoEmpresa: any[] = [];
  constructor(
    private parametros: ActivatedRoute,
    private bd: DatabaseService
  ) { }

  ngOnInit(): void {
    this.queES();
    this.parametros.params.subscribe(p => {
      this.nombreRestaurante = p.nombre;
      if (this.nombreRestaurante == "Melania") {
        window.location.href = "https://melaniachepe.myshopify.com/collections/todos";
      } else {
        this.bd.getDetallesRestaurante(this.nombreRestaurante).subscribe((r: IRestaurantes[]) => {
          if (r.length == 0) {
            this.bd.getDetallesRestauranteCorto(this.nombreRestaurante).subscribe((r: IRestaurantes[]) => {
              this.detalleRestaurante = r[0];
              this.getCategoriasMenu();
              this.idCategoriaVer = 0;
            });
          } else {
            this.detalleRestaurante = r[0];
            this.getCategoriasMenu();
            this.idCategoriaVer = 0;
          }
        });
      }
    });
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

  getCategorias() {
    this.bd.getCategoriasRestaurante(this.detalleRestaurante.idR).subscribe((r: ICategorias[]) => {
      this.categorias = r;
    });
  }

  getCategoriasMenu() {
    this.bd.getContactoRestaurante(this.detalleRestaurante.idR).subscribe((r: any[]) => {
      this.contactoEmpresa = r;
    });
    this.bd.getMenuCategoriaRestaurante(this.detalleRestaurante.idR).subscribe((r: ICategoriaMenu[]) => {
      this.categoriasMenu = r;
      this.categoriasMenu.unshift({
        idCategoria: 0,
        nombreCategoria: 'Todas',
        productoCategoria: null,
      });
      this.filtrarCategorias();
    });
  }


  getMenu() {
    this.bd.getMenuRestaurante(this.detalleRestaurante.idR).subscribe((r: IMenuRestaurante[]) => {
      this.menu = r;
    });
  }

  filtrarCategorias() {
    if (this.idCategoriaVer != 0) {
      this.verCategoriasMenu = [];
      this.verCategoriasMenu[0] = this.categoriasMenu.find(x => x.idCategoria === this.idCategoriaVer);
    } else {
      this.verCategoriasMenu = this.categoriasMenu;
    }
    console.log(this.verCategoriasMenu);

    console.log(this.verCategoriasMenu[0].productoCategoria);
  }

}

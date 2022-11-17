import { Component, OnInit } from '@angular/core';
import { IRestaurantes, ICategoriaMenu, IMenuRestaurante, ICategorias } from '../interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-carniceria',
  templateUrl: './carniceria.component.html',
  styleUrls: ['./carniceria.component.css']
})
export class CarniceriaComponent implements OnInit {
  nombreRestaurante: string;
  detalleRestaurante: IRestaurantes;
  tipoDispositivo: boolean;

  idCategoriaVer: number;

  categoriasMenu: ICategoriaMenu[] = [];
  verCategoriasMenu: ICategoriaMenu[] = [];

  menu: IMenuRestaurante[] = [];
  categorias: ICategorias[] = [];
  constructor(
    private parametros: ActivatedRoute,
    private bd: DatabaseService
  ) { }

  ngOnInit(): void {
    this.queES();
    this.parametros.params.subscribe(p => {
      this.nombreRestaurante = p.nombreCarniceria;
      this.bd.getDetallesRestaurante(this.nombreRestaurante).subscribe((r: IRestaurantes[]) => {
        this.detalleRestaurante = r[0];
         this.getCategoriasMenu();
        this.idCategoriaVer = 0;
        // this.getMenu();
      });
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



  getCategoriasMenu() {
    console.log(this.detalleRestaurante.idR);
    
    this.bd.getMenuCategoriaCarniceria(this.detalleRestaurante.idR).subscribe((r: ICategoriaMenu[]) => {
      this.categoriasMenu = r;
      console.log(r);
      
      this.categoriasMenu.unshift({
        idCategoria: 0,
        nombreCategoria: 'Todas',
        productoCategoria: null,
      });
      this.verCategoriasMenu = this.categoriasMenu;
      //this.filtrarCategorias();
    });
  }


}

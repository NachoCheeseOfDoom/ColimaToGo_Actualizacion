import { Component, OnInit } from '@angular/core';
import { IRestaurantes } from '../../interfaces/interfaces';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit {
  listaRestaurantes: IRestaurantes[] = [];
  constructor(
    private bd: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.cargaRestaurantes();
  }
  cargaRestaurantes() {
    this.bd.getRestaurantes().subscribe(r => {
      //for (const iterator of r) {
      //  iterator.aleatorio = (Math.random() * (100 - 1) + 1);
      //}
      //this.ordenarAsc(r, 'aleatorio');
      this.listaRestaurantes = r;
    });
  }

  ordenarAsc(p_array_json, p_key) {
    p_array_json.sort(function (a, b) {
       return a[p_key] - b[p_key];
    });
 }

}

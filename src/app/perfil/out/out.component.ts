import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-out',
  templateUrl: './out.component.html',
  styleUrls: ['./out.component.css']
})
export class OutComponent implements OnInit {

  constructor(
    private aut: AuthService
  ) { }

  ngOnInit(): void {
  this.aut.loginGoogle();
  }
}

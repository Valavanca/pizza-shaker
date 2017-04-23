import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(public dialog: MdDialog) { }

  ngOnInit() {
  }

  openLogin() {
    this.dialog.open(LoginComponent);
  }
  openRegister() {
    this.dialog.open(RegisterComponent);
  }

}

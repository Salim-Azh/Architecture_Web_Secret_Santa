import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  imgUrl: string = "../../assets/favicon.ico";
  display: boolean = false;
  current = 1;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  logout(): void {
    this.auth.logoutUser()
  }

  isLogged(): boolean {
    return this.auth.isLoggedIn()
  }

  navigate(): void {
    if (this.isLogged()) {
      this.router.navigate(['/home']);
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  show(): void {
    this.display = !this.display;
  }

}

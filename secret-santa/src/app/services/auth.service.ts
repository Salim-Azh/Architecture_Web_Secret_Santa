import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private registerUrl = "http://localhost:8081/register"; 
  private loginUrl = "http://localhost:8081/login";

  constructor(private http: HttpClient, private router: Router) { }

  public registerUser(user): Observable<any>{
    return this.http.post<any>(this.registerUrl, user); // return an Observable
  }

  public loginUser(user): Observable<any>{
    return this.http.post<any>(this.loginUrl, user);
  }

  //auth guard
  public isLoggedIn():boolean{
    return !!localStorage.getItem('token');
  }

  public logoutUser():void{
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }

  //token interceptor service
  public getToken():string{
    return localStorage.getItem('token');
  }
}

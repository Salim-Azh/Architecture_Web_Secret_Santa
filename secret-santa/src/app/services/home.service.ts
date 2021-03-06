import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private homeUrl = "/home";
  private invitUrl = "/home/invits"

  constructor(private http: HttpClient) { }

  public getUserName(): Observable<any>{
    return this.http.get<any>(this.homeUrl);
  }
  public getInvits() : Observable<any>{
    return this.http.get<any>(this.invitUrl);
  }
}

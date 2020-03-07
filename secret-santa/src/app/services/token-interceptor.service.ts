import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

//HttpInterceptor interface that allows to send our tocken
//from browser to server. It intercept() outgoing httprequest
// transform them and then sends it to the server 

export class TokenInterceptorService implements HttpInterceptor{

  // injector : used to get an instance of the auth service 
  // auth service is injected with injector instead of
  // directly inject it in the constructor to avoid 
  // cycle depency error 
  constructor(private injector: Injector) { }

  
  intercept(req: HttpRequest<any>, next:HttpHandler){
    let authService = this.injector.get(AuthService); // Injection of AuthService
    let clone = req.clone({
      //Add Authorization to the http request headers
      setHeaders: {
        Authorization : `Bearer ${authService.getToken()}`
      }
    })
    return next.handle(clone);
  }
}

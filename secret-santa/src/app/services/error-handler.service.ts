import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError, Observable, Subject } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements HttpInterceptor{

  errTxt : string = "";
  constructor(private router:Router) { }

  //private _message: Subject<string> = new Subject<string>();
  // cast to observable to avoid subscribers of our service to be
  // able to push new values to our subject without going through our CRUD methods
  //readonly message = this._message.asObservable(); 

  /*get todos() {
    return this._message.asObservable();
  }*/
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    return next.handle(req).pipe(retry(1),
        catchError((error: HttpErrorResponse) => { 
         
          if (error.error instanceof ErrorEvent) { 
            // client-side error 
            let err = `Error: ${error.error.message}`; 
            window.alert(err)
          } 
          else {
            // server-side error
            if (error.status === 401) {
              localStorage.removeItem('token')
              this.router.navigate(['/login']);
              this.errTxt = error.status+ " " + error.statusText;
              //this._message.next(this.errTxt);
            }
            if (error.status === 404) {
              this.errTxt = error.status+ " " + error.statusText;
              //console.log(this.errTxt);
              this.router.navigate(['/notfound']);
              
            }
            if (error.status === 500) {
              this.errTxt = error.status+ " " + error.statusText;
             // this._message.next(this.errTxt);
              window.alert(this.errTxt);
              //console.log(this._message);
            }
          }
          return throwError(error);
        })
      )
  }
}

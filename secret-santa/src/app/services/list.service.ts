import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ListService {
  
  private listsUrl = "http://localhost:8081/mylists";
  private listDetailsUrl  = "http://localhost:8081/mylists/details";
  private listDetailsForGroupUrl = "http://localhost:8081/mylists/details/grp";
  private selectGiftUrl = "http://localhost:8081/mylists/details/selectgift";
  private checkOwnerUrl = "http://localhost:8081/check/lists";

  constructor(private http: HttpClient) { }

  /* 
  * A Subject is a special type of Observable that allows 
  * values to be multicasted to many Observers. Subjects are 
  * like EventEmitters.
  * Every Subject is an Observable and an Observer. 
  * So we can call next method manually
  */
  private _listners = new Subject<any>()

  listen() : Observable<any> {
    return this._listners.asObservable();
  }

  feed() {
    this._listners.next();
  }

  /**
   * checkOwer
   */
  public checkListOwer(idList) : Observable<any>{
    return this.http.get<any>(this.checkOwnerUrl+"/"+idList);
  }

  public getLists(): Observable<any>{
    return this.http.get<any>(this.listsUrl);
  }

  public addList(list): Observable<any>{
    return this.http.post<any>(this.listsUrl,list)
  }
  
  public getListDetails(idList : number | string): Observable<any>{
    return this.http.get<any>(this.listDetailsUrl+'/'+idList);
  }
  
  public changeListName(idList:number|string, name:string): Observable<any>{
    return this.http.put<any>(this.listDetailsUrl+"/"+idList, JSON.stringify(name));
  }

  public deleteList(idList : number|string): Observable<any>{
    return this.http.delete<any>(this.listsUrl+"/"+idList)
  }
  
  public addGift(gift): Observable<any> {
    return this.http.post<any>(this.listDetailsUrl+'/'+gift.FK_idList,gift);
  }

  public deleteGift(FK_idList:number|string,idGift:number|string): Observable<any> {
    return this.http.delete<any>(this.listDetailsUrl+'/'+FK_idList+"/"+idGift);
  }
  
  public updateGift(FK_idList,idGift, gift): Observable<any>{
    return this.http.put<any>(this.listDetailsUrl+'/'+FK_idList+"/"+idGift, JSON.stringify(gift));
  }

  public shareList(idList,idGroup){
    return this.http.put<any>(this.listsUrl+"/"+idList,idGroup);
  }

  public selectGift(gift:any):Observable<any>{
    return this.http.put<any>(this.selectGiftUrl,JSON.stringify(gift));
  }

  public getListDetailsForGrp(idList : number | string): Observable<any>{
    return this.http.get<any>(this.listDetailsForGroupUrl+'/'+idList);
  }
}

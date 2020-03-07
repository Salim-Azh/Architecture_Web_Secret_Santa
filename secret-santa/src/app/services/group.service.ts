import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
    
  private grpUrl = "/groups"
  private checkGrpUrl = "/check/groups";
  private groupInvitUrl = "/groups/invitation";

  private _listners = new Subject<any>()

  constructor(private http: HttpClient) { }

  listen() : Observable<any> {
    return this._listners.asObservable();
  }

  feed() {
    this._listners.next();
  }

  public checkGroupAccess(idGrp) : Observable<any>{
    return this.http.get<any>(this.checkGrpUrl+"/"+idGrp);
  }

  public getGroups(): Observable<any>{
    return this.http.get<any>(this.grpUrl);
  }

  public addGrp(grp): Observable<any> {
    return this.http.post<any>(this.grpUrl, grp)
  }

  public deleteGroup(idGroup: number) : Observable<any> {
    return this.http.delete<any>(this.grpUrl+"/"+idGroup);
  }

  public invit(search,grpid): Observable<any>{
    return this.http.post<any>(this.grpUrl+"/"+grpid,search)
  }

  public getGroupDetails(grpid): Observable<any>{
    return this.http.get<any>(this.grpUrl+"/"+grpid);
  }

  public isAdmin(grpid): Observable<any>{
    return this.http.get<any>(this.grpUrl+"/admin/"+grpid);
  }

  public addMember(invitation):Observable<any>{
    return this.http.post<any>(this.groupInvitUrl,invitation);
  }

  public refuseInvitation(idInvitation:number):Observable<any>{
    return this.http.delete<any>(this.groupInvitUrl+"/"+idInvitation);
  }

  public getGrpWithNoList():Observable<any>{
    return this.http.get<any>(this.grpUrl+"/toshare")
  }

  public getListId(username:string, idGroup:string|number):Observable<any>{
    return this.http.get<any>(this.grpUrl+"/"+idGroup+"/"+username);
  }

  public deleteMember(username:string,idGroup:string|number):Observable<any>{
    return this.http.delete<any>(this.grpUrl+"/"+idGroup+"/"+username);
  }
}

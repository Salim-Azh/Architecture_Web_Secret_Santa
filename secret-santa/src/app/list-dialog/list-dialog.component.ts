import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ListService } from '../services/list.service';
import { AuthService } from '../services/auth.service';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'list-dialog',
  templateUrl: './list-dialog.component.html',
  styleUrls: ['./list-dialog.component.scss']
})
export class ListDialogComponent implements OnInit {

  public gifts = []; //all the list gift's
  public listName="";
  public ok:boolean;
  public username:string;
  public currentSessionUsername:string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private listService: ListService,
    private homeService: HomeService) { 

      this.listService.listen().subscribe({
        next: () =>{ //any event
          this.refresh(); //we call refresh
        }
      });
  }

  ngOnInit(): void {
    if (this.data.idList === "none") {
      this.ok=false;
    }
    else {
      this.ok=true;
      this.listService.feed();
    } 
    this.username= this.data.usrname;
  }

  public refresh(){
    this.homeService.getUserName().subscribe({
      next:(res:any)=>{
        this.currentSessionUsername = res;

        this.listService.getListDetailsForGrp(this.data.idList).subscribe({
          next: (res)=>{
            this.gifts = [];
            
            for (let i = 0; i < res.rows.length-1; i++) {
              if (res.rows[i].username) {
                let msg="";
                if(res.rows[i].username == this.currentSessionUsername){
                  msg = "Vous avez sélectionné ce cadeau";
                }
                else{
                  msg = res.rows[i].username + " à sélectionné ce cadeau";
                }
                res.rows[i].msg = msg; 
              }
              this.gifts.push(res.rows[i]);
            }
            this.listName=res.rows[res.rows.length-1].listName
          }
        });
      }
    });
  }
  public select(idGift:number|string){
    let gift = {
      idGift:idGift,
      idList:this.data.idList
    }
    this.listService.selectGift(gift).subscribe({
      next:()=>{
        this.listService.feed()
      }
    })
  }

  public cancel(idGift:number|string){
    let gift = {
      idGift:idGift,
      idList:this.data.idList,
      cancel:true
    }
    this.listService.selectGift(gift).subscribe({
      next:()=>{
        this.listService.feed()
      }
    })
  }
}


import { Component, OnInit } from '@angular/core';
import { HomeService } from '../services/home.service';
import { GroupService } from '../services/group.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  public username:string;
  public invits = [];

  constructor(
    private homeService: HomeService,
    private groupService:GroupService) {

      this.groupService.listen().subscribe({
        next: () =>{ //any event
          this.refresh(); //we call refresh
        }
      })
    }

  ngOnInit(): void {

    this.homeService.getUserName().subscribe({
      next: (res:any)=>{
        this.username = res;
      }
    });

    this.groupService.feed();
  }

  acceptInvit(index){
    let invitation = this.invits[index];
    this.groupService.addMember(invitation).subscribe({
      next:()=> {
        this.groupService.feed();
      }
    })
  }

  refresh(){
    this.invits=[];
    this.homeService.getInvits().subscribe({
      next: res=>{
        for (let i = 0; i < res.length; i++) {
          let id = res[i].idInvitation;
          let grpid = res[i].FK_idGrp; 
          let msg = res[i].sender+" vous a invité à rejoindre "+res[i].grpName+" "+res[i].invitationDate;
          let row = {id,grpid,msg};
          this.invits.push(row);
        }
      }
    }); 
  }
  
  refuseInvit(index){
    let idInvitation = this.invits[index].id;
    this.groupService.refuseInvitation(idInvitation).subscribe({
      next: ()=>{
        this.groupService.feed();
      }
    })
  }
}

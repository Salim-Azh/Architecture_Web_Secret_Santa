import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../services/group.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListService } from '../services/list.service';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ListDialogComponent } from '../list-dialog/list-dialog.component';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'group-details',
  templateUrl: './group-details.component.html',
  styleUrls: []
})
export class GroupDetailsComponent implements OnInit {

  idgroup:string;
  ok:boolean;
  isAdmin:boolean;
  form:FormGroup;
  grpName:string;
  idMyList:number;
  memberListid:number;
  currentSessionUsername:string;
  members=[];

  placement: string = 'top';
  popoverTitle: string = 'Attention !';
  popoverMessage: string = 'Cette action va retirer ce membre et sa liste du groupe de façon definitive<br><p class="text-center bold">Etes vous sûr ?</p>';
  confirmText: string = 'Oui <i class="glyphicon glyphicon-ok"></i>';
  cancelText: string = 'Non <i class="glyphicon glyphicon-remove"></i>';
  confirmClicked: boolean = false;
  cancelClicked: boolean = false;

  popoverMessage2: string = 'Vous allez quitter le groupe de façon definitive<br><p class="text-center bold">Etes vous sûr ?</p>';

  constructor(
    private router:Router, 
    private groupService: GroupService,
    private listService:ListService,
    private homeService:HomeService,
    private formBuilder:FormBuilder,
    private matDialog: MatDialog) { 

      this.groupService.listen().subscribe({
        next: ()=>{
          this.refresh();
        }
      })
    }

  public ngOnInit(): void {
    this.idgroup =  this.router.url.split('/')[2];
    
    this.groupService.checkGroupAccess(this.idgroup).subscribe({
      next : (res:any) =>{
        if (res === 1) {
          this.ok = true;
        }
        else{
          this.ok = false;
        }
      }
    });

    this.groupService.isAdmin(this.idgroup).subscribe({
      next: (res:any) =>{
        if (res === 1) {
          this.isAdmin = true;
        }
        else{
          this.isAdmin = false;
        }
      }
    })

    this.form = this.formBuilder.group({
      username:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(25)]
      ]
    });

    this.homeService.getUserName().subscribe({
      next:(res:any)=>this.currentSessionUsername=res
    })

    this.groupService.feed();
  }

  public invit(): void{
    this.groupService.invit(this.form.value, this.idgroup).subscribe({
      next: (res:any)=> console.log(res)
    });
  }

  public refresh(): void{
    this.members = []  

    this.groupService.getGroupDetails(this.idgroup).subscribe({
      next: (res)=>{
        for (let i = 0; i < res.rows.length-2; i++) {
          this.members.push(res.rows[i]);
        }
        this.grpName = res.rows[res.rows.length-2].grpName;
        if (res.rows[res.rows.length-1]) {
          this.idMyList = res.rows[res.rows.length-1].idList;
        }
        // console.log(this.grpName);
        // console.log(this.members);
      }
    });
  }

  public navigateToMyListDetails(){
    this.listService.checkListOwer(this.idMyList).subscribe({
      next: () => {
        this.router.navigate(['/mylists/details/'+this.idMyList]);
      }
    })
  }

  public consult(username){
    this.groupService.getListId(username, this.idgroup).subscribe({
      next:(res:any)=>{
        if (res[0]) {
          this.memberListid=res[0].idList;
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {idList: this.memberListid,usrname:username};
          this.matDialog.open(ListDialogComponent, dialogConfig);
        }
        else{
          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {idList: "none", usrname: username};
          this.matDialog.open(ListDialogComponent, dialogConfig);
        }
      }
    });
  }

  deleteMember(username:string){
    this.groupService.deleteMember(username,this.idgroup).subscribe({
      next:()=>{
        if (this.currentSessionUsername===username) {
          this.router.navigate(['/groups']);
        } else {
          this.groupService.feed();
        }
        this.confirmClicked = true;
      }
    })
  }

}

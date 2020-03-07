import { Component, OnInit } from '@angular/core';
import { GroupService } from '../services/group.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  public groups=[];
  
  placement: string = 'top';
  popoverTitle: string = 'Attention !';
  popoverMessage: string = 'Cette action va supprimer le groupe de façon definitive<br><p class="text-center bold">Etes vous sûr ?</p>';
  confirmText: string = 'Oui <i class="glyphicon glyphicon-ok"></i>';
  cancelText: string = 'Non <i class="glyphicon glyphicon-remove"></i>';
  confirmClicked: boolean = false;
  cancelClicked: boolean = false;

  constructor(private groupService : GroupService, private router:Router) {
    this.groupService.listen().subscribe({
      next: ()=>{
        this.refresh();
      }
    })
  }

  ngOnInit(): void {
    this.groupService.feed()
  }

  refresh(){
    this.groupService.getGroups()
      .subscribe({
        next: (res) => {
          this.groups = [];
          for (let i = 0; i < res.rows.length; i++) {
            this.groups.push(res.rows[i]);
          }
        }
      });
  }

  deleteGroup(idGroup : number){
    this.groupService.deleteGroup(idGroup).subscribe({
      next: ()=> {
        this.groupService.feed();
        this.confirmClicked = true;
      }
    });
  }

  navigateToGroup(idGrp){
    this.groupService.checkGroupAccess(idGrp).subscribe({
      next: ()=>{
        this.router.navigate(['/groups/'+idGrp]);
      }
    })
    
  }
}

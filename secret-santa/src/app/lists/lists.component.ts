import { Component, OnInit } from '@angular/core';
import { ListService } from '../services/list.service';
import { Router } from '@angular/router';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ShareListDialogComponent } from '../share-list-dialog/share-list-dialog.component';


@Component({
  selector: 'lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

  public lists = [];
  
  placement: string = 'top';
  popoverTitle: string = 'Attention !';
  popoverMessage: string = 'Cette action va supprimer la liste et ces cadeaux de façon definitive<br><p class="text-center bold">Etes vous sûr ?</p>';
  confirmText: string = 'Oui <i class="glyphicon glyphicon-ok"></i>';
  cancelText: string = 'Non <i class="glyphicon glyphicon-remove"></i>';
  confirmClicked: boolean = false;
  cancelClicked: boolean = false;

  constructor(
    private listService : ListService, 
    private router : Router,
    private matDialog: MatDialog ) {

      /**
       * suscribe() registers the given Observer in a list of Observers, 
       * similarly to how addListener usually works in other 
       * libraries and languages
       * 
       * next() will be multicasted to the Observers registered to listen to the Subject 
       */
      this.listService.listen().subscribe({
        next: () =>{ //any event
          this.refresh(); //we call refresh
        }
      })
  };

  refresh(){
    this.listService.getLists()
      .subscribe({
        next: (res) => {
          this.lists = [];
          for (let i = 0; i < res.rows.length; i++) {
            this.lists.push(res.rows[i]);
          }
        }
      });
  }

  ngOnInit(): void {
    this.listService.feed();
  }

  navigateToDetails(idList){
    this.listService.checkListOwer(idList).subscribe({
      next: () => {
        this.router.navigate(['/mylists/details/'+idList]);
      }
    })
    
  }

  deleteList(idList : number){
    this.listService.deleteList(idList)
      .subscribe({
        next: (res)=> {
          this.refresh()
          //console.log(res)
        }
      }); 
  }

  share(index){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {id:index};
      this.matDialog.open(ShareListDialogComponent, dialogConfig);
  }
}

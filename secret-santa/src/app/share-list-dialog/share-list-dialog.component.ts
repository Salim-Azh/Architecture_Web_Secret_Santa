import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GroupService } from '../services/group.service';
import { ListService } from '../services/list.service';

@Component({
  selector: 'app-share-list-dialog',
  templateUrl: './share-list-dialog.component.html',
  styleUrls: ['./share-list-dialog.component.scss']
})
export class ShareListDialogComponent implements OnInit {

  public groups = [];
  public radioSelected: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ShareListDialogComponent>,
    private groupService: GroupService,
    private listService:ListService) { }

  ngOnInit(): void {
    this.refresh();
  }

  close() {
    this.dialogRef.close();
  }
  
  refresh(){
    this.groupService.getGrpWithNoList().subscribe({
      next: (res)=>{
        this.groups=[];
        for (let i = 0; i < res.length; i++) {
          this.groups.push(res[i]);
        }
        console.log(this.groups);
      }
    })
  }

  share(){
    //console.log(this.radioSelected);
    //console.log(this.data.id);
    this.listService.shareList(this.data.id, this.radioSelected).subscribe({
      next:()=>{
        this.listService.feed();
        this.close();
      }
    })
  }
}

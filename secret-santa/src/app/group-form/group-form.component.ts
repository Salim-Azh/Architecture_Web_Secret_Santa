import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroupService } from '../services/group.service';

@Component({
  selector: 'group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent implements OnInit {

  public displayForm :boolean = false;
  public form:FormGroup;

  constructor(private formBuilder:FormBuilder, private groupService : GroupService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['',[
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(25)]
      ]
    })
  }

  addGrp(){
    this.groupService.addGrp(this.form.value)
      .subscribe({
        next: (res)=>{
          console.log(res);
          this.display();
          this.groupService.feed();
        }
      })
  }
  
  display(){
    this.displayForm = !this.displayForm;
  }
}

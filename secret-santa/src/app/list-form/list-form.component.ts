import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ListService } from '../services/list.service';

@Component({
  selector: 'list-form',
  templateUrl: './list-form.component.html',
  styleUrls: ['./list-form.component.scss']
})
export class ListFormComponent implements OnInit {

  public displayForm :boolean = false;
  public form:FormGroup;
  
  constructor(private formBuilder:FormBuilder, private listService: ListService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['',[
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(25)]
      ]
    })
  }

  addList(){
    this.listService.addList(this.form.value)
      .subscribe({
        next: (res) =>{
          this.display();
          this.listService.feed();
          //this.form.reset({name:''})
        }
      }) 
  }

  display(){
    this.displayForm = !this.displayForm;
  }
  
}

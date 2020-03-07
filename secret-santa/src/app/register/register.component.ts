import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  form:FormGroup;

  mailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

  constructor(
      private formBuilder : FormBuilder,//reactive form object
      private auth:AuthService,
      private router: Router) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      username: ['',[
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(25)]
      ],
      mail : ['',[
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(this.mailPattern)]
      ],
      pwd : ['',[
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)]
      ]
    })
    console.log(this.form.get(name))
  }

  registerUser(){
    this.auth.registerUser(this.form.value)
      .subscribe(
        res => {
          this.router.navigate(['/login']);
        },
        err =>{
          //this.form.reset({ username: '', mail : '',pwd : ''})
        })
  }

}
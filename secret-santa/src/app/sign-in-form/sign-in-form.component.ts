import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss']
})
export class SignInFormComponent implements OnInit {

  form : FormGroup;
  
  mailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  
  message = ""
  
  constructor(
    private auth: AuthService,
    private router : Router,
    private formBuilder : FormBuilder,//reactive form object
    ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
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
  }

  closePopup(): void{
    this.message="";
  }

  loginUser(){
    this.auth.loginUser(this.form.value)
        .subscribe(
          res => {
            localStorage.setItem('token', res.token); // store key value token in local storage
            this.router.navigate(['/home']);
          },
          err => {
            this.message = err.error;
          });
    }
  }

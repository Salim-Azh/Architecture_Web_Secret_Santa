import { Component, OnInit } from '@angular/core';
import { ListService } from '../services/list.service';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'list-details',
  templateUrl: './list-details.component.html',
  styleUrls: []
})
export class ListDetailsComponent implements OnInit {

  gifts = []; //all the list gift's
  form: FormGroup;
  listName : string; //page title
  message = ''; //TODO FOR ERRORS
  idlist:string;
  owner : boolean;
  isShared : boolean;
  //state for gift forms visibility
  displayUpdateForm : boolean; 
  displayCreateForm : boolean; 

  public idGrp:number;
  public grpName:string;

  placement: string = 'top';
  popoverTitle: string = 'Attention !';
  popoverMessage: string = 'Cette action va supprimer le cadeau de la liste de façon definitive<br><p class="text-center bold">Etes vous sûr ?</p>';
  confirmText: string = 'Oui <i class="glyphicon glyphicon-ok"></i>';
  cancelText: string = 'Non <i class="glyphicon glyphicon-remove"></i>';
  confirmClicked: boolean = false;
  cancelClicked: boolean = false;
  popoverMessage2: string = 'Peut-être qu\'un utilistateur a sélectionné des cadeaux si vous retirez la liste du groupe ces informations seront perdues <br><p class="text-center bold">Etes vous sûr ?</p>';
  placement2: string = 'right';
  constructor(
    private listService: ListService, //for CRUD methods
    private router:Router, // for routing
    private formBuilder:FormBuilder) { 

      this.listService.listen().subscribe({
        next: ()=>{
          this.refresh();
        }
      });
    }

  ngOnInit(): void {
    this.idlist =  this.router.url.split('/')[3];
    this.listService.checkListOwer(this.idlist).subscribe({
      next : (res:any) =>{
        if (res === 1) {
          this.owner = true;
        }
        else{
          this.owner = false;
        }
      }
    });
    this.form = this.formBuilder.group({
      idGift:0,
      FK_idList:this.idlist,
      giftName:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(25)
      ]],
      giftPrice:['',[Validators.min(0)]],
      giftDescription:['',[Validators.maxLength(200)]],
      giftUrl:['',[Validators.maxLength(2048)]]
    });

    //hide the two forms
    this.displayCreateForm = false;
    this.displayUpdateForm = false;

    //get all the gifts and the list name
    this.listService.feed();
  };

  // it clears all previous form input's value's
  displayCreate(): void{
    this.displayCreateForm = !this.displayCreateForm;
    this.form.reset({
      FK_idList:this.idlist,
      giftName: '',
      giftPrice: '',
      giftDescription: '',
      giftUrl: ''
    })
  }

  hideUpdateForm(){
    this.displayUpdateForm=!this.displayUpdateForm
  }
  //scroll the web page to the top
  gotoTop():void {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: "smooth" 
    });
  }

  updateform(idG):void{
    //fill all update form input's with current value
    this.gifts.forEach(g => {
      if (g.idGift == idG) {
        this.form.reset({
          idGift: idG,
          FK_idList: this.idlist,
          giftName:g.giftName,
          giftPrice:g.giftPrice,
          giftDescription: g.giftDescription,
          giftUrl:g.giftUrl
        })
      }
    });

    //display form
    this.displayCreateForm=false;
    this.displayUpdateForm=true;

    //scroll to the top
    this.gotoTop();
  }

  updateGift():void{
    this.displayCreateForm = false;
    this.displayUpdateForm = false;
    this.listService.updateGift(this.form.get('FK_idList').value, this.form.get('idGift').value, this.form.value)
      .subscribe({
        next: (res) =>{
          this.listService.feed();
        }
      });
  }

  //calls the list service aggGift method subscribes to it and
  // refresh the view
  addGift(): void{
    this.listService.addGift(this.form.value)
      .subscribe({
        next: (res) => {
          this.displayCreate();
          this.listService.feed();
        }
      });
    
  }
  
  //subscribe to the Observable returned by the service function
  // and assign the gift list and the liste name  
  refresh(): void {
    this.gifts = []  
    this.listService.getListDetails(this.form.get('FK_idList').value)
      .subscribe({
        next: (res)=>{
          for (let i = 0; i < res.rows.length-3; i++) {
            this.gifts.push(res.rows[i]);
          }
          this.listName = res.rows[res.rows.length-3].listName;
          this.idGrp = res.rows[res.rows.length-2];
          this.grpName = res.rows[res.rows.length-1];

          if (this.idGrp) {
            this.isShared=true;
          }
          else{
            this.isShared=false;
          }
        }
      });
  }

  delete(idGift):void {
    this.listService.deleteGift(this.form.get('FK_idList').value,idGift)
      .subscribe({
        next: () =>{
          this.listService.feed();
        }
      });
  }

  removeList(){
    let idGrp=null
    this.listService.shareList(this.idlist, idGrp).subscribe({
      next: ()=>{
        this.listService.feed();
        this.confirmClicked=true;
      }
    })
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { ListService } from './services/list.service';
import { HomeService } from './services/home.service';
import { ErrorHandlerService } from './services/error-handler.service';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { RegisterComponent } from './register/register.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignInFormComponent } from './sign-in-form/sign-in-form.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ListsComponent } from './lists/lists.component';
import { GroupsComponent } from './groups/groups.component';
import { ListDetailsComponent } from './list-details/list-details.component';
import { ListFormComponent } from './list-form/list-form.component';
import { GroupFormComponent } from './group-form/group-form.component';
import { GroupService } from './services/group.service';
import { GroupDetailsComponent } from './group-details/group-details.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { ShareListDialogComponent } from './share-list-dialog/share-list-dialog.component';
import { ListDialogComponent } from './list-dialog/list-dialog.component';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { CountdownComponent } from './countdown/countdown.component';
import { CountdownModule } from "ng2-date-countdown";
@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    RegisterComponent,
    SignInComponent,
    SignInFormComponent,
    PageNotFoundComponent,
    HomePageComponent,
    ListsComponent,
    GroupsComponent,
    ListDetailsComponent,
    ListFormComponent,
    GroupFormComponent,
    GroupDetailsComponent,
    ShareListDialogComponent,
    ListDialogComponent,
    CountdownComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      focusButton: 'cancel',
      reverseButtonOrder: true,
      cancelButtonType:'warning'
    }),
    CountdownModule
  ],
  providers: [
    ListService,
    HomeService,
    AuthService, 
    AuthGuard,
    ErrorHandlerService,
    GroupService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerService,
      multi: true 
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ShareListDialogComponent,ListDialogComponent]
})
export class AppModule { }

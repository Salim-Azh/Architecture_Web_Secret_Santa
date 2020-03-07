import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthGuard } from './auth.guard';
import { ListsComponent } from './lists/lists.component';
import { GroupsComponent } from './groups/groups.component';
import { ListDetailsComponent } from './list-details/list-details.component';
import { GroupDetailsComponent } from './group-details/group-details.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', redirectTo: '/home', pathMatch: 'full'},
      { path: 'login', component: SignInComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'home', component: HomePageComponent, canActivate : [AuthGuard] },
      { path: 'mylists', component: ListsComponent, canActivate : [AuthGuard] },
      { path: 'groups', component: GroupsComponent, canActivate : [AuthGuard] },
      { path: 'mylists/details/:id', component: ListDetailsComponent, canActivate : [AuthGuard] },
      { path: 'groups/:id', component: GroupDetailsComponent, canActivate : [AuthGuard] },
      { path: 'notfound', component: PageNotFoundComponent },
      { path: '**', component: PageNotFoundComponent }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }

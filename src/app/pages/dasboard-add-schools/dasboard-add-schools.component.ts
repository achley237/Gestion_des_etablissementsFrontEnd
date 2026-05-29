import { Component } from '@angular/core';
import { SchoolRegisterComponent } from '../../components/school-register/school-register.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dasboard-add-schools',
  imports: [SchoolRegisterComponent , SidebarComponent, CommonModule],
  templateUrl: './dasboard-add-schools.component.html',
  styleUrl: './dasboard-add-schools.component.scss',
})
export class DasboardAddSchoolsComponent {}

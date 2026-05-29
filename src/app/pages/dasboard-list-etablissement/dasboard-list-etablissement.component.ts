import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ListEtablissementComponent } from '../../components/list-etablissement/list-etablissement.component';
import { SchoolListService, Establishment } from '../../services/Schools/schoolList.service';

@Component({
  selector: 'app-dasboard-list-etablissement',
  imports: [SidebarComponent, CommonModule, ListEtablissementComponent],
  templateUrl: './dasboard-list-etablissement.component.html',
  styleUrl: './dasboard-list-etablissement.component.scss'
})
export class DasboardListEtablissementComponent {}
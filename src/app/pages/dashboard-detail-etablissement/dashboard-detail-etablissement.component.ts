import { Component } from '@angular/core';
import { EtablissementDetailComponent } from '../../components/etablissement-detail/etablissement-detail.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-detail-etablissement',
  imports: [EtablissementDetailComponent, SidebarComponent, CommonModule],
  templateUrl: './dashboard-detail-etablissement.component.html',
  styleUrl: './dashboard-detail-etablissement.component.scss'
})
export class DashboardDetailEtablissementComponent {

}

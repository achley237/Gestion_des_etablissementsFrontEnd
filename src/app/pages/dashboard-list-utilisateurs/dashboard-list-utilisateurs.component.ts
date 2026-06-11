import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ListUtilisateurComponent } from '../../components/list-utilisateur/list-utilisateur.component';

@Component({
  selector: 'app-dashboard-list-utilisateurs',
  imports: [SidebarComponent,CommonModule,ListUtilisateurComponent],
  templateUrl: './dashboard-list-utilisateurs.component.html',
  styleUrl: './dashboard-list-utilisateurs.component.scss'
})
export class DashboardListUtilisateursComponent {

}

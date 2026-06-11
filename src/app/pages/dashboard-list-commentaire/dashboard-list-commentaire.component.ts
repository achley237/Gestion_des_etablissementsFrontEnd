import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ListCommentaireComponent } from '../../components/list-commentaire/list-commentaire.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-list-commentaire',
  imports: [SidebarComponent, ListCommentaireComponent, CommonModule],
  templateUrl: './dashboard-list-commentaire.component.html',
  styleUrl: './dashboard-list-commentaire.component.scss'
})
export class DashboardListCommentaireComponent {

}

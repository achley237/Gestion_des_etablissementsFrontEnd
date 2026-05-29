import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HomeContentComponent } from '../../components/home-content/home-content.component';

@Component({
  selector: 'app-dashboard-acceuil',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HomeContentComponent],
  templateUrl: './dashboard-acceuil.component.html',
  styleUrl: './dashboard-acceuil.component.scss',
})
export class DashboardAcceuilComponent {}
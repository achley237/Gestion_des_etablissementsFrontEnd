import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListUtilisateursComponent } from './dashboard-list-utilisateurs.component';

describe('DashboardListUtilisateursComponent', () => {
  let component: DashboardListUtilisateursComponent;
  let fixture: ComponentFixture<DashboardListUtilisateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardListUtilisateursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardListUtilisateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

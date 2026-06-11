import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListCommentaireComponent } from './dashboard-list-commentaire.component';

describe('DashboardListCommentaireComponent', () => {
  let component: DashboardListCommentaireComponent;
  let fixture: ComponentFixture<DashboardListCommentaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardListCommentaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardListCommentaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

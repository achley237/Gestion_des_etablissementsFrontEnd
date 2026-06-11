import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDetailEtablissementComponent } from './dashboard-detail-etablissement.component';

describe('DashboardDetailEtablissementComponent', () => {
  let component: DashboardDetailEtablissementComponent;
  let fixture: ComponentFixture<DashboardDetailEtablissementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDetailEtablissementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDetailEtablissementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

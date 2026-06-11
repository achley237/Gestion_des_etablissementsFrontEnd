import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentDetailModalComponent } from './establishment-detail-modal.component';

describe('EstablishmentDetailModalComponent', () => {
  let component: EstablishmentDetailModalComponent;
  let fixture: ComponentFixture<EstablishmentDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstablishmentDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

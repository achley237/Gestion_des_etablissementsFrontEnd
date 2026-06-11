import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtablissementDetailComponent } from './etablissement-detail.component';

describe('EtablissementDetailComponent', () => {
  let component: EtablissementDetailComponent;
  let fixture: ComponentFixture<EtablissementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtablissementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtablissementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

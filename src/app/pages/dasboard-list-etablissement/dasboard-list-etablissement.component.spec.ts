import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardListEtablissementComponent } from './dasboard-list-etablissement.component';

describe('DasboardListEtablissementComponent', () => {
  let component: DasboardListEtablissementComponent;
  let fixture: ComponentFixture<DasboardListEtablissementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DasboardListEtablissementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasboardListEtablissementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

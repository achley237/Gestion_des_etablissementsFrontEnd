import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceuilEtudiantsComponent } from './acceuil-etudiants.component';

describe('AcceuilEtudiantsComponent', () => {
  let component: AcceuilEtudiantsComponent;
  let fixture: ComponentFixture<AcceuilEtudiantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceuilEtudiantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceuilEtudiantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

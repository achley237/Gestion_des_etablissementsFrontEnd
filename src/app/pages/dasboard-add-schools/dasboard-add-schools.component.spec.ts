import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardAddSchoolsComponent } from './dasboard-add-schools.component';

describe('DasboardAddSchoolsComponent', () => {
  let component: DasboardAddSchoolsComponent;
  let fixture: ComponentFixture<DasboardAddSchoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DasboardAddSchoolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasboardAddSchoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

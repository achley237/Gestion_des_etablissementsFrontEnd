import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCommentaireComponent } from './list-commentaire.component';

describe('ListCommentaireComponent', () => {
  let component: ListCommentaireComponent;
  let fixture: ComponentFixture<ListCommentaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCommentaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCommentaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

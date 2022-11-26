import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesBuilderComponent } from './entities-builder.component';

describe('EntitiesBuilderComponent', () => {
  let component: EntitiesBuilderComponent;
  let fixture: ComponentFixture<EntitiesBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitiesBuilderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitiesBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { EntitiesBuilderService } from './entities-builder.service';

describe('EntitiesBuilderService', () => {
  let service: EntitiesBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntitiesBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

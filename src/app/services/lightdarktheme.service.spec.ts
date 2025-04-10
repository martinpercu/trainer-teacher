import { TestBed } from '@angular/core/testing';

import { LightdarkthemeService } from './lightdarktheme.service';

describe('LightdarkthemeService', () => {
  let service: LightdarkthemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightdarkthemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

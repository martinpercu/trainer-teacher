import { TestBed } from '@angular/core/testing';

import { ModalinfoService } from './modalinfo.service';

describe('ModalinfoService', () => {
  let service: ModalinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

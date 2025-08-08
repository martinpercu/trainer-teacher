import { TestBed } from '@angular/core/testing';

import { CandidateVisualService } from './candidate-visual.service';

describe('CandidateVisualService', () => {
  let service: CandidateVisualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidateVisualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

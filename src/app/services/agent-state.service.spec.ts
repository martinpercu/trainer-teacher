import { TestBed } from '@angular/core/testing';

import { AgentStateService } from './agent-state.service';

describe('AgentStateService', () => {
  let service: AgentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AgentSyncService } from './agent-sync.service';

describe('AgentSyncService', () => {
  let service: AgentSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

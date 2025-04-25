import { TestBed } from '@angular/core/testing';

import { TeacherCrudService } from './teacher-crud.service';

describe('TeacherCrudService', () => {
  let service: TeacherCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

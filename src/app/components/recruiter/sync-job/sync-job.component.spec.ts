import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncJobComponent } from './sync-job.component';

describe('SyncJobComponent', () => {
  let component: SyncJobComponent;
  let fixture: ComponentFixture<SyncJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncJobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

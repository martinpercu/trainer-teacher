import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncResumeComponent } from './sync-resume.component';

describe('SyncResumeComponent', () => {
  let component: SyncResumeComponent;
  let fixture: ComponentFixture<SyncResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

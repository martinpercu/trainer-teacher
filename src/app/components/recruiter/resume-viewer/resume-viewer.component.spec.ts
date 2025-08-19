import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeViewerComponent } from './resume-viewer.component';

describe('ResumeViewerComponent', () => {
  let component: ResumeViewerComponent;
  let fixture: ComponentFixture<ResumeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

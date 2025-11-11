import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AgentStateService {


  pagesSelected = signal<number[]>([4, 5, 6]);
  leftMenuCondition = signal<Boolean>(false);
  showModalInfo = signal<Boolean | undefined>(undefined);

  showRecruiterAccountEdit = signal<Boolean>(false);
  showMenuTopRight = signal<Boolean>(false);

  jobId = signal<string>('')


  constructor() { }

  togleShowLeftMenu() {
    this.leftMenuCondition.update(prevState => !prevState)
    console.log(this.leftMenuCondition());
  }

  handleMenuTopRightShow() {
    this.showMenuTopRight.update(prevState => !prevState)
    console.log(this.showMenuTopRight());
  }

  handleRecruiterAccountShow() {
    this.showRecruiterAccountEdit.update(prevState => !prevState)
    console.log(this.showRecruiterAccountEdit());
  }
}

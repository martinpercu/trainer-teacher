import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisualStatesService {

  pagesSelected = signal<number[]>([4, 5, 6]);
  leftMenuCondition = signal<Boolean>(false);
  showModalInfo = signal<Boolean | undefined>(undefined);


  constructor() { }

  togleShowLeftMenu() {
    this.leftMenuCondition.update(prevState => !prevState)
    console.log(this.leftMenuCondition());
  }


}

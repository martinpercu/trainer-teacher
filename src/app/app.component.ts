import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-teacher';

  authService = inject(AuthService);

  constructor() {
    const matIconRegistry = inject(MatIconRegistry);
    matIconRegistry.setDefaultFontSetClass('material-symbols-rounded');
  }


  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
}

import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { TokenService } from '../core/token/token.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isLoading: boolean = false; 

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
    ) {}

  logout(): void {
    this.isLoading = true;
    this.authService.logout().subscribe({
      next: () => {
        this.tokenService.clearSession(); 
        this.router.navigate(['/login']); 
        this.isLoading = false;
      },
      error: () => {
        this.tokenService.clearSession(); 
        this.router.navigate(['/login']);
        this.isLoading = false;
      }
    });
  }
}
import { Component } from '@angular/core';
import { Router, TitleStrategy } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { TokenService } from '../../core/token/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  loginSubmitted = false;
  isLoading = false;
  errorMessage: string = '';  
  serverValidationErrors: any = {};
  showPassword = false;
  passwordHasText = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm.statusChanges.subscribe(() => {
      if (this.loginForm.valid) {
        this.errorMessage = '';
        this.serverValidationErrors = {};
      }
    });
  }

  onSubmitLogin(): void {
    this.loginSubmitted = true;
    this.errorMessage = '';  
  
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.token) {
            this.tokenService.setSession(response.token); 
            this.router.navigate(['/calendar']);
            this.loginForm.reset();
            this.loginSubmitted = false;
            this.isLoading = false;
          } else {
            this.errorMessage = 'Error: No se recibió un token.';
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.handleError(error); 
          this.isLoading = false;
        },
      });
    } else {
      this.errorMessage = 'Por favor, completa los campos requeridos correctamente.';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  checkPasswordField() {
    const password = this.loginForm.get('password')?.value;
    this.passwordHasText = !!password?.trim();
  }
  
  private handleError(error: any) {
    this.errorMessage = error.message || 'Ocurrió un error inesperado.';
    this.serverValidationErrors = error.validationErrors || {};
  }

}

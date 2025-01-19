import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControlOptions, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-registre',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  users: UserModel[] = []; 
  registerSubmitted = false;
  isLoading = false;
  errorMessage: string = '';  
  serverValidationErrors: any = {}; 

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    const formOptions: AbstractControlOptions = { validators: this.passwordMatchValidator };

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]]
    }, formOptions); 

    this.registerForm.statusChanges.subscribe(() => {
      if (this.registerForm.valid) {
        this.errorMessage = '';
        this.serverValidationErrors = {};
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadUsers(); 
  }

  onSubmitRegister() {
    this.registerSubmitted = true;
    this.errorMessage = '';  

    if (this.registerForm.valid) {
      this.isLoading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.resetForm();  
          this.loadUsers(); 
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else {
      this.errorMessage = 'Por favor, completa los campos requeridos correctamente.';
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.isLoading = true;
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadUsers();
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm() {
    this.registerForm.reset();
    this.errorMessage = '';
    this.serverValidationErrors = {};
    this.registerSubmitted = false;
  }

  private handleError(error: any) {
    this.errorMessage = error?.message || 'Ocurrió un error inesperado.';
    this.serverValidationErrors = error.validationErrors || {};
    this.isLoading = false;
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../../services/services/service.service';
import { ServiceModel } from '../../models/service.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './service.component.html',
  styleUrl: './service.component.css'
})
export class ServiceComponent implements OnInit {

  services: ServiceModel[] = [];
  serviceForm: FormGroup;
  isEditing = false; 
  errorMessage: string = '';  
  serverValidationErrors: any = {};  
  isLoading = false;
  formSubmitted = false; 

  constructor(private serviceService: ServiceService, private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      id: [null], 
      name: ['', [Validators.required, Validators.maxLength(100)]],
      duration: ['', [Validators.required, Validators.min(1)]],
      precio: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.serviceForm.statusChanges.subscribe(() => {
      if (this.serviceForm.valid) {
        this.errorMessage = '';
        this.serverValidationErrors = {};
      }
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.serviceService.getAllServices().subscribe({
      next: (data: ServiceModel[]) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  createService() {
    this.formSubmitted = true;
    this.errorMessage = '';  
    this.serverValidationErrors = {};

    if (this.serviceForm.valid) {
      this.isLoading = true;
      this.serviceService.createService(this.serviceForm.value).subscribe({
        next: (response: ServiceModel) => {
          this.services.push(response); 
          this.resetForm();  
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error);
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Por favor, completa los campos requeridos correctamente.';
    }
  }

  updateService() {
    this.formSubmitted = true;
    this.errorMessage = '';  
    this.serverValidationErrors = {};

    if (this.serviceForm.valid) {
      const serviceId = this.serviceForm.get('id')?.value;
      this.isLoading = true;

      this.serviceService.updateService(this.serviceForm.value, serviceId).subscribe({
        next: () => {
          this.resetForm();  
          this.loadServices();  
        },
        error: (error) => {
          this.handleError(error);
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Por favor, completa los campos requeridos correctamente.';
    }
  }

  editService(service: ServiceModel) {
    this.isEditing = true;
    this.serviceForm.patchValue(service);
    this.formSubmitted = false; 
    this.errorMessage = '';
    this.serverValidationErrors = {};
  }

  deleteService(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.isLoading = true;
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          this.services = this.services.filter(service => service.id !== id);
          if (this.serviceForm.get('id')?.value === id) {
            this.resetForm();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error);
          this.isLoading = false;
        }
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }
  
  resetForm() {
    this.serviceForm.reset();
    this.isEditing = false;  
    this.errorMessage = '';
    this.serverValidationErrors = {};
    this.formSubmitted = false; 
  }

  private handleError(error: any) {
    this.errorMessage = error.message || 'Ocurrió un error inesperado.';
    this.serverValidationErrors = error.validationErrors || {};
  }
}

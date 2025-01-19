import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { ClientService } from '../../services/clients/client.service';
import { ClientModel } from '../../models/client.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-client',
  standalone: true,  
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  clients: ClientModel[] = [];
  newClient: ClientModel = { name: '', email: '', phone: '' };
  editingClient: ClientModel | null = null;
  isEditing = false; 
  clientForm: FormGroup;
  searchQuery: string = ''; 
  private searchSubject = new Subject<string>(); 
  isLoading: boolean = false; 
  errorMessage: string = '';
  serverValidationErrors: any = {};  
  formSubmitted: boolean = false;  

  constructor(private clientService: ClientService, private formBuilder: FormBuilder) {
    this.clientForm = this.formBuilder.group({
      id: [null], 
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone : ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
    });

    this.clientForm.statusChanges.subscribe(() => {
      if (this.clientForm.valid) {
        this.errorMessage = '';
        this.serverValidationErrors = {};
      }
    });
  }

  ngOnInit(): void {
    this.loadClients();

    this.searchSubject.pipe(
      debounceTime(700),  
      distinctUntilChanged(),
      filter(query => query.trim() !== ''), 
      switchMap(query => {
        return this.clientService.searchClients(query);  
      })
    ).subscribe({
      next: (clients) => {
        this.clients = clients;
        this.isLoading = false; 
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value; 
  
    this.searchQuery = query.trim(); 
  
  if (this.searchQuery === '') {
      this.loadClients(); 
      this.searchSubject.next(''); 
      return; 
    }
  
    this.isLoading = true; 
    this.searchSubject.next(query.trim()); 
  }
  
  loadClients(): void {
    this.isLoading = true; 
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  addClient() {
    this.formSubmitted = true;  
    this.errorMessage = '';  
    this.serverValidationErrors = {};
  
    if (this.clientForm.valid) {
      this.isLoading = true;
      this.clientService.createClient(this.clientForm.value).subscribe({
        next: (response: ClientModel) => {
          this.clients.push(response);
          this.resetForm();  
          this.loadClients();
          this.searchQuery = '';
          this.searchSubject.next(this.searchQuery); 
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

  updateClient() {
    this.formSubmitted = true;
    this.errorMessage = '';  
    this.serverValidationErrors = {};

    if (this.clientForm.valid) {
      const clientId = this.clientForm.get('id')?.value;
      this.isLoading = true;

      this.clientService.updateClient(clientId, this.clientForm.value).subscribe({
        next: (updatedClient) => {
          const index = this.clients.findIndex(c => c.id === updatedClient.id);
          if (index !== -1) {
            this.clients[index] = updatedClient;
          }
          this.resetForm();  
          this.loadClients();
          this.searchQuery = '';
          this.searchSubject.next(this.searchQuery); 
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

  editClient(client: ClientModel) {
    this.isEditing = true;
    this.clientForm.patchValue(client);
    this.formSubmitted = false; 
    this.errorMessage = '';
    this.serverValidationErrors = {};
  }

  deleteClient(id: number) {
    if (confirm('¿Estás seguro que quieres eliminar este cliente?')) {
      this.isLoading = true;
      this.clientService.deleteClient(id).subscribe({
        next: () => {
        this.clients = this.clients.filter(client => client.id !== id);
        if (this.clientForm.get('id')?.value === id) {
          this.resetForm();
        }
        this.loadClients();
        this.searchQuery = '';
        this.searchSubject.next(this.searchQuery); 
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
    this.clientForm.reset();
    this.isEditing = false;  
    this.errorMessage = '';
    this.serverValidationErrors = {};
    this.formSubmitted = false; 
  }

  private handleError(error: any) {
    this.errorMessage = error?.message || 'Ocurrió un error inesperado.';
    this.serverValidationErrors = error.validationErrors || {};
  }
}

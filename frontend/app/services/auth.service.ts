import { Injectable, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  deleted: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit, OnChanges {
  @Input()
  userLoggedIn!: boolean;
  apiUrl = 'https://localhost:3000';

  constructor(
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.updateAuthStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  isLoggedIn(): Observable<object> {
    return this.http.get(`${this.apiUrl}/login-check`);
  }

  login(name: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, {
      name,
      password
    });
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  assignNewPassword(name: string, password: string) {
    return this.http.put<User>(`${this.apiUrl}/reassign-password`, {
      name,
      password
    });
  }

  getUserByUsername(username: string) {
    const params = new URLSearchParams();
    params.append('name', username);

    return this.http.get<User[]>(`${this.apiUrl}/user-exists?${params.toString()}`);
  }

  updateAuthStatus() {
    this.isLoggedIn().subscribe(() => {
      this.userLoggedIn = true;
      console.log(true);
    }, () => {
      this.userLoggedIn = false;
    });
  }
}

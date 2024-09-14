import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private secretKey: string = "5c0305f2eefb43e553728ef2046bcf89062bd1439327f77b7bc997a19aa1b3ed";

  constructor(private http: HttpClient,  private authService: AuthService) { }

  // verifyUserExistance(data: any): Observable<any> {
  //   const JSONData = {
  //     "name": data
  //   };
  //   const url = 'http://localhost:3000/getUserExistance';
  //   return this.http.post<any>(url, JSONData); // Specify <any> as the response type
  // }

  verifyUserExistance(data: any): Observable<any> {
    const JSONData = {
      "name": data
    };
    const url = 'http://localhost:3000/getUserExistance';
    return this.http.post<any>(url, JSONData).pipe(
      tap(response => {
        if (response.token) {
          this.authService.setToken(response.token); // Save the token
        }
      })
    );
  }
  


  postUser(data: string): Observable<any> {
    const JSONData = { "name": data };
    const url = 'http://localhost:3000/auth-qr';
  
    return this.verifyUserExistance(data).pipe(
      switchMap(() => {
        const token = this.authService.getToken();
  
        if (!token) {
          return of({ "Error": "Token missing" }); // Handle missing token
        }
  
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
  
        return this.http.post<any>(url, JSONData, { headers }).pipe(
          tap(response => {
            if (response.token) {
              this.authService.setToken(response.token); // Optionally update token
            }
          })
        );
      })
    );
  }
  

  verifyCode(code: string, name: string): Observable<any> {
    const JSONData = { "code": code, "name": name };
    const url = 'http://localhost:3000/verify-token';

    // Retrieve the token from AuthService
    const token = this.authService.getToken();

    // Check if the token is available
    if (!token) {
      console.error('No token available for verification');
      return of({ "Error": "Token missing" }); // Handle missing token
    }

    // Set up headers with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Send the POST request with the token in headers
    return this.http.post(url, JSONData, { headers });
  }
}
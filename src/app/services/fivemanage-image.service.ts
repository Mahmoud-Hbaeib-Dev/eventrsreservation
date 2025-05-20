import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FivemanageImageService {
  private API_URL = 'https://api.fivemanage.com/api/image';
  private API_KEY = 'lCNVal7kLzBKR7r4bw7P2qIDaUaeRXmq'; // Provided token

  constructor(private http: HttpClient) {}

  uploadImage(file: File, metadata: any = {}): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const headers = new HttpHeaders({
      Authorization: this.API_KEY,
    });

    return this.http.post<any>(this.API_URL, formData, { headers }).pipe(
      map((res) => res.url), // Assuming the response has a 'url' field
      catchError((err) => {
        return throwError(
          () => new Error(err?.error?.message || 'Upload failed')
        );
      })
    );
  }
}

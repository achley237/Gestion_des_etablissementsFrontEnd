import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Ne pas rediriger si c'est la requête de login ou register elle-même
        const isAuthRequest = req.url.includes('/auth/login/')
                           || req.url.includes('/auth/register/');

        if (!isAuthRequest) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.navigate(['/auth/connexion']);
        }
      }
      return throwError(() => error);
    })
  );
};
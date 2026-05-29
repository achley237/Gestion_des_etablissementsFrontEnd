import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Injecter le Router ici (Contexte d'injection valide)
  const router = inject(Router);
  
  const token = localStorage.getItem('access_token');

  // Cloner la requête et ajouter le header Authorization si token présent
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expiré ou absent : nettoyer et rediriger
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // 2. Utiliser l'instance injectée plus haut
        router.navigate(['/auth/connexion']);
      }
      return throwError(() => error);
    })
  );
};
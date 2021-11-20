import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {
  }

  private getTranslationInternal(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }

  getTranslation(lang: string): Observable<Translation> {
    return forkJoin({
      default: this.getTranslationInternal(lang + '-default').pipe(
        catchError((err) => of(null))
      ),
      lang: this.getTranslationInternal(lang).pipe(
        catchError((err) => of(null))
      )
    }).pipe(
      map((res) => this.recursiveTranslationMapper(res.lang, res.default))
    );
  }

  private recursiveTranslationMapper(source: any, target: any) {
    if (target == null) {
      target = {};
    }

    if (source == null) {
      return target;
    }

    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object) {
        target[key] = this.recursiveTranslationMapper(source[key], target[key]);
      } else {
        target[key] = source[key];
      }
    }

    return target;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable ,  of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Tag } from './tag';
import { Datasource } from '../../../target/docker/src/app/datasource/Datasource';

@Injectable()
export class TagService {

  private tagsUrl = 'http://localhost:8701/api/v1/';
  // http://localhost:8701/api/v1/datasources/Vbox OPC datasource/tags

  constructor(private http: HttpClient) { }


  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.tagsUrl + 'tags')
    .pipe(
      catchError(this.handleError('getTags', []))
    );
  }

  getTagsFromDatasource(datasourceId: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.tagsUrl}datasources/${datasourceId}/tags`)
    .pipe(
      catchError(this.handleError('getTagsFromDatasource', []))
    );
  }

   /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.error(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
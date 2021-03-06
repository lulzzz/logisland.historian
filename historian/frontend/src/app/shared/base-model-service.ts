import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';

import { Utilities } from './utilities.service';
import { MessageService } from 'primeng/components/common/messageservice';


export interface IModelService<M> {

  getAll(): Observable<M[]>;

  get(id: string): Observable<M>;

  save(obj: M, id: string): Observable<M>;

  update(obj: M, id: string): Observable<M>;

  delete(id: string): Observable<M>;
}

export abstract class AbstractModelService<M> implements IModelService<M> {

  protected baseUrl: string;
  protected abstract objNameForMsg: string;

  constructor(protected http: HttpClient,
              protected help: Utilities,
              protected messageService: MessageService,
              baseUrl: string) {
                this.baseUrl = baseUrl;
              }


  getAll(): Observable<M[]> {
    return this.http.get<M[]>(`${this.baseUrl}`)
      .pipe(
        map(items => items.map(item => this.create(item))),
      );
  }

  get(id: string): Observable<M> {
    return this.http.get<M>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(
        map(item => this.create(item)),
      );
  }

  save(obj: M, id: string): Observable<M> {
    return this.http.post<M>(`${this.baseUrl}/${encodeURIComponent(id)}`, obj, { observe: 'response' }).pipe(
      tap(resp => {
        switch (resp.status) {
          case 200: {
            this.messageService.add({
              severity: 'success',
              summary: `successfully added ${this.objNameForMsg}`,
              detail: `Saved ${this.objNameForMsg} with id ${id}`,
            });
            break;
          }
          case 400: {
            this.messageService.add({
              severity: 'error',
              summary: `Could not add ${this.objNameForMsg}`,
              detail: `Invalid id ${id}`,
            });
            break;
          }
          default: {
            console.error(`createOrReplace(${obj}) failed`, resp);
            break;
          }
        }
      }),
      map(resp => this.create(resp.body))
    );
  }

  update(obj: M, id: string): Observable<M> {
    return this.http.put<M>(`${this.baseUrl}/${encodeURIComponent(id)}`, obj, { observe: 'response' }).pipe(
      tap(resp => {
        switch (resp.status) {
          case 200: {
            this.messageService.add({
              severity: 'success',
              summary: `successfully updated ${this.objNameForMsg}`,
              detail: `Updated ${this.objNameForMsg} with id ${id}`,
            });
            break;
          }
          case 400: {
            this.messageService.add({
              severity: 'error',
              summary: `Could not add ${this.objNameForMsg}`,
              detail: `Invalid id ${id}`,
            });
            break;
          }
          case 404: {
            this.messageService.add({
              severity: 'error',
              summary: `Could not add ${this.objNameForMsg}`,
              detail: `Id not found ${id}`,
            });
            break;
          }
          default: {
            console.error(`createOrReplace(${obj}) failed`, resp);
            break;
          }
        }
      }),
      map(resp => this.create(resp.body))
    );
  }

  delete(id: string): Observable<M> {
    return this.http.delete<M>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(
        tap(item => {
          this.messageService.add({
            severity: 'success',
            summary: `successfully deleted ${this.objNameForMsg}`,
            detail: `Deleted ${this.objNameForMsg} with id ${id}`,
          });
        }),
        map(item => this.create(item))
      );
  }

  protected abstract create(item: M): M;
}

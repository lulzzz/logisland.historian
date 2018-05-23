import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable ,  of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Dataset } from '../../dataset/dataset';
import { Datasource } from '../Datasource';
import { DatasourceService } from '../datasource.service';
import { DialogService } from '../../dialog/dialog.service';

@Component({
  selector: 'app-datasources-list',
  templateUrl: './datasources-list.component.html',
  styleUrls: ['./datasources-list.component.css']
})
export class DatasourcesListComponent implements OnInit {

  datasources$: Observable<Datasource[]>;
  @Input() dataSet: Dataset;
  @Input() selectedDatasource: Datasource;
  @Output() selectedDatasourceE = new EventEmitter<Datasource>();

  constructor(private datasourceService: DatasourceService,
              private dialogService: DialogService) { }

  ngOnInit() {
    this.getDatasources();
  }

  getDatasources(): void {
    this.datasources$ = this.datasourceService.getDatasources();
  }

  getDatasourcesQuery(queryParameter: string) {
    this.datasources$ = this.datasourceService.getDatasourcesQuery(queryParameter)
      .pipe(catchError(error => of([])));
  }

  private onDeleteDatasource(datasource: Datasource): void {
    this.dialogService.confirm("Delete data source")
      .subscribe(ok => {
        if (ok) {
          this.datasourceService.deleteDatasource(datasource)
            .subscribe(deletedDs => {
              console.log('deleted datasource with id :' + deletedDs.id);
              this.dataSet.removeDatasource(deletedDs);
              this.getDatasources();
            });
        }
      });
  }

  private onSelect(datasource: Datasource) {
    this.selectedDatasourceE.emit(datasource);
  }

  private onAddToDataset(datasource: Datasource) {
    this.dataSet.addDatasource(datasource);
  }

  private onRemoveFromDataset(datasource: Datasource) {
    this.dataSet.removeDatasource(datasource);
  }

  private dataSetContain(datasource: Datasource): boolean {
    if (this.dataSet) {
      return this.dataSet.containDatasource(datasource);
    }
    return false;
  }

}

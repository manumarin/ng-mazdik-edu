import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Column, Settings, DataTable} from '../../lib/ng-data-table';
import {getColumnsPlayers} from './columns';

@Component({
  selector: 'app-row-group-multiple-demo',
  template: `
    <app-data-table [table]="table"></app-data-table>
  `
})

export class RowGroupMultipleDemoComponent implements OnInit {

  table: DataTable;
  columns: Column[];

  settings: Settings = <Settings>{
    groupRowsBy: ['race', 'gender']
  };

  constructor(private http: HttpClient) {
    this.columns = getColumnsPlayers();
    this.table = new DataTable(this.columns, this.settings);
    this.table.pager.perPage = 50;
  }

  ngOnInit() {
    this.table.events.onLoading(true);
    this.http.get('assets/players.json').subscribe(data => {
      this.table.rows = data;
      this.table.events.onLoading(false);
    });
  }

}

import { Component, OnInit } from '@angular/core';

export class StOrder {
  property: string;
  direction: string;

  public constructor (property: string, direction:string) {
    this.property = property;
    this.direction = direction;
  }
}

export class StSort {
  orders: StOrder[] = [];
}

export class StPageable {
  pageNumber: number = 0;
  pageSize: number = 25;
  offset: number = 0;
  sort: StSort = new StSort();
}

export class StPage<T> {
  content: T[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  size: number = 25;
  number: number = 0;
  first: boolean = true;
  last: boolean = false;
  numberOfElements: number = 0;
}

export class StTable<T> {
  pageSizes: number[] = [10, 25, 50, 100];
  page: StPage<T> = new StPage<T>();
}

@Component({
  selector: 'app-st-table',
  templateUrl: './st-table.component.html',
  styleUrls: ['./st-table.component.css']
})
export class StTableComponent<T> implements OnInit {

  table: StTable<T>;

  constructor() { }

  ngOnInit() {
  }

}

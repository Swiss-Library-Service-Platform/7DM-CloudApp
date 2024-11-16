import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-request-selection',
  templateUrl: './request-selection.component.html',
  styleUrls: ['./request-selection.component.scss']
})
export class RequestSelectionComponent implements OnInit {

  @Input()
  allSelected: boolean = false;

  @Input()
  selectedRequests: any[] = [];

  @Input()
  totalRequestNumber: number = 0;

  @Output()
  onSelectAll: EventEmitter<any> = new EventEmitter();

  @Output()
  onPrintSelectedRequests: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onClickSelectAll(): void {
    this.onSelectAll.emit();
  }

  onClickPrintSelectedRequests(): void {
    this.onPrintSelectedRequests.emit();
  }
}

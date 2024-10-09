import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { RequestInfo } from '../../models/RequestInfo.model';
import { PagedHistory } from '../../models/PagedHistory.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  pagedHistory: PagedHistory;
  subscriptionHistoryRequests: Subscription;

  // Filter
  inputPage: number;
  inputDateFrom: string;
  inputDateTo: string;
  inputStatus: string;
  inputBoxId: string;
  inputRequestId: string;
  inputDestination: string;

  constructor(
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    this.backendService.getHistory();
    this.subscriptionHistoryRequests = this.backendService.getPagedHistoryObject().subscribe(
      response => {
        this.pagedHistory = response
      }
    );
  }

  onFilterHistoryRequests(): void {
    this.backendService.getHistory(this.buildFilterObject());
  }

  onClickPage(direction: string): void {
    if (direction === 'next') {
      this.inputPage = this.pagedHistory.currentPage + 1;
    } else if (direction === 'prev') {
      this.inputPage = this.pagedHistory.currentPage - 1;
    }
    this.onFilterHistoryRequests();
  }

  buildFilterObject(): any {
    const filterObject = {
      page: this.inputPage,
      dateFrom: this.inputDateFrom ?? null,
      dateTo: this.inputDateTo ?? null,
      boxId: this.inputBoxId ?? null,
      requestId: this.inputRequestId ?? null,
      destination: this.inputDestination ?? null,
    };

    // Remove properties with null values
    const filteredObject = {};
    for (const key in filterObject) {
      if (filterObject[key] !== null) {
        filteredObject[key] = filterObject[key];
      }
    }
    return filteredObject;
  }

}

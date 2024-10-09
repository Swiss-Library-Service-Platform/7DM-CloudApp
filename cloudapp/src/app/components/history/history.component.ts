import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { RequestInfo } from '../../models/RequestInfo.model';
import { PagedHistory } from '../../models/PagedHistory.model';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';

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
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.loader.show();
    this.status.set(this.translateService.instant("History.Status.Loading"));
    this.backendService.getHistory();
    this.subscriptionHistoryRequests = this.backendService.getPagedHistoryObject().subscribe(
      response => {
        this.pagedHistory = response;
        this.loader.hide();
      }
    );
  }

  onFilterHistoryRequests(resetPage: boolean = true): void {
    if (resetPage) {
      this.resetPage();
    }
    this.loader.show();
    this.status.set(this.translateService.instant("History.Status.Loading"));
    this.backendService.getHistory(this.buildFilterObject());
  }

  resetPage(): void {
    this.inputPage = 1;
  }

  onResetFilter(): void {
    this.inputDateFrom = null;
    this.inputDateTo = null;
    this.inputBoxId = null;
    this.inputRequestId = null;
    this.inputDestination = null;
    this.onFilterHistoryRequests();
  }

  onClickPage(direction: string): void {
    if (direction === 'next') {
      this.inputPage = this.pagedHistory.currentPage + 1;
    } else if (direction === 'prev') {
      this.inputPage = this.pagedHistory.currentPage - 1;
    }
    this.onFilterHistoryRequests(false);
  }

  buildFilterObject(): any {
    const filterObject = {
      page: this.inputPage ?? null,
      dateFrom: this.inputDateFrom ?? null,
      dateTo: this.inputDateTo ?? null,
      boxId: this.inputBoxId ?? null,
      requestId: this.inputRequestId ?? null,
      destinationLibraryCode: this.inputDestination ?? null,
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

  ngOnDestroy(): void {
    this.subscriptionHistoryRequests.unsubscribe();
  }

}

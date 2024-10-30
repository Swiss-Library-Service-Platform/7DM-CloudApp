import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { PagedHistory } from '../../models/PagedHistory.model';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { HistoryFilterService } from '../../services/history-filter.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  pagedHistory: PagedHistory;
  subscriptionHistoryRequests: Subscription;
  subscriptionIsShowErrors: Subscription;
  isDownloading: boolean = false;
  isUnreadErrors: boolean = false;

  // Filter
  inputPage: number;
  inputDateFrom: string;
  inputDateTo: string;
  inputStatus: string;
  inputBoxId: string;
  inputRequestId: string;
  inputDestination: string;
  inputShowErrors: boolean = false;

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService,
    private historyFilterService: HistoryFilterService
  ) { }

  ngOnInit(): void {

    this.status.set(this.translateService.instant("History.Status.Loading"));
    Promise.resolve().then(() => this.loader.show()); // Workardoun for ExpressionChangedAfterItHasBeenCheckedError, https://v17.angular.io/errors/NG0100

    this.inputShowErrors = this.historyFilterService.getIShowErrors();
    this.backendService.getHistory(this.buildFilterObject());
    this.subscriptionHistoryRequests = this.backendService.getPagedHistoryObject().subscribe(
      response => {
        this.pagedHistory = new PagedHistory(response);
        if (response !== null) {
          this.loader.hide();
        }
      }
    );
    this.subscriptionIsShowErrors = this.historyFilterService.getIsShowErrorsObservable().subscribe(
      showErrors => {
        this.inputShowErrors = showErrors;
        this.onFilterHistoryRequests();
      }
    );
    this.backendService.getUnreadErrorHistoryRequestsObject().subscribe(
      (response: any) => {
        if (response.length > 0) {
          this.isUnreadErrors = true;
        }
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

  async onClickDownloadHistory(): Promise<void> {
    this.isDownloading = true;
    const responseBlob = await this.backendService.downloadHistory(this.buildFilterObject());
    this.isDownloading = false;
    const blob = new Blob([responseBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'history.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
    this.inputShowErrors = false;
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
      showErrors: this.inputShowErrors ?? null
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


  onClickMarkAllErrors(): void {
    // Mark all errors as read
    this.backendService.markErrorRequestsAsRead().then(() => {
      this.isUnreadErrors = false;
      this.onFilterHistoryRequests();
    });
  }

  ngOnDestroy(): void {
    this.subscriptionHistoryRequests.unsubscribe();
  }

}

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
  inputPage: number = null;
  inputDateFrom: string = null;
  inputDateTo: string = null;
  inputStatus: string = null;
  inputBoxId: string = null;
  inputRequestId: string = null;
  inputDestination: string = null;
  inputShowErrors: boolean = false;

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService,
    private historyFilterService: HistoryFilterService
  ) { }

  ngOnInit(): void {
    this.onFilterHistoryRequests();

    this.subscriptionHistoryRequests = this.backendService.getPagedHistoryObject().subscribe(
      response => {
        this.pagedHistory = new PagedHistory(response);
        if (response !== null) {
          this.loader.hide();
        }
      }
    );
    this.backendService.getUnreadErrorHistoryRequestsObject().subscribe(
      (response: any) => {
        this.isUnreadErrors = response.length > 0;
      }
    );
    // When user was redirected here from request tab
    this.subscriptionIsShowErrors = this.historyFilterService.getIsShowErrorsObservable().subscribe(
      showErrors => {
        if (this.inputShowErrors !== showErrors) {
          this.inputShowErrors = showErrors;
          this.onFilterHistoryRequests();
        }
      }
    );
  }

  onFilterHistoryRequests(resetPage: boolean = true): void {
    if (resetPage) {
      this.resetPage();
    }
    Promise.resolve().then(() => this.loader.show()); // Workaround for ExpressionChangedAfterItHasBeenCheckedError, https://v17.angular.io/errors/NG0100
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
    const filterObject: any = {};

    if (this.inputPage !== null) filterObject.page = this.inputPage;
    if (this.inputDateFrom !== null) filterObject.dateFrom = this.inputDateFrom;
    if (this.inputDateTo !== null) filterObject.dateTo = this.inputDateTo;
    if (this.inputBoxId !== null) filterObject.boxId = this.inputBoxId;
    if (this.inputRequestId !== null) filterObject.requestId = this.inputRequestId;
    if (this.inputDestination !== null) filterObject.destinationLibraryCode = this.inputDestination;
    if (this.inputShowErrors !== null) filterObject.showErrors = this.inputShowErrors;

    return filterObject;
  }

  onClickMarkAllErrors(): void {
    this.backendService.markErrorRequestsAsRead().then(() => {
      this.isUnreadErrors = false;
      this.onFilterHistoryRequests();
    });
  }

  ngOnDestroy(): void {
    this.subscriptionHistoryRequests.unsubscribe();
  }
}

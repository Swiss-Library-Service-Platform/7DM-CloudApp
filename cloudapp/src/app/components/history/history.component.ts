import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { PagedHistory } from '../../models/PagedHistory.model';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { HistoryFilterService } from '../../services/history-filter.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { CurrentIzService } from '../../services/currenz-iz.service';

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
  inputLibrary: string = null;
  inputBarcode: string = null;
  inputShowErrors: boolean = false;
  inputCurrentAsDestination: boolean = false;

  // Filter subject for debouncing
  private filterSubject: Subject<boolean> = new Subject();

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService,
    private historyFilterService: HistoryFilterService,
    private eventsService: CloudAppEventsService,
    public currentIzService: CurrentIzService
  ) { }

  ngOnInit(): void {

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
    this.filterSubject.pipe(
      debounceTime(300) // Debounce time to prevent multiple requests
    ).subscribe(resetPage => {
      this.executeFilterHistoryRequests(resetPage);
    });
    this.onFilterHistoryRequests();
  }

  onFilterHistoryRequests(resetPage: boolean = true): void {
    this.filterSubject.next(resetPage);
  }

  onChangeCurrentAsDestination(): void {
    this.inputLibrary = null;
    if (this.inputCurrentAsDestination) {
      this.inputShowErrors = false;
    }
    this.onFilterHistoryRequests();
  }

  private executeFilterHistoryRequests(resetPage: boolean): void {
    if (resetPage) {
      this.resetPage();
    }
    Promise.resolve().then(() => this.loader.show()); // Workaround for ExpressionChangedAfterItHasBeenCheckedError, https://v17.angular.io/errors/NG0100
    this.status.set(this.translateService.instant("History.Status.Loading"));
    this.backendService.getHistory(this.buildFilterObject(), this.inputCurrentAsDestination);
  }

  async onClickDownloadHistory(): Promise<void> {
    this.isDownloading = true;
    const responseBlob = await this.backendService.downloadHistory(this.buildFilterObject(), this.inputCurrentAsDestination);
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
    this.inputLibrary = null;
    this.inputBarcode = null;
    this.inputShowErrors = false;
    this.inputCurrentAsDestination = false;
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
    if (this.inputLibrary !== null) filterObject.libraryCode = this.inputLibrary;
    if (this.inputBarcode !== null) filterObject.barcode = this.inputBarcode;
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
    this.subscriptionIsShowErrors.unsubscribe();
    this.filterSubject.unsubscribe();
  }
}

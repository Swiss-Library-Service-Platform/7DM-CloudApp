import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';
import { RequestResponse } from '../../models/RequestResponse.model';

@Component({
  selector: 'app-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent implements OnInit {

  todayRequests: RequestResponse[] = [];
  filteredRequests: RequestResponse[] = [];
  subscriptionTodaysRequests: Subscription;
  inputSearch: string;

  selectedRequests: string[] = [];

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.backendService.getRequests();
    this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
      response => {
        this.todayRequests = response.map(request => {
          return new RequestResponse(request);
        });
        this.filteredRequests = [...this.todayRequests];
      }
    );
  }

  // new search in frontend
  onFilterRequests(): void {
    if (this.inputSearch.trim() === '') {
      // If search input is empty, show all requests
      this.filteredRequests = [...this.todayRequests];
    } else {
      // Filter requests based on search input
      this.filteredRequests = this.todayRequests.filter(requestResponse => {
        return requestResponse.getRequest().checkForSearch(this.inputSearch);
      });
    }
  }

  cancelRequest(internalId: string): void {
    this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
    this.loader.show();
    const requestResponse = this.todayRequests.find(requestResponse => requestResponse.getRequest().internalId === internalId);
    requestResponse.getRequest().isDeleting = true;
    this.selectedRequests = this.selectedRequests.filter(id => id !== internalId);
    this.backendService.cancelRequest(internalId).then((res) => {
      this.loader.hide();
    });
  }

  onSelectRequest(requestId: string): void {
    if (this.selectedRequests.includes(requestId)) {
      this.selectedRequests = this.selectedRequests.filter(id => id !== requestId);
    } else {
      this.selectedRequests.push(requestId);
    }
  }

  onSelectAll(): void {
    if (this.selectedRequests.length === this.filteredRequests.length) {
      this.selectedRequests = [];
      this.filteredRequests.forEach(requestResponse => requestResponse.getRequest().isSelected = false);
    } else {
      this.selectedRequests = this.filteredRequests.map(requestResponse => requestResponse.getRequest().internalId);
      this.filteredRequests.forEach(requestResponse => requestResponse.getRequest().isSelected = true);
    }
  }

  onPrintSelectedRequests(): void {
    this.backendService.getMultiRequestSlipPdfUrl(this.selectedRequests).then(pdfUrl => {
      window.open(pdfUrl, '_blank');
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { RequestResponse } from '../../models/RequestResponse.model';

@Component({
  selector: 'app-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent implements OnInit {

  todayRequests: RequestResponse[] = new Array<RequestResponse>();
  filteredRequests: RequestResponse[] = new Array<RequestResponse>();
  subscriptionTodaysRequests: Subscription;
  inputSearch: string;

  selectedRequests: number[] = [];

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.backendService.getRequests();
    this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
      (response: RequestResponse[]) => {
        response = response.map(requestResponse => new RequestResponse(requestResponse)); // Somehow this is necessary
        this.todayRequests = response;
        this.filteredRequests = [...this.todayRequests];
      }
    );
  }

  onFilterRequests(): void {
    if (this.inputSearch.trim() === '') {
      this.filteredRequests = [...this.todayRequests];
    } else {
      this.filteredRequests = this.todayRequests.filter(requestResponse => {
        return requestResponse.getRequest().checkForSearch(this.inputSearch);
      });
    }
  }

  cancelRequest(requestId: number): void {
    this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
    this.loader.show();
    const requestResponse = this.todayRequests.find(requestResponse => requestResponse.getRequest().getId() === requestId);
    requestResponse.getRequest().isDeleting = true;
    this.selectedRequests = this.selectedRequests.filter(id => id !== requestId);
    this.backendService.cancelRequest(requestId).then((res) => {
      this.loader.hide();
    });
  }

  onSelectRequest(requestId: number): void {
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
      this.selectedRequests = this.filteredRequests.map(requestResponse => requestResponse.getRequest().getId());
      this.filteredRequests.forEach(requestResponse => requestResponse.getRequest().isSelected = true);
    }
  }

  onPrintSelectedRequests(): void {
    this.backendService.getMultiRequestSlipPdfUrl(this.selectedRequests).then(pdfUrl => {
      window.open(pdfUrl, '_blank');
    });
  }
}

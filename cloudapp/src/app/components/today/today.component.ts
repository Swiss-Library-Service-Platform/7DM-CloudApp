import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription } from 'rxjs';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';
@Component({
  selector: 'app-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent implements OnInit {

  todayRequests: Request[] = new Array<Request>();
  filteredRequests: Request[] = new Array<Request>();
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
      (response: Request[]) => {
        response = response.map(r => new Request(r)); // Somehow this is necessary
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
        return requestResponse.checkForSearch(this.inputSearch);
      });
    }
  }

  cancelRequest(requestId: number): void {
    const requestResponse = this.todayRequests.find(requestResponse => requestResponse.getId() === requestId);
    requestResponse.isDeleting = true;

    // Simulate delay
    setTimeout(() => {
      this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
      this.loader.show();
      this.selectedRequests = this.selectedRequests.filter(id => id !== requestId);
      this.backendService.cancelRequest(requestId).then((res) => {
        this.loader.hide();
      });
    }, 1000);

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
      this.filteredRequests.forEach(requestResponse => requestResponse.isSelected = false);
    } else {
      this.selectedRequests = this.filteredRequests.map(requestResponse => requestResponse.getId());
      this.filteredRequests.forEach(requestResponse => requestResponse.isSelected = true);
    }
  }

  onPrintSelectedRequests(): void {
    this.backendService.getMultiRequestSlipPdfUrl(this.selectedRequests).then(pdfUrl => {
      window.open(pdfUrl, '_blank');
    });
  }
}

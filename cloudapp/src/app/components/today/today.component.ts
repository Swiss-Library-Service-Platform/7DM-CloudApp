import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { RequestInfo } from '../../models/RequestInfo.model';
import { Subscription } from 'rxjs';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent implements OnInit {

  todayRequests: RequestInfo[] = [];
  filteredRequests: RequestInfo[] = [];
  subscriptionTodaysRequests: Subscription;
  inputSearch: string;

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
          return new RequestInfo(request);
        });
        this.filteredRequests = [...this.todayRequests];
      }
    );
  }

  /*
  
  --> Old Backend Search

  onClickSearch(): void {
    if (!this.inputSearch) {
      this.searchPerformed = false;
      return;
    }
    this.searchPerformed = true;
    this.status.set(this.translateService.instant("Today.Status.Searching_Requests"));
    this.loader.show();
    this.backendService.getRequests(this.inputSearch).then(() => {
        this.loader.hide();
      }
    );
  }
  */

  // new search in frontend
  onFilterRequests(): void {
    if (this.inputSearch.trim() === '') {
      // If search input is empty, show all requests
      this.filteredRequests = [...this.todayRequests];
    } else {
      // Filter requests based on search input
      this.filteredRequests = this.todayRequests.filter(request  => {
        return request.checkForSearch(this.inputSearch);
      });
    }
  }

  cancelRequest(internalId: string): void {
    this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
    this.loader.show();
    this.backendService.cancelRequest(internalId).then((res) => {
        this.loader.hide();
    });
}
}

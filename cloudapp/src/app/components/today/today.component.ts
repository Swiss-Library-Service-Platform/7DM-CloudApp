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

  todayRequests: Request[] = [];
  filteredRequests: Request[] = [];
  subscriptionTodaysRequests: Subscription;
  inputSearch: string;
  isErrorExisting: boolean = false;

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
          return new Request(request);
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

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

  todayRequests: RequestInfo[];
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
        this.todayRequests = response;
      }
    );
  }

  onClickSearch(): void {
    this.status.set(this.translateService.instant("Today.Status.Searching_Requests"));
    this.loader.show();
    this.backendService.getRequests(this.inputSearch).then(() => {
        this.loader.hide();
      }
    );
  }

  cancelRequest(internalId: string): void {
    this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
    this.loader.show();
    this.backendService.cancelRequest(internalId).then((res) => {
        this.loader.hide();
    });
}
}

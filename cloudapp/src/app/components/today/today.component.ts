import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { RequestInfo } from '../../models/RequestInfo.model';
import { Subscription } from 'rxjs';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';

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
  ) { }

  ngOnInit(): void {
    this.backendService.getRequests();
    this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
      response => {
        this.todayRequests = response;
        this.loader.hide();
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }

  onClickSearch(): void {
    this.loader.show();
    this.status.set('Searching...');
    this.backendService.getRequests(this.inputSearch);
  }

}

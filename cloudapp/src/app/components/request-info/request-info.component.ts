import { Component, Input, OnInit } from '@angular/core';
import { RequestInfo } from '../../models/RequestInfo.model';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  styleUrls: ['./request-info.component.scss']
})
export class RequestInfoComponent implements OnInit {

  @Input()
  requestInfo: RequestInfo

  @Input()
  onCancelRequest: (requestId: string) => void;

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
  }

  onClickCancelRequest(): void {
    var requestId = this.requestInfo.internal_id;
    this.onCancelRequest(requestId);
  }

  async onClickPrintRequestHtml(): Promise<void> {
      var requestId = this.requestInfo.internal_id;
      const url = await this.backendService.getRequestSlipHtmlUrl(requestId);
      window.open(url, '_blank');
  }
}

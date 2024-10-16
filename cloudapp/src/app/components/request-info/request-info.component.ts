import { Component, Input, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';

@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  styleUrls: ['./request-info.component.scss']
})
export class RequestInfoComponent implements OnInit {

  @Input()
  request: Request;

  @Input()
  onCancelRequest: Function = undefined;

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
  }

  onClickCancelRequest(): void {
    var requestId = this.request.internal_id;
    this.onCancelRequest(requestId);
  }

  async onClickPrintRequestPdf(): Promise<void> {
    var requestId = this.request.internal_id;
    const url = await this.backendService.getRequestSlipPdfUrl(requestId);
    window.open(url, '_blank');
  }

  async onClickPrintBoxIdPdf(): Promise<void> {
    var boxId = this.request.box_id;
    const url = await this.backendService.getBoxLabelPdfUrl(boxId);
    window.open(url, '_blank');
  }
}

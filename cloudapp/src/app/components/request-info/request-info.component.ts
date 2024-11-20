import { Component, Input, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  styleUrls: ['./request-info.component.scss']
})
export class RequestInfoComponent implements OnInit {

  @Input()
  request: Request;

  @Input()
  index: number = null;

  @Input()
  onCancelRequest: Function = undefined;

  @Input()
  onSelectRequest: Function = undefined;

  @Input()
  showBoxDate: boolean = false;

  constructor(
    private backendService: BackendService,
    private loader: LoadingIndicatorService,
    private status: StatusIndicatorService,
  ) { }

  ngOnInit(): void {
  }

  onClickCancelRequest(): void {
    var requestId = this.request.getId();
    this.onCancelRequest(requestId);
  }

  async onClickPrintRequestPdf(): Promise<void> {
    var requestId = this.request.getId();
    const url = await this.backendService.getRequestSlipPdfUrl(requestId);
    window.open(url, '_blank');
  }

  async onClickPrintBoxIdPdf(): Promise<void> {
    var boxId = this.request.boxLabel.boxId;
    const url = await this.backendService.getBoxLabelPdfUrl(boxId);
    window.open(url, '_blank');
  }

  onClickSelectRequest(event: MatCheckboxChange): void {
    this.request.isSelected = event.checked;
    this.onSelectRequest(this.request.getId());
  }
}

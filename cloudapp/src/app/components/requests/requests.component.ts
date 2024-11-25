import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Request } from '../../models/Request.model';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    // Input
    inputRequestId: string = '';
    inputBoxId: string = '';

    // Request status
    isSendingRequest: boolean = false;

    // Response
    responseRequest: Request;
    responseErrorMessage: string;
    responseErrorId: string;
    responseMultipleFulfilled: Array<Request>;

    // Subscriptions
    subscriptionTodaysRequests: Subscription;

    // Time
    isTimeValid: boolean = true;

    constructor(
        private backendService: BackendService,
        private translateService: TranslateService,
        private loader: LoadingIndicatorService,
        private status: StatusIndicatorService,
        protected sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.checkCurrentTimeValid();
        this.backendService.retrieveActiveBoxLabel().then(response => {
            this.inputBoxId = response?.boxId;
        });
        this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
            (response: Request[]) => {
                response = response.map(requestResponse => new Request(requestResponse)); // Somehow this is necessary
                if (this.responseRequest != null && !response.some(r => r.getId() === this.responseRequest.getId())) {
                    // Current visible request was deleted from today tab
                    this.resetResponse();
                }
            }
        );
    }

    checkCurrentTimeValid(): void {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        console.log("Current hour: " + currentHour);

        if (currentHour >= 15) {
            this.isTimeValid = false;
            this.loader.hide();
            return;
        }
    }

    async onClickPrintBoxIdPdf(): Promise<void> {
        const url = await this.backendService.getBoxLabelPdfUrl(this.inputBoxId);
        window.open(url, '_blank');
    }

    resetResponse(): void {
        this.responseRequest = null;
        this.responseErrorMessage = null;
        this.responseErrorId = null;
    }

    onClickRefreshBoxId(): void {
        this.loader.show();
        this.status.set(this.translateService.instant("Requests.Status.Loading_BoxId"));

        this.backendService.generateBoxLabel().then(response => {
            this.inputBoxId = response.boxId;
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            this.loader.hide();
        });
    }

    onClickSendRequest(): void {
        this.loader.show();
        this.status.set(this.translateService.instant("Requests.Status.Loading_Request"));

        this.resetResponse();
        this.isSendingRequest = true;

        this.backendService.sendRequestTo7DM(this.inputRequestId, this.inputBoxId).then(response => {
            const responseObj = new Request(response);
            this.responseRequest = responseObj;
            this.inputRequestId = '';
        }).catch(error => {
            if (error.error == null || error.error.type == "DEFAULT") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DEFAULT");
            } else if (error.error.type == "DESTINATION_NOT_FOUND" || error.error.type == "DESTINATION_NOT_FOUND_ITEM") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DESTINATION_NOT_FOUND_ITEM", { destination: error.error.additionalInformation.libraryCode });
            } else {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type);
            }
            this.responseErrorId = error.error.error_id;
        }).finally(() => {
            this.isSendingRequest = false;
            this.loader.hide();
        });
    }

    cancelRequest(requestId: number): void {
        this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
        this.loader.show();
        this.backendService.cancelRequest(requestId).then((res) => {
            this.resetResponse();
            this.loader.hide();
        });
    }

    getIconClass(): string {
        if (this.responseRequest && (this.responseRequest.isRetried()
            || this.responseRequest.isOutdated
            || this.responseRequest.isNotRs
            || this.responseRequest.isMultipleFulfilled)
        ) {
            return 'warning';
        }
        return 'successful';
    }
}

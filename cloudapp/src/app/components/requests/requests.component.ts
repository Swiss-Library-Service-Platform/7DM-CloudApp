import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Request } from '../../models/Request.model';
import { CurrentIzService } from '../../services/currenz-iz.service';
import { CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

    private readonly BOX_LABEL_CACHE_KEY = 'boxLabelCache';

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
        protected sanitizer: DomSanitizer,
        public currentIzService: CurrentIzService,
        private storeService: CloudAppStoreService
    ) { }

    ngOnInit(): void {
        this.checkCurrentTimeValid();
        if (!this.currentIzService.isCurrentIzNetworkZone) {
            this.getStoredBoxLabel();
        }
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

        if (currentHour >= 19) {
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
            // Cache box label
            if (this.currentIzService.isCurrentIzUZB) {
                this.storeService.set(this.BOX_LABEL_CACHE_KEY, this.inputBoxId)
                    .toPromise()
                    .catch(error => console.error('Failed to cache box label:', error));
            }
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            this.loader.hide();
        });
    }

    private async getStoredBoxLabel(): Promise<void> {
        try {
            // Try cache first
            const cachedLabel = await this.storeService.get(this.BOX_LABEL_CACHE_KEY).toPromise();

            if (cachedLabel && typeof cachedLabel === 'string' && cachedLabel.trim().length > 0) {
                this.inputBoxId = cachedLabel;
                return;
            }

            // Cache miss or invalid - fetch from backend
            await this.fetchAndCacheBoxLabel();

        } catch (error) {
            console.error('Error retrieving box label from cache:', error);
            // Attempt backend fetch on cache error
            await this.fetchAndCacheBoxLabel();
        }
    }

    private async fetchAndCacheBoxLabel(): Promise<void> {
        try {
            const response = await this.backendService.retrieveActiveBoxLabel();
            if (response?.boxId) {
                this.inputBoxId = response.boxId;
            } else {
                throw new Error('No valid box ID received from backend');
            }
        } catch (error) {
            console.error('Error retrieving/caching box label from backend:', error);
        }
    }

    onClickSendRequest(): void {
        this.loader.show();
        this.status.set(this.translateService.instant("Requests.Status.Loading_Request"));

        this.resetResponse();
        this.isSendingRequest = true;

        this.inputRequestId = this.inputRequestId.trim();
        this.inputBoxId = this.inputBoxId.trim();

        this.backendService.sendRequestTo7DM(this.inputRequestId, this.inputBoxId).then(async response => {
            const responseObj = new Request(response);
            this.responseRequest = responseObj;
            this.inputRequestId = '';
            // Cache box label
            if (this.currentIzService.isCurrentIzUZB) {
                if (this.currentIzService.isCurrentIzUZB) {
                    this.storeService.set(this.BOX_LABEL_CACHE_KEY, this.inputBoxId)
                        .toPromise()
                        .catch(error => console.error('Failed to cache box label:', error));
                }
            }
        }).catch(error => {
            if (error.error == null || error.error.type == "DEFAULT") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DEFAULT");
            } else if (error.error.type == "DESTINATION_NOT_FOUND" || error.error.type == "DESTINATION_NOT_FOUND_ITEM") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DESTINATION_NOT_FOUND_ITEM", { destination: error.error.additionalInformation.libraryCode });
            } else if (error.error.type == "SEVEN_DM_CODE_NOT_FOUND") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type, { destination: error.error.additionalInformation.libraryCode });
            } else if (error.error.type == "PAEBA_ALREADY_IN_DATABASE") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type, { paeba: error.error.additionalInformation.paeba });
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
        if (this.responseRequest && (this.responseRequest.isRetryWithSameInternalId()
            || this.responseRequest.isNotRs
            || this.responseRequest.isMultipleFulfilled)
        ) {
            return 'warning';
        }
        return 'successful';
    }
}

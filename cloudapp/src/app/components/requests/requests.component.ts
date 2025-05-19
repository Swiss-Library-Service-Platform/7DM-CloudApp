import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

    // Constants
    private readonly BOX_LABEL_CACHE_KEY = 'boxLabelCache';
    private readonly FOCUS_DELAY = 0;

    // Component Properties
    @ViewChild('boxIdInput') boxIdInput: ElementRef;
    @ViewChild('requestIdInput') requestInput: ElementRef;

    inputRequestId: string = '';
    inputBoxId: string = '';
    isSendingRequest: boolean = false;
    isTimeValid: boolean = true;

    // Response Properties
    responseRequest: Request;
    responseErrorMessage: string;
    responseErrorId: string;
    responseMultipleFulfilled: Array<Request>;

    // Subscriptions
    subscriptionTodaysRequests: Subscription;

    constructor(
        private backendService: BackendService,
        private translateService: TranslateService,
        private loader: LoadingIndicatorService,
        private status: StatusIndicatorService,
        protected sanitizer: DomSanitizer,
        public currentIzService: CurrentIzService,
        private storeService: CloudAppStoreService
    ) { }

    // Lifecycle Hooks
    ngOnInit(): void {
        this.checkCurrentTimeValid();
        if (!this.currentIzService.isCurrentIzNetworkZone) {
            this.getBoxLabelOrSetFocus();
        }
        this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
            (response: Request[]) => {
                response = response.map(requestResponse => new Request(requestResponse));
                if (this.responseRequest != null && !response.some(r => r.getId() === this.responseRequest.getId())) {
                    this.resetResponse();
                }
            }
        );
    }

    // Public Methods - User Interactions
    async onClickPrintBoxIdPdf(): Promise<void> {
        const url = await this.backendService.getBoxLabelPdfUrl(this.inputBoxId);
        window.open(url, '_blank');
    }

    onClickRefreshBoxId(): void {
        this.loader.show();
        this.status.set(this.translateService.instant("Requests.Status.Loading_BoxId"));

        this.backendService.generateBoxLabel().then(response => {
            this.setBoxId(response.boxId);
            this.cacheBoxLabel(this.inputBoxId);
            this.focusElement(this.requestInput);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            this.loader.hide();
        });
    }

    onClickSendRequest(): void {
        if (this.isSendingRequest || !this.isTimeValid) {
            return;
        }

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
            this.cacheBoxLabel(this.inputBoxId);
        }).catch(error => {
            this.handleRequestError(error);
        }).finally(() => {
            this.isSendingRequest = false;
            this.loader.hide();
            this.focusElement(this.requestInput);
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
            || this.responseRequest.isNotRs()
            || this.responseRequest.isMultipleFulfilled())
        ) {
            return 'warning';
        }
        return 'successful';
    }

    // Private Methods - State Management
    private checkCurrentTimeValid(): void {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();

        if (currentHour >= 19) {
            this.isTimeValid = false;
            this.loader.hide();
            return;
        }
    }

    private resetResponse(): void {
        this.responseRequest = null;
        this.responseErrorMessage = null;
        this.responseErrorId = null;
    }

    private setBoxId(boxId: string): void {
        this.inputBoxId = boxId;
        this.focusElement(this.requestInput);
    }

    // Private Methods - Box Label Management
    private async getBoxLabelOrSetFocus(): Promise<void> {
        const boxLabel = await this.getBoxIdFromStoreOrBackend();
        if (boxLabel) {
            this.setBoxId(boxLabel);
        } else {
            this.focusElement(this.boxIdInput);
        }
    }

    private async getBoxIdFromStoreOrBackend(): Promise<string> {
        const cachedLabel = await this.getCachedBoxLabel();
        if (cachedLabel) {
            return cachedLabel;
        }

        const boxLabel = await this.getBackendBoxLabel();
        if (boxLabel) {
            return boxLabel;
        }

        return null;
    }

    private async getCachedBoxLabel(): Promise<string | null> {
        try {
            const cachedLabel = await this.storeService.get(this.BOX_LABEL_CACHE_KEY).toPromise();
            if (cachedLabel && typeof cachedLabel === 'string' && cachedLabel.trim().length > 0) {
                return cachedLabel;
            }
        } catch (error) {
            console.error('Error retrieving box label from cache:', error);
        }
        return null;
    }

    private async getBackendBoxLabel(): Promise<string> {
        try {
            const response = await this.backendService.retrieveActiveBoxLabel();
            if (response?.boxId) {
                return response.boxId;
            } else {
                throw new Error('No valid box ID received from backend');
            }
        } catch (error) {
            console.error('Error retrieving/caching box label from backend:', error);
        }
        return null;
    }

    private async cacheBoxLabel(boxId: string): Promise<void> {
        if (!this.currentIzService.isCurrentIzUZB) {
            return;
        }

        try {
            await this.storeService.set(this.BOX_LABEL_CACHE_KEY, boxId).toPromise();
        } catch (error) {
            console.error('Failed to cache box label:', error);
        }
    }

    // Private Methods - UI Management
    private focusElement(element: ElementRef): void {
        setTimeout(() => element?.nativeElement?.focus(), this.FOCUS_DELAY);
    }

    // Private Methods - Error Handling
    private handleRequestError(error: any): void {
        const errorType = error.error?.type || 'DEFAULT';
        const additionalInfo = error.error?.additionalInformation;

        switch (errorType) {
            case 'DESTINATION_NOT_FOUND':
            case 'DESTINATION_NOT_FOUND_ITEM':
                this.responseErrorMessage = this.translateService.instant(
                    'Requests.Error.DESTINATION_NOT_FOUND_ITEM',
                    { destination: additionalInfo?.libraryCode }
                );
                break;
            case 'SEVEN_DM_CODE_NOT_FOUND':
                this.responseErrorMessage = this.translateService.instant(
                    `Requests.Error.${errorType}`,
                    { destination: additionalInfo?.libraryCode }
                );
                break;
            case 'PAEBA_ALREADY_IN_DATABASE':
                this.responseErrorMessage = this.translateService.instant(
                    `Requests.Error.${errorType}`,
                    { paeba: additionalInfo?.paeba }
                );
                break;
            default:
                this.responseErrorMessage = this.translateService.instant(`Requests.Error.${errorType}`);
        }
        this.responseErrorId = error.error?.errorId;
    }
}

import { Component, OnInit } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    inputRequestId: string = '';
    inputBoxId: string = '';
    isFailed = false;
    infoResponse: any;
    errorMessage: string;
    errorId: string;

    constructor(
        private backendService: BackendService,
        private translateService: TranslateService,
        private _loader: LoadingIndicatorService,
        private _status: StatusIndicatorService,
    ) { }

    /**
     * Getter for LoadingIndicatorService instance.
     * @returns LoadingIndicatorService instance
     */
    get loader(): LoadingIndicatorService {
        return this._loader;
    }

    /**
     * Getter for StatusIndicatorService instance.
     * @returns StatusIndicatorService instance
     */
    get status(): StatusIndicatorService {
        return this._status;
    }

    ngOnInit(): void { }

    onClickLookUpRequest(): void {
        this._loader.show();
        this.status.set(this.translateService.instant("Requests.Status.Loading_Request"));

        this.isFailed = false;
        this.infoResponse = null;
        this.errorMessage = null;
        this.errorId = null;

        this.backendService.lookUpRequest(this.inputRequestId).then(response => {
            this.infoResponse = response;
        }).catch(error => {
            if (error.error == null || error.error.type == "DEFAULT") {
                this.errorMessage = this.translateService.instant("Requests.Error.DEFAULT");
            } else if (error.error.type == "BAD_STATUS") {
                this.errorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " " + error.error.additionalInformation.status;
            } else if (error.error.type == "WRONG_LOCATION") {
                this.errorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " (" + error.error.additionalInformation.location + ")";
            }
            // REQUEST_ID_NOT_FOUND,
            // BAD_STATUS,
            // SENDER_NON_COURIER_LIBRARY,
            // DESTINATION_NON_COURIER_LIBRARY,
            else {
                this.errorMessage = this.translateService.instant("Requests.Error." + error.error.type);
            }
            this.errorId = error.error.error_id;
            this.isFailed = true;
        }).finally(() => {
            this._loader.hide();
        });
    }

    onClickRefreshBoxId(): void {
        // unimplemented
    }

    onClickPrintBoxId(): void {
        // unimplemented
    }

    onClickPrintRequest(): void {
        // unimplemented
    }

    onClickCancelRequest(): void {
        // unimplemented
    }
}

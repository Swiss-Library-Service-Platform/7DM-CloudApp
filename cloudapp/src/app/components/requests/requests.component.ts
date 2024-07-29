import { Component, OnInit } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    data: InitData;
    requestID: string = '';
    authToken: string;
    isFailed = false;
    response: any;
    errorMessage: string;
    errorId: string;

    constructor(
        private http: HttpClient,
        private eventsService: CloudAppEventsService,
        private backendService: BackendService,
        private translateService: TranslateService,
        private _status: StatusIndicatorService,
    ) { }


    ngOnInit(): void {
        this.eventsService.getAuthToken().subscribe(authToken => this.authToken = authToken);
        this.eventsService.getInitData().subscribe(data => this.data = data);
    }

    onClickLookUpRequest(): void {
       // this._loader.show();
        //this.status.set(this.translateService.instant("Requests.Status.Loading_Request"));

        this.isFailed = false;
        this.response = null;
        this.errorMessage = null;
        this.errorId = null;

        this.backendService.lookUpRequest(this.requestID).then(response => {
            this.response = response;
            //this._loader.hide();
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
            //this._loader.hide();
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    data: InitData;
    requestID: string = '';
    authToken: string;
    loading = false;
    failed = false;
    response: any;
    errorMessage: string;
    errorId: string;

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService, private translateService: TranslateService) { }

    ngOnInit(): void {
        this.eventsService.getAuthToken().subscribe(authToken => this.authToken = authToken);
        this.eventsService.getInitData().subscribe(data => this.data = data);
    }

    lookUpRequest(): void {
        let libraryCode = this.data.user.currentlyAtLibCode;
        if (!this.requestID) {
            console.error("No input value");
            return;
        }

        this.loading = true;
        this.failed = false;
        this.response = null;

        const headers = { 'Authorization': `Bearer ${this.authToken}` };
        this.http.get(`http://localhost:4200/api/v1/requests/${this.requestID}/libraries/${libraryCode}`, { headers }).subscribe(
            response => {
                this.response = response;
                this.loading = false;
            },
            error => {
                // Sometimes (at least in testing) the error object was null
                if (error.error == null || error.error.type == "DEFAULT") {
                    this.errorMessage = this.translateService.instant("Requests.Error.DEFAULT");
                } else if (error.error.type == "BAD_STATUS") {
                    this.errorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " " + error.error.additionalInformation.status;
                } else if (error.error.type == "WRONG_LOCATION") {
                    this.errorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " (" + error.error.additionalInformation.location + ")";
                } else {
                    // REQUEST_ID_NOT_FOUND,
                    // BAD_STATUS,
                    // SENDER_NON_COURIER_LIBRARY,
                    // DESTINATION_NON_COURIER_LIBRARY,
                    this.errorMessage = this.translateService.instant("Requests.Error." + error.error.type);
                }
                this.errorId = error.error.error_id;
                this.failed = true;
                this.loading = false;
            }
        );
    }
}

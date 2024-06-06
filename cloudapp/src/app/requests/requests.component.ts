import { Component, OnInit } from '@angular/core';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    data: InitData;
    requestID: string = '';
    authToken: string;
    isLoading = false;
    failed = false;
    response: any;

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService) { }

    ngOnInit(): void {
        this.eventsService.getAuthToken().subscribe(authToken => {
            this.authToken = authToken;
            console.log("Auth set");
        });

        this.eventsService.getInitData().subscribe(
            data => {
                this.data = data;
                console.log(data.user.currentlyAtLibCode)
            }
        );
    }

    lookUpRequest(): void {
        let libraryCode = this.data.user.currentlyAtLibCode;
        if (!this.requestID) {
            console.error("No input value");
            return;
        }

        this.isLoading = true;
        this.failed = false;
        this.response = null;
        console.log("Retrieving request with ID: " + this.requestID + " from library: " + libraryCode);
        // /api/v1/requests/{requestId}/libraries/{libraryId}

        const headers = { 'Authorization': `Bearer ${this.authToken}` };
        console.log("Headers: " + JSON.stringify(headers));
        this.http.get(`http://localhost:4200/api/v1/requests/${this.requestID}/libraries/${libraryCode}`, { headers }).subscribe(
            response => {
                this.response = response;
                console.log(JSON.stringify(response));
                console.log("Partners retrieved successfully!, at: " + new Date().toLocaleTimeString() + " on " + new Date().toLocaleDateString());
                this.isLoading = false;
            },
            error => {
                console.error('Error: ' + error);
                console.log(JSON.stringify(error));
                this.failed = true;
                this.isLoading = false;
            }
        );
    }
}

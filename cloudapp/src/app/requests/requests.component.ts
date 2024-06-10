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
    loading = false;
    failed = false;
    response: any;

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService) { }

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
                console.log(JSON.stringify(error));
                this.failed = true;
                this.loading = false;
            }
        );
    }
}

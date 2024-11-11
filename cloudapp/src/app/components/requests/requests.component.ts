import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Request } from '../../models/Request.model';

// Set the worker source for pdfjs
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.js';


@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    inputRequestId: string = '';
    inputBoxId: string = '';
    responseRequest: Request;
    responseErrorMessage: string;
    responseErrorId: string;
    subscriptionTodaysRequests: Subscription;
    isTimeValid: boolean = true;

    constructor(
        private backendService: BackendService,
        private translateService: TranslateService,
        private loader: LoadingIndicatorService,
        private status: StatusIndicatorService,
        protected sanitizer: DomSanitizer
    ) { }

    /*
    @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;
    */

    ngOnInit(): void {
        //this.ctx = this.canvas.nativeElement.getContext('2d');

        // Check if current time is valid (between 00:00 and 18:59)
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        console.log("Current hour: " + currentHour);
        if (currentHour >= 19) {
            this.isTimeValid = false;
            this.loader.hide();
            return;
        }

        this.backendService.retrieveActiveBoxLabel().then(response => {
            this.inputBoxId = response?.box_id;
        });
        this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
            response => {
                // If request was deleted on today tab
                if (this.responseRequest != null && !response.some(r => r.internal_id === this.responseRequest.internal_id)) {
                    this.resetResponse();
                }
            }
        );
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
            this.inputBoxId = response.box_id;
        }).catch(error => {
            alert("Error: " + error);
        }).finally(() => {
            this.loader.hide();
        });
    }

    onClickSendRequest(): void {
        this.loader.show();
        this.status.set(this.translateService.instant("Requests.Status.Loading_Request"));

        this.resetResponse();

        this.backendService.sendRequestTo7DM(this.inputRequestId, this.inputBoxId).then(response => {
            this.responseRequest = new Request(response);
            this.inputRequestId = '';
        }).catch(error => {
            // boxOutdated
            if (error.error == null || error.error.type == "DEFAULT") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DEFAULT");
            } else if (error.error.type == "DESTINATION_NOT_FOUND" || error.error.type == "DESTINATION_NOT_FOUND_ITEM") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DESTINATION_NOT_FOUND_ITEM", { destination: error.error.additionalInformation.libraryCode });
            }
            // ALL OTHER ERROR TYPES
            else {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type);
            }
            this.responseErrorId = error.error.error_id;
        }).finally(() => {
            this.loader.hide();
        });
    }

    cancelRequest(internalId: string): void {
        this.status.set(this.translateService.instant("Requests.Status.Cancelling_Request"));
        this.loader.show();
        this.backendService.cancelRequest(internalId).then((res) => {
            this.resetResponse();
            this.loader.hide();
        });
    }

    getIconClass(): string {
        if (this.responseRequest && (this.responseRequest.isAlreadySent()
            || this.responseRequest.isOutdated()
            || this.responseRequest.isNotResourceSharing())) {
            return 'warning';
        }
        return 'successful';
    }

}

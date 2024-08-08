import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewChild, ElementRef } from '@angular/core';

// PDFJS (workaround for loading pdf.worker.js)
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.js';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
    inputRequestId: string = '';
    inputBoxId: string = '';
    responseRequest: any;
    responseErrorMessage: string;
    responseErrorId: string;
    subscriptionTodaysRequests: Subscription;

    constructor(
        private backendService: BackendService,
        private translateService: TranslateService,
        private loader: LoadingIndicatorService,
        private status: StatusIndicatorService,
        protected sanitizer: DomSanitizer
    ) { }

    @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;

    ngOnInit(): void {
        this.ctx = this.canvas.nativeElement.getContext('2d');

        this.backendService.retrieveActiveBoxLabel().then(response => {
            this.inputBoxId = response?.box_id;
        });
        this.subscriptionTodaysRequests = this.backendService.getTodaysRequestsObject().subscribe(
            response => {
                // if today requests do not include the response request, clear response
                if (this.responseRequest != null && !response.some(r => r.internal_id === this.responseRequest.internal_id)) {
                    this.resetResponse();
                }
            }
        );
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
            this.responseRequest = response;
            this.inputRequestId = '';
        }).catch(error => {
            if (error.error == null || error.error.type == "DEFAULT") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error.DEFAULT");
            } else if (error.error.type == "BAD_STATUS") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " " + error.error.additionalInformation.status;
            } else if (error.error.type == "WRONG_LOCATION") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " (" + error.error.additionalInformation.location + ")";
            } else if (error.error.type == "DESTINATION_NOT_FOUND") {
                this.responseErrorMessage = this.translateService.instant("Requests.Error." + error.error.type) + " (" + error.error.additionalInformation.libraryCode + ")";
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

    onClickPrintBoxId(): void {
        this.loadPDF();
    }

    async loadPDF() {
        const pdfBlob = await this.backendService.getBoxLabelPdf(this.inputBoxId);
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise; // Up until this point, the code works fine
    }
}

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

    getIconClass(): string {
        if (this.responseRequest && (this.responseRequest.isSentTwice() 
            || this.responseRequest.isOutdated() 
            || this.responseRequest.isNotRapido())) {
          return 'warning';
        } 
        return 'successful'; 
    }

    /*
    // The build failed with pdf js, because we need tsconfig.json, and somehow it is not working
    loadPdfWithPdfJs(): void {
        const pdfurl = `http://localhost:4201/api/v1/boxlabels/E02/${this.inputBoxId}/generatepdf`;
        const loadingTask = pdfjsLib.getDocument(pdfurl);
        loadingTask.promise.then(pdf => {
            pdf.getPage(1).then(page => {
                const scale = 1;
                const viewport = page.getViewport({ scale: scale });

                this.canvas.nativeElement.height = viewport.height;
                this.canvas.nativeElement.width = viewport.width;

                const renderContext = {
                    canvasContext: this.ctx,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(() => {
                    this.printPdfWithPdfJs();
                });
            });
        }, reason => {
            console.error(reason);
        });
    }

    printPdfWithPdfJs(): void {
        const dataUrl = this.canvas.nativeElement.toDataURL();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print PDF</title></head><body>');
            printWindow.document.write(`<img src="${dataUrl}" />`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            // Use setTimeout to delay the print command
            setTimeout(() => {
                // printWindow.focus();
                // printWindow.print();
                // printWindow.close();
            }, 100); // Adjust the timeout as needed
        }
    }
    */

}

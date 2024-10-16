import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    isLibraryAllowed: boolean = false;
    isInitialized: boolean = false;
    isWarningInToday: boolean = false;

    constructor(
        private backendService: BackendService,
        private _loader: LoadingIndicatorService,
        private _status: StatusIndicatorService,
        private translateService: TranslateService,
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

    async ngOnInit(): Promise<void> {
        this.loader.show();
        const statusText = await this.translateService.get('Main.Status.Initializing').toPromise();
        this.status.set(statusText);

        this.backendService.init().then(() => {
            this.backendService.checkIfLibaryAllowed().then(allowed => {
                this.isLibraryAllowed = allowed;
                this.backendService.getTodaysRequestsObject().subscribe(
                    (response: Request[]) => {
                        const requests = response.map(obj => new Request(obj));
                        this.isWarningInToday = requests.some(request => request.isSentTwice() || request.isOutdated() || request.isNotRapido());
                    }
                );
            }).catch(error => {
                this.isLibraryAllowed = false;
            }).finally(() => {
                this.isInitialized = true;
                this.loader.hide();    
            });
        });
    }

    ngOnDestroy(): void {
    }
}

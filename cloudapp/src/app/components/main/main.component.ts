import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';
import { MatTabGroup } from '@angular/material/tabs';
import { HistoryFilterService } from '../../services/history-filter.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    isLibraryAllowed: boolean = false;
    isInitialized: boolean = false;
    isWarningInToday: boolean = false;
    isUnreadErrors: boolean = false;
    selectedTab: number = 0;

    constructor(
        private backendService: BackendService,
        private _loader: LoadingIndicatorService,
        private _status: StatusIndicatorService,
        private translateService: TranslateService,
        private historyFilterService: HistoryFilterService
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
                // Subscribe to the today requests (for the warning indicator)
                this.backendService.getTodaysRequestsObject().subscribe(
                    (response: Request[]) => {
                        const requests = response.map(obj => new Request(obj));
                        this.isWarningInToday = requests.some(request => request.isSentTwice() || request.isOutdated() || request.isNotRapido());
                    }
                );
                // Subscribe to the unread errors (for the error indicator)
                this.backendService.getUnreadErrorHistoryRequestsObject().subscribe(
                    (response: any) => {
                        this.isUnreadErrors = response.length > 0;
                    }
                );
                this.backendService.getUnreadErrorHistoryRequests();
            }).catch(error => {
                this.isLibraryAllowed = false;
            }).finally(() => {
                this.isInitialized = true;
                this.loader.hide();    
            });
        });
    }

    async onClickSeeErrors(): Promise<void> {
        this.historyFilterService.setIsShowErrors(true);
        this.selectedTab = 2;
    }

    ngOnDestroy(): void {
    }
}

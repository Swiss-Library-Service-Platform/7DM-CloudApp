import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    data: InitData;
    authToken: string;
    isLibraryAllowed: boolean = false;
    isProdEnvironment: boolean = false;
    isInitialized: boolean = false;

    constructor(
        private eventsService: CloudAppEventsService,
        private backendService: BackendService,
        private _loader: LoadingIndicatorService,
        private _status: StatusIndicatorService,
        private translateService: TranslateService,
        private cdr: ChangeDetectorRef
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

        this.data = await this.eventsService.getInitData().toPromise();
        let regExp = new RegExp('^https(.*)psb(.*)com/?$|.*localhost.*'), // contains "PSB" (Premium Sandbox) or "localhost"
            currentUrl = this.data["urls"]["alma"];
        this.isProdEnvironment = !regExp.test(currentUrl);

        this.backendService.init(this.data).then(() => {
            this.eventsService.getAuthToken().subscribe(authToken => {
                this.authToken = authToken
                this.backendService.checkIfLibaryAllowed().then(allowed => {
                    this.isLibraryAllowed = allowed;
                    console.log('MainComponent: ngOnInit: allowed', allowed);
                }).catch(error => {
                    console.log('MainComponent: ngOnInit: error', error);
                    this.isLibraryAllowed = false;
                }).finally(() => {
                    this.isInitialized = true;
                    this.loader.hide();
                });
            });
        });
    }
}

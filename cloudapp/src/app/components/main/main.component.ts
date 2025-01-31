import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService, CloudAppRestService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BackendService } from '../../services/backend.service';
import { LoadingIndicatorService } from '../../services/loading-indicator.service';
import { StatusIndicatorService } from '../../services/status-indicator.service';
import { TranslateService } from '@ngx-translate/core';
import { Request } from '../../models/Request.model';
import { MatTabGroup } from '@angular/material/tabs';
import { HistoryFilterService } from '../../services/history-filter.service';
import { CurrentIzService } from '../../services/currenz-iz.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    isLibraryAllowed: boolean = false;
    isUserHasRoles: boolean = false;
    isInitialized: boolean = false;
    isUnreadErrors: boolean = false;
    selectedTab: number = 0;

    constructor(
        private backendService: BackendService,
        private _loader: LoadingIndicatorService,
        private _status: StatusIndicatorService,
        private translateService: TranslateService,
        private historyFilterService: HistoryFilterService,
        private eventsService: CloudAppEventsService,
        private restService: CloudAppRestService,
        private currentIzService: CurrentIzService
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

    /**
     * Initializes the component
     * 
     * @memberof MainComponent
     * @returns {void}
     */
    async ngOnInit(): Promise<void> {
        this.loader.show();
        const statusText = await this.translateService.get('Main.Status.Initializing').toPromise();
        this.status.set(statusText);

        const initData = await this.eventsService.getInitData().toPromise();

        this.isUserHasRoles = await this.getIsCurrentUserAllowed(initData);

        this.backendService.init(initData).then(() => {
            this.backendService.checkIfLibaryAllowed().then(allowed => {
                this.isLibraryAllowed = allowed;
                this.subscribeToUnreadErrors();
            }).catch(error => {
                this.isLibraryAllowed = false;
            }).finally(() => {
                this.isInitialized = true;
                this.loader.hide();
            });
        });
    }

    /**
     * Subscribe to the unread errors (for the error indicator)
     * 
     */
    subscribeToUnreadErrors() {
        this.backendService.getUnreadErrorHistoryRequestsObject().subscribe(
            (response: any) => {
                this.isUnreadErrors = response.length > 0;
            }
        );
        this.backendService.getUnreadErrorHistoryRequests();
    }

    /**
     * Handles the tab change event
     * 
     * @memberof MainComponent
     * @returns {void}
     */
    async onClickSeeErrors(): Promise<void> {
        this.historyFilterService.setIsShowErrors(true);
        this.selectedTab = 2;
    }

    /**
     * Checks wheter the currently loggedin user has sufficient permissions
     *
     * @param {string} primaryId of currently loggedin user
     * @return {Boolean} 
     * @memberof LibraryManagementService
     */
    async getIsCurrentUserAllowed(initData: InitData): Promise<boolean> {
        let primaryId = initData['user']['primaryId'];
        let user;

        if (this.currentIzService.isCurrentIzNetworkZone) {
            return true;
        }
        
        try {
            user = await this.restService.call<any>('/users/' + primaryId).toPromise();
        } catch (error) {
            return false;
        }
        // Role 221: CIRC_DESK_MANAGER
        // Role 32: CIRC_DESK_OPERATOR
        // Role 299: CIRC_DESK_OPERATOR_LIMITED
        const requiredRoles = ['221', '32', '299'];
        const requiredScope = initData['user']['currentlyAtLibCode'];
        // Check if the user has the required roles and scope
        let isAllowed = false;
        isAllowed = user.user_role.some(userrole =>
            requiredRoles.includes(userrole.role_type.value) &&
            userrole.status.value === 'ACTIVE' &&
            userrole.scope.value === requiredScope
        );
        return isAllowed;
    }

    ngOnDestroy(): void {
    }
}

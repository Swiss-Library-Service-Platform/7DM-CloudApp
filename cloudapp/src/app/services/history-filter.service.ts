import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BoxLabel } from '../models/BoxLabel.model';
import { PagedHistory } from '../models/PagedHistory.model';
import { Request } from '../models/Request.model';

/**
 * Service which is responsible for all outgoing API calls in this cloud app
 *
 * @export
 * @class HistoryFilterService
 */
@Injectable({
    providedIn: 'root'
})
export class HistoryFilterService {

    public isShowErrors: boolean = false;
    private readonly _isShowErrors = new BehaviorSubject<boolean>(false);

    constructor() { }

    getIsShowErrorsObservable(): Observable<boolean> {
        return this._isShowErrors.asObservable();
    }

    getIShowErrors(): boolean {
        return this.isShowErrors;
    }

    public setIsShowErrors(value: boolean): void {
        this.isShowErrors = value;
        this._isShowErrors.next(value);
    }

}
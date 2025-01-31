import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
  providedIn: 'root'
})
export class CurrentIzService {
  private _isCurrentIzNetworkZone = new BehaviorSubject<boolean>(false);

  constructor(private eventsService: CloudAppEventsService) {
    this.eventsService.getInitData().subscribe(
      initData => {
        this._isCurrentIzNetworkZone.next(initData.instCode == '41SLSP_NETWORK');
      }
    );
  }

  get isCurrentIzNetworkZone(): boolean {
    return this._isCurrentIzNetworkZone.value;
  }
}
import { RequestsComponent } from '../components/requests/requests.component';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { CloudAppEventsService, CloudAppStoreService, MaterialModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';
import { of } from 'rxjs';
import { AppModule } from '../app.module';
import { BackendService } from '../services/backend.service';
import { CurrentIzService } from '../services/currenz-iz.service';
import labels from '../../i18n/en.json';

// Render real app templates and Material controls, but never contact Alma/7DM.
export async function configureComponentTest(declarations: any[] = []) {
  TestBed.overrideModule(AppModule, { add: { exports: [RequestsComponent, MaterialModule, AlertModule] } });
  await TestBed.configureTestingModule({
    imports: [AppModule, NoopAnimationsModule, HttpClientTestingModule],
    declarations,
    providers: [
      { provide: CurrentIzService, useValue: { isCurrentIzNetworkZone: true } },
      { provide: CloudAppEventsService, useValue: {} },
      { provide: CloudAppStoreService, useValue: { get: () => of(null), set: () => of(null) } },
      { provide: BackendService, useValue: {
        getRequests: () => Promise.resolve(true),
        getHistory: () => Promise.resolve(true),
        getTodaysRequestsObject: () => of([]),
        getUnreadErrorHistoryRequestsObject: () => of([]),
        getPagedHistoryObject: () => of({ currentPage: 1, totalPages: 1, from: 0, to: 0, totalResults: 0, results: [] })
      } }
    ]
  }).compileComponents();
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('en', labels);
  translate.use('en');
}

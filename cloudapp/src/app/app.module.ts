import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, CloudAppTranslateModule, AlertModule, LazyTranslateLoader } from '@exlibris/exl-cloudapp-angular-lib';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './components/main/main.component';
import { MatTabsModule } from '@angular/material/tabs';
import { RequestsComponent } from './components/requests/requests.component';
import { TodayComponent } from './components/today/today.component';
import { RequestInfoComponent } from './components/request-info/request-info.component';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { HistoryComponent } from './components/history/history.component';
import { RequestSelectionComponent } from './components/request-selection/request-selection.component';

export function getTranslateModuleWithICU() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: (LazyTranslateLoader)
    },
    parser: {
      provide: TranslateParser,
      useClass: TranslateICUParser
    }
  });
}
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    RequestsComponent,
    TodayComponent,
    RequestInfoComponent,
    HistoryComponent,
    RequestSelectionComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,
    CloudAppTranslateModule.forRoot(),
    MatTabsModule,
    getTranslateModuleWithICU()
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

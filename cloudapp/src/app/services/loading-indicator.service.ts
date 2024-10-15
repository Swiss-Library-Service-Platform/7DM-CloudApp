import { Injectable } from '@angular/core'
import { BehaviorSubject, Subject } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class LoadingIndicatorService {
	private _isLoading = new BehaviorSubject<boolean>(false);
    isLoading = this._isLoading.asObservable();
    progress = new Subject<number>()
    mode = new Subject<string>()
    private _loadingCount = 0; // Counter for active loading requests

    show(): void {
        this._loadingCount++;
        this._isLoading.next(true);
    }

    hide(): void {
        if (this._loadingCount > 0) {
            this._loadingCount--;
        }
        if (this._loadingCount === 0) {
            this._isLoading.next(false);
        }
    }

    hasProgress(hasProgress: boolean): void {
        hasProgress ? this.mode.next('determinate') : this.mode.next('indeterminate')
    }

    setProgress(currentProgress: number): void {
        this.progress.next(currentProgress)
    }
}
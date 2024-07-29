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

	show(): void {
		this._isLoading.next(true)
	}

	hide(): void {
		this._isLoading.next(false)
	}

	hasProgress(hasProgress: boolean): void {
		hasProgress ? this.mode.next('determinate') : this.mode.next('indeterminate')
	}

	setProgress(currentProgress: number): void {
		this.progress.next(currentProgress)
	}
}

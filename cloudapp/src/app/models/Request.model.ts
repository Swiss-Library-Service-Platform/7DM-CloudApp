import { BoxLabel } from "./BoxLabel.model";

export class Request {
    internalId: string;
    externalIdPrefix: string;
    externalId: string;
    timestamp: Date;
    destinationLibrary: string;
    destinationDirectoriesCode: string;
    destinationDirectoriesName: string;
    barcode: string;
    type: string;
    box_id: string;
    state: string;
    message: string;
    notRs: boolean;
    outdated: boolean;
    multipleFulfilled: boolean;
    retry: number;

    boxLabel: BoxLabel;

    isDeleting: boolean;
    isSelected: boolean;

    constructor(init?: Partial<Request>) {
        Object.assign(this, init);
        if (this.boxLabel) {
            this.boxLabel = new BoxLabel(this.boxLabel);
        }
    }

    public getExternalIdWithPrefix(): string {
        return this.externalIdPrefix + this.externalId;
    }

    public isNotResourceSharing(): boolean {
        return this.notRs;
    }

    public isOutdated(): boolean {
        return this.outdated;
    }

    public isMultipleFulfilled(): boolean {
        return this.multipleFulfilled;
    }

    public isFailedUnread(): boolean {
        return this.state === 'FAILED_UNREAD';
    }

    public isRetried() {
        return this.retry > 0;
    }

    public checkForSearch(search: string): boolean {
        // Convert the search term to lowercase
        const lowerSearch = search.toLowerCase();

        // Array of fields to be checked
        const fieldsToSearch = [
            this.internalId,
            this.externalId,
            this.destinationLibrary,
            this.destinationDirectoriesCode,
            this.destinationDirectoriesName,
            this.barcode,
            this.type,
            this.box_id,
            this.state,
            this.message
        ];

        // Check if any of the fields include the search term (case-insensitive)
        return fieldsToSearch.some(field => field?.toLowerCase().includes(lowerSearch));
    }


}
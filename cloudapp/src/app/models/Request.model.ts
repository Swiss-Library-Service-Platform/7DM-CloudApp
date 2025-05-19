import { BoxLabel } from "./BoxLabel.model";

export class Request {
    id: number;
    internalId: string;
    externalIdPrefix: string;
    externalId: string;
    externalIdWithPrefix: string;
    timestamp: Date;
    destinationLibrary: string;
    destinationDirectoriesCode: string;
    destinationDirectoriesName: string;
    barcode: string;
    type: string;
    state: string;
    message: string;
    notRs: boolean;
    multipleFulfilled: boolean;
    returnedToOwner: boolean;
    retry: number;
    retryReason: string;

    boxLabel: BoxLabel;

    multiFulfilledRequests: Array<Request>;

    isDeleting: boolean;
    isSelected: boolean;

    constructor(init?: Partial<Request>) {
        console.log('Request constructor', init);
        Object.assign(this, init);
        if (this.boxLabel) {
            this.boxLabel = new BoxLabel(this.boxLabel);
        }
        if (this.multiFulfilledRequests) {
            this.multiFulfilledRequests = this.multiFulfilledRequests.map(request => new Request(request));
        }
    }

    public getId(): number {
        return this.id;
    }

    public getInternalIdWithRetry(): string {
        return this.internalId + (this.retry > 0 ? `R${this.retry}` : '');
    }

    public getMultipleFulfilledRequests(): Array<Request> {
        return this.multiFulfilledRequests;
    }

    public isFailedUnread(): boolean {
        return this.state === 'FAILED_UNREAD';
    }

    public isRetryWithSameInternalId() {
        return this.retry > 0 && this.retryReason === 'DUPLICATE_INTERNAL_ID';
    }

    public isReturnedToOwner(): boolean {
        return this.returnedToOwner;
    }

    public isNotRs(): boolean {
        return this.notRs;
    }

    public isMultipleFulfilled(): boolean {
        return this.multipleFulfilled;
    }

    public checkForSearch(search: string): boolean {
        // Convert the search term to lowercase
        const lowerSearch = search.toLowerCase();

        // Find the last occurrence of the closing bracket ')'
        const lastClosingBracketIndex = lowerSearch.lastIndexOf(')');
        const openingBracketIndex = lowerSearch.lastIndexOf('(', lastClosingBracketIndex);

        // Check if the search term is inside brackets (when a user copies the destination library <name> (<code>) into the search bar)
        let searchInBrackets: string | null = null;
        if (lastClosingBracketIndex !== -1 && openingBracketIndex !== -1 && lastClosingBracketIndex > openingBracketIndex) {
            searchInBrackets = lowerSearch.substring(openingBracketIndex + 1, lastClosingBracketIndex).trim();
        }

        // Array of fields to be checked
        const fieldsToSearch = [
            this.internalId,
            this.externalId,
            this.destinationLibrary,
            this.destinationDirectoriesCode,
            this.destinationDirectoriesName,
            this.barcode,
            this.type,
            this.boxLabel?.boxId,
            this.state,
            this.message
        ];

        // Check if any of the fields include the search term (case-insensitive)
        return fieldsToSearch.some(field => {
            if (field) {
                const lowerField = field.toLowerCase();
                return lowerField.includes(lowerSearch) || (searchInBrackets && lowerField.includes(searchInBrackets));
            }
            return false;
        });
    }


}
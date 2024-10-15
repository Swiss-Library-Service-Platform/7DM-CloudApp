import { Request } from "./Request.model";

export class RequestInfo {
 
    request: Request;
    sending_library_alma_code: string;
    sending_library_name: string;
    destination_library_alma_code: string;
    destination_library_name: string;
	
    isDeleting: boolean;

    constructor(init?: Partial<RequestInfo>) {
        Object.assign(this, init);
        // ensure that request is an instance of Request
        if (this.request) {
            this.request = new Request(this.request);
        }
    }

    public checkForSearch(search: string): boolean {
        // Convert the search term to lowercase
        const lowerSearch = search.toLowerCase();
    
        // Array of fields to be checked
        const fieldsToSearch = [
            this.request.internal_id,
            this.request.external_id,
            this.request.sending_library,
            this.sending_library_alma_code,
            this.sending_library_name,
            this.request.destination_library,
            this.destination_library_alma_code,
            this.destination_library_name,
            this.request.barcode,
            this.request.type,
            this.request.box_id,
            this.request.state,
            this.request.message
        ];
    
        // Check if any of the fields include the search term (case-insensitive)
        return fieldsToSearch.some(field => field?.toLowerCase().includes(lowerSearch));
    }

  
}
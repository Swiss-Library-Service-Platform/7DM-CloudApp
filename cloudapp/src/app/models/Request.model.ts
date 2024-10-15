export class Request {
    internal_id: string;
    external_id: string;
    timestamp: Date;
    sending_library: string;
    destination_library: string;
	barcode: string;
    type: string;
    box_id: string;
    state: string;
    message: string;
    is_not_rapido: boolean;
    is_outdated: boolean;
    is_sent_twice: boolean;

    constructor(init?: Partial<Request>) {
        Object.assign(this, init);
    }
    
    public isReady(): boolean {
        return this.state === 'READY';
    }

    public isSent(): boolean {
        return this.state === 'SENT';
    }

    public isError(): boolean {
        return this.state === 'ERROR';
    }

    public isWithoutWarning(): boolean {
        return !this.is_not_rapido && !this.is_outdated && !this.is_sent_twice;
    }

    public isNotRapido(): boolean {
        return this.is_not_rapido;
    }

    public isOutdated(): boolean {
        return this.is_outdated;
    }

    public isSentTwice(): boolean {
        return this.is_sent_twice;
    }


}
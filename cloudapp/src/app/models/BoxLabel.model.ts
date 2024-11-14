
export class BoxLabel {
	boxId: string;
    creationTime: Date;
    requestDate: Date;
    library: any;
    isActiveBox: boolean;
    directoriesName: string;
    directoriesCode: string;

    constructor(init?: Partial<BoxLabel>) {
        Object.assign(this, init);
    }
}
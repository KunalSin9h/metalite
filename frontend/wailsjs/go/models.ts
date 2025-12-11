export namespace backend {
	
	export class SavedConnection {
	    id: string;
	    name: string;
	    host: string;
	    user: string;
	    keyPath: string;
	    dbPath: string;
	
	    static createFrom(source: any = {}) {
	        return new SavedConnection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.host = source["host"];
	        this.user = source["user"];
	        this.keyPath = source["keyPath"];
	        this.dbPath = source["dbPath"];
	    }
	}

}


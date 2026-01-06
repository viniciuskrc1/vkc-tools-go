export namespace main {
	
	export class DocumentResult {
	    raw: string;
	    formatted: string;
	    valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new DocumentResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.raw = source["raw"];
	        this.formatted = source["formatted"];
	        this.valid = source["valid"];
	    }
	}
	export class GHStatus {
	    installed: boolean;
	    authenticated: boolean;
	    user?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new GHStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed = source["installed"];
	        this.authenticated = source["authenticated"];
	        this.user = source["user"];
	        this.error = source["error"];
	    }
	}

}

